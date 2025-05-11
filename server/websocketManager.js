const roomManager = require("./roomManager");
const utils = require("./utils");
const buffers = require("./buffers");

function handleWebSocket(webSocketServer)
{
    webSocketServer.on("connection", clientConnection => 
    {
        console.log("New client connected!");

        clientConnection.on("message", data => 
        {
            const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
            const dataView = new DataView(arrayBuffer);
            const command = dataView.getUint8(0);
            switch(command)
            {
                case buffers.commandType.CREATE_ROOM:
                {
                    roomManager.createRoom(clientConnection);
                    break;
                }
                case buffers.commandType.JOIN_ROOM:
                {
                    const room = utils.decodeRoomID(dataView);
                    roomManager.joinRoom(clientConnection, room);
                    break;
                }
                case buffers.commandType.PAGE_RELOAD:
                    const room = utils.decodeRoomID(dataView);
                    roomManager.rejoinRoom(clientConnection, room);
                    break;
                case buffers.commandType.START_GAME:
                {
                    roomManager.startGame(clientConnection);
                    break;
                }
                case buffers.commandType.RESTART_GAME:
                {
                    roomManager.restartGame(clientConnection);
                    break;
                }
                case buffers.commandType.MOVE_PADDLE:
                {
                    const keyPressed = dataView.getUint8(1);
                    roomManager.movePaddle(clientConnection, keyPressed);
                    break;
                }
            }
        });
    
        clientConnection.on("close", () => 
        {
            roomManager.leaveRoom(clientConnection);
            console.log("Client has disconnected!");
        });
    });
};

module.exports = { handleWebSocket };