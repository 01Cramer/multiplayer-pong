const serverState = require("./serverState");
const utils = require("./utils");
const Game = require("./game");

const maxClients = 2;
const maxRooms = 5;

let roomID;

function createRoom(clientConnection)
{
    if(Object.keys(serverState.rooms).length === maxRooms)
    {
        utils.sendLogUnicast(clientConnection, 0);
        return;
    }
    roomID = utils.generateKey(5);
    while(Object.keys(serverState.rooms).includes(roomID))
    {
        roomID = generateKey(5);
    }
    serverState.rooms[roomID] = [clientConnection];
    clientConnection["room"] = roomID;
    console.log(`Created room: ${roomID}`);
    utils.sendGoToRoomUnicast(clientConnection, roomID);
};

function joinRoom(clientConnection, room)
{
    if (!Object.keys(serverState.rooms).includes(room))
    {
        utils.sendLogUnicast(clientConnection, 1);
        return false;
    }
    if (serverState.rooms[room].length === maxClients)
    {
        utils.sendLogUnicast(clientConnection, 2);
        return false;
    }
    clientConnection["room"] = room;
    utils.sendLogBroadcast(clientConnection, 3) // At this point client has assigned room but is not inside yet
    serverState.rooms[room].push(clientConnection);
    utils.sendGoToRoomUnicast(clientConnection, room);
    return true;
};

function rejoinRoom(clientConnection, room)
{
    const success = joinRoom(clientConnection, room);
    if(success)
    {
        resumeGame(clientConnection);
    }
};

function leaveRoom(clientConnection)
{
    const room = clientConnection.room;
    if(room)
    {
        serverState.rooms[room] = serverState.rooms[room].filter(client => client !== clientConnection);
        console.log("Client left the room!");
        utils.sendLogBroadcast(clientConnection, 4); // At this point only second player is in the room
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
            utils.sendGameStartedStatusBroadcast(clientConnection);
        }
    }
    else
    {
        utils.sendLogUnicast(clientConnection, 5);
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