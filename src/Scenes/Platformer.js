class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.MaxSpeed = 400; // Max Player Speed
        this.physics.world.TILE_BIAS = 10; // How strong the tiles keep things from passing through
        this.ACCELERATION = this.MaxSpeed * 7; // Player Acceleration
        this.DRAG = this.MaxSpeed * 10;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -100000; // How heigh the player jumps

        this.shakeY = 0.01 // Y axis for camera shake when landing
        this.isLanding = false; // Keeps track of if the player is landing or not
        this.inAir = false; // Keeps track of if the player is in the air
        this.airTime = 0; // ticks in air

        this.shakeVector = new Phaser.Math.Vector2(0, this.shakeY);
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("level_1", SPRITE_SIZE, SPRITE_SIZE, 140, 30);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("monochrome_tilemap_packed", "tilemap_tiles");

        // Create a layer
        this.groundLayer = this.map.createLayer("Platforms", this.tileset, 0, 0);
        this.groundLayer.setScale(2.0);

        // Make it collidable
        this.groundLayer.setCollisionByProperty({
            collides: true
        });



        this.spwanPoint = this.map.createFromObjects("Objects", {
            name: "spawn_point",
            key: "tilemap_sheet",
            frame: 216
        });


        // set up player avatar
        my.sprite.player = this.physics.add.sprite(this.spwanPoint[0].x, this.spwanPoint[0].y, "platformer", "tile_0260.png").setScale(SCALE);
        my.sprite.player.setCollideWorldBounds(false);
        my.sprite.player.setSize(SPRITE_SIZE, SPRITE_SIZE, true);
        my.sprite.player.setOffset(0, 0);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        my.sprite.player.body.setMaxSpeed(this.MaxSpeed);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true;
            this.physics.world.debugGraphic.clear();
        }, this);

        
        // Camera Settings
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels*4, this.map.heightInPixels*4);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(25, 25);
        this.cameras.main.setZoom(this.SCALE);
        

    }

    update() {
        if(cursors.left.isDown) {
            // TODO: have the player accelerate to the left
            my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.setFlip(true, false);

            my.sprite.player.anims.play('walk', true);

        } else if(cursors.right.isDown) {
            // TODO: have the player accelerate to the right
            my.sprite.player.resetFlip();

            my.sprite.player.body.setAccelerationX(this.ACCELERATION);
            my.sprite.player.anims.play('walk', true);

        } else {
            // TODO: set acceleration to 0 and have DRAG take over
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
            this.isLanding = true;
            this.airTime++;
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            // TODO: set a Y velocity to have the player "jump" upwards (negative Y direction)
            console.log(this.JUMP_VELOCITY);
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }
        if (this.isLanding && my.sprite.player.body.blocked.down){
            console.log(this.airTime)
            this.cameras.main.shake(0.1*SECONDS, this.shakeVector.scale(this.airTime * 0.05));
            console.log(this.shakeVector);
            this.shakeVector.y = this.shakeY;
            console.log(this.shakeVector);
            this.isLanding = false;
            this.airTime = 0;
        }
    }
}