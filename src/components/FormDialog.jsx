import Button from './Button.jsx'
import Dialog from './Dialog.jsx'
import Mensaje from './Mensaje.jsx'

// Ficha: components/FormDialog.md
// Alta / edición de un catálogo dentro de un Dialog crema ancho.
// children: los Field del formulario. error: ApiError devuelto por el back (400/409) para mostrar arriba.
export default function FormDialog({ titulo, children, error, guardando, etiquetaGuardar = 'Guardar', onGuardar, onCancelar }) {
  return (
    <Dialog titulo={titulo} ancho onCerrar={guardando ? undefined : onCancelar}>
      <form
        className="ac-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          onGuardar()
        }}
      >
        {error && (
          <Mensaje tipo="error" titulo="No se pudo guardar">
            {error.message}
          </Mensaje>
        )}
        {children}
        <div className="ac-dialog__actions">
          <Button variante="outline" disabled={guardando} onClick={onCancelar}>
            Cancelar
          </Button>
          <Button type="submit" variante="lime" disabled={guardando}>
            {guardando ? 'Guardando…' : etiquetaGuardar}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
