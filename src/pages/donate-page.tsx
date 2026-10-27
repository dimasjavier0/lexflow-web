import { useState } from "react";
import { Navigate } from "react-router-dom";
import { buttonClasses } from "../components/ui";
import { DONATION_PAYPAL_EMAIL, DONATION_URL, isAndroidApp } from "../lib/site";
import { LegalPage, LegalSection } from "./legal/legal-page";

/**
 * Voluntary donations through PayPal. Only on the website: inside the Google Play app the page
 * sends visitors home, because Play's payments policy does not allow donations to individuals
 * through outside payment systems.
 */
export function DonatePage() {
  const [copied, setCopied] = useState(false);
  if (isAndroidApp()) return <Navigate to="/" replace />;

  const copyEmail = () => {
    navigator.clipboard.writeText(DONATION_PAYPAL_EMAIL).then(() => setCopied(true), () => setCopied(false));
  };

  return (
    <LegalPage
      eyebrow="Apoya LexFlow"
      title="Ayúdame a mantener LexFlow"
      updatedOn={null}
      intro={<p>LexFlow es gratis y no tiene anuncios. Si te está ayudando a aprender inglés y quieres que siga creciendo, puedes hacer una donación voluntaria.</p>}
    >
      <LegalSection title="A qué se destina">
        <ul>
          <li>Los servidores y el almacenamiento de las imágenes, audios y videos.</li>
          <li>Más vocabulario, ejemplos y funciones nuevas.</li>
          <li>Publicar la app en Google Play.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Donar con PayPal">
        <p>Elige la cantidad en PayPal; puedes pagar con tu cuenta o con tarjeta. La donación no desbloquea nada: todo LexFlow sigue siendo gratis para todos.</p>
        <div>
          <a className={buttonClasses({ size: "lg" })} href={DONATION_URL} target="_blank" rel="noreferrer">Donar con PayPal ↗</a>
        </div>
        <p className="text-sm text-muted">
          Si el botón no abre, envía tu donación desde PayPal a <strong className="select-all text-ink">{DONATION_PAYPAL_EMAIL}</strong>{" "}
          <button type="button" className="cursor-pointer font-semibold text-teal-dark underline-offset-2 hover:underline" onClick={copyEmail}>{copied ? "Copiado" : "Copiar"}</button>
        </p>
      </LegalSection>

      <LegalSection title="Gracias">
        <p>Cada palabra que aprendes con LexFlow ya es la mejor forma de apoyo. ¡Gracias por estar aquí!</p>
      </LegalSection>
    </LegalPage>
  );
}
