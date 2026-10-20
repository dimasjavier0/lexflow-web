import { Link } from "react-router-dom";
import { buttonClasses } from "../../components/ui";
import { useAuth } from "../../contexts/auth-context";
import { ContactEmail, LegalPage, LegalSection } from "./legal-page";

/** Public on purpose: Google Play and Facebook ask for a page that explains deletion without signing in. */
export function DeleteAccountPage() {
  const { isAuthenticated } = useAuth();

  return (
    <LegalPage
      eyebrow="LexFlow English"
      title="Eliminar tu cuenta"
      intro={<p>Puedes borrar tu cuenta de LexFlow y todos sus datos cuando quieras, desde la app o por correo.</p>}
    >
      <LegalSection title="Desde la app (web o Android)">
        <ol className="m-0 grid list-decimal gap-1.5 pl-5">
          <li>Inicia sesión con la misma cuenta de Google o Facebook que usas en LexFlow.</li>
          <li>Abre «Mi progreso».</li>
          <li>Al final de la página, pulsa «Eliminar mi cuenta».</li>
          <li>Confirma con «Sí, eliminar mi cuenta».</li>
        </ol>
        <div>
          <Link className={buttonClasses({ variant: "secondary" })} to={isAuthenticated ? "/profile" : "/login"}>
            {isAuthenticated ? "Ir a Mi progreso" : "Iniciar sesión"}
          </Link>
        </div>
      </LegalSection>

      <LegalSection title="Por correo">
        <p>Si no puedes entrar en la app, escribe a <ContactEmail subject="Eliminar mi cuenta de LexFlow" /> desde el correo de tu cuenta, con el asunto «Eliminar mi cuenta de LexFlow». La borraremos en un máximo de 30 días y te lo confirmaremos por correo.</p>
      </LegalSection>

      <LegalSection title="Qué se borra">
        <ul>
          <li>Tu inicio de sesión en LexFlow con Google o Facebook.</li>
          <li>Tu perfil: correo, nombre, foto y país.</li>
          <li>Tu progreso: palabras marcadas, repasos, puntos, nivel y racha.</li>
          <li>Tus amistades en LexFlow: dejarás de aparecer en la lista de tus amigos.</li>
        </ul>
        <p>Desde la app, el borrado es inmediato y no se puede deshacer; las copias de seguridad que pudieran contener tus datos se sobrescriben en un máximo de 30 días. No se conserva ningún dato de tu cuenta. Tu cuenta de Google o de Facebook no se ve afectada; para quitar a LexFlow de Facebook, hazlo en su configuración (Apps y sitios web).</p>
      </LegalSection>
    </LegalPage>
  );
}
