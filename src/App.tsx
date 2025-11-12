import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Menu from './pages/Menu'
import QuizSumas from './pages/QuizSumas'
import QuizRestas from './pages/QuizRestas'
import Stats from './pages/Stats'
import Ranking from './pages/Ranking'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/quiz/sumas" element={<QuizSumas />} />
      <Route path="/quiz/restas" element={<QuizRestas />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/ranking" element={<Ranking />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
