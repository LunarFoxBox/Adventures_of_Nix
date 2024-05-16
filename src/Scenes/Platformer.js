class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.MaxSpeedX = 150; // Max Player Speed
        this.MaxSpeedY = 1000;
        this.physics.world.TILE_BIAS = 40; // How strong the tiles keep things from passing through
        this.ACCELERATION = 700; // Player Acceleration
        this.DRAG = 1200;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 2000;
        this.JUMP_VELOCITY = -500; // How heigh the player jumps

        this.shakeY = 0.01 // Y axis for camera shake when landing
        this.isLanding = false; // Keeps track of if the player is landing or not
        this.inAir = false; // Keeps track of if the player is in the air
        this.airTime = 0; // ticks in air

        this.shakeVector = new Phaser.Math.Vector2(0, this.shakeY);

        this.PARTICLE_VELOCITY = 50;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("level_1", SPRITE_SIZE, SPRITE_SIZE, 140, 30);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Platforms", this.tileset, 0, 0);
        //this.groundLayer.setScale(2.0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });


        // Create Spawn Point for player
        this.spwanPoint = this.map.createFromObjects("Objects", {
            name: "spawn_point",
            key: "tilemap_sheet",
            frame: 216
        });

        // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 22
        });

        this.spikes = this.map.createFromObjects("Objects", {
            name: "spike",
            key: "tilemap_sheet",
            frame: 183
        });
        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);
        this.spikeGroup = this.add.group(this.spikes)
        
        


        // set up player avatar
        my.sprite.player = this.physics.add.sprite(this.spwanPoint[0].x, this.spwanPoint[0].y, "platformer", "tile_0260.png");//.setScale(SCALE);
        my.sprite.player.setCollideWorldBounds(false);
        my.sprite.player.setSize(SPRITE_SIZE, SPRITE_SIZE, true);
        my.sprite.player.setOffset(0, 0);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            obj2.destroy(); // remove coin on overlap
        });

        this.physics.add.overlap(my.sprite.player, this.spikeGroup, (obj1, obj2) => {
            console.log("Ouch Touched Spikes!")
        });



        // Set player's max speed
        my.sprite.player.body.maxVelocity = new Phaser.Math.Vector2(this.MaxSpeedX, this.MaxSpeedY);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true;
            this.physics.world.debugGraphic.clear();
        }, this);


        // VFX
        // movement vfx
        my.vfx.walking = this.add.particles(0, 0, "particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            // TODO: Try: add random: true
            scale: {start: 0.03, end: 0.1},
            // TODO: Try: maxAliveParticles: 8,
            lifespan: 350,
            // TODO: Try: gravityY: -400,
            alpha: {start: 1, end: 0.1}, 
        });
        my.vfx.walking.stop();

        my.vfx.jumping = this.add.particles(0, 0, "particles", {
            frame: ['star_08.png', 'star_03.png'],
            scale: {start: 0.05, end: 0.01},
            lifespan: 600,
            alpha: {start: 1, end: 0.1},
            quantity: 1,
            stopAfter: 3,
            y: { steps: 3, start: 0, end: 120 }
        });
        my.vfx.jumping.stop();

        
        
        // Camera Settings
        //this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(25, 25);
        this.cameras.main.setZoom(SCALE);
        
        
    }

    update() {
        // Move Left
        if(cursors.left.isDown) {
            my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        // Move Right
        } else if(cursors.right.isDown) {
            my.sprite.player.resetFlip();

            my.sprite.player.body.setAccelerationX(this.ACCELERATION);
            my.sprite.player.anims.play('walk', true);

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {

                my.vfx.walking.start();

            }

        // Idling
        } else {
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');

            my.vfx.walking.stop();
        }

        // Player jump
        // We need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
            this.isLanding = true;
            this.airTime++;

            my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.jumping.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            my.vfx.jumping.start();
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }
        if (this.isLanding && my.sprite.player.body.blocked.down){
            this.cameras.main.shake(0.1*SECONDS, this.shakeVector.scale(this.airTime * 0.05));

            this.shakeVector.y = this.shakeY;
            this.isLanding = false;
            this.airTime = 0;

            my.vfx.jumping.stop();
        }
    }
}