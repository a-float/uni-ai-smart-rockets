'use strict'
define(['wall', 'rocket'], function (Wall, Rocket) {
    const Engine = Matter.Engine
    const Render = Matter.Render
    const Composite = Matter.Composite

    class Simulator {
        constructor (size) {
            this.size = size
            this.rockets = []
            this.rocketUpdateDelay = 1
            this.looping = false
            this.engine = Engine.create({
                gravity: { x: 0, y: 0 }
            })
            this.render = Render.create({
                element: document.body,
                engine: this.engine,
                options: {
                    width: size.x,
                    height: size.y,
                    wireframes: true
                }
            })
            this.setWalls()
            Render.run(this.render)
        }

        startLoop () {
            this.lastDrawTime = performance.now()
            this.lastRocketUpdate = performance.now()
            this.looping = true
            this._loop()
        }

        stopLoop () {
            this.looping = false
        }

        _loop () {
            if (this.looping) {
                const now = performance.now()
                if (now - this.lastDrawTime > 1000 / 60) { // the framerate
                    // do the loopy stuff here
                    Engine.update(this.engine, now - this.lastDrawTime)
                    if (now - this.lastRocketUpdate > this.rocketUpdateDelay * 1000) {
                        this.lastRocketUpdate = now
                        console.log('Advancing the rockets')
                        this.updateRockets()
                    }
                }
                requestAnimationFrame(this._loop.bind(this))
            }
        }

        setWalls () {
            const wallWidth = 20
            const walls = {
                top: new Wall(this.size.x * 0.5, -wallWidth * 0.1, this.size.x, wallWidth),
                bottom: new Wall(this.size.x * 0.5, wallWidth * 0.1 + this.size.y, this.size.x, wallWidth),
                right: new Wall(wallWidth * 0.1 + this.size.x, this.size.y * 0.5, wallWidth, this.size.y),
                left: new Wall(-wallWidth * 0.1, this.size.y * 0.5, wallWidth, this.size.y)
            }
            for (const [key, value] of Object.entries(walls)) {
                value.body.label = key + '_wall'
            }
            Composite.add(this.engine.world, Object.values(walls).map(wall => wall.body))
        }

        updateRockets () {
            for (const rocket of this.rockets) {
                rocket.advance()
            }
        }

        addRocket (pos, genome) {
            const rocket = new Rocket(pos, genome)
            this.rockets.push(rocket)
            console.log(rocket)
            Composite.add(this.engine.world, rocket.body)
        }

        getRandomPosition () {
            return { x: Math.random() * this.size.x, y: Math.random() * this.size.y }
        }
    }
    return Simulator.prototype.constructor
})
