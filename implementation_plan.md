Necesito que ajustes ÚNICAMENTE la apariencia visual de la burbuja/orbe del HERO para que replique lo más fielmente posible la referencia visual adjunta.

IMPORTANTE:
NO quiero una reinterpretación.
NO quiero que diseñes otra burbuja.
Quiero reproducir específicamente la distribución de colores, profundidad, reflejos y posición visual que aparece en la referencia.

Las animaciones actuales del HERO ya están terminadas y NO deben tocarse.

==================================================
1. PRIMERO INSPECCIONA LA IMPLEMENTACIÓN ACTUAL
==================================================

Antes de modificar código:

1. Localiza el componente exacto que renderiza la burbuja del HERO.
2. Localiza:
   - wrapper
   - círculo exterior
   - círculo interior
   - pseudo-elementos
   - gradients
   - blur
   - filters
   - opacity
   - mix-blend-mode
   - transforms
   - keyframes
   - animaciones
3. Identifica qué propiedades participan en las animaciones.

NO modificar ninguna propiedad relacionada con movimiento.

Debes conservar exactamente:

- animation
- animation-name
- animation-duration
- animation-delay
- animation-timing-function
- keyframes
- transform animado
- translate
- rotate
- scale
- perspective
- will-change
- motion
- Framer Motion si existe
- GSAP si existe
- variables CSS relacionadas con movimiento

La tarea es EXCLUSIVAMENTE visual.

==================================================
2. ESTRUCTURA VISUAL DE REFERENCIA
==================================================

La burbuja está formada por DOS elementos principales:

A. ARO EXTERIOR
B. ESFERA INTERIOR

Visualmente deben comportarse como elementos separados.

NO intentes hacer todo con un único gradient.

==================================================
3. ARO EXTERIOR
==================================================

El aro exterior es grueso, limpio y saturado.

Su distribución aproximada es:

SUPERIOR IZQUIERDA:
azul marino casi negro

#02003F

IZQUIERDA:
azul marino → violeta oscuro

#02003F
#4D007F

INFERIOR IZQUIERDA:
violeta oscuro

#4D007F

INFERIOR CENTRAL:
vino/magenta oscuro

#700047
#A10F79

INFERIOR DERECHA:
magenta/fucsia

#A10F79
#EB1C74

DERECHA:
fucsia intenso

#EB1C74

SUPERIOR DERECHA:
fucsia/rosa intenso

#EB1C74

La transición debe ser CONTINUA.

No utilizar segmentos duros.

No hacer un arcoíris uniforme.

El lado izquierdo debe sentirse claramente más oscuro que el derecho.

Visualmente:

          NAVY
       ↙       ↘
    NAVY       FUCHSIA
     |            |
 PURPLE         PINK
     |            |
   PURPLE → WINE → MAGENTA


==================================================
4. GRADIENT DEL ARO
==================================================

Como punto de partida, usar un conic-gradient.

Referencia CSS:

background:
  conic-gradient(
    from 315deg at 50% 50%,

    #02003F 0deg,
    #02003F 40deg,

    #3A075F 80deg,

    #4D007F 125deg,

    #700047 180deg,

    #A10F79 225deg,

    #EB1C74 280deg,

    #F0207A 325deg,

    #02003F 360deg
  );

PERO:

No copiarlo ciegamente.

Ajustar los stops visualmente hasta que coincidan con la referencia.

La lectura final debe ser:

11h–1h:
navy / purple oscuro

2h–4h:
fucsia

5h:
magenta

6h:
vino/magenta oscuro

7h–9h:
violeta

10h–11h:
navy oscuro


==================================================
5. MUY IMPORTANTE: ORIENTACIÓN
==================================================

No quiero el degradado oscuro abajo y rosa arriba.

Debe quedar aproximadamente así:

- 10–11 en punto:
  azul navy

- 12 en punto:
  navy → púrpura

- 1–3 en punto:
  magenta/fucsia

- 3–5 en punto:
  fucsia/magenta

- 6 en punto:
  vino oscuro

- 7–9 en punto:
  púrpura oscuro

- 9–10 en punto:
  navy


==================================================
6. ESFERA INTERIOR
==================================================

La esfera interior NO es simplemente otro círculo rosa.

Debe parecer:

- translúcida
- gelatinosa
- cristal líquido
- iluminada desde dentro
- suave
- ligeramente iridiscente

Debe tener profundidad.

El centro es claro.

Los bordes tienen más saturación.

La parte inferior incorpora violeta/lavanda.

La parte superior incorpora rosa/fucsia.

==================================================
7. DISTRIBUCIÓN DE COLOR INTERIOR
==================================================

La referencia aproximadamente tiene:

ARRIBA:
rosa claro / magenta

CENTRO SUPERIOR:
magenta-lila suave

CENTRO:
rosa pastel muy claro

DERECHA:
rosa/fucsia más saturado

IZQUIERDA:
rosa muy pálido / lila

ABAJO:
lavanda

ABAJO IZQUIERDA:
lavanda azulada

ABAJO CENTRO:
violeta azulado suave

No introducir:

- amarillo
- naranja
- dorado
- verde
- marrón


==================================================
8. NO USAR UN SOLO RADIAL-GRADIENT
==================================================

La esfera interior debe construirse con VARIOS radial-gradient
superpuestos.

Utiliza una composición similar a esta como referencia:

background:

  /* reflejo superior fucsia */
  radial-gradient(
    ellipse at 50% 4%,
    rgba(235, 28, 116, 0.95) 0%,
    rgba(235, 28, 116, 0.55) 8%,
    rgba(235, 28, 116, 0.0) 22%
  ),

  /* halo violeta superior central */
  radial-gradient(
    circle at 50% 24%,
    rgba(174, 36, 162, 0.42) 0%,
    rgba(161, 15, 121, 0.20) 27%,
    transparent 55%
  ),

  /* rosa/fucsia derecho */
  radial-gradient(
    circle at 88% 45%,
    rgba(235, 28, 116, 0.38) 0%,
    rgba(235, 28, 116, 0.18) 30%,
    transparent 60%
  ),

  /* lavanda inferior izquierda */
  radial-gradient(
    circle at 28% 88%,
    rgba(138, 137, 239, 0.55) 0%,
    rgba(174, 36, 162, 0.28) 34%,
    transparent 62%
  ),

  /* violeta inferior */
  radial-gradient(
    circle at 54% 96%,
    rgba(93, 76, 220, 0.42) 0%,
    rgba(77, 0, 127, 0.18) 32%,
    transparent 60%
  ),

  /* cuerpo base rosa claro */
  radial-gradient(
    circle at 53% 48%,
    rgba(252, 202, 227, 0.95) 0%,
    rgba(246, 170, 214, 0.92) 42%,
    rgba(235, 135, 196, 0.88) 72%,
    rgba(210, 103, 188, 0.88) 100%
  );


==================================================
9. COLOR BASE DE LA ESFERA
==================================================

El color central NO debe ser #EB1C74 puro.

Ese color sería demasiado fuerte.

La esfera utiliza versiones aclaradas de la identidad.

Puedes derivarlas aproximadamente como:

Rosa claro:
#F7B5D5

Rosa perlado:
#F3A1CC

Lavanda:
#C9C5F0

Lavanda violeta:
#ADA0E4

Magenta suave:
#D786CA

Estos colores son SOLO derivados visuales.

Los colores corporativos originales siguen siendo:

#02003F
#4D007F
#700047
#A10F79
#AE24A2
#EB1C74


==================================================
10. REFLEJO SUPERIOR
==================================================

Este detalle es MUY IMPORTANTE.

En la referencia existe un reflejo horizontal/ovalado cerca de la parte superior de la esfera.

Debe verse aproximadamente:

       _________
    __/         \__
   rosa → blanco → rosa

Debe estar ubicado aproximadamente:

left: 50%
top: 4%–8%

Ancho:

25%–35% del diámetro de la esfera.

Altura:

5%–9%.

Referencia:

.orb-inner::before {
  content: "";
  position: absolute;

  left: 50%;
  top: 4%;

  width: 32%;
  height: 8%;

  transform: translateX(-50%);

  border-radius: 50%;

  background:
    radial-gradient(
      ellipse at center,
      rgba(255,255,255,.90) 0%,
      rgba(255,213,239,.75) 25%,
      rgba(235,28,116,.60) 48%,
      rgba(235,28,116,0) 76%
    );

  filter: blur(8px);

  opacity: .9;

  pointer-events: none;
}

Debe sentirse como un reflejo sobre vidrio/gel.

NO como una mancha sólida.


==================================================
11. REFLEJOS LATERALES
==================================================

Agregar un reflejo muy sutil en los laterales.

Especialmente:

- borde izquierdo superior
- borde derecho

Ejemplo:

.orb-inner::after {
  content: "";
  position: absolute;
  inset: 1.5%;

  border-radius: 50%;

  background:
    radial-gradient(
      ellipse at 13% 46%,
      rgba(255,255,255,.50),
      transparent 22%
    ),
    radial-gradient(
      ellipse at 91% 50%,
      rgba(255,255,255,.32),
      transparent 18%
    );

  filter: blur(4px);

  pointer-events: none;
}

La intensidad debe ser MUY BAJA.

No quiero una esfera metálica.

Debe seguir pareciendo gel/cristal.


==================================================
12. BORDE DE LA ESFERA
==================================================

La esfera interior tiene un borde luminoso muy fino.

No utilizar border sólido.

Usar:

- inset box-shadow
- highlight
- pseudo-elemento

Por ejemplo:

box-shadow:
  inset 0 0 0 1px rgba(255,255,255,.28),
  inset 12px 12px 32px rgba(255,255,255,.13),
  inset -16px -20px 40px rgba(91,63,190,.10),
  0 0 28px rgba(174,36,162,.08);

No exagerar el glow.


==================================================
13. BLUR / MATERIAL
==================================================

La esfera debe conservar detalle.

NO aplicar blur a toda la esfera.

El blur únicamente debe aplicarse a:

- reflejos
- overlays
- halos internos

No aplicar:

filter: blur(...)

al elemento principal porque destruiría el borde circular.


==================================================
14. RELACIÓN ENTRE ARO Y ESFERA
==================================================

En la referencia:

diámetro exterior = 100%

diámetro esfera interior ≈ 79%–81%

Por lo tanto el aro visible ocupa aproximadamente:

9.5%–10.5%

por cada lado.

Referencia conceptual:

.outer-orb {
   width: 100%;
   aspect-ratio: 1;
}

.inner-orb {
   width: 80%;
   height: 80%;
}


==================================================
15. POSICIÓN DE LA ESFERA INTERIOR
==================================================

La esfera interior NO está exactamente centrada geométricamente dentro del aro.

En la referencia está ligeramente desplazada hacia abajo.

Utilizar aproximadamente:

left: 50%;
top: 53%;

transform:
  translate(-50%, -50%);

o adaptar esta relación a la implementación actual.

El desplazamiento debe ser muy sutil:

+3% a +5% vertical.

NO modificar la posición global animada del objeto.

Este desplazamiento debe hacerse solamente dentro del wrapper visual.


==================================================
16. POSICIÓN GENERAL EN EL HERO
==================================================

NO modificarla si ya existe.

Como referencia visual, en una pantalla 1934×813:

centro horizontal aproximado:
x ≈ 960px

centro vertical del aro:
y ≈ 360px

diámetro exterior aproximado:
900px

Esto equivale aproximadamente a:

left: 50vw

center-y:
44%–45vh

diámetro:
46vw aproximadamente

PERO repito:

si el proyecto ya tiene tamaños y posiciones responsive correctos,
NO sustituyas esos valores.

Son únicamente referencias para comparar contra la captura.


==================================================
17. IMPLEMENTACIÓN CSS DE REFERENCIA COMPLETA
==================================================

No necesariamente debes copiar los nombres de clases.

Adáptalo a la estructura actual.

Referencia:

.hero-orb {
  position: relative;

  width: var(--existing-orb-size);
  aspect-ratio: 1;

  border-radius: 50%;

  background:
    conic-gradient(
      from 315deg at 50% 50%,
      #02003F 0deg,
      #02003F 42deg,
      #35105E 78deg,
      #4D007F 120deg,
      #700047 178deg,
      #A10F79 225deg,
      #EB1C74 282deg,
      #F0207A 326deg,
      #02003F 360deg
    );

  /*
   * NO AGREGAR aquí transforms o animation.
   * Conservar los existentes en el proyecto.
   */
}


.hero-orb__inner {
  position: absolute;

  width: 80%;
  height: 80%;

  left: 50%;
  top: 53%;

  transform: translate(-50%, -50%);

  border-radius: 50%;

  overflow: hidden;

  background:

    radial-gradient(
      ellipse at 50% 4%,
      rgba(235, 28, 116, .92) 0%,
      rgba(235, 28, 116, .62) 7%,
      rgba(235, 28, 116, .25) 14%,
      transparent 24%
    ),

    radial-gradient(
      circle at 51% 24%,
      rgba(174, 36, 162, .40) 0%,
      rgba(161, 15, 121, .22) 28%,
      transparent 54%
    ),

    radial-gradient(
      circle at 88% 44%,
      rgba(235, 28, 116, .35) 0%,
      rgba(235, 28, 116, .16) 31%,
      transparent 60%
    ),

    radial-gradient(
      circle at 27% 87%,
      rgba(183, 190, 247, .60) 0%,
      rgba(174, 36, 162, .25) 36%,
      transparent 64%
    ),

    radial-gradient(
      circle at 54% 98%,
      rgba(115, 105, 229, .48) 0%,
      rgba(77, 0, 127, .16) 34%,
      transparent 62%
    ),

    radial-gradient(
      circle at 52% 49%,
      #F8C6DD 0%,
      #F1AED2 35%,
      #E99AC8 63%,
      #D979BD 100%
    );

  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,.32),
    inset 14px 12px 34px rgba(255,255,255,.16),
    inset -18px -24px 42px rgba(73,48,180,.10),
    0 0 24px rgba(174,36,162,.08);
}


.hero-orb__inner::before {
  content: "";

  position: absolute;

  left: 50%;
  top: 3%;

  width: 32%;
  height: 9%;

  transform: translateX(-50%);

  border-radius: 50%;

  background:
    radial-gradient(
      ellipse at center,
      rgba(255,255,255,.96) 0%,
      rgba(255,220,241,.82) 22%,
      rgba(235,28,116,.68) 48%,
      rgba(235,28,116,.18) 66%,
      transparent 78%
    );

  filter: blur(7px);

  opacity: .95;

  pointer-events: none;
}


.hero-orb__inner::after {
  content: "";

  position: absolute;
  inset: 1%;

  border-radius: 50%;

  background:
    radial-gradient(
      ellipse at 12% 47%,
      rgba(255,255,255,.38) 0%,
      rgba(255,255,255,.16) 10%,
      transparent 25%
    ),

    radial-gradient(
      ellipse at 91% 49%,
      rgba(255,255,255,.28) 0%,
      rgba(255,255,255,.10) 10%,
      transparent 22%
    );

  filter: blur(4px);

  pointer-events: none;
}


==================================================
18. SI YA EXISTEN PSEUDO-ELEMENTOS
==================================================

No crear elementos innecesarios.

Si la implementación actual ya utiliza:

::before
::after

reutilizarlos.

El objetivo no es cambiar la arquitectura.

El objetivo es cambiar:

- gradients
- colors
- gradient positions
- shadows
- opacity
- light reflection

solamente.


==================================================
19. CONTRASTE CON EL TEXTO
==================================================

Existe texto negro grande encima de la esfera.

Por eso:

NO oscurecer el centro.

El área comprendida aproximadamente entre:

x 25%–75%
y 25%–70%

de la esfera debe mantenerse relativamente clara.

Debe existir suficiente contraste para:

texto negro
sobre
rosa/lila claro.

Los colores intensos deben concentrarse más en:

- aro exterior
- borde derecho
- borde inferior
- reflejo superior
- periferia de la esfera


==================================================
20. RESULTADO VISUAL ESPERADO
==================================================

La percepción final debe ser exactamente:

ARO:
navy profundo
→ morado
→ vino
→ magenta
→ fucsia

ESFERA:
rosa perlado
+ fucsia suave
+ violeta translúcido
+ lavanda inferior
+ reflejo superior brillante

Debe parecer:

premium
tecnológico
líquido
cristalino
moderno

NO debe parecer:

neón
cyberpunk
plástico duro
metal
glow excesivo
gradient genérico


==================================================
21. COSAS QUE NO DEBES CAMBIAR
==================================================

No modificar:

- texto
- tipografía
- tamaño de texto
- navbar
- logo
- CTA
- estructura del hero
- z-index salvo que sea estrictamente necesario
- responsive
- breakpoints
- animaciones
- velocidad
- desplazamiento
- rotación
- scale
- interacción
- cursor
- página completa
- otros componentes


==================================================
22. VALIDACIÓN VISUAL
==================================================

Después del cambio revisa específicamente:

1. El lado superior izquierdo del aro es navy oscuro.
2. El lado derecho del aro es fucsia.
3. El arco inferior pasa por vino/magenta.
4. La esfera central es mucho más clara que el aro.
5. Existe lavanda/violeta en la parte inferior.
6. Existe un reflejo fucsia/blanco horizontal arriba.
7. No existe amarillo.
8. No existe naranja.
9. No existe dorado.
10. El texto negro sigue siendo perfectamente legible.
11. La esfera mantiene aspecto 3D.
12. La animación se comporta exactamente igual que antes.


==================================================
23. IMPORTANTE SOBRE LA REFERENCIA
==================================================

Usa la captura proporcionada como fuente visual principal.

La referencia visual tiene prioridad sobre interpretaciones propias.

Si el código CSS que te proporcioné no coincide perfectamente con la
captura al ejecutarlo, AJUSTA los stops, opacidades y posiciones hasta
acercarte visualmente a la captura.

El código anterior es una especificación inicial de composición, no
una obligación de copiar valores sin comprobarlos.


==================================================
24. AL FINAL QUIERO UN REPORTE
==================================================

Cuando termines, indícame:

- componente modificado
- archivo CSS/Tailwind/SCSS modificado
- implementación anterior
- implementación nueva
- gradient final del aro
- gradients finales de la esfera
- colores utilizados
- stops utilizados
- pseudo-elementos utilizados
- confirmar que NO modificaste animaciones
- confirmar que NO modificaste responsive
- confirmar que NO modificaste tamaños o posición global del hero