import Phaser from 'phaser'
import StateMachine from '../statemachine/StateMachine'
import {events} from '../events/EventCenter'

type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys
type Sprite = Phaser.Physics.Arcade.Sprite

export default class DinoController {
	private scene: Phaser.Scene
	private player: Sprite
	private cursors: CursorKeys
	private ground: Phaser.Tilemaps.TilemapLayer
	private stateMachine: StateMachine
	private dinos: Phaser.Physics.Arcade.Group

	constructor(
		scene: Phaser.Scene,
		player: Sprite,
		cursors: CursorKeys,
		ground: Phaser.Tilemaps.TilemapLayer,
		dinos: Phaser.Physics.Arcade.Group
	) {
		this.scene = scene
		this.player = player
		this.cursors = cursors
		this.ground = ground
		this.dinos = dinos

		this.stateMachine = new StateMachine(this, 'dinoController')

		this.scene.physics.add.collider(
			this.dinos,
			ground,
			this.handleDinoGroundCollision,
			undefined,
			this
		)

		if (this.dinos) {
			this.dinos.runChildUpdate = true
		}
	}

	private handleDinoGroundCollision(
		obj1: Phaser.GameObjects.GameObject,
		obj2: Phaser.GameObjects.GameObject
	) {
		const dinoBody = obj1.body as Phaser.Physics.Arcade.Body
		if (dinoBody.blocked.left || dinoBody.blocked.right) {
			dinoBody.setVelocityY(-275)
		}
	}

	update(dt: number) {
		this.stateMachine.update(dt)
	}
}
