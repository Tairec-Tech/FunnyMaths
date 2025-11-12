const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Debug: verificar que la variable de entorno se carga
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL)
  console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL)
}


export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
}

export interface User {
  id: number
  username: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface ScoreData {
  tiempo_segundos: number
  total_realizadas: number
  correctas: number
  erroneas: number
  tipo_operacion: 'suma' | 'resta'
  modo_practica?: number
}

export interface Score {
  id: number
  tipo_operacion?: string
  modo_practica?: number
  tiempo_segundos: number
  total_realizadas: number
  correctas: number
  erroneas: number
  fecha: string
  username: string
}

export interface UserStats {
  total_intentos: number
  total_operaciones: number
  total_correctas: number
  total_erroneas: number
  tiempo_promedio: number
  mejor_tiempo: number
  mejor_puntuacion: number
}

export interface StatsPorTipo {
  tipo_operacion: string
  intentos: number
  total_correctas: number
  mejor_puntuacion: number
}

export interface Logro {
  tipo: string
  descripcion: string
  fecha: string
}

/**
 * Realiza una petición a la API
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}/${endpoint}`
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Agregar token si existe
  const token = localStorage.getItem('token')
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)
    const data: ApiResponse<T> = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Error en la petición')
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Error de conexión con el servidor')
  }
}

/**
 * Registro de usuario
 */
export async function register(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetchAPI<LoginResponse>('register.php', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })

  if (response.data) {
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    return response.data
  }

  throw new Error('Error al registrar usuario')
}

/**
 * Login de usuario
 */
export async function login(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetchAPI<LoginResponse>('login.php', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })

  if (response.data) {
    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    return response.data
  }

  throw new Error('Error al iniciar sesión')
}

/**
 * Validar token
 */
export async function validateToken(): Promise<User | null> {
  const token = localStorage.getItem('token')
  if (!token) {
    return null
  }

  try {
    const response = await fetchAPI<{ user: User }>('validate_token.php', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })

    return response.data?.user || null
  } catch {
    // Token inválido, limpiar
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return null
  }
}

/**
 * Guardar puntuación
 */
export async function saveScore(scoreData: ScoreData): Promise<void> {
  await fetchAPI('save_score.php', {
    method: 'POST',
    body: JSON.stringify(scoreData),
  })
}

/**
 * Obtener ranking global
 */
export async function getGlobalScores(
  limit: number = 50,
  tipoOperacion?: string
): Promise<{
  scores: Score[]
  top_users: Array<{
    username: string
    mejor_correctas: number
    mejor_tiempo: number
    total_intentos: number
  }>
}> {
  let url = `scores.php?type=global&limit=${limit}`
  if (tipoOperacion) {
    url += `&tipo_operacion=${tipoOperacion}`
  }
  const response = await fetchAPI<{
    scores: Score[]
    top_users: Array<{
      username: string
      mejor_correctas: number
      mejor_tiempo: number
      total_intentos: number
    }>
  }>(url)

  return response.data || { scores: [], top_users: [] }
}

/**
 * Obtener puntuaciones del usuario
 */
export async function getUserScores(
  limit: number = 50,
  tipoOperacion?: string
): Promise<{
  scores: Score[]
  stats: UserStats
  stats_por_tipo: StatsPorTipo[]
  logros: Logro[]
}> {
  let url = `scores.php?type=user&limit=${limit}`
  if (tipoOperacion) {
    url += `&tipo_operacion=${tipoOperacion}`
  }
  const response = await fetchAPI<{
    scores: Score[]
    stats: UserStats
    stats_por_tipo: StatsPorTipo[]
    logros: Logro[]
  }>(url)

  return (
    response.data || {
      scores: [],
      stats: {} as UserStats,
      stats_por_tipo: [],
      logros: [],
    }
  )
}

/**
 * Obtener logros del usuario
 */
export async function getAchievements(): Promise<{
  logros: Logro[]
  total: number
}> {
  const response = await fetchAPI<{
    logros: Logro[]
    total: number
  }>('achievements.php')

  return response.data || { logros: [], total: 0 }
}

/**
 * Cerrar sesión
 */
export function logout(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

/**
 * Obtener usuario actual
 */
export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

