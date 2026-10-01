 Diagnóstico: el popup no se cierra porque esta transacción nunca llegó a Approved en el frontend.

   UTC         Evento                                                       Resultado
  ━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   16:27:27    Polling 1b9f…1998 inicia                                     HTTP 200
  ──────────  ───────────────────────────────────────────────────────────  ──────────────────────────────────────────────────────────────────────────
   16:28:27    Polling                                                      HTTP 500
  ──────────  ───────────────────────────────────────────────────────────  ──────────────────────────────────────────────────────────────────────────
   16:29:29    Polling                                                      HTTP 500
  ──────────  ───────────────────────────────────────────────────────────  ──────────────────────────────────────────────────────────────────────────
   16:32:29    Polling                                                      HTTP 500
  ──────────  ───────────────────────────────────────────────────────────  ──────────────────────────────────────────────────────────────────────────
   16:32:32    Consulta directa, solo lectura, a PayPhone para 1b9f…1998    HTTP 200; transactionStatus ausente → backend lo interpreta como Unknown

  Resumen:

  - PM2: backend api-undercodeec; frontend web-undercodeec, ambos online. No reinicié servicios.
  - Git: 59fc180, el commit fix(payments): confirmar PayPhone antes de cerrar popup.
  - JS local y publicado coinciden exactamente (mismo SHA-256) y contienen completePayment, popup.close() y polling a /api/check-payment-status/.
  - Webhook: no llegó ningún POST /api/payphone-webhook desde que comenzó este polling (16:27:27–16:32:32).
  - Polling sí llega: 5 GET HTTP 200, 145 HTTP 304, 3 HTTP 500; no hubo 401 ni 404.
  - Los HTTP 500 corresponden a 429 de PayPhone: el polling cada 2 s está excediendo temporalmente su límite.
  - Los 304 provienen de revalidación HTTP/ETag; fetch considera 304 como ok === false, así que el JS descarta esas respuestas.
  - CORS no bloquea: preflight OPTIONS devuelve 200 con Access-Control-Allow-Origin: https://undercodeec.com y permite Authorization.
  - Nginx no muestra errores ni bloqueo; tampoco tiene caché proxy configurada para la API.

  Causa más probable: PayPhone no está exponiendo un estado Approved para 1b9f…1998 (Unknown en la consulta actual) y tampoco emitió el webhook. Sin
  { success: true, status: "Approved" }, completePayment() no se ejecuta. El polling demasiado frecuente y los 304/429 agravan la situación, pero el
  detonante es la ausencia de confirmación Approved.

  No modifiqué código, configuración ni procesos.


› acabe de realizar un pago en modo testing activo de payphone para el pago que acabe de hacer


• Voy a correlacionar este pago recién completado contra los logs desde el último corte, sin exponer identificadores ni datos del checkout.

• Ran date -u '+%Y-%m-%dT%H:%M:%SZ'
  │ awk '
  │   /\/api\/payphone-webhook|\/api\/check-payment-status\// {
  │ … +12 lines
  └ 2026-10-01T16:33:08Z
    [01/Oct/2026:16:31:09 "OPTIONS /api/check-payment-status/1b9f…1998 HTTP=200
    [01/Oct/2026:16:31:09 "GET /api/check-payment-status/1b9f…1998 HTTP=304
    +116 lines (ctrl+t to view transcript)

• Tras tu confirmación, el mismo clientTransactionId sigue en polling y aún no hay POST del webhook. Haré una segunda verificación puntual del estado de
  PayPhone posterior al pago para confirmar si cambió.

• Ran node -e '
  │ const { execFileSync } = require("child_process");
  │ const app = "/var/www/html/undercodeec/backend";
  │ … +12 lines
  └ 2026-10-01T16:33:24.226Z clientTransactionId=1b9f…1998 payphone_http=200 transactionStatus=Unknown

• Registrado tras tu pago de testing:

  - 16:33:24 UTC — 1b9f…1998: PayPhone respondió HTTP 200, pero sin transactionStatus; el backend lo interpreta como Unknown.
  - Durante los 30 s posteriores no llegó ningún POST /api/payphone-webhook.
  - El polling siguió activo; no hubo Approved ni ejecución del fast-path de webhook.

  Así que el pago de prueba no está siendo confirmado por PayPhone para esa transacción en el endpoint de estado, y el webhook tampoco se está entregando al
  VPS. El popup se mantiene abierto correctamente ante ese estado; no es un problema de CORS, Nginx ni JS desactualizado.
