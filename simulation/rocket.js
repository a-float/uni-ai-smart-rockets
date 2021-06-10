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
                frictionAir: 0.05
            })
            this.body.collisionFilter = colFilters.rocket         
        }

        /**
         * Advances to the next genom and apllies it's acceleration
         * @returns True if the whole genom has been traversed => the rocket is pretty much done
         */
        advance () {
            this.currentGeneIndex += 1
            if (this.currentGeneIndex === this.genome.length-1) {
                return true // rocket is done
            }
            else {
                return false // rocket rocket is not done yet
            }
        }
        
        /**
         * Apply the current gene acceleration steering
         */
        updateAcceleration(){
            const tipPos = Vector.add(
                this.body.position, 
                Vector.rotate({ x: 0, y: this.size*0.1 }, this.body.angle))
                
            Matter.Body.applyForce(
                this.body, 
                tipPos,
                Vector.mult(this.genome[this.currentGeneIndex], 5e-6))
        }

        updateScore(target, walls, obstacles){
            // hit a wall
            for(const wall of walls){
                if(Matter.SAT.collides(this.body, wall.body).collided){
                    this.score -= 3
                }
            }
            // hit an obstacle
            for(const obstacle of obstacles){
                if(Matter.SAT.collides(this.body, obstacle.body).collided){
                    this.score -= 1
                }
            }
            // reached the target
            const distToTarget = Vector.magnitudeSquared(this.body.position, target.body.position)
            if( distToTarget < target.radius**2){
                this.score += 10
                console.log("near the target!")
            }
            // how close to the target
            this.score -= distToTarget / 1e6
        }
    }
    return Rocket.prototype.constructor
})
