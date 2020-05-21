import { Car, BLOCK_SIZE } from './Car.js'

const FPS = 60
const WASD_FOR_FIRST_PLAYER = true

// alert(FPS)

const timestamp = () => performance.now()
var now,
    dt   = 0,
    last = timestamp(),
    step = 1 / FPS

const blocksToRender = []
const directionsQueue = []


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

let gameOver = false
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
}

const getNewPlayers = ({ WIDTH, HEIGHT }) => {
  gameOver = false
  gameoverEl.classList.remove('visible')
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

function update(ts) {
  // console.log('update called', ts)
  if (paused) return

  players.forEach((player, playerIndex) => {
    if (gameOver) {
      console.log('game over')
      return
    }

    const newBlock = player.move()
    const otherPlayers = players.filter((_, index) => index !== playerIndex)

    const otherPlayerIndex = playerIndex === 0 ? 1 : 0
    const collidedWithOtherPlayers = otherPlayers.find((otherPlayer, idx) => {
      return otherPlayer.collides(player.x, player.y)
    })

    // console.log('player', { player, otherPlayers })

    const collidedWithSelf = player.collidesWithSelf()
    if (collidedWithSelf || collidedWithOtherPlayers) {
      // debugger
      if (collidedWithSelf) updateScore(otherPlayerIndex, 1)
      if (collidedWithOtherPlayers) updateScore(playerIndex, 1)
      // debugger
      console.log('uh oh!!!')
      gameOver = true
      gameoverEl.classList.add('visible')
      var audio = new Audio('./gameover.m4a');
      audio.play();
    } else {
      blocksToRender.push(newBlock)
    }
  })

  // console.log('blocksToRenxder', [...blocksToRender])
}

function render(ts) {
  // console.log('render called', ts)
  let block
  players.forEach((player) => {
    const blocksToRender = player.blocksToRender

    while ((block = blocksToRender.pop())) {
      let { x, y, color } = block
      // if (color === 'red')
      // console.log('rendering block', {...block})

      ctx.beginPath()
      ctx.fillStyle = color === 'blue' ? 'rgba(0, 0, 255, .5)' : 'rgba(255, 0, 0, .3)'

      let blockWidth = BLOCK_SIZE - 2
      let blockHeight = BLOCK_SIZE - 2

      // if (block.direction === 'right' || block.direction === 'left') {
      //   blockWidth += 2
      // }

      // if (block.direction === 'up' || block.direction === 'down') {
      //   blockHeight += 2
      // }

      // if (block.direction === 'up') {
      //   x += 2
      // }

      // if (block.direction === 'left') {
      //   x += 2
      // }

      // if (block.direction === 'down') {
      //   x += 2
      //   y -= 2
      // }

      // if (block.direction === 'right') {
      //   x -= 2
      // }

      ctx.arc(x, y, blockWidth - 4, 0, 2 * Math.PI)
      ctx.fill()
      ctx.closePath()

      // ctx.fillRect(x, y, blockWidth, blockHeight)
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

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('canvas')
  gameoverEl = document.querySelector('#gameover')
  const PADDING = 200

  // canvas.width = 800 // window.innerWidth - PADDING
  // canvas.height = 800 // window.innerHeight - PADDING
  const ctx = canvas.getContext('2d')
  const WIDTH = canvas.width
  const HEIGHT = canvas.height
  window.ctx = ctx

  players = getNewPlayers({ WIDTH, HEIGHT })
  window._players = players
  requestAnimationFrame(frame)

  window.addEventListener('keydown', ({ key }) => {
    // console.log('keydown', control)

    const control = controlsMapping[key.toLowerCase()]

    if (control && !gameOver) {
      const { direction, playerIndex } = control
      const player = players[playerIndex]

      if (player.direction === direction) {
        player.turbo()
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
        paused = !paused
        break
    }
  })
})


