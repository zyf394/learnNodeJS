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

function handleNameChangeAttempts(socket,nickName,namesUsed){
    socket.on('nameAttempt',function(name){
        console.log(name);
        if(name.indexOf(name) == -1){
            var previousName = nickName[socket.id];
            var previousNameIndex = namesUsed.indexOf(previousName);
            namesUsed.push(name);
            nickName[socket.id] = name;
            delete namesUsed[previousNameIndex];

            socket.emit('nameResult',{
                success:true,
                name:name
            });

            socket.emit('nameResult',{
                success:true,
                name:name
            });

            socket.broadcast.to(currentRoom[socket.id]).emit('message',{
                text:previousName + 'is now know as ' + name + '.'
            });
        }else {
            socket.emit('nameResult',{
                success:false,
                message:'That name is already in use.'
            })
        }
    })
}

function handleRoomJoining(socket){
    socket.on('join',function(room){
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket,room.newRoom);
    })
}

function handleMessageBroadcasting(socket){
    socket.on('message',function(message){
        socket.broadcast.to(message.room).emit('message',{
            text:nickName[socket.id] + "：" + message.text
        })
    })
}

function handleClientDisconnection(socket){
    socket.on('disconnect',function(){
       var nameIndex = nameUsed.indexOf(nickName[socket.id]);
        delete nameUsed[nameIndex];
        delete nickName[socket.id];
    });
}