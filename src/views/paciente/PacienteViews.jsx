import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import './PacienteViews.css'

export function CatalogoServicios({ onVolver }) {
    const [servicios, setServicios] = useState([])
    const [cargando, setCargando] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingService, setEditingService] = useState(null)
    const [form, setForm] = useState({ nombre: '', descripcion: '', costo: '', activo: true, imagen: null, imagen_url: '' })

    const cargarServicios = async () => {
        setCargando(true)
        const { data } = await supabase.from('servicios').select('*').order('nombre')
        setServicios(data || [])
        setCargando(false)
    }

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: usuario } = await supabase.from('usuarios').select('rol_id').eq('id', user.id).single()
                setIsAdmin(!!usuario && usuario.rol_id === 1)
            }
            await cargarServicios()
        }
        init()
    }, [])

    const abrirNuevo = () => {
        setForm({ nombre: '', descripcion: '', costo: '', activo: true, imagen: null, imagen_url: '' })
        setEditingService(null)
        setModalOpen(true)
    }

    const abrirEditar = (s) => {
        setForm({ nombre: s.nombre || '', descripcion: s.descripcion || '', costo: s.costo || '', activo: !!s.activo, imagen: null, imagen_url: s.imagen_url || '' })
        setEditingService(s)
        setModalOpen(true)
    }

    const handleFile = (e) => {
        const f = e.target.files?.[0]
        if (f) setForm(prev => ({ ...prev, imagen: f }))
    }

    const guardarServicio = async () => {
        if (!form.nombre.trim() || !form.costo) return alert('Nombre y precio son obligatorios')
        try {
            let imagen_url = form.imagen_url || null

            // Subir imagen si hay archivo
            if (form.imagen) {
                const file = form.imagen
                const path = `servicios/${Date.now()}_${file.name}`
                const { error: uploadErr } = await supabase.storage.from('servicios').upload(path, file, { upsert: true })
                if (uploadErr) throw uploadErr
                const { data: urlData } = supabase.storage.from('servicios').getPublicUrl(path)
                imagen_url = urlData?.publicUrl || null
            }

            if (editingService) {
                const { error } = await supabase.from('servicios').update({
                    nombre: form.nombre,
                    descripcion: form.descripcion || null,
                    costo: Number(form.costo),
                    activo: form.activo,
                    imagen_url
                }).eq('id', editingService.id)
                if (error) throw error
            } else {
                const { error } = await supabase.from('servicios').insert([{ nombre: form.nombre, descripcion: form.descripcion || null, costo: Number(form.costo), activo: form.activo, imagen_url }])
                if (error) throw error
            }

            setModalOpen(false)
            await cargarServicios()
        } catch (err) {
            console.error('Error guardando servicio', err)
            alert('Error al guardar servicio')
        }
    }

    const eliminarServicio = async (id) => {
        if (!confirm('¿Eliminar este servicio?')) return
        try {
            const { error } = await supabase.from('servicios').delete().eq('id', id)
            if (error) throw error
            await cargarServicios()
        } catch (err) {
            console.error('Error eliminando servicio', err)
            alert('Error al eliminar servicio')
        }
    }

    const defaultImg = '/src/assets/hero.png'

    return (
        <div className="pv-wrapper">
            <div className="pv-header">
                <button className="pv-volver" onClick={onVolver}>←</button>
                <h1 className="pv-titulo">Catálogo de Servicios</h1>
                {isAdmin && <button className="pv-admin-btn" onClick={abrirNuevo}>+ Nuevo servicio</button>}
            </div>

            {cargando ? (
                <p>Cargando...</p>
            ) : (
                <div className="pv-grid">
                    {servicios.map(s => (
                        <div key={s.id} className="pv-card">
                            <div className="pv-card-img">
                                {s.imagen_url ? (
                                    <img src={s.imagen_url} alt={s.nombre} onError={(e) => { e.target.onerror = null; e.target.src = defaultImg }} />
                                ) : (
                                    <div className="pv-card-icon">🦷</div>
                                )}
                            </div>
                            <h3 className="pv-card-title">{s.nombre}</h3>
                            <p className="pv-card-desc">{s.descripcion}</p>
                            <p className="pv-card-price">C$ {Number(s.costo || 0).toLocaleString()}</p>
                            {isAdmin && (
                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    <button onClick={() => abrirEditar(s)}>Editar</button>
                                    <button onClick={() => eliminarServicio(s.id)}>Eliminar</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {modalOpen && (
                <div className="pv-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="pv-modal" onClick={e => e.stopPropagation()}>
                        <h2>{editingService ? 'Editar servicio' : 'Nuevo servicio'}</h2>
                        <div className="gp-form">
                            <div className="gp-form-row">
                                <div className="gp-campo">
                                    <label>Nombre *</label>
                                    <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                                </div>
                            </div>
                            <div className="gp-form-row">
                                <div className="gp-campo">
                                    <label>Descripción</label>
                                    <textarea value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} rows={3} />
                                </div>
                            </div>
                            <div className="gp-form-row">
                                <div className="gp-campo">
                                    <label>Precio (C$) *</label>
                                    <input type="number" value={form.costo} onChange={e => setForm(f => ({ ...f, costo: e.target.value }))} />
                                </div>
                            </div>
                            <div className="gp-form-row">
                                <div className="gp-campo">
                                    <label>Imagen</label>
                                    <input type="file" accept="image/*" onChange={handleFile} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                <button onClick={() => setModalOpen(false)}>Cancelar</button>
                                <button onClick={guardarServicio}>Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export function HistorialClinico({ onVolver }) {
    const [historial, setHistorial] = useState([])
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        const cargar = async () => {
            const { data: authData } = await supabase.auth.getUser()
            const user = authData?.user || null
            if (!user) {
                setCargando(false)
                return
            }

            const { data: pac } = await supabase.from('pacientes').select('id').eq('usuario_id', user.id).single()
            if (pac) {
                const { data } = await supabase
                    .from('historiales_clinicos')
                    .select('*, odontologos(usuarios(nombre, apellido))')
                    .eq('paciente_id', pac.id)
                    .order('fecha', { ascending: false })
                setHistorial(data || [])
            }
            setCargando(false)
        }
        cargar()
    }, [])

    return (
        <div className="pv-wrapper">
            <div className="pv-header">
                <button className="pv-volver" onClick={onVolver}>←</button>
                <h1 className="pv-titulo">Mi Historial Clínico</h1>
            </div>
            <div className="pv-lista">
                {historial.length === 0 ? <p>No hay registros en tu historial.</p> : 
                historial.map(h => (
                    <div key={h.id} className="pv-item">
                        <div className="pv-item-fecha">{new Date(h.fecha).toLocaleDateString()}</div>
                        <div className="pv-item-info">
                            <p className="pv-item-doctor">Dr. {h.odontologos?.usuarios?.nombre} {h.odontologos?.usuarios?.apellido}</p>
                            <p className="pv-item-diag"><b>Diagnóstico:</b> {h.diagnostico}</p>
                            {h.observaciones && <p className="pv-item-obs"><b>Obs:</b> {h.observaciones}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function EstadoCuenta({ onVolver }) {
    const [pagos, setPagos] = useState([])
    const [tratamientos, setTratamientos] = useState([])
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        const cargar = async () => {
            const { data: authData } = await supabase.auth.getUser()
            const user = authData?.user || null
            if (!user) {
                setCargando(false)
                return
            }

            const { data: pac } = await supabase.from('pacientes').select('id').eq('usuario_id', user.id).single()
            if (pac) {
                const { data: p } = await supabase.from('pagos').select('*').eq('paciente_id', pac.id).order('fecha_pago', { ascending: false })
                setPagos(p || [])

                const { data: t } = await supabase
                    .from('tratamientos')
                    .select('*, historiales_clinicos(paciente_id)')
                    .filter('historiales_clinicos.paciente_id', 'eq', pac.id)
                setTratamientos(t || [])
            }
            setCargando(false)
        }
        cargar()
    }, [])

    const totalPagado = pagos.reduce((sum, p) => sum + Number(p.monto), 0)

    return (
        <div className="pv-wrapper">
            <div className="pv-header">
                <button className="pv-volver" onClick={onVolver}>←</button>
                <h1 className="pv-titulo">Estado de Cuenta</h1>
            </div>
            
            <div className="pv-stats-pago">
                <div className="pv-stat-pago">
                    <p>Total Pagado</p>
                    <h2>C$ {totalPagado.toLocaleString()}</h2>
                </div>
            </div>

            <h2 className="pv-subtitulo">Historial de Pagos</h2>
            <div className="pv-lista">
                {pagos.map(p => (
                    <div key={p.id} className="pv-pago-item">
                        <div>
                            <p className="pv-pago-fecha">{new Date(p.fecha_pago).toLocaleDateString()}</p>
                            <p className="pv-pago-metodo">{p.metodo_pago}</p>
                        </div>
                        <div className="pv-pago-monto">C$ {Number(p.monto).toLocaleString()}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}
