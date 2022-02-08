import Phaser from 'phaser'
import StateMachine from '../statemachine/StateMachine'
import {events} from '../events/EventCenter'

export default class Coin extends Phaser.Physics.Arcade.Sprite {
	private stateMachine: StateMachine

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		texture: string,
		frame?: string | number
	) {
		super(scene, x, y, texture, frame)
		this.createAnims()
		this.stateMachine = new StateMachine(this, 'coin')

		this.stateMachine
			.addState('coin', {
				onEnter: this.coinOnEnter,
			})
			.addState('coin-collected', {
				onEnter: this.coinCollectedOnEnter,
			})
			.setState('coin')
	}

	collect() {
		this.stateMachine.setState('coin-collected')
	}

	private coinOnEnter() {
		this.play('coin')
	}

	private coinCollectedOnEnter() {
		events.emit('coins-changed', 5)
		this.destroy()
	}

	private createAnims() {
		this.anims.create({
			key: 'coin',
			frames: this.anims.generateFrameNames('treasure', {
				start: 0,
				end: 3,
				prefix: 'coin_anim_f',
				suffix: '.png',
			}),
			frameRate: 7,
			repeat: -1,
		})
	}
}
