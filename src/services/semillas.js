import { api } from './api.js'

// /api/semillas — sin ?todas=true el back devuelve solo las Activas.

export const semillasService = {
  listarActivas: () => api.get('/semillas'),
  listarTodas: () => api.get('/semillas?todas=true'),
  crear: ({ nombre, stock, estacion, precioUnitario }) =>
    api.post('/semillas', { nombre, stock, estacion, precioUnitario }),
  actualizar: (id, { nombre, stock, estacion, precioUnitario }) =>
    api.put(`/semillas/${id}`, { nombre, stock, estacion, precioUnitario }),
  // Baja lógica: el DELETE del back solo pasa el estado a "Inactiva".
  darDeBaja: (id) => api.delete(`/semillas/${id}`),
  reactivar: (id) => api.put(`/semillas/${id}`, { estado: 'Activa' }),
  // CUU2 alternativo 2.a: suma toneladas al stock (entero mayor a 0).
  agregarStock: (id, cantidad) => api.patch(`/semillas/${id}/stock`, { cantidad }),
}
