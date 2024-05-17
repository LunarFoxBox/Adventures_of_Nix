class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.MaxSpeedX = 100; // Max Player Speed
        this.MaxSpeedY = 1200;
        this.physics.world.TILE_BIAS = 20; // How strong the tiles keep things from passing through
        this.ACCELERATION = 700; // Player Acceleration
        this.DRAG = 1200;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 2000;
        this.JUMP_VELOCITY = -500; // How heigh the player jumps

        this.shakeY = 0.005 // Y axis for camera shake when landing
        this.isLanding = false; // Keeps track of if the player is landing or not
        this.inAir = false; // Keeps track of if the player is in the air
        this.airTime = 0; // ticks in air

        this.shakeVector = new Phaser.Math.Vector2(0, this.shakeY);

        this.PARTICLE_VELOCITY = 50;

        this.DASH_STRENGTH = 800;
        this.MAX_DASH_LENGTH = 5;
        this.dash_length = this.MAX_DASH_LENGTH;
        this.dashUsed = false;

        this.SPRING_STRENGTH = -1200;

        this.coinVFXTimeMax = 20;
        this.coinVFXTime = this.coinVFXTimeMax;

        this.playerHealth = 3;
        this.maxInvincibilityTime = 60;
        this.invincibilityTime = this.maxInvincibilityTime;

        this.deathTime = 100;
    }

    create() {

        // sfx
        my.sfx.jump = this.sound.add('jump', {volume: 0.4});
        my.sfx.coinPickup = this.sound.add('coin_pickup', {volume: 0.7});
        my.sfx.playerHurt = this.sound.add('player_hurt', {volume: 0.5});
        my.sfx.playerLand = this.sound.add('player_land', {volume: 0.3})
        my.sfx.mainMusic = this.sound.add('main_music', {volume: 0.1});
        
        my.sfx.mainMusic.loop = true;
        my.sfx.mainMusic.play();



        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("level_1", SPRITE_SIZE, SPRITE_SIZE, 140, 30);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Platforms", this.tileset, 0, 0);
        
        // Create background layer
        this.backgroundLayer = this.map.createLayer("Background", this.tileset, 0, 0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });


        // Create Spawn Point for player
        this.spwanPoint = this.map.createFromObjects("Special", {
            name: "spawn_point",
            key: "tilemap_sheet",
            frame: 216
        });


        // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects
        this.coins = this.map.createFromObjects("Coins", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 22
        });

        this.spikes = this.map.createFromObjects("Spikes", {
            name: "spike",
            key: "tilemap_sheet",
            frame: 183
        });

        this.grass = this.map.createFromObjects("Grass", {
            name: "grass",
            key: "tilemap_sheet"
        });
        //this.grass.anims.play('grass', true);

        this.springs = this.map.createFromObjects("Springs", {
            name: "spring",
            key: "tilemap_sheet",
            frame: 163
        });


        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.springs, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array this.coins
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);
        this.spikeGroup = this.add.group(this.spikes)
        this.springGroup = this.add.group(this.springs);
        
        


        // set up player avatar
        my.sprite.player = this.physics.add.sprite(this.spwanPoint[0].x, this.spwanPoint[0].y, "platformer_characters", "tile_0260.png");//.setScale(SCALE);
        my.sprite.player.setCollideWorldBounds(false);
        my.sprite.player.setSize(SPRITE_SIZE, SPRITE_SIZE, true);
        my.sprite.player.setOffset(0, 0);

        // Set player's max speed
        my.sprite.player.body.maxVelocity = new Phaser.Math.Vector2(this.MaxSpeedX, this.MaxSpeedY);

        // set up Phaser-provided cursor key input
        controls = this.input.keyboard.addKeys(
            {
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
            'dash': Phaser.Input.Keyboard.KeyCodes.SPACE
        });
        console.log(controls)

        // UI Health
        this.hearts = this.map.createFromObjects("UI", {
            name: 'heart',
            key: 'tilemap_sheet',
            frame: 40,
            x: my.sprite.player.body.x - 500,
            y: my.sprite.player.body.y - 200,
            follow: my.sprite.player,  // a game object or an arcade physics object
        });



        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-V', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true;
            this.physics.world.debugGraphic.clear();
        }, this);


        


        // VFX
        // movement vfx
        my.vfx.walking = this.add.particles(0, 0, "particles", {
            frame: ['smoke_01.png', 'smoke_02.png'],
            scale: {start: 0.05, end: 0.01},
            maxAliveParticles: 3,
            lifespan: 350,
            alpha: {start: 1, end: 0.1}, 
            follow: my.sprite.player,  // a game object or an arcade physics object
	        followOffset: { x: -100, y: -30 },  // offset from object for emitter location

        });
        my.vfx.walking.stop();

        // Dash vfx
        my.vfx.dashing = this.add.particles(0, 0, "particles", {
            frame: ['spark_01.png', 'spark_02.png'],
            scale: {start: 0.05, end: 0.001},
            maxAliveParticles: 8,
            lifespan: 350,
            alpha: {start: 1, end: 0.1}, 
        });
        my.vfx.dashing.stop();

        my.vfx.jumping = this.add.particles(0, 0, "particles", {
            frame: ['star_08.png', 'star_03.png'],
            scale: {start: 0.05, end: 0.01},
            lifespan: 600,
            alpha: {start: 1, end: 0.1},
            maxAliveParticles: 2,
            hold: 1000
        });
        my.vfx.jumping.stop();

        my.vfx.coinPickup = this.add.particles(0, 0, "particles", {
            frame: ['light_01.png', 'light_02.png', 'light_03.png'],
            scale: {start: 0.09, end: 0.05},
            lifespan: 200,
            alpha: {start: 0.5, end: 0.03},
            stopAfter: 3
        });
        my.vfx.coinPickup.stop();

        my.vfx.hurt = this.add.particles(0, 0, 'particles', {
            frame: ['magic_03.png', 'magic_04.png'],
            
            scale: {start: 0.09, end: 0.05},
            lifespan: 100,
            alpha: {start: 0.8, end: 0.1},
            stopAfter: 2
        });
        my.vfx.hurt.stop();

        
        
        
        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            my.vfx.coinPickup.x = obj2.x;
            my.vfx.coinPickup.y = obj2.y;
            my.sfx.coinPickup.play();
            my.vfx.coinPickup.start();
            this.coinVFXTime = this.coinVFXTimeMax;
            obj2.destroy(); // remove coin on overlap
        });

        this.physics.add.overlap(my.sprite.player, this.spikeGroup, (obj1, obj2) => {
            if (this.playerHealth > 0 && this.invincibilityTime <= 0){
                my.vfx.hurt.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
                my.sfx.playerHurt.play();
                my.vfx.hurt.start();
                this.playerHealth--;
                this.invincibilityTime = this.maxInvincibilityTime;
            }
        });

        

        // Spring collision
        this.physics.add.overlap(my.sprite.player, this.springGroup, (obj1, obj2) => {
            my.sprite.player.body.setVelocityY(this.SPRING_STRENGTH);
        })



         // Camera Settings
         this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
         this.cameras.main.setViewport(400, 0, this.map.widthInPixels/2, this.map.heightInPixels);
         this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
         this.cameras.main.setDeadzone(50, 50);
         this.cameras.main.setZoom(SCALE);

         this.input.keyboard.on(controls.dash, ()=>{

         });
    }

    update() {
        this.invincibilityTime--;
        
        if (this.playerHealth <= 0){
            my.sprite.player.anims.play('player_death', true);
            if (this.deathTime <= 0){
                my.sprite.player.anims.stop();
                my.sfx.mainMusic.stop();
                this.init();
                this.scene.restart();
            }
            else{
                this.deathTime--;
            }
        }

        

        // Move Left
        if(controls.left.isDown && this.playerHealth > 0) {
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
        } else if(controls.right.isDown && this.playerHealth > 0) {
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
        } else if (this.playerHealth > 0) {
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');

            my.vfx.walking.stop();
        }

        // Player jumping
        if(my.sprite.player.body.velocity.y < 0 && this.playerHealth > 0) {
            my.sprite.player.anims.play('jump');
            this.airTime++;

            my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.jumping.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            my.vfx.jumping.start();
        }

        // Player jump input
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(controls.up) && this.playerHealth > 0) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.sfx.jump.play();
        }

        // Player falling
        if (my.sprite.player.body.velocity.y > 0 && this.playerHealth > 0){
            my.sprite.player.anims.play('fall');
            this.isLanding = true;
        }

        // Player landing
        if (this.isLanding && my.sprite.player.body.blocked.down){
            this.cameras.main.shake(0.1*SECONDS, this.shakeVector.scale(this.airTime * 0.05));
            this.shakeVector.y = this.shakeY;
            this.isLanding = false;
            this.airTime = 0;
            my.sfx.playerLand.play();
            my.vfx.jumping.stop();
        }

        if (controls.dash.isDown && !this.dashUsed && this.playerHealth > 0){
            // Increase player's max speed for the dash
            my.sprite.player.body.maxVelocity = new Phaser.Math.Vector2(this.MaxSpeedX+this.DASH_STRENGTH, this.MaxSpeedY);

            // Dashing left
            if (my.sprite.player.body.velocity.x < 0){
                my.sprite.player.body.setVelocityX(-this.DASH_STRENGTH)
            }
            // Dashing right
            else if (my.sprite.player.body.velocity.x > 0){
                my.sprite.player.body.setVelocityX(this.DASH_STRENGTH);
            }
            my.vfx.dashing.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
            my.vfx.dashing.setParticleSpeed(this.PARTICLE_VELOCITY, 0);
            my.vfx.dashing.start();
            this.dash_length = this.MAX_DASH_LENGTH;
            this.dashUsed = true;
            console.log("dash!")
        }
        if (this.dashUsed){
            this.dash_length--;
        }
        if (this.dash_length <= 0){
            my.sprite.player.body.maxVelocity = new Phaser.Math.Vector2(this.MaxSpeedX, this.MaxSpeedY);
            my.vfx.dashing.stop();
            this.dashUsed = false;
        }

    }
}