'use strict'

define('rocket', ['collisionFilters'], (colFilters) => {
    const Vector = Matter.Vector
    class Rocket {
        constructor (pos, genome) {
            this.genome = genome
            this.score = 0 // used in evaulating fitness
            this.currentGeneIndex = 0
            this.size = 20
            const vertices = [
                { x: -this.size*0.33, y: 0 }, { x: 0, y: this.size }, { x: this.size*0.33, y: 0 }, { x: 0, y: this.size*0.20 }
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
                return true // rocket wants to continue
            } else {
                this.currentGeneIndex += 1
                const tipPos = Vector.add(this.body.position, Vector.rotate({ x: 0, y: this.size*0.1 }, this.body.angle))
                Matter.Body.applyForce(this.body, tipPos,
                    Vector.mult(this.genome[this.currentGeneIndex], 0.0005))
                return false // rocket doesn't want to continue, coz its out of genes
            }
        }

        updateScore(target, walls, obstacles){
            for(const wall of walls){
                if(Matter.SAT.collides(this.body, wall.body)){
                    this.score -= 1
                }
            }
            for(const obstacle of obstacles){
                if(Matter.SAT.collides(this.body, obstacle.body)){
                    this.score -= 1
                }
            }
            if(Vector.magnitudeSquared(this.body.position, target.body.position) < target.radius**2){
                this.score += 10
                console.log("near the target!")
            }
        }
    }
    return Rocket.prototype.constructor
})
