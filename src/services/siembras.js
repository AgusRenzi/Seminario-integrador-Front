import { api } from './api.js'

// /api/siembras — CUU2 Registrar siembra.

export const siembrasService = {
  // Lotes "En uso" de campañas abiertas, con su semilla y campaña.
  lotesDisponibles: () => api.get('/siembras/lotes-disponibles'),
  // { loteSemillaCampaniaId, cantidadSembrada (entero), fechaSiembra, percances: [{ descripcion, fecha, costo }] }
  registrar: (datos) => api.post('/siembras', datos),
}
