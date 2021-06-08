'use strict'
requirejs.config({
    baseUrl: 'simulation'
})

/**
 * @param {int} len length of the created genome
 * @returns a list of size len filled with objects {x: accx, y:accy}
 */
function getRandomGenome (len, minForce, maxForce) {
    return (new Array(len)).fill(0).map(() => { // the fill is kinda ugly
        const angle = Math.random() * 2 * Math.PI
        const force = minForce + Math.random() * (maxForce - minForce)
        return { x: force * Math.cos(angle), y: force * Math.sin(angle) }
    })
}

require(['simulator'], function (Simulator) {
    const size = { x: 900, y: 600 }
    const sim = new Simulator(size)
    sim.rocketUpdateDelay = 1 // in seconds
    for (let i = 0; i < 10; i++) { // spawn the rockets and give them random genomes
        sim.addRocket(sim.getRandomPosition(), getRandomGenome(10, 0.5, 0.7))
    }

    sim.startLoop()
})
