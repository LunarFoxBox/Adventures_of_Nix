class Death extends Phaser.Scene{
    constructor ()
    {
        super({ key: 'deathScreen'});
    }

    create ()
    {
        this.add.text(600, 200, `You have fallen...\n\nClick to return to main menu`, { font: '40px Lexend', fill: '#FFFFFF'})
        this.input.once('pointerup', function (event)
        {

            this.scene.start('mainmenu');

        }, this);
    }
}

class Win extends Phaser.Scene{
    constructor ()
    {
        super({ key: 'winScreen'});
    }

    create ()
    {
        this.add.text(600, 200, `You Win!!!\n\nClick to return to main menu`, { font: '40px Lexend', fill: '#FFFFFF'})

        this.input.once('pointerup', function (event)
        {

            this.scene.start('mainmenu');

        }, this);
    }
}