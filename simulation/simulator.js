'use strict'

define('simulator', 
    ['wall', 'rocket', 'obstacle', 'target', 'genetics'],
    function (Wall, Rocket, Obstacle, Target, Genetics) {
    const Engine = Matter.Engine
    const Render = Matter.Render
    const Composite = Matter.Composite
    const Mouse = Matter.Mouse
    const Events = Matter.Events
    const Vector = Matter.Vector
    const MouseConstraint = Matter.MouseConstraint

    class Simulator {   // probably pass arguments as one object
        constructor (rocketsNo, iterationsNo, size, rocketStartPos, targetPos, geneLength=5) {
            this.size = size
            this.geneLength = 10 //geneLength 
            this.rocketsNo = rocketsNo
            this.rocketStartPos = rocketStartPos
            this.target = new Target(targetPos.x, targetPos.y)
            this.maxIterations = 50 //iterationsNo
            // end of saving the passed arguments
            // state of the simulator
            this.currentIteration = 0
            this.rockets = []
            this.walls = []
            this.obstacles = []
            this.isGenomeOver = false
            this.looping = false
            // customizables
            /**
             * [ms] time between adjacent gene advancements.
             * Change this to change visual speed of the simulation
             */
            this.rocketUpdateDelay = 130
            /**
             * for how many engine steps rockets accelerate in every gene. 
             * If big it make rocket movement more "robotic"
             */
            this.engineStepPerGene = 30
            /*
            * how fast time passes inside the engine.
            */
            this.simTimeStep = 8000
            
            this.engine = Engine.create({
                gravity: { x: 0, y: 0 }
            })
            this.render = Render.create({
                element: document.body,
                engine: this.engine,
                options: {
                    width: size.x,
                    height: size.y,
                    wireframes: true,
                    showCollisions: true,
                    showIds: true
                }
            })
            // making things run
            this.mouseConstraint = this.setMouseConstraint()
            this.obstacleStartPosition = {x:-1, y:-1}
            this.setWalls()
            Composite.add(this.engine.world, this.target.body)
            Render.run(this.render)
        }

        setUpRockets(genomes){
            for(const rocket of this.rockets){
                Composite.remove(this.engine.world, rocket.body)
            }
            this.rockets = []
            for (let i = 0; i < this.rocketsNo; i++) { // spawn the rockets and give them random genomes
                this.addRocket(this.rocketStartPos, genomes[i])
            }
        }

        /**
         * Call to begin the simulation
         */
        startSimulation () {
            const randomGenomes = (new Array(this.rocketsNo))
            .fill(0)
            .map(_ => Genetics.getRandomGenome(this.geneLength))
            this.setUpRockets(randomGenomes)
            console.log(randomGenomes)
            this.startLoop()
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

        /**
         * Called when the generation ends. If it was the last iteration, stops the simulation.
         */
        onEndOfGeneration(){
            this.stopLoop()
            // print the score
            const results = this.rockets.map(r => {return {score:r.score, id:r.body.id}})
            results.sort((a,b) => b.score - a.score)
            console.log(results)
            if(this.currentIteration++ == this.maxIterations){
                console.log("End of the evolution")
            }
            else{
                for(const rocket of this.rockets){
                    rocket.evaluateFinish(this.target)
                }
                const newGenomes = Genetics.evolve(this.rockets.map(r => {
                    return {score: r.score, genome: r.genome}
                }))
                this.isGenomeOver = false
                this.setUpRockets(newGenomes)
                this.startLoop()
            }
        }

        _loop () {
            if (this.looping) {
                const now = performance.now()
                // execute the loop engineStepPerGene times per every rocketUpdateDelay seconds
                if (now - this.lastDrawTime > this.rocketUpdateDelay/this.engineStepPerGene) {
                    if (now - this.lastRocketUpdate > (this.rocketUpdateDelay)) {
                        if (this.isGenomeOver){
                            console.log('End of the generation')
                            this.onEndOfGeneration()
                        }
                        else {
                            this.lastRocketUpdate = now
                            console.log('Advancing the rockets')
                            this.advanceRockets()
                        }
                    }
                    Engine.update(this.engine, this.simTimeStep)
                    for(const rocket of this.rockets){
                        rocket.updateAcceleration()
                        rocket.updateScore(this.target, this.walls, this.obstacles)
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
            this.walls = [...Object.values(walls)]
            for (const [key, value] of Object.entries(walls)) {
                value.body.label = key + '_wall'
            }
            Composite.add(this.engine.world, Object.values(walls).map(wall => wall.body))
        }

        /**
         * Makes rocket use the next gene of their genomes
         */
        advanceRockets () {
            let isDone = true
            for (const rocket of this.rockets) {
                isDone = rocket.advance() && isDone 
            } 
            // every rocket used up all of their genome (all the sizes are the same anyway, so it is kinda unnecessary)
            if(isDone){
                this.isGenomeOver = true
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
            // set the event handlers
            Events.on(mouseConstraint, 'mousedown', this.onMouseDown.bind(this))
            Events.on(mouseConstraint, 'mouseup', this.onMouseUp.bind(this))
            Events.on(mouseConstraint, 'startdrag', this.onMouseStartDrag.bind(this))
            Events.on(mouseConstraint, 'enddrag', this.onMouseEndDrag.bind(this))
            return mouseConstraint
        }

        addObstacle(topleft, width, height){
            const obstacle = new Obstacle(topleft.x, topleft.y, width, height)
            this.obstacles.push(obstacle)
            Composite.add(this.engine.world, obstacle.body)
        }

        onMouseStartDrag(){
        }

        onMouseEndDrag(){
        }

        // creating the obstacles
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
