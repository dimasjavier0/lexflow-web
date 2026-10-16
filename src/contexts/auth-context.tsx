import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { errorMessage } from "../hooks/use-async-action";
import { getCurrentUser, syncFacebookFriends, type ApiUser } from "../lib/api";

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  user: User | null;
  apiUser: ApiUser | null;
  isSyncingUser: boolean;
  syncError: string | null;
  /** The friend list of a Facebook sign-in that just came back is on its way to the API. */
  isSyncingFacebook: boolean;
  facebookSyncError: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  /** Links Facebook to the signed-in account, or asks again for the friend list when it is already linked. */
  connectFacebook: () => Promise<void>;
  signOut: () => Promise<void>;
};
type UserSync = { userId: string; apiUser: ApiUser | null; error: string | null };
type FacebookSync = { userId: string; isPending: boolean; error: string | null };

/** Set while a Facebook sign-in is away on Facebook, so the session that comes back is known to carry a Facebook token. */
const FACEBOOK_SIGN_IN_KEY = "lexflow:facebook-sign-in";
/** Facebook only lists the friends who also use LexFlow and granted this same permission. */
const FACEBOOK_SCOPES = "user_friends";

function markFacebookSignIn(isFacebook: boolean): void {
  try {
    if (isFacebook) sessionStorage.setItem(FACEBOOK_SIGN_IN_KEY, "1");
    else sessionStorage.removeItem(FACEBOOK_SIGN_IN_KEY);
  } catch {
    // Storage is blocked: the friend list waits for a sign-in where it works.
  }
}

/**
 * The Facebook token of a sign-in that just came back, handed out once. Supabase only has it
 * in the session that returns from Facebook and drops it at the first token refresh.
 */
function takeFacebookToken(session: Session): string | null {
  try {
    if (sessionStorage.getItem(FACEBOOK_SIGN_IN_KEY) === null) return null;
    sessionStorage.removeItem(FACEBOOK_SIGN_IN_KEY);
  } catch {
    return null;
  }
  return session.provider_token ?? null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sync, setSync] = useState<UserSync | null>(null);
  const [facebookSync, setFacebookSync] = useState<FacebookSync | null>(null);
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const userId = session?.user.id ?? null;

  useEffect(() => {
    let isMounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
        setIsLoading(false);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  // Keyed on the user id, not the session object: Supabase emits a new session on
  // every token refresh and tab focus, which must not re-run the role check.
  useEffect(() => {
    const currentSession = sessionRef.current;
    if (!userId || !currentSession) {
      setSync(null);
      return;
    }

    let isMounted = true;
    // Taken outside the requests, so React running this effect twice in development cannot send it twice.
    const facebookToken = takeFacebookToken(currentSession);
    const userSynced = getCurrentUser(currentSession);
    void userSynced
      .then((apiUser) => {
        if (isMounted) setSync({ userId, apiUser, error: null });
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setSync({ userId, apiUser: null, error: error instanceof Error ? error.message : "No se pudo sincronizar el usuario." });
        }
      });

    if (facebookToken) {
      // Not tied to isMounted: only this run holds the token. The user id keys the result instead.
      setFacebookSync({ userId, isPending: true, error: null });
      void userSynced
        .then(() => syncFacebookFriends(currentSession, facebookToken))
        .then(() => setFacebookSync({ userId, isPending: false, error: null }))
        .catch((error: unknown) => setFacebookSync({ userId, isPending: false, error: errorMessage(error, "No se pudo leer tu lista de amigos de Facebook.") }));
    }

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const currentSync = sync?.userId === userId ? sync : null;
  const apiUser = currentSync?.apiUser ?? null;
  const syncError = currentSync?.error ?? null;
  // Derived, so there is no render where a signed-in user looks "synced" without a role.
  const isSyncingUser = userId !== null && currentSync === null;
  const currentFacebookSync = facebookSync?.userId === userId ? facebookSync : null;
  const isSyncingFacebook = currentFacebookSync?.isPending ?? false;
  const facebookSyncError = currentFacebookSync?.error ?? null;

  const signInWithGoogle = async () => {
    markFacebookSignIn(false);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const signInWithFacebook = async () => {
    markFacebookSignIn(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: window.location.origin, scopes: FACEBOOK_SCOPES },
    });
    if (error) {
      markFacebookSignIn(false);
      throw error;
    }
  };

  const connectFacebook = async () => {
    const options = { redirectTo: `${window.location.origin}/friends`, scopes: FACEBOOK_SCOPES };
    const hasFacebook = session?.user.identities?.some((identity) => identity.provider === "facebook") ?? false;
    markFacebookSignIn(true);
    // Signing in with Facebook keeps the same account once it is linked; `rerequest` shows the declined friend list again.
    const { error } = hasFacebook
      ? await supabase.auth.signInWithOAuth({ provider: "facebook", options: { ...options, queryParams: { auth_type: "rerequest" } } })
      : await supabase.auth.linkIdentity({ provider: "facebook", options });
    if (error) {
      markFacebookSignIn(false);
      // Linking needs "Allow manual linking" in the Supabase project; its message is in English.
      throw new Error("No se pudo conectar con Facebook. Inténtalo de nuevo más tarde.", { cause: error });
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = useMemo(
    () => ({
      isAuthenticated: session !== null,
      isLoading,
      session,
      user: session?.user ?? null,
      apiUser,
      isSyncingUser,
      syncError,
      isSyncingFacebook,
      facebookSyncError,
      signInWithGoogle,
      signInWithFacebook,
      connectFacebook,
      signOut,
    }),
    [apiUser, facebookSyncError, isLoading, isSyncingFacebook, isSyncingUser, session, syncError],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
