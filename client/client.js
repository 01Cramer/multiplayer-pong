const createButton = document.querySelector("#createRoomButton");
const joinButton = document.querySelector("#joinRoomButton");
const startButton = document.querySelector("#startGameButton");
const resetButton = document.querySelector("#resetGameButton");

const roomIDText = document.querySelector("#roomIDText");
const resultText = document.querySelector("#resultText");

const gameBoard = document.querySelector("#gameBoard");
const ctx = gameBoard.getContext("2d");

const boardBackground = "forestgreen";
const borderColor = "black";
const paddleOneColor = "lightblue";
const paddleTwoColor = "red";
const ballColor = "yellow";

const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;
const paddleWidth = 25;
const paddleHeight = 100;
const initialPaddleOneX = 0;
const initialPaddleTwoX = gameWidth - paddleWidth;
const initialPaddleY = (gameHeight / 2) - (paddleHeight / 2); 
const initialBallX = gameWidth / 2;
const initialBallY = gameHeight / 2;
const ballRadius = 12.5;

const ws = new WebSocket(`ws://${window.location.hostname}:8081`);
ws.binaryType = "arraybuffer";

function showGameView(roomID)
{
    const lobby = document.querySelector("#roomContainer");
    if(lobby)
    {
        lobby.classList.remove("active");
    }
    const game = document.querySelector("#gameContainer");
    if(game)
    {
        game.classList.add("active");
    }
    roomIDText.textContent = `Room ID: ${roomID}`;
    sessionStorage.setItem("roomID", roomID);
};

function createRoom()
{
    if(ws.readyState === WebSocket.OPEN)
    {
        const json = { type: "createRoom" };
        sendBinaryJSON(json);
    }
};

function joinRoom()
{
    const roomID = prompt("Please provide room ID:");
    if (!roomID) return;
    if(ws.readyState === WebSocket.OPEN)
    {
        const json = { type: "joinRoom", room: roomID };
        sendBinaryJSON(json);
    }
};

function rejoinRoom() // after page reload
{
    const roomID = sessionStorage.getItem("roomID");
    if (!roomID) return;
    const json = { type: "pageReload", room: roomID };
    sendBinaryJSON(json);
};

function gameStart()
{
    if(ws.readyState === WebSocket.OPEN)
    {
        const json = { type: "startGame" };
        sendBinaryJSON(json);
    }
};

function gameRestart()
{
    if(ws.readyState === WebSocket.OPEN)
    {
        const json = { type: "restartGame" };
        sendBinaryJSON(json);
    }
};

function changePaddlePosition(event)
{
    if(ws.readyState === WebSocket.OPEN)
    {
        const keyPressed = event.keyCode;
        const json = { type: "movePaddle", keyPressed: keyPressed};
        sendBinaryJSON(json);
    }
};

function drawClearBoard()
{
    ctx.fillStyle = boardBackground;
    ctx.fillRect(0, 0, gameWidth, gameHeight);
};

function drawBall(ballX, ballY)
{
    ctx.strokeStyle = borderColor;
    ctx.fillStyle = ballColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
};

function drawPaddles(paddleOneX, paddleOneY, paddleTwoX, paddleTwoY)
{
    ctx.strokeStyle = borderColor;

    ctx.fillStyle = paddleOneColor;
    ctx.fillRect(paddleOneX, paddleOneY, paddleWidth, paddleHeight);
    ctx.strokeRect(paddleOneX, paddleOneY, paddleWidth, paddleHeight);

    ctx.fillStyle = paddleTwoColor;
    ctx.fillRect(paddleTwoX, paddleTwoY, paddleWidth, paddleHeight);
    ctx.strokeRect(paddleTwoX, paddleTwoY, paddleWidth, paddleHeight);
};

function renderFrame(ballX, ballY, paddleOneX, paddleOneY, paddleTwoX, paddleTwoY)
{
    drawClearBoard();
    drawPaddles(paddleOneX, paddleOneY, paddleTwoX, paddleTwoY);
    drawBall(ballX, ballY);
};

function updateResult(playerOneScore, playerTwoScore)
{
    resultText.textContent = `${playerOneScore} : ${playerTwoScore}`;
};

function sendBinaryJSON(json)
{
    const jsonString = JSON.stringify(json);
    const encoder = new TextEncoder();
    const binaryData = encoder.encode(jsonString);
    ws.send(binaryData.buffer);
};

createButton.addEventListener("click", createRoom);
joinButton.addEventListener("click", joinRoom);
startButton.addEventListener("click", gameStart);
resetButton.addEventListener("click", gameRestart);
window.addEventListener("keydown", changePaddlePosition);

ws.addEventListener("message", messageEvent => 
{
    const arrayBuffer = messageEvent.data;
    const jsonString = new TextDecoder().decode(arrayBuffer);
    const json = JSON.parse(jsonString);
    const type = json.type;
    switch(type)
    {
        case "log":
            const logInfo = json.logInfo;
            alert(logInfo);
            break;
        case "goToRoom":
            const room = json.room;
            showGameView(room);
            break;
        case "frameData":
            const frameData = json.frameData;
            const ballX = frameData.ballX;
            const ballY = frameData.ballY;
            const paddleOneX = frameData.paddleOneX;
            const paddleOneY = frameData.paddleOneY;
            const paddleTwoX = frameData.paddleTwoX;
            const paddleTwoY = frameData.paddleTwoY;
            renderFrame(ballX, ballY, paddleOneX, paddleOneY, paddleTwoX, paddleTwoY);
            break;
        case "resultUpdate":
            const resultUpdate = json.resultUpdate;
            const playerOneScore = resultUpdate.playerOneScore;
            const playerTwoScore = resultUpdate.playerTwoScore;
            updateResult(playerOneScore, playerTwoScore);
            break;
        default:
            break;
    }
}); // End of message event listener

ws.addEventListener("open", () =>
{
    rejoinRoom();
});

// Draw initial frame
drawClearBoard();
drawPaddles(initialPaddleOneX, initialPaddleY, initialPaddleTwoX, initialPaddleY);
drawBall(initialBallX, initialBallY);