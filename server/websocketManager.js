const roomManager = require("./roomManager");

function handleWebSocket(webSocketServer)
{
    webSocketServer.on("connection", clientConnection => 
    {
        console.log("New client connected!");

        clientConnection.on("message", data => 
        {
            const jsonRecived = JSON.parse(data.toString('utf8'));
            const typeOfMessage = jsonRecived.type;
            switch(typeOfMessage)
            {
                case "createRoom":
                {
                    roomManager.createRoom(clientConnection);
                    break;
                }
                case "joinRoom":
                {
                    const room = jsonRecived.room;
                    roomManager.joinRoom(clientConnection, room);
                    break;
                }
                case "pageReload":
                    const room = jsonRecived.room;
                    roomManager.rejoinRoom(clientConnection, room);
                    break;
                case "startGame":
                {
                    roomManager.startGame(clientConnection);
                    break;
                }
                case "restartGame":
                {
                    roomManager.restartGame(clientConnection);
                    break;
                }
                case "movePaddle":
                {
                    const keyPressed = jsonRecived.keyPressed;
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