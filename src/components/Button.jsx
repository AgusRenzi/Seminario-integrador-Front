import { Link } from 'react-router-dom'

// Ficha: components/Button.md
// variante: primary | lime | outline | cream | ghost | danger. Un solo primary por pantalla.
// enFondo: contorno lime para el primario apoyado sobre el fondo bosque.
// to: si se pasa, renderiza un Link de react-router con el mismo aspecto.
export default function Button({ variante = 'outline', enFondo = false, chico = false, to, className = '', type = 'button', children, ...props }) {
  const clases = [
    'ac-btn',
    `ac-btn--${variante}`,
    enFondo && 'ac-btn--en-fondo',
    chico && 'ac-btn--chico',
    className,
  ].filter(Boolean).join(' ')

  if (to) {
    return (
      <Link to={to} className={clases} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={clases} {...props}>
      {children}
    </button>
  )
}
