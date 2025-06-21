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

		// 移除背景音樂
		// this.music = this.add.audio('bgm');
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

		// 創建 centerInputBox
		this.createInputBox();

	},

	createInputBox: function () {
		// 創建輸入框容器
		const centerInputBox = document.createElement('div');
		centerInputBox.id = 'centerInputBox';
		centerInputBox.style.cssText = `
			position: absolute;
			top: 40%;
			left: 50%;
			transform: translate(-50%, -50%);
			background: rgba(0, 0, 0, 0.8);
			padding: 20px;
			border-radius: 10px;
			text-align: center;
			z-index: 1000;
		`;

		// 創建輸入框
		const textInput = document.createElement('input');
		textInput.type = 'text';
		textInput.id = 'textInput';
		textInput.placeholder = 'Enter your wallet address...';
		textInput.maxLength = 100;
		textInput.style.cssText = `
			width: 300px;
			padding: 10px;
			margin: 10px;
			border: none;
			border-radius: 5px;
			font-size: 16px;
		`;

		// 創建提交按鈕
		const submitButton = document.createElement('button');
		submitButton.textContent = 'Submit';
		submitButton.onclick = this.submitText.bind(this);
		submitButton.style.cssText = `
			padding: 10px 20px;
			margin: 10px;
			border: none;
			border-radius: 5px;
			background: #5599FF;
			color: white;
			font-size: 16px;
			cursor: pointer;
		`;

		// 創建狀態訊息
		const statusMsg = document.createElement('span');
		statusMsg.id = 'statusMsg';
		statusMsg.style.cssText = `
			display: block;
			margin-top: 10px;
			font-size: 14px;
		`;

		// 組裝元素
		centerInputBox.appendChild(textInput);
		centerInputBox.appendChild(submitButton);
		centerInputBox.appendChild(statusMsg);

		// 添加到頁面
		document.body.appendChild(centerInputBox);
	},

	submitText: async function () {
		const input = document.getElementById('textInput');
		const status = document.getElementById('statusMsg');
		const text = input.value;
		
		if (!text) {
			status.textContent = 'Please enter content';
			status.style.color = 'red';
			return;
		}
		
		try {
			const response = await fetch('http://localhost:3001/api/save-text', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ text })
			});
			const result = await response.json();
			if (result.success) {
				document.getElementById('centerInputBox').style.display = 'none';
			} else {
				status.textContent = 'Save failed: ' + result.message;
				status.style.color = 'red';
			}
		} catch (e) {
			status.textContent = 'Network error';
			status.style.color = 'red';
		}
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
		// this.music.stop();

		//	And start the actual game
		this.state.start('Game');

	}

};
