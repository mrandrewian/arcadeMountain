import Phaser from 'phaser'
import StateMachine from '../statemachine/StateMachine'
import Star from './Star'
import {events} from '../events/EventCenter'

export default class StarController {
	private scene: Phaser.Scene
	private player: Phaser.Physics.Arcade.Sprite
	private stateMachine: StateMachine
	private activeStar?: Star
	private stars: Phaser.Physics.Arcade.StaticGroup

	constructor(
		scene: Phaser.Scene,
		player: Phaser.Physics.Arcade.Sprite,
		stars: Phaser.Physics.Arcade.StaticGroup
	) {
		this.scene = scene
		this.player = player
		this.stateMachine = new StateMachine(this, 'star')
		this.stars = stars
		this.scene.physics.add.overlap(
			this.player,
			this.stars,
			this.handlePlayerStarCollision,
			undefined,
			this
		)

		if (this.stars) {
			this.stars.runChildUpdate = true
		}
	}

	update(dt: number) {
		this.stateMachine.update(dt)

		if (this.activeStar) {
			this.activeStar.collect()
		}
	}

	private handlePlayerStarCollision(
		obj1: Phaser.GameObjects.GameObject,
		obj2: Phaser.GameObjects.GameObject
	) {
		const coin = obj2 as Star
		this.activeStar = coin
	}
}
