# Calendario CRM

Ruta: `/admin/crm/calendario/`. Fuente: reuniones persistidas de Hermes por
`GET /api/hermes/meetings`, proxy del endpoint protegido `GET /api/meetings`.
Configurar `HERMES_API_URL` en el servidor con la base `/api` de Hermes.
El cliente reutiliza el bearer de la sesión CRM; no necesita credenciales Google.

Vista semanal de lunes a domingo, 07:00–21:00, y agenda diaria en pantallas estrechas.
Las reuniones fuera del horario permanecen accesibles en una lista adicional.
La zona mostrada se guarda como `hermes-crm-calendar-timezone` y ofrece Ecuador,
España peninsular y Canarias. Las tarjetas y el panel conservan la zona original.
Cambiar la zona mostrada modifica los límites UTC del rango, sin filtrar regiones.
`PENDING` se presenta como **En verificación**; no significa reunión confirmada.
La actualización automática se ejecuta cada 30 segundos con la pestaña visible.

## Comprobaciones automáticas

`node --test tests/crm-calendar.test.mjs tests/crm-calendar-components.test.mjs`
cubre límites de semana, las tres zonas, transiciones DST de Madrid (167/169 horas),
posiciones y duración, reuniones simultáneas/multidía, estados, agenda, relaciones
ausentes y enlaces seguros del panel.

El test `tests/crm-calendar-proxy.test.mjs` es optativo y usa el servidor sintético
`hermes-backend/test/fixtures/crm-calendar-server.cjs` después del build de Hermes.
Con Next local en 3100 y `HERMES_API_URL=http://127.0.0.1:3103/api`:

```powershell
$env:CALENDAR_QA_PROXY_URL='http://localhost:3100/api/hermes'
node --test tests/crm-calendar-proxy.test.mjs
```

Esta comprobación ejecuta el proxy y el controller/service/JWT/roles reales con
filas en memoria. No verifica persistencia PostgreSQL ni inicia sesión productiva.

## Escenarios manuales para aceptación

- Iniciar sesión como ventas, abrir Calendario, navegar semanas y regresar a Hoy.
- Comparar un mismo instante en las tres zonas; recargar y confirmar la preferencia.
- Probar semanas del 23 de marzo y del 19 de octubre de 2026 en Madrid.
- Filtrar cada estado; verificar En verificación y sus detalles antes de confirmar.
- Probar vacío, error, reintento, Actualizar y respuestas 401/403.
- Revisar nombres largos y reuniones simultáneas, fuera de horario y multidía.
- En móvil, seleccionar un día y comprobar la agenda y el panel de detalles.
- Abrir tarjeta con Enter/Espacio, recorrer panel con Tab/Shift+Tab, cerrar con
  Escape y comprobar que el foco regresa a la tarjeta. El panel usa un diálogo
  modal nativo del navegador para contener el foco.
- Verificar que lead/conversación/Meet aparecen solo cuando existen, además de
  alto contraste y reducción de movimiento.

Los escenarios de interacción manual y persistencia real quedan pendientes:
el entorno no ofrece navegador controlable ni Docker activo. Las pruebas de
contrato, conversión y renderizado se ejecutan automáticamente.

## Resultado del 28 de septiembre de 2026

Aplicado también en los checkouts originales, conservando los cambios previos.
Hermes: 603/603 pruebas, lint y compilación correctos en el checkout original.
CRM: 12/12 pruebas del calendario y 1/1 del proxy real; compilación correcta,
lint sin errores (172 advertencias previas). Suite completa: 106 aprobadas,
4 fallos preexistentes en Servicios y 1 prueba de proxy omitida por defecto.

Fallos anteriores del frontend: footer de Servicios; preloader global del orb;
recorrido del orb con scroll; título/canvas de Desarrollo de software.
No pertenecen al calendario y no se modificaron.

La revisión independiente detectó detalles desactualizados al refrescar y una
colisión de estilos con el reset de botones del CRM. Se corrigieron: el panel
resuelve su reunión por ID contra los últimos datos, sin reabrir el diálogo, y
la tipografía de tarjetas tiene prioridad suficiente. Las tarjetas cortas se
expanden al recibir foco o al pasar el puntero.

## Decisiones y límites de la ejecución

- Se implementó el diseño y plan entregados sin repetir el proceso de diseño.
- Se usaron worktrees y commits separados; los parches se aplicaron en las
  carpetas originales sin fusionar ni publicar ramas. Se conservan las ramas
  `feat/crm-calendar`; esto exige verificar también los checkouts originales.
- Se continuó tras los fallos de la línea base, sin alterar funcionalidades
  ajenas. Las tres pruebas antiguas fallidas del backend en el worktree limpio
  pasan con los cambios previos presentes en el checkout original.
- El lint de Hermes se ejecutó sin `--fix` para evitar reformateos generales.
  Solo se normalizaron los finales de línea del módulo modificado al transferirlo.
- La zona mostrada solo cambia el rango UTC; no filtra la zona almacenada.
- Se añadió una agenda fuera del horario para mantener accesibles esas reuniones.
- La integración usa filas sintéticas y el proxy/controller/guards reales:
  faltaba Docker. La persistencia con PostgreSQL sigue pendiente.
- Los tests de renderizado no sustituyen las comprobaciones visuales, de teclado
  y tecnologías de asistencia: no había navegador disponible.
- Se instalaron dependencias locales del worktree desde la caché, sin cambiar
  paquetes ni lockfile, para que Turbopack compile sin enlaces fuera de su raíz.
- El arreglo de CSS se comprobó por la cascada, lint y compilación, sin un test
  que replique el texto del CSS. La apariencia sigue requiriendo revisión manual.
