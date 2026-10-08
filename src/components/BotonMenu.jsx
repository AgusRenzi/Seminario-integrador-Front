import { useEffect, useRef, useState } from 'react'
import Button from './Button.jsx'
import FilterMenu from './FilterMenu.jsx'

// Ficha: components/BotonMenu.md
// Botón Ordenar / Filtrar de la DataTable que abre su FilterMenu alineado al borde derecho.
export default function BotonMenu({ etiqueta, titulo, opciones, valor, onElegir }) {
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef(null)

  // Se cierra al hacer clic afuera o con Escape.
  useEffect(() => {
    if (!abierto) return
    const alClic = (e) => {
      if (contenedor.current && !contenedor.current.contains(e.target)) setAbierto(false)
    }
    const alTeclear = (e) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('mousedown', alClic)
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('mousedown', alClic)
      document.removeEventListener('keydown', alTeclear)
    }
  }, [abierto])

  function elegir(nuevoValor) {
    onElegir(nuevoValor)
    setAbierto(false)
  }

  return (
    <div className="ac-boton-menu" ref={contenedor}>
      <Button variante="outline" aria-haspopup="menu" aria-expanded={abierto} onClick={() => setAbierto((a) => !a)}>
        {etiqueta}
      </Button>
      {abierto && <FilterMenu titulo={titulo} opciones={opciones} valor={valor} onElegir={elegir} />}
    </div>
  )
}
