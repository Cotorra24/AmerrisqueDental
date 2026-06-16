# 🚀 Instrucciones de Testing - Mejoras Implementadas

## ✅ Cambios Realizados

### 1. **Estilos de Formularios Mejorados**
- ✅ Todos los labels en **NEGRITA** (!important garantizado)
- ✅ Labels al lado izquierdo de los campos
- ✅ Un campo por fila (layout horizontal)
- ✅ Espaciado consistente (gap 0.85rem)
- ✅ Bordes y colores mejorados

### 2. **Botones CRUD con Iconos**
- ✅ Botón "Nuevo" con icono ➕ (verde)
- ✅ Botón "Editar" con icono ✏️ (azul)
- ✅ Botón "Activo/Inactivo" con iconos ✅/🚫
- ✅ Efectos hover (sombra + elevación)
- ✅ Colores degradados profesionales

### 3. **Troubleshooting Supabase**
- ✅ Guía completa para error `net::ERR_NAME_NOT_RESOLVED`
- ✅ Documento de soluciones paso a paso
- ✅ Fallback a usuarios demo si Supabase no funciona
- ✅ Componente de diagnóstico visual

## 🧪 Cómo Probar

### Test 1: Formularios (Labels en Negrita)
1. Abre la aplicación
2. Ve a **Admin → Gestionar Pacientes**
3. Haz clic en **➕ Nuevo Paciente**
4. **Verifica que:**
   - ✅ El modal se abre
   - ✅ Todos los labels (Nombre, Apellido, etc.) están en **NEGRITA**
   - ✅ Los labels están al lado IZQUIERDO del campo
   - ✅ Cada campo ocupa una fila completa

### Test 2: Botones CRUD
1. En **Admin → Gestionar Pacientes**
2. **Verifica el botón Nuevo:**
   - ✅ Dice "➕ Nuevo Paciente"
   - ✅ Es de color verde
   - ✅ Al pasar mouse, tiene sombra y efecto elevación

3. **Si hay pacientes registrados, verifica los botones de la lista:**
   - ✅ Aparece "✏️ Editar" en azul
   - ✅ Aparece "✅ Activo" o "🚫 Inactivo" (verde/rojo)
   - ✅ Al pasar mouse, los botones se elevan

### Test 3: Editar Paciente
1. Haz clic en **✏️ Editar** en un paciente
2. **Verifica:**
   - ✅ Modal se abre
   - ✅ Todos los labels en NEGRITA
   - ✅ Campos están pre-llenados

### Test 4: Error de Supabase (Si No Conecta)
1. Si ves el error `net::ERR_NAME_NOT_RESOLVED`
2. **Soluciones rápidas:**
   - Verifica tu conexión a Internet
   - Ve a https://app.supabase.com (¿carga?)
   - Consulta [SUPABASE_ERROR_FIX.md](./SUPABASE_ERROR_FIX.md)

3. **Mientras tanto, usa usuarios demo:**
   ```
   Email: admin@test.com
   Contraseña: password123
   
   Email: paciente@test.com
   Contraseña: password123
   ```

## 📝 Pasos para Registrar un Paciente

### Opción 1: Con Supabase (Si Funciona)
1. Inicia sesión como Admin
2. Ve a **Admin → Gestionar Pacientes**
3. Haz clic en **➕ Nuevo Paciente**
4. Llena los campos:
   - Nombre * (obligatorio)
   - Apellido * (obligatorio)
   - Cédula (opcional)
   - Teléfono (opcional)
   - Email (opcional)
   - Fecha de nacimiento (opcional)
   - Sexo (opcional)
   - Dirección (opcional)
5. Haz clic en **Registrar paciente**
6. **Espera** a que aparezca "✓ Paciente registrado correctamente"

### Opción 2: Modo Demo (Sin Supabase)
1. Si Supabase no funciona, usa:
   ```
   admin@test.com / password123
   ```
2. El sistema funcionará en modo demo
3. Los datos se guardarán en `localStorage` (navegador)

## 🔍 Qué Ver en la Consola (F12)

### Si Todo Funciona ✅
```
📝 Registrando paciente: {nombre: "Juan", apellido: "Pérez", ...}
✓ Paciente registrado: [{id: 123, nombre: "Juan", ...}]
```

### Si Hay Error ❌
```
❌ Error Supabase: {
  code: "...",
  message: "...",
  details: "...",
  hint: "..."
}
```

**O:**
```
❌ Failed to load resource: net::ERR_NAME_NOT_RESOLVED
```

## 📋 Checklist Completo

### Estilos Formularios
- [ ] Labels están en NEGRITA
- [ ] Labels están al lado IZQUIERDO
- [ ] Campos están alineados verticalmente
- [ ] Hay separación clara entre campos
- [ ] Color de bordes es gris (#e5e7eb)
- [ ] Color de fondo es claro (#f9fafb)

### Botones CRUD
- [ ] Botón "➕ Nuevo Paciente" es verde
- [ ] Botón "✏️ Editar" es azul
- [ ] Botón "✅ Activo/🚫 Inactivo" cambia de color
- [ ] Los botones tienen efecto hover (sombra + elevación)
- [ ] Los botones tienen bordes redondeados (8px)

### Funcionalidad
- [ ] Puedo hacer clic en "Nuevo"
- [ ] Se abre el modal correctamente
- [ ] Puedo llenar los campos sin problemas
- [ ] Puedo registrar un paciente (si Supabase funciona)
- [ ] Aparece mensaje de éxito
- [ ] Puedo ver el paciente en la lista

### Supabase
- [ ] Proyecto está ACTIVO (no pausado)
- [ ] Tengo conexión a Internet
- [ ] Las tablas existen en Supabase
- [ ] Las políticas RLS permiten INSERT/UPDATE

## 🆘 Si Algo No Funciona

### Problema 1: Labels No Están en Negrita
**Solución:**
1. Abre DevTools (F12)
2. Inspecciona un label
3. Verifica CSS: `font-weight: 700 !important;`
4. Si no lo tiene, hay un conflicto de CSS
5. Reporta en consola

### Problema 2: Botones No Tienen Iconos
**Solución:**
1. Recarga la página (Ctrl+F5)
2. Vacía el caché: DevTools → Application → Clear Storage
3. Recarga de nuevo

### Problema 3: No Se Registra Paciente
**Solución:**
1. Abre la consola (F12)
2. Mira el error exacto
3. Consulta [SUPABASE_ERROR_FIX.md](./SUPABASE_ERROR_FIX.md)
4. Verifica conexión a Internet

### Problema 4: Modal No Se Abre
**Solución:**
1. Abre consola (F12)
2. Busca errores JavaScript en rojo
3. Copia el error completo
4. Reporta al equipo

## 📚 Archivos de Referencia

| Archivo | Contenido |
|---------|-----------|
| [GUIA_ESTILOS.md](./GUIA_ESTILOS.md) | Guía visual de estilos CRUD |
| [SUPABASE_ERROR_FIX.md](./SUPABASE_ERROR_FIX.md) | Solución de errores de conexión |
| [GUIA_DEBUG.md](./GUIA_DEBUG.md) | Debugging general |
| [PROYECTO.md](./PROYECTO.md) | Documentación del proyecto |

## 🔗 Accesos Rápidos

**Admin Dashboard:**
```
http://localhost:5173/admin
```

**Datos de Prueba:**
```
Email: admin@test.com
Contraseña: password123
```

**Supabase Dashboard:**
```
https://app.supabase.com
```

## 💡 Tips

1. **Limpiar Caché Completamente:**
   - DevTools → Application → Storage → Clear All
   - Recarga: Ctrl+F5 (o Cmd+Shift+R en Mac)

2. **Ver Peticiones a Supabase:**
   - DevTools → Network
   - Busca URLs que contengan "supabase"
   - Haz clic en ellas para ver detalles

3. **Guardar Logs:**
   - DevTools → Console
   - Clic derecho → Save as
   - Guarda los logs para reportar

## 🎯 Próximas Mejoras

- [ ] Validaciones de campos (email, teléfono)
- [ ] Toast notifications (en lugar de alert)
- [ ] Paginación en listas largas
- [ ] Búsqueda global mejorada
- [ ] Exportar a PDF/Excel
- [ ] Iconos para todos los CRUD

---

**Última actualización:** 2025-01-20  
**Versión:** 1.0  
**Estado:** Listo para Testing
