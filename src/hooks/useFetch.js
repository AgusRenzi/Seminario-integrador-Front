import { useCallback, useEffect, useState } from 'react'

// Ejecuta una función de servicio y expone { data, loading, error, recargar }.
// `fetcher` es una función que devuelve una promesa (ej.: lotesService.listar).
// Si `fetcher` es null no hace nada (útil para pedir el detalle recién cuando hay algo elegido).
export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(Boolean(fetcher))
  const [error, setError] = useState(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!fetcher) {
      setData(null)
      setLoading(false)
      setError(null)
      return
    }

    let cancelado = false
    setLoading(true)
    setError(null)

    fetcher()
      .then((resultado) => {
        if (!cancelado) setData(resultado)
      })
      .catch((err) => {
        if (!cancelado) setError(err)
      })
      .finally(() => {
        if (!cancelado) setLoading(false)
      })

    // Si el componente se desmonta o cambian las deps antes de que llegue la respuesta, se ignora.
    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version])

  const recargar = useCallback(() => setVersion((v) => v + 1), [])

  return { data, loading, error, recargar }
}
