import { AuthLayout } from "../layouts/auth-layout";
import { BrandMark } from "./brand-mark";
import { Button } from "./ui";

type FeatureUnavailableProps = { onBack: () => void; backLabel?: string };

/** Full-screen notice for a button whose feature is not ready yet. */
export function FeatureUnavailable({ onBack, backLabel = "Volver" }: FeatureUnavailableProps) {
  return (
    <AuthLayout>
      <section role="alert" className="w-full max-w-sm rounded-3xl border border-line bg-surface p-6 text-center shadow-lift sm:p-8">
        <BrandMark />
        <div aria-hidden="true" className="mx-auto mt-11 mb-7 flex size-24 rotate-6 items-center justify-center rounded-[1.9rem] bg-danger-soft pb-4 text-6xl leading-none font-black text-coral">
          …
        </div>
        <h1 className="m-0 text-3xl leading-tight font-bold tracking-tighter">Esta función no está disponible</h1>
        <p className="mt-3.5 mb-6 leading-normal text-muted">Estamos trabajando en ella.</p>
        <Button size="lg" onClick={onBack} autoFocus>
          {backLabel}
        </Button>
      </section>
    </AuthLayout>
  );
}
