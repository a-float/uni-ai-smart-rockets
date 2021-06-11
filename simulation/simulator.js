'use strict'

const MIN_FORCE = 0.1;
const MAX_FORCE = 1;

/**
 * @param {int} len length of the created genome
 * @returns a list of size len filled with objects {x: accx, y:accy}
 */
 function getRandomGenome(len) {
    return (new Array(len)).fill(0).map(() => { // the fill is kinda ugly
        const angle = Math.random() * 2 * Math.PI;
        const force = MIN_FORCE + Math.random() * (MAX_FORCE - MIN_FORCE);
        return { x: force * Math.cos(angle), y: force * Math.sin(angle) };
    })
}

function spliceGenomes(genomeA, genomeB) {
    console.assert(genomeA.length == genomeB.length, "Cannot splice genomes of differing length");

    let midpoint = Math.floor(Math.random() * genomeA.length);

    let newGenome = [];
    
    for (let i = 0; i < genomeA.length; ++i) {
        newGenome[i] = i < midpoint ? genomeA[i] : genomeB[i];
    }

    return newGenome;
}

function mutateGenome(genome, probability) {
    for (let i = 0; i < genome.length; ++i) {
        if (Math.random() < probability) {
            const angle = Math.random() * 2 * Math.PI;
            const force = MIN_FORCE + Math.random() * (MAX_FORCE - MIN_FORCE);
            const gene = { x: force * Math.cos(angle), y: force * Math.sin(angle) };

            genome[i] = gene;
        }
    }
}

define('simulator', ['wall', 'rocket', 'obstacle', 'target'], function (Wall, Rocket, Obstacle, Target) {
    const Engine = Matter.Engine
    const Render = Matter.Render
    const Composite = Matter.Composite
    const Mouse = Matter.Mouse
    const Events = Matter.Events
    const Vector = Matter.Vector
    const MouseConstraint = Matter.MouseConstraint

    class Simulator {
        constructor(size) {
            this.mutationProbability = 0.05;

            this.size = size
            this.target = new Target(this.size.x * 0.5, this.size.y * 0.1)
            this.rockets = []
            this.walls = []
            this.obstacles = []
            this.isGenomeOver = false
            this.rocketUpdateDelay = 0.1; // in seconds
            this.looping = false
            this.accMult = 1
            this.draggingTarget = false
            this.engine = Engine.create({
                gravity: { x: 0, y: 0 }
            })
            this.render = Render.create({
                element: document.getElementById('canvas-div'),
                engine: this.engine,
                options: {
                    width: size.x,
                    height: size.y,
                    wireframes: true,
                    showCollisions: true,
                    // showIds: true
                }
            })
            // making things run
            this.mouseConstraint = this.setMouseConstraint()
            this.obstacleStartPosition = {x:-1, y:-1}
            this.setWalls()
            Composite.add(this.engine.world, this.target.body)
            Render.run(this.render)
        }

        startLoop() {
            this.lastDrawTime = performance.now()
            this.lastRocketUpdate = performance.now()
            this.looping = true
            this._loop()
        }

        stopLoop() {
            this.looping = false
        }

        _loop() {
            if (this.looping) {
                const now = performance.now();

                if (now - this.lastDrawTime > 1000 / 60) { // the framerate
                    // do the loopy stuff here
                    if (!this.isGenomeOver) {
                        if (now - this.lastRocketUpdate > this.rocketUpdateDelay * 1000) {
                            this.lastRocketUpdate = now;
                            
                            console.log('Advancing the rockets');
                            this.advanceRockets();
                        }
                    }

                    Engine.update(this.engine, now - this.lastDrawTime);
                }

                requestAnimationFrame(this._loop.bind(this));
            }
        }

        removeAllRockets(){
            for(const rocket of this.rockets){
                Composite.remove(this.engine.world, rocket.body)
            }
            this.rockets = []
        }

        setWalls() {
            const wallWidth = 20;
            const walls = {
                top: new Wall(this.size.x * 0.5, -wallWidth * 0.1, this.size.x, wallWidth),
                bottom: new Wall(this.size.x * 0.5, wallWidth * 0.1 + this.size.y, this.size.x, wallWidth),
                right: new Wall(wallWidth * 0.1 + this.size.x, this.size.y * 0.5, wallWidth, this.size.y),
                left: new Wall(-wallWidth * 0.1, this.size.y * 0.5, wallWidth, this.size.y)
            };

            this.walls = [...Object.values(walls)];
            for (const [key, value] of Object.entries(walls)) {
                value.body.label = key + '_wall';
            }

            Composite.add(this.engine.world, Object.values(walls).map(wall => wall.body));
        }

        regeneratePopulation() {
            const matingPool = [];

            const maxScore = this.rockets.map(r => r.score).reduce((a, b) => a > b ? a : b);
            console.log({ maxScore });

            for (const rocket of this.rockets) {
                // The rockets with the highest score will have more occurrances
                // in the mating pool, which will increase their chances of
                // getting picked for mating.
                const duplicates = Math.floor(rocket.score / maxScore * 100);

                for (let i = 0; i < duplicates; ++i)
                {
                    matingPool.push(rocket.genome);
                }

                Composite.remove(this.engine.world, rocket.body);
            }

            let rocketsToGenerate = this.rockets.length;
            this.rockets = [];

            console.log(`Generating ${rocketsToGenerate} rockets`);

            for (let i = 0; i < rocketsToGenerate; ++i) {
                const genomeA = matingPool[Math.floor(Math.random() * matingPool.length)];
                const genomeB = matingPool[Math.floor(Math.random() * matingPool.length)];
                const newGenome = spliceGenomes(genomeA, genomeB);
                mutateGenome(newGenome, this.mutationProbability);

                this.addRocket(this.getOptimalStartPosition(), newGenome);
            }
        }

        advanceRockets() {
            let isDone = true;
            for (const rocket of this.rockets) {
                isDone = rocket.advance(this.accMult) && isDone;
                rocket.updateScore(this.target, this.walls, this.obstacles);
            };

            if (isDone) {
                console.log("The genome is over");
                console.log(this.rockets.map(r => {return { score: r.score, pos: r.body.position }}));

                this.regeneratePopulation();
            }
        }

        addRocket(pos, genome) {
            const rocket = new Rocket(pos, genome);
            this.rockets.push(rocket);
            Composite.add(this.engine.world, rocket.body);
        }

        getRandomPosition() {
            return { x: Math.random() * this.size.x, y: Math.random() * this.size.y };
        }

        getOptimalStartPosition() {
            return { x: this.size.x / 2, y: this.size.y * 0.9 };
        }

        setMouseConstraint() {
            const mouse = Mouse.create(this.render.canvas);
            const mouseConstraint = MouseConstraint.create(this.engine, {
                mouse: mouse,
                constraint: {
                    stiffness: 0.2,
                    render: {
                        visible: true,
                    }
                }
            });

            // dont capture the mouse scroll
            mouseConstraint.mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
            mouseConstraint.mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
            // set the event handlers
            Events.on(mouseConstraint, 'mousedown', this.onMouseDown.bind(this))
            Events.on(mouseConstraint, 'mouseup', this.onMouseUp.bind(this))
            Events.on(mouseConstraint, 'mousemove', this.onMouseMove.bind(this))
            Events.on(mouseConstraint, 'startdrag', this.onMouseStartDrag.bind(this))
            Events.on(mouseConstraint, 'enddrag', this.onMouseEndDrag.bind(this))
            return mouseConstraint
        }

        addObstacle(topleft, width, height) {
            const obstacle = new Obstacle(topleft.x, topleft.y, width, height);
            this.obstacles.push(obstacle);
            Composite.add(this.engine.world, obstacle.body);
        }

        onMouseStartDrag() {
            
        }

        onMouseEndDrag() {
        }

        onMouseMove(){
            if(this.draggingTarget){
                Matter.Body.setPosition(this.target.body, this.mouseConstraint.mouse.position)
            }
        }

        onMouseDown() {
            if (Vector.magnitudeSquared(Vector.sub(this.mouseConstraint.mouse.position, this.target.body.position)) < this.target.radius ** 2){
                this.draggingTarget = true
                this.obstacleStartPosition = null
            }
            else{
                this.obstacleStartPosition = Object.assign({}, this.mouseConstraint.mouse.position);
            }
        }

        onMouseUp() {
            this.draggingTarget = false
            if(this.obstacleStartPosition === null)return
            const endDragPos = this.mouseConstraint.mouse.position;
            const posDiff = Vector.sub(this.obstacleStartPosition, endDragPos);

            if(Vector.magnitudeSquared(posDiff) > 300) {
                const center = Vector.add(endDragPos, Vector.mult(posDiff, 0.5));
                this.addObstacle(center, Math.abs(posDiff.x), Math.abs(posDiff.y));
            }
        }
    }

    return Simulator.prototype.constructor;
})
