import Button from './Button.jsx'
import Dialog from './Dialog.jsx'

// Ficha: components/Dialogos.md
// Confirmación para cancelar un registro en curso: la acción va en ac-btn--danger, como pide Button.md.
export default function DialogCancelar({ titulo, texto, onConfirmar, onVolver }) {
  return (
    <Dialog
      titulo={titulo}
      onCerrar={onVolver}
      acciones={
        <>
          <Button variante="outline" onClick={onVolver}>
            No, volver
          </Button>
          <Button variante="danger" onClick={onConfirmar}>
            Sí, cancelar
          </Button>
        </>
      }
    >
      <p className="ac-dialog__texto">{texto}</p>
    </Dialog>
  )
}
