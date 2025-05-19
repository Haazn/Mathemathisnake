const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
const gameOverScreen = document.getElementById("game-over-screen")
const finalScore = document.getElementById("final-score")
const restartBtn = document.getElementById("restart-btn")
const countdownScreen = document.getElementById("countdown-screen")
const heartContainer = document.getElementById("heart-container")
const hearts = document.querySelectorAll(".heart")
const backButton = document.getElementById("back-button")

const questionText = document.querySelector(".question-text")

const choice1 = document.querySelector(".choice1");
const choice1Text = document.querySelector(".choice1 .choice-text"); 
const choice2 = document.querySelector(".choice2");
const choice2Text = document.querySelector(".choice2 .choice-text");
const choice3 = document.querySelector(".choice3");
const choice3Text = document.querySelector(".choice3 .choice-text");
const choice4 = document.querySelector(".choice4");
const choice4Text = document.querySelector(".choice4 .choice-text");

const timerText = document.querySelector(".timer-text")

const scoreText = document.querySelector(".score-text")
// const boardQuestion = document.querySelector(".boardquestion") // Unused, can be removed
const choices = document.querySelectorAll(".choice")
const choiceTexts = document.querySelectorAll(".choice-text")

const touchUp = document.querySelector(".touch-up")
const touchDown = document.querySelector(".touch-down")
const touchLeft = document.querySelector(".touch-left")
const touchRight = document.querySelector(".touch-right")

// const backgroundImage = new Image() // Removed, using rockyTexture
// backgroundImage.src = "../images/background.png" 
// backgroundImage.crossOrigin = "anonymous" 

let gridSize = 20 // Made 'let' so it can be updated by resizeCanvas

let snake = [
  { x: 240, y: 240 },
  { x: 220, y: 240 },
  { x: 200, y: 240 },
]
let food = { x: 0, y: 0 }
let direction = "right"
let nextDirection = "right"
let score = 0
let gameRunning = true
let interval
let isDead = false
let timerInterval
let timeLeft = 0
let questionActive = false
let currentQuestion = null
let countdownInterval
let lives = 3
let isHurting = false
let snakeShakeOffset = { x: 0, y: 0 }
let lastTapTime = 0
const doubleTapDelay = 300

let mouthState = "closed"
let mouthProgress = 0
let mouthAnimationStartTime = 0
const mouthAnimationDuration = 150
const mouthOpenDuration = 300
let lastFoodEatenTime = 0
const keepMouthOpenAfterEating = 500
let tongueAnimationPhase = 0
let headWobblePhase = 0
let jawRotation = 0
let jawOpenAmount = 0
let tongueOut = false

let isSwallowing = false
let swallowProgress = 0
let swallowBulgePosition = 0
let swallowStartTime = 0
const swallowDuration = 1000


let foodParticles = []

let growthPulse = 0
let isPulsing = false


let trailParticles = []
const maxTrailParticles = 50


const ambientParticles = []
const leafParticles = []
const maxAmbientParticles = 15
const maxLeafParticles = 8
const fireflies = []
const maxFireflies = 20


let powerUpActive = false
let powerUpTimeLeft = 0
let powerUpType = null
let powerUpPosition = { x: 0, y: 0 }
let powerUpAppearTime = 0
let powerUpAlpha = 0
let powerUpPulse = 0


let scoreAnimations = []


let screenShake = { active: false, intensity: 0, duration: 0, startTime: 0 }


let lightningEffect = { active: false, alpha: 0, duration: 0, startTime: 0, color: "#ffffff" }


let snakeSpeed = 1.0 
const maxSnakeSpeed = 2.0 
const speedIncreasePerFood = 0.05


let rainbowMode = false
let rainbowHue = 0


const bgMusic = new Audio()
bgMusic.src = "../audios/backgroundmusic.mp3"
bgMusic.loop = true
bgMusic.volume = 0.3

const eatingSound = new Audio()
eatingSound.src = "../audios/success.wav"
eatingSound.volume = 0.7

const correctAnswerSound = new Audio()
correctAnswerSound.src = "../audios/correct.wav"
correctAnswerSound.volume = 0.7

const wrongAnswerSound = new Audio()
wrongAnswerSound.src = "../audios/lose-health.wav"
wrongAnswerSound.volume = 0.7

const tickingSound = new Audio()
tickingSound.src = "../audios/game-question.wav"
tickingSound.volume = 0.5
tickingSound.loop = true

const loseLifeSound = new Audio()
loseLifeSound.src = "../audios/lose-health.wav"
loseLifeSound.volume = 0.7

const gameOverSound = new Audio()
gameOverSound.src = "../audios/lose.wav"
gameOverSound.volume = 0.7

const clickSound = new Audio()
clickSound.src = "../audios/click.mp3"
clickSound.volume = 0.5


const powerUpSound = new Audio()
powerUpSound.src = "../audios/player-boost.wav"
powerUpSound.volume = 0.6

let soundEnabled = true

function playSound(sound) {
  if (soundEnabled) {
    sound.currentTime = 0
    sound.play().catch((error) => {
      console.log("Audio play error:", error)
    })
  }
}

function toggleSound() {
  soundEnabled = !soundEnabled

  if (soundEnabled) {
    if (gameRunning && !questionActive) {
      bgMusic.play().catch((error) => console.log("Audio play error:", error))
    }
    document.getElementById("sound-toggle").textContent = "🔊"
  } else {
    bgMusic.pause()
    tickingSound.pause()
    document.getElementById("sound-toggle").textContent = "🔇"
  }
}

function resizeCanvas() {
  const container = document.getElementById("game-container")
  const containerWidth = container.clientWidth
  const containerHeight = container.clientHeight

  canvas.width = containerWidth
  canvas.height = containerHeight

  const minDimension = Math.min(containerWidth, containerHeight)
  gridSize = Math.max(15, Math.floor(minDimension / 30)) // Update global gridSize

  draw()
}

function createFirefly() {
  if (fireflies.length >= maxFireflies) return

  const firefly = {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: 2 + Math.random() * 3,
    speed: 0.3 + Math.random() * 0.7,
    angle: Math.random() * Math.PI * 2,
    angleChange: (Math.random() - 0.5) * 0.05,
    alpha: 0.1 + Math.random() * 0.4,
    pulseSpeed: 0.01 + Math.random() * 0.02,
    pulsePhase: Math.random() * Math.PI * 2,
    color: `hsl(${Math.random() * 60 + 40}, 100%, 70%)`,
  }

  fireflies.push(firefly)
}

function updateFireflies() {
  if (Math.random() < 0.05 && fireflies.length < maxFireflies) {
    createFirefly()
  }

  for (let i = fireflies.length - 1; i >= 0; i--) {
    const firefly = fireflies[i]

    firefly.angle += firefly.angleChange
    firefly.x += Math.cos(firefly.angle) * firefly.speed
    firefly.y += Math.sin(firefly.angle) * firefly.speed

    firefly.alpha = 0.1 + Math.sin(firefly.pulsePhase) * 0.4 + 0.4
    firefly.pulsePhase += firefly.pulseSpeed

    if (firefly.x < -20 || firefly.x > canvas.width + 20 || firefly.y < -20 || firefly.y > canvas.height + 20) {
      fireflies.splice(i, 1)
    }
  }
}

function drawFireflies() {
  for (let i = 0; i < fireflies.length; i++) {
    const firefly = fireflies[i]

    const gradient = ctx.createRadialGradient(firefly.x, firefly.y, 0, firefly.x, firefly.y, firefly.size * 3)
    gradient.addColorStop(0, `${firefly.color}`)
    gradient.addColorStop(1, "rgba(255, 255, 100, 0)")

    ctx.globalAlpha = firefly.alpha
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(firefly.x, firefly.y, firefly.size * 3, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
    ctx.beginPath()
    ctx.arc(firefly.x, firefly.y, firefly.size * 0.5, 0, Math.PI * 2)
    ctx.fill()

    ctx.globalAlpha = 1.0
  }
}

function createRockyTexture() {
  const textureCanvas = document.createElement("canvas")
  textureCanvas.width = 100
  textureCanvas.height = 100
  const textureCtx = textureCanvas.getContext("2d")

  textureCtx.fillStyle = "#c2b280"
  textureCtx.fillRect(0, 0, textureCanvas.width, textureCanvas.height)

  textureCtx.strokeStyle = "#a09060"
  textureCtx.lineWidth = 1

  for (let i = 0; i < 50; i++) {
    textureCtx.beginPath()
    textureCtx.moveTo(Math.random() * textureCanvas.width, Math.random() * textureCanvas.height)
    textureCtx.bezierCurveTo(
      Math.random() * textureCanvas.width,
      Math.random() * textureCanvas.height,
      Math.random() * textureCanvas.width,
      Math.random() * textureCanvas.height,
      Math.random() * textureCanvas.width,
      Math.random() * textureCanvas.height,
    )
    textureCtx.stroke()
  }

  for (let i = 0; i < 30; i++) {
    textureCtx.fillStyle = `rgba(100, 80, 40, ${Math.random() * 0.3})`
    textureCtx.beginPath()
    textureCtx.arc(
      Math.random() * textureCanvas.width,
      Math.random() * textureCanvas.height,
      Math.random() * 5 + 2,
      0,
      Math.PI * 2,
    )
    textureCtx.fill()
  }

  for (let i = 0; i < 20; i++) {
    textureCtx.fillStyle = `rgba(220, 210, 180, ${Math.random() * 0.4})`
    textureCtx.beginPath()
    textureCtx.arc(
      Math.random() * textureCanvas.width,
      Math.random() * textureCanvas.height,
      Math.random() * 3 + 1,
      0,
      Math.PI * 2,
    )
    textureCtx.fill()
  }

  return ctx.createPattern(textureCanvas, "repeat")
}

function createAmbientParticles() {
  if (ambientParticles.length >= maxAmbientParticles) return

  const particle = {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: 3 + Math.random() * 5,
    speedX: (Math.random() - 0.5) * 1,
    speedY: (Math.random() - 0.5) * 1,
    alpha: 0.1 + Math.random() * 0.5,
    growing: true,
    pulseSpeed: 0.005 + Math.random() * 0.01,
  }

  ambientParticles.push(particle)

  const particleElement = document.createElement("div")
  particleElement.className = "jungle-particle"
  particleElement.style.left = particle.x + "px"
  particleElement.style.top = particle.y + "px"
  particleElement.style.width = particle.size + "px"
  particleElement.style.height = particle.size + "px"
  particleElement.style.opacity = particle.alpha
  document.getElementById("ambient-particles").appendChild(particleElement)

  particle.element = particleElement
}

function updateAmbientParticles() {
  if (Math.random() < 0.05) {
    createAmbientParticles()
  }

  for (let i = ambientParticles.length - 1; i >= 0; i--) {
    const particle = ambientParticles[i]

    particle.x += particle.speedX
    particle.y += particle.speedY

    if (particle.growing) {
      particle.alpha += particle.pulseSpeed
      if (particle.alpha >= 0.8) {
        particle.growing = false
      }
    } else {
      particle.alpha -= particle.pulseSpeed
      if (particle.alpha <= 0.1) {
        particle.growing = true
      }
    }

    if (particle.element) {
      particle.element.style.left = particle.x + "px"
      particle.element.style.top = particle.y + "px"
      particle.element.style.opacity = particle.alpha
    }

    if (
      particle.x < -50 ||
      particle.x > window.innerWidth + 50 ||
      particle.y < -50 ||
      particle.y > window.innerHeight + 50
    ) {
      if (particle.element) {
        particle.element.remove()
      }
      ambientParticles.splice(i, 1)
    }
  }
}

function createLeafParticle() {
  if (leafParticles.length >= maxLeafParticles) return

  const particle = {
    x: Math.random() * window.innerWidth,
    y: -30,
    size: 10 + Math.random() * 15,
    speedX: (Math.random() - 0.5) * 2,
    speedY: 0.5 + Math.random() * 1,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 5,
  }

  leafParticles.push(particle)

  const leafElement = document.createElement("div")
  leafElement.className = "leaf-particle"
  leafElement.style.left = particle.x + "px"
  leafElement.style.top = particle.y + "px"
  leafElement.style.width = particle.size + "px"
  leafElement.style.height = particle.size + "px"
  leafElement.style.transform = `rotate(${particle.rotation}deg)`
  document.getElementById("ambient-particles").appendChild(leafElement)

  particle.element = leafElement
}

function updateLeafParticles() {
  if (Math.random() < 0.01) {
    createLeafParticle()
  }

  for (let i = leafParticles.length - 1; i >= 0; i--) {
    const particle = leafParticles[i]

    particle.x += particle.speedX
    particle.y += particle.speedY
    particle.rotation += particle.rotationSpeed

    particle.x += Math.sin(Date.now() * 0.001) * 0.5

    if (particle.element) {
      particle.element.style.left = particle.x + "px"
      particle.element.style.top = particle.y + "px"
      particle.element.style.transform = `rotate(${particle.rotation}deg)`
    }

    if (particle.y > window.innerHeight + 50) {
      if (particle.element) {
        particle.element.remove()
      }
      leafParticles.splice(i, 1)
    }
  }
}

function createTrailParticles() {
  if (!gameRunning || questionActive || isDead) return

  if (Math.random() > 0.3) return

  const segmentIndex = Math.floor(Math.random() * Math.min(5, snake.length))
  const segment = snake[segmentIndex]

  const baseColor = rainbowMode ? `hsl(${(rainbowHue + segmentIndex * 10) % 360}, 100%, 60%)` : "#00cc66"

  const particle = {
    x: segment.x + gridSize / 2 + (Math.random() - 0.5) * gridSize * 0.8,
    y: segment.y + gridSize / 2 + (Math.random() - 0.5) * gridSize * 0.8,
    size: 2 + Math.random() * 5,
    alpha: 0.7 + Math.random() * 0.3,
    color: baseColor,
    speedX: (Math.random() - 0.5) * 0.5,
    speedY: (Math.random() - 0.5) * 0.5 - 0.2, 
    gravity: 0.01 + Math.random() * 0.02,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.1,
    fadeSpeed: 0.01 + Math.random() * 0.02,
  }

  trailParticles.push(particle)

  if (trailParticles.length > maxTrailParticles) {
    trailParticles.shift()
  }
}

function updateTrailParticles() {
  for (let i = trailParticles.length - 1; i >= 0; i--) {
    const particle = trailParticles[i]

    particle.x += particle.speedX
    particle.y += particle.speedY
    particle.speedY += particle.gravity
    particle.rotation += particle.rotationSpeed
    particle.alpha -= particle.fadeSpeed

    if (particle.alpha <= 0) {
      trailParticles.splice(i, 1)
    }
  }
}

function drawTrailParticles() {
  for (let i = 0; i < trailParticles.length; i++) {
    const particle = trailParticles[i]

    ctx.save()
    ctx.globalAlpha = particle.alpha
    ctx.translate(particle.x, particle.y)
    ctx.rotate(particle.rotation)

    ctx.fillStyle = particle.color
    ctx.beginPath()

    if (Math.random() > 0.7) {
      const spikes = 5
      const outerRadius = particle.size
      const innerRadius = particle.size / 2

      for (let j = 0; j < spikes * 2; j++) {
        const radius = j % 2 === 0 ? outerRadius : innerRadius
        const angle = (j * Math.PI) / spikes
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius

        if (j === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
    } else {
      ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
    }

    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }
}

function createScoreAnimation(value, x, y) {
  scoreAnimations.push({
    value: value > 0 ? `+${value}` : value,
    x: x,
    y: y,
    alpha: 1,
    scale: 1.5,
    color: value > 0 ? "#ffcc00" : "#ff5555",
    life: 60, 
  })
}

function updateScoreAnimations() {
  for (let i = scoreAnimations.length - 1; i >= 0; i--) {
    const anim = scoreAnimations[i]
    anim.y -= 1
    anim.alpha -= 0.02
    anim.scale -= 0.01
    anim.life--

    if (anim.life <= 0) {
      scoreAnimations.splice(i, 1)
    }
  }
}

function drawScoreAnimations() {
  for (let i = 0; i < scoreAnimations.length; i++) {
    const anim = scoreAnimations[i]

    ctx.save()
    ctx.globalAlpha = anim.alpha
    ctx.font = `bold ${Math.floor(24 * anim.scale)}px Arial`
    ctx.fillStyle = anim.color
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 3
    ctx.textAlign = "center"
    ctx.strokeText(anim.value, anim.x, anim.y)
    ctx.fillText(anim.value, anim.x, anim.y)
    ctx.restore()
  }
}

function createScreenShake(intensity, duration) {
  screenShake = {
    active: true,
    intensity: intensity,
    duration: duration,
    startTime: Date.now(),
  }
}

function updateScreenShake() {
  if (!screenShake.active) return

  const elapsed = Date.now() - screenShake.startTime
  if (elapsed >= screenShake.duration) {
    screenShake.active = false
    return
  }

  const progress = elapsed / screenShake.duration
  const intensity = screenShake.intensity * (1 - progress)

  canvas.style.transform = `translate(${(Math.random() - 0.5) * intensity * 2}px, ${(Math.random() - 0.5) * intensity * 2}px)`
}

function createLightningEffect(color, duration) {
  lightningEffect = {
    active: true,
    alpha: 0.7,
    color: color || "#ffffff",
    duration: duration || 300,
    startTime: Date.now(),
  }
}

function updateLightningEffect() {
  if (!lightningEffect.active) return

  const elapsed = Date.now() - lightningEffect.startTime
  if (elapsed >= lightningEffect.duration) {
    lightningEffect.active = false
    return
  }

  const progress = elapsed / lightningEffect.duration
  lightningEffect.alpha = 0.7 * (1 - progress)
}

function drawLightningEffect() {
  if (!lightningEffect.active) return

  ctx.save()
  ctx.fillStyle = lightningEffect.color
  ctx.globalAlpha = lightningEffect.alpha
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.restore()
}


function generatePowerUp() {
  if (Math.random() > 0.1) return

  if (powerUpActive) return

  let newPowerUp
  do {
    newPowerUp = {
      x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
      y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize,
    }
  } while (
    snake.some((segment) => segment.x === newPowerUp.x && segment.y === newPowerUp.y) ||
    (food.x === newPowerUp.x && food.y === newPowerUp.y)
  )

  powerUpPosition = newPowerUp
  powerUpType = ["speed", "rainbow", "invincible", "grow"][Math.floor(Math.random() * 4)]
  powerUpAppearTime = Date.now()
  powerUpAlpha = 0
}

function updatePowerUp() {
  if (powerUpAlpha < 1) {
    powerUpAlpha = Math.min(1, powerUpAlpha + 0.05)
  }

  powerUpPulse = (powerUpPulse + 0.1) % (Math.PI * 2)

  if (snake[0].x === powerUpPosition.x && snake[0].y === powerUpPosition.y) {
    activatePowerUp()
  }
}

function activatePowerUp() {
  powerUpActive = true
  powerUpTimeLeft = 10

  playSound(powerUpSound)

  let effectColor
  switch (powerUpType) {
    case "speed":
      effectColor = "#ffcc00"
      break
    case "rainbow":
      effectColor = "#ff00ff"
      rainbowMode = true
      break
    case "invincible":
      effectColor = "#00ccff"
      break
    case "grow":
      effectColor = "#33ff33"
      for (let i = 0; i < 3; i++) {
        const tail = snake[snake.length - 1]
        snake.push({ ...tail })
      }
      break
  }

  createLightningEffect(effectColor, 500)
  createScreenShake(10, 300)

  createScoreAnimation(powerUpType, powerUpPosition.x + gridSize / 2, powerUpPosition.y)

  powerUpPosition = { x: 0, y: 0 }
}

function updatePowerUpTimer() {
  if (!powerUpActive) return

  powerUpTimeLeft -= 1 / 60

  if (powerUpTimeLeft <= 0) {
    powerUpActive = false
    rainbowMode = false
  }
}

function drawPowerUp() {
  if (!powerUpPosition.x && !powerUpPosition.y) return

  const centerX = powerUpPosition.x + gridSize / 2
  const centerY = powerUpPosition.y + gridSize / 2
  const size = gridSize / 2 + Math.sin(powerUpPulse) * 2

  ctx.save()
  ctx.globalAlpha = powerUpAlpha

  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size * 2)

  let color1, color2
  switch (powerUpType) {
    case "speed":
      color1 = "#ffcc00"; color2 = "#ff6600"; break;
    case "rainbow":
      color1 = "#ff00ff"; color2 = "#9900ff"; break;
    case "invincible":
      color1 = "#00ccff"; color2 = "#0066ff"; break;
    case "grow":
      color1 = "#33ff33"; color2 = "#00cc00"; break;
  }

  gradient.addColorStop(0, color1)
  gradient.addColorStop(1, color2)

  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, size * 1.5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = "#ffffff"
  ctx.beginPath()

  switch (powerUpType) {
    case "speed":
      ctx.moveTo(centerX - size / 2, centerY - size / 2)
      ctx.lineTo(centerX + size / 4, centerY - size / 4)
      ctx.lineTo(centerX - size / 4, centerY + size / 4)
      ctx.lineTo(centerX + size / 2, centerY + size / 2)
      break
    case "rainbow":
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
        const x = centerX + Math.cos(angle) * size
        const y = centerY + Math.sin(angle) * size
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      break
    case "invincible":
      ctx.arc(centerX, centerY, size * 0.8, 0, Math.PI * 2)
      break
    case "grow": // Draw '+' symbol for grow
      ctx.rect(centerX - size / 2, centerY - size / 6, size, size / 3)
      ctx.rect(centerX - size / 6, centerY - size / 2, size / 3, size)
      break
  }

  ctx.fill()
  for (let i = 0; i < 3; i++) {
    const angle = Math.random() * Math.PI * 2
    const distance = size * (1.2 + Math.random() * 0.5)
    const sparkleX = centerX + Math.cos(angle) * distance
    const sparkleY = centerY + Math.sin(angle) * distance
    const sparkleSize = 1 + Math.random() * 2

    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function createFoodParticles() {
  const particleCount = 15
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 2 + Math.random() * 5
    const size = 3 + Math.random() * 8

    const particleType = Math.random()
    let particleColor

    if (particleType < 0.33) {
      particleColor = "#ff3333"
    } else if (particleType < 0.66) {
      particleColor = "#33ff33"
    } else {
      particleColor = "#ffff33"
    }

    foodParticles.push({
      x: food.x + gridSize / 2,
      y: food.y + gridSize / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: size,
      color: particleColor,
      alpha: 1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.4,
      gravity: 0.1 + Math.random() * 0.2,
    })
  }

  for (let i = 0; i < 5; i++) {
    foodParticles.push({
      x: food.x + gridSize / 2,
      y: food.y + gridSize / 2,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      size: 10 + Math.random() * 10,
      color: "#ffffff",
      alpha: 0.7,
      isShine: true,
      rotation: 0,
      rotationSpeed: 0,
      gravity: 0,
    })
  }
}

function updateFoodParticles() {
  for (let i = foodParticles.length - 1; i >= 0; i--) {
    const particle = foodParticles[i]

    particle.x += particle.vx
    particle.y += particle.vy

    if (!particle.isShine) {
      particle.vy += particle.gravity
    }

    particle.vx *= 0.98
    particle.vy *= 0.98

    particle.rotation += particle.rotationSpeed

    particle.alpha -= particle.isShine ? 0.05 : 0.02

    if (particle.isShine) {
      particle.size *= 0.92
    }

    if (particle.alpha <= 0 || particle.size <= 0.5) {
      foodParticles.splice(i, 1)
    }
  }
}

function drawFoodParticles() {
  for (let i = 0; i < foodParticles.length; i++) {
    const particle = foodParticles[i]

    ctx.save()
    ctx.globalAlpha = particle.alpha
    ctx.translate(particle.x, particle.y)
    ctx.rotate(particle.rotation)

    if (particle.isShine) {
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size)
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)")
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
      ctx.fill()
    } else if (particle.color === "#ff3333") {
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
      ctx.beginPath()
      ctx.arc(-particle.size / 3, -particle.size / 3, particle.size / 3, 0, Math.PI * 2)
      ctx.fill()
    } else if (particle.color === "#33ff33") {
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.moveTo(0, -particle.size)
      ctx.quadraticCurveTo(particle.size, 0, 0, particle.size)
      ctx.quadraticCurveTo(-particle.size, 0, 0, -particle.size)
      ctx.fill()

      ctx.strokeStyle = "rgba(0, 100, 0, 0.5)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, -particle.size)
      ctx.lineTo(0, particle.size)
      ctx.stroke()
    } else {
      ctx.fillStyle = particle.color
      ctx.beginPath()
      ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }
}

const rockyTexture = createRockyTexture(); // Ensure rockyTexture is created and available globally

let statisticsQuestions = [];

fetch('./questions.json')
  .then(response => response.json())
  .then(data => {
    statisticsQuestions = data;
  })
  .catch(error => {
    console.error('Error loading questions:', error);
  });

function generateFood() {
  let newFood
  do {
    newFood = {
      x: Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize,
      y: Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize,
    }
  } while (snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y))

  createLightningEffect("rgba(255, 255, 100, 0.3)", 300)

  food = newFood

  generatePowerUp()
}

function updateHeartsDisplay() {
  hearts.forEach((heart, index) => {
    if (index < lives) {
      heart.classList.remove("lost")
    } else {
      heart.classList.add("lost")
    }
  })
}

function startTimer(seconds) {
  timeLeft = seconds
  updateTimerDisplay()
  timerText.style.color = "white"

  clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    timeLeft--
    updateTimerDisplay()

    if (timeLeft <= 5) {
      timerText.style.color = "#ff5555"
      if (timeLeft === 5) {
        tickingSound.currentTime = 0
        playSound(tickingSound)
      }
    }

    if (timeLeft <= 0) {
      clearInterval(timerInterval)
      tickingSound.pause()
      questionActive = false
      loseLife()
    }
  }, 1000)
}

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0")
  const seconds = (timeLeft % 60).toString().padStart(2, "0")
  timerText.textContent = `${minutes} : ${seconds}`
}

function showQuestionUI() {
  setTimeout(() => {
    questionText.classList.add("show")
    // questionText.style.top = "-25px"; // Positioning handled by adjustQuestionFontSize
  }, 50)

  choiceTexts.forEach((text, index) => {
    setTimeout(
      () => {
        text.classList.add("show")
      },
      100 * (index + 1),
    )
  })
}

function resetQuestionUI() {
  questionText.classList.remove("show")
  questionText.innerHTML = "The question will <br>appear here!"
  // Reset styles applied by adjustQuestionFontSize
  questionText.style.fontSize = ""; 
  questionText.style.display = "";
  questionText.style.alignItems = "";
  questionText.style.justifyContent = "";
  questionText.style.textAlign = "";
  questionText.style.top = "";
  questionText.style.marginTop = "";
  questionText.style.marginLeft = "";


  choiceTexts.forEach((text) => text.classList.remove("show"))
  choice1Text.textContent = ""
  choice2Text.textContent = ""
  choice3Text.textContent = ""
  choice4Text.textContent = ""
}

function adjustQuestionFontSize() {
    if (!questionText) { // Target game.js's questionText element
        console.warn("adjustQuestionFontSize: questionText is not defined or not found.");
        return;
    }

    const textContent = (questionText.textContent || questionText.innerText || "").trim();
    const textLength = textContent.length;

    const styleConfigs = [
        { threshold: 20, fontSize: "clamp(2.0vw, 2.8vw, 42px)", centerText: true  }, 
        { threshold: 40, fontSize: "clamp(1.8vw, 2.5vw, 40px)", centerText: true  }, 
        { threshold: 70, fontSize: "clamp(1.6vw, 2.3vw, 38px)", centerText: false }, 
        { threshold: Infinity, fontSize: "clamp(1.4vw, 2.0vw, 26px)", centerText: false } 
    ];

    const activeConfig = styleConfigs.find(config => textLength <= config.threshold);

    questionText.style.fontSize = activeConfig.fontSize;

    if (activeConfig.centerText) {
        questionText.style.display = "flex";
        questionText.style.alignItems = "center";
        questionText.style.justifyContent = "center";
        questionText.style.textAlign = "center";
        questionText.style.top = "-25px"; // Keep existing vertical positioning if desired
        questionText.style.marginTop = ""; // Clear fixed margins if flex centering is used
        questionText.style.marginLeft = "";
    } else {
        questionText.style.display = "block"; // Or "inline-block" if preferred
        questionText.style.textAlign = "center"; // Default to center for longer texts too
        questionText.style.alignItems = "";
        questionText.style.justifyContent = "";
        questionText.style.top = "-25px"; // Keep existing vertical positioning
        // Restore original margins if not flex centering
        questionText.style.marginTop = "18vw"; 
        questionText.style.marginLeft = "1vw";
    }
}


function checkMathQuestion() {
  questionActive = true
  gameRunning = false 

  const randomIndex = Math.floor(Math.random() * statisticsQuestions.length)
  currentQuestion = statisticsQuestions[randomIndex]


  questionText.innerHTML = currentQuestion.question;
  // Remove fixed margins if adjustQuestionFontSize handles positioning
  // questionText.style.marginTop = "18vw"; 
  // questionText.style.marginLeft = "1vw";
  adjustQuestionFontSize(); // Call the new function

  const shuffledOptions = [...currentQuestion.options].sort(() => Math.random() - 0.5)
  choice1Text.textContent = shuffledOptions[0]
  choice2Text.textContent = shuffledOptions[1]
  choice3Text.textContent = shuffledOptions[2]
  choice4Text.textContent = shuffledOptions[3]


  showQuestionUI()
  startTimer(15) 
}


function checkAnswer(selectedAnswer) {
  clearInterval(timerInterval)
  tickingSound.pause()
  questionActive = false

  if (selectedAnswer !== currentQuestion.correctAnswer) {

    playSound(wrongAnswerSound)


    isHurting = true
    let shakeTime = 0
    const shakeDuration = 500 
    const shakeStartTime = Date.now()

    const shakeInterval = setInterval(() => {
      shakeTime = Date.now() - shakeStartTime
      if (shakeTime >= shakeDuration) {
        clearInterval(shakeInterval)
        isHurting = false
        snakeShakeOffset = { x: 0, y: 0 }
      } else {

        const progress = shakeTime / shakeDuration
        const intensity = 1 - progress 
        snakeShakeOffset = {
          x: (Math.random() * 6 - 3) * intensity,
          y: (Math.random() * 6 - 3) * intensity,
        }
      }
    }, 16) 

   
    createScreenShake(15, 500)

    createLightningEffect("#ff0000", 300)

    loseLife()
  } else {
  
    playSound(correctAnswerSound)

   
    createLightningEffect("#00ff00", 300)

   
    createScoreAnimation(10, canvas.width / 2, canvas.height / 2)

    startCountdown()
  }
  resetQuestionUI()
}

function loseLife() {
  lives--
  updateHeartsDisplay()
  playSound(loseLifeSound)

  if (lives <= 0) {
    gameOver()
  } else {
    startCountdown()
  }
}


function startCountdown() {

  clearInterval(countdownInterval)

  gameRunning = false

  let count = 3
  countdownScreen.textContent = count
  countdownScreen.style.display = "block"

  countdownScreen.style.transform = "scale(2)"
  countdownScreen.style.opacity = "0"

  setTimeout(() => {
    countdownScreen.style.transform = "scale(1)"
    countdownScreen.style.opacity = "1"
  }, 100)

  countdownInterval = setInterval(() => {
    count--
    countdownScreen.textContent = count
    countdownScreen.style.transform = "scale(2)"
    countdownScreen.style.opacity = "0"

    setTimeout(() => {
      countdownScreen.style.transform = "scale(1)"
      countdownScreen.style.opacity = "1"
    }, 100)

    if (count <= 0) {
      clearInterval(countdownInterval)
      countdownScreen.style.display = "none"

      questionActive = false
      isHurting = false
      snakeShakeOffset = { x: 0, y: 0 }


      gameRunning = true


      createLightningEffect("#ffffff", 200)
    }
  }, 1000)
}


function updateMouthAnimation() {
  const now = Date.now()
  const head = snake[0]
  const dx = food.x - head.x
  const dy = food.y - head.y
  const distanceToFood = Math.sqrt(dx * dx + dy * dy)

  tongueAnimationPhase = (tongueAnimationPhase + 0.1) % (Math.PI * 2)


  if (now - lastFoodEatenTime < keepMouthOpenAfterEating) {
    if (mouthState !== "eating") {
      mouthState = "eating"
      mouthProgress = 1
      mouthAnimationStartTime = now
      headWobblePhase = 0
      tongueOut = true

      isSwallowing = true
      swallowProgress = 0
      swallowBulgePosition = 0
      swallowStartTime = now
    }
    headWobblePhase += 0.2
    jawOpenAmount = Math.min(1, jawOpenAmount + 0.1)
    return
  } else {
    tongueOut = false
  }

  if (isSwallowing) {
    const swallowElapsed = now - swallowStartTime
    swallowProgress = Math.min(1, swallowElapsed / swallowDuration)
    swallowBulgePosition = swallowProgress * snake.length

    if (swallowProgress >= 1) {
      isSwallowing = false
    }
  }

  if (distanceToFood < gridSize * 3) {
    if (mouthState === "closed") {
      mouthState = "opening"
      mouthAnimationStartTime = now
    } else if (mouthState === "closing") {
      mouthState = "opening"
      mouthAnimationStartTime = now - mouthAnimationDuration * (1 - mouthProgress)
    }

    switch (direction) {
      case "right":
        jawRotation = Math.PI * 0.1 * Math.sin(headWobblePhase)
        break
      case "left":
        jawRotation = -Math.PI * 0.1 * Math.sin(headWobblePhase)
        break
      case "up":
        jawRotation = Math.PI * 0.1 * Math.sin(headWobblePhase)
        break
      case "down":
        jawRotation = -Math.PI * 0.1 * Math.sin(headWobblePhase)
        break
    }

    jawOpenAmount = Math.min(1, jawOpenAmount + 0.05)
  } else {
    jawOpenAmount = Math.max(0, jawOpenAmount - 0.05)
  }

  if (distanceToFood > gridSize * 4 && (mouthState === "open" || mouthState === "eating")) {
    mouthState = "closing"
    mouthAnimationStartTime = now
  }

  if (mouthState === "open" && now - mouthAnimationStartTime > mouthOpenDuration) {
    mouthState = "closing"
    mouthAnimationStartTime = now
  }

  if (mouthState === "opening" || mouthState === "closing") {
    const elapsed = now - mouthAnimationStartTime
    mouthProgress = Math.min(1, elapsed / mouthAnimationDuration)

    if (mouthProgress >= 1) {
      if (mouthState === "opening") {
        mouthState = "open"
        mouthAnimationStartTime = now
      } else {
        mouthState = "closed"
      }
    }

    if (mouthState === "closing") {
      mouthProgress = 1 - mouthProgress
    }
  }
}

function gameOver() {
  gameRunning = false
  isDead = true
  clearInterval(interval)
  clearInterval(timerInterval)
  bgMusic.pause()
  playSound(gameOverSound)
  finalScore.textContent = `Your Score: ${score}`

  createScreenShake(30, 1000)
  createLightningEffect("#ff0000", 1000)

  for (let i = 0; i < 100; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 2 + Math.random() * 8
    const size = 3 + Math.random() * 10

    foodParticles.push({
      x: snake[0].x + gridSize / 2,
      y: snake[0].y + gridSize / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: size,
      color: i % 3 === 0 ? "#ff3333" : i % 3 === 1 ? "#ffcc00" : "#ffffff",
      alpha: 1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.4,
      gravity: 0.1 + Math.random() * 0.2,
    })
  }

  document.body.classList.add("game-over-active")
  setTimeout(() => {
    gameOverScreen.style.display = "block"
    setTimeout(() => {
      canvas.style.transform = "translate(0, 0)"
      gameOverScreen.classList.add("show")
    }, 50)
  }, 1000) 

  resetQuestionUI()
  draw() 
}


function update() {
  if (!gameRunning || questionActive) return


  if (rainbowMode) {
    rainbowHue = (rainbowHue + 2) % 360
  }

  createTrailParticles()


  updateTrailParticles()
  updateFoodParticles()
  updateScoreAnimations()
  updateScreenShake()
  updateLightningEffect()
  updateFireflies()

  
  if (powerUpPosition.x || powerUpPosition.y) {
    updatePowerUp()
  }


  if (powerUpActive) {
    updatePowerUpTimer()
  }

  updateMouthAnimation()


  if (isPulsing) {
    growthPulse += 0.1
    if (growthPulse >= Math.PI) {
      isPulsing = false
      growthPulse = 0
    }
  }

  direction = nextDirection
  const newHead = { ...snake[0] }

  switch (direction) {
    case "right":
      newHead.x += gridSize
      break
    case "left":
      newHead.x -= gridSize
      break
    case "up":
      newHead.y -= gridSize
      break
    case "down":
      newHead.y += gridSize
      break
  }

  if (
    newHead.x >= canvas.width ||
    newHead.x < 0 ||
    newHead.y >= canvas.height ||
    newHead.y < 0 ||
    ((!powerUpActive || powerUpType !== "invincible") &&
      snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y))
  ) {
    gameOver()
    return
  }

  snake.unshift(newHead)


  if (newHead.x === food.x && newHead.y === food.y) {
    score++
    scoreText.textContent = `SCORE: ${score}`
    lastFoodEatenTime = Date.now()

    playSound(eatingSound)


    snakeSpeed = Math.min(maxSnakeSpeed, snakeSpeed + speedIncreasePerFood)


    createFoodParticles()


    createScoreAnimation(1, food.x + gridSize / 2, food.y)

    createScreenShake(5, 200)

    isPulsing = true
    growthPulse = 0

    checkMathQuestion()
    generateFood()
  } else {
    snake.pop()
  }
}

function draw() {

  if (screenShake.active) {
    updateScreenShake()
  } else {
    canvas.style.transform = "translate(0, 0)"
  }


  if (isHurting) {
    ctx.fillStyle = "#ff0000"
    ctx.globalAlpha = 0.2
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = 1.0
   
    const canvasBorder = document.querySelector(".canvas-border"); // Check if it exists
    if (canvasBorder) {
        canvasBorder.style.transform = "none";
    }
  }

  // Use rockyTexture for the background
  if (rockyTexture) {
    ctx.fillStyle = rockyTexture;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    // Fallback if rockyTexture is somehow not created (e.g., if createRockyTexture was removed)
    ctx.fillStyle = "#2a623d"; // Default fallback color
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  drawFireflies()


  ctx.strokeStyle = "rgba(150, 130, 100, 0.2)"
  ctx.lineWidth = 0.5
  for (let x = 0; x <= canvas.width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvas.height)
    ctx.stroke()
  }
  for (let y = 0; y <= canvas.height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.stroke()
  }


  ctx.strokeStyle = "#5a3a20"
  ctx.lineWidth = 8
  ctx.strokeRect(0, 0, canvas.width, canvas.height)


  drawTrailParticles()


  ctx.lineJoin = "round"
  ctx.lineCap = "round"
  ctx.lineWidth = gridSize

  let gradient
  if (rainbowMode) {
    gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < 6; i++) {
      gradient.addColorStop(i / 6, `hsl(${(rainbowHue + i * 60) % 360}, 100%, 60%)`)
    }
  } else {
    gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "#6aff6a")
    gradient.addColorStop(1, "#00cc66")
  }

  ctx.strokeStyle = rainbowMode ? "#333333" : "#007744"
  ctx.lineWidth = gridSize + 4
  ctx.beginPath()
  ctx.moveTo(snake[0].x + gridSize / 2 + snakeShakeOffset.x, snake[0].y + gridSize / 2 + snakeShakeOffset.y)
  for (let i = 1; i < snake.length; i++) {
    // let bulgeEffect = 0; if (isSwallowing) { const distanceFromBulge = Math.abs(i - swallowBulgePosition); if (distanceFromBulge < 2) bulgeEffect = Math.max(0, 6 * (1 - distanceFromBulge / 2)); }
    // let pulseEffect = 0; if (isPulsing) pulseEffect = Math.sin(growthPulse) * 3;
    // const totalEffect = bulgeEffect + pulseEffect; // totalEffect was unused here
    ctx.lineTo(snake[i].x + gridSize / 2 + snakeShakeOffset.x, snake[i].y + gridSize / 2 + snakeShakeOffset.y)
  }
  ctx.stroke()


  ctx.strokeStyle = gradient
  ctx.lineWidth = gridSize
  ctx.beginPath()
  ctx.moveTo(snake[0].x + gridSize / 2 + snakeShakeOffset.x, snake[0].y + gridSize / 2 + snakeShakeOffset.y)
  for (let i = 1; i < snake.length; i++) {
    // let bulgeEffect = 0; if (isSwallowing) { const distanceFromBulge = Math.abs(i - swallowBulgePosition); if (distanceFromBulge < 2) bulgeEffect = Math.max(0, 6 * (1 - distanceFromBulge / 2)); }
    // let pulseEffect = 0; if (isPulsing) pulseEffect = Math.sin(growthPulse) * 3;
    // const totalEffect = bulgeEffect + pulseEffect; // totalEffect was unused here
    ctx.lineTo(snake[i].x + gridSize / 2 + snakeShakeOffset.x, snake[i].y + gridSize / 2 + snakeShakeOffset.y)
  }
  ctx.stroke()

  ctx.fillStyle = "#009955"
  for (let i = 1; i < snake.length; i++) {
    const segment = snake[i]
    let bulgeEffect = 0; if (isSwallowing) { const distanceFromBulge = Math.abs(i - swallowBulgePosition); if (distanceFromBulge < 2) bulgeEffect = Math.max(0, 6 * (1 - distanceFromBulge / 2)); }
    let pulseEffect = 0; if (isPulsing) pulseEffect = Math.sin(growthPulse) * 3;
    const totalEffect = bulgeEffect + pulseEffect

    if (i % 2 === 0) {
      ctx.fillStyle = rainbowMode ? `hsl(${(rainbowHue + i * 20) % 360}, 70%, 30%)` : "#007744"
      ctx.beginPath()
      ctx.arc( segment.x + gridSize / 2 + snakeShakeOffset.x, segment.y + gridSize / 2 + snakeShakeOffset.y, gridSize / 6 + 2 + totalEffect, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = rainbowMode ? `hsl(${(rainbowHue + i * 20) % 360}, 100%, 50%)` : "#009955"
      ctx.beginPath()
      ctx.arc( segment.x + gridSize / 2 + snakeShakeOffset.x, segment.y + gridSize / 2 + snakeShakeOffset.y, gridSize / 6 + totalEffect, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const head = snake[0]
  // const headDeformation = mouthProgress * 0.5; // Unused
  let wobbleOffset = 0
  if (mouthState === "eating") {
    wobbleOffset = Math.sin(headWobblePhase) * 3
  }


  ctx.fillStyle = rainbowMode ? "#333333" : "#007744"
  ctx.beginPath()

  const centerX = head.x + gridSize / 2 + snakeShakeOffset.x
  const centerY = head.y + gridSize / 2 + snakeShakeOffset.y + wobbleOffset
  const baseRadius = gridSize / 1.5 + 2 

  if (mouthState === "closed") {
    ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2)
  } else {
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.beginPath()
    ctx.arc(0, 0, baseRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.rotate(jawRotation * jawOpenAmount)
    const jawHeight = baseRadius * 0.7 * jawOpenAmount
    const jawWidth = baseRadius * (1 + 0.3 * jawOpenAmount)
    ctx.beginPath()
    ctx.ellipse(0, jawHeight / 2, jawWidth, jawHeight, 0, 0, Math.PI)
    ctx.fill()
    ctx.restore()
  }
  ctx.fill()

  ctx.fillStyle = rainbowMode ? `hsl(${rainbowHue}, 100%, 50%)` : "#00cc66"
  ctx.beginPath()

  const mainRadius = gridSize / 1.5

  if (mouthState === "closed") {
    ctx.arc(centerX, centerY, mainRadius, 0, Math.PI * 2)
  } else {
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.beginPath()
    ctx.arc(0, 0, mainRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.rotate(jawRotation * jawOpenAmount)
    const jawHeight = mainRadius * 0.7 * jawOpenAmount
    const jawWidth = mainRadius * (1 + 0.3 * jawOpenAmount)
    ctx.beginPath()
    ctx.ellipse(0, jawHeight / 2, jawWidth, jawHeight, 0, 0, Math.PI)
    ctx.fill()
    if (tongueOut) {
      const tongueLength = mainRadius * (0.8 + 0.2 * Math.sin(tongueAnimationPhase))
      const tongueSplit = tongueLength / 3
      ctx.fillStyle = "#ff6666"
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(tongueLength, -tongueSplit)
      ctx.lineTo(tongueLength, tongueSplit)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = "#ff99aa"
      ctx.beginPath()
      ctx.arc(tongueLength, -tongueSplit, 3, 0, Math.PI * 2)
      ctx.arc(tongueLength, tongueSplit, 3, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }
  ctx.fill()

  let eyeOffsetX = 0, eyeOffsetY = wobbleOffset
  let pupilOffsetX = 0, pupilOffsetY = 0
  switch (direction) {
    case "right": eyeOffsetX = gridSize / 3 - (gridSize / 10) * mouthProgress; pupilOffsetX = gridSize / 8; break;
    case "left": eyeOffsetX = -gridSize / 3 + (gridSize / 10) * mouthProgress; pupilOffsetX = -gridSize / 8; break;
    case "up": eyeOffsetY = -gridSize / 3 + (gridSize / 10) * mouthProgress + wobbleOffset; pupilOffsetY = -gridSize / 8; break;
    case "down": eyeOffsetY = gridSize / 3 - (gridSize / 10) * mouthProgress + wobbleOffset; pupilOffsetY = gridSize / 8; break;
  }

  const eyeSize = gridSize / 3
  ctx.fillStyle = "white"
  ctx.beginPath()
  ctx.arc( head.x + gridSize / 3 + eyeOffsetX + snakeShakeOffset.x, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y, eyeSize, 0, Math.PI * 2,)
  ctx.arc( head.x + (2 * gridSize) / 3 + eyeOffsetX + snakeShakeOffset.x, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y, eyeSize, 0, Math.PI * 2,)
  ctx.fill()

  ctx.strokeStyle = "rgba(0,0,0,0.1)"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc( head.x + gridSize / 3 + eyeOffsetX + snakeShakeOffset.x, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y, eyeSize, 0, Math.PI * 2,)
  ctx.arc( head.x + (2 * gridSize) / 3 + eyeOffsetX + snakeShakeOffset.x, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y, eyeSize, 0, Math.PI * 2,)
  ctx.stroke()

  const pupilSize = eyeSize / 1.5
  ctx.fillStyle = "#222"
  ctx.beginPath()

  if (isDead) {
    ctx.moveTo( head.x + gridSize / 3 + eyeOffsetX + snakeShakeOffset.x - pupilSize / 2, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y - pupilSize / 2,)
    ctx.lineTo( head.x + gridSize / 3 + eyeOffsetX + snakeShakeOffset.x + pupilSize / 2, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y + pupilSize / 2,)
    ctx.moveTo( head.x + gridSize / 3 + eyeOffsetX + snakeShakeOffset.x + pupilSize / 2, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y - pupilSize / 2,)
    ctx.lineTo( head.x + gridSize / 3 + eyeOffsetX + snakeShakeOffset.x - pupilSize / 2, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y + pupilSize / 2,)
    ctx.moveTo( head.x + (2 * gridSize) / 3 + eyeOffsetX + snakeShakeOffset.x - pupilSize / 2, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y - pupilSize / 2,)
    ctx.lineTo( head.x + (2 * gridSize) / 3 + eyeOffsetX + snakeShakeOffset.x + pupilSize / 2, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y + pupilSize / 2,)
    ctx.moveTo( head.x + (2 * gridSize) / 3 + eyeOffsetX + snakeShakeOffset.x + pupilSize / 2, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y - pupilSize / 2,)
    ctx.lineTo( head.x + (2 * gridSize) / 3 + eyeOffsetX + snakeShakeOffset.x - pupilSize / 2, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y + pupilSize / 2,)
    ctx.stroke()
  } else {
    ctx.arc( head.x + gridSize / 3 + eyeOffsetX + snakeShakeOffset.x + pupilOffsetX, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y + pupilOffsetY, pupilSize, 0, Math.PI * 2,)
    ctx.arc( head.x + (2 * gridSize) / 3 + eyeOffsetX + snakeShakeOffset.x + pupilOffsetX, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y + pupilOffsetY, pupilSize, 0, Math.PI * 2,)
    ctx.fill()
    const highlightSize = pupilSize / 2
    ctx.fillStyle = "white"
    ctx.beginPath()
    ctx.arc( head.x + gridSize / 3 + eyeOffsetX + snakeShakeOffset.x + pupilOffsetX + highlightSize / 2, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y + pupilOffsetY - highlightSize / 2, highlightSize, 0, Math.PI * 2,)
    ctx.arc( head.x + (2 * gridSize) / 3 + eyeOffsetX + snakeShakeOffset.x + pupilOffsetX + highlightSize / 2, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y + pupilOffsetY - highlightSize / 2, highlightSize, 0, Math.PI * 2,)
    ctx.fill()
  }

  ctx.strokeStyle = "#007744"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo( head.x + gridSize / 3 + eyeOffsetX + snakeShakeOffset.x - eyeSize / 2, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y - eyeSize,)
  ctx.quadraticCurveTo( head.x + gridSize / 3 + eyeOffsetX + snakeShakeOffset.x, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y - eyeSize - 3, head.x + gridSize / 3 + eyeOffsetX + snakeShakeOffset.x + eyeSize / 2, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y - eyeSize,)
  ctx.moveTo( head.x + (2 * gridSize) / 3 + eyeOffsetX + snakeShakeOffset.x - eyeSize / 2, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y - eyeSize,)
  ctx.quadraticCurveTo( head.x + (2 * gridSize) / 3 + eyeOffsetX + snakeShakeOffset.x, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y - eyeSize - 3, head.x + (2 * gridSize) / 3 + eyeOffsetX + snakeShakeOffset.x + eyeSize / 2, head.y + gridSize / 3 + eyeOffsetY + snakeShakeOffset.y - eyeSize,)
  ctx.stroke()

  const foodPulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.8
  const foodGlow = ctx.createRadialGradient( food.x + gridSize / 2, food.y + gridSize / 2, 0, food.x + gridSize / 2, food.y + gridSize / 2, gridSize * 1.5 * foodPulse,)
  foodGlow.addColorStop(0, "rgba(255, 255, 100, 0.6)")
  foodGlow.addColorStop(1, "rgba(255, 255, 100, 0)")
  ctx.fillStyle = foodGlow
  ctx.beginPath()
  ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize * 1.5 * foodPulse, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = "#ff3333"
  ctx.beginPath()
  ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 2, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = "#33ff33"
  ctx.beginPath()
  ctx.moveTo(food.x + gridSize / 2, food.y + gridSize / 4)
  ctx.lineTo(food.x + gridSize / 1.5, food.y)
  ctx.lineTo(food.x + gridSize / 3, food.y)
  ctx.closePath()
  ctx.fill()
 
  if (powerUpPosition.x || powerUpPosition.y) {
    drawPowerUp()
  }


  drawFoodParticles()


  drawScoreAnimations()

  drawLightningEffect()


  if (powerUpActive) {
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 16px Arial"
    ctx.textAlign = "center"
    ctx.fillText(`${powerUpType.toUpperCase()}: ${Math.ceil(powerUpTimeLeft)}s`, canvas.width / 2, 30)
  }


  if (powerUpActive && powerUpType === "invincible") {
    const shieldPulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.8
    ctx.strokeStyle = `rgba(0, 204, 255, ${shieldPulse})`
    ctx.lineWidth = 3

    for (let i = 0; i < snake.length; i++) {
      const segment = snake[i]
      ctx.beginPath()
      ctx.arc( segment.x + gridSize / 2 + snakeShakeOffset.x, segment.y + gridSize / 2 + snakeShakeOffset.y, gridSize / 1.5 + 5, 0, Math.PI * 2,)
      ctx.stroke()
    }
  }
}

function startGameLoop() {
  clearInterval(interval)
  gameRunning = true
  interval = setInterval(() => {
    update()
    draw()
  }, 100)
}


function resetGame() {
  document.body.classList.remove("game-over-active")
  gameOverScreen.classList.remove("show")
  setTimeout(() => {
    gameOverScreen.style.display = "none"
  }, 500)

  snake = [
    { x: 240, y: 240 },
    { x: 220, y: 240 },
    { x: 200, y: 240 },
  ]
  direction = "right"
  nextDirection = "right"
  score = 0
  scoreText.textContent = "SCORE: 0"
  gameRunning = true
  isDead = false
  questionActive = false
  mouthState = "closed"
  mouthProgress = 0
  lives = 3
  isHurting = false
  snakeShakeOffset = { x: 0, y: 0 }
  foodParticles = []
  trailParticles = []
  scoreAnimations = []
  isSwallowing = false
  isPulsing = false
  rainbowMode = false
  powerUpActive = false
  powerUpPosition = { x: 0, y: 0 }

  updateHeartsDisplay()
  resetQuestionUI()
  clearInterval(countdownInterval)
  clearInterval(timerInterval)

  snakeSpeed = 1.0

  
  if (soundEnabled) {
    bgMusic.currentTime = 0
    bgMusic.play().catch((error) => {
      console.log("Audio play error:", error)
    })
  }

  generateFood()
  startGameLoop()
}


function goBack() {
  window.location.href = "../geometry.html" 
}

window.addEventListener("keydown", (e) => {
  if (!gameRunning) return
  if (questionActive) return
  if ((e.key === "ArrowRight" || e.key === "d") && direction !== "left") nextDirection = "right"
  if ((e.key === "ArrowLeft" || e.key === "a") && direction !== "right") nextDirection = "left"
  if ((e.key === "ArrowUp" || e.key === "w") && direction !== "down") nextDirection = "up"
  if ((e.key === "ArrowDown" || e.key === "s") && direction !== "up") nextDirection = "down"
})

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".choice1").addEventListener("click", () => {
    if (questionActive) {
      checkAnswer(choice1Text.textContent)
    }
  })
  document.querySelector(".choice2").addEventListener("click", () => {
    if (questionActive) {
      checkAnswer(choice2Text.textContent)
    }
  })
  document.querySelector(".choice3").addEventListener("click", () => {
    if (questionActive) {
      checkAnswer(choice3Text.textContent)
    }
  })
  document.querySelector(".choice4").addEventListener("click", () => {
    if (questionActive) {
      checkAnswer(choice4Text.textContent)
    }
  })

  backButton.addEventListener("click", (e) => {
    const currentTime = new Date().getTime()
    const tapLength = currentTime - lastTapTime
    if (tapLength < doubleTapDelay && tapLength > 0) {

      e.preventDefault()
      console.log("Double tap prevented")
    } else {
   
      goBack()
    }
    lastTapTime = currentTime
  })

  restartBtn.addEventListener("click", resetGame)


  touchUp.addEventListener("touchstart", () => {
    if (!gameRunning || questionActive) return
    if (direction !== "down") nextDirection = "up"
  })

  touchDown.addEventListener("touchstart", () => {
    if (!gameRunning || questionActive) return
    if (direction !== "up") nextDirection = "down"
  })

  touchLeft.addEventListener("touchstart", () => {
    if (!gameRunning || questionActive) return
    if (direction !== "right") nextDirection = "left"
  })

  touchRight.addEventListener("touchstart", () => {
    if (!gameRunning || questionActive) return
    if (direction !== "left") nextDirection = "right"
  })

  let resizeTimeout
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      resizeCanvas()

      if (gameRunning && snake && snake.length > 0) { // Added null check for snake
        const maxX = Math.floor(canvas.width / gridSize) * gridSize - gridSize
        const maxY = Math.floor(canvas.height / gridSize) * gridSize - gridSize

        for (let i = 0; i < snake.length; i++) {
          snake[i].x = Math.min(snake[i].x, maxX)
          snake[i].y = Math.min(snake[i].y, maxY)
        }
      }
    }, 100)
  })

  for (let i = 0; i < 5; i++) {
    createAmbientParticles()
    createLeafParticle()
    createFirefly()
  }

  let touchStartX = 0
  let touchStartY = 0

  canvas.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
    },
    false,
  )

  canvas.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault()
    },
    false,
  )

  canvas.addEventListener(
    "touchend",
    (e) => {
      if (!gameRunning || questionActive) return

      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY

      const diffX = touchEndX - touchStartX
      const diffY = touchEndY - touchStartY

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0 && direction !== "left") {
          nextDirection = "right"
        } else if (diffX < 0 && direction !== "right") {
          nextDirection = "left"
        }
      } else {
        if (diffY > 0 && direction !== "up") {
          nextDirection = "down"
        } else if (diffY < 0 && direction !== "down") {
          nextDirection = "up"
        }
      }
    },
    false,
  )

  document.querySelectorAll(".choice, #restart-btn, #back-button").forEach((button) => {
    button.addEventListener("mouseenter", () => {
      button.style.transform = "scale(1.1)"
    })

    button.addEventListener("mouseleave", () => {
      button.style.transform = "scale(1)"
    })

    button.addEventListener("mousedown", () => {
      button.style.transform = "scale(0.95)"
    })

    button.addEventListener("mouseup", () => {
      button.style.transform = "scale(1.1)"
    })
  })

  document.querySelectorAll(".choice, #restart-btn, #back-button, #sound-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      playSound(clickSound)
    })
  })

  window.addEventListener("blur", () => {
    if (soundEnabled) {
      bgMusic.pause()
      tickingSound.pause()
    }
  })

  window.addEventListener("focus", () => {
    if (soundEnabled && gameRunning && !questionActive) {
      bgMusic.play().catch((error) => console.log("Audio play error:", error))
    }
  })

  resizeCanvas()
  generateFood()
  updateHeartsDisplay()
  startGameLoop()
})

generateFood()
updateHeartsDisplay()
startGameLoop()