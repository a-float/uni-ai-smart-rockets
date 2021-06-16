'use strict'

define('rocket', ['collisionFilters'], (colFilters) => {
    const Vector = Matter.Vector;

    class Rocket {
        constructor(pos, genome) {
            this.genome = genome;
            this.score = 0; // used in evaulating fitness
            this.currentGeneIndex = 0;
            this.size = 20;
            const vertices = [
                { x: -this.size * 0.33, y: 0 }, { x: 0, y: this.size }, { x: this.size*0.33, y: 0 }, { x: 0, y: this.size*0.20 }
            ];

            this.body = Matter.Body.create({
                position: pos,
                vertices: vertices,
                // frictionAir: 0.01
            });

            this.body.collisionFilter = colFilters.rocket;     
        }

        /**
         * Advances to the next genom and apllies it's acceleration
         * @returns True if the whole genom has been traversed => the rocket is pretty much done
         */
        advance(accMult) {
            if (this.currentGeneIndex === this.genome.length) {
                // rocket doesn't want to continue, because its out of genes
                return true;
            }
            else {
                // rocket wants to continue
                //const tipPos = Vector.add(this.body.position, Vector.rotate({ x: 0, y: this.size*0.1 }, this.body.angle))
                // Matter.Body.applyForce(this.body, tipPos,
                //     Vector.mult(this.genome[this.currentGeneIndex], 0.0005));
                if(this.body.isStatic){
                    this.currentGeneIndex += 1
                    return false;
                }
                let ax = this.genome[this.currentGeneIndex].x * accMult;
                let ay = this.genome[this.currentGeneIndex].y * accMult;

                let velocity = { x: this.body.velocity.x + ax, y: this.body.velocity.y + ay };

                const maxVelocity = 3;
                
                let velMag = Vector.magnitude(velocity);
                if (velMag > maxVelocity)
                {
                    velocity = Vector.mult(velocity, maxVelocity / velMag);
                }

                Matter.Body.setVelocity(this.body, velocity);
                const angle = Math.atan2(velocity.x, velocity.y);
                // the line below always takes the smallest angle difference between vectors - can't go over PI/2
                // Matter.Body.setAngle(this.body, Vector.angle(velocity, {x:0, y:1}) + Math.PI / 2);
                Matter.Body.setAngle(this.body, -angle)
                this.currentGeneIndex += 1
                return false;
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

        tryToStickToTarget(target){
            if(Matter.SAT.collides(this.body, target.body).collided){
                this.score += 10
                this.body.isStatic = true
            }
        }

        updateScore(target, walls, obstacles){
            for(const obstacle of obstacles){
                if(Matter.SAT.collides(this.body, obstacle.body).collided){
                    this.score -= 3
                }
            }
            for(const wall of walls){
                if(Matter.SAT.collides(this.body, wall.body).collided){
                    this.score -= 3
                }
            }

            this.score += 1 / Vector.magnitudeSquared(Vector.sub(this.body.position, target.body.position)) ** 2;

            if (Vector.magnitudeSquared(Vector.sub(this.body.position, target.body.position)) < target.radius ** 2 + 10){
                this.score += 10;
                // console.log("inside target!")
            }
        }
    }

    return Rocket.prototype.constructor;
})
