import { Link } from "react-router-dom";
import { ContactEmail, LegalPage, LegalSection } from "./legal-page";

export function TermsPage() {
  return (
    <LegalPage
      eyebrow="Términos de uso"
      title="Condiciones de LexFlow"
      intro={<p>Estas condiciones se aplican al uso de LexFlow English («LexFlow») en la web y en Android. Al crear una cuenta o usar la app, las aceptas. Cómo tratamos tus datos se explica en la <Link to="/privacy">política de privacidad</Link>.</p>}
    >
      <LegalSection title="El servicio">
        <p>LexFlow te ayuda a aprender vocabulario en inglés con imágenes, audio, video y repasos espaciados. Es gratuita. Podemos añadir, cambiar o retirar funciones y contenidos para mejorarla.</p>
      </LegalSection>

      <LegalSection title="Tu cuenta">
        <ul>
          <li>Entras con tu cuenta de Google o de Facebook. Debes tener al menos 13 años, o la edad mínima que exija tu país para usar estos servicios.</li>
          <li>Eres responsable de lo que se haga con tu cuenta. Si crees que alguien la usa sin tu permiso, escríbenos.</li>
          <li>Puedes eliminar tu cuenta cuando quieras desde la app. Los pasos están en <Link to="/delete-account">Eliminar cuenta</Link>.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Uso aceptable">
        <p>No está permitido:</p>
        <ul>
          <li>Usar LexFlow para algo ilegal o para molestar a otras personas.</li>
          <li>Intentar acceder a cuentas o datos ajenos, o a partes de la app que no son para ti.</li>
          <li>Sobrecargar o atacar los servidores, ni extraer el contenido de forma automatizada.</li>
          <li>Copiar o redistribuir el contenido de LexFlow fuera de la app.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Contenido">
        <p>Las palabras, traducciones, ejemplos y la app son de LexFlow o de sus autores. Algunas imágenes, audios y videos provienen de servicios de terceros (como Pixabay, Wikimedia, YouGlish, YouTube o Dailymotion) y se muestran según sus licencias y condiciones. Si crees que algún contenido infringe tus derechos, escríbenos y lo revisaremos.</p>
      </LegalSection>

      <LegalSection title="Sin garantías">
        <p>Cuidamos el contenido, pero puede contener errores y la app puede dejar de estar disponible en algún momento. LexFlow se ofrece «tal cual», como apoyo al aprendizaje, sin garantizar resultados concretos. En la medida en que la ley lo permita, no respondemos de los daños indirectos derivados de su uso.</p>
      </LegalSection>

      <LegalSection title="Suspensión">
        <p>Podemos suspender o cerrar una cuenta que incumpla estas condiciones. Tú puedes dejar de usar LexFlow y borrar tu cuenta cuando quieras.</p>
      </LegalSection>

      <LegalSection title="Cambios y contacto">
        <p>Si estas condiciones cambian, se actualizará la fecha de arriba y, si el cambio es importante, se avisará en la app. Para cualquier duda, escribe a <ContactEmail subject="Términos de LexFlow" />.</p>
      </LegalSection>
    </LegalPage>
  );
}
