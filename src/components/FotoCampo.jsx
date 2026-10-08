// Ficha: components/FotoCampo.md
// Reemplazo de la foto del campo del PageHeader: bloque --forest con surcos --lime-strong,
// el mismo dibujo que examples/asignar-lote.html. Cuando haya fotos reales, se cambia solo este componente.
export default function FotoCampo({ className = '' }) {
  return (
    <div className={`ac-foto ${className}`} role="img" aria-label="Foto del campo (pendiente: bloque de color provisorio)">
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect className="f1" width="400" height="300" />
        <g className="f2">
          <path d="M-40 300 L120 120 L140 120 L0 300Z" />
          <path d="M40 300 L150 120 L170 120 L80 300Z" />
          <path d="M120 300 L180 120 L200 120 L160 300Z" />
          <path d="M200 300 L210 120 L230 120 L240 300Z" />
          <path d="M280 300 L240 120 L260 120 L320 300Z" />
          <path d="M360 300 L270 120 L290 120 L400 300Z" />
        </g>
        <rect className="f4" y="0" width="400" height="120" opacity=".35" />
        <circle className="f4" cx="70" cy="60" r="26" />
      </svg>
    </div>
  )
}
