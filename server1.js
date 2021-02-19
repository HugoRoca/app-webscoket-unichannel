const http = require("http");
const webSocket = require("./webSocketManager")

const express = require("express");
const app = express();

app.use(express.static("public"));
const SERVER = http.createServer(app);
const webPort = 5000;

SERVER.listen(webPort, function () {
  console.log("Web server start. http://localhost:" + webPort);
});

webSocket.createEvent();
webSocket.intervalRooms();