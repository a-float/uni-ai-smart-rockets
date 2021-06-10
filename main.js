'use strict'
requirejs.config({
    baseUrl: 'simulation'
})

require(['simulator'], function (Simulator) {
    const size = { x: 900, y: 600 }
    const rocketStartPos = { x: 850, y:550}
    const targetPos = {x: 50, y: 50}
    const sim = new Simulator(10, 3, size, rocketStartPos, targetPos)
    sim.startSimulation()
})
