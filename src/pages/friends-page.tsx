import { useEffect, useRef, useState } from "react";
import { Avatar } from "../components/avatar";
import { FeatureUnavailable } from "../components/feature-unavailable";
import { StatusPage } from "../components/status-page";
import { Alert, Button, EmptyState, Eyebrow } from "../components/ui";
import { useAuth } from "../contexts/auth-context";
import { errorMessage, useAsyncAction } from "../hooks/use-async-action";
import { AppLayout } from "../layouts/app-layout";
import { getFriends, type FriendRow, type Friends } from "../lib/api";
import { FACEBOOK_LOGIN_ENABLED } from "../lib/features";
import { cn } from "../lib/cn";

const count = new Intl.NumberFormat("es");

/** Rank of each row, with ties sharing a place (1, 2, 2, 4). Rows come sorted by known words. */
function ranks(rows: FriendRow[]): number[] {
  return rows.map((row) => rows.findIndex((other) => other.knownWords === row.knownWords) + 1);
}

function RankingRow({ row, rank, isMe }: { row: FriendRow; rank: number; isMe: boolean }) {
  const name = row.name ?? "Amigo de Facebook";
  return (
    <li className={cn("flex min-w-0 items-center gap-3 rounded-2xl border p-3 shadow-card", isMe ? "border-teal bg-teal-soft" : "border-line bg-surface")}>
      <span className="w-6 shrink-0 text-center text-sm font-black text-muted">{rank}</span>
      <Avatar url={row.avatarUrl} name={name} size="md" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold">{name}</span>
        {isMe ? <span className="block text-xs font-bold text-teal-dark">Tú</span> : null}
      </span>
      <span className="shrink-0 text-right leading-tight">
        <strong className="block text-2xl font-black tracking-tight">{count.format(row.knownWords)}</strong>
        <span className="text-xs text-muted">{row.knownWords === 1 ? "palabra" : "palabras"}</span>
      </span>
    </li>
  );
}

function ConnectPrompt({ title, children, actionLabel, onUnavailable }: { title: string; children: string; actionLabel: string; onUnavailable: () => void }) {
  const { connectFacebook } = useAuth();
  const connect = useAsyncAction();
  return (
    <section className="grid justify-items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-6">
      <h2 className="m-0 text-xl font-bold tracking-tight">{title}</h2>
      <p className="m-0 max-w-xl text-sm text-muted">{children}</p>
      <Button isLoading={connect.isPending} loadingLabel="Redirigiendo..." onClick={() => (FACEBOOK_LOGIN_ENABLED ? void connect.run(connectFacebook, "No se pudo conectar con Facebook.") : onUnavailable())}>
        {actionLabel}
      </Button>
      {connect.error ? <Alert className="w-full">{connect.error}</Alert> : null}
    </section>
  );
}

export function FriendsPage() {
  const { session, isSyncingFacebook, facebookSyncError } = useAuth();
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const [friends, setFriends] = useState<Friends | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [showFacebookNotice, setShowFacebookNotice] = useState(false);

  // Waits for a Facebook sign-in that just came back, so the list already has its friends.
  useEffect(() => {
    const current = sessionRef.current;
    if (!current || isSyncingFacebook) return;
    let isCurrent = true;
    setLoadError(null);
    getFriends(current)
      .then((loaded) => {
        if (isCurrent) setFriends(loaded);
      })
      .catch((error: unknown) => {
        if (isCurrent) setLoadError(errorMessage(error, "No se pudieron cargar tus amigos."));
      });
    return () => {
      isCurrent = false;
    };
  }, [isSyncingFacebook, reloadKey]);

  if (showFacebookNotice) return <FeatureUnavailable onBack={() => setShowFacebookNotice(false)} backLabel="Volver a Amigos" />;
  if (isSyncingFacebook) return <StatusPage isLoading>Buscando a tus amigos de Facebook...</StatusPage>;
  if (loadError) return <StatusPage action={<Button onClick={() => setReloadKey((key) => key + 1)}>Reintentar</Button>}>{loadError}</StatusPage>;
  if (!friends) return <StatusPage isLoading>Cargando tus amigos...</StatusPage>;

  const { facebook, me } = friends;
  const ranking = [me, ...friends.friends].sort((a, b) => b.knownWords - a.knownWords);
  const rankingRanks = ranks(ranking);

  return (
    <AppLayout width="narrow">
      <header className="mt-12 mb-6">
        <Eyebrow>Amigos</Eyebrow>
        <h1 className="mt-1 mb-2 text-4xl font-bold tracking-tighter sm:text-5xl">Tus amigos de Facebook</h1>
        <p className="m-0 max-w-xl text-muted">Cuántas palabras ha aprendido cada uno: las marcadas como aprendidas y las dominadas en el repaso.</p>
      </header>

      {facebookSyncError ? <Alert className="mb-4">{facebookSyncError}</Alert> : null}

      {!facebook.connected ? (
        <ConnectPrompt title="Conecta tu cuenta de Facebook" actionLabel="Conectar con Facebook" onUnavailable={() => setShowFacebookNotice(true)}>
          Verás cuántas palabras han aprendido tus amigos de Facebook que también usan LexFlow, y ellos verán las tuyas.
        </ConnectPrompt>
      ) : !facebook.friendsGranted ? (
        <ConnectPrompt title="Falta permiso para ver tu lista de amigos" actionLabel="Permitir ver mis amigos" onUnavailable={() => setShowFacebookNotice(true)}>
          Al entrar con Facebook no se compartió tu lista de amigos, así que LexFlow no sabe quiénes son. Vuelve a conectar y deja marcada la opción de la lista de amigos.
        </ConnectPrompt>
      ) : friends.friends.length ? (
        <ol className="m-0 grid list-none gap-2 p-0" aria-label="Palabras aprendidas por tus amigos">
          {ranking.map((row, index) => <RankingRow key={row.id} row={row} rank={rankingRanks[index]} isMe={row.id === me.id} />)}
        </ol>
      ) : (
        <EmptyState
          title="Ninguno de tus amigos usa LexFlow todavía"
          description={`Aparecerán aquí cuando entren con Facebook y acepten compartir su lista de amigos. Por ahora llevas ${count.format(me.knownWords)} ${me.knownWords === 1 ? "palabra aprendida" : "palabras aprendidas"}.`}
        />
      )}

      {facebook.connected ? (
        <p className="mt-6 mb-0 text-xs text-muted">
          Tus amigos de Facebook que usan LexFlow ven tu nombre, tu foto y cuántas palabras has aprendido. La lista se actualiza cada vez que tú o alguno de ellos entra con Facebook.
        </p>
      ) : null}
    </AppLayout>
  );
}
