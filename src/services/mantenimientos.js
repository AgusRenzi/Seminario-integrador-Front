import { api } from './api.js'

// /api/mantenimientos — CUU3 Registrar labor.

export const mantenimientosService = {
  // Lotes "Sembrado" de campañas abiertas.
  lotesDisponibles: () => api.get('/mantenimientos/lotes-disponibles'),
  // { loteSemillaCampaniaId, laborId, fecha, insumos: [{ insumoId, cantidad }] } → { mantenimiento, costoInsumos, costoTotal }
  registrar: (datos) => api.post('/mantenimientos', datos),
}
