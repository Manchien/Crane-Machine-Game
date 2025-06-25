BasicGame.Game = function(game) {
	
	// When a State is added to Phaser it automatically has the following
	// properties set on it, even if they already exist:
	this.game; // a reference to the currently running game
	this.add; // used to add sprites, text, groups, etc
	this.camera; // a reference to the game camera
	this.cache; // the game cache
	this.input; // the global input manager (you can access this.input.keyboard,
	// this.input.mouse, as well from it)
	this.load; // for preloading assets
	this.math; // lots of useful common math operations
	this.sound; // the sound manager - add a sound, play one, set-up markers,
	// etc
	this.stage; // the game stage
	this.time; // the clock
	this.tweens; // the tween manager
	this.world; // the game world
	this.particles; // the particle manager
	this.physics; // the physics manager
	this.rnd; // the repeatable random number generator
	// You can use any of these from any function within this State.
	// But do consider them as being 'reserved words', i.e. don't create a
	// property for your own game called "world" or you'll over-write the world
	// reference.
};
BasicGame.Game.prototype = {
	dropRate:0.2,
	catchAssist:false,
	claw : null,
	claw_length : 720,
	claw_state : 0,
	claw_speed : 5,
	claw_rope:null,
    claw_pip:null,
    claw_box:null,
	zero_point : [100,100],
	gifts : null,
	layer : null,
	sfx_win : null,
	sfx_lose : null,
    giftCollisionGroup:null,
    clawCollisionGroup:null,
    tilesCollisionGroup:null,
	score_text:null,
	max_doll:5,
	score:0,
    coin:0,
    timer:null,
    tileObjects:null,
    stage: 1, // 1: 頭, 2: 身體, 3: 腳
    currentParts: { head: null, body: null, foot: null },
    // 新增鍵盤控制變數
    cursors: null,
    spaceKey: null,
    checkGifts: function(){
        if (this.gifts.children.length < this.max_doll) {
            this.spawnDoll();
        }
    },
	// 修改點擊函數為鍵盤控制
	keyboardControl : function() {
		// 左右方向鍵控制夾子移動
		if (this.claw_state === 0) {
			// 在待機狀態下可以用左右鍵移動夾子
			if (this.cursors.left.isDown && this.claw.body.x > this.zero_point[0]) {
				this.claw.body.x -= this.claw_speed;
				this.claw_rope.x -= this.claw_speed;
			}
			if (this.cursors.right.isDown && this.claw.body.x < this.zero_point[1] + 520) {
				this.claw.body.x += this.claw_speed;
				this.claw_rope.x += this.claw_speed;
			}
			
			// 空白鍵開始抓取動作
			if (this.spaceKey.isDown && this.coin > 0) {
				this.coin--;
				this.claw_state = 2; // 直接進入向下抓取狀態
			}
		}
	},
	spawnDoll: function(){
		var partType;
		
		// 初始化計數器和已掉落的部位追蹤
		if (!this.dollSpawnCount) {
			this.dollSpawnCount = 0;
			this.droppedParts = { head: false, body: false, foot: false };
		}
		this.dollSpawnCount++;
		
		// 如果已經掉落 6 個娃娃，就不再掉落
		// if (this.dollSpawnCount > 6) {
		// 	return;
		// }
		
		let index;
		// 前 3 個確保各部位都有
		if (this.dollSpawnCount <= 3) {
			if (this.dollSpawnCount === 1 && !this.droppedParts.head) {
				// 第 1 個：確保有 head
				index = Math.floor(Math.random() * 8) + 1; 
				partType = 'head';
				this.droppedParts.head = true;
			} else if (this.dollSpawnCount === 2 && !this.droppedParts.body) {
				// 第 2 個：確保有 body
				index = Math.floor(Math.random() * 8) + 1; 
				partType = 'body';
				this.droppedParts.body = true;
			} else if (this.dollSpawnCount === 3 && !this.droppedParts.foot) {
				// 第 3 個：確保有 foot
				index = Math.floor(Math.random() * 8) + 1; 
				partType = 'foot';
				this.droppedParts.foot = true;
			} else {
				// 如果該部位已經掉落，隨機選擇其他部位
				const availableParts = [];
				if (!this.droppedParts.head) availableParts.push('head');
				if (!this.droppedParts.body) availableParts.push('body');
				if (!this.droppedParts.foot) availableParts.push('foot');
				
				const randomPart = availableParts[Math.floor(Math.random() * availableParts.length)];
				if (randomPart === 'head') {
					index = Math.floor(Math.random() * 8) + 1;
					partType = 'head';
					this.droppedParts.head = true;
				} else if (randomPart === 'body') {
					index = Math.floor(Math.random() * 8) + 1;
					partType = 'body';
					this.droppedParts.body = true;
				} else if (randomPart === 'foot') {
					index = Math.floor(Math.random() * 8) + 1;
					partType = 'foot';
					this.droppedParts.foot = true;
				}
			}
		} else {
			// 第 4-6 個：完全隨機掉落
			index = Math.round(Math.random() * 9 + 1); // 1-9
			if (index <= 3) partType = 'head';
			else if (index <= 6) partType = 'body';
			else partType = 'foot';
		}
		
		// 根據部位類型選擇對應的圖片
		var spriteKey;
		if (partType === 'head') {
			// 頭部：01h, 02h, 03h, 04h, 05h, 06h, 07h, 08h
			var headIndex = Math.floor(Math.random() * 8) + 1;
			spriteKey = 'sprite_0' + headIndex + 'h';
		} else if (partType === 'body') {
			// 身體：01b, 02b, 03b, 04b, 05b, 06b, 07b, 08b
			var bodyIndex = Math.floor(Math.random() * 8) + 1;
			spriteKey = 'sprite_0' + bodyIndex + 'b';
		} else if (partType === 'foot') {
			// 腳部：01f, 02f, 03f, 04f, 05f, 06f, 07f, 08f
			var footIndex = Math.floor(Math.random() * 8) + 1;
			spriteKey = 'sprite_0' + footIndex + 'f';
		}
		
		console.log("🎯 選擇的 spriteKey:", spriteKey);
		console.log("🎯 部位類型:", partType);
		
        var gift = this.gifts.create(this.game.world.centerX + Math.random() * 100 * 1.5, 0, spriteKey);
		gift.scale.setTo(0.85);
		gift.body.debug = false;
        gift.body.clearShapes();
        // 使用簡單的矩形碰撞體，因為不再有精靈圖集的物理資料
        gift.body.setRectangle(gift.width * 0.8, gift.height * 0.8);
        gift.body.setCollisionGroup(this.giftCollisionGroup);
        gift.body.collides([ this.giftCollisionGroup, this.clawCollisionGroup,
            this.tilesCollisionGroup ]);
        gift.partType = partType;
		console.log("🎁 gift.frameName：", gift.frameName); 
		console.log("🎁 gift.partType", gift.partType);
		// console.log("📦 掉落順序：", this.dollSpawnCount + "/6");
		console.log("📋 已掉落部位：", this.droppedParts);
	},
	closeClaw : function(isClose) {
		this.claw.body.clearShapes();
		if (isClose) {
			this.claw.loadTexture('claw_closed');
			this.claw.body.loadPolygon('physicsData', "claw_closed");
		} else {
			this.claw.loadTexture('claw');
			this.claw.body.loadPolygon('physicsData', "claw_open");
		}
        this.claw.body.setCollisionGroup(this.clawCollisionGroup);
        this.claw.body.collides([ this.tilesCollisionGroup, this.giftCollisionGroup ],
            this.clawHitHandler, this);
	},
	clawHitHandler : function(body1, body2,hit) {
        var dx = Math.abs(body1.x - body2.x);
        var dy = Math.abs(body1.sprite.centerY - body2.sprite.centerY);
        if(hit.boundingRadius >= 1.8 && this.claw_state == 2){
            this.claw_state = 3;
            this.closeClaw(true);
        }
	},
	checkOverlap:function(){
		var tiles = this.layer.getTiles(0,0,this.game.world.width,this.game.world.height);
        for(var i in tiles){
        	if(tiles[i].index > -1){
                for(var j in this.gifts.children) {
                    var sprite = this.gifts.children[j];
                    var boundsA = new Phaser.Rectangle(sprite.centerX,sprite.centerY,sprite.width,sprite.height);
                    var tile = tiles[i];
                    var boundsB = new Phaser.Rectangle(tile.worldX,tile.worldY,tile.width,tile.height);

                    var overlap = Phaser.Rectangle.intersects(boundsA, boundsB);
                    if(overlap){
                    	var t1 = (boundsA.y - boundsB.y) + sprite.height / 2;
                    	if(t1 >= sprite.height / 2){
                            sprite.body.y -= sprite.height / 2;
						}
                    }
                }
			}
        }
		return false;
	},
	create : function() {
		localStorage.removeItem('myDolls');
		// 使用background2.png作為背景圖片
		this.background = this.add.sprite(0, 0, 'background2');
		this.background.width = this.game.width;
		this.background.height = this.game.height+200;
		this.game.physics.startSystem(Phaser.Physics.P2JS);
		this.game.physics.p2.gravity.y = 1500;
		this.game.physics.p2.setImpactEvents(true);
		this.score_text = this.game.add.text(this.game.world.width - 20, 750, "金幣: " + this.coin + "\n分數: " + this.score, {
            font: "24px Arial",
            fill: "#ff0044",
            align: "right"
        });
        this.score_text.anchor.setTo(1, 0); // 右上角對齊
        this.score_text.bringToTop(); // 確保文字顯示在最上層
		
		this.giftCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.clawCollisionGroup = this.game.physics.p2.createCollisionGroup();
        this.tilesCollisionGroup = this.game.physics.p2.createCollisionGroup();
		var map = this.game.add.tilemap('level1');
		var x = 350;
		var y = 350;
		
		map.addTilesetImage('world');
		this.sfx_lose = this.game.add.audio('lose');
		this.sfx_win = this.game.add.audio('win');
		this.layer = map.createLayer('Tile Layer 1');
		this.layer.resizeWorld();
		map.setCollisionBetween(1, 99);
		
		this.tileObjects = this.game.physics.p2.convertTilemap(map, this.layer);
		for ( var i in this.tileObjects) {
            this.tileObjects[i].setCollisionGroup(this.tilesCollisionGroup);
            this.tileObjects[i].collides([ this.giftCollisionGroup, this.clawCollisionGroup ]);
		}
		this.claw_length = this.layer.layer.heightInPixels - 140 - 35;
		console.log(this.claw_length);
		this.layer.debug = false;
		this.claw = this.game.add.sprite(this.zero_point[0], this.zero_point[1],
				'claw');
		this.game.physics.p2.enable(this.claw, false);
		this.claw.body.static = true;
		this.claw.body.immovable = true;
		this.closeClaw(false);
        this.claw_rope = this.game.add.sprite(this.zero_point[0] - 4,this.zero_point[1] - this.claw.height / 2 - 
3,'claw_rope');
		this.claw.body.collideWorldBounds = false;
		this.claw_pip = this.game.add.sprite(0,this.claw_rope.y-3,'claw_pip');
        this.claw_pip.width = this.game.width;
		this.claw_box = this.game.add.sprite(this.claw.body.x,this.claw_pip.y,'claw_box');
		this.gifts = this.game.add.group();
		this.gifts.enableBody = true;
		this.gifts.physicsBodyType = Phaser.Physics.P2JS;
		
		// 初始化鍵盤控制
		this.cursors = this.game.input.keyboard.createCursorKeys();
		this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		
		// 移除原本的滑鼠事件監聽器
		// this.game.input.onDown.add(this.click, this);
		// this.game.input.onUp.add(this.release, this);
		
		this.game.physics.p2.updateBoundsCollisionGroup();

        this.timer = this.game.time.create(false);
        this.timer.loop(1000, this.checkGifts, this);
        this.timer.start();

        var overlapTimer = this.game.time.create(false);
        overlapTimer.loop(1000,this.checkOverlap,this);
        overlapTimer.start();
		this.coin = 50;
		console.log("starting play state");
		
		// 檢查圖片是否正確載入
		console.log("🔍 檢查圖片載入狀態:");
		console.log("sprite_01h:", this.game.cache.checkImageKey('sprite_01h'));
		console.log("sprite_01b:", this.game.cache.checkImageKey('sprite_01b'));
		console.log("sprite_01f:", this.game.cache.checkImageKey('sprite_01f'));
		console.log("sprite_02h:", this.game.cache.checkImageKey('sprite_02h'));
		console.log("sprite_02b:", this.game.cache.checkImageKey('sprite_02b'));
		console.log("sprite_02f:", this.game.cache.checkImageKey('sprite_02f'));
		console.log("sprite_03h:", this.game.cache.checkImageKey('sprite_03h'));
		console.log("sprite_03b:", this.game.cache.checkImageKey('sprite_03b'));
		console.log("sprite_03f:", this.game.cache.checkImageKey('sprite_03f'));
		console.log("sprite_04h:", this.game.cache.checkImageKey('sprite_04h'));
		console.log("sprite_04b:", this.game.cache.checkImageKey('sprite_04b'));
		console.log("sprite_04f:", this.game.cache.checkImageKey('sprite_04f'));
		console.log("sprite_05h:", this.game.cache.checkImageKey('sprite_05h'));
		console.log("sprite_05b:", this.game.cache.checkImageKey('sprite_05b'));
		console.log("sprite_05f:", this.game.cache.checkImageKey('sprite_05f'));
		console.log("sprite_06h:", this.game.cache.checkImageKey('sprite_06h'));
		console.log("sprite_06b:", this.game.cache.checkImageKey('sprite_06b'));
		console.log("sprite_06f:", this.game.cache.checkImageKey('sprite_06f'));
		console.log("sprite_07h:", this.game.cache.checkImageKey('sprite_07h'));
		console.log("sprite_07b:", this.game.cache.checkImageKey('sprite_07b'));
		console.log("sprite_07f:", this.game.cache.checkImageKey('sprite_07f'));
		console.log("sprite_08h:", this.game.cache.checkImageKey('sprite_08h'));
        
	},
    updateUI:function(){
        //this.score_text.setText("coin:" + this.coin + "\nscore:" + this.score);
        //this.score_text.bringToTop(); // 確保文字始終顯示在最上層
	},
    actionOnClick:function(){

	},
	update : function() {
		// 調用鍵盤控制函數
		this.keyboardControl();
		
		this.claw.body.setZeroVelocity();
		for ( var i in this.gifts.children) {
			var gift = this.gifts.children[i];
			if (gift.body.y >= this.game.world.height - 70) {
				this.sfx_win.play();
				console.log("gift.frameName:", gift.frameName);
				let inventory = JSON.parse(localStorage.getItem('myDolls') || '[]');
				
				// 檢查是否已經有這個部位的娃娃
				const hasPartType = inventory.some(item => item.type === gift.partType);
				
				if (!hasPartType) {
					// 如果沒有這個部位，才加入 inventory
					inventory.push({
						img: gift.frameName,
						type: gift.partType,
						time: Date.now()
					});
					localStorage.setItem('myDolls', JSON.stringify(inventory));
					
					console.log(`🎁 收集到新的 ${gift.partType} 部位！`);
					
					// 檢查是否收集到完整套裝（head、body、feet 各一個）
					const hasHead = inventory.some(item => item.type === 'head');
					const hasBody = inventory.some(item => item.type === 'body');
					const hasFoot = inventory.some(item => item.type === 'foot');
					
					if (hasHead && hasBody && hasFoot) {
						this.autoSaveInventory(inventory);
						console.log(`🎉 收集到完整套裝！自動儲存到後端！`);
					} else {
						console.log(`📦 目前進度：${inventory.length}/3 個部位`);
					}
				} else {
					console.log(`⚠️ 已經有 ${gift.partType} 部位了，跳過重複收集`);
				}

				console.log("inventory:", inventory);
				gift.destroy();
				this.score++;
				if(this.score % 2 == 0){
					this.coin++;
				}
				

			}
		}
		if (this.claw_state == 2) {
			this.claw.body.y += this.claw_speed;
            this.claw_rope.height += this.claw_speed;
			if (this.claw.body.y >= this.claw_length) {
				this.closeClaw(true);
				this.claw_state = 3;
			}
		} else if (this.claw_state == 3) {
			this.claw.body.y -= this.claw_speed;
            this.claw_rope.height -= this.claw_speed;
			if (this.hitGift) {
				this.hitGift.y -= this.claw_speed;
			}
			if (this.claw.body.y <= this.zero_point[1]) {
				this.claw.body.y = this.zero_point[1];
				this.claw_state = 4;
			}
		} else if (this.claw_state == 4 || this.claw_state == 5) {
			this.claw.body.x -= this.claw_speed;
            this.claw_rope.x -= this.claw_speed;
			if (this.hitGift) {
				this.hitGift.x -= this.claw_speed;
			}
			if (this.claw.body.x <= this.zero_point[0]) {
				if(this.claw_state == 5){
					this.claw_state = 1;
				}else{
                    this.claw.body.x = this.zero_point[0];
                    this.claw_state = 0;
                    this.closeClaw(false);
                    if (this.hitGift) {
                        this.hitGift.static = false;
                        this.hitGift = null;
                    }
				}
			}
		}
		if (this.hitGift && this.game.time.now % 30 == 0) {
			var seed = Math.random();
			// console.log("SEED:" + seed);
			if (seed <= this.dropRate && seed > 0) {
				this.hitGift.static = false;
				this.hitGift.immovable = false;
                this.claw.body.clearShapes();
				if(this.claw_state == 4){
					this.hitGift.velocity.x = -this.claw_speed * 20;
				}
				this.hitGift = null;
				this.sfx_lose.play();
			}
		}else if((this.claw_state == 3 || this.claw_state == 4) && this.game.time.now % 30 == 0){
            var seed = Math.random();
            if (seed <= this.dropRate && seed > 0) {
                //this.claw.body.clearShapes();
            }
		}
        this.claw_box.x = this.claw.body.x - this.claw_box.width / 2;
        this.claw_box.y = this.claw_pip.y - this.claw_pip.height / 2;

        this.updateUI();
	},
	quitGame : function(pointer) {
		// Here you should destroy anything you no longer need.
		// Stop music, delete sprites, purge caches, free resources, all that
		// good stuff.
		// Then let's go back to the main menu.
		this.state.start('MainMenu');
	},
    autoSaveInventory: function(inventory) {
        // 先跳轉到鑄造中畫面
        window.location.href = 'end-screen.html?status=minting';
        
        // 在背景執行儲存操作
        fetch('https://localhost:3001/api/save-inventory', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inventory: inventory })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('✅ Inventory 已自動儲存到後端:', data.filename);
                
                // 在跳轉到成功畫面之前，先生成新的 combined.png
                fetch('https://localhost:3001/api/generate-combined-image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ inventory: inventory })
                })
                .then(response => response.json())
                .then(imageData => {
                    if (imageData.success) {
                        console.log('✅ 新的 combined.png 已生成');
                    } else {
                        console.error('❌ 生成 combined.png 失敗:', imageData.message);
                    }
                })
                .catch(error => {
                    console.error('❌ 生成 combined.png 時發生錯誤:', error);
                })
                .finally(() => {
                    // 鑄造完成後跳轉到成功畫面
                    setTimeout(() => {
                        window.location.href = 'end-screen.html?status=success';
                    }, 10000); // 10秒後顯示成功畫面
                });
            } else {
                console.error('❌ 儲存失敗:', data.message);
                // 如果失敗，也跳轉到成功畫面（假設成功）
                setTimeout(() => {
                    window.location.href = 'end-screen.html?status=success';
                }, 10000);
            }
        })
        .catch(error => {
            console.error('❌ 網路錯誤:', error);
            // 如果網路錯誤，也跳轉到成功畫面（假設成功）
            setTimeout(() => {
                window.location.href = 'end-screen.html?status=success';
            }, 10000);
        });
    },
};

