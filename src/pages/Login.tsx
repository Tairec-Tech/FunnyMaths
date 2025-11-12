import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../services/api'
import './Auth.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!username.trim()) {
      setError('¡Necesitas escribir tu nombre de usuario!')
      setLoading(false)
      return
    }

    if (!password.trim()) {
      setError('¡No olvides tu contraseña!')
      setLoading(false)
      return
    }

    try {
      await login(username, password)
      navigate('/menu')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Usuario o contraseña incorrectos. ¡Inténtalo de nuevo!',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🔢</div>
          <h1>¡Bienvenido a SumQuiz!</h1>
          <p>Ingresa tus datos para empezar a jugar</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">
              <span className="label-icon">👤</span>
              Tu nombre de usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Escribe tu nombre aquí"
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <span className="label-icon">🔒</span>
              Tu contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Escribe tu contraseña"
              className="auth-input"
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button
            type="submit"
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? '⏳ Cargando...' : '🚀 Entrar y Jugar'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="auth-link">
              ¡Regístrate aquí!
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

