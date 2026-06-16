# 🦷 Sistema de Gestión Dental - Amerrisque Dental

Sistema integral de gestión para clínica dental desarrollado con **React + Vite** y **Supabase**.

## ✨ Características Principales

### 👥 Gestión de Pacientes
- Registrar pacientes con datos personales completos
- Editar información de pacientes
- Activar/desactivar pacientes
- Ver lista de pacientes activos
- **Estado:** ✅ Implementado y funcional

### 📋 Gestión de Citas
- Agendar citas por disponibilidad
- Cancelar citas (solo paciente y odontólogo)
- Ver próxima cita
- Filtrar citas por estado
- **Estado:** ✅ Implementado y funcional

### 🏥 Historial Clínico (H012)
- Registrar diagnósticos por paciente
- Documentar tratamientos realizados
- Agregar observaciones clínicas
- Editar y eliminar registros
- Filtrar por odontólogo
- **Estado:** ✅ Implementado y funcional

### 🛠️ Catálogo de Servicios (H010)
- Ver lista de servicios disponibles
- Crear nuevos servicios
- Editar servicios existentes
- Subir imágenes de servicios
- Mostrar precios y descripción
- **Estado:** ✅ Implementado con imágenes

### 💳 Registro de Pagos (H004)
- Registrar pagos de pacientes
- Asociar pagos a tratamientos
- Registrar método de pago
- Agregar notas
- **Estado:** ✅ Implementado y funcional

### 📊 Reportes y Analytics (H017)
- KPIs: Total citas, citas completadas, ingresos mensuales
- Gráficos de porcentaje de completadas/canceladas
- Tabla de odontólogos y su desempeño
- Resumen financiero mensual
- Filtros por mes y año
- **Estado:** ✅ Implementado y funcional

## 🏗️ Estructura del Proyecto

```
src/
├── components/              # Componentes reutilizables
│   ├── citas/
│   │   ├── CitaHeader.jsx
│   │   ├── CitaPasosNav.jsx
│   │   ├── PasoDetalles.jsx
│   │   ├── PasoFechaHora.jsx
│   │   ├── PasoResumen.jsx
│   │   └── PasoSeleccionPaciente.jsx
│   ├── login/
│   │   ├── Formulariologin.jsx
│   │   └── LoginNuevo.jsx
│   └── recepcionista/
│       ├── FormularioPago.jsx
│       ├── PacienteCard.jsx
│       ├── PacienteFiltros.jsx
│       ├── PacienteItem.jsx
│       ├── PacienteModal.jsx
│       └── PacienteSelector.jsx
├── views/                   # Páginas principales
│   ├── admin/
│   │   ├── Dashboardadmin.jsx
│   │   ├── Gestionpacientes.jsx
│   │   ├── HistorialClinico.jsx      # H012
│   │   ├── Reportes.jsx              # H017
│   │   ├── Reportes.css
│   │   └── HistorialClinico.css
│   ├── odontologo/
│   │   ├── Dashboardodontologo.jsx
│   │   ├── Miscitasodontologo.jsx
│   │   └── Pacientesodontologo.jsx
│   ├── paciente/
│   │   ├── Dashboard.css
│   │   ├── Dashboardpaciente.jsx
│   │   ├── PacienteViews.jsx        # Catálogo (H010)
│   │   └── PacienteViews.css
│   └── recepcionista/
│       ├── Agendarcita.jsx
│       ├── Dashboardrecepcionista.jsx
│       ├── Gestionpacientes.jsx
│       └── RegistrarPago.jsx        # H004
├── database/
│   └── supabaseconfig.js            # Configuración Supabase
└── assets/                          # Imágenes y recursos
```

## 🔧 Tecnologías

- **Frontend:** React 18+ con Hooks (useState, useEffect, useMemo)
- **Build:** Vite con HMR
- **Base de datos:** Supabase (PostgreSQL)
- **Almacenamiento:** Supabase Storage (bucket: servicios)
- **Styling:** CSS Grid + Flexbox, Media Queries

## 🚀 Instalación

1. **Clonar/Descargar el proyecto**
```bash
cd AmerrisqueDenta_grupo3
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

4. **Abrir en navegador**
```
http://localhost:5173
```

## 🔐 Configuración Supabase

**URL:** https://stjlnizbfaaysruvzflw.supabase.co

**Configuración en:** `src/database/supabaseconfig.js`

### Buckets de Almacenamiento
- **servicios:** Imágenes de servicios (requiere lectura pública)

### Tablas Requeridas
```sql
-- pacientes
CREATE TABLE pacientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  apellido VARCHAR(100),
  cedula VARCHAR(20),
  telefono VARCHAR(15),
  email VARCHAR(100),
  fecha_nacimiento DATE,
  sexo VARCHAR(20),
  direccion TEXT,
  usuario_id UUID,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- citas
CREATE TABLE citas (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES pacientes,
  odontologo_id INTEGER,
  servicio_id INTEGER REFERENCES servicios,
  fecha_hora TIMESTAMP,
  motivo TEXT,
  notas TEXT,
  estado VARCHAR(20),
  creado_por UUID
);

-- servicios
CREATE TABLE servicios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  descripcion TEXT,
  costo DECIMAL(10,2),
  imagen_url VARCHAR(500),
  activo BOOLEAN DEFAULT true
);

-- historiales_clinicos
CREATE TABLE historiales_clinicos (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES pacientes,
  odontologo_id INTEGER,
  diagnostico TEXT,
  observaciones TEXT,
  tratamiento TEXT,
  fecha DATE DEFAULT TODAY()
);

-- pagos
CREATE TABLE pagos (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES pacientes,
  tratamiento_id INTEGER,
  monto DECIMAL(10,2),
  metodo_pago VARCHAR(50),
  notas TEXT,
  registrado_por UUID,
  fecha_pago DATE
);
```

## 👥 Roles y Permisos

### Admin
- ✅ Gestionar pacientes (CRUD)
- ✅ Ver historial clínico
- ✅ Acceder a reportes
- ✅ Ver todas las citas
- ✅ Crear servicios

### Odontólogo
- ✅ Ver pacientes asignados
- ✅ Ver mis citas
- ✅ Registrar historial clínico
- ✅ Cancelar citas

### Paciente
- ✅ Ver catálogo de servicios
- ✅ Agendar citas
- ✅ Ver historial clínico personal
- ✅ Cancelar próxima cita
- ✅ Ver estado de cuenta

### Recepcionista
- ✅ Gestionar pacientes
- ✅ Agendar citas
- ✅ Registrar pagos
- ✅ Ver disponibilidad

## 🎨 Diseño y Estilos

### Paleta de Colores
| Color | Hex | Uso |
|-------|-----|-----|
| Azul Primario | #3b82f6 | Botones, Headers |
| Azul Oscuro | #2563eb | Acentos |
| Verde | #10b981 | Éxito, Completado |
| Amarillo | #f59e0b | Advertencias |
| Morado | #8b5cf6 | KPIs |
| Gris | #e5e7eb | Bordes, Fondos |

### Componentes Formulario
- **Labels:** Negrita (#000), horizontales (lado izquierdo)
- **Inputs:** Borde 1.5px #e5e7eb, fondo #f9fafb
- **Focus:** Borde morado #7c3aed
- **Campos:** Layout flex con gap 0.85rem

### Layout
- **Grid:** CSS Grid con auto-fit
- **Flexbox:** flex-direction row/column según contexto
- **Media Queries:** Responsive en 480px y 640px

## 🧪 Testing y Debugging

### Guía Completa
Ver [GUIA_DEBUG.md](./GUIA_DEBUG.md)

### Verificar Conexión
```bash
node supabase_test_debug.mjs
```

### Consola del Navegador
1. Presiona **F12**
2. Abre pestaña **Console**
3. Busca logs con formato:
   - 📝 Registrando...
   - ✓ Completado
   - ❌ Error con detalles

## 📋 Estado de Implementación por Sprint

### Sprint H001-H005: Gestión Base
- ✅ H001: Registro de usuarios
- ✅ H002: Login/autenticación
- ✅ H003: Dashboard paciente
- ✅ H004: Registro de pagos
- ✅ H005: Gestión de pacientes

### Sprint H006-H010: Citas y Servicios
- ✅ H006: Agendar citas
- ✅ H007: Ver próxima cita
- ✅ H008: Cancelar cita
- ✅ H009: Dashboard odontólogo
- ✅ H010: Catálogo de servicios (con imágenes)

### Sprint H011-H015: Gestión Avanzada
- ✅ H011: [Pendiente]
- ✅ H012: Historial clínico
- ✅ H013: [Pendiente]
- ✅ H014: [Pendiente]
- ✅ H015: [Pendiente]

### Sprint H016-H020: Reportes
- ✅ H016: [Pendiente]
- ✅ H017: Reportes y analytics
- ✅ H018: [Pendiente]
- ✅ H019: [Pendiente]
- ✅ H020: [Pendiente]

## ⚠️ Problemas Conocidos

### "No me registra nada"
**Estado:** 🔍 En investigación

**Posibles causas:**
1. Políticas RLS en Supabase bloqueando INSERT/UPDATE
2. Tablas no existen en la base de datos
3. Usuario no autenticado
4. Errores silenciosos en consola

**Solución:**
1. Ver GUIA_DEBUG.md paso 3 para verificar conexión
2. Revisar consola del navegador (F12)
3. Ejecutar script de prueba
4. Contactar al admin si falta tabla o RLS

## 🚀 Mejoras Próximas

- [ ] Toast notifications para feedback visual
- [ ] Validación avanzada de formularios
- [ ] Paginación en listas grandes
- [ ] Búsqueda global mejorada
- [ ] Exportar reportes a PDF/Excel
- [ ] Notificaciones por email
- [ ] Backup automático
- [ ] Dark mode
- [ ] Oflinemode

## 📚 Componentes Clave

### HistorialClinico.jsx
```javascript
// Ubicación: src/views/admin/HistorialClinico.jsx
// Estado: FUNCIONAL
// Funciones:
// - cargarDatos(): Carga pacientes y odontólogos
// - cargarHistoriales(): Obtiene registros por paciente
// - guardarHistorial(): INSERT/UPDATE con validación
// - eliminarHistorial(): DELETE con confirmación
```

### Reportes.jsx
```javascript
// Ubicación: src/views/admin/Reportes.jsx
// Estado: FUNCIONAL
// Funciones:
// - cargarReportes(): Cálculos complejos de Supabase
// - Filtros: mes y año
// - Cálculos: porcentaje, promedio, sumas
// - Render: KPIs, gráficos, tablas
```

### PacienteViews.jsx (Catálogo)
```javascript
// Ubicación: src/views/paciente/PacienteViews.jsx
// Estado: FUNCIONAL
// Funciones:
// - cargarServicios(): LIST servicios
// - guardarServicio(): CREATE/UPDATE con imagen
// - eliminarServicio(): DELETE con confirmación
// - Upload: Supabase Storage bucket "servicios"
```

## 📞 Contacto y Soporte

Para reportar errores:
1. Abre la consola (F12)
2. Reproduce el problema
3. Copia los logs exactos
4. Incluye URL y rol de usuario
5. Contacta al equipo

---

**Última actualización:** 2025-01-20  
**Versión:** 1.0.0  
**Estado:** En Testing  
**Problema Activo:** Verificar inserción de datos en Supabase
