# Pruebas de punta a punta (navegador)

Usan `playwright-core` con el Chrome del sistema (`CHROME_PATH`, por defecto `/usr/bin/google-chrome`).
No crean cuentas reales: los formularios de registro se llenan pero no se envían, y Supabase se simula cuando hace falta.

```bash
pnpm build
pnpm e2e:serve &          # sirve dist/ en http://127.0.0.1:4173 como GitHub/Cloudflare Pages
pnpm e2e                  # todas las suites
SHOTS=/tmp/capturas node e2e/contenido-e2e.mjs   # con capturas
pnpm scan:emoji           # emoji o pictogramas en el código
```

Variables: `BASE` (URL del sitio), `ONLY` (regex con el nombre de las pruebas), `SHOTS` u `OUT` (carpeta de capturas).
