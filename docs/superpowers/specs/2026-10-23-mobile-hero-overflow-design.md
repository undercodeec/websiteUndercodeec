# Hero móvil sin recorte

## Intención

En la ruta raíz, el contenido decorativo del hero debe poder extenderse a los lados en pantallas móviles, sin cambiar el comportamiento de escritorio.

## Enfoque elegido

Se añadirá una regla CSS, limitada a `max-width: 700px`, que cambie el contenedor `overflow="clip"` de la landing raíz a `overflow: visible`. Es la causa directa del recorte y conserva el recorte actual fuera del breakpoint móvil.

## Límites

- Solo afecta a `public/landing-primary/css/demo-local.css` y a su prueba de regresión.
- No modifica la composición, el texto ni el comportamiento de escritorio.
