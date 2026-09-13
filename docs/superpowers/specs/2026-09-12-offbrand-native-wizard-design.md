# Wizard nativo OFF+BRAND: diseño

## Objetivo

Reemplazar el iframe de `/demos-wizard/` por un wizard renderizado dentro de
`/demos/`. Debe conservar la lógica de cotización, validación, envío y pago
del configurador raíz, sin reutilizar su JSX, clases ni hojas de estilo.

## Límites visuales

- Todo el DOM nuevo vive en `public/demos-offbrand/index.html` o se crea desde
  `public/demos-offbrand/js/`.
- Todo selector visual nuevo lleva el prefijo `offbrand-wizard-` y se define
  exclusivamente en `public/demos-offbrand/css/demo-local.css`.
- No se usa `iframe`, `InnerPages`, `demos-wizard`, ni las clases CSS del
  configurador raíz para mostrar los formularios.
- El wizard reemplaza ambas columnas mientras está activo y devuelve la vista
  inicial con el control “Cambiar proyecto”.

## Flujo funcional

1. El usuario pulsa uno de los siete botones de proyecto en la columna de
   planes. La página no navega.
2. El wizard muestra su encabezado, contador de pasos, formulario del paso,
   validación contextual y acciones Anterior/Siguiente.
3. Las rutas Sitio Web, Tienda Online y Landing Page muestran sus tarjetas de
   precio antes de los datos de facturación; las demás muestran su cuestionario
   específico.
4. La última etapa envía la solicitud de cotización o muestra la pantalla de
   pago, según la ruta y el plan elegido.
5. El pago usa los mismos endpoints de backend y el popup PayPhone del wizard
   raíz. Se valida el origen y la ventana de pago, se consulta el estado del
   pago y se renderiza la confirmación dentro del wizard OFF+BRAND.

## Lógica compartida

Un módulo sin DOM concentra identificadores de proyecto, pasos, validación,
precios seleccionables, normalización de datos y creación de los payloads. El
renderer OFF+BRAND consume ese módulo. El componente raíz puede conservar su
renderer actual, pero cualquier nueva regla de negocio debe vivir en el módulo
compartido, no en CSS ni en el renderer estático.

## Errores y seguridad

- Los botones Siguiente y Pagar no avanzan con datos requeridos faltantes; se
  anuncia el error junto al campo correspondiente.
- El servidor conserva la autoridad sobre precios y estado de pago.
- Los mensajes de `postMessage` se aceptan solo desde el popup PayPhone activo
  y orígenes permitidos.
- Se limpian los datos temporales de pago al terminar, cancelar o expirar el
  flujo.

## Criterios de aceptación

- Pulsar cualquiera de los siete planes no cambia `location.href`.
- Ningún iframe ni clase de UI del wizard raíz queda en la sección OFF+BRAND.
- Se visualizan todos los pasos aplicables, incluidos envío y pago.
- La apariencia usa solo CSS OFF+BRAND y responde correctamente en móvil.
- Las pruebas cubren selección, avance/retroceso, validación, precio, apertura
  de pago y rechazo de mensajes no confiables.
