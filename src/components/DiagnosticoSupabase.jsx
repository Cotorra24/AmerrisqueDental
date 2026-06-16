import { useState, useEffect } from 'react'
import { supabase } from '../database/supabaseconfig'

export default function DiagnosticoSupabase() {
    const [estado, setEstado] = useState({
        conexion: 'verificando...',
        tablas: {},
        autenticacion: 'verificando...',
        timestamp: new Date().toLocaleString()
    })

    useEffect(() => {
        const diagnosticar = async () => {
            const resultado = { ...estado }

            // Test 1: Conexión a Supabase
            try {
                console.log('🔍 Test 1: Verificando conexión a Supabase...')
                const { data, error } = await supabase
                    .from('pacientes')
                    .select('count', { count: 'exact', head: true })

                if (error) {
                    console.error('Error:', error)
                    resultado.conexion = `❌ Error: ${error.message}`
                } else {
                    resultado.conexion = '✅ Conexión OK'
                }
            } catch (e) {
                resultado.conexion = `❌ ${e.message}`
            }

            // Test 2: Verificar tablas
            const tablas = ['pacientes', 'citas', 'servicios', 'historiales_clinicos', 'pagos']
            const resultadoTablas = {}

            for (const tabla of tablas) {
                try {
                    const { count, error } = await supabase
                        .from(tabla)
                        .select('*', { count: 'exact', head: true })

                    resultadoTablas[tabla] = error ? `❌ ${error.message}` : '✅ Existe'
                } catch (e) {
                    resultadoTablas[tabla] = `❌ ${e.message}`
                }
            }
            resultado.tablas = resultadoTablas

            // Test 3: Autenticación
            try {
                const { data: { user } } = await supabase.auth.getUser()
                resultado.autenticacion = user ? `✅ Usuario: ${user.email}` : '⚠️ No autenticado'
            } catch (e) {
                resultado.autenticacion = `❌ ${e.message}`
            }

            setEstado({ ...resultado, timestamp: new Date().toLocaleString() })
        }

        diagnosticar()
    }, [])

    return (
        <div style={{
            background: '#f9fafb',
            padding: '20px',
            borderRadius: '12px',
            border: '1.5px solid #e5e7eb',
            margin: '20px 0',
            fontFamily: 'monospace',
            fontSize: '0.85rem'
        }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#000', fontWeight: 700 }}>
                🔧 Diagnóstico Supabase
            </h3>

            <div style={{ marginBottom: '10px' }}>
                <strong>Conexión:</strong> {estado.conexion}
            </div>

            <div style={{ marginBottom: '10px' }}>
                <strong>Autenticación:</strong> {estado.autenticacion}
            </div>

            <div style={{ marginBottom: '10px' }}>
                <strong>Tablas:</strong>
                <div style={{ marginLeft: '15px', marginTop: '5px' }}>
                    {Object.entries(estado.tablas).map(([tabla, status]) => (
                        <div key={tabla}>{tabla}: {status}</div>
                    ))}
                </div>
            </div>

            <div style={{ marginTop: '15px', color: '#6b7280', fontSize: '0.75rem' }}>
                Última actualización: {estado.timestamp}
            </div>
        </div>
    )
}
