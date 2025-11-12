import { useEffect, useState } from 'react'
import './ResultsScreen.css'

interface ResultsScreenProps {
  score: number
  total: number
  tiempo: number
  scoreSaved: boolean
  onRestart: () => void
  onBackToMenu: () => void
}

export default function ResultsScreen({
  score,
  total,
  tiempo,
  scoreSaved,
  onRestart,
  onBackToMenu,
}: ResultsScreenProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [showDetails, setShowDetails] = useState(false)
  const percentage = Math.round((score / total) * 100)
  const incorrectas = total - score

  useEffect(() => {
    // Animación del score
    const duration = 1500
    const steps = 60
    const increment = score / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(score, increment * step)
      setAnimatedScore(Math.floor(current))
      if (step >= steps) {
        clearInterval(timer)
        setAnimatedScore(score)
        setTimeout(() => setShowDetails(true), 300)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPerformanceMessage = () => {
    if (percentage === 100) return { emoji: '🏆', text: '¡PERFECTO!', color: '#fbbf24' }
    if (percentage >= 80) return { emoji: '⭐', text: '¡EXCELENTE!', color: '#86efac' }
    if (percentage >= 60) return { emoji: '👍', text: '¡MUY BIEN!', color: '#a8c4d8' }
    if (percentage >= 40) return { emoji: '💪', text: '¡SIGUE ASÍ!', color: '#fca5a5' }
    return { emoji: '📚', text: '¡SIGUE PRACTICANDO!', color: '#94a3b8' }
  }

  const performance = getPerformanceMessage()

  return (
    <div className="results-screen">
      <div className="results-card">
        <div className="results-header">
          <div className={`performance-badge ${percentage === 100 ? 'perfect' : ''}`}>
            <span className="performance-emoji">{performance.emoji}</span>
            <h2 style={{ color: performance.color }}>{performance.text}</h2>
          </div>
        </div>

        <div className="results-main">
          <div className="score-display">
            <div className="score-circle">
              <svg className="score-ring" viewBox="0 0 120 120">
                <circle
                  className="score-ring-bg"
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="rgba(99, 132, 165, 0.2)"
                  strokeWidth="8"
                />
                <circle
                  className="score-ring-progress"
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={performance.color}
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - percentage / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="score-text">
                <span className="score-number">{animatedScore}</span>
                <span className="score-total">/ {total}</span>
              </div>
            </div>
            <div className="percentage-display">{percentage}%</div>
          </div>

          {showDetails && (
            <div className="results-details">
              <div className="detail-item correct">
                <span className="detail-icon">✅</span>
                <div className="detail-content">
                  <span className="detail-label">Correctas</span>
                  <span className="detail-value">{score}</span>
                </div>
              </div>

              <div className="detail-item incorrect">
                <span className="detail-icon">❌</span>
                <div className="detail-content">
                  <span className="detail-label">Incorrectas</span>
                  <span className="detail-value">{incorrectas}</span>
                </div>
              </div>

              <div className="detail-item time">
                <span className="detail-icon">⏱️</span>
                <div className="detail-content">
                  <span className="detail-label">Tiempo</span>
                  <span className="detail-value">{formatTime(tiempo)}</span>
                </div>
              </div>
            </div>
          )}

          {scoreSaved && showDetails && (
            <div className="score-saved-badge">
              <span>💾</span>
              <span>Puntuación guardada</span>
            </div>
          )}
        </div>

        <div className="results-actions">
          <button type="button" onClick={onRestart} className="action-button primary">
            🔄 Reiniciar
          </button>
          <button type="button" onClick={onBackToMenu} className="action-button secondary">
            🏠 Volver al Menú
          </button>
        </div>
      </div>
    </div>
  )
}

