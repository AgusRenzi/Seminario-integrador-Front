// Ficha: components/Panel.md
// variante "lime" = lo que el usuario eligió (el lote); "surface" = datos de contexto (stock, costos).
// filas: [{ rotulo, valor, texto (nombre propio en sans), destacado (cifra en lime), ancho (ocupa las 2 columnas) }]
export default function Panel({ titulo, estado, variante = 'lime', filas = [], children }) {
  const fondo = variante === 'lime' ? 'ac-limecard' : 'ac-data'

  return (
    <article className={`ac-card ${fondo} ac-detail`}>
      <div className="ac-detail__head">
        <h3 className="ac-display display-s">{titulo}</h3>
        {estado && (
          <span className="ac-eyebrow" style={variante === 'surface' ? { color: 'var(--fg-muted)' } : undefined}>
            {estado}
          </span>
        )}
      </div>
      {filas.length > 0 && (
        <dl className="ac-detail__rows" style={{ margin: 0 }}>
          {filas.map((fila) => (
            <div key={fila.rotulo} style={fila.ancho ? { gridColumn: '1 / -1' } : undefined}>
              <dt>{fila.rotulo}</dt>
              <dd
                className={fila.texto ? 'ac-detail__texto' : undefined}
                style={fila.destacado ? { color: 'var(--lime)' } : undefined}
              >
                {fila.valor}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {children}
    </article>
  )
}
