# PLAN MADURACION ASISTENTE IA COMERCIAL

Fecha: 2026-07-09

## Objetivo

Madurar el asistente IA de Undercodeec para que funcione como captador y generador de leads, con una conversacion mas natural, menos tecnica y menos apresurada hacia la compra.

El objetivo no es eliminar la venta. El objetivo es que la venta llegue despues de entender el contexto, detectar interes real y crear confianza.

## Contexto revisado

Archivos revisados:

- `undercodeec_nextjs/backend/server.js`
- `ESTADOS_PROYECTOS.md/PLAN_IA.md`
- `undercodeec_nextjs/src/app/marketing-para-tu-negocio/page.tsx`
- `undercodeec_nextjs/src/components/Marketing/MarketingHero.jsx`
- `undercodeec_nextjs/src/components/Preview/InnerPages.jsx`

El plan tecnico de IA ya tiene una base avanzada:

- cuotas por tipo de usuario: publico, registrado, lead calificado y cliente;
- sesiones persistentes;
- historial de mensajes;
- captura de leads desde el chat;
- login/registro del asistente;
- portal de clientes;
- dashboard admin con metricas y sesiones;
- endpoint de voz limitado;
- respuestas estaticas para FAQs;
- herramientas Gemini para analizar sitios y generar cobros.

Por eso este plan no propone rehacer cuotas, login, historial o portal. La siguiente etapa debe concentrarse en la capa comercial/conversacional.

## Decisiones comerciales confirmadas

Estas decisiones fueron definidas despues de la primera revision del plan:

- Objetivo principal del asistente: generar mas leads por WhatsApp.
- Tono de marca: premium consultivo.
- Estrategia de precios: responder con rangos y calificar primero.
- Lead minimo aceptable: nombre + WhatsApp + tipo de proyecto.
- Prioridad de servicios: todos los proyectos importan; tambien debe contemplarse marketing digital, SEO y SEM.
- Seguimiento humano: departamento de ventas por WhatsApp.
- Horario de atencion comercial: hora Ecuador, de 8:00 AM a 22:00 PM.
- Pagos directos: solo cuando el usuario este totalmente decidido.
- Al hablar de precios web, mencionar descuentos vigentes por temporada para captar atencion sin sonar agresivo.

## Estado de implementacion

Actualizado: 2026-07-09

- [x] Fase 1: Prompt comercial consultivo aplicado en `backend/server.js`.
- [x] Fase 2: Plantillas estaticas reescritas para rangos, diagnostico, descuentos, SEO/SEM y WhatsApp.
- [x] Fase 3: Clasificador simple `classifyCommercialIntent` agregado.
- [x] Fase 4: WhatsApp dinamico por intencion agregado con `buildWhatsAppUrl`.
- [x] Fase 5: Captura minima de lead ajustada a nombre + WhatsApp + tipo de proyecto.
- [x] Fase 6: Widget actualizado con sugerencia de SEO/Google y validacion comercial de lead.
- [x] Fase 7: Tool de pago reforzada para usarse solo con usuario decidido y precios vigentes con descuento.
- [x] Fase 8: Persistir snapshot comercial por sesion en `chat_usage.metadata` sin migracion de esquema.
- [x] Fase 9: Mostrar temperatura, servicio probable y siguiente accion en admin IA.
- [x] Fase 10: Mover playbook conversacional a `backend/chatCommercialPlaybook.js`.
- [x] Fase 11: Instrumentar medicion comercial por intencion, temperatura y servicio en admin IA.
- [ ] Fase 12: Ajustar prompts con datos reales cuando exista volumen suficiente de conversaciones.
  - Preparado: se agrego prueba automatizada del playbook comercial para proteger los escenarios de aceptacion mientras se recopilan conversaciones reales.
  - Pendiente: revisar conversaciones reales desde admin IA y ajustar prompt/intenciones con evidencia de usuarios.

Verificacion realizada:

- `backend/server.js`: verificacion de sintaxis con `node --check`.
- `backend/chatCommercialPlaybook.js`: verificacion de sintaxis con `node --check`.
- `backend/test_chat_commercial_playbook.js`: prueba automatizada agregada y ejecutada correctamente.
- `src/components/AIAssistant/index.jsx`: ESLint ejecutado sin errores, solo warnings existentes de hooks.
- `src/app/admin/dashboard/page.jsx`: ESLint ejecutado sin errores.

Continuacion 2026-07-09:

- Corregido el orden de `classifyCommercialIntent` para que consultas como "cuanto cuesta una pagina web" entren por `faq_price` y usen la respuesta consultiva de precios.
- Ampliado `buildCommercialSnapshot` con senales comerciales de URL, presupuesto, urgencia y captacion de clientes.
- Actualizado el saludo inicial del backend para orientar al usuario por cotizacion nueva, mejora web, SEO/Google o WhatsApp.
- Agregado script `test:commercial` en `backend/package.json`.

## Hallazgos principales en `server.js`

### 1. El asistente ya tiene buena infraestructura, pero la conversacion esta demasiado orientada al cierre

El `SYSTEM_INSTRUCTION` define al asistente como experto en ventas digitales y contiene reglas correctas, pero empuja rapido hacia:

- elegir plan;
- preguntar por anticipo;
- pedir datos fiscales;
- generar link de pago.

Esto sirve para usuarios calientes, pero puede sentirse agresivo para usuarios que apenas estan explorando.

### 2. Las respuestas estaticas de precios son utiles para ahorrar tokens, pero venden demasiado pronto

`getStaticChatReply(message)` responde preguntas de precio listando planes base y anticipo. Esto reduce costos, pero salta una etapa importante: entender que quiere lograr el usuario.

Ejemplo actual:

- Usuario: "cuanto cuesta una pagina?"
- Asistente: lista Landing, Corporativo, Tienda, Software y anticipo.

Mejor enfoque:

- responder rango breve;
- explicar que depende del objetivo;
- hacer una pregunta simple para clasificar;
- solo listar planes completos si el usuario pide comparar opciones.
- mencionar descuentos de temporada cuando aplique a planes web.

### 3. No existe una capa explicita de intencion comercial

Actualmente hay reglas por palabras clave y un prompt general. Falta un modelo interno de:

- etapa del comprador;
- temperatura del lead;
- intencion principal;
- siguiente mejor accion.

Sin esa capa, el asistente no distingue bien entre:

- curioso frio;
- persona comparando precios;
- negocio con problema real;
- cliente listo para pagar;
- usuario que necesita soporte;
- proyecto complejo que necesita humano.

### 4. El flujo de pago deberia activarse solo con intencion clara

La herramienta `generarCobroCliente` esta bien restringida: solo cuando el cliente confirma que quiere empezar y entrega datos. Se recomienda mantener esa restriccion y reforzar el prompt para que el asistente no proponga pago antes de detectar compra explicita.

### 5. El saludo inicial es funcional, pero no orienta al usuario

El saludo actual dice que pregunte si necesita ayuda o un proyecto. Puede mejorar con opciones mas humanas:

- "Quiero cotizar una web"
- "Quiero mejorar mi pagina actual"
- "Quiero vender por internet"
- "Necesito un sistema/app"
- "Solo estoy comparando precios"
- "Quiero mejorar mi SEO o aparecer en Google"

Esto ayuda a clasificar sin hacer sentir al usuario interrogado.

### 6. Marketing, SEO y SEM deben entrar en la logica comercial del asistente

La pagina `marketing-para-tu-negocio` posiciona a Undercodeec como agencia de marketing digital y SEO. El asistente debe detectar consultas sobre:

- SEO;
- posicionamiento en Google;
- Google Ads;
- Meta Ads / Facebook Ads / Instagram Ads;
- SEM;
- marketing digital;
- redes sociales;
- captacion de clientes;
- campanas pagadas;
- aparecer primero en Google.

Regla comercial para SEO:

- No dar precio cerrado como si fuera un plan web.
- Explicar que depende del objetivo, competencia, estado actual del sitio y ciudad/mercado.
- Como base visible al publico, SEO basico puede iniciar desde $50 mensuales.
- La configuracion unica de SEO tambien tiene precio minimo definido desde $50, sin pagos recurrentes.
- Si el usuario pregunta por SEO con contexto claro, calificar primero: web actual, rubro, ciudad/pais, objetivo y si busca SEO organico o anuncios pagados.

Nota de alineacion: el texto oculto del home menciona "presupuestos desde 300 USD para SEO", mientras la decision comercial actual indica SEO basico desde $50 mensuales o configuracion unica. Antes de implementar cambios visibles o de prompt final, conviene unificar ese mensaje en el contenido del sitio.

### 7. Los precios del prompt viejo no coinciden completamente con los descuentos actuales del home

En `backend/server.js`, el prompt del asistente maneja precios base historicos:

- Landing Page: desde $250.
- Sitio Web Corporativo: desde $360.
- Tienda Online: desde $850.

En la seccion actual de planes del home, `src/components/Preview/InnerPages.jsx`, existen precios con descuento:

- Landing Page: 68% de descuento.
  - Landing Express: $80 antes $250.
  - Landing Estrategica: $192 antes $600.
  - Landing Premium: $480 antes $1500.
- Sitio Web: 67% de descuento.
  - Plan Lanzamiento: $120 antes $360.
  - Plan Crecimiento: $264 antes $800.
  - Plan Autoridad: $660 antes $2000.
- Tienda Online: 55% de descuento.
  - Tienda de Lanzamiento: $248 antes $550.
  - Tienda de Crecimiento: $383 antes $850.
  - Tienda Elite: $1571 antes $3490.

El asistente debe usar estos descuentos al hablar de precios web, pero sin lanzar toda la tabla al primer mensaje. Debe usarlos como gancho consultivo:

> Ahora mismo hay descuentos de temporada en planes web hasta finales de julio. Para no recomendarte algo que no necesitas, primero dime: buscas una pagina para captar contactos, un sitio con varias secciones o una tienda online?

Regla de vigencia:

- Los descuentos deben comunicarse como vigentes hasta finales de julio.
- No indicar un dia exacto si no se define una fecha operativa concreta en el sistema.
- Si el usuario pregunta hasta cuando aplica, responder: "hasta finales de julio".

## Investigacion aplicada

Se tomo como referencia literatura de diseno conversacional y buenas practicas comerciales:

- Estudios de diseno conversacional recomiendan respuestas claras, cooperativas y adaptadas al contexto del usuario, evitando conversaciones rigidas o repetitivas.
- La investigacion sobre escucha activa en chatbots muestra que comprender, reflejar y responder al texto libre del usuario mejora la calidad de la entrevista y la experiencia.
- El enfoque comercial recomendado es consultivo: primero diagnosticar necesidad, impacto y urgencia; despues recomendar; y solo cerrar cuando exista intencion suficiente.

Referencias:

- Towards User-Centric Guidelines for Chatbot Conversational Design: https://arxiv.org/abs/2301.06474
- If I Hear You Correctly: Building and Evaluating Interview Chatbots with Active Listening Skills: https://arxiv.org/abs/2002.01862
- How do you Converse with an Analytical Chatbot? Revisiting Gricean Maxims: https://arxiv.org/abs/2203.08420

## Principio comercial propuesto

Regla central:

> A menor claridad del usuario, mas diagnostico. A mayor intencion de compra, mas accion comercial.

Esto evita lanzar planes a todos por igual.

## Nuevo modelo de conversacion

### Etapa 1: Exploracion

Usuario frio o curioso.

Senales:

- "Estoy viendo opciones"
- "Quiero saber mas"
- "Cuanto cuesta una pagina?"
- "Que hacen?"

Respuesta recomendada:

- breve;
- sin tecnicismos;
- sin presionar compra;
- 1 pregunta de contexto.

Ejemplo:

> Si, te puedo orientar. Para darte una idea realista: ahora mismo hay descuentos de temporada y una landing puede iniciar desde $80, pero antes de recomendarte un plan necesito entender algo rapido: quieres una pagina para presentar tu negocio, vender productos o captar clientes por WhatsApp?

### Etapa 2: Diagnostico

Usuario ya cuenta una necesidad.

Senales:

- describe negocio;
- menciona problema actual;
- tiene una web vieja;
- quiere vender, captar clientes, automatizar o modernizar.

Respuesta recomendada:

- reflejar lo que entendimos;
- hacer 1 pregunta util;
- evitar explicar tecnologia salvo que el usuario la pida.

Ejemplo:

> Entiendo: necesitas que la web no sea solo presencia, sino que ayude a conseguir contactos. Para recomendarte bien, dime algo: hoy tus clientes llegan mas por redes, Google, referidos o WhatsApp?

### Etapa 3: Recomendacion suave

Usuario ya dio contexto suficiente.

Respuesta recomendada:

- recomendar 1 opcion principal;
- mencionar 1 alternativa si aplica;
- justificar con beneficio de negocio;
- precio "desde", no tabla completa;
- CTA liviano.

Ejemplo:

> Por lo que cuentas, te conviene empezar con una Landing Page orientada a conversion. Es mas directa que un sitio grande: presenta tu oferta, genera confianza y lleva al cliente a WhatsApp o formulario. En Undercodeec ahora hay descuentos de temporada y este tipo de proyecto puede iniciar desde $80. Si quieres, puedo ayudarte a definir que secciones deberia tener.

### Etapa 4: Captura de lead

Usuario muestra interes real, pero aun no esta listo para pagar.

Senales:

- pide cotizacion;
- pregunta tiempo;
- pregunta forma de pago;
- pregunta si pueden revisarlo;
- comparte URL;
- pide hablar con alguien;
- menciona presupuesto o fecha.

Respuesta recomendada:

- pedir datos minimos;
- explicar beneficio;
- no pedir RUC/cedula aun;
- activar lead calificado.

Ejemplo:

> Ya tengo una idea clara. Para que no se pierda el contexto y podamos darte una recomendacion mas precisa, dejame tu nombre y WhatsApp. Con eso un asesor puede continuar desde aqui sin hacerte repetir todo.

### Etapa 5: Cierre

Usuario confirma que quiere empezar.

Senales:

- "quiero iniciar"
- "como pago?"
- "generame el link"
- "empecemos"
- "acepto el plan"

Respuesta recomendada:

- confirmar plan;
- explicar anticipo;
- pedir datos fiscales y contacto;
- invocar `generarCobroCliente` solo cuando esten completos.

## Taxonomia de intenciones propuesta

Agregar una capa interna de intencion antes de decidir respuesta:

| Intencion | Ejemplos | Accion |
| --- | --- | --- |
| `faq_price` | precio, cuanto cuesta, planes | Rango breve + pregunta clasificadora |
| `exploring` | estoy viendo, quiero info | Orientar y preguntar objetivo |
| `new_project` | necesito una web/app/tienda | Diagnosticar negocio y meta |
| `redesign` | mejorar mi pagina, actualizar web | Seguir flujo de tecnologia y accesos |
| `ecommerce` | vender productos, tienda | Preguntar productos, pagos, envios |
| `seo_marketing` | SEO, Google, posicionamiento, anuncios, SEM | Diagnosticar objetivo y derivar a WhatsApp |
| `custom_software` | sistema, app, ERP, reservas, cursos | Derivar a levantamiento + WhatsApp |
| `human_handoff` | asesor, llamada, WhatsApp | Dar WhatsApp y guardar contexto |
| `purchase_ready` | quiero empezar, como pago | Pedir datos para cobro |
| `support_client` | ya pague, mi proyecto | Invitar a portal/soporte |
| `off_topic` | temas ajenos | Declinar y volver al negocio |

## Scoring de lead propuesto

Agregar score interno de 0 a 100. No mostrarlo al usuario.

Senales positivas:

- pide precio: +10
- describe negocio: +15
- comparte URL: +20
- menciona presupuesto: +20
- menciona fecha/urgencia: +15
- pide asesor/WhatsApp: +25
- deja contacto: +40
- dice que quiere iniciar: +50
- pregunta por SEO/SEM con negocio claro: +20
- pregunta por aparecer en Google o captar clientes: +20

Clasificacion:

- 0-20: visitante frio
- 21-45: interesado
- 46-70: lead calificado
- 71-100: oportunidad caliente

Uso recomendado:

- frio: educar y preguntar;
- interesado: diagnosticar;
- calificado: capturar nombre + WhatsApp + tipo de proyecto y derivar a ventas;
- caliente: preparar cierre o pago.

## Cambios tecnicos propuestos

### Fase 1: Prompt comercial consultivo

Modificar `SYSTEM_INSTRUCTION` para incluir:

- tono menos vendedor y mas asesor;
- voz premium consultiva;
- prohibicion de ofrecer pago antes de intencion clara;
- regla de una pregunta por turno;
- regla de no listar planes completos salvo que el usuario lo pida;
- respuestas en lenguaje no tecnico;
- uso de escucha activa: resumir brevemente lo que el usuario quiere antes de recomendar.
- prioridad comercial de WhatsApp como canal de conversion principal.
- horario comercial: ventas atiende por WhatsApp de 8:00 AM a 22:00 PM hora Ecuador.
- descuentos de temporada en planes web cuando se hable de precios.
- SEO/SEM como servicio propio, con diagnostico antes de precio.

No tocar:

- cuotas;
- login;
- portal;
- endpoints de auth;
- dashboard admin existente.

### Fase 2: Reescritura de plantillas estaticas

Actualizar `getStaticChatReply` para que las FAQs comerciales no sean cierres prematuros.

Cambios clave:

- `precio/planes`: responder con rangos cortos, mencionar descuentos de temporada y hacer pregunta de clasificacion.
- `whatsapp/asesor`: ofrecer WhatsApp, pero tambien resumir que datos conviene enviar.
- `pagos/anticipo`: explicar condiciones sin empujar a pago.
- `hosting/dominio`: explicar beneficio en lenguaje simple.
- `portafolio`: llevar a ejemplos y preguntar sector.
- `seo/marketing/sem/google ads`: responder como consultor, explicar que depende del objetivo y pedir contexto.

### Fase 3: Clasificador de intencion y etapa

Crear una funcion central:

```js
function classifyCommercialIntent({ message, history }) {
  return {
    intent: 'faq_price',
    stage: 'exploration',
    leadScoreDelta: 10,
    shouldUseStaticReply: true,
    shouldAskForLead: false,
    shouldOfferPayment: false
  };
}
```

Esta funcion puede iniciar con reglas simples y evolucionar despues a IA barata si hace falta.

Reglas iniciales recomendadas:

- Si menciona `seo`, `posicionamiento`, `aparecer en google`, `google ads`, `sem`, `meta ads`, `facebook ads`, clasificar como `seo_marketing`.
- Si menciona `precio`, `cuanto cuesta`, `planes`, clasificar como `faq_price`, pero no mostrar todos los planes todavia.
- Si menciona `whatsapp`, `asesor`, `llamada`, clasificar como `human_handoff`.
- Si menciona `quiero empezar`, `acepto`, `generame el link`, clasificar como `purchase_ready`.
- Si menciona `actualizar`, `redisenar`, `mejorar mi web`, clasificar como `redesign`.

### Fase 4: Estado conversacional por sesion

Guardar en `chat_sessions` o en metadata asociada:

- ultima intencion;
- etapa comercial;
- score acumulado;
- servicio probable;
- resumen breve;
- siguiente accion sugerida.

Si no se quiere tocar esquema al inicio, se puede guardar en `chat_usage.metadata` o recalcular desde los ultimos mensajes.

### Fase 5: Resumen comercial para admin

En la pestana IA del admin, mostrar:

- temperatura: frio / interesado / calificado / caliente;
- servicio probable;
- problema principal;
- presupuesto si fue mencionado;
- urgencia si fue mencionada;
- proxima accion recomendada.

Esto convierte conversaciones en oportunidades accionables.

### Fase 6: Banco de respuestas por etapa

Crear un playbook de respuestas reutilizables:

- exploracion;
- diagnostico;
- recomendacion;
- captura de lead;
- handoff humano;
- cierre;
- soporte cliente.

Puede vivir inicialmente en `server.js`, pero lo recomendable es moverlo despues a un archivo separado, por ejemplo:

`backend/chatCommercialPlaybook.js`

## Ejemplos de respuestas maduras

### Pregunta de precio fria

Usuario:

> Cuanto cuesta una pagina web?

Respuesta:

> Depende de lo que necesites lograr. Como referencia, ahora hay descuentos de temporada: una landing puede iniciar desde $80 y un sitio con varias secciones desde $120.
>
> Para orientarte bien: quieres una pagina para presentar tu negocio, captar clientes por WhatsApp o vender productos?

### Usuario comparando opciones

Usuario:

> Solo estoy viendo precios.

Respuesta:

> Perfecto, te doy una guia rapida sin compromiso. Si buscas presencia basica, normalmente conviene una landing. Si tienes varios servicios o necesitas mas informacion organizada, conviene un sitio corporativo. Si vas a vender productos con pagos en linea, ya hablamos de tienda online.
>
> Que tipo de negocio tienes?

### Usuario con necesidad real

Usuario:

> Tengo una peluqueria y quiero que me escriban mas por WhatsApp.

Respuesta:

> Tiene sentido. En tu caso no empezaria con una web grande, sino con una pagina enfocada en confianza y contacto: servicios, fotos, ubicacion, testimonios y boton directo a WhatsApp.
>
> Para afinar la recomendacion: ya tienes fotos y redes activas, o tambien necesitas ayuda con ese contenido?

### Usuario listo para comprar

Usuario:

> Me interesa, quiero empezar.

Respuesta:

> Perfecto. Para iniciar manejamos el 50% de anticipo y el saldo contra entrega. Si quieres generar el pedido, necesito estos datos:
>
> - Nombre o razon social
> - Cedula o RUC
> - Correo
> - Telefono

### Usuario pregunta por SEO

Usuario:

> Quiero que mi pagina aparezca mejor en Google.

Respuesta:

> Si, eso entra en SEO. Antes de darte un valor cerrado necesito entender el punto de partida: no cuesta lo mismo configurar lo basico de una web que competir por palabras clave fuertes.
>
> Como referencia publica, un SEO basico puede iniciar desde $50 mensuales. Tambien existe configuracion unica desde $50 si solo necesitas dejar la base tecnica lista sin mensualidad. Para orientarte bien: ya tienes pagina web publicada y en que ciudad o mercado quieres posicionarte?

### Usuario pregunta por anuncios

Usuario:

> Ustedes hacen Google Ads?

Respuesta:

> Si, trabajamos SEM y campanas pagadas como Google Ads y Meta Ads. La recomendacion depende de que quieres conseguir: mensajes por WhatsApp, formularios, ventas o visitas a una ubicacion.
>
> Que tipo de negocio quieres promocionar y cual seria tu objetivo principal?

## Pruebas de aceptacion conversacional

Antes de implementar, probar estos escenarios:

1. Usuario pregunta precio sin contexto.
   - Esperado: no listar todos los planes completos; dar rango breve y preguntar objetivo.

2. Usuario dice que solo esta comparando.
   - Esperado: tono tranquilo, sin presion de pago.

3. Usuario describe negocio y objetivo.
   - Esperado: reflejar necesidad y hacer una pregunta util.

4. Usuario comparte URL.
   - Esperado: usar `analizarSitioWeb` y recomendar sin tecnicismos excesivos.

5. Usuario pide WhatsApp.
   - Esperado: entregar boton, mencionar horario 8:00 AM a 22:00 PM Ecuador y sugerir enviar nombre + tipo de proyecto.

6. Usuario dice "quiero empezar".
   - Esperado: pedir datos para pago; no pedirlos antes.

7. Usuario pregunta algo ajeno.
   - Esperado: declinar y volver a Undercodeec.

8. Usuario ya pago o es cliente.
   - Esperado: orientar al portal o soporte, no venderle otro plan de inmediato.

9. Usuario pregunta por SEO.
   - Esperado: explicar que depende del objetivo, mencionar base desde $50 mensuales o configuracion unica, y preguntar web actual + mercado.

10. Usuario pregunta por Google Ads o SEM.
   - Esperado: diferenciar anuncios pagados de SEO organico en lenguaje simple y preguntar objetivo de campana.

## Prioridad recomendada

1. Reescribir `SYSTEM_INSTRUCTION` con flujo consultivo.
2. Reescribir `getStaticChatReply` para evitar venta prematura.
3. Sincronizar precios web del asistente con descuentos actuales del home.
4. Agregar intencion `seo_marketing` y respuestas para SEO/SEM.
5. Agregar `classifyCommercialIntent`.
6. Agregar lead score interno por sesion.
7. Mostrar temperatura y resumen comercial en admin.
8. Mover playbook conversacional a archivo separado.
9. Medir conversion por etapa y ajustar prompts.

## Preguntas respondidas y criterios finales

1. Conversion principal: WhatsApp.
2. Tono: premium consultivo.
3. Precio: rangos primero, calificacion antes de listar o cerrar.
4. Lead minimo: nombre + WhatsApp + tipo de proyecto.
5. Servicios: web, ecommerce, software, apps, redisenos, mantenimiento, marketing digital, SEO y SEM.
6. Seguimiento: departamento de ventas por WhatsApp, 8:00 AM a 22:00 PM hora Ecuador.
7. Pago directo: solo con usuario totalmente decidido.
8. SEO desde $50 aplica como precio publico visible.
9. Configuracion unica de SEO tiene precio minimo definido desde $50.
10. Descuentos de temporada vigentes hasta finales de julio.
11. El link de WhatsApp debe cambiar el texto segun el servicio detectado.

## Textos dinamicos para WhatsApp

El asistente debe generar enlaces de WhatsApp con mensaje distinto segun la intencion detectada. Todos deben conservar el numero comercial:

`https://wa.me/593979046329`

### Web / Landing Page

Texto:

> Hola, vengo del asistente IA de Undercodeec. Quiero cotizar una pagina web o landing page. Mi nombre es {NOMBRE} y mi proyecto es: {TIPO_PROYECTO}.

### Sitio corporativo

Texto:

> Hola, vengo del asistente IA de Undercodeec. Quiero cotizar un sitio web corporativo para mi negocio. Mi nombre es {NOMBRE}. Tipo de proyecto: {TIPO_PROYECTO}.

### Tienda online

Texto:

> Hola, vengo del asistente IA de Undercodeec. Quiero cotizar una tienda online. Mi nombre es {NOMBRE}. Tipo de productos o negocio: {TIPO_PROYECTO}.

### Software a medida / app / sistema

Texto:

> Hola, vengo del asistente IA de Undercodeec. Quiero hablar sobre un software, app o sistema a medida. Mi nombre es {NOMBRE}. Tipo de proyecto: {TIPO_PROYECTO}.

### SEO / Marketing digital / SEM

Texto:

> Hola, vengo del asistente IA de Undercodeec. Quiero informacion sobre SEO, marketing digital o anuncios. Mi nombre es {NOMBRE}. Objetivo: {TIPO_PROYECTO}.

### Rediseno o mejora de web existente

Texto:

> Hola, vengo del asistente IA de Undercodeec. Necesito mejorar o redisenar mi sitio web actual. Mi nombre es {NOMBRE}. Detalle del proyecto: {TIPO_PROYECTO}.

### Consulta general

Texto:

> Hola, vengo del asistente IA de Undercodeec. Quiero que un asesor me ayude con mi proyecto. Mi nombre es {NOMBRE}. Tipo de proyecto: {TIPO_PROYECTO}.

Regla de implementacion:

- Si el usuario no ha dado nombre, usar "No indicado" o pedir nombre antes de generar el enlace cuando la conversacion ya tenga interes real.
- Si no hay tipo de proyecto claro, usar "Consulta general" y pedir que el usuario complete el detalle en WhatsApp.
- Los mensajes deben URL-encodearse al construir el enlace final.

## Decision recomendada

Mantener la infraestructura actual y trabajar sobre la madurez conversacional.

La ruta mas segura es:

1. diagnosticar antes de vender;
2. recomendar una opcion, no lanzar todos los planes;
3. capturar nombre + WhatsApp + tipo de proyecto cuando hay interes real;
4. derivar a humano cuando el proyecto se vuelve complejo;
5. generar cobro solo cuando el usuario confirma que quiere iniciar.

Con esto el asistente deja de comportarse como una tabla de precios con checkout y pasa a funcionar como un asesor comercial que califica, educa y convierte.
