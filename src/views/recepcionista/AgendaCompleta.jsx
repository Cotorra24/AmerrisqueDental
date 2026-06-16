import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import './AgendaCompleta.css'

export default function AgendaCompleta({ onVolver }) {
    const [citas, setCitas] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)
    const [editar, setEditar] = useState(null) // cita en edición

    const cargar = async () => {
        setCargando(true)
        try {
            const hoy = new Date().toISOString().split('T')[0]
            const { data, error } = await supabase
                .from('citas')
                .select('*, pacientes(nombre,apellido), odontologos(usuarios(nombre,apellido)), servicios(nombre)')
                .gte('fecha_hora', hoy + 'T00:00:00')
                .order('fecha_hora', { ascending: true })

            if (error) throw error
            setCitas(data || [])
        } catch (err) {
            console.error('Error cargando agenda completa:', err)
            setError('No se pudo cargar la agenda')
        } finally {
            setCargando(false)
        }
    }

    useEffect(() => { cargar() }, [])

    const cancelar = async (id) => {
        if (!confirm('¿Cancelar esta cita?')) return
        try {
            const { error } = await supabase.from('citas').update({ estado: 'cancelada' }).eq('id', id)
            if (error) throw error
            await cargar()
        } catch (err) {
            console.error(err)
            alert('No se pudo cancelar la cita')
        }
    }

    const marcarCompletada = async (id) => {
        try {
            const { error } = await supabase.from('citas').update({ estado: 'completada' }).eq('id', id)
            if (error) throw error
            await cargar()
        } catch (err) {
            console.error(err)
            alert('No se pudo marcar como completada')
        }
    }

    const guardarEdicion = async (c) => {
        try {
            const { error } = await supabase.from('citas').update({ fecha_hora: c.fecha_hora, odontologo_id: c.odontologo_id, servicio_id: c.servicio_id, notas: c.notas }).eq('id', c.id)
            if (error) throw error
            setEditar(null)
            await cargar()
        } catch (err) {
            console.error('Error actualizando cita:', err)
            alert('No se pudo actualizar la cita')
        }
    }

    return (
        <div className="ag-wrapper">
            <div className="ag-header">
                {onVolver && <button className="ag-volver" onClick={onVolver}>←</button>}
                <h1>Agenda completa</h1>
            </div>

            {error && <div className="gp-mensaje error">{error}</div>}

            {cargando ? <p>Cargando...</p> : (
                <div className="ag-lista">
                    {citas.length === 0 ? <p>No hay citas programadas</p> : citas.map(c => (
                        <div key={c.id} className="ag-item">
                            <div className="ag-left">
                                <div className="ag-nombre">{c.pacientes?.nombre} {c.pacientes?.apellido}</div>
                                <div className="ag-detalle">{c.servicios?.nombre || 'Consulta'} · {new Date(c.fecha_hora).toLocaleString()}</div>
                            </div>
                            <div className="ag-actions">
                                <button className="btn-cell editar" onClick={() => setEditar(c)}>✏️ Editar</button>
                                <button className="btn-cell eliminar" onClick={() => cancelar(c.id)}>🗑️ Cancelar</button>
                                <button className="btn-cell" onClick={() => marcarCompletada(c.id)}>✅ Completar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editar && (
                <div className="gp-overlay" onClick={() => setEditar(null)}>
                    <div className="gp-modal" onClick={e => e.stopPropagation()}>
                        <div className="gp-modal-header"><h2>Editar cita</h2><button onClick={() => setEditar(null)}>✕</button></div>
                        <div className="gp-modal-body">
                            <div className="gp-form">
                                <div className="gp-campo">
                                    <label>Fecha y hora (ISO)</label>
                                    <input value={editar.fecha_hora} onChange={e => setEditar(ev => ({ ...ev, fecha_hora: e.target.value }))} />
                                </div>
                                <div className="gp-campo">
                                    <label>Notas</label>
                                    <input value={editar.notas || ''} onChange={e => setEditar(ev => ({ ...ev, notas: e.target.value }))} />
                                </div>
                            </div>
                        </div>
                        <div className="gp-modal-footer">
                            <button className="gp-btn-cancelar" onClick={() => setEditar(null)}>Cancelar</button>
                            <button className="gp-btn-guardar" onClick={() => guardarEdicion(editar)}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
