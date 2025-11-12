// Utilidad para reproducir sonidos
class SoundManager {
  private audioContext: AudioContext | null = null
  private soundsEnabled: boolean = true

  constructor() {
    // Verificar si el usuario ha deshabilitado sonidos
    const saved = localStorage.getItem('soundsEnabled')
    if (saved !== null) {
      this.soundsEnabled = saved === 'true'
    }
  }

  init() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext()
    }
  }

  setEnabled(enabled: boolean) {
    this.soundsEnabled = enabled
    localStorage.setItem('soundsEnabled', String(enabled))
  }

  isEnabled(): boolean {
    return this.soundsEnabled
  }

  // Sonido de respuesta correcta
  playCorrect() {
    if (!this.soundsEnabled || !this.audioContext) return
    this.playTone(440, 0.1, 'sine')
  }

  // Sonido de respuesta incorrecta
  playIncorrect() {
    if (!this.soundsEnabled || !this.audioContext) return
    this.playTone(220, 0.15, 'sawtooth')
  }

  // Sonido de click
  playClick() {
    if (!this.soundsEnabled || !this.audioContext) return
    this.playTone(800, 0.05, 'square')
  }

  // Sonido de éxito
  playSuccess() {
    if (!this.soundsEnabled || !this.audioContext) return
    // Secuencia de tonos ascendentes
    const frequencies = [523.25, 659.25, 783.99] // Do, Mi, Sol
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone(freq, 0.2, 'sine')
      }, index * 100)
    })
  }

  // Reproducir un tono
  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + duration)
  }
}

export const soundManager = new SoundManager()

// Inicializar cuando se carga el módulo
if (typeof window !== 'undefined') {
  soundManager.init()
}

