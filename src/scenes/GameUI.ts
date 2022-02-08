import Phaser from 'phaser'

import {events} from '../events/EventCenter'

export default class GameUI extends Phaser.Scene {
	private hearts!: Phaser.GameObjects.Group
	private _coins!: number

	constructor() {
		super({key: 'game-ui'})
	}

	create() {
		this._coins = 0
		const coinPreLabel = this.add.image(
			20,
			54,
			'treasure',
			'coin_anim_f0.png'
		)
		coinPreLabel.scale = 2
		const coinsLabel = this.add.text(30, 37, '0', {
			fontFamily: 'Hoefler Text',
			fontSize: '32px',
			strokeThickness: 2,
			stroke: '#000000',
		})

		this.hearts = this.add.group({
			classType: Phaser.GameObjects.Image,
		})

		events.on('coins-changed', (coins: number) => {
			this._coins += coins
			coinsLabel.text = this._coins.toLocaleString()
		})

		this.hearts.createMultiple({
			key: 'ui-heart-full',
			setXY: {
				x: 20,
				y: 20,
				stepX: 31,
			},
			setScale: {x: 2, y: 2},
			quantity: 4,
		})

		events.on('player-update-hearts', this.handleUpdateHearts, this)

		this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
			events.off('player-update-hearts', this.handleUpdateHearts, this)
			events.off('coins-changed')
		})
	}

	private handleUpdateHearts(health: number) {
		const hpCheck = health / 25 // 25 is based on 100 base HP and shouldn't be set here
		this.hearts.children.each((go, index) => {
			const heart = go as Phaser.GameObjects.Image
			if (index < hpCheck) {
				heart.setTexture('ui-heart-full')
			} else {
				heart.setTexture('ui-heart-empty')
			}
		})
	}
}
