import { useEffect } from 'react'

// Ficha: components/Overlay.md
// Fondo oscuro que centra un Dialog. Escape o clic afuera llaman a onCerrar (si se pasa).
export default function Overlay({ onCerrar, children }) {
  useEffect(() => {
    if (!onCerrar) return
    const alTeclear = (e) => {
      if (e.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [onCerrar])

  return (
    <div
      className="ac-overlay"
      onMouseDown={(e) => {
        if (onCerrar && e.target === e.currentTarget) onCerrar()
      }}
    >
      {children}
    </div>
  )
}
