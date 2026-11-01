# Emily y el Bosque del 10

Juego web para que niños y niñas aprendan matemática jugando. Emily, una conejita, recorre un bosque, ayuda a los animales con sus cuentas y usa superpoderes para cruzar ríos, precipicios y cuevas oscuras.

**Jugar:** https://anamdinezio.github.io/bosque-del-10/

Funciona en computadora y en tablet, sin instalar nada. En Microsoft Edge, Ocre (la hoja que guía el juego) tiene una voz más natural.

## Qué se aprende

Está pensado para 2.º y 3.er grado y sigue las estrategias que se usan en las escuelas que trabajan con Common Core:

| Capítulo | Lugar | Qué se practica |
|---|---|---|
| Sumas | Claro de los Hongos | Amigos del 10 (3 + 7, 4 + 6...), marco de 10, number bonds y hacer 10 (8 + 5 = 8 + 2 + 3) |
| Restas | Río de las Piedras | Quitar de 10, familias de datos, bajar al 10 (13 − 5 = 13 − 3 − 2) y la resta como suma que falta |
| Multiplicación | Huerta de los Arrays | Arrays de filas y columnas, suma repetida, propiedad conmutativa y tablas del 2 al 10 |
| División | Cueva de las Bayas | Repartir en partes iguales, armar grupos, división con arrays y reglas del 0 y del 1 |
| Fracciones | | Próximamente |

Cada capítulo tiene 10 niveles. Cada tema empieza con objetos que se tocan (marcar puntos, armar un array, repartir bayas), sigue con dibujos y termina con la cuenta sola.

## Cómo se juega

- Flechas ← y → para caminar, flecha ↑ para saltar. En tablet aparecen botones en pantalla.
- Los animales del bosque piden ayuda con una cuenta. Algunos esperan arriba de los árboles y hay que subir por las ramas.
- La hoja de arriba a la derecha da pistas. Se pueden pedir todas las que hagan falta y no restan estrellas.
- Con el primer error, Ocre da una pista. Con el segundo, muestra la respuesta con un dibujo que la explica.
- Al final de cada nivel, Emily entra a una casita y recibe de 1 a 3 estrellas según los errores.

## Superpoderes

Cada poder está guardado en un número. Para activarlo hay que entrar al portal y elegir la cuenta cuyo resultado tenga ese número. Por ejemplo, para nadar sirve 9 + 6 = 15, porque tiene un 5.

| Poder | Número | Para qué sirve |
|---|---|---|
| Nadar | 5 | Cruzar ríos profundos |
| Saltar alto | 3 | Pasar troncos altos |
| Empujar | 8 | Mover piedras gigantes |
| Escalar | 9 | Subir paredes de roca |
| Volar | 4 | Cruzar precipicios |
| Camuflaje | 7 | Esconderse del oso hambriento |
| Hablar con animales | 2 | Convencer a Gruñón de que te deje pasar |
| Ver en la oscuridad | 6 | Cruzar cuevas oscuras |

Si Emily se cae al río o al precipicio sin el poder, la pantalla se pone en blanco y negro y el botón de volver atrás la lleva antes del portal para intentarlo de nuevo.

## Cómo está hecho

HTML, CSS y JavaScript sin librerías ni instalación. Los dibujos están hechos con código (canvas y SVG) y los sonidos del bosque se generan con Web Audio.

```
index.html        pantallas y ventanas
estilos.css       estilos
js/utiles.js      azar, guardado, sonidos y voz
js/dibujos.js     bosque, personajes y dibujos de las preguntas
js/niveles.js     capítulos, niveles, poderes y generadores de cuentas
js/juego.js       movimiento, desafíos, portales y pantallas
```

Para probarlo en tu computadora:

```bash
python -m http.server 8640
```

y abre `http://localhost:8640`. Agregando `?todo` a la dirección se abren todos los niveles.

## Autora

Hecho por Ana Di Nezio con [Claude Code](https://claude.com/claude-code).
