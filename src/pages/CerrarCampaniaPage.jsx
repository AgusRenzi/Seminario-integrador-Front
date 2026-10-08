import { useState } from 'react'
import BotonMenu from '../components/BotonMenu.jsx'
import Button from '../components/Button.jsx'
import DataTable from '../components/DataTable.jsx'
import Dialog from '../components/Dialog.jsx'
import DialogCancelar from '../components/DialogCancelar.jsx'
import DialogError from '../components/DialogError.jsx'
import EstadoTag from '../components/EstadoTag.jsx'
import Mensaje from '../components/Mensaje.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Panel from '../components/Panel.jsx'
import Stepper from '../components/Stepper.jsx'
import { useFetch } from '../hooks/useFetch.js'
import { campaniasService } from '../services/campanias.js'
import { fecha, kilos, nombreCampania, porcentaje, toneladas } from '../utils/format.js'

// CUU5 – Cerrar campaña
const PASOS = ['Seleccionar campaña', 'Revisar campaña', 'Confirmar cierre']

// GET /campanias devuelve una fila por lote: se agrupan por campaña.
function agruparPorCampania(asignaciones) {
  const grupos = new Map()
  for (const a of asignaciones) {
    const id = a.campania.id
    if (!grupos.has(id)) grupos.set(id, { id, campania: a.campania, asignaciones: [] })
    grupos.get(id).asignaciones.push(a)
  }
  return [...grupos.values()]
}

const listaLotes = (lotes) => lotes.map((l) => `Lote ${l.nroLote}`).join(', ')

export default function CerrarCampaniaPage() {
  const abiertas = useFetch(campaniasService.listarAbiertas, [])

  const [paso, setPaso] = useState(0)
  const [grupo, setGrupo] = useState(null)
  const [orden, setOrden] = useState('recientes')
  const [dialogo, setDialogo] = useState(null) // 'confirmar' | 'cancelar' | 'ok' | 'error'
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [cerrada, setCerrada] = useState(null)

  // El detalle (siembra y cosecha de cada lote) se pide recién cuando hay una campaña elegida.
  const campaniaId = paso >= 1 ? grupo?.id : null
  const detalle = useFetch(campaniaId ? () => campaniasService.obtener(campaniaId) : null, [campaniaId])

  const grupos = agruparPorCampania(abiertas.data ?? []).sort((a, b) => {
    const fa = String(a.campania.fecha ?? '')
    const fb = String(b.campania.fecha ?? '')
    return orden === 'antiguas' ? fa.localeCompare(fb) : fb.localeCompare(fa)
  })

  const lotesDetalle = detalle.data?.lotes ?? []
  const pendientes = lotesDetalle.filter((l) => l.lote.estado !== 'Cosechado')
  // La humedad la va a devolver el back cuando se mergee el cambio pendiente; hasta entonces no viene el campo.
  const faltaHumedad = lotesDetalle.some((l) => !('porcentajeHumedad' in l))
  const nombre = grupo ? nombreCampania(grupo.campania.fecha) : ''

  function reiniciar() {
    setPaso(0)
    setGrupo(null)
    setDialogo(null)
  }

  async function cerrar() {
    setEnviando(true)
    try {
      await campaniasService.cerrar(grupo.id)
      setCerrada({ nombre, lotes: listaLotes(lotesDetalle.map((l) => l.lote)) })
      setDialogo('ok')
    } catch (err) {
      setError(err)
      setDialogo('error')
    } finally {
      setEnviando(false)
    }
  }

  function cerrarExito() {
    reiniciar()
    abiertas.recargar()
  }

  function cerrarError() {
    setDialogo(null)
    if (error?.data?.lotes) {
      // 409 con lotes sin cosechar: la campaña sigue Abierta, se vuelve al detalle con datos frescos.
      setPaso(1)
      detalle.recargar()
    } else {
      // Ya estaba cerrada, no existe o error del servidor: se vuelve a la lista.
      reiniciar()
      abiertas.recargar()
    }
  }

  const lateral = grupo ? (
    <Panel
      titulo={`Campaña ${nombre}`}
      estado={grupo.campania.estado}
      filas={[
        { rotulo: 'Temporada', valor: grupo.campania.temporada, texto: true },
        { rotulo: 'Inicio', valor: fecha(grupo.campania.fecha) },
        { rotulo: 'Lotes', valor: listaLotes(grupo.asignaciones.map((a) => a.lote)), texto: true, ancho: true },
      ]}
    />
  ) : (
    <Panel titulo="Sin campaña" estado="Paso 1" variante="surface">
      <p className="small" style={{ margin: 0 }}>
        Elegí la campaña que terminó su ciclo productivo.
      </p>
    </Panel>
  )

  return (
    <>
      <PageHeader
        lineas={['Cerrar', 'campaña']}
        bajada="Elegí una campaña abierta y revisá sus lotes. Al cerrarla, los lotes cosechados vuelven a estar libres."
        dato={{
          rotulo: 'Campañas abiertas',
          valor: abiertas.loading ? '…' : grupos.length,
          barras: grupos.map((g) => ({ etiqueta: `C${g.id}`, valor: g.asignaciones.length })),
          pie: `${(abiertas.data ?? []).length} lotes en curso`,
        }}
      />

      <div className="ac-steps-wrap">
        <Stepper pasos={PASOS} actual={paso} onIr={setPaso} />
      </div>

      <div className="ac-cuerpo">
        <div className="ac-cuerpo__lateral">{lateral}</div>

        {paso === 0 && (
          <DataTable
            titulo="Campañas abiertas"
            columnas={[
              { clave: 'campania', titulo: 'Campaña', render: (g) => nombreCampania(g.campania.fecha) },
              { clave: 'temporada', titulo: 'Temporada', render: (g) => g.campania.temporada },
              { clave: 'inicio', titulo: 'Inicio', render: (g) => fecha(g.campania.fecha) },
              {
                clave: 'lotes',
                titulo: 'Lotes',
                render: (g) => (
                  <span style={{ display: 'inline-flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
                    {g.asignaciones.map((a) => (
                      <span key={a.id}>
                        Lote {a.lote.nroLote} <EstadoTag estado={a.lote.estado} />
                      </span>
                    ))}
                  </span>
                ),
              },
            ]}
            filas={grupos}
            seleccionadaId={grupo?.id}
            onSeleccionar={setGrupo}
            cargando={abiertas.loading}
            error={abiertas.error}
            onReintentar={abiertas.recargar}
            vacio={{
              titulo: 'No hay campañas abiertas',
              texto: 'Todas las campañas están cerradas. Para abrir una, asigná un lote.',
              accion: (
                <Button variante="outline" to="/lotes/asignar">
                  Asignar lote
                </Button>
              ),
            }}
            herramientas={
              <BotonMenu
                etiqueta="Ordenar"
                titulo="Ordenar por"
                valor={orden}
                onElegir={setOrden}
                opciones={[
                  { valor: 'recientes', etiqueta: 'Más recientes' },
                  { valor: 'antiguas', etiqueta: 'Más antiguas' },
                ]}
              />
            }
            acciones={
              <>
                <Button variante="outline" onClick={reiniciar}>
                  Cancelar
                </Button>
                <Button variante="lime" disabled={!grupo} onClick={() => setPaso(1)}>
                  Seleccionar
                </Button>
              </>
            }
          />
        )}

        {paso >= 1 && (
          <DataTable
            titulo="Lotes de la campaña"
            columnas={[
              { clave: 'lote', titulo: 'Lote', render: (l) => `Lote ${l.lote.nroLote}` },
              { clave: 'estado', titulo: 'Estado', render: (l) => <EstadoTag estado={l.lote.estado} /> },
              { clave: 'semilla', titulo: 'Semilla', render: (l) => l.semilla.nombre },
              { clave: 'sembrado', titulo: 'Sembrado', num: true, render: (l) => (l.cantidadSembrada === null ? '—' : toneladas(l.cantidadSembrada)) },
              {
                clave: 'cosechado',
                titulo: 'Cosechado',
                num: true,
                render: (l) => (l.kilosHectarea === null ? '—' : kilos(l.kilosHectarea * Number(l.lote.superficie))),
              },
              {
                clave: 'humedad',
                titulo: 'Humedad',
                num: true,
                render: (l) => (l.porcentajeHumedad === null || l.porcentajeHumedad === undefined ? '—' : porcentaje(l.porcentajeHumedad)),
              },
            ]}
            getId={(l) => l.loteSemillaCampaniaId}
            filas={lotesDetalle}
            cargando={detalle.loading}
            error={detalle.error}
            onReintentar={detalle.recargar}
            vacio={{ titulo: 'La campaña no tiene lotes asociados' }}
            acciones={
              <>
                <Button variante="outline" onClick={() => setDialogo('cancelar')}>
                  Cancelar
                </Button>
                <Button
                  variante="primary"
                  disabled={detalle.loading || Boolean(detalle.error)}
                  onClick={() => {
                    setPaso(2)
                    setDialogo('confirmar')
                  }}
                >
                  Cerrar campaña
                </Button>
              </>
            }
          >
            {!detalle.loading && pendientes.length > 0 && (
              <Mensaje tipo="aviso" titulo="Hay lotes sin cosechar">
                Solo se puede cerrar con todos los lotes en Cosechado. Pendientes:{' '}
                {pendientes.map((l) => `Lote ${l.lote.nroLote} (${l.lote.estado})`).join(', ')}.
              </Mensaje>
            )}
            {!detalle.loading && faltaHumedad && lotesDetalle.length > 0 && (
              <Mensaje tipo="aviso" titulo="Humedad pendiente">
                El backend todavía no envía la humedad de la cosecha en el detalle de la campaña.
              </Mensaje>
            )}
            {!detalle.loading && (pendientes.length > 0 || faltaHumedad) && <div style={{ height: 'var(--space-5)' }} />}
          </DataTable>
        )}
      </div>

      {dialogo === 'confirmar' && (
        <Dialog
          titulo={`¿Cerrar la campaña ${nombre}?`}
          onCerrar={
            enviando
              ? undefined
              : () => {
                  setDialogo(null)
                  setPaso(1)
                }
          }
          acciones={
            <>
              <Button
                variante="outline"
                disabled={enviando}
                onClick={() => {
                  setDialogo(null)
                  setPaso(1)
                }}
              >
                No, volver
              </Button>
              <Button variante="primary" disabled={enviando} onClick={cerrar}>
                {enviando ? 'Cerrando…' : 'Sí, cerrar'}
              </Button>
            </>
          }
        >
          <p className="ac-dialog__texto">
            La campaña pasa a <b style={{ color: 'var(--ink)' }}>Cerrada</b> y{' '}
            {listaLotes(lotesDetalle.map((l) => l.lote)) || 'sus lotes'} vuelve(n) a <b style={{ color: 'var(--ink)' }}>Libre</b>. No se
            puede deshacer.
          </p>
        </Dialog>
      )}

      {dialogo === 'ok' && (
        <Dialog
          variante="ok"
          eyebrow="Listo"
          titulo={`Campaña ${cerrada.nombre} cerrada`}
          onCerrar={cerrarExito}
          acciones={
            <Button variante="primary" onClick={cerrarExito}>
              Cerrar
            </Button>
          }
        >
          <p style={{ margin: 0 }}>{cerrada.lotes} volvió a Libre y ya se puede asignar a una nueva campaña.</p>
        </Dialog>
      )}

      {dialogo === 'error' && (
        <DialogError error={error} titulo="No se pudo cerrar la campaña" onCerrar={cerrarError}>
          {error?.data?.lotes?.length > 0 && (
            <table className="ac-table ac-table--lista">
              <thead>
                <tr>
                  <th>Lote</th>
                  <th>Estado actual</th>
                </tr>
              </thead>
              <tbody>
                {error.data.lotes.map((l) => (
                  <tr key={l.nroLote}>
                    <td>Lote {l.nroLote}</td>
                    <td>
                      <EstadoTag estado={l.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DialogError>
      )}

      {dialogo === 'cancelar' && (
        <DialogCancelar
          titulo="¿Cancelar el cierre?"
          texto="La campaña sigue Abierta y no se modifica ningún lote."
          onConfirmar={reiniciar}
          onVolver={() => setDialogo(null)}
        />
      )}
    </>
  )
}
