import { useState } from 'react'
import BotonMenu from '../components/BotonMenu.jsx'
import Button from '../components/Button.jsx'
import DataTable from '../components/DataTable.jsx'
import Dialog from '../components/Dialog.jsx'
import DialogCancelar from '../components/DialogCancelar.jsx'
import DialogError from '../components/DialogError.jsx'
import Field from '../components/Field.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Panel from '../components/Panel.jsx'
import Stepper from '../components/Stepper.jsx'
import { useFetch } from '../hooks/useFetch.js'
import { cosechasService } from '../services/cosechas.js'
import { fecha, hectareas, hoyISO, kilos, kilosPorHa, nombreCampania, parsearNumero, porcentaje, toneladas } from '../utils/format.js'

// CUU4 – Registrar cosecha
const PASOS = ['Seleccionar lote', 'Datos de cosecha', 'Confirmar cosecha']

export default function RegistrarCosechaPage() {
  const disponibles = useFetch(cosechasService.lotesDisponibles, [])

  const [paso, setPaso] = useState(0)
  const [siembra, setSiembra] = useState(null) // siembra del lote elegido (trae loteSemillaCampania)
  const [kilosTexto, setKilosTexto] = useState('')
  const [humedadTexto, setHumedadTexto] = useState('')
  const [fechaCosecha, setFechaCosecha] = useState(hoyISO())
  const [errores, setErrores] = useState({})
  const [filtro, setFiltro] = useState('todos')
  const [orden, setOrden] = useState('sup-mayor')

  const [dialogo, setDialogo] = useState(null) // 'confirmar' | 'cancelar' | 'ok' | 'error'
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState(null)

  const todas = disponibles.data ?? []
  const cultivos = [...new Set(todas.map((s) => s.loteSemillaCampania.semilla.nombre))]
  const visibles = todas
    .filter((s) => filtro === 'todos' || s.loteSemillaCampania.semilla.nombre === filtro)
    .sort((a, b) => {
      const sa = a.loteSemillaCampania.lote.superficie
      const sb = b.loteSemillaCampania.lote.superficie
      return orden === 'sup-menor' ? sa - sb : sb - sa
    })

  const asignacion = siembra?.loteSemillaCampania
  const lote = asignacion?.lote
  const semilla = asignacion?.semilla
  const kilosHa = parsearNumero(kilosTexto)
  const humedad = parsearNumero(humedadTexto)
  const rindeEstimado = lote && kilosHa > 0 ? kilosHa * Number(lote.superficie) : null

  function validar() {
    const nuevos = {}
    if (Number.isNaN(kilosHa) || kilosHa <= 0) nuevos.kilos = 'Ingresá los kilos por hectárea (mayor a 0).'
    if (Number.isNaN(humedad) || humedad < 0 || humedad > 100) nuevos.humedad = 'La humedad va de 0 a 100 %.'
    if (!fechaCosecha) nuevos.fecha = 'Elegí la fecha de cosecha.'
    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  function reiniciar() {
    setPaso(0)
    setSiembra(null)
    setKilosTexto('')
    setHumedadTexto('')
    setFechaCosecha(hoyISO())
    setErrores({})
    setDialogo(null)
  }

  async function registrar() {
    setEnviando(true)
    try {
      const respuesta = await cosechasService.registrar({
        loteSemillaCampaniaId: asignacion.id,
        kilosHectarea: kilosHa,
        porcentajeHumedad: humedad,
        fechaCosecha,
      })
      setResultado({ lote: lote.nroLote, cultivo: semilla.nombre, rinde: respuesta.rendimientoTotalKg, kilosHa, humedad })
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
    disponibles.recargar()
  }

  function cerrarError() {
    setDialogo(null)
    // 409 (alternativo 2.a: sin campaña activa, o ya cosechado): se vuelve a la lista actualizada.
    if (error?.status === 409 || error?.status === 404) {
      reiniciar()
      disponibles.recargar()
    }
  }

  const lateral = siembra ? (
    <>
      <Panel
        titulo={`Lote ${lote.nroLote}`}
        estado="Elegido"
        filas={[
          { rotulo: 'Cultivo', valor: semilla.nombre, texto: true },
          { rotulo: 'Superficie', valor: hectareas(lote.superficie) },
          { rotulo: 'Sembrado', valor: toneladas(siembra.cantidadSembrada) },
          { rotulo: 'Fecha siembra', valor: fecha(siembra.fechaSiembra) },
          { rotulo: 'Campaña', valor: nombreCampania(asignacion.campania?.fecha), ancho: true },
        ]}
      />
      {paso >= 1 && (
        <Panel
          titulo="Rinde total"
          estado="Estimado"
          variante="surface"
          filas={[
            { rotulo: 'Total', valor: rindeEstimado === null ? '—' : kilos(rindeEstimado), destacado: true, ancho: true },
            { rotulo: 'Por hectárea', valor: kilosHa > 0 ? kilosPorHa(kilosHa) : '—' },
            { rotulo: 'Superficie', valor: hectareas(lote.superficie) },
          ]}
        />
      )}
    </>
  ) : (
    <Panel titulo="Sin lote" estado="Paso 1" variante="surface">
      <p className="small" style={{ margin: 0 }}>
        Elegí el lote que se cosechó.
      </p>
    </Panel>
  )

  return (
    <>
      <PageHeader
        lineas={['Registrar', 'cosecha']}
        bajada="Elegí el lote cosechado y cargá los kilos por hectárea y la humedad. El rinde total se calcula con la superficie."
        dato={{
          rotulo: 'Listos para cosechar',
          valor: disponibles.loading ? '…' : todas.length,
          barras: todas.map((s) => ({ etiqueta: `L${s.loteSemillaCampania.lote.nroLote}`, valor: Number(s.loteSemillaCampania.lote.superficie) })),
          pie: hectareas(todas.reduce((t, s) => t + Number(s.loteSemillaCampania.lote.superficie), 0)),
        }}
      />

      <div className="ac-steps-wrap">
        <Stepper pasos={PASOS} actual={paso} onIr={setPaso} />
      </div>

      <div className="ac-cuerpo">
        <div className="ac-cuerpo__lateral">{lateral}</div>

        {paso === 0 && (
          <DataTable
            titulo="Lotes para cosechar"
            columnas={[
              { clave: 'lote', titulo: 'Lote', render: (s) => `Lote ${s.loteSemillaCampania.lote.nroLote}` },
              { clave: 'cultivo', titulo: 'Cultivo', render: (s) => s.loteSemillaCampania.semilla.nombre },
              { clave: 'campania', titulo: 'Campaña', render: (s) => nombreCampania(s.loteSemillaCampania.campania?.fecha) },
              { clave: 'superficie', titulo: 'Superficie', num: true, render: (s) => hectareas(s.loteSemillaCampania.lote.superficie) },
            ]}
            filas={visibles}
            seleccionadaId={siembra?.id}
            onSeleccionar={setSiembra}
            cargando={disponibles.loading}
            error={disponibles.error}
            onReintentar={disponibles.recargar}
            vacio={
              todas.length === 0
                ? {
                    titulo: 'No hay lotes en condiciones de cosecha',
                    texto: 'Solo se cosechan lotes Sembrados de campañas abiertas.',
                  }
                : { titulo: 'Ningún lote coincide con el filtro' }
            }
            herramientas={
              <>
                <BotonMenu
                  etiqueta="Filtrar"
                  titulo="Filtrar por semilla"
                  valor={filtro}
                  onElegir={setFiltro}
                  opciones={[{ valor: 'todos', etiqueta: 'Todas' }, ...cultivos.map((c) => ({ valor: c, etiqueta: c }))]}
                />
                <BotonMenu
                  etiqueta="Ordenar"
                  titulo="Ordenar por"
                  valor={orden}
                  onElegir={setOrden}
                  opciones={[
                    { valor: 'sup-mayor', etiqueta: 'Mayor superficie' },
                    { valor: 'sup-menor', etiqueta: 'Menor superficie' },
                  ]}
                />
              </>
            }
            acciones={
              <>
                <Button variante="outline" onClick={() => (siembra ? setDialogo('cancelar') : reiniciar())}>
                  Cancelar
                </Button>
                <Button variante="lime" disabled={!siembra} onClick={() => setPaso(1)}>
                  Seleccionar
                </Button>
              </>
            }
          />
        )}

        {paso === 1 && (
          <section className="ac-cream ac-cream--big">
            <div className="ac-toolbar">
              <h2 className="ac-display display-m">Datos de la cosecha</h2>
            </div>
            <div className="ac-form">
              <div className="ac-form__fila">
                <Field
                  id="kilos-ha"
                  label="Cantidad cosechada por hectárea (kg/ha)"
                  inputMode="decimal"
                  placeholder="Ej.: 3200"
                  value={kilosTexto}
                  onChange={(e) => setKilosTexto(e.target.value)}
                  error={errores.kilos}
                />
                <Field
                  id="humedad"
                  label="Humedad obtenida (%)"
                  inputMode="decimal"
                  placeholder="Ej.: 13,5"
                  value={humedadTexto}
                  onChange={(e) => setHumedadTexto(e.target.value)}
                  error={errores.humedad}
                  ayuda="Entre 0 y 100."
                />
              </div>
              <div className="ac-form__fila">
                <Field
                  id="fecha-cosecha"
                  label="Fecha de cosecha"
                  type="date"
                  value={fechaCosecha}
                  onChange={(e) => setFechaCosecha(e.target.value)}
                  error={errores.fecha}
                />
              </div>
            </div>
            <div className="ac-actions ac-actions--entre">
              <Button variante="danger" onClick={() => setDialogo('cancelar')}>
                Cancelar registro
              </Button>
              <Button variante="lime" onClick={() => validar() && setPaso(2)}>
                Siguiente
              </Button>
            </div>
          </section>
        )}

        {paso === 2 && (
          <section className="ac-cream ac-cream--big">
            <div className="ac-toolbar">
              <h2 className="ac-display display-m">Confirmar cosecha</h2>
            </div>
            <table className="ac-table ac-table--lista">
              <tbody>
                <tr>
                  <td>Lote</td>
                  <td className="num">Lote {lote.nroLote} · {semilla.nombre}</td>
                </tr>
                <tr>
                  <td>Fecha de cosecha</td>
                  <td className="num">{fecha(fechaCosecha)}</td>
                </tr>
                <tr>
                  <td>Cantidad por hectárea</td>
                  <td className="num">{kilosPorHa(kilosHa)}</td>
                </tr>
                <tr>
                  <td>Humedad</td>
                  <td className="num">{porcentaje(humedad)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td>Rinde total estimado</td>
                  <td className="num">{kilos(rindeEstimado)}</td>
                </tr>
              </tfoot>
            </table>
            <div className="ac-actions ac-actions--entre">
              <Button variante="outline" onClick={() => setPaso(1)}>
                Modificar
              </Button>
              <Button variante="primary" onClick={() => setDialogo('confirmar')}>
                Registrar cosecha
              </Button>
            </div>
          </section>
        )}
      </div>

      {dialogo === 'confirmar' && (
        <Dialog
          titulo="¿Registrar esta cosecha?"
          onCerrar={enviando ? undefined : () => setDialogo(null)}
          acciones={
            <>
              <Button variante="outline" disabled={enviando} onClick={() => setDialogo(null)}>
                No, volver
              </Button>
              <Button variante="primary" disabled={enviando} onClick={registrar}>
                {enviando ? 'Registrando…' : 'Sí, registrar'}
              </Button>
            </>
          }
        >
          <p className="ac-dialog__texto">
            Se registran {kilosPorHa(kilosHa)} con {porcentaje(humedad)} de humedad y el Lote {lote.nroLote} pasa a{' '}
            <b style={{ color: 'var(--ink)' }}>Cosechado</b>.
          </p>
        </Dialog>
      )}

      {dialogo === 'ok' && (
        <Dialog
          variante="ok"
          eyebrow="Listo"
          titulo={`Lote ${resultado.lote} cosechado: ${kilos(resultado.rinde)}`}
          onCerrar={cerrarExito}
          acciones={
            <Button variante="primary" onClick={cerrarExito}>
              Cerrar
            </Button>
          }
        >
          <p style={{ margin: 0 }}>
            {resultado.cultivo}: {kilosPorHa(resultado.kilosHa)} con {porcentaje(resultado.humedad)} de humedad. El lote pasó a Cosechado.
          </p>
        </Dialog>
      )}

      {dialogo === 'error' && <DialogError error={error} titulo="No se pudo registrar la cosecha" onCerrar={cerrarError} />}

      {dialogo === 'cancelar' && (
        <DialogCancelar
          titulo="¿Cancelar el registro de la cosecha?"
          texto="Se descartan los datos cargados. El lote sigue Sembrado."
          onConfirmar={reiniciar}
          onVolver={() => setDialogo(null)}
        />
      )}
    </>
  )
}
