import Phaser from 'phaser'

export default class Preloader extends Phaser.Scene {
	constructor() {
		super('preloader')
	}

	preload() {
		this.load.image('tiles', 'assets/tiles/tiles-extruded.png')
		this.load.tilemapTiledJSON('tiles-map', 'assets/tiles/tiles-map.json')
		this.load.atlas(
			'player',
			'assets/player/player1.png',
			'assets/player/player1.json'
		)
		this.load.atlas(
			'spell',
			'assets/player/spell.png',
			'assets/player/spell.json'
		)
		this.load.atlas(
			'dino',
			'assets/enemies/dino.png',
			'assets/enemies/dino.json'
		)
		this.load.atlas(
			'treasure',
			'assets/treasure/treasure.png',
			'assets/treasure/treasure.json'
		)

		this.load.image('ui-heart-empty', 'assets/ui/ui_heart_empty.png')
		this.load.image('ui-heart-half', 'assets/ui/ui_heart_half.png')
		this.load.image('ui-heart-full', 'assets/ui/ui_heart_full.png')
	}

	create() {
		this.scene.start('game')
	}
}
