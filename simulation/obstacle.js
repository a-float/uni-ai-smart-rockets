'use strict'

define('obstacle', () => {
    class Obstacle {
        constructor (x, y, w, h) {
            this.body = Matter.Bodies.rectangle(x, y, w, h, { isStatic: false }) // for the lolz
            this.width = w
            this.height = h
        }
    }
    return Obstacle.prototype.constructor
})
