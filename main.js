'use strict'
requirejs.config({
    baseUrl: 'simulation',
});

require(['simulator'], function (Simulator) {
    const size = { x: 800, y: 500 };
    const sim = new Simulator(size);
    sim.rocketUpdateDelay = 0.1; // in seconds

    // for (let i = 0; i < 100; i++) {
    //     // spawn the rockets and give them random genomes
    //     sim.addRocket(sim.getOptimalStartPosition(), getRandomGenome(60));
    // }

    const speedSlider = document.getElementById('speed-slider')
    const forceSlider = document.getElementById('force-slider')
    const mutationSlider = document.getElementById('mutation-slider')
    const rocketNum = document.getElementById('rocket-num')
    const genomeLength = document.getElementById('genome-num')
    const resetBtn = document.getElementById('reset-button')
    const colorSwitch = document.getElementById('color-switch')
    const playBtn = document.getElementById('play-button')
    
    // reset btn
    resetBtn.onclick = () => {
        sim.stopLoop()
        sim.removeAllRockets()
        for (let i = 0; i < parseInt(rocketNum.value); i++) {
            sim.addRocket(
                sim.getOptimalStartPosition(), 
                getRandomGenome(parseInt(genomeLength.value))
            );
        }
        sim.startLoop()
    }
    // play/pause btn
    playBtn.onclick = () => {
        if(playBtn.innerText === 'Play'){
            sim.startLoop()
            playBtn.innerText = 'Pause'
        }
        else if(playBtn.innerText === 'Pause'){
            sim.stopLoop()
            playBtn.innerText = 'Play'
        }
    }
    // color switch
    sim.render.options.wireframes = !colorSwitch.checked
    colorSwitch.onchange = (check) => {
        sim.render.options.wireframes = !check.target.checked
    }
    // mutation
    mutationSlider.onchange = (slider) => {
        sim.mutationProbability = parseFloat(slider.target.value)
        console.log(`Set mutationChance to ${sim.mutationProbability}`)
    }
    mutationSlider.onchange({target:mutationSlider})
    // speed
    speedSlider.onchange = (slider) => {
        sim.rocketUpdateDelay = parseFloat(slider.target.value)/1000
        console.log(`Set rocketDelay to ${sim.rocketUpdateDelay}`)
    }
    speedSlider.onchange({target:speedSlider})
    //force
    forceSlider.onchange = (slider) => {
        const value = parseFloat(slider.target.value)
        // sim.rocketUpdateDelay = 1/value
        sim.accMult = value
        // accMult * rocketUpdateDelay = 0.1
        console.log(`Set accMult to ${sim.accMult}`)
    }
    forceSlider.onchange({target:forceSlider})

    resetBtn.onclick()
    // sim.startLoop();
});
