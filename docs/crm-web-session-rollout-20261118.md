# CRM web sessions — integration contract (2026-11-18)

This client requires the Hermes web-session implementation described in
`hermes-backend/docs/crm-web-human-sessions-20261118.md`. Do **not** deploy
the new Hermes backend alone: an older client cannot rotate its five-minute
access tokens. Apply the additive `web_sessions` migration first, then roll
out the matching Hermes backend and this client together without mixed-version
Hermes replicas. Rollback to an older Hermes binary requires new logins.

- UnderCode `GET /api/admin/profile` and `POST /api/admin/activity` return
  `expiresAt` in epoch milliseconds. Only trusted foreground input calls the
  activity endpoint. UnderCode `POST /api/crm/auth/session-proof` requires a
  live `adminAuth` bearer belonging to the configured CRM operator and returns
  a signed, unique-jti, 120-second `hermes-crm` proof; it does not renew idle
  time, accept an email, or authorize other admins.
- Hermes `POST /auth/crm-proof` on an OTP login must return `accessToken`,
  `refreshToken`, `expiresAt` (ISO instant) and `user`. `POST /auth/web/refresh`
  rotates refresh once without extending idle time. `GET /auth/web/session`
  and `POST /auth/web/activity` return a server-side ISO `expiresAt`. This
  client checks both servers before displaying CRM, stores Hermes refresh only
  in tab `sessionStorage`, and requires the smaller of both idle deadlines.
- Re-exchange via `/api/crm/auth/session-proof` is **only** available with an
  existing retained Hermes refresh passed as `existingRefreshToken`; generic
  Hermes 401, revoked refresh, or missing refresh never creates a new Hermes
  session. An explicit new OTP login may create a new session. Refresh is
  serialized per tab. SSE and Inbox attachments use the current short-lived
  bearer; successful rotation reconnects SSE. A request is retried once only
  if a known rotation won or if the web JWT expired during the request and a
  refresh succeeds.
- A Hermes 401 hides CRM without invalidating a valid UnderCode admin token;
  UnderCode admin 401 clears both locally and attempts Hermes logout-refresh.
  Browser offline or admin reset/restart cannot **guarantee** Hermes server
  revocation; immediate cross-system revocation needs a trusted server-to-server
  linkage and a separate design. Until then the UI is fail-closed, not proof
  of universal backend revocation.

Hermes commit `951772c` rejects **all old untyped JWTs of the configured CRM operator** and prevents that operator's password login/registration; an OTP re-login is required at cutover. Legacy password JWTs of **other accounts** retain their prior seven-day policy and are outside this operator-scoped guarantee. Do not advertise a universal 24-hour policy or mistake builds,
PRs or published images for production deployment.

## Revisión de dependencias del candidato

La API candidata fija `proxy-addr` transitivo de Express en `2.0.8` mediante el lockfile (`npm update proxy-addr --package-lock-only`), corrigiendo el aviso crítico de suplantación de IP por IPv4-mapped IPv6 frente al `2.0.7` bloqueado previamente. `npm ci --ignore-scripts` y las pruebas backend (27 aprobadas, 4 omitidas) pasaron. `npm audit --omit=dev` todavía reporta **8 moderadas y 22 altas, 0 críticas**: esta corrección focalizada no resuelve el resto ni acredita inmunidad a explotación. Revisar el alcance de cada aviso antes de una distribución más amplia; no usar `audit fix --force` sin pruebas de compatibilidad.

## Desarrollo local tras la parada del corte VPS (19/11/2026)

El propietario pidió detener el despliegue productivo y después continuar **el desarrollo**. No interpretar esto como autorización para reanudar el corte del VPS: el estado parcial (tabla aditiva y rutas Nginx activas; API/Hermes/Next viejos) está registrado en `hermes-backend/docs/mobile-24h-release-gates-2026-11-18.md` del repositorio Hermes. El primer intento de sustituir API terminó **antes de detener PM2** por comparar el `server.js` staged (SHA-256 `28da6f888c525deb7cdac00d791b2437e170edf40556c608c56a8100316e25a0`) con el checkout Windows (SHA-256 `04c2572ef1a0d7825b0a37db81d0126706086c89f090cdbcaf7bb69348565b69`). La investigación **solo local** verificó que los 22 archivos de aquel tarball antiguo tienen diferencias exclusivas de finales de línea: convertidos a LF coinciden byte por byte con los blobs Git de `66ea1c7`. `git archive` en Windows hereda `core.autocrlf=true` del sistema; al forzar `-c core.autocrlf=false -c core.eol=lf` sus bytes son exactamente los blobs Git. No atribuir el fallo a corrupción de código ni reutilizar el hash del checkout como puerta productiva.

Para preparar candidatos nuevos, ejecutar `python scripts/build-crm-release-archives.py --ref 66ea1c74d2853bdccf7336f215d4fb95b2c0e22d --output-dir RUTA_VACÍA_FUERA_DEL_REPOSITORIO`. El script archiva exclusivamente rutas web y una lista explícita de fuentes API desde **Git**, compara cada archivo del tarball byte a byte con el blob del commit y escribe checksums; excluye `.env`, `node_modules`, builds, `uploads`, tests y datos productivos. `python -m unittest discover -s tests -p test_crm_release_archives.py` cubre determinismo y rechazo de conversiones CRLF. Los paquetes son fuentes, no despliegues ni pruebas de restauración. Si se decide reanudar producción, verificar primero los hashes y el estado efectivo de servicios/BD, y obtener instrucción expresa para el nuevo corte.

Artefactos **canónicos locales**, sin transferir ni publicar: web `undercode-web-66ea1c74d285-git.tar.gz` SHA-256 `db8bd901af12c4bae7ca737646b982eb85536a0b4e7d759c96d1b3d3cfc2040d` (1.435 blobs verificados); API `undercode-api-66ea1c74d285-git.tar.gz` SHA-256 `c7c3a58fa4e2cb513e7794f3fc07c30aec4887a9a63ca03bbc69324fa6f95e6d` (22 blobs). El `backend/server.js` empaquetado coincide **exactamente** con el blob Git SHA-256 `437cfbc06f73a1a1fc5c57ebcd3285980cd4b6fa5bb8405625beb3fd3dd9afc2`; no es el archivo que ya está staged en el VPS. Los tarballs viven únicamente en `C:\Users\USUARIO\AppData\Local\Temp\opencode\undercode-crm-git-66ea1c7-20261119-canonical` y el manifiesto `SHA256SUMS.json` en esa ruta; al reanudar se deberá validar cualquier transferencia y no reutilizar los hashes anteriores.

Una segunda generación local en un directorio vacío independiente produjo **los mismos dos hashes y tamaños**, además de verificar de nuevo todos los blobs. La extracción local de la API canónica conservó el SHA-256 de `server.js` y `node --check` pasó. El build VPS de la web y el API staged anteriores se hicieron con los paquetes CRLF y no deben describirse como builds de estos nuevos artefactos.

**Validación canónica Linux local, sin VPS (19/11/2026):** fuentes extraídas de los tarballs anteriores y cotejadas con sus SHA-256; contenedor `node:20-bookworm-slim` (Node `20.20.2`, pnpm `9.15.4`). Instalación `pnpm install --frozen-lockfile --ignore-scripts` y `pnpm build` satisfactorios: 41 páginas estáticas, manifiesto con login CRM, Inbox, administración y proxy `/api/hermes/[...path]`; build ID `fAJfwPVMS9FU-NVWY3PSv`. Un `next start` aislado con `--network none` respondió **200** en `/admin/crm/login/`, `/admin/crm/inbox/` y `/admin/crm/administracion/` al enviar `Host: admincrm.undercodeec.com` mediante `node:http`. El intento previo con `fetch` dio 404; la prueba corregida establece el encabezado real que exige `src/app/admin/layout.jsx`. Estas son respuestas **sin autenticación**, no una validación de datos CRM reales ni de los endpoints protegidos. La API canónica pasó `node --check` para sus JS dentro de Linux y confirmó `proxy-addr` `2.0.8` en el lockfile; no se levantó con datos ni secretos. Las tres pruebas locales del empaquetador cubren determinismo, rechazo de CRLF y rechazo de rutas `.env`, traversal y symlinks. Los scripts de QA están fuera del repo en `D:\Documentos\undercode-crm-canonical-qa-20261119`; nada de esto se ha desplegado ni transferido al VPS.
