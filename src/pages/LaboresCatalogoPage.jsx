import { useState } from 'react'
import BotonMenu from '../components/BotonMenu.jsx'
import Button from '../components/Button.jsx'
import CatalogoHeader from '../components/CatalogoHeader.jsx'
import DataTable from '../components/DataTable.jsx'
import Field from '../components/Field.jsx'
import FormDialog from '../components/FormDialog.jsx'
import Mensaje from '../components/Mensaje.jsx'
import { useCrud } from '../hooks/useCrud.js'
import { laboresService } from '../services/labores.js'
import { parsearNumero, pesos } from '../utils/format.js'

// Catálogo de labores de mantenimiento: reutilizable entre campañas (Aplicar herbicida, Fertilizar…).
const FORM_VACIO = { descripcion: '', costeBase: '' }

export default function LaboresCatalogoPage() {
  const crud = useCrud(laboresService)
  const [orden, setOrden] = useState('nombre')
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [errores, setErrores] = useState({})
  const [errorApi, setErrorApi] = useState(null)
  const [aviso, setAviso] = useState('')

  const filas = [...crud.items].sort((a, b) => {
    if (orden === 'costo-mayor') return b.costeBase - a.costeBase
    if (orden === 'costo-menor') return a.costeBase - b.costeBase
    return a.descripcion.localeCompare(b.descripcion)
  })

  function abrir(labor) {
    setEditando(labor ?? {})
    setForm(labor ? { descripcion: labor.descripcion, costeBase: String(labor.costeBase) } : FORM_VACIO)
    setErrores({})
    setErrorApi(null)
  }

  async function guardar() {
    const e = {}
    if (!form.descripcion.trim()) e.descripcion = 'Escribí el nombre de la labor.'
    const costo = parsearNumero(form.costeBase)
    if (Number.isNaN(costo) || costo < 0) e.costeBase = 'Costo de 0 o más.'
    setErrores(e)
    if (Object.keys(e).length) return

    try {
      await crud.guardar(editando.id, { descripcion: form.descripcion.trim(), costeBase: costo })
      setAviso(editando.id ? 'Labor actualizada.' : `«${form.descripcion.trim()}» agregada al catálogo.`)
      setEditando(null)
    } catch (err) {
      setErrorApi(err)
    }
  }

  return (
    <>
      <CatalogoHeader
        titulo="Labores de mantenimiento"
        bajada="Catálogo que se reutiliza en todas las campañas. El costo base se suma al costo de los insumos de cada labor."
        acciones={
          <Button variante="primary" enFondo onClick={() => abrir(null)}>
            Nueva labor
          </Button>
        }
      />

      <DataTable
        titulo="Labores"
        columnas={[
          { clave: 'descripcion', titulo: 'Labor' },
          { clave: 'costeBase', titulo: 'Costo base', num: true, render: (l) => pesos(l.costeBase) },
          {
            clave: 'acciones',
            titulo: '',
            render: (l) => (
              <Button variante="outline" chico onClick={() => abrir(l)}>
                Modificar
              </Button>
            ),
          },
        ]}
        filas={filas}
        cargando={crud.loading}
        error={crud.error}
        onReintentar={crud.recargar}
        vacio={{ titulo: 'El catálogo está vacío', texto: 'Cargá las labores habituales con "Nueva labor".' }}
        herramientas={
          <BotonMenu
            etiqueta="Ordenar"
            titulo="Ordenar por"
            valor={orden}
            onElegir={setOrden}
            opciones={[
              { valor: 'nombre', etiqueta: 'Nombre' },
              { valor: 'costo-mayor', etiqueta: 'Mayor costo' },
              { valor: 'costo-menor', etiqueta: 'Menor costo' },
            ]}
          />
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
          titulo={editando.id ? 'Modificar labor' : 'Nueva labor'}
          etiquetaGuardar={editando.id ? 'Guardar cambios' : 'Crear labor'}
          guardando={crud.guardando}
          error={errorApi}
          onGuardar={guardar}
          onCancelar={() => setEditando(null)}
        >
          <Field
            id="labor-descripcion"
            label="Labor"
            placeholder="Ej.: Aplicar herbicida"
            value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            error={errores.descripcion}
          />
          <div className="ac-form__fila">
            <Field
              id="labor-costo"
              label="Costo base ($)"
              inputMode="decimal"
              placeholder="Ej.: 45000"
              value={form.costeBase}
              onChange={(e) => setForm((f) => ({ ...f, costeBase: e.target.value }))}
              error={errores.costeBase}
            />
          </div>
        </FormDialog>
      )}
    </>
  )
}
