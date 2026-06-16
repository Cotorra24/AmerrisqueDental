import { useEffect, useState } from 'react'
import { supabase } from '../../database/supabaseconfig'
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts'
import './DashboardsAnalytics.css'

const PALETTE = {
    azul:    '#3b82f6',
    verde:   '#10b981',
    morado:  '#8b5cf6',
    naranja: '#f59e0b',
    rojo:    '#ef4444',
    cyan:    '#06b6d4',
    rosa:    '#ec4899',
    indigo:  '#6366f1',
}

const TABS = [
    { id: 'pagos',      label: '💰 Pagos',          color: PALETTE.verde   },
    { id: 'tratam',     label: '🦷 Tratamientos',    color: PALETTE.morado  },
    { id: 'citas',      label: '📅 Citas',            color: PALETTE.azul    },
    { id: 'pacientes',  label: '👥 Pacientes',        color: PALETTE.naranja },
    { id: 'historial',  label: '📋 Historial Clínico', color: PALETTE.cyan   },
]

function KpiCard({ icono, valor, label, sublabel, color }) {
    return (
        <div className="da-kpi" style={{ borderTop: `4px solid ${color}` }}>
            <div className="da-kpi-icon" style={{ background: color + '20', color }}>{icono}</div>
            <div className="da-kpi-body">
                <p className="da-kpi-valor" style={{ color }}>{valor}</p>
                <p className="da-kpi-label">{label}</p>
                {sublabel && <p className="da-kpi-sub">{sublabel}</p>}
            </div>
        </div>
    )
}

function ChartCard({ titulo, children, full }) {
    return (
        <div className={`da-chart-card ${full ? 'da-full' : ''}`}>
            <p className="da-chart-titulo">{titulo}</p>
            {children}
        </div>
    )
}

function CustomTooltip({ active, payload, label, prefix = '', suffix = '' }) {
    if (active && payload?.length) {
        return (
            <div className="da-tooltip">
                <p className="da-tooltip-label">{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color, margin: '2px 0', fontSize: '0.85rem' }}>
                        {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString('es-NI') : p.value}{suffix}
                    </p>
                ))}
            </div>
        )
    }
    return null
}


export default function DashboardsAnalytics({ onVolver }) {
    const [tab, setTab] = useState('pagos')
    const [cargando, setCargando] = useState(true)
    const [datos, setDatos] = useState({
        pagos: null, tratam: null, citas: null, pacientes: null, historial: null
    })

    useEffect(() => { cargarTodo() }, [])

    async function cargarTodo() {
        setCargando(true)
        try {
            const hoy = new Date()
            const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
            const hace30 = new Date(hoy - 30 * 86400000).toISOString().split('T')[0]
            const hace6m = new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1).toISOString().split('T')[0]

            const [pagosRes, citasRes, pacientesRes, tratamRes, histRes] = await Promise.all([
                supabase.from('pagos').select('monto, fecha_pago, estado, paciente_id, pacientes(nombre,apellido)'),
                supabase.from('citas').select('estado, fecha_hora, paciente_id').gte('fecha_hora', hace6m + 'T00:00:00'),
                supabase.from('pacientes').select('id, nombre, apellido, activo, created_at'),
                supabase.from('tratamientos').select('estado, tipo, fecha_inicio, fecha_fin, paciente_id').gte('created_at', hace6m + 'T00:00:00'),
                supabase.from('historiales').select('paciente_id, created_at, diagnostico'),
            ])

            setDatos({
                pagos:     procesarPagos(pagosRes.data || [], hace30),
                tratam:    procesarTratam(tratamRes.data || []),
                citas:     procesarCitas(citasRes.data || []),
                pacientes: procesarPacientes(pacientesRes.data || [], citasRes.data || []),
                historial: procesarHistorial(histRes.data || [], tratamRes.data || [], pacientesRes.data || []),
            })
        } catch (e) {
            console.error(e)
            setDatos({ pagos: mockPagos(), tratam: mockTratam(), citas: mockCitas(), pacientes: mockPacientes(), historial: mockHistorial() })
        } finally {
            setCargando(false)
        }
    }

    return (
        <div className="da-wrapper">
            <div className="da-header">
                {onVolver && <button className="da-back" onClick={onVolver}>← Volver</button>}
                <div>
                    <h1 className="da-titulo">📊 Dashboards de Análisis</h1>
                    <p className="da-subtitulo">Visualización integral — Clínica Amerrisque Dental</p>
                </div>
                <button className="da-refresh" onClick={cargarTodo} title="Actualizar datos">↻</button>
            </div>

            <div className="da-tabs">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        className={`da-tab ${tab === t.id ? 'active' : ''}`}
                        style={tab === t.id ? { borderBottom: `3px solid ${t.color}`, color: t.color } : {}}
                        onClick={() => setTab(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="da-content">
                {cargando ? (
                    <div className="da-loading">
                        <div className="da-spinner" />
                        <p>Cargando datos desde Supabase...</p>
                    </div>
                ) : (
                    <>
                        {tab === 'pagos'     && <PanelPagos     d={datos.pagos     || mockPagos()}     />}
                        {tab === 'tratam'    && <PanelTratam    d={datos.tratam    || mockTratam()}    />}
                        {tab === 'citas'     && <PanelCitas     d={datos.citas     || mockCitas()}     />}
                        {tab === 'pacientes' && <PanelPacientes d={datos.pacientes || mockPacientes()} />}
                        {tab === 'historial' && <PanelHistorial d={datos.historial || mockHistorial()} />}
                    </>
                )}
            </div>
        </div>
    )
}

function procesarPagos(pagos, desde) {
    const pagosRecientes = pagos.filter(p => p.fecha_pago >= desde)
    const totalIngresos  = pagos.reduce((s, p) => s + Number(p.monto || 0), 0)
    const pendientes     = pagos.filter(p => p.estado === 'pendiente')
    const completados    = pagos.filter(p => p.estado === 'pagado' || p.estado === 'completado')
    const deudaTotal     = pendientes.reduce((s, p) => s + Number(p.monto || 0), 0)
    const ingresoDiario  = totalIngresos / 30

    const porDia = {}
    pagosRecientes.forEach(p => {
        const d = p.fecha_pago?.substring(0, 10) || ''
        if (!porDia[d]) porDia[d] = 0
        porDia[d] += Number(p.monto || 0)
    })
    const evolucion = Object.entries(porDia).sort(([a], [b]) => a.localeCompare(b)).slice(-14).map(([fecha, total]) => ({
        fecha: fecha.substring(5), total
    }))

    const porEstado = [
        { name: 'Pagado',   value: completados.length, fill: PALETTE.verde  },
        { name: 'Pendiente', value: pendientes.length,  fill: PALETTE.rojo   },
    ]

    const topDeudores = {}
    pendientes.forEach(p => {
        const k = p.paciente_id
        if (!topDeudores[k]) topDeudores[k] = { nombre: p.pacientes?.nombre || 'N/A', deuda: 0 }
        topDeudores[k].deuda += Number(p.monto || 0)
    })
    const topDeudoresList = Object.values(topDeudores).sort((a, b) => b.deuda - a.deuda).slice(0, 5)

    const ppc = pagos.length > 0 ? ((completados.length / pagos.length) * 100).toFixed(1) : 0
    const morosidad = pagos.length > 0 ? ((pendientes.length / pagos.length) * 100).toFixed(1) : 0
    const promPago = completados.length > 0 ? (completados.reduce((s, p) => s + Number(p.monto || 0), 0) / completados.length) : 0

    return { totalIngresos, ingresoDiario, deudaTotal, totalPagos: pagos.length, ppc, morosidad, promPago, evolucion, porEstado, topDeudoresList }
}

function procesarTratam(tratam) {
    const activos     = tratam.filter(t => t.estado === 'en_proceso' || t.estado === 'activo' || t.estado === 'en proceso')
    const finalizados = tratam.filter(t => t.estado === 'finalizado' || t.estado === 'completado')
    const pendientes  = tratam.filter(t => t.estado === 'pendiente')
    const abandonados = tratam.filter(t => t.estado === 'abandonado' || t.estado === 'cancelado')
    const total = tratam.length || 1

    const porEstado = [
        { name: 'Activos',     value: activos.length,     fill: PALETTE.azul    },
        { name: 'Finalizados', value: finalizados.length, fill: PALETTE.verde   },
        { name: 'Pendientes',  value: pendientes.length,  fill: PALETTE.naranja },
        { name: 'Abandonados', value: abandonados.length, fill: PALETTE.rojo    },
    ].filter(e => e.value > 0)

    const porTipo = {}
    tratam.forEach(t => {
        const tipo = t.tipo || 'Sin tipo'
        porTipo[tipo] = (porTipo[tipo] || 0) + 1
    })
    const porTipoList = Object.entries(porTipo).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([tipo, cantidad]) => ({ tipo, cantidad }))

    const duraciones = finalizados
        .filter(t => t.fecha_inicio && t.fecha_fin)
        .map(t => (new Date(t.fecha_fin) - new Date(t.fecha_inicio)) / 86400000)
    const duracionProm = duraciones.length > 0 ? (duraciones.reduce((s, d) => s + d, 0) / duraciones.length).toFixed(1) : 0

    const pct = ((finalizados.length / total) * 100).toFixed(1)

    const porMes = {}
    tratam.forEach(t => {
        const m = t.fecha_inicio?.substring(0, 7) || ''
        if (m) porMes[m] = (porMes[m] || 0) + 1
    })
    const evolucion = Object.entries(porMes).sort(([a], [b]) => a.localeCompare(b)).map(([mes, total]) => ({ mes: mes.substring(5), total }))

    return { total, activos: activos.length, finalizados: finalizados.length, pendientes: pendientes.length, abandonados: abandonados.length, duracionProm, pct, porEstado, porTipoList, evolucion }
}

function procesarCitas(citas) {
    const total       = citas.length || 1
    const atendidas   = citas.filter(c => c.estado === 'completada' || c.estado === 'atendida')
    const canceladas  = citas.filter(c => c.estado === 'cancelada')
    const noAsistio   = citas.filter(c => c.estado === 'no_asistio' || c.estado === 'inasistencia')
    const programadas = citas.filter(c => c.estado === 'programada' || c.estado === 'pendiente')

    const porEstado = [
        { name: 'Atendidas',   value: atendidas.length,   fill: PALETTE.verde   },
        { name: 'Canceladas',  value: canceladas.length,  fill: PALETTE.rojo    },
        { name: 'No asistió',  value: noAsistio.length,   fill: PALETTE.naranja },
        { name: 'Programadas', value: programadas.length, fill: PALETTE.azul    },
    ].filter(e => e.value > 0)

    const porDiaSemana = { Lun: 0, Mar: 0, Mié: 0, Jue: 0, Vie: 0, Sáb: 0, Dom: 0 }
    const diasNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    citas.forEach(c => {
        const d = diasNames[new Date(c.fecha_hora).getDay()]
        if (porDiaSemana[d] !== undefined) porDiaSemana[d]++
    })
    const porDia = Object.entries(porDiaSemana).map(([dia, citas]) => ({ dia, citas }))

    const porHora = {}
    citas.forEach(c => {
        const h = new Date(c.fecha_hora).getHours()
        porHora[h] = (porHora[h] || 0) + 1
    })
    const porHoraList = Object.entries(porHora).sort(([a], [b]) => Number(a) - Number(b)).map(([hora, cant]) => ({ hora: `${hora}:00`, cant }))

    const porMes = {}
    citas.forEach(c => {
        const m = c.fecha_hora?.substring(0, 7) || ''
        if (m) porMes[m] = (porMes[m] || 0) + 1
    })
    const evolucion = Object.entries(porMes).sort().map(([mes, total]) => ({ mes: mes.substring(5), total }))

    const tc = ((canceladas.length / total) * 100).toFixed(1)
    const ti = ((noAsistio.length / total) * 100).toFixed(1)
    const ta = ((atendidas.length / total) * 100).toFixed(1)
    const promDia = (total / 30).toFixed(1)

    return { total, atendidas: atendidas.length, canceladas: canceladas.length, noAsistio: noAsistio.length, tc, ti, ta, promDia, porEstado, porDia, porHoraList, evolucion }
}

function procesarPacientes(pacientes, citas) {
    const activos   = pacientes.filter(p => p.activo)
    const inactivos = pacientes.filter(p => !p.activo)
    const hace30    = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
    const nuevos    = pacientes.filter(p => p.created_at >= hace30)

    const citasPorPac = {}
    citas.forEach(c => {
        if (c.paciente_id) citasPorPac[c.paciente_id] = (citasPorPac[c.paciente_id] || 0) + 1
    })
    const visitas = Object.values(citasPorPac)
    const frecProm = visitas.length > 0 ? (visitas.reduce((s, v) => s + v, 0) / visitas.length).toFixed(1) : 0
    const recurrentes = visitas.filter(v => v > 1).length
    const tasaRec = pacientes.length > 0 ? ((recurrentes / pacientes.length) * 100).toFixed(1) : 0

    const porMes = {}
    pacientes.forEach(p => {
        const m = p.created_at?.substring(0, 7) || ''
        if (m) porMes[m] = (porMes[m] || 0) + 1
    })
    const evolucion = Object.entries(porMes).sort().slice(-6).map(([mes, total]) => ({ mes: mes.substring(5), total }))

    const segmentacion = [
        { name: 'Activos',      value: activos.length,   fill: PALETTE.verde   },
        { name: 'Inactivos',    value: inactivos.length, fill: PALETTE.rojo    },
        { name: 'Recurrentes',  value: recurrentes,      fill: PALETTE.morado  },
    ].filter(e => e.value > 0)

    const frecuencias = [
        { rango: '1 visita',   cant: visitas.filter(v => v === 1).length },
        { rango: '2-3 visitas', cant: visitas.filter(v => v >= 2 && v <= 3).length },
        { rango: '4-6 visitas', cant: visitas.filter(v => v >= 4 && v <= 6).length },
        { rango: '7+ visitas',  cant: visitas.filter(v => v >= 7).length },
    ]

    return { total: pacientes.length, activos: activos.length, inactivos: inactivos.length, nuevos: nuevos.length, frecProm, tasaRec, recurrentes, evolucion, segmentacion, frecuencias }
}

function procesarHistorial(historiales, tratam, pacientes) {
    const total = historiales.length || 1
    const porPac = {}
    historiales.forEach(h => {
        porPac[h.paciente_id] = (porPac[h.paciente_id] || 0) + 1
    })
    const consultas = Object.values(porPac)
    const promConsultas = consultas.length > 0 ? (consultas.reduce((s, v) => s + v, 0) / consultas.length).toFixed(1) : 0
    const conSeguimiento = Object.values(porPac).filter(v => v > 1).length

    const finalizados = tratam.filter(t => t.estado === 'finalizado' || t.estado === 'completado')
    const tfPct = tratam.length > 0 ? ((finalizados.length / tratam.length) * 100).toFixed(1) : 0

    const duraciones = finalizados
        .filter(t => t.fecha_inicio && t.fecha_fin)
        .map(t => (new Date(t.fecha_fin) - new Date(t.fecha_inicio)) / 86400000)
    const tpt = duraciones.length > 0 ? (duraciones.reduce((s, d) => s + d, 0) / duraciones.length).toFixed(1) : 0

    const porMes = {}
    historiales.forEach(h => {
        const m = h.created_at?.substring(0, 7) || ''
        if (m) porMes[m] = (porMes[m] || 0) + 1
    })
    const evolucion = Object.entries(porMes).sort().slice(-6).map(([mes, total]) => ({ mes: mes.substring(5), total }))

    const porDiagnostico = {}
    historiales.forEach(h => {
        const d = h.diagnostico || 'Sin diagnóstico'
        porDiagnostico[d] = (porDiagnostico[d] || 0) + 1
    })
    const topDiagnos = Object.entries(porDiagnostico).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([diag, cant]) => ({ diag: diag.length > 20 ? diag.substring(0, 20) + '…' : diag, cant }))

    const porTipoTratam = {}
    tratam.forEach(t => {
        const tipo = t.tipo || 'Sin tipo'
        porTipoTratam[tipo] = (porTipoTratam[tipo] || 0) + 1
    })
    const topTratam = Object.entries(porTipoTratam).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tipo, cant]) => ({ tipo: tipo.length > 18 ? tipo.substring(0, 18) + '…' : tipo, cant }))

    const tppRaw = pacientes.length > 0 ? (tratam.length / pacientes.length).toFixed(1) : 0

    return { total, promConsultas, conSeguimiento, tfPct, tpt, tppRaw, evolucion, topDiagnos, topTratam }
}

function mockPagos() {
    return {
        totalIngresos: 125400, ingresoDiario: 4180, deudaTotal: 18700, totalPagos: 148,
        ppc: 87.2, morosidad: 12.8, promPago: 870,
        evolucion: [
            { fecha: '06-01', total: 3200 }, { fecha: '06-03', total: 4500 }, { fecha: '06-05', total: 2800 },
            { fecha: '06-07', total: 5100 }, { fecha: '06-09', total: 3900 }, { fecha: '06-11', total: 4700 },
            { fecha: '06-13', total: 6200 }, { fecha: '06-15', total: 5500 },
        ],
        porEstado: [{ name: 'Pagado', value: 129, fill: PALETTE.verde }, { name: 'Pendiente', value: 19, fill: PALETTE.rojo }],
        topDeudoresList: [
            { nombre: 'Carlos Martínez', deuda: 4200 }, { nombre: 'María López', deuda: 3500 },
            { nombre: 'José Hernández', deuda: 2900 }, { nombre: 'Ana Rodríguez', deuda: 2100 },
            { nombre: 'Luis Pérez', deuda: 1900 },
        ],
    }
}

function mockTratam() {
    return {
        total: 84, activos: 23, finalizados: 47, pendientes: 10, abandonados: 4,
        duracionProm: 18.5, pct: 55.9,
        porEstado: [
            { name: 'Activos', value: 23, fill: PALETTE.azul }, { name: 'Finalizados', value: 47, fill: PALETTE.verde },
            { name: 'Pendientes', value: 10, fill: PALETTE.naranja }, { name: 'Abandonados', value: 4, fill: PALETTE.rojo },
        ],
        porTipoList: [
            { tipo: 'Limpieza', cantidad: 22 }, { tipo: 'Extracción', cantidad: 18 },
            { tipo: 'Ortodoncia', cantidad: 14 }, { tipo: 'Endodoncia', cantidad: 12 },
            { tipo: 'Blanqueamiento', cantidad: 10 }, { tipo: 'Implante', cantidad: 8 },
        ],
        evolucion: [
            { mes: '01', total: 10 }, { mes: '02', total: 14 }, { mes: '03', total: 12 },
            { mes: '04', total: 18 }, { mes: '05', total: 16 }, { mes: '06', total: 14 },
        ],
    }
}

function mockCitas() {
    return {
        total: 210, atendidas: 158, canceladas: 27, noAsistio: 15, tc: 12.9, ti: 7.1, ta: 75.2, promDia: 7,
        porEstado: [
            { name: 'Atendidas', value: 158, fill: PALETTE.verde }, { name: 'Canceladas', value: 27, fill: PALETTE.rojo },
            { name: 'No asistió', value: 15, fill: PALETTE.naranja }, { name: 'Programadas', value: 10, fill: PALETTE.azul },
        ],
        porDia: [
            { dia: 'Lun', citas: 38 }, { dia: 'Mar', citas: 42 }, { dia: 'Mié', citas: 35 },
            { dia: 'Jue', citas: 40 }, { dia: 'Vie', citas: 36 }, { dia: 'Sáb', citas: 19 }, { dia: 'Dom', citas: 0 },
        ],
        porHoraList: [
            { hora: '8:00', cant: 15 }, { hora: '9:00', cant: 28 }, { hora: '10:00', cant: 35 },
            { hora: '11:00', cant: 32 }, { hora: '12:00', cant: 18 }, { hora: '14:00', cant: 30 },
            { hora: '15:00', cant: 27 }, { hora: '16:00', cant: 25 },
        ],
        evolucion: [
            { mes: '01', total: 32 }, { mes: '02', total: 28 }, { mes: '03', total: 36 },
            { mes: '04', total: 40 }, { mes: '05', total: 38 }, { mes: '06', total: 36 },
        ],
    }
}

function mockPacientes() {
    return {
        total: 148, activos: 112, inactivos: 36, nuevos: 14, frecProm: 3.2, tasaRec: 68.2, recurrentes: 101,
        evolucion: [
            { mes: '01', total: 18 }, { mes: '02', total: 22 }, { mes: '03', total: 19 },
            { mes: '04', total: 25 }, { mes: '05', total: 30 }, { mes: '06', total: 34 },
        ],
        segmentacion: [
            { name: 'Activos', value: 112, fill: PALETTE.verde },
            { name: 'Inactivos', value: 36, fill: PALETTE.rojo },
            { name: 'Recurrentes', value: 101, fill: PALETTE.morado },
        ],
        frecuencias: [
            { rango: '1 visita', cant: 47 }, { rango: '2-3 visitas', cant: 55 },
            { rango: '4-6 visitas', cant: 30 }, { rango: '7+ visitas', cant: 16 },
        ],
    }
}

function mockHistorial() {
    return {
        total: 312, promConsultas: 2.1, conSeguimiento: 89, tfPct: 78.4, tpt: 18.5, tppRaw: 1.8,
        evolucion: [
            { mes: '01', total: 45 }, { mes: '02', total: 52 }, { mes: '03', total: 48 },
            { mes: '04', total: 61 }, { mes: '05', total: 57 }, { mes: '06', total: 49 },
        ],
        topDiagnos: [
            { diag: 'Caries dental', cant: 78 }, { diag: 'Gingivitis', cant: 52 },
            { diag: 'Periodontitis', cant: 38 }, { diag: 'Maloclusión', cant: 29 }, { diag: 'Bruxismo', cant: 21 },
        ],
        topTratam: [
            { tipo: 'Limpieza', cant: 65 }, { tipo: 'Extracción', cant: 48 },
            { tipo: 'Restauración', cant: 42 }, { tipo: 'Endodoncia', cant: 31 }, { tipo: 'Ortodoncia', cant: 26 },
        ],
    }
}

function PanelPagos({ d }) {
    return (
        <div className="da-panel">
            <div className="da-panel-titulo">
                <span className="da-panel-dot" style={{ background: PALETTE.verde }} />
                Control de Pagos y Optimización Financiera
            </div>

            <div className="da-kpis-row">
                <KpiCard icono="💵" valor={`C$ ${d.ingresoDiario.toLocaleString('es-NI', { maximumFractionDigits: 0 })}`} label="Ingreso Promedio Diario"   sublabel="Últimos 30 días"  color={PALETTE.verde}   />
                <KpiCard icono="🏦" valor={`C$ ${d.totalIngresos.toLocaleString('es-NI', { maximumFractionDigits: 0 })}`} label="Total Ingresos Período" sublabel={`${d.totalPagos} pagos`} color={PALETTE.azul}   />
                <KpiCard icono="⚠️" valor={`C$ ${d.deudaTotal.toLocaleString('es-NI', { maximumFractionDigits: 0 })}`}    label="Deudas Pendientes"       sublabel="Monto total"       color={PALETTE.rojo}    />
                <KpiCard icono="✅" valor={`${d.ppc}%`}            label="Pagos Completados"      sublabel="Tasa de cumplimiento" color={PALETTE.cyan}    />
                <KpiCard icono="📉" valor={`${d.morosidad}%`}      label="Tasa de Morosidad"      sublabel="Pacientes morosos"    color={PALETTE.naranja} />
                <KpiCard icono="👤" valor={`C$ ${d.promPago.toLocaleString('es-NI', { maximumFractionDigits: 0 })}`}    label="Promedio por Paciente"   sublabel="Por pago realizado"color={PALETTE.morado}  />
            </div>

            <div className="da-charts-grid">
                <ChartCard titulo="📈 Evolución de Ingresos (Últimos 14 días)" full>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={d.evolucion} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gPagos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={PALETTE.verde} stopOpacity={0.35} />
                                    <stop offset="95%" stopColor={PALETTE.verde} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip prefix="C$ " />} />
                            <Area type="monotone" dataKey="total" name="Ingresos" stroke={PALETTE.verde} fill="url(#gPagos)" strokeWidth={2.5} dot={{ r: 3 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard titulo="🟢 Estado de Pagos">
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={d.porEstado} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                {d.porEstado.map((e, i) => <Cell key={i} fill={e.fill} />)}
                            </Pie>
                            <Tooltip formatter={(v) => `${v} pagos`} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard titulo="🏆 Top 5 Pacientes con Mayor Deuda">
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={d.topDeudoresList} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 11 }} />
                            <YAxis type="category" dataKey="nombre" tick={{ fontSize: 11 }} width={70} />
                            <Tooltip content={<CustomTooltip prefix="C$ " />} />
                            <Bar dataKey="deuda" name="Deuda" fill={PALETTE.rojo} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    )
}

function PanelTratam({ d }) {
    return (
        <div className="da-panel">
            <div className="da-panel-titulo">
                <span className="da-panel-dot" style={{ background: PALETTE.morado }} />
                Tratamientos Odontológicos — Estado y Seguimiento
            </div>

            <div className="da-kpis-row">
                <KpiCard icono="⚙️"  valor={d.activos}     label="Tratamientos Activos"    sublabel="En proceso"              color={PALETTE.azul}    />
                <KpiCard icono="✅"  valor={d.finalizados} label="Tratamientos Finalizados" sublabel="Completados exitosamente" color={PALETTE.verde}   />
                <KpiCard icono="⏳" valor={d.pendientes}  label="Tratamientos Pendientes"  sublabel="Sin iniciar"             color={PALETTE.naranja} />
                <KpiCard icono="📊" valor={`${d.pct}%`}   label="Tasa de Finalización"    sublabel="% de éxito"              color={PALETTE.morado}  />
                <KpiCard icono="📅" valor={`${d.duracionProm}d`} label="Duración Promedio" sublabel="Días por tratamiento"    color={PALETTE.cyan}    />
                <KpiCard icono="⛔" valor={d.abandonados} label="Abandonados"              sublabel="Interrumpidos"           color={PALETTE.rojo}    />
            </div>

            <div className="da-charts-grid">
                <ChartCard titulo="🥧 Distribución por Estado">
                    <ResponsiveContainer width="100%" height={230}>
                        <PieChart>
                            <Pie data={d.porEstado} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {d.porEstado.map((e, i) => <Cell key={i} fill={e.fill} />)}
                            </Pie>
                            <Tooltip formatter={(v) => `${v} tratamientos`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard titulo="📊 Tratamientos por Tipo (Top 6)">
                    <ResponsiveContainer width="100%" height={230}>
                        <BarChart data={d.porTipoList} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="tipo" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip suffix=" tratamientos" />} />
                            <Bar dataKey="cantidad" name="Cantidad" radius={[4, 4, 0, 0]}>
                                {d.porTipoList.map((_, i) => <Cell key={i} fill={Object.values(PALETTE)[i % 8]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard titulo="📈 Evolución Mensual de Tratamientos" full>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={d.evolucion} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip suffix=" tratamientos" />} />
                            <Line type="monotone" dataKey="total" name="Tratamientos" stroke={PALETTE.morado} strokeWidth={2.5} dot={{ r: 4, fill: PALETTE.morado }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    )
}

function PanelCitas({ d }) {
    return (
        <div className="da-panel">
            <div className="da-panel-titulo">
                <span className="da-panel-dot" style={{ background: PALETTE.azul }} />
                Control de Citas — Agenda y Disponibilidad
            </div>

            <div className="da-kpis-row">
                <KpiCard icono="📅" valor={d.promDia}      label="Citas Promedio/Día"   sublabel="Últimos 30 días"    color={PALETTE.azul}    />
                <KpiCard icono="✅" valor={d.atendidas}    label="Citas Atendidas"       sublabel={`${d.ta}% del total`} color={PALETTE.verde} />
                <KpiCard icono="❌" valor={d.canceladas}   label="Citas Canceladas"      sublabel={`TC: ${d.tc}%`}    color={PALETTE.rojo}    />
                <KpiCard icono="🚫" valor={d.noAsistio}   label="Inasistencias"         sublabel={`TI: ${d.ti}%`}    color={PALETTE.naranja} />
                <KpiCard icono="🔢" valor={d.total}       label="Total Citas"           sublabel="Período analizado"  color={PALETTE.morado}  />
            </div>

            <div className="da-charts-grid">
                <ChartCard titulo="📊 Citas por Día de la Semana">
                    <ResponsiveContainer width="100%" height={230}>
                        <BarChart data={d.porDia} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="dia" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip suffix=" citas" />} />
                            <Bar dataKey="citas" name="Citas" radius={[4, 4, 0, 0]}>
                                {d.porDia.map((_, i) => <Cell key={i} fill={Object.values(PALETTE)[i % 8]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard titulo="🟦 Estado de Citas">
                    <ResponsiveContainer width="100%" height={230}>
                        <PieChart>
                            <Pie data={d.porEstado} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                                {d.porEstado.map((e, i) => <Cell key={i} fill={e.fill} />)}
                            </Pie>
                            <Tooltip formatter={(v) => `${v} citas`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard titulo="⏰ Horarios con Mayor Demanda">
                    <ResponsiveContainer width="100%" height={230}>
                        <BarChart data={d.porHoraList} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="hora" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip suffix=" citas" />} />
                            <Bar dataKey="cant" name="Citas" fill={PALETTE.azul} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard titulo="📈 Evolución Mensual de Citas" full>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={d.evolucion} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gCitas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={PALETTE.azul} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={PALETTE.azul} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip suffix=" citas" />} />
                            <Area type="monotone" dataKey="total" name="Citas" stroke={PALETTE.azul} fill="url(#gCitas)" strokeWidth={2.5} dot={{ r: 4 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    )
}

function PanelPacientes({ d }) {
    return (
        <div className="da-panel">
            <div className="da-panel-titulo">
                <span className="da-panel-dot" style={{ background: PALETTE.naranja }} />
                Gestión de Pacientes — Actividad y Recurrencia
            </div>

            <div className="da-kpis-row">
                <KpiCard icono="🏥" valor={d.total}      label="Total Pacientes"      sublabel="En el sistema"        color={PALETTE.azul}    />
                <KpiCard icono="✅" valor={d.activos}    label="Pacientes Activos"    sublabel="Con actividad reciente" color={PALETTE.verde}  />
                <KpiCard icono="😴" valor={d.inactivos}  label="Pacientes Inactivos"  sublabel="Sin actividad reciente" color={PALETTE.rojo}   />
                <KpiCard icono="🆕" valor={d.nuevos}     label="Pacientes Nuevos"     sublabel="Últimos 30 días"      color={PALETTE.cyan}    />
                <KpiCard icono="🔄" valor={`${d.tasaRec}%`} label="Tasa de Recurrencia" sublabel="Regresan a consulta" color={PALETTE.morado} />
                <KpiCard icono="📊" valor={d.frecProm}   label="Visitas Promedio"     sublabel="Por paciente"         color={PALETTE.naranja} />
            </div>

            <div className="da-charts-grid">
                <ChartCard titulo="🥧 Segmentación de Pacientes">
                    <ResponsiveContainer width="100%" height={230}>
                        <PieChart>
                            <Pie data={d.segmentacion} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {d.segmentacion.map((e, i) => <Cell key={i} fill={e.fill} />)}
                            </Pie>
                            <Tooltip formatter={(v) => `${v} pacientes`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard titulo="📊 Frecuencia de Visitas">
                    <ResponsiveContainer width="100%" height={230}>
                        <BarChart data={d.frecuencias} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="rango" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip suffix=" pacientes" />} />
                            <Bar dataKey="cant" name="Pacientes" radius={[4, 4, 0, 0]}>
                                {d.frecuencias.map((_, i) => <Cell key={i} fill={Object.values(PALETTE)[i % 8]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard titulo="📈 Crecimiento de Pacientes por Mes" full>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={d.evolucion} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gPac" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={PALETTE.naranja} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={PALETTE.naranja} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip suffix=" pacientes" />} />
                            <Area type="monotone" dataKey="total" name="Pacientes" stroke={PALETTE.naranja} fill="url(#gPac)" strokeWidth={2.5} dot={{ r: 4 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    )
}

function PanelHistorial({ d }) {
    return (
        <div className="da-panel">
            <div className="da-panel-titulo">
                <span className="da-panel-dot" style={{ background: PALETTE.cyan }} />
                Historial Clínico — Evolución y Análisis Clínico
            </div>

            <div className="da-kpis-row">
                <KpiCard icono="📋" valor={d.total}           label="Historiales Registrados" sublabel="Total en sistema"    color={PALETTE.cyan}    />
                <KpiCard icono="🔬" valor={d.promConsultas}   label="Consultas por Paciente"  sublabel="Promedio"            color={PALETTE.azul}    />
                <KpiCard icono="⏱️" valor={`${d.tpt}d`}      label="Duración Prom. Tratam."  sublabel="Días promedio"       color={PALETTE.morado}  />
                <KpiCard icono="✅" valor={`${d.tfPct}%`}    label="Tasa de Finalización"    sublabel="Tratamientos OK"     color={PALETTE.verde}   />
                <KpiCard icono="🔄" valor={d.conSeguimiento} label="Con Seguimiento Clínico"  sublabel="Pacientes en control" color={PALETTE.naranja} />
                <KpiCard icono="📊" valor={d.tppRaw}         label="Tratamientos/Paciente"   sublabel="Promedio"            color={PALETTE.rojo}    />
            </div>

            <div className="da-charts-grid">
                <ChartCard titulo="🦠 Top 5 Diagnósticos Frecuentes">
                    <ResponsiveContainer width="100%" height={230}>
                        <BarChart data={d.topDiagnos} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 11 }} />
                            <YAxis type="category" dataKey="diag" tick={{ fontSize: 10 }} width={90} />
                            <Tooltip content={<CustomTooltip suffix=" casos" />} />
                            <Bar dataKey="cant" name="Casos" radius={[0, 4, 4, 0]}>
                                {d.topDiagnos.map((_, i) => <Cell key={i} fill={Object.values(PALETTE)[i % 8]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard titulo="🦷 Top 5 Tratamientos Realizados">
                    <ResponsiveContainer width="100%" height={230}>
                        <BarChart data={d.topTratam} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="tipo" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip suffix=" casos" />} />
                            <Bar dataKey="cant" name="Realizados" radius={[4, 4, 0, 0]}>
                                {d.topTratam.map((_, i) => <Cell key={i} fill={Object.values(PALETTE)[i % 8]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard titulo="📈 Evolución de Historiales Clínicos por Mes" full>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={d.evolucion} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip suffix=" registros" />} />
                            <Line type="monotone" dataKey="total" name="Historiales" stroke={PALETTE.cyan} strokeWidth={2.5} dot={{ r: 4, fill: PALETTE.cyan }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    )
}
