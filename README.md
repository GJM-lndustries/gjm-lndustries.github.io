# ProICFES

App web interactiva y gratuita para preparar el examen **Saber 11 (ICFES)**: lecciones cortas, modo práctica con
retroalimentación inmediata, simulacros con reloj (corto y completo por sesiones) y puntaje global estimado por áreas.

Sitio: <https://proicfes.com.co> · Hecho por GJM lndustries

## Tecnología

React 19 + TypeScript + Vite + Tailwind CSS 4, con `wouter` (rutas), `framer-motion` y `recharts`.
Fuentes Lexend y DM Sans autoalojadas (`src/assets/fonts`, licencia SIL OFL).
Es una app 100 % estática, sin servidor propio ni pagos. El progreso se guarda en el navegador
(`localStorage`, clave `proicfes_progress`). Las cuentas (Supabase) son **opcionales** y hoy están apagadas: ver
[Cuentas con Supabase](#cuentas-con-supabase).

## Desarrollo

```bash
pnpm install
pnpm dev                 # servidor local en http://localhost:3000
pnpm check               # TypeScript
pnpm validate:questions  # valida el banco de preguntas
pnpm test                # pruebas (vitest)
pnpm build               # compila a dist/ (incluye el paso postbuild)
pnpm preview             # sirve dist/ localmente
```

## Dominio y configuración del sitio

La URL pública vive en **un solo lugar**: `src/config/site.ts` (`SITE.url`, hoy `https://proicfes.com.co`).
De ahí salen el canonical, `hreflang`, Open Graph, JSON-LD, `sitemap.xml` y `robots.txt`. Para cambiar de dominio
basta con editar esa constante y volver a compilar.

## Despliegue

`pnpm build` deja en `dist/` un sitio 100 % estático que funciona en cualquier hosting estático.

- **Cloudflare Pages** (recomendado con el dominio propio): conectar el repositorio de GitHub, *Framework preset*
  «None», *Build command* `pnpm build`, *Build output directory* `dist`, variable `NODE_VERSION=22`. Agregar el
  dominio `proicfes.com.co` en *Custom domains*. Cloudflare Pages lee dos archivos de `public/` (GitHub Pages los
  ignora):
  - `_headers`: caché larga e inmutable para `/assets/*` (archivos con hash), 7 días para imágenes, `sw.js` sin caché
    y cabeceras de seguridad (`X-Frame-Options`, `Permissions-Policy`, etc.). HTTPS/HSTS se activan en el panel de
    Cloudflare.
  - `_redirects`: redirecciones 301 de URLs alternativas (`/privacidad`, `/habeas-data`, `/terminos-y-condiciones`,
    `/politica-de-cookies`, `/faq`…) a la ruta real. Cloudflare Pages ya sirve `/ruta` desde `ruta/index.html` y
    usa `404.html` para lo que no exista, así que no hace falta una regla «catch-all».
- **Vista previa en Cloudflare Pages** (proyecto `proicfes`, rama de producción `main`): se publica sin conectar
  el repositorio, con *direct upload*:

  ```bash
  pnpm build
  CLOUDFLARE_ACCOUNT_ID=<id de la cuenta> CLOUDFLARE_API_TOKEN=<token con permiso Pages:Edit> \
    npx wrangler pages deploy dist --project-name proicfes --branch preview
  ```

  `--branch preview` crea un despliegue de **vista previa** en <https://preview.proicfes.pages.dev> (cada despliegue
  tiene además su URL `https://<hash>.proicfes.pages.dev`). Las reglas `https://:project.pages.dev/*` y
  `https://:version.:project.pages.dev/*` de `public/_headers` agregan `X-Robots-Tag: noindex` a **todas** las URLs
  `*.pages.dev`, así que las vistas previas no se indexan. El dominio propio no coincide con esas reglas y se indexa
  normalmente (el dominio `proicfes.com.co` todavía no está conectado al proyecto).
- **GitHub Pages**: cada push a `main` ejecuta `.github/workflows/deploy.yml`, que valida, compila y publica `dist/`
  con las acciones oficiales (`configure-pages`, `upload-pages-artifact`, `deploy-pages`). En **Settings → Pages →
  Build and deployment → Source** debe estar seleccionado **GitHub Actions**.
  **Para desactivarlo** al pasar a Cloudflare Pages: crear la variable de repositorio `DEPLOY_GITHUB_PAGES` = `false`
  (*Settings → Secrets and variables → Actions → Variables*) o cambiar en el workflow
  `DEPLOY_GITHUB_PAGES: ${{ vars.DEPLOY_GITHUB_PAGES || 'true' }}` por `'false'`. El job `build` (validación,
  pruebas y compilación) sigue corriendo en cada PR.

## Páginas legales, cookies y datos por completar

Rutas: `/politica-de-privacidad` (aviso de privacidad), `/tratamiento-de-datos` (Política de Tratamiento de Datos
Personales, Ley 1581 de 2012 y Decreto 1074 de 2015), `/terminos` (Términos y condiciones, incluye Ley 1480 de 2011 y
derecho de retracto) y `/cookies`. Están prerenderizadas, en el sitemap y enlazadas en el pie de página. El texto
está en `src/pages/legal/`; lo común (ficha del responsable, tabla de proveedores) en `src/legal/shared.tsx`.

**Datos del responsable** en `src/config/legal.ts` (ya están llenos; si falta alguno, se ve resaltado en amarillo
en las páginas y `pnpm build` lo lista como advertencia). La fecha de entrada en vigencia sale de una sola constante:

```ts
// src/config/legal.ts
export const FECHA_LANZAMIENTO = "2026-10-05"; // vigencia = fecha de publicación
```

Se muestra como «5 de octubre de 2026» en las cuatro páginas legales. Si cambias el contenido de las políticas, sube `LEGAL.version`. Los textos son una base redactada según la norma
citada; conviene que los revise un abogado antes de lanzar cuentas o pagos.

**Cookies y Google (Consent Mode v2).** El `<head>` de cada página fija por defecto todo en `denied`
(`src/lib/consent.ts`). El aviso (`src/components/CookieConsent.tsx`) ofrece *Rechazar*, *Configurar* y *Aceptar
todas*; la decisión se guarda en `localStorage` (`proicfes_consent`, con versión y fecha) y se puede cambiar desde
«Configurar cookies» en el pie o en `/cookies`. Subir `CONSENT_VERSION` vuelve a preguntar a todos.
Google Analytics y AdSense **no están activos**: `loadAnalytics()` y `loadAds()` (`src/lib/thirdParty.ts`) no hacen
nada hasta que pongas los IDs en `SITE.integrations` (`src/config/site.ts`):

- `gaMeasurementId`: `G-XXXXXXXXXX` (Google Analytics 4).
- `adsenseClientId`: `ca-pub-XXXXXXXXXXXXXXXX` (AdSense). Recuerda también publicar `ads.txt` en `public/`.

Aun con el ID puesto, cada script solo se carga si la persona aceptó esa categoría.

**Registro con autorización.** `src/components/DataAuthorization.tsx` es la casilla de «Autorización de tratamiento de
datos» del registro de cuentas (`/cuenta`): el adulto marca la autorización de tratamiento; el menor (según fecha de
nacimiento) marca una casilla confirmando el permiso de su acudiente, sin pedir datos del representante.
`src/lib/authorization.ts` arma el registro (versión de la política y fecha) como prueba.

### Prerender, rutas y SEO

`pnpm build` hace tres pasos: `vite build` (la app), `vite build --ssr src/entry-server.tsx` (versión para Node) y
`scripts/postbuild.mjs`, que:

- prerenderiza cada ruta con React y escribe `dist/<ruta>/index.html` y `dist/<ruta>.html` con el **contenido real
  visible sin JavaScript**, más su `<title>`, descripción, canonical, `hreflang`, Open Graph y JSON-LD
  (`src/seo/head.ts`, `src/seo/jsonld.ts`). Así los enlaces directos y recargas responden 200;
- genera `404.html` (noindex), `sitemap.xml` y `robots.txt`;
- precarga las fuentes principales.

En el navegador, `src/main.tsx` **hidrata** ese HTML (sin animaciones de entrada en el primer cuadro) y carga el
progreso guardado justo después. Por eso el primer render debe ser determinista: nada de `localStorage`,
`Date.now()` o `Math.random()` durante el render inicial (usar `useEffect`).

Las rutas y sus metadatos están en `src/seo/routes.ts`. **Si agregas una página**, añádela ahí y en `src/App.tsx`.
Las páginas largas que casi nadie abre (las legales) van en su propio archivo con `lazyPage()` (`src/lib/lazyPage.tsx`):
se cargan antes del prerender y antes de hidratar, así que el HTML igual trae todo el texto.
Las páginas personales (Mi progreso, Logros, Ranking, Meta, Cuenta) llevan `noindex` y no van al sitemap.

## Simulacro

`/simulacro` arma cada intento desde el banco (`src/lib/simulacro.ts`, motor puro con pruebas en
`simulacro.test.ts`; la pantalla está en `src/pages/Simulacro.tsx`):

- **Simulacro corto:** 1 sesión, 25 preguntas en 40 minutos (Lectura 5, Matemáticas 6, Sociales 5, Ciencias 5,
  Inglés 4).
- **Simulacro completo por sesiones:** la misma estructura del cuadernillo oficial (sesión 1: Matemáticas,
  Lectura Crítica, Sociales y Ciencias; sesión 2: Matemáticas, Ciencias, Sociales e Inglés), escalada al tamaño del
  banco con el mismo ritmo del examen real (4 h 30 min por sesión oficial ≈ 2 min por pregunta). Con el banco
  actual: sesión 1 = 62 preguntas / 2 h 20 min y sesión 2 = 70 preguntas / 2 h 21 min. Crece solo cuando el banco
  crece (tope: el tamaño oficial).
- **Reglas como en el examen:** el reloj no se detiene (se calcula con la hora real, aunque se cierre la página);
  dentro de una sesión se puede ir y volver, cambiar respuestas y marcar para revisar; al terminar una sesión (o
  agotarse el tiempo) ya no se vuelve a ella; receso entre sesiones; sin retroalimentación hasta el final.
- **Resultados:** puntaje 0–100 por prueba y global 0–500 **estimado** con la ponderación oficial
  (`(3·LC + 3·M + 3·SC + 3·CN + 1·Inglés) / 13 × 5`), revisión con filtros (todas, incorrectas, sin responder,
  marcadas) y explicación de cada pregunta. El resultado entra al historial (`simulacroHistory`) y a las
  estadísticas por área. El intento en curso se guarda en `localStorage` (`proicfes_simulacro_v1`).
- Las preguntas de un mismo texto salen juntas y las de Inglés siguen el orden de las partes 1 a 7.

## Cuentas con Supabase

Las cuentas son opcionales. Con `SITE.integrations.supabaseUrl` y `supabaseAnonKey` **vacíos** la app funciona
exactamente igual que sin cuentas: no se descarga `@supabase/supabase-js`, no hay peticiones, «Mi cuenta» no aparece en
el menú y `/cuenta` muestra «Próximamente».

**Estado actual:** el proyecto Supabase `proicfes` (`ycvsbjfwolnkyhvautyc`, región us-east-1) ya está conectado: URL y
clave **anon** (pública) están en `SITE.integrations`, la migración `0001_init.sql` está aplicada con RLS, el correo
(enlace mágico) está activo y Site URL / Redirect URLs apuntan a la vista previa. `googleSignIn` sigue en `false` hasta
configurar Google OAuth. La clave `service_role` **nunca** va en el código.

Con los dos valores puestos:

- `/cuenta` ofrece **Crear cuenta** (fecha de nacimiento → `DataAuthorization`: adulto = casilla de tratamiento;
  menor = casilla de permiso del acudiente, sin datos del representante) y luego **enlace mágico al correo**
  (Google cuando `googleSignIn` esté activo); y **Ya tengo cuenta**.
  Si alguien entra con Google sin haber pasado por el registro, se le pide completarlo antes de guardar nada.
- Solo se guarda el **año** de nacimiento, `is_minor`, la casilla de permiso (si es menor) y la prueba de la
  autorización (versión de la política y fecha) más la versión y fecha de la elección de cookies.
- **Sincronización** (`src/lib/progressMerge.ts`, pruebas en `progressMerge.test.ts`): en el primer inicio de sesión
  en un navegador, el progreso local se **fusiona** con el de la cuenta (lecciones por id con el mejor puntaje,
  respuestas por área sumadas, preguntas falladas unidas, simulacros unidos por id, insignias unidas, la racha más
  reciente, la meta de la cuenta). Después se sincroniza el documento completo con «gana el último que escribió»
  (`updated_at`). Si el progreso local era de otra cuenta, no se mezcla. Los simulacros también se suben a
  `attempts`. «Cerrar sesión y borrar el progreso de este navegador» sirve para computadores compartidos.
- Esquema y seguridad: `supabase/migrations/0001_init.sql` (tablas `profiles`, `progress`, `attempts`; Row Level
  Security para que cada usuario solo vea y modifique sus filas; `anon` sin acceso; los intentos no se editan; un
  menor debe marcar la casilla de permiso y no puede registrarse como adulto). `scripts/supabase-schema.test.ts` ejecuta la migración en Postgres
  (PGlite) y prueba esas reglas.

### Proyecto ya creado · pasos que quedan (dueño de la cuenta)

1. Entra a <https://supabase.com>, crea una cuenta y luego **New project**: nombre `proicfes`, una contraseña de base
   de datos fuerte (guárdala tú; no hace falta enviarla), región **East US (North Virginia)** (suele dar la menor
   latencia desde Colombia) y plan Free.
2. **SQL Editor → New query**: pega todo el contenido de `supabase/migrations/0001_init.sql` y pulsa **Run**. En
   **Table Editor** deben aparecer `profiles`, `progress` y `attempts`, las tres con RLS activado.
3. **Authentication → URL Configuration**:
   - *Site URL*: `https://preview.proicfes.pages.dev` por ahora (al lanzar: `https://proicfes.com.co`).
   - *Redirect URLs*: `https://preview.proicfes.pages.dev/cuenta`, `https://*.proicfes.pages.dev/cuenta`,
     `https://proicfes.com.co/cuenta` y `http://localhost:3000/cuenta`.
4. **Authentication → Sign In / Providers → Email**: déjalo activado (el enlace mágico viene incluido). Opcional:
   traduce la plantilla «Magic link» en **Authentication → Emails**. Para el lanzamiento configura un SMTP propio
   (Resend, Brevo, etc.) en **Authentication → Emails → SMTP Settings**: el correo de prueba de Supabase solo envía
   unos pocos mensajes por hora.
5. **Google** (para «Continuar con Google»):
   1. En <https://console.cloud.google.com> crea un proyecto y configura la pantalla de consentimiento (**Google Auth
      Platform → Branding**): nombre ProICFES, correo de soporte y dominios autorizados `supabase.co` y
      `proicfes.com.co`. Permisos: `openid`, `email` y `profile` (no requieren verificación).
   2. **Clients → Create client → Web application**. *Authorized JavaScript origins*:
      `https://preview.proicfes.pages.dev` y `https://proicfes.com.co`. *Authorized redirect URIs*: la *Callback URL*
      que muestra Supabase en **Authentication → Sign In / Providers → Google** (es
      `https://<id-del-proyecto>.supabase.co/auth/v1/callback`).
   3. Copia el *Client ID* y el *Client secret* en ese panel de Supabase, activa Google y guarda.
   4. En **Audience**, pasa la app de *Testing* a *In production* para que cualquiera pueda entrar.
6. **Project Settings → API Keys** (o **Data API**): copia la **Project URL** (`https://<id>.supabase.co`) y la clave
   pública **anon** (o la nueva *publishable*, `sb_publishable_…`).

**Envíame solo esos dos valores** (Project URL y clave anon/publishable). Son públicos por diseño: la seguridad la
da RLS. **Nunca** envíes ni pongas en el código la clave `service_role`/*secret* ni la contraseña de la base de
datos. Con esos valores: se llenan en `SITE.integrations`, se revisan los textos legales (hoy dicen que no hay
cuentas; Supabase ya figura como Encargado y Google como proveedor de inicio de sesión) y se publica.

Para pedir la eliminación de una cuenta, el usuario escribe al correo del responsable; se borra desde
**Authentication → Users** (al borrar el usuario se borran en cascada su perfil, progreso e intentos).

## Banco de preguntas

```
src/data/questions/
  matematicas.json  lectura-critica.json  ciencias-naturales.json
  sociales-ciudadanas.json  ingles.json
  stimuli.json      # textos y tablas compartidos por varias preguntas
  types.ts          # tipos TypeScript y competencias válidas por área
  validate.ts       # reglas de validación (usadas por el script y las pruebas)
```

Cada pregunta tiene:

| Campo | Descripción |
|---|---|
| `id` | Identificador único (p. ej. `mat-001`) |
| `area` | `matematicas`, `lectura-critica`, `ciencias-naturales`, `sociales-ciudadanas` o `ingles` |
| `competencia` / `afirmacion` | Competencia del marco Saber 11 y descripción de lo que se evalúa |
| `difficulty` | 1 (básico), 2 (intermedio) o 3 (avanzado) |
| `stimulusId` | Opcional: id de un texto/tabla en `stimuli.json` (Markdown sencillo, tablas con `\|`) |
| `enunciado`, `options` (`[{id, text}]`), `answer` | Pregunta, opciones y id de la opción correcta |
| `explanation`, `tip` | Explicación de la respuesta y consejo corto |
| `componente` | Solo Ciencias: `Biológico`, `Químico`, `Físico` o `CTS` (ciencia, tecnología y sociedad) |
| `parte` | Solo Inglés: parte 1 a 7 del formato Saber 11 (avisos, emparejar palabras, conversaciones, gramática, lectura literal, lectura inferencial y texto con espacios); el validador revisa el número de opciones de cada parte |
| `source` | `original` (escrita para ProICFES) o `proicfes-lecciones` (migrada de las lecciones) |
| `reviewed` | `true` solo cuando un docente la revisó |

Hoy hay 163 preguntas: Matemáticas 39, Lectura Crítica 30, Ciencias Naturales 31, Sociales y Ciudadanas 33 e
Inglés 30, todas con `reviewed: false`. Las lecciones (`src/lib/appData.ts`, campo `questionIds`), el modo práctica y
el simulacro leen sus preguntas de este banco. `pnpm validate:questions` revisa ids, competencias, componentes,
partes de Inglés, opciones, textos asociados y que la explicación no nombre la letra de la opción. **No agregues preguntas copiadas de cuadernillos oficiales u otras fuentes con derechos de autor**:
escribe preguntas originales y márcalas con `reviewed: false` hasta que un docente las revise.
