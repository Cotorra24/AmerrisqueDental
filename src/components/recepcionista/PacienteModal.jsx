export default function PacienteModal({ isOpen, isEditing, form, setForm, onClose, onSave, guardando }) {
    if (!isOpen) return null

    return (
        <div className="gp-overlay" onClick={onClose}>
            <div className="gp-modal" onClick={e => e.stopPropagation()}>
                <div className="gp-modal-header">
                    <h2>{isEditing ? 'Editar Paciente' : 'Registrar Paciente'}</h2>
                    <button onClick={onClose}>✕</button>
                </div>
                <div className="gp-modal-body">
                    <div className="gp-form">
                        <div className="gp-form-row">
                            <div className="gp-campo">
                                <label>Nombre *</label>
                                <input
                                    type="text"
                                    value={form.nombre || ''}
                                    onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                                    placeholder="Nombre del paciente"
                                />
                            </div>
                        </div>
                        <div className="gp-form-row">
                            <div className="gp-campo">
                                <label>Apellido *</label>
                                <input
                                    type="text"
                                    value={form.apellido || ''}
                                    onChange={e => setForm(f => ({ ...f, apellido: e.target.value }))}
                                    placeholder="Apellido del paciente"
                                />
                            </div>
                        </div>
                        <div className="gp-form-row">
                            <div className="gp-campo">
                                <label>Cédula</label>
                                <input
                                    type="text"
                                    value={form.cedula || ''}
                                    onChange={e => setForm(f => ({ ...f, cedula: e.target.value }))}
                                    placeholder="001-000000-0000X"
                                />
                            </div>
                        </div>
                        <div className="gp-form-row">
                            <div className="gp-campo">
                                <label>Teléfono</label>
                                <input
                                    type="text"
                                    value={form.telefono || ''}
                                    onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))}
                                    placeholder="8888-1234"
                                />
                            </div>
                        </div>
                        <div className="gp-form-row">
                            <div className="gp-campo">
                                <label>Correo electrónico</label>
                                <input
                                    type="email"
                                    value={form.email || ''}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                        </div>
                        <div className="gp-form-row">
                            <div className="gp-campo">
                                <label>Fecha de nacimiento</label>
                                <input
                                    type="date"
                                    value={form.fecha_nacimiento || ''}
                                    onChange={e => setForm(f => ({ ...f, fecha_nacimiento: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="gp-form-row">
                            <div className="gp-campo">
                                <label>Sexo</label>
                                <select
                                    value={form.sexo || ''}
                                    onChange={e => setForm(f => ({ ...f, sexo: e.target.value }))}
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="masculino">Masculino</option>
                                    <option value="femenino">Femenino</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>
                        </div>
                        <div className="gp-form-row">
                            <div className="gp-campo">
                                <label>Dirección</label>
                                <textarea
                                    value={form.direccion || ''}
                                    onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))}
                                    placeholder="Dirección del paciente"
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="gp-modal-footer">
                    <button className="gp-btn-cancelar" onClick={onClose}>Cancelar</button>
                    <button
                        className="gp-btn-guardar"
                        onClick={onSave}
                        disabled={guardando}
                    >
                        {guardando ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Registrar paciente'}
                    </button>
                </div>
            </div>
        </div>
    )
}
