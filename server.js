const WebSocket = require("ws");
const http = require("http");

const express = require("express");
const app = express();

app.use(express.static("public"));
const SERVER = http.createServer(app);
const webPort = 5000;

SERVER.listen(webPort, function () {
  console.log("Web server start. http://localhost:" + webPort);
});

const wss = new WebSocket.Server({ server: SERVER });

let privateRooms = [];

wss.on("connection", (ws) => {
  ws.room = [];
  ws.send(JSON.stringify({ msg: "user joined" }));
  console.log("connected");
  ws.on("message", (message) => {
    console.log("message-1: ", message);
    //try{
    var messag = JSON.parse(message);
    //}catch(e){console.log(e)}
    if (messag.join) {
      ws.room.push(messag.join);
      privateRooms.push(messag.join);
    }
    if (messag.room) {
      broadcast(message);
    }
    if (messag.msg) {
      console.log("message-2: ", messag.msg);
    }
  });

  ws.on("error", (e) => console.log(e));
  ws.on("close", (e) => console.log("websocket closed" + e));
});

function broadcast(message) {
  console.log(privateRooms);
  wss.clients.forEach((client) => {
    if (client.room.indexOf(JSON.parse(message).room) > -1) {
      client.send(message);
    }
  });
}

setInterval(() => {
  wss.clients.forEach((client) => {
    for (let i = 0; i < privateRooms.length; i++) {
      const item = privateRooms[i];
      if (client.room.indexOf(item) > -1) {
        client.send(`message: ${item}`);
      }
    }
  });
}, 5000);
