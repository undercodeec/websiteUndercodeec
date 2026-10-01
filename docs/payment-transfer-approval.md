# Aprobación de transferencias y medición de compras

Una transferencia queda en estado `pending` cuando el cliente carga el comprobante. El equipo comercial la revisa en **CRM → Pagos** y la aprueba únicamente si el depósito es válido.

Al pasar una transferencia de un estado distinto de `approved` a `approved`, el sistema:

1. Conserva un identificador de transacción estable con formato `transfer-<id-del-pedido>`.
2. Inicia la creación de la carpeta del proyecto mediante el mismo Google Script que usa PayPhone, con los datos del pedido y su plan.
3. Devuelve al CRM un evento ecommerce `purchase`; el navegador del administrador lo añade al `dataLayer` solo si tiene consentimiento de medición.

No se emite `purchase` al subir el comprobante, rechazarlo ni simplemente consultar el pedido.

## Decisión pendiente: atribución de la compra al cliente original

El evento actual se produce en la sesión del administrador que aprueba el pago, no en el navegador que inició la transferencia. Por ello no conserva automáticamente la sesión, fuente de campaña ni identificadores publicitarios originales del cliente.

Para atribuir estas ventas al cliente original habrá que decidir e implementar una conversión server-side u offline. Antes de hacerlo se debe definir: qué consentimiento del cliente lo autoriza; qué identificador de atribución se conserva; cómo se deduplica por pedido; qué destino recibe la conversión; y si se usarán datos first-party, cómo se protegen y se ajustan a los requisitos legales. No se deben enviar nombres, correos, teléfonos ni documentos de identidad al `dataLayer`.
