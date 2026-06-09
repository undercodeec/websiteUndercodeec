# Workflow: Cierre automatico del popup de Payphone tras pago exitoso

**Fecha de inicio:** 2026-06-09
**Owner:** Christopher (undercodeec@gmail.com)
**Estado:** Abierto — investigacion + implementacion

---

## 1. Problema a resolver

Cuando el cliente paga desde el popup de Payphone (boton de pago / cajita), la ventana **no se cierra automaticamente** al confirmarse la transaccion. El usuario queda mirando el popup despues de que el pago ya fue aprobado, lo que rompe el flujo y obliga al cliente a cerrar manualmente la ventana.

El cierre automatico deberia dispararse en cuanto Payphone confirme `Approved` en su sistema — la pagina padre tiene que detectarlo y ejecutar `paymentWindow.close()`.

---

## 2. Que cambio desde el lado de Payphone

Soporte de Payphone (ticket DOC-531) habilito la funcionalidad de **Notificacion Externa de Transacciones (webhook)** para el comercio:

| Campo | Valor |
|---|---|
| RUC | 1727155671001 (Undercodeec) |
| Tienda | Undercodeec |
| Permiso | Notificacion externa de transacciones |
| Estado | Habilitado |
| Nombre | Notificacion Undercodeec |
| URL configurada | `https://api.undercodeec.com/api/payphone-webhook` |

**Nota oficial de Payphone:** en Boton de Pago / Cajita de Pago, **el comercio debe seguir validando** la transaccion via consulta a la API (confirmacion de pago). El webhook es una notificacion adicional, **no reemplaza** el flujo `V2/Confirm` que ya tenemos.

---

## 3. Estado actual del codigo (puntos de partida)

### Backend — `backend/server.js`
- **L541-L606** `GET /api/check-payment-status/:clientTxId` — polling autenticado con `paymentSessionToken`. Devuelve `Approved` / `Authorized` / otros.
- **L609-L729+** `POST /api/payphone-webhook` — recibe la notificacion de Payphone, llama `V2/Confirm` si la transaccion esta `Authorized`, dispara emails y limpia `pendingOrders`. Este endpoint **ya esta listo** y coincide con la URL configurada en Payphone.

### Frontend — `undercodeec_nextjs/src/components/Preview/InnerPages.jsx`
- **L335-L339** estados `paymentWindowOpen`, `paymentWindowRef`.
- **L506-L560** listener de `postMessage` + `storage` (envia `PAYMENT_COMPLETED` desde `payment-result.html`).
- **L902-L1010** abre popup `PayPhonePayment`, monta `setInterval` que consulta `/api/check-payment-status` cada ~2 ticks y llama `paymentWindow.close()` cuando ve `Approved`.

### Frontend — `undercodeec_nextjs/src/components/AIAssistant/index.jsx`
- **L328-L388** boton de Payphone dentro del chatbot. Abre popup `PayPhoneCheckout` y escucha `postMessage`. **No tiene polling de respaldo** — depende solo de `postMessage` desde la pagina de resultado.

### Otros puntos relacionados
- `backend/server.js` L1284 — sin relacion (markup parsing).
- Hay logs de diagnostico habilitados (commit `1dfbdb1`) que deben quedarse activos durante esta tarea para verificar el flujo.

---

## 4. Hipotesis de por que el popup no se cierra

A confirmar con repro + logs:

1. **`postMessage` no llega.** `payment-result.html` (pagina a la que Payphone redirige) puede no estar enviando el `PAYMENT_COMPLETED` con el `event.origin` correcto, o lo envia con un origen que no esta en `ALLOWED_PAYMENT_ORIGINS`.
2. **El polling cae antes de tiempo.** Si el `setInterval` se limpia cuando el usuario cierra otra cosa, o si `clientTransactionId` es invalido, el branch que ejecuta `paymentWindow.close()` nunca corre.
3. **El webhook ya marca Approved en backend, pero el frontend no se entera.** El polling deberia recoger ese `Approved`, pero si el `paymentSessionToken` esta expirado o el endpoint devuelve 401, el polling nunca confirma.
4. **El popup esta en un origin cruzado y bloquea `paymentWindow.close()` desde la pagina padre.** Improbable porque la referencia se creo via `window.open` (mismo opener), pero hay que verificar.
5. **El AIAssistant no tiene fallback de polling** — si `postMessage` falla ahi, el popup queda abierto siempre. Caso conocido a corregir aunque no sea el reportado.

---

## 5. Plan de trabajo

### Fase 1 — Diagnostico (no tocar codigo todavia)
- [ ] Reproducir un pago real en sandbox / produccion y capturar:
  - Console del navegador (todos los `[PayPhone Poll]`, errores de origen, etc).
  - Network: ver que `/api/check-payment-status/:id` devuelva `Approved`.
  - Logs del backend: confirmar que el webhook `POST /api/payphone-webhook` se dispara y devuelve `200` (ahora que Payphone lo tiene habilitado).
- [ ] Identificar cual de las 5 hipotesis es la real.

### Fase 2 — Fix del flujo principal (`InnerPages.jsx`)
- [ ] Garantizar que `paymentWindow.close()` se ejecute en al menos uno de estos canales (cualquiera que llegue primero gana):
  - `postMessage` desde `payment-result.html`.
  - Polling backend confirmando `Approved`.
  - Notificacion via `localStorage` (`paymentNotification`).
- [ ] Considerar agregar **un cuarto canal**: que el webhook backend marque un flag en memoria/DB que el polling consulte (esto ya pasa indirectamente via Payphone API, pero podemos cortocircuitarlo si el webhook llego antes que la consulta).
- [ ] Asegurar que el polling no se limpie prematuramente (revisar todos los `clearInterval`).
- [ ] Validar que `paymentSessionToken` siga vigente durante todo el polling.

### Fase 3 — Fix del AIAssistant
- [ ] Agregar polling de respaldo en `AIAssistant/index.jsx` (mismo patron que `InnerPages.jsx`).
- [ ] Reutilizar `/api/check-payment-status` y manejar el `paymentSessionToken`.

### Fase 4 — Limpieza
- [ ] Una vez verificado en produccion (al menos 2 pagos reales cerrando popup automaticamente), revertir el commit `1dfbdb1` (logs temporales) o reducir a logs minimos.
- [ ] Documentar el flujo final en un breve apartado dentro del `README.md` o de un nuevo `PAYPHONE.md` si se considera util.

---

## 6. Criterios de aceptacion

1. Cuando Payphone aprueba un pago, el popup se cierra **automaticamente en <5 segundos** desde la aprobacion.
2. Funciona tanto en el flujo de la landing (`InnerPages`) como en el del chatbot (`AIAssistant`).
3. Si el usuario cierra el popup manualmente despues de pagar, la pagina padre sigue confirmando el pago (no se pierde la orden).
4. El webhook `POST /api/payphone-webhook` se dispara y procesa la orden incluso si el navegador del cliente se desconecta.
5. Los correos de confirmacion y el script de Google Drive se ejecutan **una sola vez** por transaccion (no hay duplicados entre webhook + polling).

---

## 7. Archivos a tocar (probable)

- `backend/server.js` — endpoints `check-payment-status` y `payphone-webhook` (ya implementados, revisar).
- `undercodeec_nextjs/src/components/Preview/InnerPages.jsx` — flujo principal del popup.
- `undercodeec_nextjs/src/components/AIAssistant/index.jsx` — popup del chatbot (sin fallback hoy).
- `undercodeec_nextjs/public/payment-result.html` (o equivalente) — verificar que el `postMessage` se envie con el `origin` correcto.

---

## 8. Riesgos y consideraciones

- **Idempotencia:** webhook + polling pueden detectar el mismo `Approved` casi simultaneamente. Asegurar que `handlePaymentCompleted` y `sendOrderEmailsInternal` no envien correos duplicados (hoy hay un `pendingOrders.delete` que ayuda, validar que sea suficiente).
- **CORS / origenes:** la lista `ALLOWED_PAYMENT_ORIGINS` debe incluir el dominio real donde corre `payment-result.html`.
- **Token de sesion:** `paymentSessionToken` tiene TTL. Si el cliente tarda mucho en pagar, el polling falla con 401 y el popup nunca se cierra desde ese canal. Evaluar extender TTL o renovarlo.
- **Bloqueo del navegador:** algunos navegadores (Safari, iOS) bloquean `paymentWindow.close()` si la ventana no fue abierta por el mismo script en la misma sesion. Validar en mobile.

---

## 9. Avances 2026-06-09 — primer ciclo

### 9.1 Boton `btn-confirm-payment` eliminado
Estaba en `undercodeec_nextjs/src/components/Preview/InnerPages.jsx` en 3 puntos (L2251-L2263, L2814-L2826, L3388-L3400). Era el boton "Ya complete mi pago" que aparecia cuando `paymentWindowOpen === true`. Removido. La clase CSS queda en `preview-style.css:4664` pero sin uso (sin impacto en runtime; limpieza opcional).

Dejados intactos a proposito:
- `checkPaymentStatus` (L1073) y el state `checkingPayment` (L337). Si bien hoy quedan como codigo no llamado, pueden servir si reactivamos un fallback manual. Si quieres, los borramos en un siguiente paso.

### 9.2 Diagnostico de los logs del navegador

**Logs relevantes:**
```
[PayPhone Poll] iniciado para clientTxId: 754109769ab87ee  tokenPresente: true
[PayPhone Poll] tick=2..104  status=200  data={success:false, status:'NotFound', message:'Transacción no encontrada'}
```

**Lectura:**

| Observacion | Implicacion |
|---|---|
| Polling arranca correctamente, token presente. | `/api/create-payment` corrio bien y devolvio `paymentSessionToken`. |
| Cada tick devuelve `status:200` con `NotFound`. | PayPhone NO conoce ese `clientTransactionId` en su tabla de Sales (`GET /api/Sale/ClientTransactionId/{id}` → 404). |
| Se mantuvo `NotFound` durante 104+ ticks (~3+ minutos). | La transaccion **nunca paso a estado registrable** (ni `Authorized`, ni `Approved`). |
| **No** hay logs de `postMessage` ni de `paymentNotification` en localStorage. | `payment-result.html` **NUNCA se cargo** en el popup. |
| Otros mensajes (`[VAULT] syncVaultIfOutdated`, `preloaded but not used`). | Ruido. El primero es de una extension de gestor de contraseñas, el segundo un warning de `<link rel=preload>` no relacionado. |

**Conclusion principal:** el problema no es que el popup "no se cierre". El problema real es que **el popup nunca llega a `payment-result.html`**. PayPhone, en modo prueba, jamas redirige la ventana al `responseUrl` configurado en `backend/server.js:457`, por lo que ninguno de los tres canales de cierre (postMessage, localStorage, polling backend) se activa.

### 9.3 Hipotesis prioritarias (en orden)

1. **El "pago de prueba" no se completo realmente.** En el sandbox de PayPhone hay un paso final (boton de confirmacion / OTP de prueba). Si no se llega al ultimo paso, no hay redireccion ni notificacion.
2. **El `responseUrl` no se esta enviando o esta mal en sandbox.** Verificar en consola del backend que `create-payment` haya impreso `ResponseUrl: https://undercodeec.com/payment-result.html`.
3. **PayPhone sandbox no respeta `responseUrl` para ciertos flujos de Links.** Es comportamiento conocido en algunos PSP; habria que confirmar con soporte si en modo prueba la redireccion sucede igual que en produccion.
4. **El popup quedo "huerfano".** El popup termino en un `about:blank` o pantalla intermedia tras pulsar Pagar. Esto se puede ver mirando la URL del popup mientras esta abierto.

### 9.4 Proximos pasos concretos

- [ ] **Reproducir y reportar URL del popup.** En el proximo test, dejar el popup abierto al finalizar y anotar exactamente que URL muestra (`pay.payphonetodoesposible.com/...` vs `undercodeec.com/payment-result.html?...`).
- [ ] **Revisar logs del backend** durante el ultimo test:
  - ¿Aparecio `📤 Creating PayPhone payment link...` con `ClientTxId: 754109769ab87ee` y `ResponseUrl: https://undercodeec.com/payment-result.html`?
  - ¿Se llamo alguna vez `🔔 WEBHOOK RECIBIDO DE PAYPHONE`? Si no, el problema esta confirmado: PayPhone no esta disparando ni redireccion ni webhook para ese pago.
  - ¿Se llamo `/api/confirm-payment` (es decir, `payment-result.html` corrio)?
- [ ] **Verificar en el dashboard de PayPhone** si la transaccion `754109769ab87ee` quedo registrada en su panel (estado, monto, fecha). Si no aparece ahi, el pago de prueba nunca se proceso en su backend.
- [ ] **Probar con tarjeta real, monto bajo ($1).** Si el flujo cierra el popup correctamente, queda probado que el sandbox de PayPhone es el responsable y no nuestro codigo. En ese caso, hablar con `comercial@business.payphone.app` para que confirmen si el `responseUrl` se respeta en modo prueba.
- [ ] **Anti-lock para el polling.** Aunque el origen sea PayPhone, conviene poner un tope al `setInterval` (ej. 5 minutos) para que el polling no corra indefinido si nunca llega la confirmacion. Hoy corre sin limite — si el usuario abandona el popup, el polling sigue golpeando el backend.

### 9.5 Cambios pendientes en codigo (cuando se confirme la causa)

- En `InnerPages.jsx` (alrededor de L951): poner un limite al `setInterval` (`pollingTick > 150` → clearInterval + alerta).
- En `AIAssistant/index.jsx`: agregar el mismo polling fallback que tiene `InnerPages`.
- En `server.js:546`: el endpoint `check-payment-status` puede empezar a devolver `Approved` directo desde memoria si `pendingOrders` ya esta marcado como `webhookProcessed`. Asi el frontend cierra el popup en cuanto llega el webhook, sin esperar a que PayPhone actualice su Sale endpoint.

---

## 10. Avances 2026-06-09 — segundo ciclo (causa raiz encontrada)

### 10.1 Lo que revelaron los logs reales del backend

```
"TransactionId": 87046180
🔍 Verifying webhook transaction: https://pay.payphonetodoesposible.com/api/Sale/87046180
✅ Estado de transacción verificado: Approved
🎉 Pago APROBADO confirmado por Webhook! TxId: 87046180
✅ RECUPERADO orderData de la memoria para webhook: 65aaa6a23b8cef7
✅ Correos de confirmación enviados desde Webhook
📁 Ejecutando Google Drive Script desde Webhook...
```

**Conclusion:** todo funciona en el backend. El webhook si entra, confirma con PayPhone, marca el pago como Approved, manda los emails y ejecuta el script de Drive.

### 10.2 Y sin embargo, el polling del navegador nunca recibe Approved

```
[PayPhone Poll] tick=2..122  data={success:false, status:'NotFound', message:'Transacción no encontrada'}
```

**Causa raiz exacta:**
- Polling consulta `GET /api/Sale/ClientTransactionId/{clientTxId}` de PayPhone → siempre 404, incluso para transacciones aprobadas.
- Webhook consulta `GET /api/Sale/{TransactionId-numerico}` → siempre devuelve la transaccion correctamente.

PayPhone solo devuelve la sale por su ID numerico (`87046180`), no por el `clientTransactionId` que pusimos al crear el Link. La hipotesis "Payphone test mode no completa" era falsa — el pago si se completa, pero el endpoint que el polling usa esta roto.

### 10.3 Fix aplicado (commit + push tras este ciclo)

**Backend (`backend/server.js`):**
- Nuevo `Map` `webhookApprovedPayments` con TTL 10 min (`rememberWebhookApproval`).
- El webhook, cuando confirma Approved, escribe en ese map ANTES de borrar `pendingOrders`.
- `/api/check-payment-status` agrega un fast-path: si el `clientTxId` ya esta en `webhookApprovedPayments` → devuelve `{success:true, status:'Approved', transactionId}` sin consultar a PayPhone.
- Con esto, el siguiente tick del polling del frontend tras el webhook recibe Approved → `paymentWindow.close()` se ejecuta → popup cierra.

**Frontend (`undercodeec_nextjs/src/components/Preview/InnerPages.jsx`):**
- Tope de seguridad al `setInterval` del polling: `MAX_POLLING_TICKS = 600` (~10 min). Antes podia correr indefinidamente.

**Deduplicacion de emails verificada:** `/api/send-order-emails` (L1806) ya devuelve `alreadyProcessed: true` cuando `pendingOrders` no tiene el clientTxId. Como el webhook hace `pendingOrders.delete()` al final, cuando el polling-triggered `handlePaymentCompleted` llama a `sendOrderEmails`, no se duplican. Sin cambios necesarios ahi.

### 10.4 Resultados esperados en la proxima prueba

1. Usuario paga → PayPhone dispara webhook → backend confirma Approved → `webhookApprovedPayments.set(clientTxId, ...)`.
2. En el siguiente tick del polling (max 2s despues), `check-payment-status` devuelve `Approved` por fast-path.
3. Frontend: `paymentWindow.close()` → popup cierra automaticamente.
4. `handlePaymentCompleted` corre → `sendOrderEmails` recibe `alreadyProcessed` → no duplica emails → muestra pantalla de confirmacion.

### 10.5 Tareas restantes despues de validar

- [ ] Replicar el polling fallback en `AIAssistant/index.jsx` (hoy solo depende de `postMessage` y de `payment-result.html`, que tampoco se carga en este flujo).
- [ ] Reducir los logs `console.log('[PayPhone Poll]...')` a debug-only una vez confirmado el fix.
- [ ] Eliminar `checkPaymentStatus` y el state `checkingPayment` que quedaron sin uso tras quitar el boton manual.
- [ ] (Opcional) Limpiar CSS `.btn-confirm-payment` en `preview-style.css:4664`.

---

## 11. Referencia del soporte Payphone

> Estimado cliente, Tu requerimiento ingresado con el asunto: Activacion de la funcionalidad: Notificacion Externa - DOC-531 ha sido resuelto exitosamente. Se procedio con la habilitacion del permiso de Notificacion Externa de transacciones para el comercio indicado. RUC 1727155671001 (Undercodeec), URL: `https://api.undercodeec.com/api/payphone-webhook`, Estado: Habilitado. **Nota:** En implementaciones que utilizan Boton de Pago o Cajita de Pago, el comercio debe continuar realizando la validacion de la transaccion mediante el proceso de confirmacion de pago correspondiente (consulta a la API).

Contacto Payphone: `comercial@business.payphone.app`
