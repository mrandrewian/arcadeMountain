import Phaser from 'phaser'
import StateMachine from '../statemachine/StateMachine'
import Chest from './Chest'
import {events} from '../events/EventCenter'

type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys
type Sprite = Phaser.Physics.Arcade.Sprite

export default class ChestController {
	private scene: Phaser.Scene
	private player: Sprite
	private stateMachine: StateMachine
	private cursors: CursorKeys
	private activeChest?: Chest

	constructor(
		scene: Phaser.Scene,
		player: Sprite,
		cursors: CursorKeys,
		chests: Phaser.Physics.Arcade.StaticGroup
	) {
		this.scene = scene
		this.player = player
		this.cursors = cursors

		this.stateMachine = new StateMachine(this, 'chestController')

		this.scene.physics.add.overlap(
			this.player,
			chests,
			this.handlePlayerChestCollision,
			undefined,
			this
		)
	}

	update(dt: number) {
		this.stateMachine.update(dt)

		if (
			this.activeChest &&
			Phaser.Input.Keyboard.JustDown(this.cursors.up)
		) {
			this.openChest()
		}
	}

	openChest() {
		this.activeChest?.open()
	}

	private handlePlayerChestCollision(
		obj1: Phaser.GameObjects.GameObject,
		obj2: Phaser.GameObjects.GameObject
	) {
		const chest = obj2 as Chest
		this.activeChest = chest
	}
}
