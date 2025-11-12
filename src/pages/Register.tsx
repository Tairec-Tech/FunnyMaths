import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../services/api'
import './Auth.css'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!username.trim()) {
      setError('¡Necesitas elegir un nombre de usuario!')
      setLoading(false)
      return
    }

    if (username.trim().length < 3) {
      setError('Tu nombre debe tener al menos 3 letras')
      setLoading(false)
      return
    }

    if (!password.trim()) {
      setError('¡Crea una contraseña para proteger tu cuenta!')
      setLoading(false)
      return
    }

    if (password.length < 4) {
      setError('Tu contraseña debe tener al menos 4 caracteres')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('¡Las contraseñas no coinciden! Vuelve a intentarlo')
      setLoading(false)
      return
    }

    try {
      await register(username, password)
      setSuccess('¡Cuenta creada exitosamente! Redirigiendo...')
      setTimeout(() => {
        navigate('/menu')
      }, 1500)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al crear la cuenta. ¡Inténtalo de nuevo!',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">⭐</div>
          <h1>¡Crea tu cuenta!</h1>
          <p>Únete a la aventura de las sumas</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">
              <span className="label-icon">👤</span>
              Elige un nombre de usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ejemplo: SuperSumador"
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <span className="label-icon">🔒</span>
              Crea una contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 4 caracteres"
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <span className="label-icon">✅</span>
              Confirma tu contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Escribe la misma contraseña"
              className="auth-input"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <button
            type="submit"
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? '⏳ Creando cuenta...' : '🎉 Crear cuenta y empezar'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿Ya tienes cuenta?{' '}
            <Link to="/" className="auth-link">
              ¡Inicia sesión aquí!
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

