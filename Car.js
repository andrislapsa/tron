export const BLOCK_SIZE = 20
export const MOVEMENT_SIZE = 5
const BOUNDARY_PADDING = MOVEMENT_SIZE - 4

const movementMatrix = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
}

export class Car {
  trail = []
  x = 0
  y = 0
  color = 'grey'
  direction = null
  directionsQueue = []
  WIDTH = 0
  HEIGHT = 0
  blocksToRender = []
  crashed = false

  isInTurbo = false

  constructor({ direction, color, x, y, WIDTH, HEIGHT }) {
    this.color = color
    this.direction = direction
    this.x = x
    this.y = y
    this.WIDTH = WIDTH
    this.HEIGHT = HEIGHT
    this.startingPosition = {
      x: this.x,
      y: this.y,
      direction: this.direction,
      color: this.color,
    }
  }

  changeDirection(direction) {
    
    const oldDirection = this.direction

    switch (direction) {
      case 'left' :
        if (this.direction === 'right') break
        this.direction = 'left'
        break
      case 'right' :
        if (this.direction === 'left') break
        this.direction = 'right'
        break
      case 'up' :
        if (this.direction === 'down') break
        this.direction = 'up'
        break
      case 'down' :
        if (this.direction === 'up') break
        this.direction = 'down'
        break
    }

    if (this.direction !== oldDirection) {
      const audio = new Audio(`./turn_${this.color}.m4a`)
      audio.play()
    }

    this.directionsQueue.push({ ...movementMatrix[this.direction], direction: this.direction })

  }

  collidesWithSelf() {
    if (this.x < -BOUNDARY_PADDING) return true
    if (this.y < -BOUNDARY_PADDING) return true

    if (this.x > this.WIDTH + BOUNDARY_PADDING) return true
    if (this.y > this.HEIGHT + BOUNDARY_PADDING) return true

    return this.collides(this.x, this.y)
  }

  // collidesWithTrail(x, y) {
  //   return trail.find(({ x, y }) => this.collides(x, y))
  // }

  collides(x, y, addEndTrail = false) {
    const trail = addEndTrail ? [...this.trail, {
      x: this.x,
      y: this.y,
      direction: this.direction,
      color: this.color,
    }] : this.trail
    let previousPosition = this.startingPosition
    return trail.find((position, index) => {
      let collides = false
      // if (index === this.trail.length - 1) {
      //   return
      // }

      if (x === position.x && x === previousPosition.x) {
        // debugger

        // console.log('x matches', { x,y}, { position, previousPosition })
        if (previousPosition.direction === 'down') {
          if (y >= previousPosition.y && y <= position.y) {
            // console.log('collides with prev', previousPosition.direction)
            collides = true
          }
        }

        if (previousPosition.direction === 'up') {
          if (y <= previousPosition.y && y >= position.y) {
            // console.log('collides with prev', previousPosition.direction)
            collides = true
          }
        }

      }

      if (y === position.y && y === previousPosition.y) {
        // debugger

        // console.log('y matches', { x,y}, { position, previousPosition })
        if (previousPosition.direction === 'right') {
          if (x >= previousPosition.x && x <= position.x) {
            // console.log('collides with prev', previousPosition.direction)
            collides = true
          }
        }

        if (previousPosition.direction === 'left') {
          if (x <= previousPosition.x && x >= position.x) {
            // console.log('collides with prev', previousPosition.direction)
            collides = true
          }
        }

      }


      previousPosition = position
      return collides
      // return position.x === x && position.y === y
    })
  }

  turbo(otherPlayers) {    
    if (this.isInTurbo) return

    let n = 15
    this.isInTurbo = true

    var audio = new Audio('./turbo.m4a');
    audio.play();

    const a = setInterval(() => {
      n--
      if (n === 0) {
        clearInterval(a)
        this.isInTurbo = false
      }
      const newBlock = this.move()

      const collidedWithOtherPlayers = otherPlayers.find((otherPlayer, idx) => {
        return otherPlayer.collides(this.x, this.y, true)
      })

      if (collidedWithOtherPlayers) {
        this.crashed = true
        clearInterval(a)
      }

      this.blocksToRender.push(newBlock)
    }, 10)
  }

  move() {
    const movement = this.directionsQueue.shift() || movementMatrix[this.direction]
    const { x, y } = movement

    if (movement.direction) {
      this.trail.push({
        x: this.x,
        y: this.y,
        direction: movement.direction || this.direction,
        color: this.color,
      })
    }

    this.x += x * MOVEMENT_SIZE
    this.y += y * MOVEMENT_SIZE

    if (this.collidesWithSelf()) {
      this.crashed = true
    }

    const newPosition = {
      x: this.x,
      y: this.y,
      direction: movement.direction || this.direction,
      color: this.color,
    }

    // this.trail.push(newPosition)
    this.blocksToRender.push(newPosition)

    return newPosition
  }
}
