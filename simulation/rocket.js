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
            if (this.currentGeneIndex === this.genome.length - 1) {
                // rocket doesn't want to continue, because its out of genes
                return true;
            }
            else {
                // rocket wants to continue
                this.currentGeneIndex += 1
                //const tipPos = Vector.add(this.body.position, Vector.rotate({ x: 0, y: this.size*0.1 }, this.body.angle))
                // Matter.Body.applyForce(this.body, tipPos,
                //     Vector.mult(this.genome[this.currentGeneIndex], 0.0005));
                
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

                Matter.Body.setAngle(this.body, Vector.angle(velocity, {x:0, y:1}) + Math.PI / 2);
                    
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

        updateScore(target, walls, obstacles){
            this.score += 1 / Vector.magnitudeSquared(Vector.sub(this.body.position, target.body.position));

            if (Vector.magnitudeSquared(Vector.sub(this.body.position, target.body.position)) < target.radius ** 2){
                this.score += 10;
                // console.log("inside target!")
            }
        }
    }

    return Rocket.prototype.constructor;
})
