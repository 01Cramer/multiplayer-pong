const utils = require("./utils");

const gameWidth = 500;
const gameHeight = 500;
const paddleWidth = 25;
const paddleHeight = 100;
const paddleSpeed = 50;
const ballRadius = 12.5;

class Game // Represents game state in single room
{
    constructor()
    {
        this.paddleOne = 
        {
            x: 0,
            y: (gameHeight / 2) - (paddleHeight / 2)
        }
        this.paddleTwo = 
        {
            x: gameWidth - paddleWidth,
            y: (gameHeight / 2) - (paddleHeight / 2)
        }
        this.gameActive = false;
        this.intervalID = null;
        this.ballSpeed = 1;
        this.ballX = gameWidth / 2;
        this.ballY = gameHeight / 2;
        this.ballXDirection = 0;
        this.ballYDirection = 0;
        this.playerOneScore = 0;
        this.playerTwoScore = 0;
    };

    isGameActive()
    {
        return this.gameActive;
    };
    
    gameStart(clientConnection)
    {
        this.gameActive = true;
        this.initBall();
        this.nextTick(clientConnection);
    };

    gameRestart(clientConnection)
    {
        this.gameActive = false;
        clearInterval(this.intervalID);
        this.playerOneScore = 0;
        this.playerTwoScore = 0;
        this.paddleOneX = 0;
        this.paddleOneY = (gameHeight / 2) - (paddleHeight / 2);
        this.paddleTwoX = gameWidth - paddleWidth;
        this.paddleTwoY = (gameHeight / 2) - (paddleHeight / 2);
        this.ballSpeed = 1;
        this.ballX = gameWidth / 2;
        this.ballY = gameHeight / 2;
        this.ballXDirection = 0;
        this.ballYDirection = 0;
        
        utils.sendFrameDataBroadcast
        (
            clientConnection,
            this.ballX,
            this.ballY,
            this.paddleOne.x,
            this.paddleOne.y,
            this.paddleTwo.x,
            this.paddleTwo.y
        );
        utils.sendResultUpdateBroadcast
        (
            clientConnection,
            this.playerOneScore,
            this.playerTwoScore
        );
    };

    gamePause() // gameActive is still true as we don't want to allow playing alone
    {
        clearInterval(this.intervalID); 
    };

    gameResume(clientConnection)
    {
        utils.sendResultUpdateBroadcast
        (
            clientConnection,
            this.playerOneScore,
            this.playerTwoScore
        );
        this.nextTick(clientConnection);
    };

    initBall()
    {
        if(Math.round(Math.random()) == 1)
        {
            this.ballXDirection = 1;
        }
        else
        {
            this.ballXDirection = -1;
        }
        if(Math.round(Math.random()) == 1)
        {
            this.ballYDirection = 1;
        }
        else
        {
            this.ballYDirection = -1;
        }
        this.ballSpeed = 1;
        this.ballX = gameWidth / 2;
        this.ballY = gameHeight / 2;
    };

    nextTick(clientConnection)
    {
        this.intervalID = setTimeout(() => 
        {
            this.moveBall();
            this.checkCollision(clientConnection);
            utils.sendFrameDataBroadcast
            (
                clientConnection,
                this.ballX,
                this.ballY,
                this.paddleOne.x,
                this.paddleOne.y,
                this.paddleTwo.x,
                this.paddleTwo.y
            );
            this.nextTick(clientConnection);
        }, 5)
    };

    moveBall()
    {
        this.ballX += (this.ballXDirection * this.ballSpeed);
        this.ballY += (this.ballYDirection * this.ballSpeed);
    };

    checkCollision(clientConnection)
    {
        if(this.ballY <= 0 + ballRadius)
        {
            this.ballYDirection *= -1;
        }
        if(this.ballY >= gameHeight - ballRadius)
        {
            this.ballYDirection *= -1;
        }
        if(this.ballX <= 0)
        {
            this.playerTwoScore += 1;
            utils.sendResultUpdateBroadcast
            (
                clientConnection,
                this.playerOneScore,
                this.playerTwoScore
            );
            this.initBall();
            return;
        }
        if(this.ballX >= gameWidth)
        {
            this.playerOneScore += 1;
            utils.sendResultUpdateBroadcast
            (
                clientConnection,
                this.playerOneScore,
                this.playerTwoScore
            );
            this.initBall();
            return;
        }
        if(this.ballX - ballRadius <= paddleWidth && (this.ballY <= this.paddleOne.y + paddleHeight && this.ballY >= this.paddleOne.y))
        {
            this.ballXDirection *= -1;
            this.ballSpeed += 0.5;
        }
        if(this.ballX + ballRadius >= this.paddleTwo.x && (this.ballY <= this.paddleTwo.y + paddleHeight && this.ballY >= this.paddleTwo.y))
        {
            this.ballXDirection *= -1;
            this.ballSpeed += 0.5;
        }
    };

    changePaddlePosition(keyPressed, player)
    {
        const paddleUpW = 87; // W
        const paddleDownS = 83; // S
        const paddleUpArrow = 38; // ↑
        const paddleDownArrow = 40; // ↓

        if(player === 1)
        {
            switch(keyPressed)
            {
                case(paddleUpW):
                {
                    if(this.paddleOne.y > 0)
                    {
                        this.paddleOne.y -= paddleSpeed;
                    }
                    break;
                }
                case(paddleDownS):
                {
                    if(this.paddleOne.y < gameHeight - paddleHeight)
                    {
                        this.paddleOne.y += paddleSpeed;
                    }
                    break;
                }
                case(paddleUpArrow):
                {
                    if(this.paddleOne.y > 0)
                    {
                        this.paddleOne.y -= paddleSpeed;
                    }
                    break;
                }
                case(paddleDownArrow):
                {
                    if(this.paddleOne.y < gameHeight - paddleHeight)
                    {
                        this.paddleOne.y += paddleSpeed;
                    }
                    break;
                }
            };
        }
        else if(player === 2)
        {
            switch(keyPressed)
            {
                case(paddleUpW):
                {
                    if(this.paddleTwo.y > 0)
                    {
                        this.paddleTwo.y -= paddleSpeed;
                    }
                    break;
                }
                case(paddleDownS):
                {
                    if(this.paddleTwo.y < gameHeight - paddleHeight)
                    {
                        this.paddleTwo.y += paddleSpeed;
                    }
                    break;
                }
                case(paddleUpArrow):
                {
                    if(this.paddleTwo.y > 0)
                    {
                        this.paddleTwo.y -= paddleSpeed;
                    }
                    break;
                }
                case(paddleDownArrow):
                {
                    if(this.paddleTwo.y < gameHeight - paddleHeight)
                    {
                        this.paddleTwo.y += paddleSpeed;
                    }
                    break;
                }
            };           
        }
    };
}; // end of class Game

module.exports = Game;