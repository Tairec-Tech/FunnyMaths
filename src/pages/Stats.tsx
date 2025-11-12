import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { validateToken, getUserScores, getCurrentUser } from '../services/api'
import type { StatsPorTipo, Logro } from '../services/api'
import ProgressChart from '../components/ProgressChart'
import './Stats.css'

export default function Stats() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [statsPorTipo, setStatsPorTipo] = useState<StatsPorTipo[]>([])
  const [logros, setLogros] = useState<Logro[]>([])
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null)
  const user = getCurrentUser()

  useEffect(() => {
    const loadData = async () => {
      const validUser = await validateToken()
      if (!validUser) {
        navigate('/')
        return
      }

      try {
        const data = await getUserScores(100)
        setStats(data.stats)
        setStatsPorTipo(data.stats_por_tipo)
        setLogros(data.logros)
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [navigate])

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
      <div className="stats-container">
        <div className="stats-card">
          <div className="loading">⏳ Cargando estadísticas...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="stats-container">
      <div className="stats-card">
        <div className="stats-header">
          <button
            type="button"
            onClick={() => navigate('/menu')}
            className="back-button-stats"
          >
            ← Volver al Menú
          </button>
          <h1>📊 Mis Estadísticas</h1>
          <p>Hola, {user?.username}! Aquí está tu progreso</p>
        </div>

        {stats && (
          <div className="stats-overview">
            <div className="stat-box">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <div className="stat-value">{stats.total_intentos || 0}</div>
                <div className="stat-label">Intentos Totales</div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-value">{stats.total_correctas || 0}</div>
                <div className="stat-label">Respuestas Correctas</div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon">⏱️</div>
              <div className="stat-content">
                <div className="stat-value">
                  {formatTime(Math.round(stats.tiempo_promedio || 0))}
                </div>
                <div className="stat-label">Tiempo Promedio</div>
              </div>
            </div>

            <div className="stat-box">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <div className="stat-value">{stats.mejor_puntuacion || 0}</div>
                <div className="stat-label">Mejor Puntuación</div>
              </div>
            </div>
          </div>
        )}

        {statsPorTipo.length > 0 && (
          <div className="stats-by-type">
            <h2>📈 Por Tipo de Operación</h2>
            <div className="type-stats-grid">
              {statsPorTipo.map((stat) => (
                <div
                  key={stat.tipo_operacion}
                  className="type-stat-card"
                  onClick={() =>
                    setSelectedTipo(
                      selectedTipo === stat.tipo_operacion
                        ? null
                        : stat.tipo_operacion,
                    )
                  }
                >
                  <div className="type-stat-header">
                    <span className="type-icon">
                      {getTipoIcono(stat.tipo_operacion)}
                    </span>
                    <h3>{getTipoNombre(stat.tipo_operacion)}</h3>
                  </div>
                  <div className="type-stat-details">
                    <div className="type-stat-item">
                      <span>Intentos:</span>
                      <strong>{stat.intentos}</strong>
                    </div>
                    <div className="type-stat-item">
                      <span>Correctas:</span>
                      <strong>{stat.total_correctas}</strong>
                    </div>
                    <div className="type-stat-item">
                      <span>Mejor:</span>
                      <strong>{stat.mejor_puntuacion}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="progress-charts-section">
              <ProgressChart
                title="Progreso por Operación"
                data={statsPorTipo.map((stat) => ({
                  label: getTipoNombre(stat.tipo_operacion),
                  value: stat.total_correctas,
                  max: stat.intentos * 30, // Estimación: 30 problemas por intento
                }))}
              />
            </div>
          </div>
        )}

        {logros.length > 0 && (
          <div className="achievements-section">
            <h2>🏅 Mis Logros ({logros.length})</h2>
            <div className="achievements-grid">
              {logros.map((logro, index) => (
                <div key={index} className="achievement-badge">
                  <div className="achievement-icon">⭐</div>
                  <div className="achievement-text">
                    <strong>{logro.descripcion}</strong>
                    <span className="achievement-date">
                      {new Date(logro.fecha).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {logros.length === 0 && (
          <div className="no-achievements">
            <p>🎯 ¡Sigue practicando para ganar logros!</p>
          </div>
        )}
      </div>
    </div>
  )
}

