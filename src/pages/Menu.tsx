import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { validateToken, logout as apiLogout } from '../services/api'
import './Menu.css'

export default function Menu() {
  const navigate = useNavigate()

  useEffect(() => {
    // Verificar token
    const checkAuth = async () => {
      const user = await validateToken()
      if (!user) {
        navigate('/')
      }
    }
    checkAuth()
  }, [navigate])

  const handleLogout = () => {
    apiLogout()
    navigate('/')
  }

  return (
    <div className="menu-container">
      <div className="menu-card">
        <div className="menu-header">
          <div className="menu-icon">🎮</div>
          <h1>¡Elige tu Aventura Matemática!</h1>
          <p>Selecciona qué quieres practicar hoy</p>
        </div>

        <div className="menu-options">
          <button
            type="button"
            className="menu-option suma"
            onClick={() => navigate('/quiz/sumas')}
          >
            <div className="option-icon">➕</div>
            <div className="option-content">
              <h2>Sumas</h2>
              <p>Practica sumando números de tres cifras</p>
            </div>
            <div className="option-arrow">→</div>
          </button>

          <button
            type="button"
            className="menu-option resta"
            onClick={() => navigate('/quiz/restas')}
          >
            <div className="option-icon">➖</div>
            <div className="option-content">
              <h2>Restas</h2>
              <p>Practica restando números de tres cifras</p>
            </div>
            <div className="option-arrow">→</div>
          </button>
        </div>

        <div className="menu-secondary-options">
          <button
            type="button"
            className="menu-secondary-button"
            onClick={() => navigate('/stats')}
          >
            📊 Mis Estadísticas
          </button>
          <button
            type="button"
            className="menu-secondary-button"
            onClick={() => navigate('/ranking')}
          >
            🏆 Ranking Global
          </button>
        </div>

        <div className="menu-footer">
          <button
            type="button"
            onClick={handleLogout}
            className="logout-menu-button"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}

