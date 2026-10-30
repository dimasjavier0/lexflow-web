import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { BrandMark } from "../components/brand-mark";
import { FeatureUnavailable } from "../components/feature-unavailable";
import { StatusPage } from "../components/status-page";
import { Alert, Button } from "../components/ui";
import { useAuth } from "../contexts/auth-context";
import { useAsyncAction } from "../hooks/use-async-action";
import { AuthLayout } from "../layouts/auth-layout";
import { FACEBOOK_LOGIN_ENABLED } from "../lib/features";

export function LoginPage() {
  const { isAuthenticated, isLoading, signInWithGoogle, signInWithFacebook, wasAccountDeleted } = useAuth();
  const google = useAsyncAction();
  const facebook = useAsyncAction();
  const error = google.error ?? facebook.error;
  const [showFacebookNotice, setShowFacebookNotice] = useState(false);

  if (isLoading) return <StatusPage isLoading>Comprobando sesión...</StatusPage>;
  if (isAuthenticated) return <Navigate to="/" replace />;
  if (showFacebookNotice) return <FeatureUnavailable onBack={() => setShowFacebookNotice(false)} backLabel="Volver al inicio de sesión" />;

  return (
    <AuthLayout>
      <section className="w-full max-w-sm rounded-3xl border border-line bg-surface p-6 text-center shadow-lift sm:p-8">
        <BrandMark />
        <div aria-hidden="true" className="mx-auto mt-11 mb-7 flex size-24 -rotate-6 items-center justify-center gap-3 rounded-[1.9rem] bg-teal-soft text-lg font-black text-teal-dark">
          <span>abc</span>
          <strong className="text-3xl text-coral">+</strong>
        </div>
        {wasAccountDeleted ? <Alert tone="success" className="mb-6 text-left">Tu cuenta y todos tus datos se han eliminado.</Alert> : null}
        <h1 className="m-0 text-4xl leading-none font-bold tracking-tighter">Aprende palabras en contexto.</h1>
        <p className="mt-3.5 mb-6 leading-normal text-muted">Inicia sesión para continuar con tu aprendizaje.</p>
        <div className="grid gap-3">
          <Button size="lg" isLoading={google.isPending} loadingLabel="Redirigiendo..." onClick={() => void google.run(signInWithGoogle, "No se pudo iniciar sesión.")}>
            Continuar con Google
          </Button>
          <Button size="lg" variant="secondary" isLoading={facebook.isPending} loadingLabel="Redirigiendo..." onClick={() => (FACEBOOK_LOGIN_ENABLED ? void facebook.run(signInWithFacebook, "No se pudo iniciar sesión.") : setShowFacebookNotice(true))}>
            Continuar con Facebook
          </Button>
        </div>
        {error ? <Alert className="mt-4 text-left">{error}</Alert> : null}
        <p className="mt-5 mb-0 text-xs leading-normal text-muted">
          Al continuar aceptas los <Link className="font-semibold text-teal-dark underline-offset-2 hover:underline" to="/terms">términos de uso</Link> y la <Link className="font-semibold text-teal-dark underline-offset-2 hover:underline" to="/privacy">política de privacidad</Link>.
        </p>
      </section>
    </AuthLayout>
  );
}
