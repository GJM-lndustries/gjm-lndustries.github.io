# ProICFES

App web interactiva y gratuita para preparar el examen **Saber 11 (ICFES)**: lecciones cortas, modo práctica con
retroalimentación inmediata, mini simulacro y puntaje global estimado por áreas.

Sitio: <https://proicfes.com.co> · Hecho por GJM lndustries

## Tecnología

React 19 + TypeScript + Vite + Tailwind CSS 4, con `wouter` (rutas), `framer-motion` y `recharts`.
Fuentes Lexend y DM Sans autoalojadas (`src/assets/fonts`, licencia SIL OFL).
Es una app 100 % estática: no tiene servidor, cuentas ni pagos. El progreso se guarda en el navegador
(`localStorage`, clave `proicfes_progress`).

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

**Datos que debes llenar una sola vez** en `src/config/legal.ts` (mientras falten, se ven resaltados en amarillo en
las páginas y `pnpm build` los lista como advertencia):

| Marcador | Qué poner |
| --- | --- |
| `[NOMBRE COMPLETO DEL RESPONSABLE]` | Persona natural o empresa responsable del tratamiento |
| `[CÉDULA/NIT]` | Cédula (persona natural) o NIT (empresa) |
| `[CIUDAD]` | Ciudad de domicilio (también fija la jurisdicción en los Términos) |
| `[DIRECCIÓN FÍSICA]` | Dirección para notificaciones |
| `[TELÉFONO DE CONTACTO]` | Teléfono de atención |
| `[CORREO DE CONTACTO]` | Correo para consultas y reclamos de habeas data |
| `[FECHA DE ENTRADA EN VIGENCIA]` | Fecha de publicación de las políticas (p. ej. «15 de octubre de 2026») |

Si cambias el contenido de las políticas, sube `LEGAL.version`. Los textos son una base redactada según la norma
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
datos» para el futuro formulario de cuenta, con variante para menores de 18 años (datos del padre, madre o
representante y constancia de haber escuchado al menor). `src/lib/authorization.ts` decide la variante por fecha de
nacimiento y arma el registro (versión de la política y fecha) que debe guardarse como prueba de la autorización.

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
Las páginas personales (Mi progreso, Logros, Ranking, Meta) llevan `noindex` y no van al sitemap.

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
| `source` | `original` (escrita para ProICFES) o `proicfes-lecciones` (migrada de las lecciones) |
| `reviewed` | `true` solo cuando un docente la revisó |

Las lecciones (`src/lib/appData.ts`, campo `questionIds`) y el simulacro (`src/data/simulacro.ts`) leen sus preguntas
de este banco. **No agregues preguntas copiadas de cuadernillos oficiales u otras fuentes con derechos de autor**:
escribe preguntas originales y márcalas con `reviewed: false` hasta que un docente las revise.
