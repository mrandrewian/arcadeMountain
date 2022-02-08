import Phaser from 'phaser'

export default class CollisionController {
	private scene: Phaser.Scene
	private sprite: Phaser.Physics.Arcade.Sprite
	private layer: Phaser.Tilemaps.TilemapLayer
	private obj?: Phaser.Physics.Arcade.Sprite

	constructor(
		scene: Phaser.Scene,
		sprite: Phaser.Physics.Arcade.Sprite,
		layer: Phaser.Tilemaps.TilemapLayer,
		obj?: Phaser.Physics.Arcade.Sprite
	) {
		this.scene = scene
		this.sprite = sprite
		this.layer = layer
		this.obj = obj
	}

	private addCollider() {
		this.scene.physics.add.collider(
			this.sprite,
			this.layer,
			this.handleCollision,
			undefined,
			this
		)
	}

	private handleCollision() {}
}
