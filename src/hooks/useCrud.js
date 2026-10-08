import { useState } from 'react'
import { useFetch } from './useFetch.js'

// CRUD genérico para los catálogos. Recibe las funciones del servicio:
// { listar, crear, actualizar, darDeBaja, reactivar } (las que falten no se usan).
// Cada acción recarga la lista al terminar y relanza el error para que la página lo muestre.
export function useCrud(servicio) {
  const { data, loading, error, recargar } = useFetch(servicio.listar, [])
  const [guardando, setGuardando] = useState(false)

  async function ejecutar(accion) {
    setGuardando(true)
    try {
      const resultado = await accion()
      recargar()
      return resultado
    } finally {
      setGuardando(false)
    }
  }

  // Si el item tiene id, actualiza; si no, crea.
  const guardar = (id, datos) => ejecutar(() => (id ? servicio.actualizar(id, datos) : servicio.crear(datos)))
  const darDeBaja = (id) => ejecutar(() => servicio.darDeBaja(id))
  const reactivar = (id) => ejecutar(() => servicio.reactivar(id))

  return {
    items: data ?? [],
    loading,
    error,
    recargar,
    guardando,
    guardar,
    darDeBaja,
    reactivar,
  }
}
