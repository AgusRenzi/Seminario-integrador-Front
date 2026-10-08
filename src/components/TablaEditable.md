# TablaEditable (+ CampoCelda)

Tabla con inputs por fila, para listas que el ingeniero arma antes de confirmar: percances en Registrar siembra e insumos en Registrar labor.

- **Provee el consumidor:** columnas `{ clave, titulo, num, render(fila, i) }`, filas, texto para la lista vacía y `pie` (fila de totales en `<tfoot>`, con línea `ink` arriba).
- Misma estética que DataTable (`.ac-table`) pero sin checkbox ni hover de selección (`.ac-table--lista`).
- `CampoCelda`: input o select compacto para una celda, sin rótulo visible (usa `aria-label`) y con el error debajo.
- La acción de agregar va arriba a la derecha (outline); la de quitar, en la última columna (outline chico).
