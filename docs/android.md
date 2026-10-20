# App de Android (Trusted Web Activity)

La app de Google Play es la misma web, abierta a pantalla completa dentro de Chrome mediante una **Trusted Web Activity** (TWA). El proyecto Android lo genera [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) a partir del manifest de la web publicada.

- Los cambios de la web llegan a la app al desplegar la web, sin publicar una versión nueva en Play.
- Solo hace falta un AAB nuevo cuando cambia algo del envoltorio: nombre, icono, colores, dominio o el nivel de API que exige Play.
- El inicio de sesión con Google y Facebook funciona igual que en la web, porque la TWA usa Chrome.

La ficha de Play Store (textos, formulario de seguridad de los datos, capturas) está en [play-store.md](play-store.md).

## Requisitos

1. La web desplegada en su dominio definitivo con **HTTPS**, sirviendo `/manifest.webmanifest`, `/sw.js` y los iconos (ya están en `public/`).
2. Node.js 22 o superior. La primera vez, Bubblewrap ofrece descargar un JDK 17 y el SDK de Android; acepta las dos cosas.
3. Una cuenta de desarrollador de Google Play.
4. En Supabase, **Authentication → URL Configuration**: el dominio de producción como Site URL y `https://<dominio>/**` en Redirect URLs. En Facebook y en la API, el mismo dominio (ver el README de lexflow-api).

## 1. Generar el proyecto

Desde la raíz de este repositorio (la carpeta `android/` está en `.gitignore`, salvo `android/twa-manifest.json`):

```bash
mkdir android && cd android
npx @bubblewrap/cli init --manifest https://<dominio>/manifest.webmanifest
```

Respuestas a las preguntas de `init`:

| Pregunta                          | Respuesta                                                        |
| --------------------------------- | ---------------------------------------------------------------- |
| Domain                            | `<dominio>` (sin `https://`)                                     |
| URL path                          | `/`                                                              |
| Application name                  | `LexFlow English`                                                |
| Short name                        | `LexFlow`                                                        |
| Application ID                    | `com.lexflow.english` (no se puede cambiar una vez publicada)    |
| Starting version code             | `1`                                                              |
| Display mode                      | `standalone`                                                     |
| Orientation                       | `portrait`                                                       |
| Status bar color                  | `#F8F6F1`                                                        |
| Splash screen color               | `#F8F6F1`                                                        |
| Icon URL                          | `https://<dominio>/icon-512.png`                                 |
| Maskable icon URL                 | `https://<dominio>/icon-512.png` (el logo cabe en la zona segura) |
| Monochrome icon URL               | vacío                                                            |
| Include support for Play Billing  | No                                                               |
| Request geolocation permission    | No                                                               |
| Key store location                | **fuera del repositorio**, p. ej. `../../lexflow-keys/lexflow-upload.keystore` |
| Key name                          | `upload`                                                         |

Bubblewrap crea la clave de subida y pide dos contraseñas. **Guarda el keystore y sus contraseñas en un gestor de contraseñas y en una copia de seguridad**: sin ellos no se pueden subir versiones nuevas (Play permite restablecer la clave de subida, pero tarda días).

## 2. Compilar

```bash
cd android
npx @bubblewrap/cli build
```

Genera `app-release-bundle.aab` (el que se sube a Play) y `app-release-signed.apk` (para instalar a mano con `adb install`). Ninguno se versiona.

## 3. Enlazar la app con la web (Digital Asset Links)

Sin este paso la app funciona, pero muestra la barra de direcciones de Chrome arriba. Android solo la quita si la web publica `/.well-known/assetlinks.json` con las huellas SHA-256 de los certificados que firman la app.

1. Sube el AAB a Play Console (pista de prueba interna) con **Play App Signing** activado, la opción por defecto.
2. Copia las dos huellas SHA-256:
   - **Clave de firma de la app** (la que usa Play para firmar lo que instalan los usuarios): Play Console → la app → **Prueba y lanzamiento → Configuración → Integridad de la app → Firma de apps**.
   - **Clave de subida** (la de tu keystore, para el APK que instales a mano): la misma página de Play Console, o `keytool -list -v -keystore <ruta-del-keystore> -alias upload`.
3. En el entorno donde se compila la web para producción (el `.env` de la raíz o las variables del servicio de despliegue):

   ```bash
   ANDROID_PACKAGE_ID="com.lexflow.english"
   ANDROID_SHA256_CERT_FINGERPRINTS="AA:BB:...:FF,11:22:...:99"
   ```

   No llevan el prefijo `VITE_`, así que no entran en el código que descarga el navegador. Con las dos definidas, `npm run build` deja `dist/.well-known/assetlinks.json`, y `npm run dev` y `npm run preview` también lo sirven. Una huella mal escrita hace fallar el build.
4. Despliega la web y comprueba que `https://<dominio>/.well-known/assetlinks.json` responde con `Content-Type: application/json` y sin redirecciones. Algunos alojamientos ignoran las carpetas que empiezan por punto: revisa que se suba.
5. Valídalo con la [herramienta de Digital Asset Links](https://developers.google.com/digital-asset-links/tools/generator) (dominio, `com.lexflow.english` y la huella) y abre la app instalada: no debe verse la barra de direcciones. Android guarda la verificación en caché; si cambias el archivo, desinstala y vuelve a instalar.

## Versiones nuevas del envoltorio

Cuando Play pida subir el nivel de API objetivo, o si cambian el nombre, los colores o el icono:

```bash
cd android
npx @bubblewrap/cli update      # regenera el proyecto desde twa-manifest.json y sube appVersionCode
npx @bubblewrap/cli build
```

Sube el AAB nuevo a Play Console. Los cambios de `android/twa-manifest.json` se versionan; el resto de `android/` no.

## Sin conexión

El service worker (`public/sw.js`) guarda lo que la web sirve de su propio origen a medida que se usa, y sin conexión abre la app con lo guardado; cada pantalla muestra el aviso de error de carga de siempre si necesita la API. Chrome exige que una TWA abra sin conexión. Al cambiar la estrategia de caché, sube `CACHE_NAME` para que se borre la caché anterior.
