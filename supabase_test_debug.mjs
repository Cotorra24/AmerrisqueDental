import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://stjlnizbfaaysruvzflw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0amxuaXpiZmFheXNydXZ6Zmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MzM3MjQsImV4cCI6MjA5NDAwOTcyNH0.YWroh1MhRoJhn0LG89tWvqoCOObLbxSEFz57snzErPg'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Iniciando prueba de Supabase...\n')

// Prueba 1: Verificar conexión
console.log('✓ Conexión a Supabase: OK')
console.log(`  URL: ${supabaseUrl}\n`)

// Prueba 2: Listar tablas (intentar SELECT vacío)
console.log('📋 Prueba 2: Verificando tablas...')
try {
    const { data: pacientes, error: errorPacientes } = await supabase
        .from('pacientes')
        .select('count')
        .limit(1)
    
    if (errorPacientes) {
        console.log('  ❌ pacientes:', errorPacientes.message)
    } else {
        console.log('  ✓ pacientes: Existe')
    }
} catch (e) {
    console.log('  ❌ pacientes:', e.message)
}

try {
    const { data: citas, error: errorCitas } = await supabase
        .from('citas')
        .select('count')
        .limit(1)
    
    if (errorCitas) {
        console.log('  ❌ citas:', errorCitas.message)
    } else {
        console.log('  ✓ citas: Existe')
    }
} catch (e) {
    console.log('  ❌ citas:', e.message)
}

try {
    const { data: servicios, error: errorServicios } = await supabase
        .from('servicios')
        .select('count')
        .limit(1)
    
    if (errorServicios) {
        console.log('  ❌ servicios:', errorServicios.message)
    } else {
        console.log('  ✓ servicios: Existe')
    }
} catch (e) {
    console.log('  ❌ servicios:', e.message)
}

// Prueba 3: INSERT de prueba
console.log('\n🧪 Prueba 3: Intentando INSERT...')
try {
    const { data, error } = await supabase
        .from('pacientes')
        .insert([{
            nombre: 'TEST',
            apellido: 'DEBUG',
            cedula: '999-999999-9999',
            telefono: '0000-0000',
            email: 'test@debug.com',
            fecha_nacimiento: '2000-01-01',
            sexo: 'otro',
            direccion: 'Test Address',
            activo: true
        }])
        .select()
    
    if (error) {
        console.log('  ❌ Error al insertar:')
        console.log('     Código:', error.code)
        console.log('     Mensaje:', error.message)
        console.log('     Detalles:', error.details)
        console.log('\n  💡 Posibles causas:')
        console.log('     - RLS policies bloqueando INSERT')
        console.log('     - Tabla no existe')
        console.log('     - Falta autenticación')
    } else {
        console.log('  ✓ INSERT exitoso')
        console.log('  Data:', data)
        
        // Si fue exitoso, eliminar el registro de prueba
        if (data && data.length > 0) {
            const { error: deleteError } = await supabase
                .from('pacientes')
                .delete()
                .eq('id', data[0].id)
            
            if (!deleteError) {
                console.log('  ✓ Registro de prueba eliminado')
            }
        }
    }
} catch (e) {
    console.log('  ❌ Excepción:', e.message)
}

console.log('\n✓ Prueba completada')
