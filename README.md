# LexFlow Web

Cliente web de LexFlow, la plataforma para aprender vocabulario de inglés mediante imagen, audio y contexto. React 19, Vite 8 y Tailwind CSS 4, con inicio de sesión de Supabase. Se instala como PWA.

Necesita la API de [lexflow-api](https://github.com/dimasjavier0/lexflow-api). Hasta la versión 0.6.0, ambas vivían en el monorepo [LexFlow-1.0](https://github.com/dimasjavier0/LexFlow-1.0).

Versión actual: **1.0.0**. El historial por versiones está en [CHANGELOG.md](CHANGELOG.md) y en las [releases](https://github.com/dimasjavier0/lexflow-web/releases), y el flujo de trabajo del repositorio (ramas, commits y versiones), en [CLAUDE.md](CLAUDE.md).

## Estructura

```text
src/
  app.tsx           Rutas
  pages/            Inicio, login, aprender, repasar, perfil, amigos
  features/         Panel admin, progreso y ejercicio de repaso
  components/       Componentes de la app; components/ui es el sistema de componentes propio
  layouts/          Marcos de la app, el panel admin y el login
  contexts/         Sesión de Supabase
  lib/              Cliente HTTP (api.ts, admin-api.ts), tema, niveles, utilidades
public/             Manifest, service worker e iconos de la PWA
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
| `VITE_API_URL`               | URL base de la API.                                                                          |
| `VITE_SUPABASE_URL`          | Proyecto de Supabase.                                                                        |
| `VITE_SUPABASE_ANON_KEY`     | Clave pública (anon) de Supabase.                                                            |
| `VITE_DAILYMOTION_PLAYER_ID` | Opcional: reproductor propio de Dailymotion. Sin él, sus videos se abren en dailymotion.com. |

La API debe aceptar el origen de la web en su `CORS_ORIGINS`.

## Funcionalidades

- Login con Google o Facebook mediante Supabase Auth.
- Inicio con selección de nivel CEFR, colecciones con el avance del estudiante y búsqueda de palabras con autocompletado.
- Lecciones por colección (`/learn/:collectionSlug`): imágenes en cuadrícula, audio automático, video embebido y atajos de teclado. Cada palabra se marca como «Quiero aprender», «No me interesa» o «Aprendida», y las ya conocidas se omiten.
- Repaso espaciado (SM-2) en `/review`: imagen, audio y escribir la palabra, con cuatro niveles de ayuda y un reintento antes de ver la solución.
- Perfil con puntos, nivel y racha en `/profile`, y «Mi progreso» con palabras por nivel de repaso y repasos previstos.
- Amigos de Facebook en `/friends`: cuántas palabras ha aprendido cada amigo que también usa LexFlow, sin chat. «Conectar con Facebook» vincula la cuenta a quien entró con Google. La configuración de Facebook y Supabase está en el README de la API.
- Selector de tema con tonos de color y modo oscuro.
- Manifest, service worker e iconos (SVG y PNG de 192 y 512 px) para instalarla como PWA.
- Panel admin en `/admin` (requiere `role = 'ADMIN'` en la base de la API):
  - Colecciones y palabras expandibles, con filtros «Sin significado», «Sin imágenes» y «Sin sonido».
  - Editor de palabras: término, traducción, nivel, imágenes (arrastre, URL o Pixabay), audios, videos, categoría gramatical, frecuencia, oraciones de ejemplo y palabras relacionadas.
  - Lista rápida e importación de varias listas en Markdown, con vista previa antes de guardar.
  - Vista previa de las imágenes y la pronunciación que faltan en una colección.
  - Acciones sobre varias palabras y reparación de imágenes caducadas, con barra de progreso.
  - Buscador de videos (YouGlish, Pixabay, Pexels, Dailymotion, Wikimedia y YouTube) y de grabaciones de la pronunciación, y pronunciación generada con Piper.

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
