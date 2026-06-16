# 🎨 Guía de Estilos - Formularios y Botones CRUD

## ✨ Mejoras Realizadas

### 1. **Labels en NEGRITA** ✅
Todos los labels (etiquetas) en formularios ahora aparecen **siempre en negrita**:

```
[Nombre *]   [_________________]
[Apellido *] [_________________]
[Cédula]     [_________________]
```

**Características:**
- Font-weight: 700 (!important para asegurar negrita siempre)
- Color: Negro (#000)
- Ubicación: Al lado izquierdo del campo
- Alineación: Vertical centrada con el campo

### 2. **Botones CRUD con Iconos** ✅

#### Botón Agregar/Nuevo
```
➕ Nuevo Paciente
```
- **Color:** Verde (#10b981)
- **Gradiente:** Azul oscuro
- **Hover:** Sombra y efecto lift
- **Ubicación:** Header de cada sección

#### Botones en Lista
```
✏️ Editar  |  🚫 Inactivo / ✅ Activo
```

**Editar:**
- Color: Azul (#3b82f6)
- Icono: ✏️
- Función: Abre modal de edición

**Estado:**
- Activo: Verde con ✅
- Inactivo: Rojo con 🚫
- Función: Activa/desactiva paciente

### 3. **Estilos de Botones CRUD**

#### Clase: `.btn-crud`
```css
.btn-crud {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}
```

#### Variantes
| Clase | Color | Uso |
|-------|-------|-----|
| `.agregar` | Verde | Crear nuevo |
| `.editar` | Azul | Modificar |
| `.eliminar` | Rojo | Borrar |
| `.ver` | Morado | Consultar |
| `.cancelar` | Amarillo | Cancelar |

#### Tamaños
```css
.btn-crud         /* Tamaño normal */
.btn-crud.small   /* Tamaño pequeño para tablas */
```

#### Ejemplo HTML
```html
<!-- Botón Nuevo -->
<button class="btn-crud agregar" onclick="abrirRegistrar()">
    ➕ Nuevo Paciente
</button>

<!-- Botones en Tabla -->
<button class="btn-cell editar" onclick="editar(id)">
    ✏️ Editar
</button>

<button class="btn-cell eliminar" onclick="eliminar(id)">
    🗑️ Eliminar
</button>
```

### 4. **Colores por Función**

```
Verde (#10b981)    → Agregar/Crear/Éxito
Azul (#3b82f6)     → Editar/Información
Rojo (#ef4444)     → Eliminar/Peligro
Morado (#8b5cf6)   → Ver/Consultar
Amarillo (#f59e0b) → Advertencia/Cancelar
```

### 5. **Efectos Visuales**

#### Hover (Al pasar mouse)
- ✨ Sombra suave
- 📈 Pequeño efecto lift (translateY -2px)
- 🎨 Color más oscuro

#### Focus (Al hacer clic)
- 🟦 Borde morado (#7c3aed)
- ✨ Fondo blanco
- 🔍 Visible para accesibilidad

#### Disabled (Deshabilitado)
- 👁️ Opacidad: 50%
- 🚫 Cursor: not-allowed
- ⏱️ Sin efectos hover

## 📐 Estructura de Formularios

### Layout Horizontal
```
Cada campo ocupa una fila completa:

┌─────────────────────────────────┐
│ [Label] ▔▔▔▔▔[Input]▔▔▔▔▔      │
├─────────────────────────────────┤
│ [Label] ▔▔▔▔▔[Input]▔▔▔▔▔      │
├─────────────────────────────────┤
│ [Label] ▔▔▔▔▔[Select]▔▔▔▔▔     │
├─────────────────────────────────┤
│ [Label] ▔▔▔▔▔[Textarea]▔▔▔▔▔   │
└─────────────────────────────────┘
```

### CSS Grid
```css
.gp-campo {
    display: flex;
    flex-direction: row;        /* Horizontal */
    align-items: flex-start;    /* Alineación superior */
    gap: 0.85rem;              /* Espacio label-input */
}

.gp-campo label {
    min-width: 120px;          /* Ancho mínimo para alineación */
    font-weight: 700;          /* NEGRITA */
    white-space: nowrap;       /* No envolver */
}

.gp-campo input, textarea, select {
    flex: 1;                   /* Ocupa espacio restante */
}
```

## 🎯 Implementación en Componentes

### Gestionpacientes.jsx
```jsx
// Botón Nuevo
<button className="btn-crud agregar" onClick={abrirRegistrar}>
    ➕ Nuevo Paciente
</button>

// Botones en Lista
<div className="btn-group-crud">
    <button className="btn-cell editar" onClick={() => abrirEditar(p)}>
        ✏️ Editar
    </button>
    <button className="btn-cell" onClick={() => toggleActivo(p)}>
        {p.activo ? '🚫 Inactivo' : '✅ Activo'}
    </button>
</div>
```

### Formularios (PacienteModal)
```jsx
<div className="gp-campo">
    <label>Nombre *</label>
    <input type="text" placeholder="Nombre del paciente" />
</div>

<div className="gp-campo">
    <label>Apellido *</label>
    <input type="text" placeholder="Apellido del paciente" />
</div>

<div className="gp-campo">
    <label>Sexo</label>
    <select>
        <option>Seleccionar</option>
        <option>Masculino</option>
        <option>Femenino</option>
    </select>
</div>
```

## 📱 Responsive Design

### Desktop (> 768px)
- Labels: Ancho mínimo 120px
- Botones: Tamaño normal
- Grid: Auto-fit con 250px mínimo

### Tablet (480px - 768px)
- Labels: Ancho mínimo 100px
- Botones: Tamaño pequeño
- Grid: 2 columnas

### Mobile (< 480px)
- Labels: Ancho 80px
- Botones: Full-width o stacked
- Grid: 1 columna

## 🔧 Cómo Usar en Nuevos Componentes

### 1. Botón Agregar
```jsx
<button className="btn-crud agregar">➕ Agregar</button>
```

### 2. Botón Editar
```jsx
<button className="btn-crud editar" onClick={() => editar(id)}>
    ✏️ Editar
</button>
```

### 3. Botón Eliminar
```jsx
<button className="btn-crud eliminar" onClick={() => eliminar(id)}>
    🗑️ Eliminar
</button>
```

### 4. Campo de Formulario
```jsx
<div className="gp-campo">
    <label>Tu Label Aquí *</label>
    <input type="text" placeholder="Placeholder" />
</div>
```

## 📋 Componentes Actualizados

- ✅ Gestionpacientes.jsx: Botones con iconos
- ✅ App.css: Nuevos estilos para CRUD y formularios
- ✅ PacienteModal.jsx: Layout horizontal de campos
- ⏳ Otros componentes: Próximas actualizaciones

## 🎨 Ejemplos Visuales

```
┌────────────────────────────────────────────┐
│  ← Gestionar Pacientes     ➕ Nuevo Paciente │
│  5 pacientes registrados                    │
├────────────────────────────────────────────┤
│ Buscar...                                   │
├────────────────────────────────────────────┤
│ # │ Nombre        │ Cédula      │ Acciones  │
├────────────────────────────────────────────┤
│ 1 │ Juan Pérez    │ 001-123456  │ ✏️ ✅    │
│ 2 │ María García  │ 002-123456  │ ✏️ 🚫    │
│ 3 │ Carlos López  │ 003-123456  │ ✏️ ✅    │
└────────────────────────────────────────────┘
```

## ✨ Características Especiales

### Tooltips
```jsx
<button title="Editar paciente">✏️ Editar</button>
<button title="Inactivar paciente">🚫 Inactivo</button>
```

### Estados
- **Hover:** Sombra + elevación
- **Active:** Color más oscuro
- **Disabled:** 50% opacidad
- **Focus:** Borde morado

### Animaciones
```css
transition: all 0.2s ease;
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(...);
```

---

**Última actualización:** 2025-01-20  
**Versión:** 1.0  
**Estado:** Completo
