# Mensaje

Aviso del sistema dentro de una tarjeta crema: errores de carga, "Stock insuficiente de X", confirmaciones de guardado en los catálogos.

- **Provee el consumidor:** `tipo` (`error` | `aviso` | `ok`), título y texto opcional.
- Borde de 1.5px: `--danger` (error), `--steel` (aviso), `--lime-strong` (ok). El texto va en `ink`: el rojo nunca es la única señal.
- `role="alert"` para errores y `role="status"` para el resto.
- Para errores que cortan una operación (400/409 al confirmar) se usa `DialogError`, no este componente.
