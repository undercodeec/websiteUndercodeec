# Acceso a Hermes por WhatsApp

## Objetivo

Sustituir el asistente web global de Undercodeec por un acceso directo y no invasivo a WhatsApp, donde el asistente Hermes ya atiende las conversaciones. La captación y calificación ocurren en WhatsApp; el sitio no debe pedir datos ni iniciar una conversación de IA.

## Alcance

- Crear un componente independiente `HermesWhatsAppButton`.
- Mostrarlo globalmente en las mismas páginas públicas en las que se mostraba el asistente actual.
- Abrir WhatsApp al número `+593 99 973 9534` (`593999739534`) con un mensaje inicial de consulta.
- Medir únicamente el clic mediante un evento de Meta Pixel, cuando esté disponible.
- Retirar el montaje y la importación de `AIAssistant` desde el layout global.
- Mantener sin modificaciones el archivo, lógica, estilos y dependencias de `src/components/AIAssistant/index.jsx`.

## Diseño

`HermesWhatsAppButton` será un componente de cliente porque registra el evento analítico al interactuar. Contendrá constantes locales para el número de WhatsApp, el mensaje inicial y la URL generada con `encodeURIComponent`.

El componente renderizará un enlace `target="_blank"` con `rel="noopener noreferrer"`, un icono de WhatsApp, texto accesible y una apariencia flotante fija. Al ser un enlace normal, continúa funcionando incluso si el navegador bloquea las ventanas emergentes o Meta Pixel no está cargado.

En `src/app/layout.tsx`, `AIAssistant` se sustituirá por `HermesWhatsAppButton`. El componente heredará la exclusión de rutas privadas (`/admin`, `/contratos` y `/recursos-humanos`) para no introducir el acceso en superficies internas.

## Flujo

1. El visitante pulsa la burbuja flotante “Hablar por WhatsApp”.
2. Se registra `WhatsAppHermesClick`, únicamente si `window.fbq` está disponible.
3. El navegador abre `wa.me/593999739534` con el texto inicial.
4. Hermes recibe y atiende la conversación dentro de WhatsApp.

No se envía información del visitante desde la web a Hermes, ni se muestran formularios, autenticación o chat embebido.

## Manejo de errores y privacidad

El botón no usa peticiones de red propias ni almacena datos. La ausencia o error de Meta Pixel no bloqueará la navegación al enlace. El enlace usa un número público aprobado por el usuario.

## Pruebas

- Prueba estática para confirmar que el layout global monta el botón de Hermes y no monta `AIAssistant`.
- Prueba estática del componente para verificar el número, el destino de WhatsApp y los atributos de seguridad del enlace.
- Ejecutar `pnpm lint` y `pnpm build`.
