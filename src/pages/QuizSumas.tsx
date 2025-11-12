import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { validateToken, saveScore, logout as apiLogout } from '../services/api'
import ResultsScreen from '../components/ResultsScreen'
import { soundManager } from '../utils/sounds'
import '../App.css'

type TemplateId = 'clasico' | 'tarjetas' | 'relampago'

type Problem = {
  question: string
  options: string[]
  answer: number
}

const TOTAL_PAGES = 5
const PROBLEMS_PER_PAGE = 6
const TOTAL_PROBLEMS = TOTAL_PAGES * PROBLEMS_PER_PAGE

const letters = ['A', 'B', 'C', 'D', 'E']

const templates: Array<{
  id: TemplateId
  label: string
  description: string
}> = [
  {
    id: 'clasico',
    label: 'Modo Clásico',
    description: 'Lista vertical con retroalimentación inmediata.',
  },
  {
    id: 'tarjetas',
    label: 'Flashcards',
    description: 'Tarjetas grandes con animaciones suaves.',
  },
  {
    id: 'relampago',
    label: 'Reto Relámpago',
    description: 'Opciones circulares para elegir rápidamente.',
  },
]

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const shuffleArray = <T,>(values: T[]): T[] => {
  const array = [...values]
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

const generateProblem = (): Problem => {
  const a = randomInt(100, 999)
  const b = randomInt(100, 999)
  const correct = a + b

  const distractors = new Set<number>()
  while (distractors.size < 2) {
    const delta = randomInt(-180, 180)
    const candidate = correct + delta
    if (
      candidate === correct ||
      candidate < 200 ||
      candidate > 1998 ||
      distractors.has(candidate)
    ) {
      continue
    }
    distractors.add(candidate)
  }

  const options = shuffleArray([correct, ...distractors])
  const answer = options.indexOf(correct)

  return {
    question: `${a} + ${b}`,
    options: options.map((option) => option.toString()),
    answer,
  }
}

const generatePages = (): Problem[][] =>
  Array.from({ length: TOTAL_PAGES }, () =>
    Array.from({ length: PROBLEMS_PER_PAGE }, () => generateProblem()),
  )

export default function QuizSumas() {
  const navigate = useNavigate()
  const [template, setTemplate] = useState<TemplateId>('clasico')
  const [currentPage, setCurrentPage] = useState(0)
  const [pages, setPages] = useState<Problem[][]>(() => generatePages())
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => Array(TOTAL_PROBLEMS).fill(null),
  )
  const [showResults, setShowResults] = useState(false)
  const [activeProblem, setActiveProblem] = useState<{ page: number; index: number } | null>(
    null,
  )
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [checkFeedback, setCheckFeedback] = useState<'correcto' | 'incorrecto' | null>(null)
  const closeTimeoutRef = useRef<number | null>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const intervalRef = useRef<number | null>(null)
  const [scoreSaved, setScoreSaved] = useState(false)
  const [modoPractica, setModoPractica] = useState(false)

  useEffect(() => {
    // Verificar token
    const checkAuth = async () => {
      const user = await validateToken()
      if (!user) {
        navigate('/')
      } else {
        // Iniciar cronómetro cuando se carga el quiz
        setStartTime(Date.now())
      }
    }
    checkAuth()
  }, [navigate])

  // Cronómetro
  useEffect(() => {
    if (startTime && !showResults) {
      intervalRef.current = window.setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [startTime, showResults])

  useEffect(
    () => () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current)
      }
    },
    [],
  )

  const currentProblem = activeProblem
    ? pages[activeProblem.page]?.[activeProblem.index] ?? null
    : null
  const globalIndex =
    activeProblem !== null
      ? activeProblem.page * PROBLEMS_PER_PAGE + activeProblem.index
      : null

  const totalAnswered = useMemo(
    () => answers.filter((answer) => answer !== null).length,
    [answers],
  )

  const score = useMemo(
    () =>
      answers.reduce((acc, answer, index) => {
        if (answer === null) return acc
        const pageIndex = Math.floor(index / PROBLEMS_PER_PAGE)
        const problemIndex = index % PROBLEMS_PER_PAGE
        const problem = pages[pageIndex]?.[problemIndex]
        if (problem && answer === problem.answer) {
          return acc + 1
        }
        return acc
      }, 0),
    [answers, pages],
  )

  const progress = Math.round((totalAnswered / TOTAL_PROBLEMS) * 100)
  const resolvedAnswerIndex = globalIndex !== null ? answers[globalIndex] : null
  const canSubmit = totalAnswered === TOTAL_PROBLEMS
  const pageStart = currentPage * PROBLEMS_PER_PAGE
  const answeredInPage = answers
    .slice(pageStart, pageStart + PROBLEMS_PER_PAGE)
    .filter((answer) => answer !== null).length

  const isOverlayOpen = Boolean(activeProblem && currentProblem)

  const handleOpenProblem = (problemIndex: number) => {
    if (showResults) return
    const globalProblemIndex = currentPage * PROBLEMS_PER_PAGE + problemIndex
    if (answers[globalProblemIndex] !== null) return

    soundManager.playClick()
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    setActiveProblem({ page: currentPage, index: problemIndex })
    setSelectedOption(null)
    setCheckFeedback(null)
  }

  const handleSelectOption = (optionIndex: number) => {
    if (!currentProblem || resolvedAnswerIndex !== null || showResults) return
    setSelectedOption(optionIndex)
    setCheckFeedback(null)
  }

  const handleCloseOverlay = () => {
    if (resolvedAnswerIndex !== null) return
    setActiveProblem(null)
    setSelectedOption(null)
    setCheckFeedback(null)
  }

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < TOTAL_PAGES - 1) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handleCheckAnswer = () => {
    if (selectedOption === null || !currentProblem || globalIndex === null) return
    if (resolvedAnswerIndex !== null) return

    if (selectedOption === currentProblem.answer) {
      soundManager.playCorrect()
      setAnswers((prev) => {
        const next = [...prev]
        next[globalIndex] = currentProblem.answer
        return next
      })
      setCheckFeedback('correcto')
      closeTimeoutRef.current = window.setTimeout(() => {
        setActiveProblem(null)
        setSelectedOption(null)
        setCheckFeedback(null)
        closeTimeoutRef.current = null
      }, 1000)
    } else {
      soundManager.playIncorrect()
      setCheckFeedback('incorrecto')
    }
  }

  const handleSubmitQuiz = async () => {
    if (!canSubmit || scoreSaved) return
    
    // Calcular estadísticas
    const correctas = score
    const erroneas = totalAnswered - score
    const tiempo_segundos = elapsedTime

    setShowResults(true)
    soundManager.playSuccess()

      // Guardar puntuación en el backend (solo si no es modo práctica)
      if (!modoPractica) {
        try {
          await saveScore({
            tiempo_segundos,
            total_realizadas: totalAnswered,
            correctas,
            erroneas,
            tipo_operacion: 'suma',
            modo_practica: 0,
          })
          setScoreSaved(true)
        } catch (error) {
          console.error('Error al guardar puntuación:', error)
          // No bloqueamos la UI si falla el guardado
        }
      } else {
        setScoreSaved(true)
      }
  }

  const handleRestart = () => {
    setAnswers(Array(TOTAL_PROBLEMS).fill(null))
    setCurrentPage(0)
    setShowResults(false)
    setPages(generatePages())
    setActiveProblem(null)
    setSelectedOption(null)
    setCheckFeedback(null)
    setScoreSaved(false)
    setStartTime(Date.now())
    setElapsedTime(0)
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }

  const handlePageChange = (pageIndex: number) => {
    if (activeProblem) return
    setCurrentPage(pageIndex)
  }

  const handleLogout = () => {
    apiLogout()
    navigate('/')
  }

  const handleBackToMenu = () => {
    navigate('/menu')
  }

  // Formatear tiempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderOptionButton = (text: string, index: number) => {
    if (!currentProblem) return null
    const isSelected =
      resolvedAnswerIndex !== null ? resolvedAnswerIndex === index : selectedOption === index
    const isCorrect = resolvedAnswerIndex !== null && index === currentProblem.answer
    const isWrong =
      checkFeedback === 'incorrecto' &&
      selectedOption === index &&
      resolvedAnswerIndex === null
    const disabled = resolvedAnswerIndex !== null || showResults

    return (
      <button
        key={`${currentProblem.question}-${text}-${index}`}
        type="button"
        onClick={() => handleSelectOption(index)}
        className={[
          'option',
          template,
          isSelected ? 'selected' : '',
          isCorrect ? 'correct' : '',
          isWrong ? 'wrong' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        disabled={disabled}
      >
        <span className="option-badge">{letters[index] ?? '?'}</span>
        <span className="option-text">{text}</span>
        {isCorrect && (
          <span className="option-feedback">¡Bien!</span>
        )}
        {isWrong && (
          <span className="option-feedback">
            Intenta de nuevo
          </span>
        )}
      </button>
    )
  }

  const renderTemplate = () => {
    if (!currentProblem) return null
    switch (template) {
      case 'clasico':
        return (
          <div className="template clasico">
            <div className="question-card">
              <h2>{currentProblem.question}</h2>
              <p>Selecciona la respuesta correcta.</p>
            </div>
            <div className="options vertical">
              {currentProblem.options.map((option, index) =>
                renderOptionButton(option, index),
              )}
            </div>
          </div>
        )
      case 'tarjetas':
        return (
          <div className="template tarjetas">
            <div className="flashcard">
              <div className="flashcard-front">
                <span className="tag">Problema</span>
                <h2>{currentProblem.question}</h2>
              </div>
            </div>
            <div className="options grid">
              {currentProblem.options.map((option, index) =>
                renderOptionButton(option, index),
              )}
            </div>
          </div>
        )
      case 'relampago':
        return (
          <div className="template relampago">
            <div className="challenge-header">
              <span className="timer-dummy">⏱️</span>
              <h2>{currentProblem.question}</h2>
            </div>
            <div className="options circles">
              {currentProblem.options.map((option, index) =>
                renderOptionButton(option, index),
              )}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <main className={['quiz-app', isOverlayOpen ? 'overlay-open' : ''].filter(Boolean).join(' ')}>
      <header className="toolbar">
        <div>
          <h1>Sum Quiz - Sumas ➕</h1>
          <p>Practica sumas rápidas con tres plantillas distintas.</p>
        </div>
        <div className="stats">
          <span>Página {currentPage + 1} / {TOTAL_PAGES}</span>
          <span>Progreso {progress}%</span>
          {!modoPractica && <span>⏱️ Tiempo: {formatTime(elapsedTime)}</span>}
          <button
            type="button"
            onClick={() => setModoPractica(!modoPractica)}
            className={`mode-button ${modoPractica ? 'active' : ''}`}
            title={modoPractica ? 'Cambiar a modo normal' : 'Cambiar a modo práctica'}
          >
            {modoPractica ? '📚 Práctica' : '🎯 Normal'}
          </button>
          <button
            type="button"
            onClick={handleBackToMenu}
            className="back-button"
            title="Volver al menú"
          >
            🏠 Menú
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="logout-button"
            title="Cerrar sesión"
          >
            🚪 Salir
          </button>
        </div>
      </header>

      <section className="template-switcher">
        {templates.map(({ id, label, description }) => (
          <button
            key={id}
            type="button"
            className={['template-chip', template === id ? 'active' : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => setTemplate(id)}
            aria-pressed={template === id}
          >
            <strong>{label}</strong>
            <span>{description}</span>
          </button>
        ))}
      </section>

      <section className={['page-switcher', isOverlayOpen ? 'disabled' : ''].filter(Boolean).join(' ')}>
        {Array.from({ length: TOTAL_PAGES }, (_, index) => (
          <button
            key={`page-${index + 1}`}
            type="button"
            className={['page-button', currentPage === index ? 'active' : '', isOverlayOpen ? 'locked' : '']
              .filter(Boolean)
              .join(' ')}
            onClick={() => handlePageChange(index)}
            aria-pressed={currentPage === index}
            disabled={isOverlayOpen}
          >
            Página {index + 1}
          </button>
        ))}
      </section>

      <section className="playground">
        <div
          className={[
            'questions-grid',
            template,
            isOverlayOpen ? 'blurred' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {pages[currentPage]?.map((problem, index) => {
            const globalProblemIndex = currentPage * PROBLEMS_PER_PAGE + index
            const isAnswered = answers[globalProblemIndex] !== null
            return (
              <button
                key={`${problem.question}-${index}`}
                type="button"
                className={[
                  'question-tile',
                  template,
                  isAnswered ? 'resolved' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => handleOpenProblem(index)}
                disabled={isAnswered || showResults || isOverlayOpen}
              >
                <span className="question-label">Suma {index + 1}</span>
                <strong className="question-value">{problem.question}</strong>
                <span className="question-status">
                  {isAnswered ? 'Completada' : 'Disponible'}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {isOverlayOpen && currentProblem && (
        <div className="overlay-backdrop">
          <div className={['overlay-card', template].filter(Boolean).join(' ')}>
            {renderTemplate()}
            <div className="overlay-actions">
              <button
                type="button"
                className="primary"
                onClick={handleCheckAnswer}
                disabled={selectedOption === null || resolvedAnswerIndex !== null}
              >
                <span>✅</span>
                <span>Enviar respuesta</span>
              </button>
              <button
                type="button"
                onClick={handleCloseOverlay}
                disabled={resolvedAnswerIndex !== null}
              >
                <span>❌</span>
                <span>Cancelar</span>
              </button>
            </div>
            {checkFeedback === 'incorrecto' && (
              <p className="overlay-feedback">Respuesta incorrecta, intenta nuevamente.</p>
            )}
            {checkFeedback === 'correcto' && (
              <p className="overlay-feedback success">
                ¡Correcto! Regresando a la lista...
              </p>
            )}
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="navigation">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage === 0 || isOverlayOpen}
          >
            Página anterior
          </button>
          {showResults ? (
            <button type="button" onClick={handleRestart}>
              Reiniciar
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitQuiz}
              disabled={!canSubmit}
              className="primary"
            >
              Finalizar intento
            </button>
          )}
          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage === TOTAL_PAGES - 1 || isOverlayOpen}
          >
            Página siguiente
          </button>
        </div>

        <div className="summary">
          <span>
            Resueltas en esta página: {answeredInPage}/{PROBLEMS_PER_PAGE}
          </span>
          <span>
            Contestadas: {totalAnswered}/{TOTAL_PROBLEMS}
          </span>
          {showResults && !modoPractica && (
            <>
              <span>
                ✅ Correctas: {score} / {TOTAL_PROBLEMS}
              </span>
              <span>
                ❌ Erróneas: {totalAnswered - score}
              </span>
              <span>
                ⏱️ Tiempo total: {formatTime(elapsedTime)}
              </span>
              {scoreSaved && (
                <span className="score-saved">💾 Puntuación guardada</span>
              )}
            </>
          )}
        </div>
      </footer>

      {showResults && (
        <ResultsScreen
          score={score}
          total={TOTAL_PROBLEMS}
          tiempo={elapsedTime}
          scoreSaved={scoreSaved && !modoPractica}
          onRestart={handleRestart}
          onBackToMenu={handleBackToMenu}
        />
      )}
    </main>
  )
}

