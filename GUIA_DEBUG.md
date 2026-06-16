# 🔧 Guía de Debugging - Amerrisque Dental

## 📋 Situación Actual

Has completado la implementación de múltiples funcionalidades:
- ✅ Catálogo de Servicios con CRUD completo
- ✅ Clínico (Historial Clínico)
- ✅ Reportes y Analytics
- ✅ Mejoras en formularios (labels horizontales)

**PROBLEMA REPORTADO:** "No me registra nada" - Los datos no se guardan en Supabase

## 🔍 Pasos para Debugging

### Paso 1: Verificar la Consola del Navegador
1. Abre la aplicación en el navegador
2. Presiona **F12** para abrir Developer Tools
3. Ve a la pestaña **Console**
4. Intenta registrar un paciente o realizar cualquier operación CRUD
5. **Busca mensajes rojo/naranja** que indiquen errores

### Paso 2: Leer los Logs Mejorados
Con los cambios recientes, verás logs detallados como:

```
📝 Registrando paciente: {nombre: "Test", apellido: "User", ...}
✓ Paciente registrado: [{id: 123, nombre: "Test", ...}]
```

O en caso de error:
```
❌ Error Supabase: {
  code: "...",
  message: "...",
  details: "...",
  hint: "..."
}
```

### Paso 3: Verificar la Conexión a Supabase
Ejecuta este comando en la consola del navegador:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://stjlnizbfaaysruvzflw.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0amxuaXpiZmFheXNydXZ6Zmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MzM3MjQsImV4cCI6MjA5NDAwOTcyNH0.YWroh1MhRoJhn0LG89tWvqoCOObLbxSEFz57snzErPg'
)

// Prueba conexión
const { count } = await supabase.from('pacientes').select('*', { count: 'exact', head: true })
console.log('Total pacientes:', count)
```

### Paso 4: Verificar Tablas en Supabase
Accede al dashboard de Supabase:
1. Ve a https://app.supabase.com
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto
4. En el menú lateral, ve a **SQL Editor**
5. Verifica que estas tablas existan:
   - `pacientes`
   - `citas`
   - `servicios`
   - `historiales_clinicos`
   - `pagos`
   - `tratamientos`

Si alguna falta, deberás crearla (contacta al admin).

### Paso 5: Verificar Políticas RLS (Row Level Security)
Las políticas RLS pueden bloquear operaciones. Ve a **Authentication** → **Policies** en el dashboard:

1. Cada tabla debe tener una política que permita:
   - SELECT (lectura)
   - INSERT (creación)
   - UPDATE (edición)
   - DELETE (eliminación)

2. La política debe permitir a usuarios autenticados o anónimos acceder

3. Si ves "❌ Error: You do not have permission" → El problema es RLS

## 📊 Funcionalidades Implementadas y Listas para Probar

### 1. Gestión de Pacientes
- **Ubicación:** Admin → Pacientes
- **Funciones:**
  - ✅ Registrar paciente
  - ✅ Ver lista de pacientes
  - ✅ Editar paciente
  - ✅ Activar/Desactivar paciente
  - ❌ Eliminar paciente (aún no implementado)

### 2. Historial Clínico
- **Ubicación:** Admin → Historial Clínico
- **Funciones:**
  - ✅ Ver historial por paciente
  - ✅ Registrar diagnóstico
  - ✅ Registrar tratamiento
  - ✅ Registrar observaciones
  - ✅ Editar historial
  - ✅ Eliminar historial

### 3. Catálogo de Servicios
- **Ubicación:** Paciente → Catálogo
- **Funciones:**
  - ✅ Ver servicios con imágenes
  - ✅ Crear nuevo servicio (admin)
  - ✅ Editar servicio
  - ✅ Eliminar servicio
  - ✅ Subir imágenes a Supabase Storage

### 4. Reportes y Analytics
- **Ubicación:** Admin → Reportes
- **Funciones:**
  - ✅ KPIs: Total citas, completadas, ingresos
  - ✅ Gráficos de porcentaje
  - ✅ Tabla de odontólogos
  - ✅ Resumen financiero
  - ✅ Filtros por mes y año

### 5. Cancelar Cita
- **Ubicación:** Odontólogo → Mis Citas / Paciente → Mi Cita
- **Funciones:**
  - ✅ Cancelar cita próxima
  - ✅ Cambiar estado a "cancelada"

## 🐛 Errores Comunes y Soluciones

### Error: "You do not have permission"
**Causa:** Política RLS bloqueando operaciones
**Solución:** Contacta al admin para que configure las políticas RLS

### Error: "Table does not exist"
**Causa:** La tabla no existe en Supabase
**Solución:** El admin debe crear las tablas con el SQL correcto

### Error: "Invalid API key"
**Causa:** URL o API key incorrecta
**Solución:** Verifica que supabaseconfig.js tenga los valores correctos

### Error: "Could not authenticate"
**Causa:** Usuario no autenticado
**Solución:** Inicia sesión primero

## 📝 Cómo Reportar un Error

Cuando encuentres un problema, abre la consola (F12) y copia:
1. El mensaje de error exacto
2. El stack trace completo
3. El resultado de los logs (📝 Registrando...)
4. La URL exacta donde ocurrió

Incluye esta información cuando reportes el bug.

## ✅ Checklist de Prueba

- [ ] Puedo iniciar sesión
- [ ] Puedo registrar un paciente (Admin → Pacientes)
- [ ] Veo el paciente en la lista
- [ ] Puedo editar el paciente
- [ ] Puedo activar/desactivar el paciente
- [ ] Puedo registrar un historial clínico (Admin → Historial)
- [ ] Puedo crear un servicio (Admin o Paciente → Catálogo)
- [ ] Puedo subir una imagen para el servicio
- [ ] Puedo ver los reportes (Admin → Reportes)
- [ ] Puedo cancelar una cita

Si alguno de estos fallos, reporta el error que ves en la consola.

## 🚀 Próximas Mejoras

Después de confirmar que todo funciona:
- [ ] Agregar validaciones de email
- [ ] Agregar validaciones de teléfono
- [ ] Mejorar mensajes de error (toasts)
- [ ] Agregar búsqueda avanzada
- [ ] Agregar exportar a PDF/Excel
- [ ] Mejorar performance con paginación

---

**Última actualización:** 2025-01-20
**Estado:** En testing
