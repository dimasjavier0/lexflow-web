/**
 * Facebook sign-in and account linking. Off unless the build sets VITE_FACEBOOK_LOGIN="true": while
 * the Facebook app and the Supabase provider are not ready, its buttons show a "not available yet" screen.
 */
export const FACEBOOK_LOGIN_ENABLED = import.meta.env.VITE_FACEBOOK_LOGIN === "true";
