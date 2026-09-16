# Auditoría de estabilización React

**Fecha:** 2026-09-16  
**Punto de retorno:** `pre-react-stabilization-2026-09-16`

## Cambios ejecutados

| Lote | Evidencia |
|---|---|
| Línea base de pruebas | 59/59 pruebas raíz y backend correcto |
| Retiro del piloto Astro | barrera `react-stack`, build Next correcto |
| Dependencias sin uso | búsqueda sin referencias para `clsx` y `tailwind-merge`; suite y build correctos |

## Elementos retirados

- `apps/web` y la dependencia de desarrollo `astro`.
- `clsx` y `tailwind-merge`.

## Elementos protegidos y sin cambios

- `public/landing-primary` y las reescrituras de `/` y `/demos`.
- Animaciones, preloaders, cursores, canvas y recursos 3D.
- Pagos, formularios, reCAPTCHA, portal, CRM y Hermes.

## Trabajo aplazado

- `rc-slider` se conserva porque `src/styles/globals.css` aún contiene selectores `.rc-slider-handle`; su retiro requiere verificar primero el flujo visual relacionado.
- Los 105 candidatos del reporte histórico de Knip requieren verificación individual; existen falsos positivos por cargas mediante HTML, CSS y cadenas.
- El import no declarado de `prop-types` pertenece a `src/components/CountTo/index.jsx`; se decidirá junto con la verificación de uso de ese componente.
- No se eliminarán activos de `public/` sin inventario de solicitudes de red y comprobación visual.
