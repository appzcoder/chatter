var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('lodash');
var port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var users = [];

io.on('connection', function(socket) {
    socket.on('online user', function(user) {
        user.socket_id = socket.id;

        var foundUser = _.find(users, {id: user.id});

        if (foundUser) {
            foundUser.socket_id = socket.id;
        } else {
            users.push(user);
        }

        io.emit('online users list', users);
    });

    socket.on('chat message', function(msg, toUserID, from) {
        var toUser = _.find(users, {id: toUserID});

        socket.to(toUser.socket_id).emit('chat message', msg, from);
    });

    socket.on('disconnect', function() {
        users = _.reject(users, {socket_id: socket.id});
    });
});


http.listen(port, function(){
    console.log('listening on *:' + port);
});
