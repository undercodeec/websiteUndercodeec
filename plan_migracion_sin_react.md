# Plan de migración visual y retiro completo de React

**Proyecto:** Undercodeec  
**Fecha:** 13 de septiembre de 2026  
**Estado:** propuesta para revisión  
**Documento de origen:** `implementation_plan.md`

## 1. Decisión de arquitectura

El sitio no puede dejar de usar React y continuar ejecutándose sobre Next.js: Next.js es un framework basado en React. Por ello, la salida se realizará en dos hitos independientes y verificables:

1. **Hito A — sitio público sin React:** reconstruir las páginas comerciales con Astro, HTML semántico, CSS propio y TypeScript/JavaScript nativo.
2. **Hito B — repositorio sin React:** migrar portal, CRM, contratos, resultado de pago y el proxy de Hermes; retirar después Next.js, React y todas sus dependencias.

No se hará una reescritura simultánea de todo el producto. Next seguirá funcionando únicamente como sistema legado durante la transición y dejará de recibir nuevas páginas públicas.

### Stack objetivo

- **Sitio público:** Astro con salida estática por defecto.
- **Operaciones:** Astro en modo SSR para las rutas autenticadas, usando TypeScript y componentes web nativos cuando se necesite estado en el navegador.
- **Interactividad pública:** módulos TypeScript pequeños, CSS y APIs nativas del navegador.
- **Animación:** CSS, GSAP/ScrollTrigger y Three.js directo solo donde aporten valor; sin adaptadores para React.
- **Contenido:** colecciones de Astro, Markdown/MDX sin componentes React y archivos JSON tipados.
- **API:** el backend Express existente seguirá siendo la única API de negocio.
- **Entrega:** Nginx servirá el sitio estático, dirigirá las rutas operativas al servidor Astro SSR y `/api/` al backend Express.

Astro no debe instalar ninguna integración de React. Si una interacción operativa resulta demasiado compleja para JavaScript nativo, se deberá aprobar explícitamente una alternativa que no dependa de React; no se incorporará de forma implícita durante la migración.

## 2. Objetivo y definición de terminado

El objetivo visual es aplicar a todo el contenido público el lenguaje de `public/landing-primary`: tipografía, escala, cuadrícula, contraste, ritmo, movimiento, navegación, tarjetas, llamadas a la acción y tratamiento multimedia. Esa carpeta será una **referencia visual**, no una dependencia de producción.

La migración estará completa cuando:

- todas las URL vigentes respondan con el contenido, metadata y comportamiento acordados;
- el sitio público y las aplicaciones operativas no importen React ni Next;
- no existan `react`, `react-dom`, `next`, `eslint-config-next` ni paquetes `*-react` en los manifiestos o el lockfile de producción;
- `pnpm -r why react`, `pnpm -r why react-dom` y `pnpm -r why next` no encuentren dependencias;
- no exista salida `/_next/`, proceso `next start`, configuración `next.config.ts` ni código activo JSX/TSX;
- Nginx no tenga un `nextjs_upstream`;
- el sitio pase las pruebas funcionales, visuales, de accesibilidad, SEO y rendimiento definidas en este documento;
- `public/landing-primary` pueda eliminarse sin cambiar el resultado del nuevo sitio.

## 3. Línea base encontrada

El inventario inicial del repositorio muestra:

- Next.js `16.1.2`, React `19.2.3` y React DOM `19.2.3` en la aplicación raíz.
- 28 archivos de página y 17 layouts bajo `src/app`.
- 98 archivos con directiva `"use client"`, además de variantes con comillas simples.
- la portada `/` y `/demos` se reescriben actualmente hacia `public/landing-primary/index.html` desde `next.config.ts`;
- el layout raíz carga estilos, scripts y compatibilidad histórica de forma global;
- `public` contiene aproximadamente 198 MB en `assets`, 133 MB en `modelo-3D` y 35 MB en `landing-preview`;
- `landing-primary` pesa aproximadamente 4.4 MB en su estado actual, pero se regenera mediante `scripts/offbrand-demo/prepare.mjs`;
- `demo-local.js` corrige y reemplaza contenido después de cargar el HTML, lo que no debe trasladarse al nuevo sitio;
- el backend Express ya contiene pagos, contacto, recursos humanos, autenticación, portal, CRM, facturación, chat y Hermes;
- existe una sola ruta de API en Next (`/api/hermes/[...path]`) que actúa como proxy y debe moverse a Express o Nginx.

Las cifras son una línea base, no un criterio de alcance cerrado. La fase 0 debe producir un inventario reproducible y guardado en el repositorio.

## 4. Alcance de rutas

### Grupo 1 — contenido público

| Ruta actual | Destino | Tratamiento |
|---|---|---|
| `/` | `apps/web` | Portada piloto y referencia principal del sistema visual |
| `/demos` | `apps/web` | Confirmar si se conserva, se renombra o redirige |
| `/servicios` | `apps/web` | Segunda página piloto; valida componentes reutilizables |
| `/contacto` | `apps/web` | Formulario conectado a Express y reCAPTCHA |
| `/nuestra-trayectoria` | `apps/web` | Contenido editorial |
| `/aplicaciones-moviles` | `apps/web` | Página de servicio |
| `/software-para-tu-negocio` | `apps/web` | Página de servicio |
| `/marketing-para-tu-negocio` | `apps/web` | Página de servicio y formulario |
| `/hosting` | `apps/web` | Página de servicio |
| `/recursos-humanos` | `apps/web` | Formulario, adjuntos y reCAPTCHA |
| `/blog` y `/blog/[slug]` | `apps/web` | Colección de contenido y rutas estáticas |
| `/noticias` | `apps/web` | Unificar con blog o conservar según auditoría SEO |
| `/politicas-playconsole` | `apps/web` | Documento legal estático |
| `/ec`, `/es`, `/undercodeec` | `apps/web` | Auditar duplicados, canonicales e intención regional |
| `404` | `apps/web` | Página estática consistente con el nuevo diseño |

### Grupo 2 — funciones públicas transaccionales

| Ruta actual | Destino | Riesgo principal |
|---|---|---|
| `/contratos` | `apps/operations` o página SSR aislada | Wizard, validación y generación de PDF |
| `/pago/resultado` | `apps/operations` | Consulta y representación segura del estado de pago |
| `/portal` | `apps/operations` | Sesión, pedidos, conversaciones y recuperación de cuenta |

### Grupo 3 — administración

Migrar a `apps/operations` manteniendo inicialmente sus URL:

- `/admin/crm/login`
- `/admin/crm`
- `/admin/crm/leads`
- `/admin/crm/leads/[id]`
- `/admin/crm/inbox`
- `/admin/crm/campanas`
- `/admin/crm/campanas/[id]`
- `/admin/crm/administracion`
- las redirecciones antiguas de `/admin` y `/admin/dashboard`

### Grupo 4 — API

- El backend Express permanece en `backend/`.
- `/api/hermes/[...path]` deja de depender de Next y pasa a Express o a una regla controlada de Nginx.
- No se duplicará lógica de pagos, autenticación, CRM o correo dentro de Astro.

## 5. Arquitectura de carpetas propuesta

```text
undercodeec_nextjs/
├── apps/
│   ├── web/                         # Astro estático: contenido público
│   │   ├── astro.config.mjs
│   │   ├── public/
│   │   └── src/
│   │       ├── components/
│   │       │   ├── global/
│   │       │   ├── sections/
│   │       │   └── ui/
│   │       ├── content/
│   │       │   ├── blog/
│   │       │   ├── pages/
│   │       │   ├── projects/
│   │       │   └── services/
│   │       ├── layouts/
│   │       ├── pages/
│   │       ├── scripts/
│   │       │   ├── analytics/
│   │       │   ├── animations/
│   │       │   ├── forms/
│   │       │   └── navigation/
│   │       └── styles/
│   └── operations/                  # Astro SSR: portal, pagos y CRM
│       └── src/
│           ├── components/
│           ├── layouts/
│           ├── lib/
│           ├── pages/
│           ├── scripts/
│           └── styles/
├── packages/
│   ├── design-system/               # Tokens, fuentes, iconos y CSS compartido
│   ├── schemas/                     # Esquemas y tipos de datos compartidos
│   └── api-client/                  # Cliente HTTP sin dependencia de UI
├── backend/                         # Express existente
├── reference/
│   └── landing-primary/             # Capturas, inventario y notas; no se publica
└── legacy-next/                     # Solo durante la transición; no es destino final
```

No se moverá físicamente `src/` a `legacy-next/` al inicio. Primero se crearán las aplicaciones nuevas; la reubicación o eliminación del legado se hará cuando reduzca riesgo y no mientras existan cambios locales sin integrar.

El `pnpm-workspace.yaml` deberá incluir `apps/*` y `packages/*`. Los comandos raíz deberán poder construir y probar cada aplicación de forma independiente.

## 6. Sistema visual basado en `landing-primary`

### 6.1 Referencia, no dependencia

Antes de implementar se debe congelar una referencia reproducible:

- guardar el origen exacto o commit usado para generar `landing-primary`;
- capturar la página completa a 1440, 768 y 390 px;
- grabar las interacciones de cursor, menú, preloader, scroll y secciones animadas;
- inventariar fuentes, colores, tamaños, espacios, bordes, capas, velocidades y curvas;
- registrar qué elementos son propios de Undercodeec y cuáles proceden de la exportación externa;
- confirmar licencias de fuentes, imágenes, CSS, scripts y diseño antes de reutilizarlos.

No se editará manualmente `public/landing-primary`, porque `prepare.mjs` puede regenerarla. Tampoco se importarán en producción su HTML, CSS minificado, jQuery, el runtime de Webflow ni scripts minificados de procedencia externa.

### 6.2 Capas de CSS nuevas

El CSS propio se organizará por responsabilidad:

```text
styles/
├── reset.css
├── tokens.css             # color, tipografía, espacio, grid, motion, z-index
├── fonts.css
├── base.css               # body, headings, enlaces, medios y formularios
├── layout.css             # contenedores, grid y flujo vertical
├── utilities.css          # utilidades pequeñas y documentadas
├── components/            # header, botones, tarjetas, footer, modal, formularios
├── sections/              # excepciones específicas de una sección
└── accessibility.css      # focus, reduced-motion y ayudas visuales
```

Reglas:

- no cargar Bootstrap, Tailwind ni `src/styles/globals.css` en las nuevas aplicaciones;
- no copiar todo el CSS exportado para después sobrescribirlo;
- convertir valores repetidos a variables CSS con nombres semánticos;
- mantener el DOM semántico aunque la referencia use contenedores genéricos;
- usar clases de componente y estados explícitos; evitar selectores dependientes de posiciones o IDs exportados;
- reservar estilos inline para valores realmente calculados;
- documentar cada excepción visual que no pertenezca al sistema reutilizable.

### 6.3 Movimiento e interacción

- Cada módulo tendrá `init()` y `destroy()` idempotentes.
- Las animaciones se activarán por atributos `data-*`, no por estructura accidental del DOM.
- Se implementará primero una navegación de carga completa; las transiciones SPA de Astro solo se evaluarán cuando todos los módulos limpien correctamente sus listeners.
- `prefers-reduced-motion` tendrá una experiencia completa, no solo duraciones reducidas.
- El preloader nunca bloqueará contenido, navegación ni indexación y tendrá un tiempo máximo de liberación.
- Three.js, HLS y animaciones pesadas se cargarán bajo demanda y solo en las rutas que los usan.
- jQuery y el runtime de Webflow no formarán parte del destino final.

## 7. Sustitución de dependencias React/Next

| Dependencia o patrón actual | Reemplazo previsto |
|---|---|
| `next/link` | enlaces HTML normales y utilidades de URL |
| `next/image` | `astro:assets` y `Image`/`Picture` de Astro |
| `next/font` | archivos propios y `@font-face` |
| `next/script` | scripts Astro con carga explícita |
| Metadata, sitemap y robots de Next | `Astro.props`, layouts, integración sitemap y archivos Astro |
| Hooks de React | estado local en módulos TS, eventos y componentes web |
| Framer Motion | CSS o GSAP según complejidad |
| React Three Fiber/Drei | Three.js directo, con carga diferida |
| `lucide-react` y `react-icons` | SVGs accesibles o sprite de iconos |
| `react-calendly` | iframe diferido de Calendly |
| `react-ga4` | `gtag`/Google Tag Manager con consentimiento |
| `react-modal-video` | `<dialog>` accesible y API de video |
| `react-scroll` | anclas, `scrollIntoView` y CSS |
| `react-slick`/wrappers | scroll-snap o librería sin adaptador React |
| `html2pdf.js` desde componentes React | módulo TS aislado o generación de PDF en backend |
| ruta API de Next para Hermes | proxy en Express/Nginx con lista permitida |

La sustitución no consiste en traducir JSX línea por línea. Primero se extraen datos, reglas de negocio y contratos HTTP; después se reconstruye la vista con el nuevo sistema.

## 8. Plan por fases y puertas de calidad

### Fase 0 — auditoría y congelación

**Trabajo**

- [ ] Generar inventario de rutas con URL, título, canonical, estado HTTP y responsable.
- [ ] Identificar redirecciones, páginas duplicadas y rutas que no deben indexarse.
- [ ] Inventariar formularios y endpoints, campos, archivos, cookies, CORS y reCAPTCHA.
- [ ] Inventariar los recursos realmente usados desde HTML, CSS y JavaScript.
- [ ] Registrar peso, dimensiones, formato, licencia y propietario de cada recurso.
- [ ] Capturar referencias visuales e interacciones.
- [ ] Añadir pruebas smoke del sitio actual para disponer de una red de seguridad.
- [ ] Acordar qué hacer con `/demos`, `/ec`, `/es`, `/undercodeec`, `/noticias` y `/blog`.

**Entregables**

- `docs/migration/route-inventory.csv`
- `docs/migration/integration-inventory.md`
- `docs/migration/asset-inventory.csv`
- capturas y grabaciones de referencia
- matriz de redirects y canonicales aprobada

**Puerta:** no comienza la migración masiva hasta poder explicar el destino de cada ruta, integración y activo.

### Fase 1 — monorepo y esqueleto Astro

**Trabajo**

- [ ] Crear `apps/web`, `apps/operations` y los paquetes compartidos.
- [ ] Configurar aliases, TypeScript estricto, lint, formato, pruebas y variables de entorno.
- [ ] Definir contratos de variables públicas y privadas; no exponer secretos con prefijos públicos.
- [ ] Crear layouts base, manejo de errores y página 404.
- [ ] Añadir comandos raíz `dev`, `build`, `lint`, `test` y `test:e2e` por filtro.
- [ ] Configurar una preview independiente sin cambiar todavía producción.

**Puerta:** ambos proyectos construyen en CI y una página de prueba se publica sin React ni recursos del legado.

### Fase 2 — sistema visual y catálogo de componentes

**Trabajo**

- [ ] Extraer tokens visuales de `landing-primary`.
- [ ] Implementar reset, fuentes, grid, contenedores y ritmo vertical.
- [ ] Crear header, navegación, footer, botones, etiquetas, tarjetas, campos, modales y estados.
- [ ] Crear una página interna de catálogo para revisar componentes y responsive.
- [ ] Implementar focus visible, teclado, contraste y reduced motion desde el comienzo.

**Puerta:** el catálogo está aprobado a 1440, 768 y 390 px y no importa CSS del proyecto Next ni de Webflow.

### Fase 3 — pilotos `/` y `/servicios`

**Portada**

- [ ] Renderizar textos, proyectos, herramientas, marcas y enlaces directamente desde datos.
- [ ] Reemplazar las mutaciones de `demo-local.js` por HTML generado en servidor/build.
- [ ] Reimplementar menú, cursor, preloader, video, scroll y animaciones como módulos propios.
- [ ] Optimizar y copiar únicamente los medios utilizados.

**Servicios**

- [ ] Extraer el contenido actual sin importar sus componentes React.
- [ ] Construir secciones reutilizables que sirvan a las demás páginas de servicio.
- [ ] Validar que el lenguaje visual funciona con contenido más largo y distinto al de la portada.

**Puerta:** paridad visual aprobada, navegación y enlaces reales funcionales, cero errores de consola y ninguna solicitud a `/landing-primary/`.

### Fase 4 — resto del contenido público

Orden sugerido:

1. contacto y trayectoria;
2. aplicaciones móviles, software, marketing y hosting;
3. recursos humanos;
4. blog, detalle de blog y noticias;
5. políticas y variantes regionales;
6. 404, sitemap, robots y redirects.

Para cada ruta:

- [ ] extraer contenido y metadata;
- [ ] mapearla a componentes existentes antes de crear otros;
- [ ] seleccionar y optimizar activos;
- [ ] conectar formularios si aplica;
- [ ] añadir prueba visual, funcional, SEO y accesible;
- [ ] registrar redirects si la URL cambia.

**Puerta del Hito A:** todas las rutas públicas funcionan en preview; un rastreo no encuentra enlaces rotos ni dependencias React; el negocio aprueba el cambio de `www`.

### Fase 5 — corte del sitio público

- [ ] Publicar `apps/web` en `v2.undercodeec.com` o un entorno equivalente.
- [ ] Ejecutar smoke tests contra preview con servicios reales controlados.
- [ ] Preparar reglas Nginx por host o por grupo de rutas.
- [ ] Reducir TTL antes del corte si hay cambio DNS.
- [ ] Cambiar `www` a Astro y mantener las rutas operativas en Next temporalmente.
- [ ] Monitorear 404, 5xx, Core Web Vitals, formularios y conversiones.
- [ ] Conservar rollback inmediato hacia la versión Next anterior.

**Puerta:** el sitio público opera estable durante el periodo acordado; el Hito A se declara cerrado, pero React todavía no se considera retirado del repositorio.

### Fase 6 — contratos, pagos y portal

**Contratos**

- [ ] Separar esquema de datos, validaciones y textos legales de la UI React.
- [ ] Reconstruir el wizard con formularios nativos y estado serializable.
- [ ] Decidir si el PDF se genera en navegador o en Express; preferir backend si debe ser auditable o idéntico entre navegadores.
- [ ] Añadir pruebas con datos mínimos, inválidos y completos.

**Pagos**

- [ ] Mantener el backend como autoridad del estado de transacción.
- [ ] No confiar en parámetros de URL para declarar un pago exitoso.
- [ ] Probar pendiente, aprobado, rechazado, expirado, repetido y error de red.

**Portal**

- [ ] Migrar login, registro, verificación, recuperación y cierre de sesión.
- [ ] Migrar pedidos, sesiones y mensajes.
- [ ] Verificar cookies, `SameSite`, CORS, expiración y refresco de sesión entre dominios.
- [ ] Añadir pruebas E2E de los flujos críticos.

**Puerta:** las tres áreas funcionan sin React en producción controlada y cuentan con rollback por ruta.

### Fase 7 — CRM y administración

Migrar por módulos, no por componentes:

1. sesión y shell de administración;
2. resumen y administración/facturación;
3. listado y detalle de leads;
4. inbox y conversaciones;
5. campañas, carga CSV, multimedia y acciones;
6. redirects de rutas antiguas.

Antes de cambiar cada módulo:

- [ ] congelar su contrato HTTP con pruebas;
- [ ] conservar estados de carga, vacío, error, éxito y permisos;
- [ ] probar navegación por teclado, tablas y formularios;
- [ ] validar acciones destructivas y reintentos;
- [ ] registrar auditoría y errores sin exponer datos sensibles.

**Puerta:** todas las tareas CRM críticas tienen prueba E2E, la aplicación Next no recibe tráfico operativo y el proxy Hermes ya no depende de Next.

### Fase 8 — retiro de React y limpieza final

- [ ] Retirar rutas Nginx dirigidas a Next y el servicio `next start`.
- [ ] Eliminar los paquetes React/Next y adaptadores `*-react` de todos los manifiestos.
- [ ] Eliminar código JSX/TSX y configuración exclusiva de Next.
- [ ] Eliminar CSS, datos y activos huérfanos solo después de verificar referencias.
- [ ] Retirar `public/landing-primary`, `landing-preview` y exportaciones de referencia del artefacto de producción.
- [ ] Regenerar el lockfile y ejecutar `pnpm -r why` para probar la ausencia de React.
- [ ] Actualizar README, CI/CD, Nginx, monitoreo, backups y manuales operativos.
- [ ] Crear tag Git de la última versión React para recuperación histórica.

**Puerta del Hito B:** se cumplen todos los puntos de la definición de terminado y no existe tráfico, build ni dependencia residual de Next/React.

## 9. Migración de contenido y activos

### Contenido

La fuente temporal será `src/app`, `src/components`, `src/data`, los Markdown existentes y las modificaciones declaradas en `demo-local.js`. Para cada página se creará un modelo con:

- slug y estado de publicación;
- SEO: título, descripción, canonical, Open Graph y robots;
- encabezado, secciones, CTAs y enlaces;
- recursos con texto alternativo, crédito y licencia;
- datos estructurados cuando correspondan.

No se permitirá leer contenido en producción desde archivos dentro de `src` del legado.

### Activos

- Copiar solo archivos presentes en el inventario de uso.
- Generar tamaños adecuados y formatos AVIF/WebP cuando sean compatibles.
- Mantener SVG para iconos y gráficos apropiados.
- Definir póster y fallback para cada video.
- Cargar 3D, video y HLS únicamente al entrar en la sección o por intención del usuario.
- Aplicar hash a recursos cacheables y conservar nombres legibles en la fuente.
- Establecer presupuestos por plantilla antes de implementar, usando la medición actual como línea base.

## 10. Integraciones que requieren pruebas explícitas

- formulario de contacto: `/api/send-contact`;
- solicitud de marketing: `/api/send-marketing`;
- candidatura de RR. HH.: `/api/send-hr-application`;
- cotizaciones y solicitudes de software/web/móvil/Moodle;
- creación, consulta y confirmación de pagos;
- carga de comprobantes y correos de pedido;
- autenticación y recuperación del portal;
- chat, TTS, leads y asistente Hermes;
- CRM, facturación, inbox, leads y campañas;
- Calendly, reCAPTCHA y analítica.

Cada integración deberá tener documentados endpoint, método, esquema, autenticación, cookies, política CORS, rate limit, estado de error y responsable. Las URL del backend no se repetirán en componentes; saldrán de una configuración validada y de un cliente HTTP compartido.

## 11. Estrategia de pruebas

### Automatizadas

- unitarias para transformaciones, validaciones y estado;
- contratos HTTP contra el backend;
- integración para formularios, archivos, cookies y errores;
- E2E con Playwright para navegación, contacto, RR. HH., contratos, pagos, portal y CRM;
- rastreo de enlaces, recursos, canonicales, sitemap y redirects;
- análisis estático que prohíba imports de React/Next en las aplicaciones nuevas;
- auditoría de dependencias y lockfile.

### Visuales

- capturas estables a 1440, 768 y 390 px;
- capturas con movimiento deshabilitado para diffs reproducibles;
- revisión manual separada de scroll, cursor, video, menú y animaciones;
- golden snapshots aprobados por ruta, sin exigir igualdad de píxel cuando cambie la rasterización de fuente o video;
- pruebas entre Chromium, Firefox y WebKit para las rutas críticas.

### Accesibilidad, SEO y rendimiento

- cero errores críticos de accesibilidad automatizados;
- recorrido completo por teclado y foco visible;
- jerarquía de encabezados y landmarks semánticos;
- `prefers-reduced-motion`, contraste y mensajes de error asociados a campos;
- títulos, descripciones, canonicales, Open Graph, sitemap, robots y datos estructurados;
- objetivos de Core Web Vitals: LCP menor de 2.5 s, CLS menor de 0.1 e INP menor de 200 ms en condiciones acordadas;
- presupuesto de JavaScript por plantilla y carga diferida de librerías pesadas.

## 12. Publicación, convivencia y rollback

Durante la transición:

```text
www.undercodeec.com        -> Astro público cuando cierre el Hito A
admin.undercodeec.com      -> Operations SSR o ruta temporal en Next
cuenta.undercodeec.com     -> Operations SSR, si se separa el portal
api.undercodeec.com        -> Express
legacy.undercodeec.com     -> acceso restringido y temporal para comparación
```

Si se deben conservar las URL operativas en el mismo dominio, Nginx puede dirigir `/admin/**`, `/portal`, `/contratos` y `/pago/resultado` al runtime correspondiente. Esta convivencia debe probar cookies, CORS y cabeceras de proxy antes del corte.

Cada publicación deberá ser un artefacto versionado e inmutable. El rollback será cambiar el upstream o symlink al artefacto anterior; no se reconstruirá durante una incidencia. Los cambios de base de datos o API deberán ser compatibles hacia atrás mientras convivan ambos frontends.

## 13. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Copiar código o activos sin derechos claros | auditoría de licencia y reconstrucción propia antes de publicar |
| Perder fidelidad al retirar Webflow/jQuery | capturas, grabaciones, catálogo y pilotos antes de migrar en masa |
| Duplicar lógica de negocio al traducir componentes | extraer esquemas, API y reglas antes de reconstruir la UI |
| Mantener React indefinidamente en el CRM | Hito B, propietario y puerta de retiro explícitos |
| Romper SEO por cambios de rutas | inventario, canonicales, redirects y rastreo pre/post corte |
| Romper autenticación al separar dominios | diseño temprano de cookies, CORS y sesión; pruebas E2E reales |
| Arrastrar cientos de MB de activos | inventario de uso, presupuestos y fallo de CI ante recursos huérfanos |
| Animaciones que bloquean o se duplican | módulos idempotentes, cleanup, reduced motion y carga completa inicial |
| Regresiones en pagos | backend como autoridad, idempotencia y matriz de estados |
| Mezclar cambios locales existentes con la migración | commits pequeños, ramas por fase y no mover el legado al comienzo |

## 14. Secuencia de entregas recomendada

1. **Entrega 0:** inventarios y decisión de rutas.
2. **Entrega 1:** monorepo, CI y preview Astro.
3. **Entrega 2:** tokens y catálogo visual.
4. **Entrega 3:** portada.
5. **Entrega 4:** servicios.
6. **Entrega 5:** resto del sitio comercial.
7. **Entrega 6:** corte de `www` y cierre del Hito A.
8. **Entrega 7:** contratos, pagos y portal.
9. **Entrega 8:** CRM y administración.
10. **Entrega 9:** retiro de Next/React y cierre del Hito B.

Cada entrega debe ser pequeña, desplegable, reversible y cerrar sus propias pruebas. No se eliminará el sistema anterior hasta que el tráfico del grupo migrado haya pasado a la nueva aplicación y exista una versión estable para rollback.

## 15. Primer bloque ejecutable

El primer bloque de implementación, una vez aprobado este plan, será únicamente:

1. crear los tres inventarios de la fase 0;
2. capturar la referencia visual;
3. resolver el destino de las seis rutas duplicadas o ambiguas;
4. crear `apps/web` sin integración React;
5. implementar tokens, layout base y catálogo;
6. migrar `/` y comprobar que no solicita archivos de `landing-primary`.

No se iniciará el CRM ni se eliminarán dependencias del proyecto existente dentro de este primer bloque.
