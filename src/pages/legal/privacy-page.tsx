import { Link } from "react-router-dom";
import { ContactEmail, LegalPage, LegalSection } from "./legal-page";

export function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Política de privacidad"
      title="Tus datos en LexFlow"
      intro={<p>LexFlow English («LexFlow») es una app para aprender vocabulario en inglés, en la web y en Android. Esta política explica qué datos guarda, para qué, con quién se comparten y cómo borrarlos. LexFlow no muestra publicidad ni vende datos.</p>}
    >
      <LegalSection title="Responsable y contacto">
        <p>LexFlow es un proyecto independiente. Para cualquier pregunta sobre tus datos o para ejercer tus derechos, escribe a <ContactEmail subject="Privacidad en LexFlow" />.</p>
      </LegalSection>

      <LegalSection title="Qué datos guardamos">
        <ul>
          <li><strong>Tu cuenta:</strong> el identificador de tu inicio de sesión, tu correo, tu nombre y tu foto, tal como los entrega Google o Facebook al entrar. Puedes cambiar el nombre y la foto en «Mi progreso».</li>
          <li><strong>Tu aprendizaje:</strong> las palabras que marcas («Quiero aprender», «Aprendida», «No me interesa»), el resultado y la fecha de cada repaso, tus puntos, tu nivel y tu racha.</li>
          <li><strong>Si entras con Facebook:</strong> el identificador que Facebook asigna a tu cuenta solo para LexFlow y, si das permiso, cuáles de tus amigos de Facebook también usan LexFlow. El acceso a Facebook se usa en el momento y no se guarda. No leemos tus publicaciones, tus mensajes ni a tus amigos que no usan LexFlow.</li>
          <li><strong>Tu país,</strong> solo si decides indicarlo, para las clasificaciones por país.</li>
          <li><strong>En tu dispositivo:</strong> la sesión iniciada, el tema de color y el último nivel elegido se guardan en el almacenamiento del navegador. LexFlow no usa cookies propias de seguimiento ni herramientas de analítica.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Para qué los usamos">
        <ul>
          <li>Iniciar tu sesión y mantener tu cuenta.</li>
          <li>Guardar tu progreso, programar tus repasos y calcular tus puntos, nivel y racha.</li>
          <li>Mostrar a tus amigos de Facebook que usan LexFlow tu nombre, tu foto y cuántas palabras has aprendido, y mostrarte lo mismo de ellos. Nunca se muestra tu correo.</li>
          <li>Responder a tus mensajes y mantener la app segura (por ejemplo, limitando las peticiones abusivas).</li>
        </ul>
        <p>Usamos tus datos porque son necesarios para darte el servicio que pides al registrarte y, en el caso de la lista de amigos, porque tú das el permiso en Facebook, que puedes retirar cuando quieras.</p>
      </LegalSection>

      <LegalSection title="Con quién se comparten">
        <p>No vendemos ni cedemos tus datos. Solo intervienen los servicios necesarios para que la app funcione:</p>
        <ul>
          <li><strong>Supabase,</strong> que gestiona el inicio de sesión.</li>
          <li><strong>Google y Facebook,</strong> cuando eliges entrar con ellos. Cada uno aplica su propia política de privacidad.</li>
          <li><strong>El proveedor de alojamiento</strong> de los servidores de LexFlow, donde se guardan la base de datos y los archivos.</li>
          <li><strong>PayPal,</strong> solo si decides hacer una donación desde la web: el pago ocurre en PayPal y LexFlow no recibe ni guarda los datos de tu tarjeta ni de tu cuenta.</li>
          <li><strong>Reproductores de video incrustados</strong> (YouGlish, YouTube, Dailymotion y otros) en algunas lecciones. Al reproducir un video, ese servicio puede guardar sus propias cookies según su política.</li>
        </ul>
        <p>Estos servicios pueden tratar datos fuera de tu país, con las garantías que exige la ley aplicable. También podríamos revelar datos si una autoridad lo exige legalmente.</p>
      </LegalSection>

      <LegalSection title="Seguridad y conservación">
        <p>Los datos viajan cifrados (HTTPS) y solo la app y quien la administra pueden acceder a ellos. Se conservan mientras tengas la cuenta. Al eliminarla se borran de inmediato tu inicio de sesión, tu perfil, tu progreso, tus puntos y tus amistades; las copias de seguridad que pudieran contenerlos se sobrescriben en un máximo de 30 días.</p>
      </LegalSection>

      <LegalSection title="Tus derechos">
        <p>Puedes consultar, corregir, descargar o borrar tus datos, y oponerte a su uso. Tu nombre y tu foto se cambian en «Mi progreso», y la cuenta se borra desde la propia app; los pasos están en <Link to="/delete-account">Eliminar cuenta</Link>. Para todo lo demás, escribe a <ContactEmail subject="Mis datos en LexFlow" /> y responderemos en un máximo de 30 días. Si no quedas conforme, puedes reclamar ante la autoridad de protección de datos de tu país.</p>
        <p>Para dejar de compartir tu lista de amigos, quita el permiso a LexFlow en la configuración de Facebook (Configuración y privacidad → Apps y sitios web).</p>
      </LegalSection>

      <LegalSection title="Menores">
        <p>LexFlow no está dirigida a menores de 13 años y no recoge a sabiendas datos suyos. Si crees que un menor de esa edad ha creado una cuenta, escríbenos y la borraremos.</p>
      </LegalSection>

      <LegalSection title="Cambios en esta política">
        <p>Si esta política cambia, se actualizará la fecha de arriba y, si el cambio es importante, se avisará en la app antes de aplicarlo.</p>
      </LegalSection>
    </LegalPage>
  );
}
