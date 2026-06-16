import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'

const USD_TO_NIO = 36.5 // tipo de cambio aproximado
const DISCOUNT_FACTOR = 0.8 // bajar precios al 80%

export default function Catalogo({ onVolver }) {
    const [servicios, setServicios] = useState([])
    const [cargando, setCargando] = useState(true)
    const [modal, setModal] = useState(null) // {mode:'edit'|'new', item: {...}}
    const [mensaje, setMensaje] = useState(null)

    const cargar = async () => {
        setCargando(true)
        try {
            const { data } = await supabase.from('servicios').select('*').order('nombre')
            setServicios(data || [])
        } catch (err) {
            console.error('Error cargando servicios:', err)
            setMensaje({ tipo: 'error', texto: 'No se pudo cargar el catálogo' })
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => { cargar() }, [])

    const displayPrice = (s) => {
        const costo = Number(s?.costo || 0)
        const discounted = costo * DISCOUNT_FACTOR
        const nio = Math.round(discounted * USD_TO_NIO)
        return `C$ ${nio}`
    }

    const abrirNuevo = () => setModal({ mode: 'new', item: { nombre: '', descripcion: '', costo: 0, activo: true, imagen: '' } })
    const abrirEditar = (s) => setModal({ mode: 'edit', item: { ...s } })
    const cerrarModal = () => setModal(null)

    const subirImagen = async (file) => {
        if (!file) return null
        const path = `${Date.now()}_${file.name}`
        const { data, error } = await supabase.storage.from('servicios').upload(path, file, { cacheControl: '3600', upsert: false })
        if (error) {
            console.error('Error subiendo imagen:', error)
            throw error
        }
        const { data: urlData } = supabase.storage.from('servicios').getPublicUrl(path)
        return urlData?.publicUrl || null
    }

    const guardar = async (item) => {
        try {
            let imagenUrl = item.imagen || null
            if (item._file) {
                imagenUrl = await subirImagen(item._file)
            }

            if (modal.mode === 'new') {
                const { data, error } = await supabase.from('servicios').insert([{ ...item, imagen: imagenUrl }]).select()
                if (error) throw error
                setMensaje({ tipo: 'exito', texto: 'Servicio creado' })
            } else {
                const { data, error } = await supabase.from('servicios').update({ nombre: item.nombre, descripcion: item.descripcion, costo: item.costo, activo: item.activo, imagen: imagenUrl }).eq('id', item.id).select()
                if (error) throw error
                setMensaje({ tipo: 'exito', texto: 'Servicio actualizado' })
            }
            cerrarModal()
            await cargar()
        } catch (err) {
            console.error('Error guardando servicio:', err)
            setMensaje({ tipo: 'error', texto: 'No se pudo guardar el servicio' })
        }
    }

    const eliminar = async (s) => {
        if (!confirm(`¿Inactivar servicio ${s.nombre}?`)) return
        try {
            const { error } = await supabase.from('servicios').update({ activo: false }).eq('id', s.id)
            if (error) throw error
            setMensaje({ tipo: 'exito', texto: 'Servicio inactivado' })
            await cargar()
        } catch (err) {
            console.error('Error eliminando servicio:', err)
            setMensaje({ tipo: 'error', texto: 'No se pudo inactivar el servicio' })
        }
    }

    return (
        <div className="cat-wrapper">
            <div className="cat-header">
                {onVolver && <button onClick={onVolver}>←</button>}
                <h1>Catálogo de Servicios</h1>
                <div>
                    <button className="btn-crud agregar" onClick={abrirNuevo}>➕ Nuevo Servicio</button>
                </div>
            </div>

            {mensaje && <div className={`gp-mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}

            {cargando ? <p>Cargando...</p> : (
                <div className="ac-servicios">
                    {servicios.map((s, i) => (
                        <div key={s.id || i} className={`ac-servicio-tag ${s.activo ? '' : 'inactivo'}`} style={{ minWidth: '220px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                <div style={{ width: 56, height: 56, borderRadius: 8, background: '#f3f4f6', overflow: 'hidden' }}>
                                    {s.imagen ? <img src={s.imagen} alt={s.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <img src={'/src/assets/catalog/placeholder' + ((i % 6) + 1) + '.svg'} alt="placeholder" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>{s.nombre}</div>
                                    <div style={{ fontSize: 12, color: '#6b7280' }}>{s.descripcion}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700 }}>{displayPrice(s)}</div>
                                    <div style={{ fontSize: 12, color: '#6b7280' }}>{s.activo ? 'Activo' : 'Inactivo'}</div>
                                </div>
                            </div>
                            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                                <button className="btn-cell editar" onClick={() => abrirEditar(s)}>✏️</button>
                                <button className="btn-cell eliminar" onClick={() => eliminar(s)}>🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modal && (
                <div className="gp-overlay" onClick={cerrarModal}>
                    <div className="gp-modal" onClick={e => e.stopPropagation()}>
                        <div className="gp-modal-header">
                            <h2>{modal.mode === 'new' ? 'Nuevo Servicio' : 'Editar Servicio'}</h2>
                            <button onClick={cerrarModal}>✕</button>
                        </div>
                        <div className="gp-modal-body">
                            <div className="gp-form">
                                <div className="gp-campo">
                                    <label>Nombre</label>
                                    <input value={modal.item.nombre} onChange={e => setModal(m => ({ ...m, item: { ...m.item, nombre: e.target.value } }))} />
                                </div>
                                <div className="gp-campo">
                                    <label>Descripción</label>
                                    <input value={modal.item.descripcion} onChange={e => setModal(m => ({ ...m, item: { ...m.item, descripcion: e.target.value } }))} />
                                </div>
                                <div className="gp-campo">
                                    <label>Costo (USD)</label>
                                    <input type="number" value={modal.item.costo} onChange={e => setModal(m => ({ ...m, item: { ...m.item, costo: Number(e.target.value) } }))} />
                                </div>
                                <div className="gp-campo">
                                    <label>Imagen</label>
                                    <input type="file" accept="image/*" onChange={e => setModal(m => ({ ...m, item: { ...m.item, _file: e.target.files[0] } }))} />
                                </div>
                                <div className="gp-campo">
                                    <label>Activo</label>
                                    <input type="checkbox" checked={modal.item.activo} onChange={e => setModal(m => ({ ...m, item: { ...m.item, activo: e.target.checked } }))} />
                                </div>
                            </div>
                        </div>
                        <div className="gp-modal-footer">
                            <button className="gp-btn-cancelar" onClick={cerrarModal}>Cancelar</button>
                            <button className="gp-btn-guardar" onClick={() => guardar(modal.item)}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
