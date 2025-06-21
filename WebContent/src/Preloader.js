BasicGame.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;
	this.loadingText = null;
	this.progressText = null;

	this.ready = false;

};

BasicGame.Preloader.prototype = {

	preload: function () {

		//	These are the assets we loaded in Boot.js
		//	A nice sparkly background and a loading progress bar
		this.background = this.add.sprite(0, 0, 'preloaderBackground');

		//	Here we load the rest of the assets our game needs.
		//	As this is just a Project Template I've not provided these assets, the lines below won't work as the files themselves will 404, they are just an example of use.
		//this.load.image('titlepage', 'images/title.png');
		this.load.image('background2', 'images/background2.png');
		//this.load.atlas('playButton', 'images/play_button.png', 'images/play_button.json');
		//this.load.audio('titleMusic', ['audio/main_menu.mp3']);
		//this.load.bitmapFont('caslon', 'fonts/caslon.png', 'fonts/caslon.xml');
		//	+ lots of other required assets here
		
		this.load.image('claw', 'assets/sprites/claw_open.png');
		this.load.image('claw_closed', 'assets/sprites/claw_closed.png');
        this.load.image('claw_rope', 'assets/sprites/claw_rope.png');
        this.load.image('claw_box', 'assets/sprites/claw_box.png');
        this.load.image('claw_pip', 'assets/sprites/claw_pip.png');
        // for(var i = 1;i < 11;i++){
		// 	this.load.image('sprite_' + i,'assets/sprites/' + i + '.png');
         //    this.load.image('sprite_' + i + "1",'assets/sprites/' + i + '1.png');
		// }
		this.load.physics('physicsData', 'assets/physics/sprites.json');
		this.load.tilemap('level1','assets/maps/map.json?v=2',null,Phaser.Tilemap.TILED_JSON);
		this.load.image('world', 'assets/maps/map.png');

		//this.load.image('btn_play_up','assets/button/btn_play_up.png');

        // 載入單獨的掉落物圖片（註解掉精靈圖集）
        // this.load.atlasJSONHash('sprites', 'assets/sprites/01/sprites.png', 'assets/sprites/01/sprites.json');
        // this.load.physics('spritePhysics', 'assets/sprites/01/physics.json');
        
        // 載入單獨的圖片檔案
        for(var i = 1; i <= 12; i++){
            this.load.image('sprite_' + i, 'assets/sprites/01/' + i + '.png');
        }
        // 載入身體部位的圖片
        this.load.image('sprite_01b', 'assets/sprites/01/01b.png');
        this.load.image('sprite_02b', 'assets/sprites/01/02b.png');
        this.load.image('sprite_03b', 'assets/sprites/01/03b.png');
        // 載入頭部部位的圖片
        this.load.image('sprite_01h', 'assets/sprites/01/01h.png');
        this.load.image('sprite_02h', 'assets/sprites/01/02h.png');
        this.load.image('sprite_03h', 'assets/sprites/01/03h.png');
        // 載入腳部部位的圖片
        this.load.image('sprite_01f', 'assets/sprites/01/01f.png');
        this.load.image('sprite_02f', 'assets/sprites/01/02f.png');
        this.load.image('sprite_03f', 'assets/sprites/01/03f.png');

		// 如果你想使用自定義圖片，可以這樣載入：
		// this.load.image('custom_head_1', 'assets/custom/head1.png');
		// this.load.image('custom_body_1', 'assets/custom/body1.png');
		// this.load.image('custom_foot_1', 'assets/custom/foot1.png');

		this.load.audio('win','assets/audio/win.wav');
		this.load.audio('lose','assets/audio/oops.wav');
		// this.load.audio('bgm','assets/audio/7874.wav'); // 移除背景音樂載入
		
		// 加載開始按鈕圖片
		this.load.image('btn_play_up','assets/button/btn_play_up.png');
	},

	create: function () {

		//	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
		this.preloadBar.cropEnabled = false;

	},

	update: function () {

		//	You don't actually need to do this, but I find it gives a much smoother game experience.
		//	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
		//	You can jump right into the menu if you want and still play the music, but you'll have a few
		//	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
		//	it's best to wait for it to decode here first, then carry on.
		
		//	If you don't have any music in your game then put the game.state.start line into the create function and delete
		//	the update function completely.
		
		// 移除背景音樂解碼等待，直接進入主選單
		if (this.ready == false)
		{
			this.ready = true;
			this.state.start('MainMenu');
		}

	}

};
