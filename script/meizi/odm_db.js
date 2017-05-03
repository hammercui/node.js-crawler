/**
 * Created by cly on 2017/4/27.
 */
"use strict";
var {ERR_DB_DUP} = require("./errorFactory");
var DB_CONN_STR = 'mongodb://localhost:27017/meizi'; // 数据库为 meizi
// 首先引入 mongoose 这个模块
var mongoose = require('mongoose');
var logger = require('./logFactory');


mongoose.connect(DB_CONN_STR);
const db = mongoose.connection;
mongoose.Promise = global.Promise;


db.once('open',function (callback) {
  console.log("MongoDB Opened!");

});

db.on('error',function (callback) {
  console.error.bind(console,'connection error:');
  process.exit();
});


db.on('disconnected', function () {
  console.log('Mongoose connection disconnected');
  process.exit();
});



const Schema = mongoose.Schema;
//首页home的对象文档映射
const homeSchema = Schema({
  href:String,
  title:String,
  thumb:String,
  imgName:String,
  tag:Array,
});
const detailSchema = Schema({
  href:String,
  title:String,
  thumb:String,
  tag:Array,
  id:{type:Number,unique:true,required:true,index:true},
  images:Array,
  date:String,
});

//然后创建home的Model
var homeModel = mongoose.model('home',homeSchema);

/**
 * 保存home的数据
 * @param list
 */
function insertHomeList(list) {
  return saveList(homeModel,list);
}

var detailModel = mongoose.model("detail",detailSchema);
/**
 * 保存DetailList数据
 * @param list
 */
function insertDetailList(list) {
  return saveList(detailModel,list);
}

//mongoose通过model创建mongodb中对应的collection
//mongoose在内部创建collection时将我们传递的collection名（‘home’）小写化，同时如果小写化的名称后面没有字母——s,则会在其后面添加一s
function saveList(Model,list) {
  logger.info("saveList",list);
  //传递数组 批量插入
  if(list instanceof Array){
    return new Promise(function (resolve,reject) {
      Model.collection.insertMany(list,{ordered: false},function (error,docs) {
        if(error){
          logger.info("error",error.code,error.message);
          //插入了重复数据 ，也可认为成功了
          if(error.code == ERR_DB_DUP){
            resolve("success")
          }else{
            reject(error);
          }
        }
        else{
          //onsole.log(docs);
          logger.info(docs);
          resolve(docs);
        }
      });
    })

  }
  //传递对象
  else if(list instanceof Object){
    var itemData = new Model(list);
    return new Promise(function (resolve,reject) {
      itemData.save((err,docs)=>{
        if(err){
          if(err.code == ERR_DB_DUP){
            resolve("success");
          } else{
            console.log("insert home fail",err);
            reject(err);
          }
        }
        else{
          //console.log("insert home object success",itemData);
          resolve(docs);
        }
      })
    });
  }
  else{
    return Promise.reject(" parameter is either Array  or  not Object ");
  }
}

function selectDetail(query) {
 return select(detailModel,query);
}

/**
 * 分页查询
 * @param start 从0开始
 * @param offset 每次增量
 */
function selectDetailPage(start=0,offset=10) {
  logger.info("detailModel query:","start:"+start,"offset："+offset);
  return new Promise(function (resolve,reject) {
    var query =  detailModel.find({});
    query.skip(start);
    query.limit(offset);
    query.exec();
    query.exec(function (err,docs) {
      if(err){
        reject(err);
      }else{
        var items = [];
        docs.map(t=>{
          if(!t.errors){items.push(t._doc)}
        });
        resolve(items)
      }
    });

  });
}



function select(Model,query) {
  logger.info("detailModel query:",query);
  return new Promise(function (resolve,reject) {
    Model.collection.findOne(query,function (err,docs) {
      if(err)
        reject(err);
      else {
        resolve(docs);
      }
    })
  })
}


module.exports = {
  insertHomeList,
  insertDetailList,
  selectDetail,
  selectDetailPage,
}

