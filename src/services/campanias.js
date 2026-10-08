import { api } from './api.js'

// /api/campanias — CUU1 (asignar lote) y CUU5 (cerrar campaña).

export const campaniasService = {
  // Devuelve asignaciones lote–semilla–campaña de las campañas Abiertas (una fila por lote).
  listarAbiertas: () => api.get('/campanias'),
  // { campania, lotes: [{ loteSemillaCampaniaId, lote, semilla, cantidadSembrada, kilosHectarea }] }
  obtener: (id) => api.get(`/campanias/${id}`),
  // CUU1: crea la campaña, la asocia al lote y la semilla, y pasa el lote a "En uso".
  asignarLote: ({ loteId, semillaId, fecha, temporada }) =>
    api.post('/campanias', { lote_id: loteId, semilla_id: semillaId, fecha, temporada }),
  // CUU5: 409 con { message, lotes } si hay lotes sin cosechar, o si ya estaba cerrada.
  cerrar: (id) => api.patch(`/campanias/${id}/cerrar`),
}
