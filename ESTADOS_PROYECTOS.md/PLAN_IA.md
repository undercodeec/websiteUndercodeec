# PLAN IA - Flujo comercial y tecnico del asistente Undercodeec

## Objetivo

Convertir el asistente IA en un canal rentable de captacion y venta, sin permitir consumo masivo de tokens por usuarios anonimos.

La estrategia recomendada es mantener el asistente visible al publico, pero con un modelo freemium:

- Visitantes anonimos: acceso limitado y orientado a conversion.
- Usuarios registrados: mas uso, historial y mejor asesoria.
- Leads calificados o clientes: uso amplio porque ya existe intencion comercial.

No se recomienda ocultar completamente el asistente detras de login, porque el asistente cumple una funcion comercial importante: captar dudas, calificar prospectos y llevarlos a WhatsApp, formulario o pago.

## Estado de implementacion

Nivel actual del desarrollo: **Nivel 2 base + Nivel 3 parcial - usuario registrado y lead calificado**.

Implementado:

- Limite publico de IA reducido a 2 llamadas por minuto y 5 llamadas diarias por IP.
- El saludo inicial no consume cuota IA.
- Las preguntas frecuentes de precios, WhatsApp, pagos, portafolio, hosting, soporte y ubicacion responden con plantillas sin llamar a Gemini.
- Endpoint `/api/chat/tts` protegido con limite de voz.
- Cuando el backend devuelve limite `429`, el widget muestra el mensaje comercial dentro del chat.
- Endpoint `/api/chat/lead` creado para guardar leads capturados desde el asistente.
- Formulario compacto dentro del widget para capturar nombre, WhatsApp/email y tipo de proyecto cuando el usuario llega al limite.
- El backend expone `X-Chat-Remaining-Today` y el widget muestra cuantas consultas IA gratuitas quedan.
- Tabla `chat_usage` agregada para medir eventos del asistente: IA, plantillas, limites, leads y TTS.
- Endpoint admin `/api/admin/chat-usage` agregado para consultar resumen de uso por dia/evento y eventos recientes.
- Pestaña visual `IA` agregada al dashboard admin con tarjetas de uso, eventos por tipo y eventos recientes.
- Tablas `chat_sessions` y `chat_messages` agregadas para persistir conversaciones anonimas por `sessionId`.
- El widget genera un `sessionId` local y lo envia al backend en chat y captura de leads.
- La pestaña `IA` muestra sesiones recientes, estado, conteo de mensajes y lead asociado.
- Endpoint admin `/api/admin/chat-sessions/:id/messages` agregado para consultar mensajes de una conversacion.
- Modal de detalle en la pestaña `IA` para leer la conversacion guardada completa.
- Cuota diferenciada inicial: visitantes publicos tienen 5 consultas IA/dia; sesiones con lead capturado tienen 30 consultas IA/dia y 5/minuto.
- El backend expone `X-Chat-Access-Tier` y el widget distingue consultas publicas vs consultas de lead.
- Al capturar un lead, `/api/chat/lead` devuelve inmediatamente tier `qualified_lead` y el widget actualiza el contador a 30 consultas IA de lead.
- Tabla `chat_users` agregada para cuentas simples del asistente IA.
- Endpoints `/api/chat/auth/register` y `/api/chat/auth/login` agregados para activar usuario registrado desde el widget.
- Token local del asistente agregado: el widget lo guarda y lo envia en `Authorization: Bearer`.
- Cuota `registered_user` agregada: 25 consultas IA/dia y 4 consultas/minuto.
- El widget muestra registro/login al llegar al limite, como alternativa a dejar datos de lead.
- Las sesiones de chat pueden asociarse a `user_id`, ademas de `lead_id`.
- La pestaña admin `IA` muestra el usuario registrado asociado a cada sesion cuando existe.
- Tier `client` agregado: usuarios con pago aprobado obtienen 100 consultas IA/dia y 10/minuto (maxima prioridad sobre lead y registrado).
- Columnas `is_client` y `client_since` agregadas a `chat_users`.
- Promocion automatica a cliente: al guardar orden aprobada (`saveOrderToDB`), al aprobar transferencia desde admin (`/api/admin/payments/:id/status`), y al registrarse/iniciar sesion si ya existe una orden aprobada con ese email.
- Recuperacion de contrasena por codigo OTP: endpoints `/api/chat/auth/forgot` y `/api/chat/auth/reset`, codigo de 6 digitos por email (15 min de validez), cooldown de 1/min por email, columnas `reset_code_hash` y `reset_expires` en `chat_users`.
- El widget agrega modos `forgot` y `reset` con enlace "Olvide mi clave" desde el login.
- Portal de clientes fuera del widget en la ruta `/portal` (Next.js App Router, client component autocontenido).
  - Reutiliza la autenticacion de `chat_users` (login/register/forgot/reset) con el token en `localStorage`.
  - Endpoints backend protegidos con middleware `chatUserAuth` (Bearer): `/api/chat/me`, `/api/chat/my-orders`, `/api/chat/my-sessions`, `/api/chat/my-sessions/:id/messages`.
  - Dashboard con pestañas: Mis proyectos (ordenes por email + estado de pago), Historial (conversaciones + modal de mensajes) y Mi cuenta (perfil + tier + cliente desde).
- Cabos cerrados de integracion:
  - `chatAuthResponse` (login/register/reset) ahora devuelve tier `client` y `dailyMax` ampliado cuando el usuario es cliente (antes siempre `registered_user`).
  - `ensureClientTierForEmail` devuelve booleano y los endpoints de auth marcan `user.is_client` para reflejarlo en la respuesta.
  - Pestaña admin `IA`: badge de estado de sesion coloreado para `client` (ambar), `registered` (azul) y `lead_captured` (verde).
  - Enlace "Portal de clientes" agregado al footer de produccion (`Saas/Footer`, usado por landings `/es` y `/ec`) apuntando a `/portal`.

Pendiente:

- (ninguno de los tres pendientes originales; ver mejoras futuras abajo si aplica)

## Estado actual detectado

El proyecto tiene un asistente publico implementado en:

- Frontend: `src/components/AIAssistant/index.jsx`
- Backend: `backend/server.js`
- Endpoint principal: `POST /api/chat`
- Endpoint de voz: `POST /api/chat/tts`
- Modelo IA: `gemini-2.5-flash`
- Rate limit actual: 10 requests por minuto por IP y 100 requests por dia por IP.

El backend ya tiene protecciones basicas:

- Limite por IP en `/api/chat`.
- Maximo de longitud para mensaje.
- Maximo de historial enviado a Gemini.
- Maximo de tokens de salida.
- Respuesta fija para `SALUDO_INICIAL`, sin llamar al modelo.
- Tools para analizar sitios y generar cobros.

Riesgos actuales:

- 100 mensajes diarios por IP es demasiado alto para presupuesto bajo.
- `/api/chat/tts` no tiene un limite comercial equivalente al chat.
- El asistente publico puede consumir tokens con usuarios no calificados.
- El historial se manda desde frontend, aunque el backend lo recorta.
- No existe un sistema de cuentas de usuario cliente; solo login de admin.
- La voz puede duplicar costo sin necesariamente aumentar conversion.

## Flujo comercial recomendado

### Nivel 1: visitante publico

Objetivo: captar interes sin permitir abuso.

Permitir:

- 3 a 5 mensajes IA por dia por IP/dispositivo.
- Saludo inicial fijo sin consumo IA.
- Botones rapidos sin IA.
- Respuestas automaticas de backend para preguntas frecuentes.
- Acceso directo a WhatsApp, planes, portafolio y formularios.

Limitar:

- Sin voz/TTS por defecto.
- Sin analisis avanzado de sitios ilimitado.
- Sin conversaciones largas.
- Sin historial persistente.

Mensaje al llegar al limite:

> Ya usaste las consultas gratuitas de hoy. Para seguir con asesoria personalizada, inicia sesion gratis o dejanos tu WhatsApp y continuamos tu cotizacion.

CTA recomendados:

- Iniciar sesion gratis.
- Cotizar por WhatsApp.
- Ver planes.
- Llenar formulario de proyecto.

### Nivel 2: usuario registrado gratis

Objetivo: transformar gasto de tokens en lead identificado.

Permitir:

- 20 a 30 mensajes diarios.
- Historial de conversacion.
- Recomendaciones mas personalizadas.
- Guardar nombre, email, telefono, tipo de proyecto e interes.

Limitar:

- Voz desactivada por defecto o limitada a pocos usos.
- Analisis de sitios con limite diario bajo.
- Sin uso ilimitado real; "libertad" debe significar suficiente para vender, no consumo infinito.

Mensaje de valor:

> Al iniciar sesion guardamos tu cotizacion, entendemos mejor tu proyecto y puedes continuar la conversacion despues.

### Nivel 3: lead calificado

Un usuario pasa a lead calificado si cumple al menos una condicion:

- Dejo WhatsApp o email.
- Inicio una cotizacion.
- Eligio un plan.
- Solicito hablar con asesor.
- Lleno formulario.
- Analizo un sitio web real.
- Pidio precio o anticipo.

Permitir:

- Mayor limite diario.
- Uso de voz si aporta a conversion.
- Seguimiento comercial.
- Resumen automatico para el equipo humano.

Objetivo:

- Llevarlo a WhatsApp.
- Llevarlo a pago de anticipo.
- Llevarlo a formulario de requerimientos.
- Guardar el lead en base de datos.

### Nivel 4: cliente o usuario con pago

Permitir:

- Limite alto o casi libre.
- Historial persistente.
- Soporte asistido.
- Consultas sobre su proyecto.
- Resumen de avances, entregables y proximos pasos.

Regla comercial:

Solo los usuarios con pago, anticipo o contrato deben tener consumo amplio de IA.

## Flujo UX del asistente

1. Usuario abre el asistente.
2. El sistema muestra saludo fijo sin consumir IA.
3. Se muestran botones rapidos:
   - Quiero cotizar un proyecto.
   - Quiero ver precios.
   - Necesito modernizar mi web.
   - Hablar con asesor por WhatsApp.
4. Si el usuario usa botones, responder con plantillas sin IA cuando sea posible.
5. Si escribe una consulta personalizada, usar IA.
6. El contador publico baja por cada respuesta IA real.
7. Al llegar al limite, bloquear nuevas llamadas IA y mostrar CTA de login/contacto.
8. Si el usuario inicia sesion, ampliar limite y guardar historial.
9. Si el usuario deja datos, marcar como lead calificado.
10. Si hay intencion de compra, derivar a WhatsApp, formulario o link de pago.

## Respuestas automaticas sin IA

Antes de llamar a Gemini, el backend deberia detectar preguntas frecuentes y responder desde plantillas.

Casos recomendados:

- Precios de landing page.
- Precios de sitio corporativo.
- Precios de tienda online.
- Formas de pago.
- Anticipo del 50%.
- Horarios de atencion.
- Telefono y WhatsApp.
- Servicios disponibles.
- Garantia.
- Hosting y dominio.
- Tiempo estimado de entrega.
- Portafolio.
- Ubicacion.
- Contacto humano.

Esto reduce tokens y mejora velocidad.

Ejemplo de clasificacion simple:

- Si el mensaje contiene "precio", "cuanto cuesta", "planes": responder plantilla de planes.
- Si contiene "whatsapp", "asesor", "humano": responder boton de WhatsApp.
- Si contiene "horario": responder horario.
- Si contiene "portafolio", "trabajos", "ejemplos": responder enlace de portafolio.
- Si contiene "pago", "anticipo", "tarjeta": responder politica de pagos.

Solo usar IA cuando la pregunta necesita razonamiento, clasificacion o venta consultiva.

## Limites recomendados

### Publico anonimo

- Mensajes IA diarios: 5.
- Mensajes IA por minuto: 2.
- Longitud maxima de mensaje: 800 a 1200 caracteres.
- Historial enviado al modelo: maximo 4 turnos.
- TTS: desactivado.
- Analisis de URL: 1 por dia.

### Usuario registrado

- Mensajes IA diarios: 25.
- Mensajes IA por minuto: 5.
- Longitud maxima de mensaje: 2000 caracteres.
- Historial enviado al modelo: maximo 8 turnos.
- TTS: 3 a 5 usos diarios o solo bajo boton manual.
- Analisis de URL: 2 a 3 por dia.

### Lead calificado

- Mensajes IA diarios: 50.
- Mensajes IA por minuto: 8.
- TTS: permitido si el usuario lo activa.
- Analisis de URL: 5 por dia.

### Cliente con pago

- Mensajes IA diarios: 100 o mas, segun presupuesto.
- Historial persistente.
- Prioridad comercial.

## Cambios tecnicos recomendados

### Fase 1: bajo costo y rapida implementacion

Implementar sin crear login completo:

- Bajar `CHAT_RATE_DAILY_MAX` de 100 a 5 para anonimos.
- Bajar `CHAT_RATE_MAX` de 10/min a 2/min para anonimos.
- Agregar rate limit a `/api/chat/tts`.
- Desactivar TTS para visitantes anonimos.
- Crear respuestas automaticas por reglas antes de llamar a Gemini.
- Agregar respuesta especial cuando se alcance el limite.
- Mostrar contador en frontend: "Te quedan X consultas gratis hoy".
- Agregar CTA de WhatsApp/login/formulario al llegar al limite.

Esta fase protege presupuesto inmediatamente.

### Fase 2: captura de leads

Agregar un formulario corto dentro del chat:

- Nombre.
- Email.
- WhatsApp.
- Tipo de proyecto.
- Presupuesto aproximado opcional.

Guardar en base de datos como lead.

Despues de dejar datos:

- Aumentar limite de uso.
- Marcar como lead calificado.
- Enviar resumen al admin o correo comercial.

Esta fase convierte tokens en oportunidades comerciales.

### Fase 3: login de clientes

Crear autenticacion para usuarios/clientes:

- Registro por email y password, o magic link/OTP.
- Tabla `users`.
- Tabla `chat_usage`.
- Tabla `chat_sessions`.
- Tabla `chat_messages`.
- Relacionar leads con usuarios.

Beneficios:

- Historial persistente.
- Limites por usuario real, no solo IP.
- Mejor seguimiento comercial.
- Menos abuso por VPN/IP compartida.

### Fase 4: monetizacion y clientes

Agregar niveles:

- Gratis registrado.
- Lead calificado.
- Cliente con anticipo.
- Cliente activo.

Cada nivel tiene limites diferentes.

Para clientes:

- Asistente de soporte.
- Estado de proyecto.
- Preguntas frecuentes del servicio contratado.
- Recordatorios de pagos/documentos.
- Resumen para equipo interno.

## Arquitectura sugerida de backend

Crear una funcion central antes de llamar al modelo:

```js
async function resolveChatAccess(req, message) {
  // 1. Identificar usuario: session, token, email, IP o fingerprint.
  // 2. Determinar nivel: anonymous, registered, qualified_lead, client.
  // 3. Revisar cuota diaria/minuto.
  // 4. Detectar si la pregunta puede responderse con plantilla.
  // 5. Decidir si se llama a Gemini, se responde plantilla o se muestra CTA.
}
```

Crear una funcion para respuestas baratas:

```js
function getStaticChatReply(message) {
  // Devuelve una respuesta de plantilla si aplica.
  // Devuelve null si debe pasar a IA.
}
```

Crear una funcion para uso:

```js
async function registerChatUsage({ userId, ip, tier, usedAI, usedTTS, tokensEstimate }) {
  // Guarda consumo para auditoria y limites.
}
```

## Tablas sugeridas

### users

- id
- name
- email
- phone
- password_hash o auth_provider
- role
- created_at
- updated_at

### leads

Si ya existe tabla de leads, extenderla con:

- source = chat
- user_id
- project_type
- budget_range
- qualification_status
- last_message
- assigned_to

### chat_usage

- id
- user_id nullable
- ip_hash
- date
- tier
- ai_messages_count
- tts_count
- url_analysis_count
- estimated_input_tokens
- estimated_output_tokens
- created_at

### chat_sessions

- id
- user_id nullable
- lead_id nullable
- ip_hash
- status
- created_at
- updated_at

### chat_messages

- id
- session_id
- role
- content
- used_ai
- created_at

## Politica comercial de limites

La regla principal:

> A mayor identificacion e intencion comercial, mayor acceso al asistente.

No conviene decir "uso ilimitado" si el presupuesto es bajo. Es mejor comunicar:

- "Consultas gratuitas diarias".
- "Asesoria personalizada al iniciar sesion".
- "Mayor prioridad para clientes activos".
- "Guardamos tu cotizacion y puedes continuar luego".

## Mensajes recomendados

### Antes del limite

> Te quedan 2 consultas gratuitas hoy. Si inicias sesion gratis, puedo guardar tu cotizacion y ayudarte con mas detalle.

### Al llegar al limite

> Llegaste al limite gratuito de consultas IA por hoy. Para continuar, inicia sesion gratis o escribenos por WhatsApp y seguimos tu cotizacion con un asesor.

### Para incentivar login

> Inicia sesion gratis para continuar la conversacion, guardar tu cotizacion y recibir una recomendacion mas precisa para tu proyecto.

### Para capturar lead

> Para darte una recomendacion exacta, dejame tu nombre y WhatsApp. Asi un asesor puede revisar tu caso si necesitas ayuda humana.

### Para derivar a WhatsApp

> Este caso ya merece revision humana. Te dejo un boton directo para que un asesor continue con tu contexto.

## Indicadores que se deben medir

- Conversaciones iniciadas.
- Mensajes IA por visitante.
- Usuarios que llegan al limite.
- Usuarios que inician sesion despues del limite.
- Leads capturados desde chat.
- Clics en WhatsApp desde chat.
- Solicitudes de cotizacion.
- Links de pago generados.
- Pagos completados desde chat.
- Costo estimado por lead.
- Conversion de visitante a lead.
- Conversion de lead a pago.

## Reglas de presupuesto

Si el presupuesto es muy bajo:

- Publico anonimo: 3 mensajes IA/dia.
- Sin TTS publico.
- Usar muchas plantillas.
- Priorizar WhatsApp.
- No analizar URLs para anonimos.

Si el presupuesto mejora:

- Publico anonimo: 5 a 8 mensajes IA/dia.
- TTS limitado.
- Analisis de URL solo para usuarios registrados.

Si el asistente demuestra ventas:

- Aumentar limites para leads calificados.
- Automatizar seguimiento por email/WhatsApp.
- Crear panel de rendimiento del asistente.

## Prioridad de implementacion

1. Bajar limites publicos.
2. Limitar o desactivar TTS publico.
3. Agregar respuestas automaticas sin IA.
4. Mostrar contador y CTA en frontend.
5. Capturar datos desde el chat.
6. Guardar uso en base de datos.
7. Crear login de clientes.
8. Crear historial persistente.
9. Crear panel de metricas.
10. Ajustar limites segun conversion real.

## Decision final recomendada

Mantener el asistente visible al publico, pero no libre.

El flujo mas rentable es:

- Publico: probar, resolver dudas basicas y captar interes.
- Login gratis: continuar asesoria y guardar cotizacion.
- Lead calificado: mas uso porque puede convertirse en venta.
- Cliente: acceso amplio porque ya financia el costo.

Este modelo protege el presupuesto, mantiene el valor comercial del asistente y crea un incentivo claro para que el usuario se registre o deje sus datos.
