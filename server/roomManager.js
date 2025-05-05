const serverState = require("./serverState");
const utils = require("./utils");
const Game = require("./game");

const maxClients = 2;
const maxRooms = 5;

let roomID;

function createRoom(clientConnection)
{
    if(serverState.rooms.length > maxRooms)
    {
        const jsonSend = { type: "log", logInfo: "Can't create more rooms" };
        utils.sendBinaryJSON(jsonSend, clientConnection);
        return;
    }
    roomID = utils.generateKey(5);
    while(roomID in serverState.rooms)
    {
        roomID = generateKey(5);
    }
    serverState.rooms[roomID] = [clientConnection];
    clientConnection["room"] = roomID;
    console.log(`Created room: ${roomID}`);
    const jsonSend = { type: "goToRoom", room: `${roomID}` };
    utils.sendBinaryJSON(jsonSend, clientConnection);
};

function joinRoom(clientConnection, room)
{
    if (!Object.keys(serverState.rooms).includes(room))
    {
        const jsonSend = { type: "log", logInfo: `Room ${room} does not exist!` };
        utils.sendBinaryJSON(jsonSend, clientConnection);
        return;
    }
    if (serverState.rooms[room].length === maxClients)
    {
        const jsonSend = { type: "log", logInfo: `Room ${room} is full!` };
        utils.sendBinaryJSON(jsonSend, clientConnection);
        return;
    }
    clientConnection["room"] = room;
    const jsonSendLog = { type: "log", logInfo: "Client joined the room!" }; 
    utils.sendBinaryJSONBroadcast(jsonSendLog, clientConnection); // At this point client has assigned room but is not inside yet
    serverState.rooms[room].push(clientConnection);
    const jsonSend = { type: "goToRoom", room: `${room}` };
    utils.sendBinaryJSON(jsonSend, clientConnection);
};

function rejoinRoom(clientConnection, room)
{
    joinRoom(clientConnection, room);
    resumeGame(clientConnection);
};

function leaveRoom(clientConnection)
{
    const room = clientConnection.room;
    if(room)
    {
        serverState.rooms[room] = serverState.rooms[room].filter(client => client !== clientConnection);
        console.log("Client left the room!");
        const jsonSend = { type: "log", logInfo: "Client left the room" };
        utils.sendBinaryJSONBroadcast(jsonSend, clientConnection); // At this point only second player is in the room
        pauseGame(clientConnection);
        if(serverState.rooms[room].length === 0)
        {
            closeRoom(room);
            deleteGame(room);
        }
    }
};

function closeRoom(room)
{
    console.log(`Room ${room} deleted!`);
    delete serverState.rooms[room];
};

function startGame(clientConnection)
{
    const room = clientConnection.room;
    if(serverState.rooms[room].length === maxClients)
    {
        if(!(room in serverState.games))
        {
            const game = new Game();
            serverState.games[room] = game;
        }
        if(!serverState.games[room].isGameActive())
        {
            serverState.games[room].gameStart(clientConnection);
        }
    }
    else
    {
        const jsonSend = { type: "log", logInfo: `Can't start, there is only one player in room ${room}!` };
        utils.sendBinaryJSON(jsonSend, clientConnection);
    }
};

function restartGame(clientConnection)
{
    const room = clientConnection.room;
    if(room in serverState.games && serverState.games[room].isGameActive())
    {
        serverState.games[room].gameRestart(clientConnection);
    }
};

function pauseGame(clientConnection)
{
    const room = clientConnection.room;
    if(room in serverState.games && serverState.games[room].isGameActive())
    {
        serverState.games[room].gamePause();
    }
};

function resumeGame(clientConnection)
{
    const room = clientConnection.room;
    if(room in serverState.games && serverState.games[room].isGameActive())
    {
        serverState.games[room].gameResume(clientConnection);
    }
};

function deleteGame(room)
{
    console.log("Game removed!");
    delete serverState.games[room];
};

function movePaddle(clientConnection, keyPressed)
{
    const room = clientConnection.room;
    if(room)
    {
        if(room in serverState.games && serverState.games[room].isGameActive())
        {
            const index = serverState.rooms[room].findIndex(client => client === clientConnection);
            const player = index + 1;
            serverState.games[room].changePaddlePosition(keyPressed, player);
        }
    }
};

module.exports = { createRoom, joinRoom, rejoinRoom, leaveRoom, closeRoom, startGame, restartGame, pauseGame, resumeGame, deleteGame, movePaddle };
