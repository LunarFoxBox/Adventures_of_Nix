class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, leftKey, rightKey, jumpKey, attackKey){
        super(scene, x, y, texture, frame);

        this.left = leftKey;
        this.right = rightKey;
        this.jump = jumpKey;

        scene.add.existing(this);
        return this;
    }

    
}