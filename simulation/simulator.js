'use strict'
define(['wall', 'rocket', 'obstacle'], function (Wall, Rocket, Obstacle) {
    const Engine = Matter.Engine
    const Render = Matter.Render
    const Composite = Matter.Composite
    const Mouse = Matter.Mouse
    const Events = Matter.Events
    const Vector = Matter.Vector
    const MouseConstraint = Matter.MouseConstraint

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
            this.mouseConstraint = this.setMouseConstraint()
            this.obstacleStartPosition = {x:-1, y:-1}
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
            Composite.add(this.engine.world, rocket.body)
        }

        getRandomPosition () {
            return { x: Math.random() * this.size.x, y: Math.random() * this.size.y }
        }

        setMouseConstraint(){
            const mouse = Mouse.create(this.render.canvas);
            const mouseConstraint = MouseConstraint.create(this.engine, {
                mouse: mouse,
                constraint: {
                    stiffness: 0.2,
                    render: {
                        visible: true
                    }
                }
            });
            // dont capture the mouse scroll
            mouseConstraint.mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
            mouseConstraint.mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
            Events.on(mouseConstraint, 'mousedown', this.onMouseDown.bind(this))
            Events.on(mouseConstraint, 'mouseup', this.onMouseUp.bind(this))
            Events.on(mouseConstraint, 'startdrag', this.onMouseStartDrag.bind(this))
            Events.on(mouseConstraint, 'enddrag', this.onMouseEndDrag.bind(this))
            return mouseConstraint
        }

        addObstacle(topleft, width, height){
            const newObstacle = new Obstacle(topleft.x, topleft.y, width, height)
            Composite.add(this.engine.world, newObstacle.body)
        }

        onMouseStartDrag(){
        }

        onMouseEndDrag(){
        }

        onMouseDown(){
            this.obstacleStartPosition = Object.assign({}, this.mouseConstraint.mouse.position)
        }

        onMouseUp(){
            const endDragPos = this.mouseConstraint.mouse.position
            const posDiff = Vector.sub(this.obstacleStartPosition, endDragPos)
            if(Vector.magnitudeSquared(posDiff) > 10){
                const center = Vector.add(endDragPos, Vector.mult(posDiff, 0.5))
                this.addObstacle(center, Math.abs(posDiff.x), Math.abs(posDiff.y))
            }
        }
    }
    return Simulator.prototype.constructor
})
