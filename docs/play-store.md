# Ficha de Google Play

Lo que pide Play Console para publicar LexFlow, con las respuestas que corresponden a lo que hace la app hoy. Si una función nueva recoge otros datos, actualiza la política de privacidad (`src/pages/legal/privacy-page.tsx`) y la sección [Seguridad de los datos](#seguridad-de-los-datos).

Cómo se genera y se firma la app está en [android.md](android.md).

## Antes de enviar a revisión

- [ ] Web desplegada en HTTPS con su dominio definitivo y `assetlinks.json` verificado ([android.md](android.md#3-enlazar-la-app-con-la-web-digital-asset-links)).
- [ ] API desplegada con `SUPABASE_SERVICE_ROLE_KEY` (sin ella, «Eliminar mi cuenta» responde que no está disponible).
- [ ] Probado en un móvil: inicio de sesión con Google y con Facebook, lección, repaso, «Mi progreso» y «Eliminar mi cuenta».
- [ ] Facebook: la app de Meta en modo «Live», con las URL de privacidad y de borrado de datos (README de lexflow-api).
- [ ] Una cuenta de Google de prueba para los revisores ([Acceso a la app](#acceso-a-la-app)).
- [ ] Si la cuenta de desarrollador es personal y nueva: una prueba cerrada con al menos **12 testers durante 14 días seguidos** antes de poder pedir el acceso a producción. Empieza por ahí.

## Donaciones

La web tiene una página de donaciones con PayPal (`/donate`). La política de pagos de Google Play no permite pedir donaciones para particulares con sistemas de pago externos dentro de una app, así que en la app de Android esa página y su enlace no aparecen: `isAndroidApp()` (`src/lib/site.ts`) reconoce la TWA por el referrer `android-app://` con el que Chrome la abre. No declares donaciones ni compras en la ficha.

## URLs

| Campo de Play Console                                  | Valor                                  |
| ------------------------------------------------------ | -------------------------------------- |
| Política de privacidad                                 | `https://<dominio>/privacy`            |
| Eliminación de cuentas (Seguridad de los datos)        | `https://<dominio>/delete-account`     |
| Sitio web                                              | `https://<dominio>/`                   |
| Correo de contacto                                     | `dimasjavier.0@gmail.com`              |

Las tres páginas son públicas, se abren sin iniciar sesión.

## Ficha de Play Store

**Nombre de la app** (máx. 30): `LexFlow English`

**Descripción breve** (máx. 80):

> Aprende vocabulario en inglés con imágenes, audio y repasos espaciados.

**Descripción completa** (máx. 4000):

> LexFlow English te ayuda a aprender y recordar palabras en inglés de verdad, una a una, con imagen, audio y contexto.
>
> APRENDE CON IMÁGENES Y SONIDO
> Cada palabra llega con fotos que la explican sin traducir, su pronunciación y, en muchas, un video donde se usa. Elige tu nivel (A1 a C2) y avanza por colecciones temáticas: la casa, la ropa, la comida, la escuela…
>
> REPASA JUSTO ANTES DE OLVIDAR
> Las palabras que marcas como «Quiero aprender» vuelven en el momento justo, con intervalos cada vez más largos. Cada repaso te da un poco menos de ayuda: primero completas la palabra, al final la escribes de memoria.
>
> MIRA CÓMO CRECE TU VOCABULARIO
> Gana puntos con cada acierto, sube de nivel, mantén tu racha diaria y consulta en «Mi progreso» cuántas palabras dominas y qué repasos te esperan.
>
> CON TUS AMIGOS
> Si entras con Facebook, ve cuántas palabras ha aprendido cada amigo que también usa LexFlow. Sin chat ni mensajes.
>
> SIN ANUNCIOS
> LexFlow es gratuita y no muestra publicidad. Entra con tu cuenta de Google o de Facebook y elimina tu cuenta cuando quieras desde la propia app.

**Categoría:** Educación. **Etiquetas:** Aprendizaje de idiomas, Educación.

**Gráficos** (en [play-store/](play-store/)):

| Recurso                     | Archivo                                    | Medidas      |
| --------------------------- | ------------------------------------------ | ------------ |
| Icono                       | `public/icon-512.png`                      | 512 × 512    |
| Gráfico destacado           | `play-store/feature-graphic.png`           | 1024 × 500   |
| Capturas de teléfono (2–8)  | `play-store/1-inicio.png` … `4-progreso.png` | 1080 × 1920 |

Las capturas se hicieron con contenido de desarrollo y una cuenta de ejemplo. Antes de publicar, revisa que todas las imágenes que salen tengan licencia para usarse en la ficha (las de Pixabay sí) y, si el contenido de producción es mejor, repítelas en un móvil o con Chrome en modo dispositivo a 360 × 640 y escala 3.

## Seguridad de los datos

Respuestas para **Contenido de la app → Seguridad de los datos**.

**Preguntas generales**

| Pregunta                                                         | Respuesta |
| ---------------------------------------------------------------- | --------- |
| ¿La app recoge o comparte alguno de los tipos de datos requeridos? | Sí        |
| ¿Todos los datos se cifran en tránsito?                          | Sí (HTTPS) |
| ¿Ofreces una forma de solicitar la eliminación de los datos?     | Sí: desde la app y en `https://<dominio>/delete-account` |

**Datos recogidos.** Ninguno se **comparte** con terceros: Supabase y el alojamiento actúan como proveedores de servicios, y lo que ven los amigos lo decide el usuario al conectar Facebook. Ninguno se trata de forma efímera.

| Categoría → tipo                       | ¿Obligatorio? | Finalidades                                  | De dónde sale                                         |
| -------------------------------------- | ------------- | -------------------------------------------- | ----------------------------------------------------- |
| Información personal → Correo electrónico | Obligatorio | Funcionalidad de la app, Gestión de la cuenta | Inicio de sesión con Google o Facebook                |
| Información personal → Nombre          | Obligatorio   | Funcionalidad de la app, Gestión de la cuenta | Perfil de Google o Facebook; se puede cambiar          |
| Información personal → ID de usuario   | Obligatorio   | Funcionalidad de la app, Gestión de la cuenta | Id de Supabase e id de Facebook propio de la app       |
| Fotos y videos → Fotos                 | Opcional      | Funcionalidad de la app                       | Solo la dirección de la foto de perfil, no el archivo |
| Actividad en la app → Interacciones con la app | Obligatorio | Funcionalidad de la app                  | Palabras marcadas, repasos, puntos, racha             |
| Contactos → Contactos                  | Opcional      | Funcionalidad de la app                       | Amigos de Facebook que usan LexFlow, solo con permiso |

**No se recogen:** ubicación, datos financieros, de salud, mensajes, audio, archivos, calendario, historial web, identificadores del dispositivo, registros de fallos ni diagnósticos. La app no tiene analítica ni publicidad.

Si se añade una pantalla para elegir el país (la API ya lo admite para las clasificaciones), declara **Ubicación → Ubicación aproximada** como opcional.

## Resto de «Contenido de la app»

| Sección                        | Respuesta                                                                                       |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| Anuncios                       | La app no contiene anuncios.                                                                    |
| ID de publicidad               | No se usa.                                                                                      |
| Acceso a la app                | Toda la funcionalidad requiere iniciar sesión: ver abajo.                                       |
| Clasificación de contenido     | Cuestionario IARC, categoría «Referencia, noticias o educación». Sin violencia, sexo, lenguaje soez, drogas, apuestas ni compras. Los usuarios no se comunican entre sí: solo ven el nombre, la foto y el número de palabras de sus amigos de Facebook. Resultado esperado: apta para todos (PEGI 3 / Everyone). |
| Público objetivo               | 13 a 15, 16 a 17 y 18 o más. No marques menores de 13: la app no cumple la política de Familias y la política de privacidad lo excluye. |
| Aplicación de noticias         | No.                                                                                             |
| Apps de salud / financieras / gubernamentales | No.                                                                              |

### Acceso a la app

En **Acceso a la app → Se necesitan instrucciones especiales**:

> Toda la app requiere iniciar sesión. Pulse «Continuar con Google» e inicie sesión con esta cuenta de prueba:
> Correo: `<cuenta-de-prueba>@gmail.com` · Contraseña: `<contraseña>`
> La cuenta no tiene verificación en dos pasos. Para probar el borrado de la cuenta: «Mi progreso» → «Eliminar mi cuenta» (la cuenta se recrea vacía al volver a entrar).

Crea una cuenta de Google solo para esto, sin verificación en dos pasos, y comprueba antes que puede entrar en LexFlow.
