/**
 * Created by zhongyufei on 2016/2/3.
 */
var fs = require('fs');
var http = require('http');
var path = require('path');
var mime = require('mime');
var cache = {};

function send404(res){
    res.writeHead(404,{'Content-Type':'text/plain'});
    res.write('Error 404! Resource not found.');
    res.end();
}

function sendFile(res,filePath,fileContents){
    res.writeHead(200,{'Content-Type':mime.lookup(path.basename(filePath))});//通过mine模块来寻找路径中的mime类型
    res.end(fileContents);
}

function serverStatic(res,cache,abspath){
    if(cache[abspath]){
        sendFile(res,abspath,cache[abspath]);
    }else {
        fs.exists(abspath,function(exists){
            if(exists){
                fs.readFile(abspath,function(err,data){
                    if(err){
                        send404(res);
                    }else {
                        cache[abspath] = data;
                        sendFile(res,abspath,data);
                    }
                })
            }else {
                send404(res);
            }
        })
    }
}

var server = http.createServer(function(req,res){
   var filePath =  false;
    if(req.url == "/"){
        filePath = 'public/index.html';
    }else {
        filePath = 'public' + req.url;
    }
    var absPath = "./" + filePath;
    console.log(filePath);
    console.log(absPath);
    serverStatic(res,cache,absPath)
});

server.listen(3000,function(){
    console.log('Server running at ...');
});


var chatServer = require('./lib/chat_server');
chatServer.listen(server);