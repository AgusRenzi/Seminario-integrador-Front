// Ficha: components/Field.md
// Rótulo arriba, input blanco, ayuda o error debajo. Siempre dentro de una tarjeta crema.
// as="select" con opciones [{ valor, etiqueta }]; accion = botón lime pegado al input.
export default function Field({ id, label, ayuda, error, accion, as = 'input', opciones = [], children, ...props }) {
  const idTexto = `${id}-texto`
  const tieneTexto = Boolean(error || ayuda)
  const clases = `ac-input${error ? ' ac-input--error' : ''}`
  const comunes = {
    id,
    className: clases,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': tieneTexto ? idTexto : undefined,
    ...props,
  }

  let control = children
  if (!control) {
    control =
      as === 'select' ? (
        <select {...comunes}>
          {opciones.map((o) => (
            <option key={o.valor} value={o.valor} disabled={o.deshabilitada}>
              {o.etiqueta}
            </option>
          ))}
        </select>
      ) : (
        <input {...comunes} />
      )
  }

  return (
    <div className="ac-field">
      <label htmlFor={id}>{label}</label>
      {accion ? (
        <div className="ac-field__row">
          {control}
          {accion}
        </div>
      ) : (
        control
      )}
      {error ? (
        <span id={idTexto} className="ac-field__error small">
          {error}
        </span>
      ) : (
        ayuda && (
          <span id={idTexto} className="ac-field__help">
            {ayuda}
          </span>
        )
      )}
    </div>
  )
}
