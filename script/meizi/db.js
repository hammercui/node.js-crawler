/**
 * Created by cly on 17/3/22.
 */
var MongoClient = require('mongodb').MongoClient;
var DB_CONN_STR = 'mongodb://localhost:27017/meizi'; // 数据库为 meizi

var connectDB = ()=>{
  return new Promise(function (resolve,reject) {
    MongoClient.connect(DB_CONN_STR,function (err,db) {
      if(err)
        return reject(err);

      console.log("数据库连接成功");
      return resolve(db);
    })
  })
}


/**
 * 插入数据
 * @param db 数据库
 * @param collectionName 表名
 * @param data 数据
 * @returns {Promise}
 */
var insertData = (db,collectionName,data)=> {
  var collection = db.collection(collectionName);
  return new Promise(function (resolve,reject) {
    collection.insert(data,function (err,result) {
          if(err)
            return reject(err);
          resolve(result);
    });
  })
};


/**
 * 查询数据
 * @param db 数据库
 * @param collectionName 表名
 * @param where 查询条件
 * @returns {Promise}
 */
var selectData = (db,collectionName,where)=>{

  //连接到表明
  var collection = db.collection(collectionName);
  if(!collection)
    return Promise.reject("表 "+collectionName+" 不存在");
  return new Promise(function (resolve,reject) {
    collection.find(where).toArray(function (err,result) {
      if(err)
        return reject(err);
      resolve(result);
    });
  })
};


var updateData = (db,collectionName,where,updateData)=>{
//连接到表明
  var collection = db.collection(collectionName);
  var updateStr = {$set: updateData};
  return new Promise(function (resolve,reject) {
    collection.update(where,updateStr,function (err,result) {
      if(err)
        return reject(err);

      resolve(result);
    });
  })
}

var delData = function(db, collectionName,where) {
  //连接到表
  var collection = db.collection(collectionName);
  return new Promise(function (resolve,reject) {
    collection.remove(where, function(err, result) {
      if(err)
      {
        console.log('Error:'+ err);
        return rejecterr;
      }
      return resolve(result);
    });
  })

}


module.exports = {
  insertData,
  selectData,
  updateData,
  delData,
  connectDB
};
