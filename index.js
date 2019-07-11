var express = require('express');
var http = require('http');
var socketIO = require('socket.io');


var app = express();
app.root = __dirname;
app.use("/", express.static(__dirname + '/src'));

var server = http.createServer(app);
server.listen(8080);

var io = socketIO.listen(server);
console.log('IO created');

io.sockets.on('connection', function(socket) {
  socket.on('join', function(room, userId) {
    leaveRoom(socket);
    console.log(userId, 'joins', room);
    socket.join(room);
    socket.room = room;
    socket.broadcast.to(room).emit('join', userId);
  });

  socket.on('leave', function(userId) {
    leaveRoom(socket, userId);
  });

  socket.on('message', function(from, to, message) {
    socket.to(to).emit('message', from, message);
  });
});

function leaveRoom(socket, userId) {
  if (!socket.room) {
    return;
  }

  var room = socket.room;
  socket.broadcast.to(room).emit('leave', userId);
  socket.leave(room);
  socket.room = null;
}
