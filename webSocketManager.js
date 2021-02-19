/* eslint-disable filenames/match-regex */
const WebSocket = require("ws");
// import yenv from 'yenv'
// const env = yenv()
const PORT_WS = 8080;

class WebSocketManager {
  constructor() {
    if (!WebSocketManager.instance) {
      this.connection = new WebSocket.Server({
        port: PORT_WS,
        verifyClient: (info, cb) => {
          const token = info.req.headers["sec-websocket-protocol"];
          console.log("token", token);
          if (!token || token === null || token === "null")
            cb(false, 401, "Unauthorized");
          else {
            cb(true, {ok: true})
          }
        },
      });
      this.sockets = [];
      WebSocketManager.instance = this;
    }
    return WebSocketManager.instance;
  }

  createEvent() {
    this.connection.on("connection", (ws) => {
      ws.room = []
      ws.send(JSON.stringify({ msg: "connected" }));

      ws.on("message", (msg) => {
        console.log(msg);
        const message = JSON.parse(msg);

        if (message.join) {
          ws.room.push(message.join)
          this.sockets.push(message.join)
          ws.send(`User is connected`);
        }

        if (message.room) {
          console.log("message", message)
          this.sendMessage(message);
        }
      });

      ws.on("error", (e) => console.log(e));
      ws.on("close", (e, req) => console.log("websocket closed" + e + ": " + req));
    });
  }

  sendMessage(message) {
    this.connection.clients.forEach((client) => {
      if (client.room.indexOf(message.room) > -1) {
        client.send(JSON.stringify(message));
      }
    });
  }

  intervalRooms() {
    setInterval(() => {
      console.log("interval")
      this.connection.clients.forEach((client) => {
        for (let i = 0; i < client.room.length; i++) {
          console.log('interval: ' + client.room[i])
         // const item = client.room[i];
          //if (client.room.indexOf(item) > -1) {
            client.send(`message: your room is ${client.room[i]}`);
          //}
        }
      });
    }, 5000);
  }

  destroySocket(room) {
    this.connection.clients.forEach((client) => {
      if (client.room.indexOf(room) > -1) {
        client.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        client.destroy();
      }
    });
  }
}

const instance = new WebSocketManager();
Object.freeze(instance);

module.exports = instance;
