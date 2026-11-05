# Medición Meta de WhatsApp comercial

## Intención

Medir en Meta Pixel cada clic hacia el WhatsApp comercial desde las páginas públicas de Undercodeec. La medición debe excluir el CRM y las áreas internas, y representar un inicio de contacto, no una venta ni una conversación confirmada.

## Alcance

- Emitir el evento personalizado `WhatsAppCommercialClick` para enlaces HTTPS a `wa.me/593999739534` desde la aplicación pública y desde la portada estática `landing-primary`.
- Conservar los parámetros `source` y `page_path` para identificar el origen del clic.
- Enviar el evento solo si existe consentimiento de publicidad y `fbq` está disponible.
- Excluir las rutas `/admin`, `/contratos` y `/undercodeec`, junto con sus subrutas.
- Mantener el evento de `dataLayer` y la atribución existente para Google/Hermes.

## Fuera de alcance

- No se medirá como compra, venta, mensaje recibido ni lead cualificado.
- No se enviarán datos personales al Pixel.
- No se modificará el CRM, el backend de Hermes ni el flujo de atribución.
- No se añadirá Conversions API en este cambio.

## Enfoques considerados

1. Reutilizar `WhatsAppHermesClick` en todos los enlaces. Se descarta porque su nombre mezcla la web comercial con Hermes/CRM.
2. Crear `WhatsAppCommercialClick` para todos los enlaces comerciales públicos. Seleccionado porque expresa el alcance real y permite una conversión personalizada exclusiva para la web comercial.
3. Usar únicamente el evento estándar `Contact`. Se descarta porque el proyecto ya lo usa para el formulario y no distinguiría el inicio por WhatsApp.

## Diseño seleccionado

Se añadirá una utilidad compartida para emitir `fbq("trackCustom", "WhatsAppCommercialClick", { source, page_path })`.

El botón flotante React usará la utilidad con `source: "hermes_whatsapp_button"`. El observador global de enlaces comerciales usará `source: "commercial_whatsapp_link"`. La portada estática enviará el mismo nombre de evento con ese segundo origen. Las rutas internas no emitirán el evento.

Los eventos Meta heredados específicos de los componentes se conservan cuando ya representan analítica propia de esos componentes, pero la conversión publicitaria debe basarse únicamente en `WhatsAppCommercialClick`, sin filtrar por `source`, para incluir todos los botones comerciales.

La conversión personalizada existente o creada con `WhatsAppHermesClick` deberá sustituirse en Events Manager por una nueva basada en `WhatsAppCommercialClick`, categoría `Contactar` y sin valor monetario.

La nueva conversión debe seleccionar el evento `WhatsAppCommercialClick` sin filtrar por `source`, porque `hermes_whatsapp_button` y `commercial_whatsapp_link` representan dos entradas del mismo sitio comercial.

## Verificación

- Añadir pruebas para el nombre del evento, sus parámetros y la exclusión de rutas internas.
- Ejecutar las pruebas específicas y la suite completa del proyecto.
- Verificar manualmente en Eventos de prueba de Meta, con consentimiento de publicidad, tras publicar el cambio.

## Resultado local

El código emite `WhatsAppCommercialClick` desde el botón React, los enlaces comerciales observados por Next y los enlaces de la portada estática. Las pruebas automatizadas cubren el evento, el consentimiento y la exclusión de rutas internas. La recepción real en Events Manager queda pendiente hasta publicar el cambio y probarlo con el píxel activo.
