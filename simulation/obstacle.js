'use strict'

define('obstacle', ['collisionFilters'], (colFilters) => {
    class Obstacle {
        constructor (x, y, w, h) {
            this.body = Matter.Bodies.rectangle(x, y, w, h, { 
                isStatic: true, 
                render: {fillStyle: '#063e7b'}
            })
            this.width = w
            this.height = h

            this.body.collisionFilter = colFilters.obstacle
        }
    }
    return Obstacle.prototype.constructor
})
