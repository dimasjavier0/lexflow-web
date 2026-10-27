import { Link } from "react-router-dom";
import { LogoMark } from "../components/brand-mark";
import { buttonClasses } from "../components/ui";
import { AUTHOR, isAndroidApp } from "../lib/site";
import { ContactEmail, LegalPage, LegalSection } from "./legal/legal-page";

const STACK = ["React", "TypeScript", "Tailwind CSS", "Node.js", "Express", "PostgreSQL", "Prisma", "Supabase", "AWS"];

/** Who builds LexFlow and why. Public, and the same on the web and in the Android app. */
export function AboutPage() {
  return (
    <LegalPage
      eyebrow="Sobre mí"
      title={`Hola, soy ${AUTHOR.shortName.split(" ")[0]}`}
      updatedOn={null}
      intro={
        <div className="flex flex-wrap items-center gap-4">
          <span aria-hidden="true" className="grid size-16 shrink-0 place-items-center rounded-2xl bg-teal-soft"><LogoMark className="size-10" /></span>
          <p className="min-w-0 flex-1">
            <strong>{AUTHOR.name}</strong>, {AUTHOR.role}, de {AUTHOR.place}. Creo LexFlow English, la app con la que estás aprendiendo.
          </p>
        </div>
      }
    >
      <LegalSection title="Por qué existe LexFlow">
        <p>Mejoré mi inglés a base de práctica: elegí un trabajo atendiendo clientes en inglés todos los días precisamente para obligarme a usarlo. Ahí comprobé que una palabra se queda cuando la ves, la oyes y la encuentras en contexto.</p>
        <p>LexFlow nace de esa idea: cada palabra viene con una imagen, su pronunciación y un video de personas reales diciéndola, y el repaso espaciado te la devuelve justo antes de que la olvides. Está pensada para quien empieza y para quien quiere llegar más lejos, del nivel A1 al C2.</p>
      </LegalSection>

      <LegalSection title="Quién soy">
        <p>Soy Ingeniero en Sistemas por la Universidad Nacional Autónoma de Honduras (UNAH) y desarrollador full stack. Lo que más he construido son aplicaciones web y APIs REST con Node.js y Express, junto con las pantallas en React que las usan.</p>
        <p>En mi práctica profesional en Sumadi trabajé en una plataforma de supervisión de exámenes en línea, y fui presidente del capítulo estudiantil de IEEE Computer Society en la UNAH. Me gustan los retos, sobre todo los que todavía no sé cómo resolver.</p>
      </LegalSection>

      <LegalSection title="Cómo está hecha">
        <p>LexFlow es un proyecto propio de principio a fin: diseño, frontend, API, base de datos e infraestructura en AWS, con despliegue automático desde GitHub.</p>
        <ul className="!m-0 flex !list-none flex-wrap gap-2 !p-0">
          {STACK.map((item) => <li key={item} className="!m-0 rounded-full border border-line bg-surface px-3 py-1 text-sm font-semibold">{item}</li>)}
        </ul>
      </LegalSection>

      <LegalSection title="Contacto">
        <p>¿Ideas, errores o propuestas de trabajo? Escríbeme a <ContactEmail subject="LexFlow English" /> o encuéntrame aquí:</p>
        <div className="flex flex-wrap gap-2">
          {AUTHOR.links.map((link) => (
            <a key={link.href} className={buttonClasses({ variant: "secondary", size: "sm" })} href={link.href} target="_blank" rel="noreferrer">{link.label} ↗</a>
          ))}
        </div>
        {isAndroidApp() ? null : <p>Si LexFlow te ayuda, también puedes <Link to="/donate">apoyar el proyecto</Link>.</p>}
      </LegalSection>
    </LegalPage>
  );
}
