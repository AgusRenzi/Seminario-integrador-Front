import Tilde from './Tilde.jsx'

// Ficha: components/Stepper.md
// pasos: ['Seleccionar lote', ...]; actual: índice del paso en curso.
// Los pasos completos se pueden tocar para volver (onIr), reemplazando al botón "Modificar" de los bosquejos.
export default function Stepper({ pasos, actual, onIr }) {
  return (
    <ol className="ac-steps">
      {pasos.map((paso, i) => {
        if (i < actual) {
          const volver = onIr ? () => onIr(i) : undefined
          return (
            <li
              key={paso}
              className="done"
              role={volver ? 'button' : undefined}
              tabIndex={volver ? 0 : undefined}
              title={volver ? `Volver a "${paso}"` : undefined}
              onClick={volver}
              onKeyDown={(e) => {
                if (volver && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  volver()
                }
              }}
            >
              <span className="n">
                <Tilde />
              </span>
              {paso}
            </li>
          )
        }
        return (
          <li key={paso} aria-current={i === actual ? 'step' : undefined}>
            <span className="n">{i + 1}</span>
            {paso}
          </li>
        )
      })}
    </ol>
  )
}
