/**
 * Created by zhongyufei on 2016/2/3.
 */
var http = require('http');
http.createServer(function(req,res){
    res.writeHead(200,{'Content-Type':'text/plain'});
    res.end('hello world');
}).listen(3000);
console.log('Server running at ...');