import Phaser from 'phaser'
import StateMachine from '../statemachine/StateMachine'
import {events} from '../events/EventCenter'

export default class Chest extends Phaser.Physics.Arcade.Sprite {
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
		this.stateMachine = new StateMachine(this, 'chest')

		this.stateMachine
			.addState('chest-closed', {
				onEnter: this.chestClosedOnEnter,
			})
			.addState('chest-open', {
				onEnter: this.chestOpenOnEnter,
			})
			.setState('chest-closed')

		this.on('animationcomplete', (animData) => {
			if (animData.key == 'chest-empty') {
				this.destroy()
			}
		})
	}

	open() {
		this.stateMachine.setState('chest-open')
	}

	private chestClosedOnEnter() {
		this.play('chest-closed')
	}

	private chestOpenOnEnter() {
		this.play('chest-open')
		this.chain('chest-empty')
		const coins = Phaser.Math.Between(50, 200)
		events.emit('coins-changed', coins)
	}

	private createAnims() {
		this.anims.create({
			key: 'chest-open',
			frames: this.anims.generateFrameNames('treasure', {
				start: 0,
				end: 2,
				prefix: 'chest_full_open_anim_f',
				suffix: '.png',
			}),
			frameRate: 3,
		})
		this.anims.create({
			key: 'chest-closed',
			frames: [{key: 'treasure', frame: 'chest_full_open_anim_f0.png'}],
		})
		this.anims.create({
			key: 'chest-empty',
			frames: this.anims.generateFrameNames('treasure', {
				start: 2,
				end: 0,
				prefix: 'chest_empty_open_anim_f',
				suffix: '.png',
			}),
			frameRate: 3,
		})
	}
}
