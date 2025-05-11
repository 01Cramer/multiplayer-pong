const serverState = require("./serverState");
const buffers = require("./buffers");

function generateKey(length)
{
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * characters.length));
    }
    return result;
};

function roomIDToArrayBuffer(roomID)
{
    for (let i = 1; i < 6; i++)
    {
        buffers.roomBufferView.setUint8(i, roomID.charCodeAt(i - 1));
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

function sendLogUnicast(clientConnection, logInfoID)
{
    buffers.fastBufferView.setUint8(0, buffers.commandType.LOG);
    buffers.fastBufferView.setUint8(1, logInfoID);
    clientConnection.send(buffers.fastBuffer);
};

function sendLogBroadcast(clientConnection, logInfoID)
{
    const room = clientConnection.room;
    const players = serverState.rooms[room];
    if(players)
    {
        buffers.fastBufferView.setUint8(0, buffers.commandType.LOG);
        buffers.fastBufferView.setUint8(1, logInfoID);
        for (const player of players)
        {
            player.send(buffers.fastBuffer);
        }
    }
};

function sendGoToRoomUnicast(clientConnection, roomID)
{
    buffers.roomBufferView.setUint8(0, buffers.commandType.GO_TO_ROOM);
    roomIDToArrayBuffer(roomID);
    clientConnection.send(buffers.roomBuffer);
};

function sendGameStartedStatusBroadcast(clientConnection)
{
    const room = clientConnection.room;
    const players = serverState.rooms[room];
    if(players)
    {
        buffers.fastBufferView.setUint8(0, buffers.commandType.GAME_STARTED);
        for (const player of players)
        {
            player.send(buffers.fastBuffer);
        }
    }
};

function sendFrameDataBroadcast(clientConnection, ballX, ballY, paddleOneX, paddleOneY, paddleTwoX, paddleTwoY)
{
    const room = clientConnection.room;
    const players = serverState.rooms[room];
    if(players)
    {
        buffers.frameBufferView.setUint8(0, buffers.commandType.FRAME_DATA);
        buffers.frameBufferView.setUint16(1, ballX);
        buffers.frameBufferView.setUint16(3, ballY);
        buffers.frameBufferView.setUint16(5, paddleOneX);
        buffers.frameBufferView.setUint16(7, paddleOneY);
        buffers.frameBufferView.setUint16(9, paddleTwoX);
        buffers.frameBufferView.setUint16(11, paddleTwoY);
        for (const player of players)
        {
            player.send(buffers.frameBuffer);
        }
    }
};

function sendResultUpdateBroadcast(clientConnection, playerOneScore, playerTwoScore)
{
    const room = clientConnection.room;
    const players = serverState.rooms[room];
    if(players)
    {
        buffers.resultBufferView.setUint8(0, buffers.commandType.RESULT_UPDATE);
        buffers.resultBufferView.setUint16(1, playerOneScore);
        buffers.resultBufferView.setUint16(3, playerTwoScore);
        for (const player of players)
        {
            player.send(buffers.resultBuffer);
        }
    }
};

module.exports = { generateKey, roomIDToArrayBuffer, decodeRoomID, sendLogUnicast, sendLogBroadcast, sendGoToRoomUnicast, sendGameStartedStatusBroadcast, sendFrameDataBroadcast, sendResultUpdateBroadcast }