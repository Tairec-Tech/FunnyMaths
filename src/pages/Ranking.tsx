import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { validateToken, getGlobalScores } from '../services/api'
import type { Score } from '../services/api'
import './Ranking.css'

export default function Ranking() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [scores, setScores] = useState<Score[]>([])
  const [topUsers, setTopUsers] = useState<any[]>([])
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      const validUser = await validateToken()
      if (!validUser) {
        navigate('/')
        return
      }

      try {
        const data = await getGlobalScores(50, selectedTipo || undefined)
        setScores(data.scores)
        setTopUsers(data.top_users)
      } catch (error) {
        console.error('Error al cargar ranking:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [navigate, selectedTipo])

  const formatTime = (seconds: number) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTipoNombre = (tipo: string) => {
    const nombres: Record<string, string> = {
      suma: 'Sumas',
      resta: 'Restas',
    }
    return nombres[tipo] || tipo
  }

  const getTipoIcono = (tipo: string) => {
    const iconos: Record<string, string> = {
      suma: '➕',
      resta: '➖',
    }
    return iconos[tipo] || '📊'
  }

  if (loading) {
    return (
      <div className="ranking-container">
        <div className="ranking-card">
          <div className="loading">⏳ Cargando ranking...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="ranking-container">
      <div className="ranking-card">
        <div className="ranking-header">
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="back-button-ranking"
          >
            ← Volver al Menú
          </button>
          <h1>🏆 Ranking Global</h1>
          <p>Los mejores jugadores de SumQuiz</p>
        </div>

        <div className="filter-buttons">
          <button
            type="button"
            className={`filter-btn ${selectedTipo === null ? 'active' : ''}`}
            onClick={() => setSelectedTipo(null)}
          >
            Todas
          </button>
          <button
            type="button"
            className={`filter-btn ${selectedTipo === 'suma' ? 'active' : ''}`}
            onClick={() => setSelectedTipo('suma')}
          >
            ➕ Sumas
          </button>
          <button
            type="button"
            className={`filter-btn ${selectedTipo === 'resta' ? 'active' : ''}`}
            onClick={() => setSelectedTipo('resta')}
          >
            ➖ Restas
          </button>
        </div>

        {topUsers.length > 0 && (
          <div className="top-users-section">
            <h2>⭐ Top 10 Jugadores</h2>
            <div className="top-users-list">
              {topUsers.map((user, index) => (
                <div
                  key={index}
                  className={`top-user-card ${index < 3 ? 'podium' : ''}`}
                >
                  <div className="user-rank">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </div>
                  <div className="user-info">
                    <strong>{user.username}</strong>
                    <div className="user-stats-mini">
                      <span>✅ {user.mejor_correctas} correctas</span>
                      <span>⏱️ {formatTime(user.mejor_tiempo)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="recent-scores-section">
          <h2>📋 Intentos Recientes</h2>
          {scores.length > 0 ? (
            <div className="scores-table">
              <div className="table-header">
                <div>Usuario</div>
                <div>Tipo</div>
                <div>Correctas</div>
                <div>Tiempo</div>
                <div>Fecha</div>
              </div>
              {scores.map((score) => (
                <div key={score.id} className="table-row">
                  <div className="user-cell">{score.username}</div>
                  <div className="type-cell">
                    {score.tipo_operacion
                      ? getTipoIcono(score.tipo_operacion)
                      : '📊'}
                  </div>
                  <div className="score-cell">{score.correctas}/{score.total_realizadas}</div>
                  <div className="time-cell">{formatTime(score.tiempo_segundos)}</div>
                  <div className="date-cell">
                    {new Date(score.fecha).toLocaleDateString('es-ES')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-scores">
              <p>No hay puntuaciones aún. ¡Sé el primero en aparecer aquí! 🎯</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

