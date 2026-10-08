import { useState } from 'react'
import BotonMenu from '../components/BotonMenu.jsx'
import Button from '../components/Button.jsx'
import CatalogoHeader from '../components/CatalogoHeader.jsx'
import DataTable from '../components/DataTable.jsx'
import Field from '../components/Field.jsx'
import FormDialog from '../components/FormDialog.jsx'
import Mensaje from '../components/Mensaje.jsx'
import { useCrud } from '../hooks/useCrud.js'
import { insumosService } from '../services/insumos.js'
import { cantidad, parsearNumero, pesos } from '../utils/format.js'

// Catálogo de insumos. Hoy el back permite listar y editar stock y precio.
// Alta y baja lógica quedan pendientes de la rama del backend sin mergear.

export default function InsumosPage() {
  const crud = useCrud(insumosService)
  const [orden, setOrden] = useState('nombre')
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ stock: '', precioUnitario: '' })
  const [errores, setErrores] = useState({})
  const [errorApi, setErrorApi] = useState(null)
  const [aviso, setAviso] = useState('')

  const filas = [...crud.items].sort((a, b) => {
    if (orden === 'stock-menor') return a.stock - b.stock
    if (orden === 'stock-mayor') return b.stock - a.stock
    return a.nombre.localeCompare(b.nombre)
  })

  function abrir(insumo) {
    setEditando(insumo)
    setForm({ stock: String(insumo.stock), precioUnitario: String(insumo.precioUnitario) })
    setErrores({})
    setErrorApi(null)
  }

  async function guardar() {
    const e = {}
    const stock = parsearNumero(form.stock)
    if (!Number.isInteger(stock) || stock < 0) e.stock = 'Cantidad entera, 0 o más.'
    const precio = parsearNumero(form.precioUnitario)
    if (Number.isNaN(precio) || precio < 0) e.precioUnitario = 'Precio de 0 o más.'
    setErrores(e)
    if (Object.keys(e).length) return

    try {
      await crud.guardar(editando.id, { stock, precioUnitario: precio })
      setAviso(`${editando.nombre} actualizado.`)
      setEditando(null)
    } catch (err) {
      setErrorApi(err)
    }
  }

  return (
    <>
      <CatalogoHeader titulo="Insumos" bajada="Productos que se consumen en las labores. El stock se descuenta al registrar cada labor." />

      <DataTable
        titulo="Insumos"
        columnas={[
          { clave: 'nombre', titulo: 'Insumo' },
          { clave: 'stock', titulo: 'Stock', num: true, render: (i) => cantidad(i.stock) },
          { clave: 'precio', titulo: 'Precio unitario', num: true, render: (i) => pesos(i.precioUnitario) },
          {
            clave: 'acciones',
            titulo: '',
            render: (i) => (
              <Button variante="outline" chico onClick={() => abrir(i)}>
                Modificar
              </Button>
            ),
          },
        ]}
        filas={filas}
        cargando={crud.loading}
        error={crud.error}
        onReintentar={crud.recargar}
        vacio={{ titulo: 'Todavía no hay insumos cargados' }}
        herramientas={
          <BotonMenu
            etiqueta="Ordenar"
            titulo="Ordenar por"
            valor={orden}
            onElegir={setOrden}
            opciones={[
              { valor: 'nombre', etiqueta: 'Nombre' },
              { valor: 'stock-menor', etiqueta: 'Menor stock' },
              { valor: 'stock-mayor', etiqueta: 'Mayor stock' },
            ]}
          />
        }
      >
        <div style={{ display: 'grid', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
          {aviso && <Mensaje tipo="ok" titulo={aviso} />}
          <Mensaje tipo="aviso" titulo="Alta y baja de insumos, pendientes">
            El backend todavía no tiene el alta ni la baja lógica de insumos (están en una rama sin mergear). Por ahora podés editar el stock y el
            precio.
          </Mensaje>
        </div>
      </DataTable>

      {editando && (
        <FormDialog
          titulo={`Modificar ${editando.nombre}`}
          etiquetaGuardar="Guardar cambios"
          guardando={crud.guardando}
          error={errorApi}
          onGuardar={guardar}
          onCancelar={() => setEditando(null)}
        >
          <div className="ac-form__fila">
            <Field
              id="insumo-stock"
              label="Stock"
              inputMode="numeric"
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              error={errores.stock}
            />
            <Field
              id="insumo-precio"
              label="Precio unitario ($)"
              inputMode="decimal"
              value={form.precioUnitario}
              onChange={(e) => setForm((f) => ({ ...f, precioUnitario: e.target.value }))}
              error={errores.precioUnitario}
            />
          </div>
        </FormDialog>
      )}
    </>
  )
}
