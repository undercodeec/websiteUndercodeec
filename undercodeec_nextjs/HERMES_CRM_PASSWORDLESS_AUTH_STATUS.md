# Estado: acceso sin contraseña de Hermes CRM

Fecha de corte: 2026-07-29.

## Objetivo

Reemplazar el acceso por correo y contraseña de `/admin/crm` por un código de un solo uso enviado a `gerencia@undercodeec.com`. El JWT de sesión debe ser emitido únicamente por Hermes, sin reutilizar contraseñas, sesiones ni tokens del panel Admin.

## Diseño acordado

1. El navegador solicita el código al backend Admin.
2. Admin admite únicamente `gerencia@undercodeec.com`, genera el OTP y lo envía con el transporte Nodemailer ya configurado.
3. Admin guarda solamente un HMAC del OTP y, tras una validación correcta, elimina el OTP y devuelve una prueba JWT/HMAC de dos minutos.
4. El navegador canjea esa prueba en Hermes.
5. Hermes valida firma, emisor, audiencia, vencimiento, rol y `jti`; consume el `jti` en PostgreSQL para impedir reuso; crea o actualiza el usuario de gerencia con rol `ADMIN`; finalmente genera su propio JWT CRM.
6. El navegador guarda solamente el JWT de Hermes en `sessionStorage`.

La prueba de Admin usa `iss=undercodeec-admin`, `aud=hermes-crm`, `role=ADMIN`, un `jti` aleatorio y expiración de 120 segundos. No contiene contraseña ni un token de sesión Admin.

## Implementado y confirmado en Admin

Commit: `9e1e6e9 feat(admin): add Hermes CRM passwordless OTP proof`.

- `backend/server.js`
  - Endpoints públicos `POST /api/crm/auth/request-code` y `POST /api/crm/auth/verify-code`.
  - Operador fijo: `gerencia@undercodeec.com`.
  - OTP criptográfico de ocho dígitos mediante `crypto.randomInt`.
  - Almacenamiento HMAC-SHA256 del OTP; nunca se conserva el texto plano.
  - TTL predeterminado de 10 minutos.
  - Consumo inmediato del OTP antes de firmar la prueba.
  - Invalidación tras cinco intentos fallidos o bloqueo por intentos.
  - Cooldown por correo, límite por IP y limpieza periódica de memoria.
  - Respuesta genérica para solicitudes no autorizadas, para no revelar cuentas existentes.
  - Correo enviado por el `transporter` Nodemailer existente.
- `backend/crmOtp.js`: funciones aisladas de normalización, autorización, generación, hash y firma.
- `backend/crmOtp.test.js`: pruebas de operador autorizado, OTP/HMAC y contenido/TTL de la prueba.
- `backend/.env.example`: documentación de las variables del flujo.
- `backend/package.json`: script `test:crm-auth`.

## Cambios locales de frontend, aún sin commit

Los directorios `src/app/admin/crm/` y `src/lib/hermes/` ya estaban sin seguimiento antes de esta intervención. Para preservarlos, no se incluyeron en el commit anterior. En el árbol de trabajo existen ajustes en:

- `src/app/admin/crm/login/page.jsx`: elimina la contraseña; muestra solicitud de código y verificación de código.
- `src/app/admin/crm/_components/CrmSession.jsx`: guarda únicamente la sesión devuelta por Hermes.
- `src/lib/hermes/api.js`: solicita y verifica el OTP con Admin, luego canjea la prueba en Hermes mediante `POST /auth/crm-proof`.
- `.env.example`: documenta `NEXT_PUBLIC_ADMIN_API_URL`.

Estos cambios requieren el endpoint Hermes pendiente antes de poder considerarse funcionales en producción.

## Pendiente: Hermes Backend

No se pudo escribir en `Hermes/hermes-backend` porque el sandbox de esta sesión sólo permite escritura dentro de `undercodeec_nextjs`. No existe commit Hermes ni migración aplicada.

Cambios requeridos en Hermes:

- Crear DTO `CrmProofDto` con el campo `proof`.
- Exponer `POST /api/auth/crm-proof`.
- Verificar la prueba con `CRM_HERMES_PROOF_SECRET`, `issuer=undercodeec-admin` y `audience=hermes-crm`.
- Rechazar prueba vencida, con email/rol distintos de los esperados, sin `jti`, o repetida.
- Añadir modelo Prisma `CrmAuthProof` (`jti` único, `expiresAt`, `createdAt`) y migración PostgreSQL para `crm_auth_proofs`.
- Consumir el `jti` dentro de una transacción antes de emitir sesión.
- Crear o actualizar `gerencia@undercodeec.com` como `ADMIN` activo y emitir el JWT de Hermes.
- Deshabilitar o retirar el login público por contraseña si será el único acceso autorizado al CRM.
- Añadir pruebas unitarias del canje válido, prueba inválida/vencida y repetición de `jti`.
- Documentar `CRM_HERMES_PROOF_SECRET` y `CRM_OPERATOR_EMAIL` en `Hermes/hermes-backend/.env.example`.

## Variables de entorno

Admin (`undercodeec_nextjs/backend/.env`):

```env
CRM_OTP_HASH_SECRET=<secreto-aleatorio-de-al-menos-32-bytes>
CRM_HERMES_PROOF_SECRET=<secreto-compartido-aleatorio-de-al-menos-32-bytes>
CRM_OTP_TTL_MS=600000
CRM_OTP_COOLDOWN_MS=60000
CRM_OTP_MAX_ATTEMPTS=5
CRM_OTP_IP_MAX_REQUESTS=5
```

Hermes (`Hermes/hermes-backend/.env`, pendiente):

```env
CRM_HERMES_PROOF_SECRET=<mismo-valor-configurado-en-Admin>
CRM_OPERATOR_EMAIL=gerencia@undercodeec.com
```

Next.js (`undercodeec_nextjs/.env`):

```env
NEXT_PUBLIC_HERMES_API_URL=/api/hermes
NEXT_PUBLIC_ADMIN_API_URL=https://api.undercodeec.com
```

`CRM_OTP_HASH_SECRET`, `CRM_HERMES_PROOF_SECRET` y `JWT_SECRET` son distintos y no deben exponerse con prefijo `NEXT_PUBLIC_` ni incluirse en Git.

## Verificaciones ejecutadas

| Proyecto | Comando | Resultado |
| --- | --- | --- |
| Admin | `npm --prefix backend run test:crm-auth` | 3 pruebas correctas |
| Admin | `node --check backend/server.js` | Correcto |
| Next.js | `npm run build` | Correcto |
| Hermes (línea base, sin cambios OTP) | `npm --prefix ../Hermes/hermes-backend test -- --runInBand` | 8 pruebas correctas |
| Hermes (línea base, sin cambios OTP) | `npm --prefix ../Hermes/hermes-backend run build` | Correcto |

## Git y push

- Repositorio Admin/Next: commit `9e1e6e9`, enviado correctamente a `origin/feat/asistente-ia-dos-modos`.
- Repositorio Hermes: sin cambios aplicados ni commit, por restricción de escritura.
- Se preservaron modificaciones, eliminaciones y archivos sin seguimiento preexistentes ajenos al flujo.

## Despliegue cuando Hermes esté completado

Ejecutar primero Admin/Next y después Hermes. Sustituir los marcadores de ruta y proceso por los valores reales de la VPS.

```bash
# 1. Admin / Next.js
cd /ruta/websiteUndercodeec
git pull origin feat/asistente-ia-dos-modos
cd undercodeec_nextjs
npm ci
npm run build
pm2 reload <proceso-admin-o-next> --update-env

# 2. Hermes Docker
cd /ruta/Hermes/hermes-backend
git pull
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
```

## Smoke test final

1. Configurar ambos secretos y reiniciar Admin/Next.
2. Configurar el secreto compartido en Hermes, ejecutar la migración y reiniciar Hermes.
3. Abrir `https://undercodeec.com/admin/crm`.
4. Solicitar el código para `gerencia@undercodeec.com`.
5. Confirmar que llega el correo y que el código tiene ocho dígitos.
6. Verificarlo una vez y confirmar redirección a `/admin/crm`.
7. Verificar que las llamadas CRM llevan un JWT de Hermes, no un token Admin.
8. Reintentar el mismo código: debe fallar.
9. Probar un código incorrecto cinco veces: debe invalidarse/bloquearse.
10. Esperar al vencimiento del JWT Hermes o simular un `401`: la interfaz debe limpiar la sesión y redirigir a `/admin/crm/login?reason=expired`.
