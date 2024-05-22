// Jade Hernandez
// Created: 5/14/24
//
// Adventures of Nix
//
// A simple platformer game with a single level


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
    scene: [Load, Platformer, Score, Health, MainMenu, Controls, Credits, Win, Death]
}

var controls;
const SCALE = 3;
const SPRITE_SIZE = 16;
const SECONDS = 1000;
var my = {sprite: {}, text: {}, vfx: {}, sfx: {}};

const game = new Phaser.Game(config);