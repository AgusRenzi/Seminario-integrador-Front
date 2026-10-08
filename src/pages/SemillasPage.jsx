import { useState } from 'react'
import BotonMenu from '../components/BotonMenu.jsx'
import Button from '../components/Button.jsx'
import CatalogoHeader from '../components/CatalogoHeader.jsx'
import DataTable from '../components/DataTable.jsx'
import Dialog from '../components/Dialog.jsx'
import DialogError from '../components/DialogError.jsx'
import EstadoTag from '../components/EstadoTag.jsx'
import Field from '../components/Field.jsx'
import FormDialog from '../components/FormDialog.jsx'
import Mensaje from '../components/Mensaje.jsx'
import { useCrud } from '../hooks/useCrud.js'
import { semillasService } from '../services/semillas.js'
import { parsearNumero, pesos, toneladas } from '../utils/format.js'

// Catálogo de semillas. La baja es lógica: cambia el estado a Inactiva, nunca se borra.
const ESTACIONES = ['Verano', 'Invierno']
const FORM_VACIO = { nombre: '', estacion: 'Verano', stock: '', precioUnitario: '' }

const servicio = {
  listar: semillasService.listarTodas,
  crear: semillasService.crear,
  actualizar: semillasService.actualizar,
  darDeBaja: semillasService.darDeBaja,
  reactivar: semillasService.reactivar,
}

export default function SemillasPage() {
  const crud = useCrud(servicio)
  const [filtro, setFiltro] = useState('Activa')
  const [orden, setOrden] = useState('nombre')
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [errores, setErrores] = useState({})
  const [errorApi, setErrorApi] = useState(null)
  const [aBaja, setABaja] = useState(null)
  const [errorBaja, setErrorBaja] = useState(null)
  const [aviso, setAviso] = useState('')

  const filas = crud.items
    .filter((s) => filtro === 'todas' || s.estado === filtro || s.estacion === filtro)
    .sort((a, b) => {
      if (orden === 'stock-mayor') return b.stock - a.stock
      if (orden === 'stock-menor') return a.stock - b.stock
      return a.nombre.localeCompare(b.nombre)
    })

  function abrir(semilla) {
    setEditando(semilla ?? {})
    setForm(
      semilla
        ? { nombre: semilla.nombre, estacion: semilla.estacion, stock: String(semilla.stock), precioUnitario: String(semilla.precioUnitario) }
        : FORM_VACIO,
    )
    setErrores({})
    setErrorApi(null)
  }

  function validar() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Indicá el nombre de la semilla.'
    const stock = parsearNumero(form.stock)
    if (!Number.isInteger(stock) || stock < 0) e.stock = 'Toneladas enteras, 0 o más.'
    const precio = parsearNumero(form.precioUnitario)
    if (Number.isNaN(precio) || precio < 0) e.precioUnitario = 'Precio de 0 o más.'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  async function guardar() {
    if (!validar()) return
    try {
      await crud.guardar(editando.id, {
        nombre: form.nombre.trim(),
        estacion: form.estacion,
        stock: parsearNumero(form.stock),
        precioUnitario: parsearNumero(form.precioUnitario),
      })
      setAviso(editando.id ? `${form.nombre.trim()} actualizada.` : `${form.nombre.trim()} creada como Activa.`)
      setEditando(null)
    } catch (err) {
      setErrorApi(err)
    }
  }

  async function confirmarBaja() {
    try {
      await crud.darDeBaja(aBaja.id)
      setAviso(`${aBaja.nombre} pasó a Inactiva.`)
      setABaja(null)
    } catch (err) {
      setABaja(null)
      setErrorBaja(err)
    }
  }

  async function reactivar(semilla) {
    try {
      await crud.reactivar(semilla.id)
      setAviso(`${semilla.nombre} volvió a Activa.`)
    } catch (err) {
      setErrorBaja(err)
    }
  }

  const campo = (clave) => (e) => setForm((f) => ({ ...f, [clave]: e.target.value }))

  return (
    <>
      <CatalogoHeader
        titulo="Semillas"
        bajada="Stock en toneladas. Solo las semillas Activas con stock se ofrecen al asignar un lote."
        acciones={
          <Button variante="primary" enFondo onClick={() => abrir(null)}>
            Nueva semilla
          </Button>
        }
      />

      <DataTable
        titulo={filtro === 'Inactiva' ? 'Semillas dadas de baja' : 'Semillas'}
        columnas={[
          { clave: 'nombre', titulo: 'Nombre' },
          { clave: 'estacion', titulo: 'Estación' },
          { clave: 'stock', titulo: 'Stock', num: true, render: (s) => toneladas(s.stock) },
          { clave: 'precio', titulo: 'Precio por t', num: true, render: (s) => pesos(s.precioUnitario) },
          { clave: 'estado', titulo: 'Estado', render: (s) => <EstadoTag estado={s.estado} /> },
          {
            clave: 'acciones',
            titulo: '',
            render: (s) => (
              <>
                <Button variante="outline" chico onClick={() => abrir(s)}>
                  Modificar
                </Button>
                {s.estado === 'Activa' ? (
                  <Button variante="outline" chico onClick={() => setABaja(s)}>
                    Dar de baja
                  </Button>
                ) : (
                  <Button variante="outline" chico disabled={crud.guardando} onClick={() => reactivar(s)}>
                    Reactivar
                  </Button>
                )}
              </>
            ),
          },
        ]}
        filas={filas}
        cargando={crud.loading}
        error={crud.error}
        onReintentar={crud.recargar}
        vacio={
          crud.items.length === 0
            ? { titulo: 'Todavía no hay semillas', texto: 'Cargá la primera con "Nueva semilla".' }
            : { titulo: 'Ninguna semilla coincide con el filtro' }
        }
        herramientas={
          <>
            <BotonMenu
              etiqueta="Filtrar"
              titulo="Filtrar por"
              valor={filtro}
              onElegir={setFiltro}
              opciones={[
                { valor: 'Activa', etiqueta: 'Activas' },
                { valor: 'Inactiva', etiqueta: 'Inactivas' },
                { valor: 'Verano', etiqueta: 'Estación: Verano' },
                { valor: 'Invierno', etiqueta: 'Estación: Invierno' },
                { valor: 'todas', etiqueta: 'Todas' },
              ]}
            />
            <BotonMenu
              etiqueta="Ordenar"
              titulo="Ordenar por"
              valor={orden}
              onElegir={setOrden}
              opciones={[
                { valor: 'nombre', etiqueta: 'Nombre' },
                { valor: 'stock-mayor', etiqueta: 'Mayor stock' },
                { valor: 'stock-menor', etiqueta: 'Menor stock' },
              ]}
            />
          </>
        }
      >
        {aviso && (
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <Mensaje tipo="ok" titulo={aviso} />
          </div>
        )}
      </DataTable>

      {editando && (
        <FormDialog
          titulo={editando.id ? `Modificar ${editando.nombre}` : 'Nueva semilla'}
          etiquetaGuardar={editando.id ? 'Guardar cambios' : 'Crear semilla'}
          guardando={crud.guardando}
          error={errorApi}
          onGuardar={guardar}
          onCancelar={() => setEditando(null)}
        >
          <div className="ac-form__fila">
            <Field id="semilla-nombre" label="Nombre" placeholder="Ej.: Soja" value={form.nombre} onChange={campo('nombre')} error={errores.nombre} />
            <Field
              id="semilla-estacion"
              label="Estación"
              as="select"
              value={form.estacion}
              onChange={campo('estacion')}
              opciones={ESTACIONES.map((e) => ({ valor: e, etiqueta: e }))}
            />
          </div>
          <div className="ac-form__fila">
            <Field
              id="semilla-stock"
              label="Stock (t)"
              inputMode="numeric"
              placeholder="Ej.: 25"
              value={form.stock}
              onChange={campo('stock')}
              error={errores.stock}
              ayuda="Toneladas enteras."
            />
            <Field
              id="semilla-precio"
              label="Precio por tonelada ($)"
              inputMode="decimal"
              placeholder="Ej.: 640000"
              value={form.precioUnitario}
              onChange={campo('precioUnitario')}
              error={errores.precioUnitario}
            />
          </div>
        </FormDialog>
      )}

      {aBaja && (
        <Dialog
          titulo={`¿Dar de baja ${aBaja.nombre}?`}
          onCerrar={crud.guardando ? undefined : () => setABaja(null)}
          acciones={
            <>
              <Button variante="outline" disabled={crud.guardando} onClick={() => setABaja(null)}>
                No, volver
              </Button>
              <Button variante="primary" disabled={crud.guardando} onClick={confirmarBaja}>
                {crud.guardando ? 'Guardando…' : 'Sí, dar de baja'}
              </Button>
            </>
          }
        >
          <p className="ac-dialog__texto">
            Pasa a Inactiva y deja de ofrecerse al asignar lotes. No se borra: las campañas que la usan la siguen viendo y podés
            reactivarla cuando quieras.
          </p>
        </Dialog>
      )}

      {errorBaja && <DialogError error={errorBaja} titulo="No se pudo cambiar el estado" onCerrar={() => setErrorBaja(null)} />}
    </>
  )
}
