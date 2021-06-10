'use strict'
requirejs.config({
    baseUrl: 'simulation',
});

require(['simulator'], function (Simulator) {
    const size = { x: 900, y: 600 };
    const sim = new Simulator(size);
    sim.rocketUpdateDelay = 0.1; // in seconds

    for (let i = 0; i < 500; i++) {
        // spawn the rockets and give them random genomes
        sim.addRocket(sim.getOptimalStartPosition(), getRandomGenome(60));
    }

    sim.startLoop();
});
