import Phaser from 'phaser'
import StateMachine from '../statemachine/StateMachine'
import {events} from '../events/EventCenter'

export default class Dino extends Phaser.Physics.Arcade.Sprite {
	private stateMachine: StateMachine
	private moveTimeLeft = 0
	private moveTimeRight = 0
	private moveTimeThreshold = 0
	private snapshotTime = 0

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		texture: string,
		frame?: string | number
	) {
		super(scene, x, y, texture, frame)
		this.createAnims()
		this.stateMachine = new StateMachine(this, 'dino')

		this.stateMachine
			.addState('idle', {
				onEnter: this.idleOnEnter,
			})
			.addState('move-left', {
				onEnter: this.moveLeftOnEnter,
				onUpdate: this.moveLeftOnUpdate,
			})
			.addState('move-right', {
				onEnter: this.moveRightOnEnter,
				onUpdate: this.moveRightOnUpdate,
			})
			.addState('kick', {
				onEnter: this.kickOnEnter,
			})
			.addState('death', {
				onEnter: this.deathOnEnter,
			})
			.setState('idle')
	}

	private idleOnEnter() {
		this.play('idle')
		const r = Phaser.Math.Between(1, 100)
		if (r < 50) {
			this.stateMachine.setState('move-left')
		} else {
			this.stateMachine.setState('move-right')
		}
	}

	private moveLeftOnEnter() {
		this.moveTimeLeft = 0
		this.moveTimeThreshold = Phaser.Math.Between(125000, 275000)
		this.play('walk')
		this.flipX = true
	}

	private moveLeftOnUpdate(dt: number) {
		this.moveTimeLeft += dt
		this.setVelocityX(-30)
		if (
			this.snapshotTime != 0 &&
			this.moveTimeLeft - this.snapshotTime > this.moveTimeThreshold
		) {
			this.snapshotTime = this.moveTimeLeft
			this.moveTimeLeft = 0
			this.stateMachine.setState('move-right')
		}
		if (
			this.snapshotTime == 0 &&
			this.moveTimeLeft > this.moveTimeThreshold
		) {
			this.snapshotTime = this.moveTimeLeft
			this.moveTimeLeft = 0
			this.stateMachine.setState('move-right')
		}
	}

	private moveRightOnEnter() {
		this.moveTimeRight = 0
		this.moveTimeThreshold = Phaser.Math.Between(125000, 250000)
		this.play('walk')
		this.flipX = false
	}

	private moveRightOnUpdate(dt: number) {
		this.moveTimeRight += dt
		this.setVelocityX(30)
		if (
			this.snapshotTime != 0 &&
			this.moveTimeRight - this.snapshotTime > this.moveTimeThreshold
		) {
			this.snapshotTime = this.moveTimeRight
			this.moveTimeRight = 0
			this.stateMachine.setState('move-left')
		}
		if (
			this.snapshotTime == 0 &&
			this.moveTimeRight > this.moveTimeThreshold
		) {
			this.snapshotTime = this.moveTimeRight
			this.moveTimeRight = 0
			this.stateMachine.setState('move-left')
		}
	}

	private kickOnEnter() {
		this.play('kick')
	}

	private deathOnEnter() {
		this.destroy()
	}

	update(dt: number) {
		this.stateMachine.update(dt)
	}

	private createAnims() {
		this.anims.create({
			key: 'idle',
			frames: this.anims.generateFrameNames('dino', {
				start: 1,
				end: 4,
				prefix: 'idle (',
				suffix: ').png',
			}),
			frameRate: 10,
			repeat: -1,
		})
		this.anims.create({
			key: 'kick',
			frames: this.anims.generateFrameNames('dino', {
				start: 1,
				end: 3,
				prefix: 'kick (',
				suffix: ').png',
			}),
			frameRate: 10,
		})
		this.anims.create({
			key: 'walk',
			frames: this.anims.generateFrameNames('dino', {
				start: 2,
				end: 7,
				prefix: 'walk (',
				suffix: ').png',
			}),
			frameRate: 10,
			repeat: -1,
		})
	}
}
