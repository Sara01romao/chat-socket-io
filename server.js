const express = require("express");
const http = require("http");
const path = require("path");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const io = socketIO(server);

let connectedUsers = [];

io.on("connection", (socket) => {
  socket.on("join user", (user) => {
    socket.userId = user.id;
    socket.userName = user.name;

    connectedUsers.push(user);
    socket.emit("list users", connectedUsers, user);
    socket.broadcast.emit("list update user", user, connectedUsers.length);
  });

  socket.on("sent, message", (message) => {
    socket.emit("list message add", message);
    socket.broadcast.emit("message update", message);
  });

  socket.on("disconnect", () => {
    if(socket.userId){
      connectedUsers = connectedUsers.filter((item) => item.id !== socket.userId);
      socket.emit("list users", connectedUsers);
      socket.broadcast.emit("list update users", connectedUsers, socket.userName);
    }
  });
});

server.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});