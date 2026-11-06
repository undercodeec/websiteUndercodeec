# Modal Black Friday en la portada

## Intención

Presentar una oferta puntual de Black Friday en la página raíz para convertir visitas en conversaciones de venta por WhatsApp, sin alterar el contenido ni la navegación existente de la portada.

## Alcance

- Mostrar un modal promocional centrado **tres segundos después de que el preloader termine** y emita `preloaderDone` en la portada (`/`). Si el preloader ya concluyó en la sesión, usar la señal de disponibilidad equivalente de la portada antes de iniciar los tres segundos.
- Mantener la identidad visual y las transiciones de la página raíz.
- Destacar el precio especial de Black Friday: **$80,00**.
- Incluir literalmente estos beneficios:
  - Landing page de una sola sección
  - Diseño responsive para celulares
  - Botón flotante de WhatsApp y llamada directa
  - Formulario de contacto o captura de prospectos
  - Sección de beneficios del servicio o producto
  - Dominio .com y hosting básico por 1 año
  - 5 correos corporativos
  - SEO técnico base
  - 1 año de soporte posterior a la entrega
- Incluir únicamente un CTA: WhatsApp. Será un botón alargado y rectangular, inspirado en el aspecto, color y señalización del botón flotante global actual.
- Permitir cerrar el modal mediante un control accesible, clic fuera del contenido y la tecla Escape. La promoción no reaparecerá durante la misma sesión después de cerrarse.
- Adaptar el contenido para móviles en una sola columna, con desplazamiento interno si fuera necesario.

## No alcance

- No se añadirá un formulario nuevo, botón de llamada ni cambios al contenido estructural de la portada.
- No se modificará el botón flotante de WhatsApp existente.

## Alternativas evaluadas

1. **Modal central (seleccionada):** ofrece espacio para el precio y todos los beneficios, concentra la atención y conserva la portada intacta bajo la capa.
2. Panel lateral: menos intrusivo, pero reduce la jerarquía de la oferta y el espacio disponible en móvil.
3. Banda inferior: discreta, pero insuficiente para comunicar el paquete completo con claridad.

## Decisiones de implementación

- La ventana será un componente cliente montado exclusivamente en la página raíz.
- Se coordinará con `usePageReady`, que ya espera `preloaderDone`, para evitar que la oferta aparezca durante el preload.
- Reutilizará el número de WhatsApp y la capa de atribución comercial del sistema existente; el mensaje identificará la oferta de Black Friday de $80,00.
- El modal respetará `prefers-reduced-motion`, bloqueará el desplazamiento de fondo mientras esté abierto y restaurará el foco al cerrarse.
- Los estilos quedarán encapsulados en un módulo CSS para no afectar otras rutas.
