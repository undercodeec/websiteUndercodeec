# Componentes Primary

Este módulo concentra las piezas reutilizables extraídas del lenguaje visual de
`public/landing-primary`. La página estática de referencia no se modifica.

```jsx
import { PrimaryHeader, PrimaryOrb } from "@/components/Primary";
```

- `PrimaryHeader`: cabecera completa, menú y animaciones de texto.
- `PrimaryOrb`: burbuja WebGL reutilizable.
- `PrimaryPreloader`: precarga original con trazo, relleno, porcentaje y
  transición hacia `PrimaryOrb`. Desde el layout se decide en qué rutas usa la
  transición WebGL.
- `PrimaryCursor`: cursor de `landing-primary`; ya está montado globalmente en
  `src/app/layout.tsx`, por lo que no debe repetirse dentro de cada página.

Los colores, tipografía, escalas de títulos, radios y márgenes viven en
`src/styles/primary-system.css`. Los nuevos bloques Primary deben consumir esas
variables en lugar de volver a declarar valores locales.
