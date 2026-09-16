# Estabilización de Next/React y retiro del piloto Astro

**Fecha:** 2026-09-16  
**Estado:** aprobado para planificación  
**Decisión:** mantener Next.js y React como arquitectura activa

## Objetivo

Reducir deuda técnica y ambigüedad arquitectónica sin cambiar el aspecto, las animaciones ni los flujos funcionales actuales. La portada continuará sirviéndose desde `public/landing-primary` mediante la reescritura vigente de Next.js.

Esta iniciativa no migra rutas a Astro, no reescribe componentes React y no modifica contratos del backend.

## Punto de recuperación

El estado anterior al trabajo está identificado por:

- commit estable: `22e6fe34fa72e70a3166bbac1e51607a1d57f2cf`;
- etiqueta local: `pre-react-stabilization-2026-09-16`;
- rama de trabajo: `chore/react-stabilization`;
- rama protegida de referencia: `main`.

Cada grupo de cambios debe quedar en un commit independiente. Si una etapa introduce una regresión, se revierte solamente ese commit. La etiqueta permite reconstruir el estado completo anterior a la estabilización.

## Estado inicial verificado

- El árbol de trabajo estaba limpio antes de crear la rama.
- `main` coincidía con `origin/main` en el commit estable.
- El build de Next.js termina correctamente y genera 34 rutas.
- El lint termina sin errores, aunque conserva advertencias existentes.
- El backend supera 11 pruebas del ejecutor de Node y su prueba comercial adicional.
- La suite raíz tiene 58 pruebas: 55 pasan y 3 fallan antes de la limpieza.
- El build del piloto Astro termina correctamente, pero solo genera `/servicios`.

Los tres fallos de la suite raíz forman parte de la línea base y deben corregirse o reclasificarse antes de usar la suite como puerta de calidad.

## Alcance

### 1. Restablecer una línea base confiable

- Diagnosticar los tres fallos actuales sin cambiar comportamiento para satisfacer expectativas obsoletas.
- Actualizar las pruebas cuando la implementación actual represente la decisión funcional vigente.
- Corregir código solamente si una prueba revela una regresión real.
- Incorporar comandos raíz reproducibles para ejecutar pruebas de frontend y backend.

### 2. Retirar el piloto Astro

- Eliminar `apps/web` del proyecto activo en un commit dedicado.
- Retirar `astro` de las dependencias de desarrollo de la raíz.
- Regenerar el lockfile con pnpm sin actualizar versiones no relacionadas.
- Conservar `pnpm-workspace.yaml` mientras contenga configuración de instalación utilizada por el proyecto; no se eliminará solo porque deje de existir `apps/web`.
- Marcar `plan_migracion_sin_react.md` como una propuesta histórica reemplazada por esta decisión, sin borrar su contenido.

El historial de Git y la etiqueta de recuperación conservarán el piloto Astro completo.

### 3. Limpiar dependencias y código de forma conservadora

- Clasificar cada candidato como activo, carga dinámica, referencia pública, legado desconectado o resultado generado.
- No considerar un reporte de Knip como prueba suficiente: el proyecto contiene CSS y scripts cargados mediante cadenas, HTML estático y reescrituras.
- Eliminar dependencias solamente cuando no exista importación, carga dinámica, referencia HTML/CSS ni ruta activa que dependa de ellas.
- Dividir las eliminaciones en lotes pequeños y verificables.
- Posponer la limpieza masiva de `public/` hasta disponer de un inventario de solicitudes de red de las rutas representativas.

## Elementos protegidos

Esta iniciativa no debe modificar ni eliminar:

- `public/landing-primary` y su proceso de preparación;
- la reescritura de `/` y `/demos` en `next.config.ts`;
- animaciones, cursores, preloaders, canvas, GSAP, Three.js o Rive que estén conectados a rutas activas;
- pagos, contratos, formularios, reCAPTCHA, portal, CRM o Hermes;
- rutas, metadata, canonicales o redirecciones;
- contratos HTTP, cookies, almacenamiento de sesión o variables de entorno.

Si un candidato de limpieza alcanza cualquiera de estos elementos, se trata como un cambio funcional separado y queda fuera de alcance.

## Estrategia de commits

1. Documentar la decisión y la línea base.
2. Corregir la infraestructura y las expectativas de prueba de la línea base.
3. Retirar el piloto Astro y regenerar el lockfile.
4. Eliminar dependencias confirmadas como no usadas, en lotes pequeños.
5. Eliminar código huérfano confirmado, separado por familia o plantilla.
6. Actualizar documentación operativa y cerrar la auditoría.

No se mezclarán cambios visuales con eliminaciones de dependencias o archivos.

## Verificación obligatoria

Después de cada lote deben ejecutarse, como mínimo:

- instalación con lockfile congelado;
- lint del frontend;
- build de producción de Next.js;
- suite completa de pruebas raíz;
- pruebas del backend;
- comprobación de que Git solo contiene los cambios esperados.

Antes de eliminar activos o componentes visuales también se requiere una verificación de las rutas afectadas en navegador y una comparación visual básica en escritorio y móvil.

## Criterios de terminado

- Next.js y React continúan siendo la única arquitectura frontend activa.
- La portada conserva exactamente su implementación y comportamiento actuales.
- No existe una aplicación Astro activa ni una dependencia Astro residual.
- La suite raíz y las pruebas del backend tienen comandos reproducibles y terminan correctamente.
- Cada archivo o dependencia eliminado cuenta con evidencia de no uso.
- El build de producción y el lint terminan sin errores nuevos.
- La documentación ya no presenta la migración a Astro como el siguiente paso aprobado.

## Fuera de alcance

- Cambiar el diseño o contenido.
- Optimizar animaciones mediante reescrituras.
- Migrar a otro framework.
- Actualizar versiones mayores de dependencias.
- Rediseñar autenticación, pagos o infraestructura.
- Eliminar grandes grupos de activos basándose solo en análisis estático.
