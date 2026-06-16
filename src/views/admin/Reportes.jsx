import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import './Reportes.css'

export default function Reportes({ onVolver }) {
    const [reportData, setReportData] = useState({
        citasTotal: 0,
        citasCompletadas: 0,
        citasCanceladas: 0,
        pagosMes: 0,
        pagosTotal: 0,
        pacientesNuevos: 0,
        ingresoPromedio: 0,
        tarjetas: []
    })
    const [filtroMes, setFiltroMes] = useState(new Date().getMonth() + 1)
    const [filtroAno, setFiltroAno] = useState(new Date().getFullYear())
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        const cargarReportes = async () => {
            setCargando(true)
            try {
                const inicioMes = new Date(filtroAno, filtroMes - 1, 1).toISOString().split('T')[0]
                const finMes = new Date(filtroAno, filtroMes, 0).toISOString().split('T')[0]

                // Citas totales este mes
                const { data: citas } = await supabase
                    .from('citas')
                    .select('estado', { count: 'exact' })
                    .gte('fecha_hora', inicioMes + 'T00:00:00')
                    .lte('fecha_hora', finMes + 'T23:59:59')

                // Citas completadas
                const { count: completadas } = await supabase
                    .from('citas')
                    .select('*', { count: 'exact' })
                    .eq('estado', 'completada')
                    .gte('fecha_hora', inicioMes + 'T00:00:00')
                    .lte('fecha_hora', finMes + 'T23:59:59')

                // Citas canceladas
                const { count: canceladas } = await supabase
                    .from('citas')
                    .select('*', { count: 'exact' })
                    .eq('estado', 'cancelada')
                    .gte('fecha_hora', inicioMes + 'T00:00:00')
                    .lte('fecha_hora', finMes + 'T23:59:59')

                // Pagos del mes
                const { data: pagos } = await supabase
                    .from('pagos')
                    .select('monto')
                    .gte('fecha_pago', inicioMes)
                    .lte('fecha_pago', finMes)

                const pagosMes = pagos?.reduce((s, p) => s + Number(p.monto), 0) || 0

                // Pagos totales históricos
                const { data: pagosTotal } = await supabase
                    .from('pagos')
                    .select('monto')

                const pagosT = pagosTotal?.reduce((s, p) => s + Number(p.monto), 0) || 0

                // Pacientes nuevos este mes
                const { count: pacientesNuevos } = await supabase
                    .from('pacientes')
                    .select('*', { count: 'exact' })
                    .gte('created_at', inicioMes + 'T00:00:00')
                    .lte('created_at', finMes + 'T23:59:59')

                // Citas por odontólogo
                const { data: citasPorOd } = await supabase
                    .from('citas')
                    .select('odontologo_id, odontologos(usuarios(nombre, apellido))')
                    .gte('fecha_hora', inicioMes + 'T00:00:00')
                    .lte('fecha_hora', finMes + 'T23:59:59')

                const odMap = {}
                citasPorOd?.forEach(c => {
                    const odId = c.odontologo_id
                    if (!odMap[odId]) {
                        odMap[odId] = {
                            nombre: c.odontologos?.usuarios?.nombre || 'Desconocido',
                            apellido: c.odontologos?.usuarios?.apellido || '',
                            total: 0
                        }
                    }
                    odMap[odId].total++
                })

                const tarjetas = Object.values(odMap).sort((a, b) => b.total - a.total).slice(0, 5)

                setReportData({
                    citasTotal: citas?.length || 0,
                    citasCompletadas: completadas || 0,
                    citasCanceladas: canceladas || 0,
                    pagosMes: pagosMes,
                    pagosTotal: pagosT,
                    pacientesNuevos: pacientesNuevos || 0,
                    ingresoPromedio: citas?.length > 0 ? pagosMes / citas.length : 0,
                    tarjetas
                })
            } catch (err) {
                console.error('Error cargando reportes:', err)
            } finally {
                setCargando(false)
            }
        }
        cargarReportes()
    }, [filtroMes, filtroAno])

    const porcentajeCompletadas = reportData.citasTotal > 0
        ? ((reportData.citasCompletadas / reportData.citasTotal) * 100).toFixed(1)
        : 0

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    const anos = [2024, 2025, 2026]

    return (
        <div className="rep-wrapper">
            <div className="rep-header">
                {onVolver && <button className="rep-volver" onClick={onVolver}>←</button>}
                <h1 className="rep-titulo">Reportes y Estadísticas</h1>
            </div>

            <div className="rep-filtros">
                <div className="rep-filtro">
                    <label>Mes:</label>
                    <select value={filtroMes} onChange={e => setFiltroMes(Number(e.target.value))}>
                        {meses.map((m, i) => (
                            <option key={i + 1} value={i + 1}>{m}</option>
                        ))}
                    </select>
                </div>
                <div className="rep-filtro">
                    <label>Año:</label>
                    <select value={filtroAno} onChange={e => setFiltroAno(Number(e.target.value))}>
                        {anos.map(a => (
                            <option key={a} value={a}>{a}</option>
                        ))}
                    </select>
                </div>
            </div>

            {cargando ? (
                <div className="rep-cargando">Cargando datos...</div>
            ) : (
                <>
                    {/* KPIs principales */}
                    <div className="rep-kpis">
                        <div className="rep-kpi azul">
                            <span className="rep-kpi-icon">📅</span>
                            <div className="rep-kpi-content">
                                <p className="rep-kpi-valor">{reportData.citasTotal}</p>
                                <p className="rep-kpi-label">Citas Total</p>
                            </div>
                        </div>
                        <div className="rep-kpi verde">
                            <span className="rep-kpi-icon">✅</span>
                            <div className="rep-kpi-content">
                                <p className="rep-kpi-valor">{reportData.citasCompletadas}</p>
                                <p className="rep-kpi-label">Completadas</p>
                                <p className="rep-kpi-porcentaje">{porcentajeCompletadas}%</p>
                            </div>
                        </div>
                        <div className="rep-kpi amarillo">
                            <span className="rep-kpi-icon">💰</span>
                            <div className="rep-kpi-content">
                                <p className="rep-kpi-valor">C$ {reportData.pagosMes.toLocaleString()}</p>
                                <p className="rep-kpi-label">Ingresos Mes</p>
                            </div>
                        </div>
                        <div className="rep-kpi morado">
                            <span className="rep-kpi-icon">👤</span>
                            <div className="rep-kpi-content">
                                <p className="rep-kpi-valor">{reportData.pacientesNuevos}</p>
                                <p className="rep-kpi-label">Pacientes Nuevos</p>
                            </div>
                        </div>
                    </div>

                    {/* Tarjetas de resumen */}
                    <div className="rep-resumen">
                        <div className="rep-card">
                            <p className="rep-card-titulo">Tasa de Completación</p>
                            <div className="rep-barra">
                                <div className="rep-barra-llena" style={{ width: `${porcentajeCompletadas}%` }}></div>
                            </div>
                            <p className="rep-card-valor">{porcentajeCompletadas}%</p>
                        </div>
                        <div className="rep-card">
                            <p className="rep-card-titulo">Citas Canceladas</p>
                            <p className="rep-card-valor" style={{ color: '#ef4444' }}>{reportData.citasCanceladas}</p>
                            <p className="rep-card-desc">
                                {reportData.citasTotal > 0
                                    ? ((reportData.citasCanceladas / reportData.citasTotal) * 100).toFixed(1)
                                    : 0}%
                            </p>
                        </div>
                        <div className="rep-card">
                            <p className="rep-card-titulo">Ingreso Promedio/Cita</p>
                            <p className="rep-card-valor">C$ {reportData.ingresoPromedio.toFixed(0)}</p>
                            <p className="rep-card-desc">Promedio del período</p>
                        </div>
                    </div>

                    {/* Top Odontólogos */}
                    <div className="rep-section">
                        <h2 className="rep-section-titulo">ODONTÓLOGOS MÁS ACTIVOS</h2>
                        <div className="rep-tabla">
                            <div className="rep-tabla-header">
                                <div>Odontólogo</div>
                                <div>Citas</div>
                                <div>%</div>
                            </div>
                            {reportData.tarjetas.map((od, i) => (
                                <div key={i} className="rep-tabla-row">
                                    <div>Dr. {od.nombre} {od.apellido}</div>
                                    <div>{od.total}</div>
                                    <div>
                                        {reportData.citasTotal > 0
                                            ? ((od.total / reportData.citasTotal) * 100).toFixed(1)
                                            : 0}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resumen financiero */}
                    <div className="rep-section">
                        <h2 className="rep-section-titulo">RESUMEN FINANCIERO</h2>
                        <div className="rep-finanzas">
                            <div className="rep-fin-item">
                                <span>Ingresos Este Mes</span>
                                <strong>C$ {reportData.pagosMes.toLocaleString()}</strong>
                            </div>
                            <div className="rep-fin-item">
                                <span>Ingresos Acumulados</span>
                                <strong>C$ {reportData.pagosTotal.toLocaleString()}</strong>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
