import Button from './Button.jsx'
import Dialog from './Dialog.jsx'

// Ficha: components/Dialogos.md
// Muestra el mensaje que devolvió el back (400 validación, 409 regla de negocio, sin conexión).
// children: detalle extra (ej.: la lista de lotes sin cosechar del 409 de cerrar campaña).

function rotulo(status) {
  if (status === 400) return 'Revisá los datos'
  if (status === 404) return 'No encontrado'
  if (status === 409) return 'No se puede'
  if (status === 0) return 'Sin conexión'
  return 'Error del servidor'
}

export default function DialogError({ error, titulo = 'No se pudo completar la operación', onCerrar, children }) {
  return (
    <Dialog
      variante="error"
      eyebrow={rotulo(error?.status)}
      titulo={titulo}
      onCerrar={onCerrar}
      acciones={
        <Button variante="primary" onClick={onCerrar}>
          Entendido
        </Button>
      }
    >
      <p className="ac-dialog__texto">{error?.message ?? 'Ocurrió un error inesperado.'}</p>
      {children}
    </Dialog>
  )
}
