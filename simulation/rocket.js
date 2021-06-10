'use strict'

define('rocket', ['collisionFilters'], (colFilters) => {
    const Vector = Matter.Vector
    class Rocket {
        /**
         * first genome element is the starting velocity. Its magnitude is greater than the further accelerations
         */
        constructor (pos, genome) {
            this.genome = genome
            this.score = 0 // used in evaulating fitness
            this.currentGeneIndex = 0
            this.size = 20
            this.accMult = 1e-6
            const vertices = [
                { x: -this.size*0.33, y: 0 }, { x: 0, y: this.size }, { x: this.size*0.33, y: 0 }, { x: 0, y: this.size*0.20 }
            ]
            this.body = Matter.Body.create({
                position: pos,
                mass: 1e3, // allows to use bigger accMult
                inertia: 1e4, // makes the triangles not spin too much
                vertices: vertices,
                frictionAir: 0.05,
            })
            // this._applyForceToTheTip(this.genome[0], 1e-10)
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
        
        _applyForceToTheTip(vector, mult){
            const tipPos = Vector.add(
                this.body.position, 
                Vector.rotate({ x: 0, y: this.size*0.1 }, this.body.angle))
                
            Matter.Body.applyForce(
                this.body, 
                tipPos,
                Vector.mult(vector, mult))
        }

        /**
         * Apply the current gene acceleration steering
         */
        updateAcceleration(){
            this._applyForceToTheTip(this.genome[this.currentGeneIndex], this.accMult)
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
                this.score += 50
                console.log("on the target!")
            }
            // how close to the target
            this.score -= distToTarget / 1e6
        }

        /**
         * If the rocket finished at the target, give a massive score boost
         */
        evaluateFinish(target){
            const distToTarget = Vector.magnitudeSquared(this.body.position, target.body.position)
            if( distToTarget < target.radius**2){
                this.score += 1e4
            }
        }
    }
    return Rocket.prototype.constructor
})
