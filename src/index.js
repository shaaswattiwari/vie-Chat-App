const express = require("express");
const http = require("http");
const path = require("path");
const port = process.env.PORT || 3000;
const socketio = require("socket.io");
const { generateMessage } = require("./utlis/message");
const Filter = require("bad-words");
const {
  addUser,
  removeUser,
  getUser,
  getUserInRoom,
} = require("./utlis/users");

const publicDir = path.join(__dirname, "../public");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicDir));

io.on("connection", (socket) => {
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    socket.emit("message", generateMessage(`Welcome! ${user.username}`));

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(`${user.username} has joined tha chat.`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInRoom(user.room),
    });

    callback();
  });

  socket.on("clientMsg", (msg, callback) => {
    const user = getUser(socket.id);
    if (user) {
      const filter = new Filter();
      if (filter.isProfane(msg)) {
        return callback("CONTENT NOT ALLOWED");
      }

      io.to(user.room).emit("message", generateMessage(msg, user.username));
      callback("Delivered");
    }
  });

  socket.on("sendLocation", (location, callback) => {
    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "locationMessage",
        generateMessage(
          `https://google.com/maps?q=${location.latitude},${location.longitude}`,
          user.username
        )
      );
      callback();
    }
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`${user.username} has left`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUserInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is on port, `, port);
});
