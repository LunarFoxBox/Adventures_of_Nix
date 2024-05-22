class Health extends Phaser.Scene{
    constructor ()
    {
        super({ key: 'healthScene', active: true });
        this.health = 3;
    }

    create ()
    {
        //  Text object to display the Score
        let info = this.add.text(150, 100, `Health - ${this.health}`, { font: '40px Lexend', fill: '#FFFFFF'}).setPadding(12);

        //  Grab a reference to the Game Scene
        let game = this.scene.get('platformerScene');

        
        //  Listen for events from it
        game.events.on('death', ()=>{
            this.health = 3;
            info.setText(`Health - ${this.health}`);
        });

        game.events.on('hurt', ()=>{
            this.health -= 1;
            info.setText(`Health - ${this.health}`);
        });
    }
}

class Score extends Phaser.Scene{
    constructor ()
    {
        super({ key: 'scoreScene', active: true });
        this.score = 0;
    }

    create ()
    {
        //  Text object to display the Score
        let info = this.add.text(150, 150, `Score - ${this.score} `, { font: '40px Lexend', fill: '#FFFFFF'}).setPadding(12);

        //  Grab a reference to the Game Scene
        let game = this.scene.get('platformerScene');

        
        //  Listen for events from it
        game.events.on('got_coin', ()=> {

            this.score += 10;
            info.setText(`Score - ${this.score}`);

        });

        game.events.on('death', ()=>{
            this.score = 0;
            info.setText(`Score - ${this.score}`);
        });

        game.events.on('got_gem', ()=>{
            this.score += 50;
            info.setText(`Score - ${this.score}`);
        });
    }
}