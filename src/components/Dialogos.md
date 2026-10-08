# DialogError y DialogCancelar

Dos usos fijos del Dialog que se repiten en todos los casos de uso.

## DialogError
- Muestra el `message` que devolvió el back. Eyebrow según el código: 400 "Revisá los datos", 409 "No se puede", 0 "Sin conexión", 5xx "Error del servidor".
- **Provee el consumidor:** el `ApiError`, el título ("No se pudo registrar la siembra") y detalle extra opcional como `children`. Ejemplo: la tabla de lotes sin cosechar del 409 de Cerrar campaña.
- Un solo botón: "Entendido" (primario).

## DialogCancelar
- Confirmación para abandonar un registro en curso. Explica qué se descarta y qué queda igual.
- Botones: "No, volver" (outline) y "Sí, cancelar" (`ac-btn--danger`, el único uso permitido de danger según Button.md).
