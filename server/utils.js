const serverState = require("./serverState");

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

function encodeBinaryJSON(jsonSend)
{
    const encoder = new TextEncoder();
    const jsonString = JSON.stringify(jsonSend);
    const binaryData = encoder.encode(jsonString);
    return binaryData;
};

function sendBinaryJSON(jsonSend, clientConnection)
{
    const binaryData = encodeBinaryJSON(jsonSend);
    clientConnection.send(binaryData.buffer);
};

function sendBinaryJSONBroadcast(jsonSend, clientConnection)
{
    const binaryData = encodeBinaryJSON(jsonSend);
    const room = clientConnection.room;
    const players = serverState.rooms[room];
    if(players)
    {
        for (const player of players) {
            player.send(binaryData.buffer);
        }
    }
};

module.exports = { generateKey, sendBinaryJSON, sendBinaryJSONBroadcast }