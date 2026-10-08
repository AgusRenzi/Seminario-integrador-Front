import { api } from './api.js'

// /api/labores — catálogo de labores de mantenimiento (descripción + costo base).

export const laboresService = {
  listar: () => api.get('/labores'),
  crear: ({ descripcion, costeBase }) => api.post('/labores', { descripcion, costeBase }),
  actualizar: (id, { descripcion, costeBase }) => api.put(`/labores/${id}`, { descripcion, costeBase }),
}
