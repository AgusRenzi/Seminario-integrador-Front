// Ficha: components/Mensaje.md
// Aviso del sistema dentro de una tarjeta crema. tipo: "error" | "aviso" | "ok".
export default function Mensaje({ tipo = 'error', titulo, children }) {
  return (
    <div className={`ac-msg ac-msg--${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      {titulo && <span className="ac-msg__titulo">{titulo}</span>}
      {children && <div className="small">{children}</div>}
    </div>
  )
}
