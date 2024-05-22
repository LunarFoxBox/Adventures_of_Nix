class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    preload() {
        // Preload for animating tiles
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    init() {
        // variables and settings
        this.MaxSpeedX = 100; // Max player horizontal speed
        this.MaxSpeedY = 1200; // Max player vertical speed
        this.physics.world.TILE_BIAS = 24; // How strong the tiles keep things from passing through
        this.ACCELERATION = 700; // Player Acceleration
        this.DRAG = 1800;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 2000;
        this.JUMP_VELOCITY = -500; // How heigh the player jumps

        // Screen shake variables
        this.shakeY = 0.005 // Y axis for camera shake when landing
        this.isLanding = false; // Keeps track of if the player is landing or not
        this.airTime = 0; // ticks in air
        this.maxAirTime = 200; // Max amount of ticks for air time
        this.shakeVector = new Phaser.Math.Vector2(0, this.shakeY);
        this.shakeStrength = 0.05;
        this.shakeLength = 0.05;

        this.PARTICLE_VELOCITY = 50;

        // Dash variables
        this.DASH_STRENGTH = 400;
        this.isDashing = false;
        this.maxDashDuration = 60;
        this.dashDuration = this.maxDashDuration;
        this.maxDashCooldown = 180;
        this.dashCooldown = this.maxDashCooldown;

        // Tracks if the player can double jump
        this.canDoubleJump = true;

        this.hasPowerUp = false; // Bool to check if powerUp is collected
        this.powerUpStrength = 1.3; // Strength of powerup
        this.powerUpMaxDuration = 10 * 60; // Ticks that powerup is active for
        this.powerUpDuration = 0;
        this.powerUpFirstRun = true;

        // Vertical Strength of spring
        this.SPRING_STRENGTH = -1200;

        // Player Health variables
        this.playerHealth = 3;
        this.maxInvincibilityTime = 90;
        this.invincibilityTime = this.maxInvincibilityTime;
        this.deathTime = 60 * 3;

        // Reset UI elements
        this.events.emit('reset');
    }
    

    create() {
        this.map = this.add.tilemap("level_1", SPRITE_SIZE, SPRITE_SIZE, 140, 30);
        
        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("tilemap_packed", "tilemap_tiles");

        // Create ground layer
        this.groundLayer = this.map.createLayer("Ground", this.tileset, 0, 0);

        // Create platform layer
        this.platformLayer = this.map.createLayer("Platforms", this.tileset, 0, 0);
        
        // Create background layer
        this.backgroundLayer = this.map.createLayer("Background", this.tileset, 0, 0);

        // Create grass layer
        this.grassLayer = this.map.createLayer("Grass", this.tileset, 0, 0);
        
        // Animate grass
        this.animatedTiles.init(this.map);


        // Make ground and platforms collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });
        this.platformLayer.setCollisionByProperty({
            collides: true
        })


        // Create Spawn Point for player
        this.spwanPoint = this.map.createFromObjects("Special", {
            name: "spawn_point",
            key: "tilemap_sheet",
            frame: 216
        });

        // Create End Point
        this.endPoint = this.map.createFromObjects("Special", {
            name: "end_point",
            key: "tilemap_sheet",
            frame: 56
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

        // Create spikes from objects
        this.spikes = this.map.createFromObjects("Spikes", {
            name: "spike",
            key: "tilemap_sheet",
            frame: 183
        });
        
        // Create springs from objects
        this.springs = this.map.createFromObjects("Springs", {
            name: "spring",
            key: "tilemap_sheet",
            frame: 163
        });

        // Create gems from objects
        this.gems = this.map.createFromObjects("Gems", {
            name: "gem",
            key: "tilemap_sheet",
            frame: 102
        });


        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.springs, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.gems, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.endPoint, Phaser.Physics.Arcade.STATIC_BODY);


        // Create Phaser groups for objects that will be used for collision detection
        this.coinGroup = this.add.group(this.coins);
        this.spikeGroup = this.add.group(this.spikes)
        this.springGroup = this.add.group(this.springs);
        this.gemGroup = this.add.group(this.gems);
        
        


        // set up player avatar
        my.sprite.player = this.physics.add.sprite(this.spwanPoint[0].x, this.spwanPoint[0].y, "platformer_characters", "tile_0260.png");//.setScale(SCALE);
        my.sprite.player.setCollideWorldBounds(false);
        my.sprite.player.setSize(SPRITE_SIZE, SPRITE_SIZE, true);
        my.sprite.player.setOffset(0, 0);

        // Set player's max speed
        my.sprite.player.body.maxVelocity = new Phaser.Math.Vector2(this.MaxSpeedX, this.MaxSpeedY);

        // Enable collision handling for ground and platforms
        this.groundCollision = this.physics.add.collider(my.sprite.player, this.groundLayer);
        this.platformCollision = this.physics.add.collider(my.sprite.player, this.platformLayer);




        // VFX
        // movement vfx
        my.vfx.walking = this.add.particles(0, 0, "particles", {
            frame: ['dirt_01.png', 'dirt_03.png'],
            scale: {start: 0.02, end: 0.01},
            maxAliveParticles: 2,
            lifespan: 350,
            alpha: {start: 1, end: 0.4}, 
            follow: my.sprite.player,  // a game object or an arcade physics object
	        followOffset: { x: 0, y: 6 },  // offset from object for emitter location

        });
        my.vfx.walking.setParticleSpeed(0, 0);
        my.vfx.walking.stop();

        // Dash vfx
        my.vfx.dashing = this.add.particles(0, 0, "platformer_characters", {
            frame: ['tile_0260.png'],
            scale: {start: 1, end: 1},
            lifespan: 300,
            alpha: {start: 0.5, end: 0.1},
            stopAfter: 40
        });
        my.vfx.dashing.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
        my.vfx.dashing.setParticleSpeed(0, 0);
        my.vfx.dashing.stop();

        // Jump vfx
        my.vfx.jumping = this.add.particles(0, 0, "particles", {
            frame: ['spark_05.png', 'spark_06.png'],
            scale: {start: 0.08, end: 0.08},
            delay: 200,
            lifespan: 100,
            alpha: {start: 0.5, end: 0.1},
            stopAfter: 2
        });
        my.vfx.jumping.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
        my.vfx.jumping.setParticleSpeed(0, 0);
        my.vfx.jumping.stop();

        // Landing vfx
        my.vfx.landing = this.add.particles(0, 0, "particles", {
            frame: ['dirt_02.png'],
            scale: {start: 0.02, end: 0.05},
            lifespan: 200,
            alpha: {start: 1, end: 0.4},
            stopAfter: 10
        });
        my.vfx.landing.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);
        my.vfx.landing.setParticleSpeed(100, 0);
        my.vfx.landing.stop();

        // Coin vfx
        my.vfx.coinPickup = this.add.particles(0, 0, "particles", {
            frame: ['light_01.png', 'light_02.png', 'light_03.png'],
            scale: {start: 0.09, end: 0.05},
            lifespan: 200,
            alpha: {start: 0.5, end: 0.03},
            stopAfter: 3
        });
        my.vfx.coinPickup.stop();

        // Hurt vfx
        my.vfx.hurt = this.add.particles(0, 0, 'particles', {
            frame: ['magic_03.png', 'magic_04.png'],
            
            scale: {start: 0.09, end: 0.05},
            lifespan: 100,
            alpha: {start: 0.8, end: 0.1},
            stopAfter: 2
        });
        my.vfx.hurt.stop();

        

        // Coin collision
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            // Play effects on coin pickup
            my.vfx.coinPickup.x = obj2.x;
            my.vfx.coinPickup.y = obj2.y;
            my.sfx.coinPickup.play();
            my.vfx.coinPickup.start();

            obj2.destroy();
            this.events.emit('got_coin');
        });

        // Spike collision
        this.physics.add.overlap(my.sprite.player, this.spikeGroup, (obj1, obj2) => {
            if (this.playerHealth > 0 && this.invincibilityTime <= 0){
                my.vfx.hurt.startFollow(my.sprite.player, my.sprite.player.displayWidth/2, my.sprite.player.displayHeight/2, false);
                my.sfx.playerHurt.play();
                my.vfx.hurt.start();

                // Subtract one from player health and give them temporary invincibility
                this.playerHealth--;
                this.invincibilityTime = this.maxInvincibilityTime;
                this.events.emit('hurt');
            }
        });
        
        // Spring collision
        this.physics.add.overlap(my.sprite.player, this.springGroup, (obj1, obj2) => {
            // Launch the player up by the spring's strength
            my.sprite.player.body.setVelocityY(this.SPRING_STRENGTH);
        })

        // Gem collision
        this.physics.add.overlap(my.sprite.player, this.gemGroup, (obj1, obj2) => {
            this.hasPowerUp = true;
            this.powerUpDuration += this.powerUpMaxDuration;
            obj2.destroy();
            this.events.emit('got_gem');
        })

        // End Point collision (Player Win condition)
        this.physics.add.overlap(my.sprite.player, this.endPoint, (obj1, obj2) => {
            this.scene.start('winScreen');
        })



         // Camera Settings
         this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25);
         this.cameras.main.setViewport(400, 0, this.map.widthInPixels/2, this.map.heightInPixels);
         this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
         this.cameras.main.setDeadzone(50, 25);
         this.cameras.main.setZoom(SCALE);


         // set up control input
        controls = this.input.keyboard.addKeys(
            {
            'up': Phaser.Input.Keyboard.KeyCodes.W,
            'down': Phaser.Input.Keyboard.KeyCodes.S,
            'left': Phaser.Input.Keyboard.KeyCodes.A,
            'right': Phaser.Input.Keyboard.KeyCodes.D,
        });

        // Handles the dash
        this.input.keyboard.on(`keydown-SPACE`, ()=>{
            if (this.dashCooldown <= 0){
                // Dashing left
                if (my.sprite.player.body.velocity.x < 0){
                    my.sprite.player.body.maxVelocity = new Phaser.Math.Vector2(this.MaxSpeedX+this.DASH_STRENGTH, this.MaxSpeedY);
                    this.isDashing = true;
                    this.dashDuration = this.maxDashDuration;

                    my.sprite.player.body.setVelocityX(-this.DASH_STRENGTH)
                    my.vfx.dashing.start();
                    my.sfx.dash.play();
                }
                // Dashing right
                else if (my.sprite.player.body.velocity.x > 0){
                    my.sprite.player.body.maxVelocity = new Phaser.Math.Vector2(this.MaxSpeedX+this.DASH_STRENGTH, this.MaxSpeedY);
                    this.isDashing = true;
                    this.dashDuration = this.maxDashDuration;

                    my.sprite.player.body.setVelocityX(this.DASH_STRENGTH);
                    my.vfx.dashing.start();
                    my.sfx.dash.play();
                }
            }
            
        });

        // Double Jump
        this.doubleJump = ()=>{
            if (this.canDoubleJump && Phaser.Input.Keyboard.JustDown(controls.up)){
                this.canDoubleJump = false;
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            }
        }
    }
    
    update() {
        this.invincibilityTime--;
        
        // Check if the player is not alive
        if (this.playerHealth <= 0){
            // Set the player to death animation and stop them in place to avoid sliding
            my.sprite.player.anims.play('player_death', true);
            my.sprite.player.body.setAcceleration(0,0);
            
            // Wait a moment before bringing up death screen
            if (this.deathTime <= 0){
                my.sprite.player.anims.stop();
                this.scene.start('deathScreen');
            }
            else{
                this.deathTime--;
            }
        }

        // Activate the power up's effect if it was collected
        if (this.hasPowerUp){
            if (this.powerUpFirstRun){
                this.JUMP_VELOCITY *= this.powerUpStrength;
                this.powerUpFirstRun = false;
            }
            this.powerUpDuration--; // Decrease the power up's duration

            // End the power up's effect if it's duration has ended
            if (this.powerUpDuration <= 0){
                this.powerUpDuration = this.powerUpMaxDuration;
                this.hasPowerUp = false;
                this.powerUpFirstRun = true;
                this.JUMP_VELOCITY /= this.powerUpStrength;
            }
        }


        // Move Left
        if(controls.left.isDown && this.playerHealth > 0) {
            my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            // Only play smoke effect if touching the ground
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
            }

        // Move Right
        } else if(controls.right.isDown && this.playerHealth > 0) {
            my.sprite.player.resetFlip();

            my.sprite.player.body.setAccelerationX(this.ACCELERATION);
            my.sprite.player.anims.play('walk', true);

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

        // Dashing
        if (this.isDashing){
            this.dashDuration--;
            if (this.dashDuration <= 0){
                this.isDashing = false;
                this.dashCooldown = this.maxDashCooldown;
                my.sprite.player.body.maxVelocity = new Phaser.Math.Vector2(this.MaxSpeedX, this.MaxSpeedY);
            }
        }
        else{
            this.dashCooldown--;
        }


        // Player jump input
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(controls.up) && this.playerHealth > 0) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            my.sfx.jump.play();
            my.vfx.jumping.start();
            this.platformCollision.active = false;
        }

        // Player jumping
        if(my.sprite.player.body.velocity.y < 0 && this.playerHealth > 0) {
            my.sprite.player.anims.play('jump');
            this.airTime++;
            // Check if player is double jumping
            this.doubleJump();
        }

        // Player falling
        if (my.sprite.player.body.velocity.y > 0 && this.playerHealth > 0){
            my.sprite.player.anims.play('fall');
            this.isLanding = true;
            this.platformCollision.active = true;
            // Check if player is doubling jumping
            this.doubleJump();
        }

        // Player landing
        if (this.isLanding && my.sprite.player.body.blocked.down){
            if (this.airTime > this.maxAirTime){ this.airTime = this.maxAirTime} // Cap the airtime modifier
            // Shake camera on landing
            this.cameras.main.shake(this.shakeLength*SECONDS, this.shakeVector.scale(this.airTime * this.shakeStrength));
            this.shakeVector.y = this.shakeY;

            // Stop player and reset jump related variables
            my.sprite.player.body.velocity.x = 0;
            this.canDoubleJump = true;
            this.isLanding = false;
            this.airTime = 0;

            // Play effects on landing
            my.sfx.playerLand.play();
            my.vfx.landing.start()
        }
    }
}