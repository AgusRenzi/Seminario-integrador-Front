// Ficha: components/EstadoCarga.md
// Placeholder mientras llega la respuesta del back: barras line-cream que laten.
export default function EstadoCarga({ filas = 4, texto = 'Cargando…' }) {
  return (
    <div className="ac-carga" role="status" aria-busy="true">
      <span className="small" style={{ color: 'var(--ink-muted)' }}>
        {texto}
      </span>
      {Array.from({ length: filas }, (_, i) => (
        <div key={i} className="ac-skel" />
      ))}
    </div>
  )
}
