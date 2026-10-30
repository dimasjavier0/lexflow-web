# LexFlow Web

Cliente web de LexFlow, la plataforma para aprender vocabulario de inglés mediante imagen, audio y contexto. React 19, Vite 8 y Tailwind CSS 4, con inicio de sesión de Supabase. Se instala como PWA y se publica en Google Play como Trusted Web Activity (ver [Android y Google Play](#android-y-google-play)).

Necesita la API de [lexflow-api](https://github.com/dimasjavier0/lexflow-api). Hasta la versión 0.6.0, ambas vivían en el monorepo [LexFlow-1.0](https://github.com/dimasjavier0/LexFlow-1.0).

Versión actual: **1.2.0**. El historial por versiones está en [CHANGELOG.md](CHANGELOG.md) y en las [releases](https://github.com/dimasjavier0/lexflow-web/releases), y el flujo de trabajo del repositorio (ramas, commits y versiones), en [CLAUDE.md](CLAUDE.md).

## Estructura

```text
src/
  app.tsx           Rutas
  pages/            Inicio, login, aprender, repasar, perfil, amigos; pages/legal, privacidad, términos y borrado de cuenta
  features/         Panel admin, catálogo por niveles, progreso y ejercicio de repaso
  components/       Componentes de la app; components/ui es el sistema de componentes propio
  layouts/          Marcos de la app, el panel admin y el login
  contexts/         Sesión de Supabase
  lib/              Cliente HTTP (api.ts, admin-api.ts), tema, niveles, contacto legal (legal.ts), utilidades
public/             Manifest, service worker e iconos de la PWA
docs/               Guías de la app de Android y de la ficha de Google Play, con sus gráficos
```

## Requisitos

- Node.js 22 o superior
- npm 11 o superior
- La API en marcha (por defecto en `http://localhost:3000`).

## Puesta en marcha

Desde la raíz del repositorio:

```bash
npm install
cp .env.example .env    # y rellena las claves de Supabase
npm run dev
```

La web queda en `http://localhost:5173`.

Antes de dar un cambio por terminado:

```bash
npm run check
```

### Scripts

| Script            | Qué hace                                               |
| ----------------- | ------------------------------------------------------ |
| `npm run dev`     | Servidor de desarrollo de Vite (puerto 5173)           |
| `npm run build`   | Comprueba los tipos y genera la web estática en `dist/`|
| `npm run preview` | Sirve `dist/` en local para probar la versión compilada|
| `npm run check`   | Comprueba los tipos                                    |

## Variables de entorno

En el `.env` de la raíz; la plantilla es [.env.example](.env.example). Vite solo expone las variables con el prefijo `VITE_` y las incrusta en el build, así que deben estar definidas al ejecutar `npm run build`. No pongas secretos en ellas.

| Variable                     | Uso                                                                                          |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| `VITE_API_URL`               | URL base de la API. En producción, `/api`: CloudFront la sirve desde el mismo dominio.       |
| `VITE_SUPABASE_URL`          | Proyecto de Supabase.                                                                        |
| `VITE_SUPABASE_ANON_KEY`     | Clave pública (anon) de Supabase.                                                            |
| `VITE_DAILYMOTION_PLAYER_ID` | Opcional: reproductor propio de Dailymotion. Sin él, sus videos se abren en dailymotion.com. |
| `VITE_FACEBOOK_LOGIN`        | Opcional: `true` activa el inicio de sesión y la conexión con Facebook. Sin ella, sus botones muestran «Esta función no está disponible». |
| `ANDROID_PACKAGE_ID`, `ANDROID_SHA256_CERT_FINGERPRINTS` | Opcionales: id de la app de Google Play y huellas SHA-256 de sus certificados (separadas por comas). Con las dos, el build publica `/.well-known/assetlinks.json`. Sin prefijo `VITE_`: no llegan al navegador. Ver [docs/android.md](docs/android.md). |

La API debe aceptar el origen de la web en su `CORS_ORIGINS`.

## Funcionalidades

- Login con Google o Facebook mediante Supabase Auth. Facebook solo funciona si el build lleva `VITE_FACEBOOK_LOGIN=true`; si no, sus botones (en el inicio de sesión y en Amigos) abren una pantalla que avisa de que la función aún no está disponible (`src/lib/features.ts`, `src/components/feature-unavailable.tsx`). En producción está desactivado mientras se termina de configurar la app de Facebook.
- Inicio por niveles: un desplegable por cada nivel CEFR (A1, A2, B1, B2, C1, C2) con sus colecciones por temas, que abren la lección filtrada por ese nivel. Con sesión, cada nivel muestra qué porcentaje de sus palabras conoces («28 % para dominar A1») y cuántas faltan. Una palabra cuenta como conocida si la marcaste como aprendida o la dominaste en el repaso, igual que en «Mi progreso». Los niveles sin palabras aparecen como «Próximamente». Los niveles abiertos se recuerdan entre visitas. Datos: `GET /levels` y `GET /progress/levels` de la API (`src/features/catalog/level-section.tsx`).
- Búsqueda de palabras con autocompletado desde el inicio.
- Lecciones por colección (`/learn/:collectionSlug`): imágenes en cuadrícula, audio automático, video embebido y atajos de teclado. Cada palabra se marca como «Quiero aprender», «No me interesa» o «Aprendida», y las ya conocidas se omiten.
- Repaso espaciado (SM-2) en `/review`: imagen, audio y escribir la palabra, con cuatro niveles de ayuda y un reintento antes de ver la solución.
- Perfil con puntos, nivel y racha en `/profile`, y «Mi progreso» con palabras por nivel de repaso y repasos previstos.
- Amigos de Facebook en `/friends`: cuántas palabras ha aprendido cada amigo que también usa LexFlow, sin chat. «Conectar con Facebook» vincula la cuenta a quien entró con Google. La configuración de Facebook y Supabase está en el README de la API.
- «Eliminar mi cuenta» en `/profile`: borra la cuenta y todos sus datos con `DELETE /me` de la API, tras confirmarlo en un diálogo.
- Páginas públicas de política de privacidad (`/privacy`), términos de uso (`/terms`) y borrado de cuenta (`/delete-account`), enlazadas desde el pie de la app y el inicio de sesión. Son las URL que piden Google Play y Facebook. El correo de contacto y la fecha de la última actualización están en `src/lib/legal.ts`: cambia la fecha cada vez que cambie el texto.
- «Sobre mí» (`/about`): quién hace LexFlow y por qué, con enlaces al portfolio, GitHub y LinkedIn. Los datos del autor están en `src/lib/site.ts`.
- «Apoyar el proyecto» (`/donate`): donación voluntaria con PayPal, solo en la web. Dentro de la app de Google Play no aparece (su política de pagos no permite donaciones a particulares con pagos externos): `isAndroidApp()` en `src/lib/site.ts` la detecta por el referrer `android-app://` con el que Chrome abre la TWA.
- Selector de tema con tonos de color y modo oscuro.
- Manifest, service worker e iconos (SVG y PNG de 192 y 512 px) para instalarla como PWA. Sin conexión abre con lo ya visitado.
- Panel admin en `/admin` (requiere `role = 'ADMIN'` en la base de la API):
  - Colecciones y palabras expandibles, con filtros «Sin significado», «Sin imágenes» y «Sin sonido».
  - Editor de palabras: término, traducción, nivel, imágenes (arrastre, URL o Pixabay), audios, videos, categoría gramatical, frecuencia, oraciones de ejemplo y palabras relacionadas.
  - Lista rápida e importación de varias listas en Markdown, con vista previa antes de guardar.
  - Vista previa de las imágenes y la pronunciación que faltan en una colección.
  - Acciones sobre varias palabras y reparación de imágenes caducadas, con barra de progreso.
  - Buscador de videos (YouGlish, Pixabay, Pexels, Dailymotion, Wikimedia y YouTube) y de grabaciones de la pronunciación, y pronunciación generada con Piper.

## Despliegue

En producción la web es un sitio estático en un bucket S3 privado, servido por CloudFront con HTTPS. El mismo dominio sirve la API en `/api/*` y las imágenes y audios en `/uploads/*`, así que no hay CORS entre la web y la API. La infraestructura (AWS CDK), los costes, la seguridad y los pasos están en [docs/aws-deployment.md de lexflow-api](https://github.com/dimasjavier0/lexflow-api/blob/main/docs/aws-deployment.md).

Cada push a `main` lo publica el flujo [.github/workflows/deploy.yml](.github/workflows/deploy.yml): `npm run check`, build con `VITE_API_URL=/api`, `aws s3 sync` (los assets con caché de un año; `index.html`, `sw.js` y el manifest sin caché) e invalidación de CloudFront. Entra en AWS con un rol temporal por OIDC, sin claves. Lo que necesita en GitHub:

| Tipo     | Nombre                                                                 |
| -------- | ---------------------------------------------------------------------- |
| Secret   | `AWS_WEB_DEPLOY_ROLE_ARN` (salida `WebDeployRoleArn` del stack)        |
| Variable | `WEB_BUCKET`, `DISTRIBUTION_ID` (salidas del stack)                    |
| Variable | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, y opcionales `VITE_DAILYMOTION_PLAYER_ID`, `VITE_FACEBOOK_LOGIN`, `ANDROID_PACKAGE_ID`, `ANDROID_SHA256_CERT_FINGERPRINTS` |

La URL y la clave anónima de Supabase son públicas por diseño (van dentro del JavaScript que descarga el navegador), pero se configuran en GitHub para que el repositorio no dependa de un proyecto concreto.

## Android y Google Play

La app de Android es esta misma web dentro de una Trusted Web Activity generada con Bubblewrap: los despliegues de la web llegan a la app sin publicar una versión nueva.

- [docs/android.md](docs/android.md): generar, firmar y compilar el AAB, y enlazar la app con el dominio (`assetlinks.json`).
- [docs/play-store.md](docs/play-store.md): textos de la ficha, gráficos, formulario de seguridad de los datos, clasificación y acceso para los revisores.

Play exige una política de privacidad y una forma de borrar la cuenta desde la app y desde la web: son `/privacy`, `/delete-account` y «Eliminar mi cuenta» en `/profile`.

## Lista rápida

Cada línea es `palabra en inglés, traducción, nivel` (`cat, gato, A1`). El nivel es opcional (A1 si falta), solo se aplica a las palabras nuevas y uno que no sea A1–C2 marca la línea como inválida. Antes de guardar muestra una vista previa con cada lista como la colección en la que quedará y cada palabra con su imagen, traducción y nivel; al pulsar una palabra se pueden cambiar sus imágenes de Pixabay. Nada se guarda hasta pulsar «Confirmar y guardar».

## Acciones sobre varias palabras

Al abrir una colección en el panel admin, cada palabra tiene una casilla y la barra superior permite seleccionarlas todas. Las acciones se aplican solo a las palabras visibles con el filtro activo, hasta 200 a la vez. Las palabras que el filtro oculta conservan su casilla para cuando vuelvan a listarse. La barra solo muestra las acciones que tienen efecto sobre la selección:

| Acción                 | Aparece cuando                  | Efecto                                                                         |
| ---------------------- | ------------------------------- | ------------------------------------------------------------------------------ |
| Publicar               | Hay algún borrador.             | Las hace visibles para los estudiantes.                                        |
| Pasar a borrador       | Hay alguna publicada.           | Las oculta a los estudiantes.                                                  |
| Reparar imágenes       | Alguna imagen está caducada.    | Descarga al servidor sus imágenes de Pixabay con enlace caducado.              |
| Reemplazar imágenes    | Alguna palabra tiene imágenes.  | Sustituye sus imágenes por una búsqueda nueva en Pixabay. Pide confirmación.   |
| Buscar imágenes        | Ninguna palabra tiene imágenes. | Les añade imágenes con una búsqueda en Pixabay.                                |
| Eliminar imágenes      | Alguna palabra tiene imágenes.  | Borra todas sus imágenes y los archivos guardados. Pide confirmación.          |
| Quitar de la colección | Siempre.                        | Las saca de la colección; se borran si no están en ninguna otra. Pide confirmación. |

## Progreso de las operaciones largas

Las operaciones del panel admin que recorren varias palabras o imágenes muestran una barra de progreso con el recuento hasta el momento (por ejemplo, cuántas palabras ya tienen imágenes y cuántas se quedaron sin ellas):

- Lista rápida, lista por lista, al preparar la vista previa y al guardar.
- «Completar imágenes y sonido», al buscar las propuestas y al guardarlas.
- «Reparar imágenes», tanto el botón general como el de las palabras seleccionadas.
- «Reemplazar imágenes» y «Buscar imágenes» sobre las palabras seleccionadas.

Publicar, pasar a borrador, eliminar imágenes y quitar palabras son una sola consulta y no muestran barra.

La web pide el avance en NDJSON (`Accept: application/x-ndjson`) desde `apiRequest` con la opción `onProgress` (`src/lib/api.ts`) y lo muestra con el componente `ProgressBar`. El formato está descrito en el README de la API.
