// Main Menu Screen
class MainMenu extends Phaser.Scene {
    constructor ()
    {
        super('mainmenu');
    }

    create ()
    {
        // Create Buttons
        let playButton = this.add.image(0, 0, 'button');
        let controlsButton = this.add.image(0, 0, 'button');
        let creditsButton = this.add.image(0, 0, 'button');
        let quitButton = this.add.image(0, 0, 'button');

        // Create Button Text
        let playText = this.add.text(-30, -15, `Play`, { font: '30px Lexend', fill: '#FFFFFF'});
        let controlsText = this.add.text(-40, -15, 'Controls', {font: '30px Lexend', fill: '#FFFFFF'});
        let creditsText = this.add.text(-40, -15, 'Credits', {font: '30px Lexend', fill: '#FFFFFF'});
        let quitText = this.add.text(-40, -15, 'Quit', {font: '30px Lexend', fill: '#FFFFFF'});

        // Group objects and place them at x, y
        this.add.container(900, 300, [ playButton, playText ]);
        this.add.container(900, 400, [ controlsButton, controlsText ]);
        this.add.container(900, 500, [ creditsButton, creditsText ]);
        this.add.container(900, 600, [ quitButton, quitText ]);

        // Set the buttons to be interactive
        playButton.setInteractive();
        controlsButton.setInteractive();
        creditsButton.setInteractive();
        quitButton.setInteractive();

        // If play button is clicked, start the game
        playButton.once('pointerup', ()=> {
            this.scene.start('platformerScene');
        });

        // If controls button is clicked, show controls screen
        controlsButton.once('pointerup', ()=> {
            this.scene.start('controlsScreen');
        });

        // If credits button is clicked, show credits screen
        creditsButton.once('pointerup', ()=> {
            this.scene.start('creditsScreen');
        });

        // If quit button is clicked, quit the game
        quitButton.once('pointerup', ()=> {
            // Destroy all game elements and close the window
            game.destroy(true, true);
            close();
        })
    }
}

// Controls Screen
class Controls extends Phaser.Scene {
    constructor () {
        super('controlsScreen');
    }

    create(){
        // Controls Text
        this.add.text(500, 100, `Controls\n- - - - - - -\n'W' = Jump\n'W' while in the air = Double Jump\n'A' = Move Left\n'D' = Move Right\n'Spacebar' = Dash\n\n\nClick to return to main menu`, { font: '50px Lexend', fill: '#FFFFFF'})

        // On click go to menu scene
        this.input.once('pointerup', (event)=> {
            this.scene.start('mainmenu');
        });
    }
}

// Credits Screen
class Credits extends Phaser.Scene {
    constructor () {
        super('creditsScreen');
    }

    create(){
        // Credit Text
        this.add.text(500, 100, `Credits\n- - - - - - -\nVisuals provided by Kenny Assets through\n'1-Bit Pack'\n    (https://kenney.nl/assets/1-bit-platformer-pack)\n'Particle Pack'\n    (https://kenney.nl/assets/particle-pack)\n'UI Pack: RPG Expansion'\n    (https://kenney.nl/assets/ui-pack-rpg-expansion)\n\nMusic 'And The Journey Begins' by xDeviruchi\n     (https://xdeviruchi.itch.io/8-bit-fantasy-adventure-music-pack)\n\nSound Effects by Jade Hernandez\n\n\nClick to return to main menu`, { font: '30px Lexend', fill: '#FFFFFF'})

        // On click go to menu scene
        this.input.once('pointerup', (event)=> {
            this.scene.start('mainmenu');
        });
    }
}