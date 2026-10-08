import { api } from './api.js'

// /api/cosechas — CUU4 Registrar cosecha.

export const cosechasService = {
  // Siembras de lotes "Sembrado" en campañas abiertas (con loteSemillaCampania.lote/semilla/campania).
  lotesDisponibles: () => api.get('/cosechas/lotes-disponibles'),
  // { loteSemillaCampaniaId, kilosHectarea, porcentajeHumedad, fechaCosecha } → { cosecha, rendimientoTotalKg }
  registrar: (datos) => api.post('/cosechas', datos),
}
