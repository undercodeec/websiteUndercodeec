# Registro de sesión: CRM, despliegue web y Nginx

> Documento de continuidad para el proyecto o agente que dé seguimiento. Resume exclusivamente el trabajo de esta sesión y el estado técnico comprobado al cierre. No contiene secretos ni contenido de archivos .env.

## 1. Alcance y resultado

Esta sesión tuvo dos frentes:

1. Renovación visual del login de Hermes CRM mediante la reutilización de la animación existente del demo Dala.
2. Diagnóstico y corrección del despliegue Next.js en el VPS, que servía una release antigua aunque el repositorio ya tenía el commit nuevo.

Estado al cierre: web pública, CRM, API y Hermes siguen operativos; los assets de Next provienen de la release activa; existe rollback entre releases; y Nginx no carga un vhost duplicado.

## 2. Rutas relevantes del repositorio local

| Componente | Ruta |
|---|---|
| Frontend Next.js | src/app/ |
| CRM | src/app/admin/crm/ |
| Login CRM | src/app/admin/crm/login/page.jsx |
| Adaptador de animación Dala | src/app/admin/crm/login/CrmLoginBrain.jsx |
| Estilos CRM | src/app/admin/crm/crm.css |
| Demo reutilizado | public/demos/dala/index.html, servido como /demos/dala/index.html |
| Reportes VPS de la sesión | logs.log |
| Documento de continuidad | implementation_plan.md |

## 3. Cambio visual del login CRM

### Requisito

Se solicitó reemplazar el bloque lateral crm-login-benefits por el cerebro animado del demo Dala. La instrucción fue trasladar la animación original, no recrearla ni inventar otro SVG/WebGL.

### Implementación publicada

El commit 3ca3a8e, con mensaje feat(crm): integrate Dala login animation, contiene:

- Creación de src/app/admin/crm/login/CrmLoginBrain.jsx.
- Carga del demo original mediante iframe con src=/demos/dala/index.html.
- Detección del canvas #canvas dentro del iframe; el contenedor de la animación se mantiene visible y los elementos no necesarios del demo se ocultan.
- Sustitución de crm-login-benefits por el componente CrmLoginBrain en el lateral de page.jsx.
- Estilos crm-login-brain para disponer de espacio lateral, evitar el recorte de la animación y responder al tamaño de pantalla.
- Uso de mix-blend-mode: difference y de la animación crm-login-brain-colors para modificar visualmente el color de las partículas, sin cambiar la lógica WebGL del demo.
- Ajuste del espaciado del texto lateral para que la animación quede completa.

La lógica funcional de acceso no fue modificada: solicitud de código, validación, sesión, carga y manejo de errores permanecen en page.jsx.

### Validación local antes del commit

- pnpm test: 158 pruebas aprobadas y 1 omitida.
- pnpm build: compilación de producción correcta.
- pnpm lint: solo avisos preexistentes, sin errores bloqueantes.

### Archivo de prueba eliminado

Por instrucción expresa se eliminó tests/servicios-primary-layout.test.mjs. Era un test y no una dependencia de producción. La eliminación forma parte del commit 3ca3a8e.

### Git

- Commit publicado: 3ca3a8e feat(crm): integrate Dala login animation.
- Rama publicada: main.
- El remoto del VPS quedó configurado por SSH como git@github.com:undercodeec/websiteUndercodeec.git. Esto fue necesario por ser un repositorio privado: GitHub no permite autenticación Git por contraseña HTTPS.

## 4. Causa de que producción mostrara UI anterior

El checkout histórico /var/www/html/undercodeec ya estaba en 3ca3a8e, pero PM2 no estaba ejecutando esa carpeta.

Hallazgos confirmados:

- web-undercodeec ejecutaba una release antigua: /var/www/releases/undercodeec-49d343c.
- Esa release no contenía CrmLoginBrain.jsx ni la integración de Dala.
- Nginx enruta admincrm.undercodeec.com a Next en 127.0.0.1:3000 y conserva el encabezado Host.
- No hubo evidencia de que Cloudflare, Nginx o el navegador fueran la causa principal.

La causa fue la release activa del proceso web, no la interfaz CRM ni la caché.

## 5. Arquitectura web de releases implementada

| Elemento | Estado final |
|---|---|
| Proceso web PM2 | web-undercodeec, puerto 3000 |
| Directorio de ejecución web | /var/www/current |
| Release activa | /var/www/releases/undercodeec-3ca3a8ec22b36c3822be0871fa41cfb30f88153a |
| SHA activo | 3ca3a8ec22b36c3822be0871fa41cfb30f88153a |
| Release de rollback | /var/www/releases/undercodeec-49d343c |
| SHA de rollback | 49d343c0c4ad6ef13794080e65c67c3ca4800f51 |
| Variables de entorno web | /var/www/shared/undercodeec/.env, permisos 0600 |
| Script de despliegue | /usr/local/sbin/deploy-web-undercodeec |
| Configuración PM2 | /etc/pm2/web-undercodeec.config.cjs |

El script de despliegue:

1. Obtiene origin/main.
2. Crea worktree/release por SHA.
3. Instala dependencias bloqueadas.
4. Construye Next.js.
5. Valida la release y su .next/BUILD_ID.
6. Conserva el destino anterior como previous y cambia current de forma atómica con enlaces temporales y mv -T.
7. Recarga únicamente web-undercodeec.

El script fue corregido además para validar el destino absoluto, directorio y BUILD_ID de current, exigir que la release nueva sea distinta y conservar previous antes de cambiar current. Se validó mediante bash -n. No se ejecutó un despliegue extra solo para probar el script.

## 6. Servicios separados del VPS

| Servicio | Gestión | Puerto | Ruta o ejecución | Afectado por cambios web |
|---|---|---:|---|---|
| Web UnderCodeec / Next.js | PM2: web-undercodeec | 3000 | /var/www/current | Sí |
| API UnderCodeec | PM2: api-undercodeec | 3002 | /var/www/html/undercodeec/backend | No |
| Hermes | Docker Compose, hermes-app | 127.0.0.1:3003 | /var/www/hermes/... | No |

Durante las tareas web:

- No se reinició ni recargó api-undercodeec.
- No se ejecutó Docker Compose ni se reinició Hermes.
- API mantuvo ruta histórica y puerto 3002.
- Hermes continuó en su contenedor y puerto 3003.
- Una recarga de web-undercodeec no reinicia API ni Hermes por sí misma.

### Consideración futura para Hermes

Hermes no tiene aún integración Git SSH ni un sistema equivalente de releases. Cuando se autorice, debe usar rutas propias y no reutilizar las rutas globales de UnderCodeec:

    /var/www/hermes/source
    /var/www/hermes/releases
    /var/www/hermes/current
    /var/www/hermes/previous
    /var/www/hermes/shared/.env

Hermes deberá usar una clave SSH de despliegue independiente y de solo lectura para su repositorio privado. Esto es una recomendación registrada; no se migró Hermes ni se modificó Docker en esta sesión.

## 7. Corrección de assets estáticos de Next.js

### Problema detectado

Para undercodeec.com y www.undercodeec.com, Nginx servía /_next/static/ desde una ruta fija de la release antigua 49d343c.

Riesgo: HTML de la release nueva podía referenciar CSS/JS inexistente en la release antigua, produciendo 404, estilos rotos o JavaScript no cargado tras un despliegue.

admincrm.undercodeec.com no tenía regla estática propia: proxifica a Next en 3000. Por eso sus assets ya correspondían a la release actual.

### Primer intento y causa del 403

Se intentó sustituir el alias estático por:

    alias /var/www/current/.next/static/;

Nginx validó sintaxis, pero respondió 403 Permission denied. La causa comprobada fue que la release activa y/o los directorios .next y .next/static tenían permisos 0700 root:root; www-data no podía atravesarlos.

La configuración se restauró de inmediato en ese primer intento. No se aplicaron cambios adicionales hasta contar con autorización específica.

### Corrección final aplicada

- Alias actualizado en /etc/nginx/sites-enabled/undercodeec, línea 6:

      alias /var/www/current/.next/static/;

- Permisos mínimos aplicados:
  - raíz de release, .next y .next/static: 0755;
  - 4 subdirectorios bajo static: 0755;
  - 92 assets estáticos: 0644.
- Se comprobó que www-data puede recorrer y leer los recursos.
- /usr/local/sbin/deploy-web-undercodeec aplica los mismos permisos mínimos a futuras releases antes de activarlas.
- bash -n del script pasó.
- nginx -t pasó y Nginx fue recargado; no se reinició.

Validación:

- El asset /_next/static/chunks/d70479ad172553b6.js devolvió HTTP 200.
- Su SHA-256 público coincidió con el archivo de /var/www/current/.next/static/; el informe VPS registró el valor abreviado cc5c…5b27.
- El HTML de undercodeec.com y www usa la landing /landing-primary y no expone literalmente una ruta /_next/static/. Por ello, la verificación se hizo descargando un asset real de la release activa y comparando su hash.

Respaldos de esta corrección:

- Permisos previos: /root/undercodeec-static-permissions-20261004-010923.txt.
- Configuración Nginx previa: /root/undercodeec-nginx-20261004-010933.conf.

## 8. Eliminación de vhost de respaldo duplicado

### Hallazgo

nginx -t era válido, pero emitía advertencias de conflicto en 80 y 443 para:

- undercodeec.com;
- www.undercodeec.com;
- api.undercodeec.com.

Causa demostrada:

    /etc/nginx/sites-enabled/undercodeec.bak-20260903-212732

Nginx incluye sites-enabled/*; el archivo de respaldo se cargaba como segundo vhost y duplicaba los server_name del vhost activo /etc/nginx/sites-enabled/undercodeec. No era enlace simbólico ni tenía referencias explícitas adicionales.

### Corrección aplicada

- El respaldo no fue eliminado.
- Se movió de forma reversible a:

      /root/nginx-disabled-backups/undercodeec.bak-20260903-212732

- SHA-256 registrado:

      6561075b82dba13660a7c312c3e4a07084c6ca19d0623091ec323c1a9a84bd5a

- Permisos preservados: 0644 root:root.
- Directorio de archivo: 0700 root:root.
- El vhost activo no fue modificado.
- nginx -t posterior pasó sin advertencias de conflicto.
- Se efectuó una única recarga de Nginx.

Rollback, solo si fuera imprescindible:

    sudo mv -- /root/nginx-disabled-backups/undercodeec.bak-20260903-212732 /etc/nginx/sites-enabled/undercodeec.bak-20260903-212732
    sudo nginx -t && sudo systemctl reload nginx

Restaurar el respaldo volvería a introducir las advertencias; no hacerlo salvo investigación controlada.

## 9. Estado comprobado al cierre

- web-undercodeec está online en 3000 y se ejecuta desde /var/www/current.
- api-undercodeec está online en 3002 con su cwd histórico.
- Hermes continúa como contenedor hermes-app en 127.0.0.1:3003.
- Nginx tiene sintaxis válida y sin advertencias de vhost duplicado.
- El asset Next probado devuelve HTTP 200 y coincide con la release activa.
- current y previous apuntan a releases distintas; existe rollback.
- El login CRM con Dala pertenece al commit desplegado 3ca3a8e.

## 10. Operación futura

### Despliegue de UnderCodeec web

Usar el script de despliegue configurado en VPS. No ejecutar pnpm build en /var/www/html/undercodeec esperando que PM2 sirva ese resultado: el proceso web consume la release apuntada por /var/www/current.

Antes de desplegar, comprobar:

    readlink -f /var/www/current
    readlink -f /var/www/previous
    pm2 describe web-undercodeec
    sudo nginx -t

Después, comprobar la web en 3000 y un asset /_next/static/ contra la release activa. Para rollback, usar el mecanismo atómico del script y recargar solo web-undercodeec. No involucrar API ni Hermes.

### Higiene de Nginx

Nunca guardar copias .bak dentro de /etc/nginx/sites-enabled, porque el patrón include las carga. Usar /root/nginx-disabled-backups u otra carpeta que Nginx no incluya.

### Estado local del repositorio

Al redactar este documento hay cambios locales no confirmados. No mezclarlos automáticamente con un futuro commit de despliegue. Revisar especialmente documentación, logs y cambios CRM que no pertenezcan al commit ya publicado. Mantener commits temáticos.

## 11. Archivos modificados durante la sesión

### Repositorio local, commit publicado

- src/app/admin/crm/login/CrmLoginBrain.jsx: creado.
- src/app/admin/crm/login/page.jsx: beneficios reemplazados por animación.
- src/app/admin/crm/crm.css: área, visualización y color de partículas.
- tests/servicios-primary-layout.test.mjs: eliminado por instrucción.

### VPS

- /usr/local/sbin/deploy-web-undercodeec: validación de releases, rollback y permisos de assets futuros.
- /etc/pm2/web-undercodeec.config.cjs: web mediante /var/www/current.
- /etc/nginx/sites-enabled/undercodeec: alias estático a /var/www/current/.next/static/.
- /etc/nginx/sites-enabled/undercodeec.bak-20260903-212732: movido a /root/nginx-disabled-backups, no eliminado.

## 12. Pendientes conocidos

- Configurar Git privado y clave SSH exclusiva de despliegue para Hermes cuando se autorice.
- Crear sistema de releases namespaceado para Hermes, sin compartir enlaces globales de UnderCodeec.
- Revisar los cambios locales pendientes antes del próximo commit.
