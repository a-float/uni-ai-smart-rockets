'use strict'

define('genetics', [], () => {
    const minForce = 0.2
    const maxForce = 0.3
    const genomeMutationChance = 0.4
    const geneMutationChance = 0.7

    /**
     * @param {*} minForce max vector length
     * @param {*} maxForce min vector length
     * @returns random 2d vector [x,y]
     */
    function getRandomGene (minForce, maxForce) {
        const angle = Math.random() * 2 * Math.PI
        const force = minForce + Math.random() * (maxForce - minForce)
        return { x: force * Math.cos(angle), y: force * Math.sin(angle) }
    }

    /**
     * @param {int} len length of the created genome
     * @returns a list of size len filled with objects {x: accx, y:accy}
     */
    function getRandomGenome (len) {
        return (new Array(len)).fill(0).map(() => { // the fill is kinda ugly
            return getRandomGene(minForce, maxForce)
        })
    }

    /**
     * Performs Selection, Crossover and Mutation, then returns the new genome pool
     * @param population a list of objects each with score and genome
     */
    function evolve(population){
        const parents = selection(population)
        const newPopulation = crossover(parents, population.length)
        mutate(newPopulation)
        return newPopulation
    }

    /**
     * chooses two individuals. The fitter they are, the greater they chance of being selected
     * @param population 
     */
    function selection(population){
        let a = {score:-Infinity}
        let b = {score:-Infinity}
        for(const ele of population){
            if(ele.score > a.score){
                a = ele
            } else if (ele.score > b.score){
                b = ele
            }
        }
        return [a,b]
    }


    /**
     * @param {*} parents two "fittest" individuals
     * @param {*} length how big the new population should be
     * @returns a list of size length of genomes created from crossing over the parents' genomes
     */
    function crossover(parents, length){
        const result = []
        for(let i = 0; i < length; i++){
            const newGenome = []
            for(let g = 0; g < parents[0].genome.length; g++){
                if (Math.random() < 0.5){ // take gene from the 0th parent
                    newGenome.push(parents[0].genome[g])
                } else{ // take from the 1st parent
                    newGenome.push(parents[1].genome[g])
                }
            }
            result.push(newGenome)
        }
        return result
    }

    function mutate(genomes){
        for(const genome of genomes){
            if(Math.random() < genomeMutationChance){ // try to mutate this genome
                for(let i = 0; i < genome.length; i++){
                    if(Math.random() < geneMutationChance){
                        genome[i] = getRandomGene(minForce, maxForce)
                    }
                }
            }
        }
    }

    return {
        getRandomGenome: getRandomGenome,
        evolve: evolve
    }
})
