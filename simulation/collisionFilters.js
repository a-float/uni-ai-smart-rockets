'use strict'
define('collisionFilters', [], () => {
    const cats = { // short for categories, not 😺😺😺
        rocket: 1,
        obstacle: 1 << 1,
        wall: 1 << 2,
        target: 1 << 3
    }
    return {
        rocket : {
            group: 0, // we dont use groups here
            category: cats.rocket, // what is my id
            mask: cats.wall | cats.obstacle | cats.target // with which ids do I collide
        },
        obstacle : { 
            group: 0,
            category: cats.obstacle,
            mask: cats.rocket | cats.wall
        },
        wall : {
            group: 0,
            category: cats.wall,
            mask: cats.rocket | cats.obstacle
        },
        target : {
            group: -1,
            category: cats.target,
            mask: 0
        }
    }
})