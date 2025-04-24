const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const io = socketIO(server);

let connectedUsers = [];
let messageList = []


io.on('connection', (socket) => {
  console.log('a user connected');
 
  socket.on("join,user", (userName)=>{
    console.log(userName)
    connectedUsers.push(userName)
    socket.emit("list, users", connectedUsers)
    socket.broadcast.emit("list update users", userName )
  })

  socket.on('sent, message', ( message)=>{
    messageList.push(message);
    socket.emit("list message add", message);
    socket.broadcast.emit("message update", message);
  })
});

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});