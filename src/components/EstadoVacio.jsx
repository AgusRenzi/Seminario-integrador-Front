// Ficha: components/EstadoVacio.md
// Lista vacía: título, explicación y (opcional) la acción que lo resuelve.
export default function EstadoVacio({ titulo, texto, accion }) {
  return (
    <div className="ac-vacio">
      <h3 className="ac-display display-s">{titulo}</h3>
      {texto && <p>{texto}</p>}
      {accion}
    </div>
  )
}
