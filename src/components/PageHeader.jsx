import FotoCampo from './FotoCampo.jsx'

// Ficha: components/PageHeader.md
// Título en mosaico (2 líneas lime), foto encastrada, tarjeta de dato a la derecha y bajada alineada.
// dato: { rotulo, valor, barras: [{ etiqueta, valor }] (hasta 4), pie }
export default function PageHeader({ lineas, bajada, dato }) {
  const [linea1, linea2] = lineas

  return (
    <header className="ac-hero">
      <h1 className="ac-mosaic ac-hero__l1" aria-label={lineas.join(' ')}>
        <span className="ac-mosaic__line">{linea1}</span>
      </h1>
      {dato && <TarjetaDato {...dato} />}
      <FotoCampo className="ac-hero__foto" />
      {linea2 && (
        <div className="ac-mosaic ac-hero__l2" aria-hidden="true">
          <span className="ac-mosaic__line">{linea2}</span>
        </div>
      )}
      {bajada && <p className="lead ac-hero__bajada">{bajada}</p>}
    </header>
  )
}

function TarjetaDato({ rotulo, valor, barras = [], pie }) {
  const visibles = barras.slice(0, 4)
  const maximo = Math.max(...visibles.map((b) => Number(b.valor) || 0), 1)

  return (
    <div className="ac-card ac-data ac-hero__kpi">
      <div className="ac-eyebrow" style={{ color: 'var(--fg-muted)' }}>
        {rotulo}
      </div>
      <div className="display-xl ac-num" style={{ color: 'var(--lime)' }}>
        {valor}
      </div>
      {visibles.length > 0 && (
        <>
          <svg className="ac-kpi__barras" viewBox="0 0 220 80" width="100%" height="80" aria-hidden="true">
            <line className="ac-kpi__eje" x1="0" y1="79" x2="220" y2="79" strokeWidth="1" />
            {visibles.map((b, i) => {
              const alto = Math.max(4, Math.round(((Number(b.valor) || 0) / maximo) * 69))
              const ultima = i === visibles.length - 1
              return <rect key={i} className={ultima ? 'f4' : 'f2'} x={6 + i * 54} y={79 - alto} width="34" height={alto} rx="3" />
            })}
          </svg>
          <div className="ac-eyebrow ac-kpi__pie">
            {visibles.map((b, i) => (
              <span key={i}>{b.etiqueta}</span>
            ))}
          </div>
        </>
      )}
      {pie && (
        <div className="ac-eyebrow" style={{ color: 'var(--fg-muted)', marginTop: 'var(--space-2)' }}>
          {pie}
        </div>
      )}
    </div>
  )
}
