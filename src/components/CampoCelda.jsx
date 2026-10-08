// Ficha: components/TablaEditable.md
// Input compacto para una celda de TablaEditable: sin rótulo visible (lo pone aria-label) y con error debajo.
export default function CampoCelda({ etiqueta, error, onChange, as = 'input', opciones = [], ...props }) {
  const comunes = {
    className: `ac-input${error ? ' ac-input--error' : ''}`,
    'aria-label': etiqueta,
    'aria-invalid': error ? true : undefined,
    onChange: (e) => onChange(e.target.value),
    ...props,
  }

  return (
    <div className="ac-field">
      {as === 'select' ? (
        <select {...comunes}>
          {opciones.map((o) => (
            <option key={o.valor} value={o.valor} disabled={o.deshabilitada}>
              {o.etiqueta}
            </option>
          ))}
        </select>
      ) : (
        <input {...comunes} />
      )}
      {error && <span className="ac-field__error small">{error}</span>}
    </div>
  )
}
