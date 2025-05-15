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
const paddleOneX = 0;
const paddleTwoX = gameWidth - paddleWidth;
const initialPaddleY = (gameHeight / 2) - (paddleHeight / 2); 
const initialBallX = gameWidth / 2;
const initialBallY = gameHeight / 2;
const ballRadius = 12.5;

const fastOneByteBuffer = new ArrayBuffer(1);
const fastOneByteBufferView = new DataView(fastOneByteBuffer);
const fastBuffer = new ArrayBuffer(2);
const fastBufferView = new DataView(fastBuffer);
const roomBuffer = new ArrayBuffer(6);
const roomBufferView = new DataView(roomBuffer);

const commandType = Object.freeze
({
    CREATE_ROOM : 0,
    JOIN_ROOM : 1,
    PAGE_RELOAD : 2,
    START_GAME : 3,
    RESTART_GAME : 4,
    MOVE_PADDLE : 5,
    LOG : 6,
    GO_TO_ROOM : 7,
    FRAME_DATA : 8,
    RESULT_UPDATE : 9,
    GAME_STARTED : 10
});

const logInfo = Object.freeze
({
    0 : "Can't create more rooms",
    1 : "Room does not exist", 
    2 : "Room is full", 
    3 : "Client joined the room",
    4 : "Client left the room",
    5 : "Can't start, there is only one player in room"
});

let gameStarted = false;

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
        fastOneByteBufferView.setUint8(0, commandType.CREATE_ROOM);
        ws.send(fastOneByteBuffer);
    }
};

function joinRoom()
{
    const roomID = prompt("Please provide room ID:");
    if (!roomID || roomID.length !== 5) return; // roomID is always 5 chars
    if(ws.readyState === WebSocket.OPEN)
    {
        roomBufferView.setUint8(0, commandType.JOIN_ROOM);
        roomIDToArrayBuffer(roomID);
        ws.send(roomBuffer);
    }
};

function rejoinRoom() // after page reload
{
    const roomID = sessionStorage.getItem("roomID");
    if (!roomID) return;
    roomBufferView.setUint8(0, commandType.PAGE_RELOAD);
    roomIDToArrayBuffer(roomID);
    ws.send(roomBuffer);
};

function gameStart()
{
    if(ws.readyState === WebSocket.OPEN)
    {
        fastOneByteBufferView.setUint8(0, commandType.START_GAME);
        ws.send(fastOneByteBuffer);
    }
};

function gameRestart()
{
    if(ws.readyState === WebSocket.OPEN)
    {
        fastOneByteBufferView.setUint8(0, commandType.RESTART_GAME);
        ws.send(fastOneByteBuffer);
    }
};

function changePaddlePosition(event)
{
    if(gameStarted)
    {
        if(ws.readyState === WebSocket.OPEN)
        {
            const keyPressed = event.keyCode;
            fastBufferView.setUint8(0, commandType.MOVE_PADDLE);
            fastBufferView.setUint8(1, keyPressed);
            ws.send(fastBuffer);
        }
    }
    return;
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

function renderFrame(ballX, ballY, paddleOneY, paddleTwoY)
{
    drawClearBoard();
    drawPaddles(paddleOneX, paddleOneY, paddleTwoX, paddleTwoY);
    drawBall(ballX, ballY);
};

function updateResult(playerOneScore, playerTwoScore)
{
    resultText.textContent = `${playerOneScore} : ${playerTwoScore}`;
};

function roomIDToArrayBuffer(roomID)
{
    for (let i = 1; i < 6; i++)
    {
        roomBufferView.setUint8(i, roomID.charCodeAt(i - 1));
    }
};

function decodeRoomID(dataView)
{
    let roomID = "";
    for (let i = 1; i < 6; i++)
    {
      roomID += String.fromCharCode(dataView.getUint8(i));
    }
    return roomID;
};

createButton.addEventListener("click", createRoom);
joinButton.addEventListener("click", joinRoom);
startButton.addEventListener("click", gameStart);
resetButton.addEventListener("click", gameRestart);
window.addEventListener("keydown", changePaddlePosition);

ws.addEventListener("message", messageEvent => 
{
    const arrayBuffer = messageEvent.data;
    const dataView = new DataView(arrayBuffer); 
    const type = dataView.getUint8(0);
    switch(type)
    {
        case commandType.LOG:
            alert(logInfo[dataView.getUint8(1)]);
            break;
        case commandType.GO_TO_ROOM:
            const room = decodeRoomID(dataView);
            showGameView(room);
            break;
        case commandType.GAME_STARTED:
            gameStarted = true;
            break;
        case commandType.FRAME_DATA:
            const ballX = dataView.getUint16(1);
            const ballY = dataView.getUint16(3);
            const paddleOneY = dataView.getUint16(5);
            const paddleTwoY = dataView.getUint16(7);
            renderFrame(ballX, ballY, paddleOneY, paddleTwoY);
            break;
        case commandType.RESULT_UPDATE:
            const playerOneScore = dataView.getUint16(1);
            const playerTwoScore = dataView.getUint16(3);
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
drawPaddles(paddleOneX, initialPaddleY, paddleTwoX, initialPaddleY);
drawBall(initialBallX, initialBallY);