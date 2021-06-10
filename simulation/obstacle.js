'use strict'

define('obstacle', ['collisionFilters'], (colFilters) => {
    class Obstacle {
        constructor (x, y, w, h) {
            this.body = Matter.Bodies.rectangle(x, y, w, h, { isStatic: true })
            this.width = w
            this.height = h

            this.body.collisionFilter = colFilters.obstacle
        }
    }
    return Obstacle.prototype.constructor
})
