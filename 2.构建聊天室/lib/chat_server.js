/**
 * Created by zhongyufei on 2016/2/3.
 */
var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickName = {};
var nameUsed = [];
var currentRoom = {};

exports.listen = function(server){
    io = socketio.listen(server);
    io.set('log level',1);
    io.sockets.on('connection',function(socket){
        guestNumber = assignGuestName(socket,guestNumber,nickName,nameUsed);
        joinRoom(socket,'Lobby');

        handleMessageBroadcasting(socket,nickName);
        handleNameChangeAttempts(socket,nickName,nameUsed);
        handleRoomJoining(socket);

        socket.on('rooms',function(){
            socket.emit('rooms',io.sockets.manager.rooms);
        });

        handleClientDisconnection(socket,nickName,nameUsed);
    });

};

function assignGuestName(socket,guestNumber,nickNames,namesUsed){
    var name = 'Guest'+ guestNumber;
    nickNames[socket.id] = name;
    socket.emit('nameResult',{
        success:name,
        name:name
    });
    namesUsed.push(name);
    return guestNumber + 1;
}

function joinRoom(socket,room){
    socket.join(room);
    currentRoom[socket.id] = room;
    socket.emit('joinResult',{
        room:room
    });
    socket.broadcast.to(room).emit('message',{
        test:nickName[socket.id] + 'has joined' + room + '.'
    });
    var usersInRoom = io.sockets.clients(room);
    if(usersInRoom.length > 1 ){
        var usersInRoomSummary = 'Users currently in ' + room + '：';
        for(var index in usersInRoom){
            var userSocketId = usersInRoom[index].id;
            if(userSocketId != socket.id){
                if(index > 0){
                    usersInRoomSummary +=',';
                }
                usersInRoomSummary += nickName[userSocketId];
            }
        }
    }
    usersInRoomSummary += ".";
    socket.emit("message",{
        text:usersInRoomSummary
    })
}