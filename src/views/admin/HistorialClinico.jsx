import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import './HistorialClinico.css'

export default function HistorialClinico({ onVolver }) {
    const [pacientes, setPacientes] = useState([])
    const [historiales, setHistoriales] = useState([])
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)
    const [odontologos, setOdontologos] = useState([])
    const [cargando, setCargando] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingHistorial, setEditingHistorial] = useState(null)
    const [form, setForm] = useState({
        odontologo_id: '',
        diagnostico: '',
        observaciones: '',
        tratamiento: '',
        fecha: new Date().toISOString().split('T')[0]
    })
    const [guardando, setGuardando] = useState(false)
    const [mensaje, setMensaje] = useState(null)

    useEffect(() => {
        const cargarDatos = async () => {
            setCargando(true)
            try {
                // Cargar pacientes
                const { data: pacs } = await supabase
                    .from('pacientes')
                    .select('id, nombre, apellido')
                    .eq('activo', true)
                    .order('nombre')
                setPacientes(pacs || [])

                // Cargar odontólogos
                const { data: ods } = await supabase
                    .from('odontologos')
                    .select('id, especialidad, usuarios(nombre, apellido)')
                    .eq('activo', true)
                setOdontologos(ods || [])
            } catch (err) {
                console.error('Error cargando datos:', err)
                mostrarMensaje('error', 'Error al cargar datos')
            } finally {
                setCargando(false)
            }
        }
        cargarDatos()
    }, [])

    useEffect(() => {
        if (!pacienteSeleccionado) {
            setHistoriales([])
            return
        }

        const cargarHistoriales = async () => {
            try {
                const { data } = await supabase
                    .from('historiales_clinicos')
                    .select('*, odontologos(especialidad, usuarios(nombre, apellido))')
                    .eq('paciente_id', pacienteSeleccionado.id)
                    .order('fecha', { ascending: false })
                setHistoriales(data || [])
            } catch (err) {
                console.error('Error cargando historiales:', err)
            }
        }
        cargarHistoriales()
    }, [pacienteSeleccionado])

    const mostrarMensaje = (tipo, texto) => {
        setMensaje({ tipo, texto })
        setTimeout(() => setMensaje(null), 3000)
    }

    const abrirNuevo = () => {
        setForm({
            odontologo_id: '',
            diagnostico: '',
            observaciones: '',
            tratamiento: '',
            fecha: new Date().toISOString().split('T')[0]
        })
        setEditingHistorial(null)
        setModalOpen(true)
    }

    const abrirEditar = (h) => {
        setForm({
            odontologo_id: h.odontologo_id || '',
            diagnostico: h.diagnostico || '',
            observaciones: h.observaciones || '',
            tratamiento: h.tratamiento || '',
            fecha: h.fecha || new Date().toISOString().split('T')[0]
        })
        setEditingHistorial(h)
        setModalOpen(true)
    }

    const guardarHistorial = async () => {
        if (!form.diagnostico.trim() || !form.odontologo_id) {
            mostrarMensaje('error', 'Diagnóstico y odontólogo son obligatorios')
            return
        }

        setGuardando(true)
        try {
            if (editingHistorial) {
                const { error } = await supabase
                    .from('historiales_clinicos')
                    .update({
                        odontologo_id: form.odontologo_id,
                        diagnostico: form.diagnostico,
                        observaciones: form.observaciones || null,
                        tratamiento: form.tratamiento || null,
                        fecha: form.fecha
                    })
                    .eq('id', editingHistorial.id)

                if (error) throw error
                mostrarMensaje('exito', 'Historial actualizado correctamente')
            } else {
                const { error } = await supabase
                    .from('historiales_clinicos')
                    .insert([{
                        paciente_id: pacienteSeleccionado.id,
                        odontologo_id: form.odontologo_id,
                        diagnostico: form.diagnostico,
                        observaciones: form.observaciones || null,
                        tratamiento: form.tratamiento || null,
                        fecha: form.fecha
                    }])

                if (error) throw error
                mostrarMensaje('exito', 'Historial registrado correctamente')
            }

            setModalOpen(false)
            // Recargar historiales
            const { data } = await supabase
                .from('historiales_clinicos')
                .select('*, odontologos(especialidad, usuarios(nombre, apellido))')
                .eq('paciente_id', pacienteSeleccionado.id)
                .order('fecha', { ascending: false })
            setHistoriales(data || [])
        } catch (err) {
            console.error('Error guardando historial:', err)
            mostrarMensaje('error', 'Error al guardar historial')
        } finally {
            setGuardando(false)
        }
    }

    const eliminarHistorial = async (id) => {
        if (!confirm('¿Eliminar este historial clínico?')) return
        try {
            const { error } = await supabase
                .from('historiales_clinicos')
                .delete()
                .eq('id', id)

            if (error) throw error
            mostrarMensaje('exito', 'Historial eliminado')
            const { data } = await supabase
                .from('historiales_clinicos')
                .select('*, odontologos(especialidad, usuarios(nombre, apellido))')
                .eq('paciente_id', pacienteSeleccionado.id)
                .order('fecha', { ascending: false })
            setHistoriales(data || [])
        } catch (err) {
            console.error('Error eliminando historial:', err)
            mostrarMensaje('error', 'Error al eliminar')
        }
    }

    if (cargando) return <div className="hc-cargando">Cargando...</div>

    return (
        <div className="hc-wrapper">
            <div className="hc-header">
                {onVolver && <button className="hc-volver" onClick={onVolver}>←</button>}
                <h1 className="hc-titulo">Historiales Clínicos</h1>
            </div>

            {mensaje && <div className={`hc-mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}

            <div className="hc-selector">
                <label>Seleccionar Paciente:</label>
                <select
                    value={pacienteSeleccionado?.id || ''}
                    onChange={e => {
                        const p = pacientes.find(p => p.id === parseInt(e.target.value))
                        setPacienteSeleccionado(p || null)
                    }}
                >
                    <option value="">-- Seleccionar paciente --</option>
                    {pacientes.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.nombre} {p.apellido}
                        </option>
                    ))}
                </select>
            </div>

            {pacienteSeleccionado && (
                <div className="hc-container">
                    <div className="hc-info">
                        <p><strong>Paciente:</strong> {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</p>
                        <button className="hc-btn-nuevo" onClick={abrirNuevo}>+ Nuevo Historial</button>
                    </div>

                    <div className="hc-lista">
                        {historiales.length === 0 ? (
                            <p className="hc-vacio">No hay historiales registrados</p>
                        ) : (
                            historiales.map(h => (
                                <div key={h.id} className="hc-item">
                                    <div className="hc-item-fecha">
                                        {new Date(h.fecha).toLocaleDateString()}
                                    </div>
                                    <div className="hc-item-info">
                                        <p className="hc-item-doctor">
                                            Dr. {h.odontologos?.usuarios?.nombre} {h.odontologos?.usuarios?.apellido}
                                            <span className="hc-item-esp">({h.odontologos?.especialidad})</span>
                                        </p>
                                        <p className="hc-item-diag"><strong>Diagnóstico:</strong> {h.diagnostico}</p>
                                        {h.tratamiento && (
                                            <p className="hc-item-trat"><strong>Tratamiento:</strong> {h.tratamiento}</p>
                                        )}
                                        {h.observaciones && (
                                            <p className="hc-item-obs"><strong>Observaciones:</strong> {h.observaciones}</p>
                                        )}
                                    </div>
                                    <div className="hc-item-acciones">
                                        <button onClick={() => abrirEditar(h)}>Editar</button>
                                        <button onClick={() => eliminarHistorial(h.id)}>Eliminar</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {modalOpen && (
                <div className="hc-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="hc-modal" onClick={e => e.stopPropagation()}>
                        <div className="hc-modal-header">
                            <h2>{editingHistorial ? 'Editar Historial' : 'Registrar Historial Clínico'}</h2>
                            <button onClick={() => setModalOpen(false)}>✕</button>
                        </div>
                        <div className="hc-modal-body">
                            <div className="gp-form">
                                <div className="gp-form-row">
                                    <div className="gp-campo">
                                        <label>Fecha *</label>
                                        <input
                                            type="date"
                                            value={form.fecha}
                                            onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="gp-form-row">
                                    <div className="gp-campo">
                                        <label>Odontólogo *</label>
                                        <select
                                            value={form.odontologo_id}
                                            onChange={e => setForm(f => ({ ...f, odontologo_id: e.target.value }))}
                                        >
                                            <option value="">Seleccionar odontólogo</option>
                                            {odontologos.map(o => (
                                                <option key={o.id} value={o.id}>
                                                    Dr. {o.usuarios?.nombre} {o.usuarios?.apellido}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="gp-form-row">
                                    <div className="gp-campo">
                                        <label>Diagnóstico *</label>
                                        <textarea
                                            value={form.diagnostico}
                                            onChange={e => setForm(f => ({ ...f, diagnostico: e.target.value }))}
                                            placeholder="Describe el diagnóstico"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <div className="gp-form-row">
                                    <div className="gp-campo">
                                        <label>Tratamiento</label>
                                        <textarea
                                            value={form.tratamiento}
                                            onChange={e => setForm(f => ({ ...f, tratamiento: e.target.value }))}
                                            placeholder="Describe el tratamiento recomendado"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <div className="gp-form-row">
                                    <div className="gp-campo">
                                        <label>Observaciones</label>
                                        <textarea
                                            value={form.observaciones}
                                            onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                                            placeholder="Notas adicionales"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="hc-modal-footer">
                            <button onClick={() => setModalOpen(false)}>Cancelar</button>
                            <button
                                onClick={guardarHistorial}
                                disabled={guardando}
                                className="hc-btn-guardar"
                            >
                                {guardando ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
