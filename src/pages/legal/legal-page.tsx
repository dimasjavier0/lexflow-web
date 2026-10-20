import type { ReactNode } from "react";
import { Eyebrow } from "../../components/ui";
import { AppLayout } from "../../layouts/app-layout";
import { CONTACT_EMAIL, LEGAL_UPDATED_ON } from "../../lib/legal";

type LegalPageProps = { eyebrow: string; title: string; intro: ReactNode; children: ReactNode };

/** Frame shared by the privacy policy, the terms and the account deletion page: public, readable prose. */
export function LegalPage({ eyebrow, title, intro, children }: LegalPageProps) {
  return (
    <AppLayout width="narrow">
      <article className="mt-12 grid gap-8 leading-relaxed [&_a]:font-semibold [&_a]:text-teal-dark [&_a]:underline-offset-2 [&_a:hover]:underline [&_li]:mt-1.5 [&_p]:m-0 [&_ul]:m-0 [&_ul]:list-disc [&_ul]:pl-5">
        <header className="grid gap-2">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="m-0 text-4xl font-bold tracking-tighter sm:text-5xl">{title}</h1>
          <p className="text-sm text-muted">Última actualización: {LEGAL_UPDATED_ON}</p>
          <div className="mt-2 text-lg">{intro}</div>
        </header>
        {children}
      </article>
    </AppLayout>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3">
      <h2 className="m-0 text-xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

export function ContactEmail({ subject }: { subject?: string }) {
  const href = `mailto:${CONTACT_EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
  return <a href={href}>{CONTACT_EMAIL}</a>;
}
