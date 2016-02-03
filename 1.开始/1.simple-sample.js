/**
 * Created by zhongyufei on 2016/2/3.
 */
var fs = require('fs');
fs.readFile('./resource.json',function(err,data){
    console.log(data);
});