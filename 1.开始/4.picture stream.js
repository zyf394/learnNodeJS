/**
 * Created by zhongyufei on 2016/2/3.
 */
var fs = require('fs');
var http = require('http');
http.createServer(function(req,res){
    res.writeHead(200,{'Content-Type':'image/png'});
    fs.createReadStream('./1.png').pipe(res);
}).listen(3000);
console.log('Server running at ...');