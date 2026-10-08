import { useEffect, useId, useRef } from 'react'
import Overlay from './Overlay.jsx'

// Ficha: components/Dialog.md
// variante: "confirmar" (crema, pregunta + consecuencia), "ok" (lime, eyebrow "Listo", un botón Cerrar),
// "error" (crema, para los 400/409 del back). ancho: para formularios de alta/edición.
export default function Dialog({ variante = 'confirmar', eyebrow, titulo, children, acciones, onCerrar, ancho = false }) {
  const idTitulo = useId()
  const caja = useRef(null)

  // Al abrir, el foco va al diálogo para que lectores de pantalla y teclado lo encuentren.
  useEffect(() => {
    caja.current?.focus()
  }, [])

  const clases = [
    'ac-dialog',
    'ac-float',
    variante === 'ok' && 'ac-dialog--ok',
    variante === 'error' && 'ac-dialog--error',
    ancho && 'ac-dialog--ancho',
  ].filter(Boolean).join(' ')

  return (
    <Overlay onCerrar={onCerrar}>
      <div
        ref={caja}
        tabIndex={-1}
        className={clases}
        role={variante === 'confirmar' ? 'dialog' : 'alertdialog'}
        aria-modal="true"
        aria-labelledby={idTitulo}
      >
        {eyebrow && <span className="ac-eyebrow">{eyebrow}</span>}
        <h3 id={idTitulo} className="ac-display display-s">
          {titulo}
        </h3>
        {children}
        {acciones && <div className="ac-dialog__actions">{acciones}</div>}
      </div>
    </Overlay>
  )
}
