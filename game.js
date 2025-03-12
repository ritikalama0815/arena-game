//to do-> correct out of bounds
//add more features
class mainScene {
    preload() {
        console.log('Preloading assets...');
        this.load.image('player', 'assets/player.PNG'); //player
        this.load.image('coin', 'assets/coin.PNG'); // coin
        this.load.image('button', 'assets/reset.PNG'); //  button image
        this.load.image('pause', 'assets/pause.PNG'); // pause button image
        this.load.image('resume', 'assets/resume.PNG'); // resume button image
        this.load.image('obstacle', 'assets/obstacle.PNG'); // obstacle image
        this.load.image('start', 'assets/start.PNG'); //start button
    }

    create() {
        //creates the arena
        console.log('Creating game objects...');
        
        this.player = this.physics.add.sprite(150, 150, 'player');
        this.player.setScale(0.05);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(this.player.width * 0.4, this.player.height * 0.4); // Adjust collision box size
    
        this.coin = this.physics.add.sprite(700, 400, 'coin');
        this.coin.setScale(0.05);
        this.player.setCollideWorldBounds(true);
        this.coin.body.setSize(this.coin.width * 0.4, this.coin.height * 0.4); // Adjust collision box size
    
        this.score = 0;
        let style = { font: '30px Arial', fill: '#000' };
        this.scoreText = this.add.text(20, 20, 'Score: ' + this.score, style);
    
        this.arrow = this.input.keyboard.createCursorKeys();
    
        // Create obstacles and make them not able to move
        this.obstacles = this.physics.add.group({
            immovable: true,
            allowGravity: false
        });
        for (let i = 0; i < 6; i++) {
            let obstacle = this.obstacles.create(
                Phaser.Math.Between(100, this.game.config.width - 100),
                Phaser.Math.Between(100, this.game.config.height - 100),
                'obstacle'
            );
            obstacle.setScale(0.08);
            obstacle.setCollideWorldBounds(true);
            obstacle.body.setSize(obstacle.width * 0.3, obstacle.height * 0.3); // Adjust collision box size
        }
    
        // add physics collision between player and obstacles
        this.physics.add.collider(this.player, this.obstacles, this.hitObstacle, null, this);
    
        // allow player to collect coins
        this.physics.add.overlap(this.player, this.coin, this.hitCoin, null, this);
    
        // timer setup
        this.timeLeft = 30;
        this.timerText = this.add.text(20, 60, 'Time: ' + this.timeLeft, style);
        
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        this.physics.world.pause();
        this.timerEvent.paused = true;

        this.startButton = this.add.image(735, 375, 'start').setInteractive();
        this.startButton.setScale(0.1);
        this.startButton.on('pointerdown', () => this.startGame());
    
        // Pause button
        let pauseButton = this.add.image(1200, 50, 'pause').setInteractive();
        pauseButton.setScale(0.08);
        pauseButton.on('pointerdown', () => this.togglePause());
    }
    
    update() {
        if (this.arrow.right.isDown) {
            this.player.x += 3;
        }
        if (this.arrow.left.isDown) {
            this.player.x -= 3;
        }
        if (this.arrow.down.isDown) {
            this.player.y += 3;
        }
        if (this.arrow.up.isDown) {
            this.player.y -= 3;
        }
    }

    updateTimer() {
        this.timeLeft--;
        this.timerText.setText('Time: ' + this.timeLeft);
        if (this.timeLeft <= 0) {
            this.timerEvent.remove(false);
            this.endGame();
        }
    }

    endGame() {
        this.physics.pause();
        this.add.text(735, 375, 'Game Over\nFinal Score: ' + this.score, { font: '40px Arial', fill: '#000' }).setOrigin(0.5);

        // Add restart button
        let button = this.add.image(735, 475, 'button').setInteractive();
        button.setScale(0.1);
        button.on('pointerdown', () => this.scene.restart());
    }

    // handle coins collisions 
    hitCoin() {
        // ensure the coin is not placed at the same position as the player
        do {
            this.coin.x = Phaser.Math.Between(50, this.game.config.width - 50);
            this.coin.y = Phaser.Math.Between(50, this.game.config.height - 50);
        } while (Phaser.Math.Distance.Between(this.player.x, this.player.y, this.coin.x, this.coin.y) < 50);

        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);

        this.tweens.add({
            targets: this.player, 
            duration: 200, // in ms
            scaleX: 0.03,
            scaleY: 0.03,
            yoyo: true, // at the end goes back to original scale
        });
    }

    // handle collisions with obstacles
    hitObstacle() {
        this.score -= 1;
        this.scoreText.setText('Score: ' + this.score);
    }

    togglePause() {
        if (this.physics.world.isPaused) {
            // resume game when pressed the pause button
            this.physics.world.resume();
            this.timerEvent.paused = false;
            if (this.resumeButton) {
                this.resumeButton.destroy(); // Remove the resume button
            }
        } else {
            // pause game
            this.physics.world.pause();
            this.timerEvent.paused = true;
    
            // add a resume button
            this.resumeButton = this.add.image(735, 375, 'resume').setInteractive();
            this.resumeButton.setScale(0.1);
            this.resumeButton.on('pointerdown', () => this.togglePause());
        }
    }
    //function for starting the game and preventing automatic starting of the game
    startGame(){
        this.physics.world.resume();
        this.timerEvent.paused = false;
        this.startButton.destroy();
    }
}

//Game object
new Phaser.Game({
    width: 1500,
    height: 770,
    backgroundColor: '#e6e6fa', 
    scene: mainScene,
    physics: {
        default: 'arcade',
    },
    parent: 'game',
});