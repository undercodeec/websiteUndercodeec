# Wizard completo embebido en OFF+BRAND

## Objetivo

Mostrar el wizard comercial existente dentro de la sección de planes de `public/demos-offbrand`, sin navegación de página y conservando los estilos de OFF+BRAND alrededor del flujo.

## Decisión

Se reutilizará `AffiliationSection` como única fuente de lógica para las siete rutas de proyecto, planes, formularios, validación, integraciones de pago y envío. Se expondrá una ruta interna de solo wizard y se renderizará dentro de un `iframe` same-origin insertado por el selector estático del demo.

El iframe aísla `preview-style.css` y sus clases genéricas de los estilos de OFF+BRAND. Al seleccionar un proyecto, la cuadrícula OFF+BRAND entra en estado expandido, oculta su tarjeta de agenda duplicada y muestra el wizard con ese proyecto seleccionado. El wizard comunica su altura al padre con `postMessage`; el padre acepta únicamente mensajes del mismo origen y ajusta el alto del iframe.

## Comportamiento

- Antes de seleccionar: se conservan las dos columnas OFF+BRAND actuales.
- Al seleccionar: no hay redirección. Se crea/actualiza un iframe a `/demos-wizard/?project=<tipo>` y se le enfoca.
- El wizard inicia directamente en la rama que corresponde al tipo seleccionado, incluido el paso de planes para Sitio Web, Landing Page y Tienda Online.
- Todos los pasos posteriores, formularios, carga de comprobante, pago y envío se ejecutan con la lógica y endpoints existentes de `InnerPages.jsx`.
- Un botón `Cambiar proyecto` elimina el iframe y restablece la columna OFF+BRAND original.
- En móvil el iframe ocupa una única columna, no deja scroll horizontal y conserva la navegación propia del wizard.

## Restricciones

- No copiar ni reimplementar lógica de precios, pago, recaptcha o envío.
- No cargar estilos del wizard en la página OFF+BRAND.
- No transmitir datos por `postMessage`; solo el alto numérico del documento.
- Validar el proyecto contra el conjunto existente de siete tipos.
- Mantener el fallback sin JavaScript: las tarjetas conservan sus enlaces originales a `/#planes`.

## Pruebas

- Pruebas de URL/validación para los siete tipos y valores inválidos.
- Prueba de ruta que sirva el módulo del selector y la ruta interna del wizard.
- Build de Next y pruebas de la ruta del demo.
