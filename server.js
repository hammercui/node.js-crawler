/**
 * Created by cly on 2017/5/3.
 */

var meiziDao  = require("./script/meizi/odm_db");
var logger = require("./script/core/logFactory");
var express = require('express');
var app = express();

//提供静态资源目录服务
var publicPath = __dirname+"/public";
logger.info("publicPath",publicPath);
app.use(express.static(publicPath));

// meiziDao.selectDetailPage(0,10)
//   .then(
//     resolve=>{logger.info("success",resolve)},
//     reject=>{logger.info("error",reject)}
//   )

app.get('/meizi/', function (req, res) {
  if(!req.query){
    res.send({code:500,msg:"not has property  "});
    return;
  }
  if(!req.query.hasOwnProperty("start")){
    res.send({code:500,msg:"not has property start "});
    return;
  }
  if(!req.query.hasOwnProperty("offset")){
    res.send({code:500,msg:"not has property offset "});
    return;
  }
  var start = req.query.start;
  var offset = req.query.offset;
  meiziDao.selectDetailPage(start,offset)
    .then(list=>{
      "use strict";
      res.send({code:202,data:list});
    })
    .catch(error=>{
      "use strict";
      res.send({code:505,mst:error});
    });
})


var server = app.listen(8899, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("应用实例，访问地址为 http://%s:%s", host, port)
})