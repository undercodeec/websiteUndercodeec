---
description: Coordina desarrollo funcional y QA en el checkout original
agent: undercode-coordinator
---

Solicitud: $ARGUMENTS. Comprueba rama, HEAD, estado y cambios previos. La solicitud concreta autoriza ediciones funcionales y validaciones locales necesarias en este checkout, sin aprobación por archivo. Delega implementación al especialista correspondiente y validación a QA; devuelve hallazgos para corrección y consolida resultados. Si el alcance o una decisión material no están claros, consulta al usuario. No crees worktrees por defecto. Si /vincular-hermes o /vincular-hermes-web está activo, esta solicitud del usuario autoriza completar la tarea con commit y push a ramas de desarrollo de cada repositorio tras QA; conserva cambios ajenos y no despliegues a producción.
