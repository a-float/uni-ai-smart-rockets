'use strict'

define('wall', () => {
    class Wall {
        constructor (x, y, w, h) {
            this.body = Matter.Bodies.rectangle(x, y, w, h, { isStatic: true })
            this.width = w
            this.height = h
        }
    }
    return Wall.prototype.constructor
})
