# UnderCodeEC — instrucciones para OpenCode

Este repositorio combina sitio corporativo Next.js 16/React 19, frontend administrativo de Hermes CRM y API Express 5 con MySQL/MariaDB. Usa pnpm. Delimita cada solicitud entre web pública, CRM, API, autenticación y pagos. La integración Hermes cruza el proxy `/api/hermes/*`; verifica contratos con el backend antes de proponer cambios.

El sitio comercial Hermes Web y Hermes Backend tienen repositorios propios. Hermes Backend se incorpora mediante /vincular-hermes y Hermes Web mediante /vincular-hermes-web. Cada vínculo conserva su alcance y se revoca con /desvincular-hermes o /desvincular-hermes-web respectivamente. Los componentes visuales, la accesibilidad y responsive requieren revisión. No realices despliegues productivos ni operaciones de pagos reales.

## Flujo y trazabilidad

Trabaja en esta raíz Git original por defecto. Antes de comenzar, registra rama, HEAD, estado Git y worktrees existentes. Preserva cambios previos. Máximo sugerido: dos tareas de desarrollo independientes, sin archivos de escritura compartidos, más las revisiones necesarias. Prioriza una rama de desarrollo para funcionalidades, refactorizaciones o cambios estructurales; cambios pequeños pueden hacerse en `main` solo cuando el usuario lo indique expresamente. No crees worktrees automáticamente. Con cualquiera de los dos vínculos activo, completa las tareas autorizadas con commit y push en las ramas de desarrollo de cada repositorio tras validación y QA; no hagas despliegues a producción.

Para `/planificar`, presenta alcance, módulos, riesgos y dependencias sin editar. Para `/desarrollar`, la solicitud concreta del usuario autoriza la implementación funcional y las validaciones locales necesarias en este checkout; el coordinador delega desarrollo y QA, y las correcciones rutinarias no requieren aprobación por archivo o comando. Consulta al usuario cuando falte una decisión material o se exceda el alcance. QA y auditoría no modifican código.

Los especialistas pueden editar archivos funcionales del repositorio y ejecutar pruebas, lint y build locales. Con un vínculo activo, los agentes de esta sesión pueden editar UnderCodeEC y el proyecto Hermes habilitado: D:/Documentos/Hermes/hermes-backend o D:/Documentos/Hermes/Hermes-web según la tarea; QA y auditores conservan independencia de revisión. Todos pueden ejecutar shell para repetir pruebas, lint, build y Docker/PostgreSQL locales. Protege credenciales y archivos internos de Git; modifica la configuración de OpenCode solo cuando pertenezca a la tarea y sin exponer secretos. El permiso de shell en Windows usa la autoridad de la cuenta del usuario; las reglas de OpenCode y estas instrucciones no aíslan el sistema operativo. No modifiques otros proyectos o carpetas ajenas a UnderCodeEC y al proyecto Hermes vinculado. El usuario autorizó commit y push para ambos modos de vinculación: revisa rama, archivos y pruebas de cada tarea y repositorio; crea commits separados sin incorporar cambios ajenos. Nunca uses force push automático.

## Pruebas locales con Docker

Cuando una tarea amerite pruebas de integración, los agentes de desarrollo y QA pueden abrir Docker Desktop y usar Docker/PostgreSQL locales sin pedir autorización repetitiva. Comprueba `docker context show` antes de crear recursos y usa solo el contexto local `desktop-linux`; si apunta a un motor remoto, detente. Si el motor no responde, inicia `C:/Program Files/Docker/Docker/Docker Desktop.exe` con `Start-Process -WindowStyle Hidden` y espera a que `docker info` responda. En este caso, no cambies el contexto global ni configures conexiones remotas.

Antes de iniciar Compose, revisa su configuración para identificar puertos, montajes, volúmenes, redes y nombres fijos. Usa un nombre de proyecto exclusivo de la tarea, por ejemplo `undercode-test-<id>`, y una base PostgreSQL nueva y desechable con datos ficticios. Ejecuta migraciones de desarrollo solo contra esa base, tras comprobar la URL de destino sin exponer credenciales. Nunca uses bases, volúmenes o contenedores existentes del usuario ni datos productivos. Al terminar, detén y elimina únicamente los recursos creados para esa prueba; no uses `docker system prune`, `docker volume prune`, eliminaciones globales ni `compose down --volumes` sobre un proyecto ajeno. Registra qué se ejecutó y qué recursos se limpiaron.

Interpreta informes Markdown según fecha, rama, commit y evidencia. Consulta el estado Git y los PR pertinentes antes de declarar que algo falta o sigue pendiente. Distingue código implementado, probado, integrado, imagen publicada, versión desplegada y validación en producción. Nunca incorpores datos privados productivos al contexto.

## Handoff entre repositorios

El plugin `project_bridge` intercambia mensajes locales entre las sesiones de UnderCodeEC y Hermes. Al iniciar o retomar una tarea cruzada, el coordinador consulta `project_bridge_list`, lee los mensajes pertinentes con `project_bridge_read` y confirma su recepción con `project_bridge_ack`. Para solicitar trabajo o entregar un resultado usa `project_bridge_send` con ID de tarea, asunto y cuerpo que incluya contrato, evidencia, pruebas, riesgos y decisión requerida. El plugin agrega automáticamente rama, HEAD y estado de cambios del repositorio emisor. No incluyas credenciales, datos de clientes ni información productiva. El receptor verifica su propia rama y HEAD antes de actuar.

El buzón no concede lectura ni edición del otro repositorio, no activa subagentes remotos y no sustituye los comandos de vinculación. Sin vinculación activa, cada sesión trabaja solo en su repositorio y coordina mediante los mensajes. Con Hermes Backend vinculado, el coordinador delega NestJS a hermes-backend. Con Hermes Web vinculado, delega el sitio comercial a hermes-web. Conserva rama, HEAD, estado Git y validaciones por repositorio; cada vínculo es independiente.


## Cierre autónomo del modo vinculado

/vincular-hermes es la autorización operativa de la sesión: coordina especialistas y QA, corrige hallazgos, repite las pruebas pertinentes y realiza commit y push a las ramas de desarrollo de UnderCodeEC y Hermes Backend sin pedir confirmaciones por comando. Si la rama actual es main, crea una rama de desarrollo preservando los cambios existentes. No hagas force push ni despliegue productivo. Si falla una validación o el remoto rechaza el push, resuelve la causa dentro del alcance y reporta un bloqueo real solo cuando no puedas continuar. Usa git add con rutas exactas de la tarea; en el repositorio Hermes Backend, solo hermes-backend/**. Hermes Web tiene su propia raíz Git. Los cambios previos ajenos quedan fuera del commit.


Para enviar un handoff manual desde UnderCodeEC usa /enviar-hermes ID | Asunto | Mensaje; para revisar pendientes usa /buzon-proyectos. El agente puede usar project_bridge_read y project_bridge_ack para leer y confirmar mensajes completos.

## Hermes Web vinculado

/vincular-hermes-web autoriza en esta sesión el trabajo autónomo entre UnderCodeEC y D:/Documentos/Hermes/Hermes-web. Delega implementación a hermes-web y revisión a undercode-qa; repite pnpm build y las verificaciones visuales y funcionales pertinentes. Tras QA, crea commits separados y haz push a las ramas de desarrollo de cada repositorio, sin incorporar cambios ajenos ni desplegar a producción. /desvincular-hermes-web revoca solo Web; /vincular-hermes y /desvincular-hermes conservan su alcance exclusivo de Backend. Si están activos ambos vínculos, verifica y publica cada repositorio por separado.
