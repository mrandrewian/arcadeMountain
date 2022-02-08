import Phaser from 'phaser'
import StateMachine from '../statemachine/StateMachine'
import Dino from '../enemies/Dino'
import {events} from '../events/EventCenter'

type Sprite = Phaser.Physics.Arcade.Sprite

export default class SpellController {
	private scene: Phaser.Scene
	private player: Sprite
	private ground: Phaser.Tilemaps.TilemapLayer
	private dinos: Phaser.Physics.Arcade.Group
	private stateMachine: StateMachine
	private activeDino?: Dino
	private spell: Phaser.Physics.Arcade.Sprite
	private playerFacing: string

	constructor(
		scene: Phaser.Scene,
		player: Phaser.Physics.Arcade.Sprite,
		ground: Phaser.Tilemaps.TilemapLayer,
		dinos: Phaser.Physics.Arcade.Group,
		playerFacing: string
	) {
		this.scene = scene
		this.player = player
		this.ground = ground
		this.dinos = dinos
		this.playerFacing = playerFacing

		this.stateMachine = new StateMachine(this, 'spell')

		this.spell = this.scene.physics.add
			.sprite(this.player.x, this.player.y, 'spell')
			.setImmovable(false)
			.setSize(30, 30)
		const spellBody = this.spell.body as Phaser.Physics.Arcade.Body
		spellBody.setAllowGravity(false)

		this.spell.setGravity(0).setScale(0.3)
		if (this.playerFacing == 'right') {
			this.spell.setVelocity(100, 0)
		} else {
			this.spell.setVelocity(-100, 0)
		}
		this.createAnims()

		this.stateMachine
			.addState('idle', {
				onEnter: this.idleOnEnter,
				onUpdate: this.idleOnUpdate,
			})
			.addState('explode', {
				onEnter: this.explodeOnEnter,
			})
			.setState('idle')

		// spell to dino
		this.scene.physics.add.overlap(
			this.spell,
			this.dinos,
			this.handleSpellDinoCollision,
			undefined,
			this
		)

		// spell to ground
		this.scene.physics.add.collider(
			this.spell,
			this.ground,
			this.handleSpellGroundCollision,
			undefined,
			this
		)
	}

	create() {}

	update(dt: number) {
		this.stateMachine.update(dt)
	}

	private idleOnEnter() {
		this.spell.play('spell-idle')
	}

	private idleOnUpdate() {}

	private explodeOnEnter() {
		this.spell.play('spell-explode')
	}

	private handleSpellDinoCollision(
		obj1: Phaser.GameObjects.GameObject,
		obj2: Phaser.GameObjects.GameObject
	) {
		const dino = obj2 as Dino
		this.spell.setVelocityX(0)
		this.spell.play('spell-explode')
		this.spell.on('animationcomplete', (animData) => {
			if (animData.key == 'spell-explode') {
				this.spell.destroy()
			}
		})
		dino.destroy()
	}

	private handleSpellGroundCollision(obj1: Phaser.GameObjects.GameObject) {
		const activeSpell = obj1
		activeSpell.destroy()
	}

	private createAnims() {
		this.scene.anims.create({
			key: 'spell-idle',
			frames: [{key: 'spell', frame: 'tile001.png'}],
		})
		this.scene.anims.create({
			key: 'spell-explode',
			frames: this.scene.anims.generateFrameNames('spell', {
				start: 2,
				end: 39,
				prefix: 'tile',
				suffix: '.png',
				zeroPad: 3,
			}),
			frameRate: 100,
		})
	}
}
