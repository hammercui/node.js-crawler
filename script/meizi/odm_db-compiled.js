/**
 * Created by cly on 2017/4/27.
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.saveHomeList = saveHomeList;
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/meizi'; // 数据库为 meizi
// 首先引入 mongoose 这个模块
var mongoose = require('mongoose');
mongoose.connect(DB_CONN_STR);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("MongoDB Opened!");
});

const Schema = mongoose.Schema;

//首页home的对象文档映射
const homeSchema = Schema({
  href: String,
  title: String,
  thumb: String,
  imgName: String,
  tag: Array
});

//然后创建home的Model

var homeModel = mongoose.model('home', homeSchema);

//mongoose通过model创建mongodb中对应的collection

//mongoose在内部创建collection时将我们传递的collection名（‘home’）小写化，同时如果小写化的名称后面没有字母——s,则会在其后面添加一s
//变成homes

function saveHomeList(list) {
  //传递数组 批量插入
  if (list instanceof Array) {
    homeModel.collection.insert(list, (err, docs) => {
      if (err) {
        console.log("insert home fail:%s", err);
        return Promise.reject(err);
      } else {
        console.log("insert home success:%s", docs);
        return Promise.resolve();
      }
    });
  }
  //传递对象
  else if (list instanceof Object) {
      var itemData = new homeModel(list);
      itemData.save((err, itemData) => {
        if (err) {
          console.log("insert home fail:%s", err);
          return Promise.reject(err);
        } else {
          console.log("insert home success:%s", itemData);
          return Promise.resolve();
        }
      });
    }
}

//# sourceMappingURL=odm_db-compiled.js.map