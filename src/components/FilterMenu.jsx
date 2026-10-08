import Tilde from './Tilde.jsx'

// Ficha: components/FilterMenu.md
// Menú de "Ordenar por" / "Filtrar por": elegir una opción aplica al toque.
// opciones: [{ valor, etiqueta }]
export default function FilterMenu({ titulo, opciones, valor, onElegir, className = '' }) {
  return (
    <div className={`ac-menu ac-float ${className}`} role="menu" aria-label={titulo}>
      <div className="ac-menu__title ac-eyebrow" style={{ color: 'var(--ink-muted)' }}>
        {titulo}
      </div>
      {opciones.map((opcion) => {
        const elegida = opcion.valor === valor
        return (
          <button
            key={opcion.valor}
            type="button"
            className="opt"
            role="menuitemradio"
            aria-checked={elegida}
            onClick={() => onElegir(opcion.valor)}
          >
            {opcion.etiqueta}
            {elegida && <Tilde />}
          </button>
        )
      })}
    </div>
  )
}
