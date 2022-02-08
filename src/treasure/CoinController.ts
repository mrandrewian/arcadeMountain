import Phaser from 'phaser'
import StateMachine from '../statemachine/StateMachine'
import Coin from './Coin'
import {events} from '../events/EventCenter'

export default class CoinController {
	private scene: Phaser.Scene
	private player: Phaser.Physics.Arcade.Sprite
	private stateMachine: StateMachine
	private activeCoin?: Coin
	private coins: Phaser.Physics.Arcade.StaticGroup

	constructor(
		scene: Phaser.Scene,
		player: Phaser.Physics.Arcade.Sprite,
		coins: Phaser.Physics.Arcade.StaticGroup
	) {
		this.scene = scene
		this.player = player
		this.stateMachine = new StateMachine(this, 'coin')
		this.coins = coins
		this.scene.physics.add.overlap(
			this.player,
			this.coins,
			this.handlePlayerCoinCollision,
			undefined,
			this
		)
	}

	update(dt: number) {
		this.stateMachine.update(dt)

		if (this.activeCoin) {
			this.activeCoin.collect()
		}
	}

	private handlePlayerCoinCollision(
		obj1: Phaser.GameObjects.GameObject,
		obj2: Phaser.GameObjects.GameObject
	) {
		const coin = obj2 as Coin
		this.activeCoin = coin
	}
}
