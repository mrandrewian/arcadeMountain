import Phaser from 'phaser'
import StateMachine from '../statemachine/StateMachine'
import SpellController from './SpellController'
import {events} from '../events/EventCenter'

type CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys

export default class PlayerController {
	private scene: Phaser.Scene
	private player: Phaser.Physics.Arcade.Sprite
	private playerFacing: string
	private spellController?: SpellController
	private cursors: CursorKeys
	private ground: Phaser.Tilemaps.TilemapLayer
	private dinos: Phaser.Physics.Arcade.Group
	private map: Phaser.Tilemaps.Tilemap
	private stateMachine: StateMachine
	private _health = 100
	private isGrounded = false
	private lastHazard?: Phaser.Physics.Matter.Sprite
	private playerDinoCollider: Phaser.Physics.Arcade.Collider

	constructor(
		scene: Phaser.Scene,
		player: Phaser.Physics.Arcade.Sprite,
		cursors: CursorKeys,
		ground: Phaser.Tilemaps.TilemapLayer,
		dinos: Phaser.Physics.Arcade.Group,
		map: Phaser.Tilemaps.Tilemap
	) {
		this.scene = scene
		this.player = player
		this.playerFacing = 'right'
		this.cursors = cursors
		this.ground = ground
		this.dinos = dinos
		this.map = map
		this.createAnims()
		this.stateMachine = new StateMachine(this, 'player')

		this.player.setDepth(1)

		this.stateMachine
			.addState('idle', {
				onEnter: this.idleOnEnter,
				onUpdate: this.idleOnUpdate,
			})
			.addState('walk', {
				onEnter: this.walkOnEnter,
				onUpdate: this.walkOnUpdate,
				onExit: this.walkOnExit,
			})
			.addState('jump', {
				onEnter: this.jumpOnEnter,
				onUpdate: this.jumpOnUpdate,
				onExit: this.jumpOnExit,
			})
			.addState('fall', {
				onEnter: this.fallOnEnter,
				onUpdate: this.fallOnUpdate,
			})
			.addState('hazard-hit', {
				onEnter: this.hazardHitOnEnter,
				onUpdate: this.hazardHitOnUpdate,
			})
			.addState('dead', {
				onEnter: this.deadOnEnter,
			})
			.setState('idle')

		this.scene.physics.add.collider(
			this.player,
			ground,
			this.handlePlayerGroundCollision,
			undefined,
			this
		)

		this.playerDinoCollider = this.scene.physics.add.collider(
			this.player,
			dinos,
			this.handlePlayerDinoCollision,
			undefined,
			this
		)
	}

	update(dt: number) {
		this.stateMachine.update(dt)
		if (this.player.body.velocity.y > 0) {
			this.stateMachine.setState('fall')
		}
		if (Phaser.Input.Keyboard.JustDown(this.cursors.shift)) {
			this.castSpell()
		}
	}

	private setHealth(value: number) {
		this._health = Phaser.Math.Clamp((this._health += value), 0, 100)
		// 'health-changed and other similar values should be updated to use an enum which should help with spelling mistakes, etc
		events.emit('player-update-hearts', this._health)

		if (this._health <= 0) {
			this.stateMachine.setState('dead')
		}
	}

	private handlePlayerGroundCollision() {
		const playerBody = this.player.body as Phaser.Physics.Arcade.Body
		if (!this.isGrounded && playerBody.onFloor()) {
			this.stateMachine.setState('idle')
			this.isGrounded = true
		}
	}

	private handlePlayerDinoCollision(obj1, obj2) {
		const dino = obj2
		this.lastHazard = dino
		this.stateMachine.setState('hazard-hit')
	}

	private idleOnEnter() {
		this.player.setVelocityX(0)
		this.player.play('player-idle')
	}

	private idleOnUpdate() {
		if (this.cursors.left.isDown || this.cursors.right.isDown) {
			this.stateMachine.setState('walk')
		}

		const spaceJustPressed = Phaser.Input.Keyboard.JustDown(
			this.cursors.space
		)
		if (spaceJustPressed && this.isGrounded) {
			this.stateMachine.setState('jump')
		}
	}

	private walkOnEnter() {
		this.player.play('player-walk')
	}

	private walkOnUpdate() {
		const speed = 200

		if (this.cursors.left.isDown) {
			this.player.flipX = true
			this.player.setVelocityX(-speed)
			this.playerFacing = 'left'
		} else if (this.cursors.right.isDown) {
			this.player.flipX = false
			this.player.setVelocityX(speed)
			this.playerFacing = 'right'
		} else {
			this.player.setVelocityX(0)
			this.stateMachine.setState('idle')
		}

		const spaceJustPressed = Phaser.Input.Keyboard.JustDown(
			this.cursors.space
		)
		if (spaceJustPressed && this.isGrounded) {
			this.stateMachine.setState('jump')
		}
	}

	private walkOnExit() {
		this.player.stop()
	}

	private jumpOnEnter() {
		this.isGrounded = false
		this.player.play('player-jump')
		this.player.setVelocityY(-400)
	}

	private jumpOnUpdate() {
		const speed = 175

		if (this.cursors.left.isDown) {
			this.player.flipX = true
			this.player.setVelocityX(-speed)
			this.playerFacing = 'left'
		} else if (this.cursors.right.isDown) {
			this.player.flipX = false
			this.player.setVelocityX(speed)
			this.playerFacing = 'right'
		} else {
			this.player.setVelocityX(0)
		}
	}

	private jumpOnExit() {
		this.isGrounded = false
		this.player.play('player-jump')
	}

	private fallOnEnter() {
		this.player.play('player-fall')
	}

	private fallOnUpdate() {
		const speed = 200

		if (this.cursors.left.isDown) {
			this.player.flipX = true
			this.player.setVelocityX(-speed)
			this.playerFacing = 'left'
		} else if (this.cursors.right.isDown) {
			this.player.flipX = false
			this.player.setVelocityX(speed)
			this.playerFacing = 'right'
		} else {
			this.player.setVelocityX(0)
			this.stateMachine.setState('idle')
		}
	}

	private hazardHitOnEnter() {
		this.player.play('player-hit')

		// this calculation could use some attention
		if (this.lastHazard) {
			if (this.player.x < this.lastHazard.x) {
				this.player.setVelocityX(-200)
			} else {
				this.player.setVelocityX(200)
			}
			this.player.setVelocityY(-200)
			this.lastHazard.setVelocityY(-100)
		} else {
			this.player.setVelocityX(-200)
		}

		const startColor = Phaser.Display.Color.ValueToColor(0xffffff)
		const endColor = Phaser.Display.Color.ValueToColor(0xff0000)

		this.scene.tweens.addCounter({
			from: 0,
			to: 100,
			duration: 100,
			repeat: 2,
			yoyo: true,
			ease: Phaser.Math.Easing.Sine.InOut,
			onUpdate: (tween) => {
				const value = tween.getValue()
				const colorObject =
					Phaser.Display.Color.Interpolate.ColorWithColor(
						startColor,
						endColor,
						100,
						value
					)
				const color = Phaser.Display.Color.GetColor(
					colorObject.r,
					colorObject.g,
					colorObject.b
				)
				this.player.setTint(color)
			},
		})

		this.setHealth(-25)
	}

	private hazardHitOnUpdate() {
		// if (this.cursors.left.isDown || this.cursors.right.isDown) {
		// 	this.stateMachine.setState('walk')
		// }
		// const speed = 200
		// if (this.cursors.left.isDown) {
		// 	this.player.flipX = true
		// 	this.player.setVelocityX(-speed)
		// } else if (this.cursors.right.isDown) {
		// 	this.player.flipX = false
		// 	this.player.setVelocityX(speed)
		// }
	}

	private deadOnEnter() {
		this.scene.physics.world.removeCollider(this.playerDinoCollider)

		this.scene.tweens.add({
			targets: this.player,
			alpha: 0,
			duration: 2000,
		})

		this.scene.tweens.add({
			targets: this.scene.cameras.main,
			zoom: 15,
			ease: 'Linear',
			duration: 1500,
		})

		this.scene.time.delayedCall(2500, () => {
			this.scene.scene.start('game-over')
		})
	}

	private castSpell() {
		this.spellController = new SpellController(
			this.scene,
			this.player,
			this.ground,
			this.dinos,
			this.playerFacing
		)
	}

	private createAnims() {
		this.player.anims.create({
			key: 'player-idle',
			frameRate: 3,
			frames: this.player.anims.generateFrameNames('player', {
				start: 1,
				end: 2,
				prefix: 'PlayerIdle',
				suffix: '.png',
			}),
			repeat: -1,
		})

		this.player.anims.create({
			key: 'player-walk',
			frameRate: 10,
			frames: this.player.anims.generateFrameNames('player', {
				start: 1,
				end: 5,
				prefix: 'Playerwalk',
				suffix: '.png',
			}),
			repeat: -1,
		})

		this.player.anims.create({
			key: 'player-jump',
			frames: [
				{
					key: 'player',
					frame: 'PlayerJump.png',
				},
			],
		})

		this.player.anims.create({
			key: 'player-fall',
			frameRate: 3,
			frames: this.player.anims.generateFrameNames('player', {
				start: 1,
				end: 2,
				prefix: 'PlayerFall',
				suffix: '.png',
			}),
			repeat: -1,
		})

		this.player.anims.create({
			key: 'player-attack',
			frameRate: 3,
			frames: this.player.anims.generateFrameNames('player', {
				start: 1,
				end: 4,
				prefix: 'PlayerAttack',
				suffix: '.png',
			}),
			repeat: -1,
		})

		this.player.anims.create({
			key: 'player-hit',
			frameRate: 3,
			frames: this.player.anims.generateFrameNames('player', {
				start: 1,
				end: 2,
				prefix: 'PlayerHit',
				suffix: '.png',
			}),
			repeat: -1,
		})

		this.player.anims.create({
			key: 'player-dead',
			frameRate: 10,
			frames: this.player.anims.generateFrameNames('player', {
				start: 1,
				end: 8,
				prefix: 'PlayerDead',
				suffix: '.png',
			}),
			repeat: -1,
		})
	}
}
