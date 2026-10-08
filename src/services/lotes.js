import { api } from './api.js'

// /api/lotes — catálogo de lotes. El estado (Libre, En uso, Sembrado, Cosechado) lo cambian los casos de uso.
// No se expone DELETE: el back borra el registro de verdad y el resto del sistema usa baja lógica.

export const lotesService = {
  listar: () => api.get('/lotes'),
  obtener: (id) => api.get(`/lotes/${id}`),
  // El back crea el lote siempre en "Libre".
  crear: ({ nroLote, superficie, distanciaSurcos, zona }) =>
    api.post('/lotes', { nroLote, superficie, distanciaSurcos, zona }),
  // El back ignora nroLote en la edición.
  actualizar: (id, { superficie, distanciaSurcos, zona }) =>
    api.put(`/lotes/${id}`, { superficie, distanciaSurcos, zona }),
}
