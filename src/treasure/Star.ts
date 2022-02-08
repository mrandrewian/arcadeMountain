import Phaser from 'phaser'
import StateMachine from '../statemachine/StateMachine'
import {events} from '../events/EventCenter'

export default class Star extends Phaser.GameObjects.Star {
	private stateMachine: StateMachine

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		texture: string,
		frame?: string | number
	) {
		super(scene, x, y, 7, 8, 12, 0xffbf00)
		this.stateMachine = new StateMachine(this, 'star')

		this.stateMachine
			.addState('star', {
				onEnter: this.starOnEnter,
			})
			.addState('star-collected', {
				onEnter: this.starCollectedOnEnter,
			})
			.setState('star')
	}

	collect() {
		this.stateMachine.setState('star-collected')
	}

	private starOnEnter() {
		this.isFilled = true
		this.isStroked = true
		this.strokeColor = 0xa67c00
		this.scene.add
			.text(this.x, this.y, 'S', {
				color: '#000',
			})
			.setOrigin(0.5, 0.5)
			.setDepth(1)
	}

	private starCollectedOnEnter() {
		this.scene.scene.start('game-over')
	}

	update(dt: number) {
		this.setAngle(dt * 0.1)
	}
}
