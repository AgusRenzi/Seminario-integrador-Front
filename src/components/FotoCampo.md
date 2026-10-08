# FotoCampo

Reemplazo provisorio de la foto del campo del PageHeader: bloque `--forest` con surcos `--lime-strong` y cielo `--lime` al 35%, el mismo dibujo del marcador de `examples/asignar-lote.html`.

- **Provee el consumidor:** nada (solo `className` para ubicarlo en la grilla).
- Lo usa `PageHeader` en las 5 pantallas de entrada (CUU1 a CUU5), columnas 1–4 debajo de la línea 1 del título.
- `radius-md`, nunca a sangre completa ni con texto encima.
- Cuando haya fotos reales, se cambia solo este componente por un `<img>` con `object-fit: cover` dentro del mismo contenedor `.ac-foto`.
