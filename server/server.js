const express = require("express");
const path = require("path");
const WebSocket = require("ws");
const webSocketManager = require("./websocketManager");

const port = 8080;
const app = express();
const webSocketServer = new WebSocket.Server({ port: 8081 });

app.use(express.static(path.join(__dirname, "../views")));
app.use(express.static(path.join(__dirname, "../client")));

// Routing
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../views/index.html"));
});

// Start the server 
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

webSocketManager.handleWebSocket(webSocketServer);