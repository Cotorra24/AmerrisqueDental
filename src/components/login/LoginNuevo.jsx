import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../database/supabaseconfig'
import '../login/Formulariologin.css'

// Usuarios de demostración
const USUARIOS_DEMO = {
    'admin@amerrisque.com': { password: 'Admin1234', rol_id: 1, nombre: 'Administrador' },
    'recepcion@amerrisque.com': { password: 'Recep1234', rol_id: 3, nombre: 'Recepcionista' },
    'doctor@amerrisque.com': { password: 'Doctor1234', rol_id: 2, nombre: 'Odontólogo' },
    'paciente@amerrisque.com': { password: 'Paciente1234', rol_id: 4, nombre: 'Paciente' },
}

export default function LoginNuevo() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [mostrarPassword, setMostrarPassword] = useState(false)
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState('')

    const validarEmail = (mail) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        
        const trimmedEmail = email.trim()
        const trimmedPassword = password.trim()

        if (!trimmedEmail) {
            setError('Por favor, ingresa tu correo electrónico')
            return
        }
        if (!validarEmail(trimmedEmail)) {
            setError('El formato del correo electrónico no es válido')
            return
        }
        if (!trimmedPassword) {
            setError('Por favor, ingresa tu contraseña')
            return
        }

        setCargando(true)
        setError('')

        try {
            // Intentar con Supabase primero
            let userId = null
            let usuario = null

            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: trimmedEmail,
                password: trimmedPassword,
            }).catch((e) => ({ data: null, error: { message: e?.message || 'Supabase no disponible' } }))

            if (authError && /supabase|fetch|could not resolve|name not resolved/i.test(authError.message || '')) {
                // Mostrar aviso claro pero permitir modo demo
                setError('No se pudo conectar con Supabase. Se intentará ingresar en modo demo.');
            }

            if (!authError && data) {
                userId = data.user?.id || data.session?.user?.id
                if (userId) {
                    const { data: userData } = await supabase
                        .from('usuarios')
                        .select('rol_id, nombre')
                        .eq('id', userId)
                        .single()
                    usuario = userData
                }
            }

            // Si Supabase falla o el usuario no existe, usar demo
            if (!usuario) {
                const demoUser = USUARIOS_DEMO[trimmedEmail]
                if (demoUser && demoUser.password === trimmedPassword) {
                    usuario = {
                        rol_id: demoUser.rol_id,
                        nombre: demoUser.nombre,
                        id: 'demo-' + Math.random().toString(36).substr(2, 9)
                    }
                    userId = usuario.id
                } else {
                    setError('Correo o contraseña incorrectos')
                    setCargando(false)
                    return
                }
            }

            // Guardar sesión
            localStorage.setItem('userSession', JSON.stringify({
                email: trimmedEmail,
                rol_id: usuario.rol_id,
                nombre: usuario.nombre,
                id: userId
            }))

            const rutas = {
                1: '/admin',
                2: '/odontologo',
                3: '/recepcionista',
                4: '/paciente',
            }

            navigate(rutas[usuario.rol_id] || '/', { replace: true })
        } catch (err) {
            console.error('Login error:', err)
            setError('Ocurrió un error en el inicio de sesión')
        } finally {
            setCargando(false)
        }
    }

    const usarCredenciales = (mail, pass) => {
        setEmail(mail)
        setPassword(pass)
    }

    return (
        <div className="login-wrapper">
            <div className="login-bg">
                <div className="login-bg-top" />
                <div className="login-bg-bottom" />
            </div>

            <div className="login-header">
                <div className="login-logo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
                        <circle cx="12" cy="9" r="2.5" />
                    </svg>
                </div>
                <h1 className="login-titulo">Amerrisque Dental</h1>
                <p className="login-subtitulo">Sistema de Gestión Clínica</p>
            </div>

            <div className="login-card">
                <h2 className="login-card-titulo">Iniciar sesión</h2>
                <p className="login-card-subtitulo">Accede a tu cuenta</p>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="login-campo">
                        <label className="login-label">Correo electrónico</label>
                        <div className="login-input-wrapper">
                            <span className="login-input-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="4" width="20" height="16" rx="2" />
                                    <path d="m22 7-10 7L2 7" />
                                </svg>
                            </span>
                            <input
                                type="email"
                                className="login-input"
                                placeholder="correo@amerrisque.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="login-campo">
                        <label className="login-label">Contraseña</label>
                        <div className="login-input-wrapper">
                            <span className="login-input-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </span>
                            <input
                                type={mostrarPassword ? 'text' : 'password'}
                                className="login-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="login-ojo"
                                onClick={() => setMostrarPassword(!mostrarPassword)}
                            >
                                {mostrarPassword ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div key="err-display" className="login-error">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="login-btn" disabled={cargando}>
                        {cargando ? (
                            <span key="spinner" className="login-spinner" />
                        ) : (
                            <span key="btn-text" style={{ display: 'contents' }}>
                                Iniciar sesión
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </span>
                        )}
                    </button>
                </form>

                <div className="login-divider">o acceso rápido</div>

                <div className="login-credenciales">
                    <p className="login-credenciales-titulo">Selecciona un usuario</p>
                    <div className="login-credenciales-grid">
                        <div 
                            className="login-cred-item" 
                            onClick={() => usarCredenciales('admin@amerrisque.com', 'Admin1234')}
                        >
                            <span className="login-cred-icon admin">⚙️</span>
                            <div>
                                <p className="login-cred-rol">Administrador</p>
                                <p className="login-cred-desc">Reportes</p>
                            </div>
                        </div>
                        <div 
                            className="login-cred-item" 
                            onClick={() => usarCredenciales('recepcion@amerrisque.com', 'Recep1234')}
                        >
                            <span className="login-cred-icon recep">📋</span>
                            <div>
                                <p className="login-cred-rol">Recepcionista</p>
                                <p className="login-cred-desc">Agenda y pagos</p>
                            </div>
                        </div>
                        <div 
                            className="login-cred-item" 
                            onClick={() => usarCredenciales('doctor@amerrisque.com', 'Doctor1234')}
                        >
                            <span className="login-cred-icon doctor">🦷</span>
                            <div>
                                <p className="login-cred-rol">Odontólogo</p>
                                <p className="login-cred-desc">Historial clínico</p>
                            </div>
                        </div>
                        <div 
                            className="login-cred-item" 
                            onClick={() => usarCredenciales('paciente@amerrisque.com', 'Paciente1234')}
                        >
                            <span className="login-cred-icon paciente">👤</span>
                            <div>
                                <p className="login-cred-rol">Paciente</p>
                                <p className="login-cred-desc">Mis citas</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
