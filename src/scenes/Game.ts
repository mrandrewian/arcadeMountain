import Phaser from 'phaser'

import PlayerController from '../player/PlayerController'
import ChestController from '../treasure/ChestController'
import Chest from '../treasure/Chest'
import CoinController from '../treasure/CoinController'
import Coin from '../treasure/Coin'
import StarController from '../treasure/StarController'
import Star from '../treasure/Star'
import DinoController from '../enemies/DinoController'
import Dino from '../enemies/Dino'

import {debugDraw} from '../utils/debug'
import {events} from '../events/EventCenter'

export default class Game extends Phaser.Scene {
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
	private player!: Phaser.Physics.Arcade.Sprite
	private playerController?: PlayerController
	private chestController?: ChestController
	private coinController?: CoinController
	private starController?: StarController
	private dinoController?: DinoController
	private chests?: ChestController[] = []
	private coins?: CoinController[] = []
	private stars?: StarController[] = []
	private dinos?: DinoController[] = []
	private star!: Phaser.GameObjects.Star

	constructor() {
		super('game')
	}

	init() {
		this.cursors = this.input.keyboard.createCursorKeys()

		this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
			this.destroy()
		})
	}

	preload() {
		this.cursors = this.input.keyboard.createCursorKeys()
	}

	create() {
		this.scene.launch('game-ui')

		const map = this.make.tilemap({key: 'tiles-map'})
		const tileset = map.addTilesetImage('tiles-extruded', 'tiles')
		const ground = map.createLayer('ground', tileset)
		ground.setCollisionByProperty({collides: true})
		// debugDraw(ground, this)

		this.player = this.physics.add.sprite(43, 456, 'player')

		const chests = this.physics.add.staticGroup({
			classType: Chest,
		})
		const coins = this.physics.add.staticGroup({
			classType: Coin,
		})
		const stars = this.physics.add.staticGroup({
			classType: Star,
		})
		const treasureLayer = map.getObjectLayer('treasure')
		treasureLayer.objects.forEach((obj) => {
			const {x = 0, y = 0, name, width = 0, height = 0} = obj

			switch (name) {
				case 'chest': {
					chests.get(obj.x, obj.y)
					break
				}

				case 'coin': {
					coins.get(obj.x, obj.y)
					break
				}

				case 'star': {
					stars.get(obj.x, obj.y)
					break
				}
			}
		})

		this.chestController = new ChestController(
			this,
			this.player,
			this.cursors,
			chests
		)
		this.coinController = new CoinController(this, this.player, coins)
		this.starController = new StarController(this, this.player, stars)

		const dinos = this.physics.add.group({
			classType: Dino,
		})
		const hazardsLayer = map.getObjectLayer('hazards')
		hazardsLayer.objects.forEach((obj) => {
			const {x = 0, y = 0, name, width = 0, height = 0} = obj

			switch (name) {
				case 'dino': {
					const dino = dinos.get(obj.x, obj.y)
					dino.body.setSize(15, 16)
					break
				}
			}
		})
		this.dinoController = new DinoController(
			this,
			this.player,
			this.cursors,
			ground,
			dinos
		)

		this.playerController = new PlayerController(
			this,
			this.player,
			this.cursors,
			ground,
			dinos,
			map
		)

		this.cameras.main.setZoom(2)
		this.cameras.main.startFollow(this.player)
	}

	destroy() {
		this.scene.stop('ui')
	}

	update(dt: number): void {
		if (this.playerController) {
			this.playerController?.update(dt)
		}
		if (this.chestController) {
			this.chestController.update(dt)
		}
		if (this.coinController) {
			this.coinController.update(dt)
		}
		if (this.dinoController) {
			this.dinoController.update(dt)
		}
		if (this.starController) {
			this.starController.update(dt)
		}
	}
}
