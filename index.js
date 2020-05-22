import { Car, BLOCK_SIZE, MOVEMENT_SIZE } from './Car.js'

const FPS = 60
const WASD_FOR_FIRST_PLAYER = true

const timestamp = () => performance.now()
let now,
    dt   = 0,
    last = timestamp(),
    step = 1 / FPS

const controlsMapping = {
  arrowup: { direction: 'up', playerIndex: WASD_FOR_FIRST_PLAYER ? 1 : 0 },
  arrowleft: { direction: 'left', playerIndex: WASD_FOR_FIRST_PLAYER ? 1 : 0 },
  arrowdown: { direction: 'down', playerIndex: WASD_FOR_FIRST_PLAYER ? 1 : 0 },
  arrowright: { direction: 'right', playerIndex: WASD_FOR_FIRST_PLAYER ? 1 : 0 },
  w: { direction: 'up', playerIndex: WASD_FOR_FIRST_PLAYER ? 0 : 1 },
  a: { direction: 'left', playerIndex: WASD_FOR_FIRST_PLAYER ? 0 : 1 },
  s: { direction: 'down', playerIndex: WASD_FOR_FIRST_PLAYER ? 0 : 1 },
  d: { direction: 'right', playerIndex: WASD_FOR_FIRST_PLAYER ? 0 : 1 },
}

let gameOver = true
let paused = false

const scores = [
  { el: document.querySelector('#score .blue'), score: 0 },
  { el: document.querySelector('#score .red'), score: 0 },
]
function updateScore(playerIndex, score) {
  const playerScore = scores[playerIndex]
  const newScore = playerScore.score + score
  playerScore.el.innerHTML = newScore
  playerScore.score = newScore
  gameoverEl.className = players[playerIndex].color
}

const getNewPlayers = ({ WIDTH, HEIGHT }) => {
  gameOver = false
  gameoverEl.classList.remove('visible')
  introEl.classList.remove('visible')
  const STARTING_X_OFFSET = 40

  return [
    new Car({
      color: 'blue',
      direction: 'right',
      x: STARTING_X_OFFSET,
      y: Math.floor(HEIGHT / 2),
      WIDTH,
      HEIGHT,
    }),
    new Car({
      color: 'red',
      direction: 'left',
      x: WIDTH - STARTING_X_OFFSET,
      y: Math.floor(HEIGHT / 2),
      WIDTH,
      HEIGHT,
    }),
  ]
}

const getOtherPlayers = (playerIndex) =>
  players.filter((_, index) => index !== playerIndex)

function endGame() {
  gameOver = true
  gameoverEl.classList.add('visible')

  const audio = new Audio('./gameover.m4a')
  audio.play()
}

function update(ts) {
  if (paused) return

  players.forEach((player, playerIndex) => {
    if (gameOver) {
      return
    }

    const newBlock = player.move()
    const otherPlayers = getOtherPlayers(playerIndex)

    const otherPlayerIndex = playerIndex === 0 ? 1 : 0
    const collidedWithOtherPlayers = otherPlayers.find((otherPlayer, idx) => {
      return otherPlayer.collides(player.x, player.y, true)
    })

    if (collidedWithOtherPlayers) {
      updateScore(otherPlayerIndex, 1)
      endGame()
    }

    if (player.crashed) {
      updateScore(otherPlayerIndex, 1)
      endGame()      
    }
  })
}

function render(ts) {
  let block
  players.forEach((player) => {
    const blocksToRender = player.blocksToRender

    while ((block = blocksToRender.pop())) {
      let { x, y, color } = block

      ctx.beginPath()
      ctx.fillStyle = color === 'blue' ?
        'rgba(0, 0, 255, .5)' :
        'rgba(255, 0, 0, .3)'

      let blockWidth = BLOCK_SIZE - 2
      let blockHeight = BLOCK_SIZE - 2

      ctx.arc(x, y, 10, 0, 2 * Math.PI)
      ctx.fill()
      ctx.closePath()
    }
  })
}

function frame() {
  now = timestamp()
  dt = dt + Math.min(1, (now - last) / 1000)
  while (dt > step) {
    dt = dt - step
    update(step)
  }
  render(dt)
  last = now
  requestAnimationFrame(frame)
}

let players = []
let gameoverEl
let introEl

function getCanvasSize() {
  const PADDING = 200

  let width = window.innerWidth - PADDING
  let height = window.innerHeight - PADDING / 2

  width -= width % MOVEMENT_SIZE
  height -= height % MOVEMENT_SIZE

  return { width, height }
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('canvas')
  gameoverEl = document.querySelector('#gameover')
  introEl = document.querySelector('#intro')

  const canvasSize = getCanvasSize()
  canvas.width = canvasSize.width
  canvas.height = canvasSize.height
  const ctx = canvas.getContext('2d')
  const WIDTH = canvas.width
  const HEIGHT = canvas.height
  window.ctx = ctx

  window._players = players
  requestAnimationFrame(frame)

  window.addEventListener('keydown', ({ key }) => {
    const control = controlsMapping[key.toLowerCase()]

    if (control && !gameOver && !paused) {
      const { direction, playerIndex } = control
      const player = players[playerIndex]
      const otherPlayers = getOtherPlayers(playerIndex)

      if (player.direction === direction) {
        player.turbo(otherPlayers)
      }

      player.changeDirection(direction)
    }

    switch (key.toLowerCase()) {
      case 'r' :
        ctx.clearRect(0, 0, WIDTH, HEIGHT)
        players = getNewPlayers({ WIDTH, HEIGHT })
        window._players = players
        break

      case 'p' :
        if (gameOver) return
        paused = !paused
        canvas.classList.toggle('paused')
        break
    }
  })
})


