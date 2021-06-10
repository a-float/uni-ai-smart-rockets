'use strict'

define('target', ['collisionFilters'], (colFilters) => {
    class Target {
        constructor (x, y, r=20) {
            this.body = Matter.Bodies.circle(x, y, r, { isStatic: true })
            this.radius = r
            this.body.collisionFilter = colFilters.target
        }
    }
    return Target.prototype.constructor
})
