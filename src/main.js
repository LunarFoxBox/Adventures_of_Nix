// Jim Whitehead
// Created: 4/14/2024
// Phaser: 3.70.0
//
// Cubey
//
// An example of putting sprites on the screen using Phaser
// 
// Art assets from Kenny Assets "Shape Characters" set:
// https://kenney.nl/assets/shape-characters

// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {
                x: 0,
                y: 0
            },
            fps: 60
        }
    },
    width: 2240,
    height: 800,
    scene: [Load, Platformer]
}

var controls;
const SCALE = 3;
const SPRITE_SIZE = 16;
const SECONDS = 1000;
var my = {sprite: {}, text: {}, vfx: {}, sfx: {}};

const game = new Phaser.Game(config);