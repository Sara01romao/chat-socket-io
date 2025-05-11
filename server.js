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

  // const userId = computeUserId(socket);
  // socket.join(userId);
 
  socket.on("join user", (user)=>{
    socket.userId =user.id;
    socket.userName =user.name;
    console.log(user)
    connectedUsers.push(user)
    socket.emit("list users", connectedUsers)
    socket.broadcast.emit("list update user", user)
  })

  socket.on('sent, message', ( message)=>{
    messageList.push(message);
    socket.emit("list message add", message);
    socket.broadcast.emit("message update", message);
  })

  socket.on("disconnect", () => {
    console.log("aqui: ", + "desconectado", socket.userId);

    console.log("antes ", connectedUsers)
    
    connectedUsers = connectedUsers.filter(item => item.id !== socket.userId)

     console.log("agora ", connectedUsers)
     socket.emit("list users", connectedUsers)
     socket.broadcast.emit("list update users", connectedUsers, socket.userName );
    // io.of("/chat.html").sockets.get(id)?.disconnect();
  });
});

server.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});