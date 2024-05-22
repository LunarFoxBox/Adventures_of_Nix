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

        // Create Button Text
        let playText = this.add.text(-30, -15, `Play`, { font: '30px Lexend', fill: '#FFFFFF'});
        let controlsText = this.add.text(-40, -15, 'Controls', {font: '30px Lexend', fill: '#FFFFFF'});
        let creditsText = this.add.text(-40, -15, 'Credits', {font: '30px Lexend', fill: '#FFFFFF'});

        this.add.container(800, 300, [ playButton, playText ]);
        this.add.container(800, 400, [ controlsButton, controlsText ]);
        this.add.container(800, 500, [ creditsButton, creditsText ]);

        playButton.setInteractive();
        controlsButton.setInteractive();
        creditsButton.setInteractive();

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
    }
}

// Controls Screen
class Controls extends Phaser.Scene {
    constructor () {
        super('controlsScreen');
    }

    create(){
        this.add.text(500, 100, `Controls\n- - - - - - -\n'W' = Jump\n'A' = Left\n'D' = Right\n'Spacebar' = Dash\n\n\nClick to return to main menu`, { font: '40px Lexend', fill: '#FFFFFF'})

        this.input.once('pointerup', (event)=>
        {
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
        this.add.text(500, 100, `Credits\n- - - - - - -\nVisuals provided by Kenny Assets through\n'1-Bit Pack'\n'Particle Pack'\n'UI Pack: RPG Expansion'\n\nMusic: 'And The Journey Begins' by xDeviruchi\n\nSound Effects by Jade Hernandez\n\n\nClick to return to main menu`, { font: '40px Lexend', fill: '#FFFFFF'})

        this.input.once('pointerup', (event)=>
        {
            this.scene.start('mainmenu');
        });
    }
}