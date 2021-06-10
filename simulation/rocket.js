'use strict'

define('rocket', ['collisionFilters'], (colFilters) => {
    const Vector = Matter.Vector
    class Rocket {
        constructor (pos, genome) {
            this.genome = genome
            this.currentGeneIndex = 0
            const vertices = [
                { x: -10, y: 0 }, { x: 0, y: 30 }, { x: 10, y: 0 }, { x: 0, y: 5 }
            ]
            this.body = Matter.Body.create({
                position: pos,
                mass: 5e3,
                inertia: 1e5,
                vertices: vertices,
                frictionAir: 0.01
            })
            this.body.collisionFilter = colFilters.rocket         
        }

        /**
         * Advances to the next genom and apllies it's acceleration
         * @returns True if the whole genom has been traversed => the rocket is pretty much done
         */
        advance () {
            if (this.currentGeneIndex === this.genome.length - 1) {
                return true
            } else {
                this.currentGeneIndex += 1
                // console.log('rocket: apllying the force')
                const tipPos = Vector.add(this.body.position, Vector.rotate({ x: 0, y: 3 }, this.body.angle))
                Matter.Body.applyForce(this.body, tipPos,
                    Vector.mult(this.genome[this.currentGeneIndex], 0.0005))
            }
        }
    }
    return Rocket.prototype.constructor
})
