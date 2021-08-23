const express = require("express");
const http = require("http");
const path = require("path");
const port = process.env.PORT || 3000;
const socketio = require("socket.io");

const publicDir = path.join(__dirname, "../public");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicDir));

// app.get("/", (req, res) => {
//   res.sendFile(index.html, { root: publicDir });
// });

let count = 0;

//server(emit)->client(recieve) countUpdated
//client(emit)->server(recieve) increment

io.on("connection", (socket) => {
  console.log("New connection established");
  socket.emit("countUpdated", count);
  socket.on("increment", () => {
    count++;
    //socket.emit("countUpdated", count);
    io.emit("countUpdated", count);
  });
});

server.listen(port, () => {
  console.log(`Server is on port, `, port);
});
