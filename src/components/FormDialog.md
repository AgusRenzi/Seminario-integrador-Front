# FormDialog

Alta y edición de un registro de catálogo dentro de un Dialog crema ancho.

- **Provee el consumidor:** título, los Field del formulario como `children`, el error del back (`ApiError`), `guardando`, `onGuardar` y `onCancelar`.
- Validación en la página antes de llamar a `onGuardar`; los errores van en cada Field. El error del back (400/409) se muestra arriba con un Mensaje.
- Acciones: Cancelar (outline) + Guardar (lime). Enter dentro de un campo envía el formulario.
