# Integración local CRM OTP/revocación sobre release Inbox — 2026-11-18

## Identidad y alcance

- Base: `444738a08f970da671fc6ed6d02ac5d9a05f76f6` (`origin/release/crm-inbox-on-ca998999`), descendiente de `ca99899`.
- Rama local: `integration/crm-otp-revoke-on-inbox-20261118`, worktree `.worktrees/crm-otp-revoke-inbox-integration`.
- Integrados selectivamente del candidato `015ac6f0be4521361acb6dc92b3abe7466894f39`: `6c4d682`, `9720049`, `3a231a7`, `23dc155`, `75f9564`, `38b9b07`, `b144bc2`, `015ac6f`. No se integró `4161a5b` (primera compra sin monto), ajeno a OTP/revocación.
- El delta respecto de `444738a` son 14 archivos de OTP Express/SQL/pruebas, UI de administración, cliente Hermes y documentación. `src/app/admin/crm/inbox/page.jsx`, `tests/hermes-inbox-order.test.mjs` y `scripts/inbox-local-harness.mjs` no cambian respecto de la release. `git merge-base --is-ancestor 444738a HEAD` y `git diff --check 444738a..HEAD` pasaron.
- Checkout raíz preexistente conservado sin cambios de esta tarea. No hubo push, PR, migración de base externa ni despliegue.

## Validación local del árbol integrado

| Comando | Resultado |
| --- | --- |
| `pnpm install --frozen-lockfile` | OK, sin cambios de lockfile |
| `npm ci --ignore-scripts` en `backend/` | OK; npm señaló 31 vulnerabilidades de dependencias (8 moderadas, 22 altas, 1 crítica); no se aplicaron actualizaciones fuera de alcance |
| `pnpm build` | OK, Next 16.1.2, rutas CRM `/administracion`, `/inbox` y proxy generadas |
| `pnpm test` | 250 pruebas: 247 pass, 3 skip, 0 fail; incluye Inbox y revocación |
| `pnpm lint` | Exit 0, 0 errores, 173 advertencias |
| `npm test` en `backend/` | 27 pruebas: 23 pass, 4 skip (MySQL opt-in), 0 fail; playbook comercial OK |
| `powershell -NoProfile -ExecutionPolicy Bypass -File backend/scripts/run-crm-otp-tests.ps1` | 16/16 OTP, incluidas 4 pruebas MySQL; Docker `desktop-linux`, MariaDB nueva en loopback, usuario/base ficticios y contenedor eliminado por el runner |

## Límites y próximos controles (no ejecutados)

- La prueba de revocación web ejercita cliente/UI mediante asserts y mocks; no valida click humano en navegador ni sesión móvil real. La integración entre servicios del candidato se documenta en `docs/crm-mobile-otp-contract.md` como evidencia de su rama, no como una nueva ejecución sobre esta rama.
- No se verificó SMTP real, dispositivo móvil, Hermes en producción ni esquema/privilegios de la base destino. La API nueva falla cerrada si faltan tablas o columnas: revisar backup, permisos y aplicar `backend/sql/20261117_crm_auth_otp.sql` por procedimiento aprobado **antes** de arrancar la API modificada. Coordinar interrupción breve de login y expiración de OTP anteriores; rollback de aplicación sin borrar tablas nuevas ni registros existentes.
- Hermes debe confirmar contrato de revocación `{ revokedSessions: número entero no negativo }` y exchange móvil con audiencia y replay durable. Revalidar en staging con ambos servicios, prueba visual/accesibilidad y plan de recuperación antes de proponer publicación. Esta rama no prueba una versión desplegada.
