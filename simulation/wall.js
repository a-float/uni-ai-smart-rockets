'use strict'

define('wall', ['collisionFilters'], (colFilters) => {
    class Wall {
        constructor (x, y, w, h) {
            this.body = Matter.Bodies.rectangle(x, y, w, h, { isStatic: true })
            this.width = w
            this.height = h

            this.body.collisionFilter = colFilters.rocket               
        }
    }
    return Wall.prototype.constructor
})
