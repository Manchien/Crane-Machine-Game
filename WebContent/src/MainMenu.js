BasicGame.MainMenu = function (game) {

	this.music = null;
	this.playButton = null;
	this.titleText = null;

};

BasicGame.MainMenu.prototype = {

	create: function () {

		//	We've already preloaded our assets, so let's kick right into the Main Menu itself.
		//	Here all we're doing is playing some music and adding a picture and button
		//	Naturally I expect you to do something significantly better :)

		// 添加背景音樂
		this.music = this.add.audio('bgm');
		//this.music.play();

		// 添加標題背景

		// 添加遊戲標題文字
		this.titleText = this.add.text(350, 200, 'Claw Machine Game', {
			font: 'bold 48px Arial',
			fill: '#5599FF',
			stroke: '#000000',
			strokeThickness: 4
		});
		this.titleText.anchor.setTo(0.5);
		
		
		// 添加開始按鈕
		this.playButton = this.add.button(350, 600, 'btn_play_up', this.startGame, this);
		this.playButton.anchor.setTo(0.5);
		this.playButton.scale.setTo(0.2);
		
		// 添加按鈕文字
		this.playButtonText = this.add.text(350, 400, '', {
			font: 'bold 24px Arial',
			fill: '#ffffff',
			stroke: '#000000',
			strokeThickness: 2
		});
		this.playButtonText.anchor.setTo(0.5);

	},

	update: function () {

		//	Do some nice funky main menu effect here

	},

	startGame: function (pointer) {

		// 隱藏centerInputBox
		const centerInputBox = document.getElementById('centerInputBox');
		if (centerInputBox) {
			centerInputBox.style.display = 'none';
		}

		//	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
		this.music.stop();

		//	And start the actual game
		this.state.start('Game');

	}

};
