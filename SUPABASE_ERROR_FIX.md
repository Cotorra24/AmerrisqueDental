# 🔴 Solución: Error "net::ERR_NAME_NOT_RESOLVED" en Supabase

## ¿Qué significa este error?

```
net::ERR_NAME_NOT_RESOLVED
Failed to load resource: stjlnizbfaaysruvzflw.supabase.co
```

Este error significa que **tu navegador NO PUEDE CONECTARSE a Supabase**. Las causas más comunes son:

## 🔍 Causas Posibles

### 1. ❌ **No Tienes Conexión a Internet**
- Verifica que tu WiFi/conexión esté activa
- Intenta abrir Google o cualquier sitio web
- Si no funciona, reconecta tu red

### 2. ⏸️ **Tu Proyecto Supabase está Pausado/Inactivo**
- Los proyectos gratuitos se pausa después de 1 semana de inactividad
- Solución:
  1. Ve a https://app.supabase.com
  2. Inicia sesión
  3. Selecciona tu proyecto
  4. En Settings → General, busca "Project Status"
  5. Si dice "Paused", haz clic en "Resume"

### 3. 🚫 **El Proyecto fue Eliminado o Suspendido**
- Verifica que tu proyecto exista en Supabase
- Si no lo ves, el proyecto puede haber sido eliminado

### 4. 🌐 **Problema de DNS o Red**
- Intenta este comando en terminal:
  ```bash
  ping stjlnizbfaaysruvzflw.supabase.co
  ```
- Si falla, tu red no puede resolver el dominio

## ✅ Soluciones Paso a Paso

### Solución 1: Verificar Supabase
1. Abre https://app.supabase.com en tu navegador
2. ¿Puedes acceder? Si **SÍ**, el proyecto está disponible
3. Si **NO**, tienes problema de conexión a Internet

### Solución 2: Reanudar Proyecto
1. En Supabase, ve a **Settings** → **General**
2. Busca "Project Status"
3. Si dice "Paused", haz clic en "Resume"
4. Espera 2-3 minutos
5. Intenta login de nuevo

### Solución 3: Limpiar Caché
1. Abre DevTools (F12)
2. Haz clic derecho en el botón "Recargar" (arriba)
3. Selecciona "Vaciar caché y recargar"
4. Espera a que cargue completamente

### Solución 4: Probar en Incógnito
1. Abre una ventana incógnita (Ctrl+Shift+N o Cmd+Shift+N)
2. Intenta usar la aplicación de nuevo
3. Si funciona aquí, limpia el caché normal del navegador

## 🧪 Cómo Verificar la Conexión

### Desde el Navegador (Consola F12)
```javascript
// Copia y pega esto en la consola
fetch('https://stjlnizbfaaysruvzflw.supabase.co')
    .then(() => console.log('✅ Conexión OK'))
    .catch(e => console.log('❌ Error:', e.message))
```

### Desde Terminal
```bash
# Intenta conectar al servidor
curl https://stjlnizbfaaysruvzflw.supabase.co

# O usa ping
ping stjlnizbfaaysruvzflw.supabase.co
```

## 💾 Modo Offline (Temporal)

Mientras arreglas la conexión a Supabase, **puedes usar usuarios demo**:

```
Email: admin@test.com
Contraseña: password123

Email: paciente@test.com
Contraseña: password123
```

Estos usuarios funcionan **sin Supabase**.

## 📋 Checklist de Verificación

- [ ] Tengo conexión a Internet activa
- [ ] Puedo acceder a Google y otros sitios
- [ ] Puedo abrir https://app.supabase.com
- [ ] Mi proyecto en Supabase dice "Status: Active"
- [ ] He limpiado el caché del navegador
- [ ] He intentado en modo incógnito
- [ ] El comando `ping stjlnizbfaaysruvzflw.supabase.co` responde

## 🚨 Si Nada Funciona

Si después de estos pasos **aún no funciona**:

1. Contacta a tu proveedor de Internet
2. Prueba desde otra red (teléfono, trabajo, etc.)
3. Reporta el problema a Supabase: https://support.supabase.com

## 📝 Estado de Tu Proyecto Supabase

**URL:** https://stjlnizbfaaysruvzflw.supabase.co  
**Proyecto:** Amerrisque Dental

Para verificar el estado:
1. Ve a https://status.supabase.com
2. Busca tu región (probablemente USA o Latinoamérica)
3. ¿Dice "Operational"? Si no, hay un problema de Supabase

## 🔧 Configuración del Proyecto

El archivo `.env` contiene:
```
VITE_SUPABASE_URL=https://stjlnizbfaaysruvzflw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Estos valores son correctos. El problema es la **conectividad**, no la configuración.

---

**Última actualización:** 2025-01-20  
**Versión:** 1.0  
**Estado:** Guía de Troubleshooting
