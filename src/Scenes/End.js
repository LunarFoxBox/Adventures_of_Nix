class Death extends Phaser.Scene{
    constructor ()
    {
        super('deathScreen');
    }

    create ()
    {
        this.add.text(600, 200, `You have fallen...\n\nClick to return to main menu`, { font: '40px Lexend', fill: '#FFFFFF'})

        this.input.once('pointerup', (event)=> {
            this.scene.start('mainmenu');
        });
    }
}

class Win extends Phaser.Scene{
    constructor ()
    {
        super('winScreen');
    }

    create ()
    {
        this.add.text(600, 200, `You Win!!!\n\nClick to return to main menu`, { font: '40px Lexend', fill: '#FFFFFF'})

        this.input.once('pointerup', (event)=> {
            this.scene.start('mainmenu');
        });
    }
}