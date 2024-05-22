class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        //  Text object to display the Score
        let info = this.add.text(750, 300, `Loading`, { font: '100px Lexend', fill: '#FFFFFF'}).setPadding(12);
        info.active = true;
        this.load.setPath("./assets/");

        this.load.image("button", "buttonLong_blue.png");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "platform_characters.png", "platform_characters.json");

        this.load.image("tilemap_tiles", "tilemap_packed.png");  // Packed tilemap
        this.load.tilemapTiledJSON("level_1", "level_1.tmj");   // Tilemap in JSON

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: SPRITE_SIZE,
            frameHeight: SPRITE_SIZE
        });

        this.load.multiatlas("particles", "particles.json");

        this.load.audio("jump", "jump.wav"); // Created
        this.load.audio("coin_pickup", "pickup_coin.wav"); // Created
        this.load.audio('player_hurt', 'Hurt.wav'); // Created
        this.load.audio('player_land', 'impact.wav'); // Created
        this.load.audio('dash', 'dash.wav'); // Created

        // Music by xDeviruchi under Attribution-ShareAlike 4.0 International license
        // https://xdeviruchi.itch.io/8-bit-fantasy-adventure-music-pack
        this.load.audio("main_music", "xDeviruchi - And The Journey Begins .wav");
    }

    create() {
        // sfx
        my.sfx.jump = this.sound.add('jump', {volume: 0.3});
        my.sfx.coinPickup = this.sound.add('coin_pickup', {volume: 0.7});
        my.sfx.playerHurt = this.sound.add('player_hurt', {volume: 0.5});
        my.sfx.playerLand = this.sound.add('player_land', {volume: 0.2})
        my.sfx.dash = this.sound.add('dash', {volume: 0.4});
        my.sfx.mainMusic = this.sound.add('main_music', {volume: 0.1});
        
        my.sfx.mainMusic.loop = true;
        my.sfx.mainMusic.play();


        // Animations
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 263,
                end: 264,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0260.png"
                }
            ],
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0265.png" }
            ],
        });

        this.anims.create({
            key: 'fall',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0262.png"}
            ],
        });

        this.anims.create({
            key: 'player_death',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0266.png"}
            ],
        });

        
         // ...and pass to the next Scene
         this.scene.start("mainmenu");
    }
}