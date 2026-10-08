import { useState } from 'react'
import BotonMenu from '../components/BotonMenu.jsx'
import Button from '../components/Button.jsx'
import DataTable from '../components/DataTable.jsx'
import Dialog from '../components/Dialog.jsx'
import DialogCancelar from '../components/DialogCancelar.jsx'
import DialogError from '../components/DialogError.jsx'
import EstadoVacio from '../components/EstadoVacio.jsx'
import Field from '../components/Field.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Panel from '../components/Panel.jsx'
import Stepper from '../components/Stepper.jsx'
import { useFetch } from '../hooks/useFetch.js'
import { campaniasService } from '../services/campanias.js'
import { lotesService } from '../services/lotes.js'
import { semillasService } from '../services/semillas.js'
import { fecha, hectareas, hoyISO, nombreCampania, numero, toneladas } from '../utils/format.js'

// CUU1 – Asignar lote. Pantalla modelo: examples/asignar-lote.html
const PASOS = ['Seleccionar lote', 'Seleccionar semilla', 'Confirmar asignación']
const TEMPORADAS = ['Verano', 'Invierno']

export default function AsignarLotePage() {
  const lotes = useFetch(lotesService.listar, [])
  const semillas = useFetch(semillasService.listarActivas, [])

  const [paso, setPaso] = useState(0)
  // Memoria temporal del caso de uso: nada se guarda hasta confirmar.
  const [lote, setLote] = useState(null)
  const [semilla, setSemilla] = useState(null)
  const [fechaInicio, setFechaInicio] = useState(hoyISO())
  const [temporada, setTemporada] = useState('Verano')
  const [errorFecha, setErrorFecha] = useState('')

  const [ordenLotes, setOrdenLotes] = useState('mayor')
  const [filtroEstacion, setFiltroEstacion] = useState('todas')
  const [ordenStock, setOrdenStock] = useState('mayor')

  const [dialogo, setDialogo] = useState(null) // 'confirmar' | 'cancelar' | 'ok' | 'error'
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [creada, setCreada] = useState(null)

  // Paso 1: lotes que no tienen un cultivo activo.
  const lotesLibres = (lotes.data ?? [])
    .filter((l) => l.estado === 'Libre')
    .sort((a, b) => (ordenLotes === 'mayor' ? b.superficie - a.superficie : a.superficie - b.superficie))
  const hectareasLibres = lotesLibres.reduce((total, l) => total + Number(l.superficie), 0)

  // Paso 2: semillas activas con stock. Si no hay ninguna, es el alternativo 2.a.
  const semillasConStock = (semillas.data ?? []).filter((s) => s.estado === 'Activa' && Number(s.stock) > 0)
  const semillasVisibles = semillasConStock
    .filter((s) => filtroEstacion === 'todas' || s.estacion === filtroEstacion)
    .sort((a, b) => (ordenStock === 'mayor' ? b.stock - a.stock : a.stock - b.stock))
  const sinSemillas = !semillas.loading && !semillas.error && semillasConStock.length === 0

  function reiniciar() {
    setPaso(0)
    setLote(null)
    setSemilla(null)
    setFechaInicio(hoyISO())
    setTemporada('Verano')
    setErrorFecha('')
    setDialogo(null)
  }

  function elegirSemilla() {
    if (TEMPORADAS.includes(semilla.estacion)) setTemporada(semilla.estacion)
    setPaso(2)
  }

  // Alternativo 2.a: se libera el lote de la memoria temporal sin alterar su estado.
  function liberarLote() {
    setLote(null)
    setPaso(0)
  }

  function pedirConfirmacion() {
    if (!fechaInicio) {
      setErrorFecha('Elegí la fecha de inicio de la campaña.')
      return
    }
    setErrorFecha('')
    setDialogo('confirmar')
  }

  async function asignar() {
    setEnviando(true)
    try {
      await campaniasService.asignarLote({ loteId: lote.id, semillaId: semilla.id, fecha: fechaInicio, temporada })
      setCreada({ campania: nombreCampania(fechaInicio), lote: lote.nroLote })
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
    lotes.recargar()
    semillas.recargar()
  }

  function cerrarError() {
    setDialogo(null)
    // 409: el lote o la semilla cambiaron mientras tanto. Se vuelve a empezar con datos frescos.
    if (error?.status === 409) {
      reiniciar()
      lotes.recargar()
      semillas.recargar()
    }
  }

  const cancelar = () => (lote || semilla ? setDialogo('cancelar') : reiniciar())

  const panelLote = lote ? (
    <Panel
      titulo={`Lote ${lote.nroLote}`}
      estado="Elegido"
      filas={[
        { rotulo: 'Zona', valor: lote.zona, texto: true },
        { rotulo: 'Superficie', valor: hectareas(lote.superficie) },
      ]}
    />
  ) : (
    <Panel titulo="Sin lote" estado="Paso 1" variante="surface">
      <p className="small" style={{ margin: 0 }}>
        Elegí un lote libre de la tabla para seguir.
      </p>
    </Panel>
  )

  const panelSemilla = semilla && paso >= 1 && (
    <Panel
      titulo={semilla.nombre}
      estado={semilla.estacion}
      variante="surface"
      filas={[{ rotulo: 'Stock', valor: toneladas(semilla.stock), destacado: true }]}
    />
  )

  return (
    <>
      <PageHeader
        lineas={['Asignar lote', 'a una campaña']}
        bajada="Elegí un lote libre, la semilla y la fecha de inicio. La campaña queda creada al confirmar."
        dato={{
          rotulo: 'Hectáreas libres',
          valor: lotes.loading ? '…' : numero(hectareasLibres, 1),
          barras: lotesLibres.map((l) => ({ etiqueta: `L${l.nroLote}`, valor: Number(l.superficie) })),
          pie: `${lotesLibres.length} ${lotesLibres.length === 1 ? 'lote libre' : 'lotes libres'}`,
        }}
      />

      <div className="ac-steps-wrap">
        <Stepper pasos={PASOS} actual={paso} onIr={setPaso} />
      </div>

      <div className="ac-cuerpo">
        <div className="ac-cuerpo__lateral">
          {panelLote}
          {panelSemilla}
        </div>

        {paso === 0 && (
          <DataTable
            titulo="Lotes libres"
            columnas={[
              { clave: 'nroLote', titulo: 'Lote', render: (l) => `Lote ${l.nroLote}` },
              { clave: 'zona', titulo: 'Zona' },
              { clave: 'superficie', titulo: 'Superficie', num: true, render: (l) => hectareas(l.superficie) },
            ]}
            filas={lotesLibres}
            seleccionadaId={lote?.id}
            onSeleccionar={setLote}
            cargando={lotes.loading}
            error={lotes.error}
            onReintentar={lotes.recargar}
            vacio={{
              titulo: 'No hay lotes libres',
              texto: 'Todos los lotes tienen un cultivo activo. Cerrá una campaña o cargá un lote nuevo.',
              accion: (
                <Button variante="outline" to="/lotes">
                  Ir a Lotes
                </Button>
              ),
            }}
            herramientas={
              <BotonMenu
                etiqueta="Ordenar"
                titulo="Ordenar por"
                valor={ordenLotes}
                onElegir={setOrdenLotes}
                opciones={[
                  { valor: 'mayor', etiqueta: 'Mayor superficie' },
                  { valor: 'menor', etiqueta: 'Menor superficie' },
                ]}
              />
            }
            acciones={
              <>
                <Button variante="outline" onClick={cancelar}>
                  Cancelar
                </Button>
                <Button variante="lime" disabled={!lote} onClick={() => setPaso(1)}>
                  Seleccionar
                </Button>
              </>
            }
          />
        )}

        {paso === 1 && sinSemillas && (
          <section className="ac-cream ac-cream--big">
            <EstadoVacio
              titulo="No hay semillas con stock"
              texto={`No hay semillas con stock disponible para sembrar el Lote ${lote.nroLote}. El lote sigue libre y no se registró nada.`}
              accion={
                <Button variante="lime" onClick={liberarLote}>
                  Volver a lotes
                </Button>
              }
            />
          </section>
        )}

        {paso === 1 && !sinSemillas && (
          <DataTable
            titulo="Semillas disponibles"
            columnas={[
              { clave: 'nombre', titulo: 'Nombre' },
              { clave: 'estacion', titulo: 'Estación' },
              { clave: 'stock', titulo: 'Stock', num: true, render: (s) => toneladas(s.stock) },
            ]}
            filas={semillasVisibles}
            seleccionadaId={semilla?.id}
            onSeleccionar={setSemilla}
            cargando={semillas.loading}
            error={semillas.error}
            onReintentar={semillas.recargar}
            vacio={{ titulo: 'Ninguna semilla coincide con el filtro', texto: 'Probá con otra estación.' }}
            herramientas={
              <>
                <BotonMenu
                  etiqueta="Filtrar"
                  titulo="Filtrar por estación"
                  valor={filtroEstacion}
                  onElegir={setFiltroEstacion}
                  opciones={[
                    { valor: 'todas', etiqueta: 'Todas' },
                    { valor: 'Verano', etiqueta: 'Verano' },
                    { valor: 'Invierno', etiqueta: 'Invierno' },
                  ]}
                />
                <BotonMenu
                  etiqueta="Ordenar"
                  titulo="Ordenar por"
                  valor={ordenStock}
                  onElegir={setOrdenStock}
                  opciones={[
                    { valor: 'mayor', etiqueta: 'Mayor stock' },
                    { valor: 'menor', etiqueta: 'Menor stock' },
                  ]}
                />
              </>
            }
            acciones={
              <>
                <Button variante="outline" onClick={cancelar}>
                  Cancelar
                </Button>
                <Button variante="lime" disabled={!semilla} onClick={elegirSemilla}>
                  Seleccionar
                </Button>
              </>
            }
          />
        )}

        {paso === 2 && (
          <section className="ac-cream ac-cream--big">
            <div className="ac-toolbar">
              <h2 className="ac-display display-m">Detalle de la campaña</h2>
              <span className="ac-eyebrow" style={{ color: 'var(--ink-muted)' }}>
                Campaña {nombreCampania(fechaInicio)}
              </span>
            </div>
            <div className="ac-form">
              <p className="body" style={{ margin: 0 }}>
                Lote {lote.nroLote} · {hectareas(lote.superficie)} · {lote.zona} · {semilla.nombre} ({semilla.estacion})
              </p>
              <div className="ac-form__fila">
                <Field
                  id="fecha-inicio"
                  label="Fecha de inicio de campaña"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  error={errorFecha}
                  ayuda={fechaInicio ? `La campaña ${nombreCampania(fechaInicio)} empieza el ${fecha(fechaInicio)}.` : undefined}
                />
                <Field
                  id="temporada"
                  label="Temporada"
                  as="select"
                  value={temporada}
                  onChange={(e) => setTemporada(e.target.value)}
                  opciones={TEMPORADAS.map((t) => ({ valor: t, etiqueta: t }))}
                  ayuda="Se completa con la estación de la semilla. Podés cambiarla."
                />
              </div>
            </div>
            <div className="ac-actions">
              <Button variante="danger" onClick={() => setDialogo('cancelar')}>
                Cancelar asignación
              </Button>
              <Button variante="primary" onClick={pedirConfirmacion}>
                Confirmar asignación
              </Button>
            </div>
          </section>
        )}
      </div>

      {dialogo === 'confirmar' && (
        <Dialog
          titulo={`¿Asignar el Lote ${lote.nroLote} a ${semilla.nombre}?`}
          onCerrar={enviando ? undefined : () => setDialogo(null)}
          acciones={
            <>
              <Button variante="outline" disabled={enviando} onClick={() => setDialogo(null)}>
                No, volver
              </Button>
              <Button variante="primary" disabled={enviando} onClick={asignar}>
                {enviando ? 'Asignando…' : 'Sí, asignar'}
              </Button>
            </>
          }
        >
          <p className="ac-dialog__texto">
            Se crea la campaña {nombreCampania(fechaInicio)} ({temporada}) con inicio el {fecha(fechaInicio)} y el Lote{' '}
            {lote.nroLote} pasa a <b style={{ color: 'var(--ink)' }}>En uso</b>.
          </p>
        </Dialog>
      )}

      {dialogo === 'ok' && (
        <Dialog
          variante="ok"
          eyebrow="Listo"
          titulo={`Campaña ${creada.campania} creada en el Lote ${creada.lote}`}
          onCerrar={cerrarExito}
          acciones={
            <Button variante="primary" onClick={cerrarExito}>
              Cerrar
            </Button>
          }
        >
          <p style={{ margin: 0 }}>El lote pasó a En uso. Ya podés registrar la siembra.</p>
        </Dialog>
      )}

      {dialogo === 'error' && <DialogError error={error} titulo="No se pudo asignar el lote" onCerrar={cerrarError} />}

      {dialogo === 'cancelar' && (
        <DialogCancelar
          titulo="¿Cancelar la asignación?"
          texto="Se descartan el lote y la semilla elegidos. No se registra nada."
          onConfirmar={reiniciar}
          onVolver={() => setDialogo(null)}
        />
      )}
    </>
  )
}
