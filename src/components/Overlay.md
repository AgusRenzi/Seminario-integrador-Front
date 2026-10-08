# Overlay

Fondo oscuro (`--ink` al 70%) que centra un Dialog sobre la pantalla. El sistema de diseño muestra el Dialog suelto; esto lo vuelve modal.

- **Provee el consumidor:** `onCerrar` (opcional). Si se pasa, Escape o un clic afuera lo llaman.
- Mientras se envía algo al back, no pasar `onCerrar` para que no se cierre a mitad de la operación.
- Lo usa `Dialog` internamente: las páginas no lo montan solas.
