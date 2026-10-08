import { api } from './api.js'

// /api/insumos — hoy el back solo lista y edita stock y precio.
// Alta (POST) y baja lógica (campo estado) están en una rama sin mergear: se agregan acá cuando lleguen.

export const insumosService = {
  listar: () => api.get('/insumos'),
  actualizar: (id, { stock, precioUnitario }) => api.put(`/insumos/${id}`, { stock, precioUnitario }),
}
