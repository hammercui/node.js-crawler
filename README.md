> 一个用nodejs实现的爬虫

1. [目标](#目标)
 

2. [开发日志](#开发日志)
 +  [mongoDB搭配Mongoose存储数据](##mongoDB搭配Mongoose存储数据)
 	- [mongoDB的启动](###mongoDB的启动) 
 	- [mongoDB的文档与集合](###mongoDB的文档与集合)
 	- [Mongoose](###Mongoose)
 	- [日志框架选择](### 日志框架选择)
 + [JavaScript注意事项](##JavaScript注意事项)

3. [启动服务](#启动服务)

# 目标

* 爬取图片，并下载保存文件
* 爬取数据，并存入mongoDB

- [ x ] 已完成http://www.meizitu.com/的抓取工作

# 开发日志
## mongoDB搭配Mongoose存储数据

###mongoDB的启动：

1 mac启动mongoDB服务：

打开终端，输入`cd Application/mongodb/bin`回车后，再输入
`./mongod`


2 启动客户端命令行：

打开另一个终端，输入`Application/mongodb/bin`,回车，输入`./mongo`,这时候可以用命令行操作数据库

###mongoDB的文档与集合：

1 文档:

多个键及其关联的值有序地放置在一起便是文档。在`js`中一个文档就是一个对象，比如
```
{"greenting" : "Hello,world!"}
```

MongoDb区分类型，大小写。

文档类似于关系型数据库的行

2 集合:

集合是一组文档，类似于关系型数据库中的表

3 常用命令：

* `user db1`: 创建一个数据库db1，如果没有就新建，如果已存在就切换到
* `show dbs`:查看所有数据库(新创建的数据库，如果没有数据，就不会被看到)
* `db.dropDatabase()`：删除当前数据库
* `show tables`:显示当前数据库的集合
* `db.集合名.drop()`：删除该集合
* `db.集合名.insert(文档名)`：向某集合插入某个文档
* `show collections`:显示当前数据库的所有collection(集合)，也就是表
* `db.collection.remove(<query,{justOne:<Boolean>,} writeConcern: <document>>)`:query(可选)删除文档查询条件 justOnce(可选)如何设为TRUE或者1，则只能删除一个文档  writeConcern:（可选）抛出异常的级别
* `正则表达式`：mongo可以用正则表达式，嘻嘻`db.posts.find({post_text:/runoob/})`

4 查询优化




###Mongoose
>Mongoose是MongoDB的js版本的orm框架。现在叫odm意思就是object-documents-mapping对象文档映射

**注意事项：**

**Promise:**从4.1.0开始，mongoose自带的promise库被丢弃了，可以使用原生的es6Promise,或者bluebird或者q,但需要以中间件的形式引入。
具体解释看官网[Built-in Promises](http://mongoosejs.com/docs/promises.html)

```
// Use native promises
    mongoose.Promise = global.Promise;
```
就可以直接使用Promise处理异步了。

**索引：**如何处理插入重复数据的问题呢？我的做法是建立唯一id索引。
索引有两种创建方式：

1. 进入数据库执行`db.集合名.ensureIndex({id:1},{unique:true})`，这样就建立了`id`为索引
2. mongoose的Schema中创建

```
const listSchema = Schema({
	...
  	id:{type:Number,unique:true,required:true,index:true},
 	...
});
```

然后批量插入使用`{{ordered: false}}`属性，因为此时插入重复数据或报error,错误编码`11000`，设置该属性就会跳过错误的插入，继续插入新的请求。示例如下

```
 Model.collection.insert(list,{ordered: false},function (error,docs) {
        if(error){
          console.log(error);
          //插入了重复数据 ，也可认为成功了
          if(error.code == 11000){
            resolve("success")
          }else{
            reject(error);
          }
        }
        else{
          console.log(docs);
          resolve(docs);
        }
      });
    })
```
### 日志框架选择
#### 使用winston日志库
1. 安装
```
npm install winston --save
```
2. 新建`logFactory.js`

```
const fs = require('fs');
const winston = require('winston');
const moment = require('moment');
const stackTrace = require('stack-trace');
const _ = require('lodash');
//const RotateFile = require('winston-daily-rotate-file');
const env = process.env.NODE_ENV;
//const logDir = path.resolve('.','log');
let logger;
const dateFormat = function () {
  return moment().format('YYYY-MM-DD HH:mm:ss:SSS');
}
logger = new (winston.Logger)({
  transports: [
    new winston.transports.Console({
      timestamp: dateFormat,
      colorize: true
    }),
    new (winston.transports.File)({
     timestamp: dateFormat,
     filename:'meizi.log'
     })

  ]
});

//这里使用stack-trace对js的错误做进一步处理
const originLoggerMethod = logger.error;

logger.error = function () {
  const cellSite = stackTrace.get()[1];
  originLoggerMethod.apply(logger,[
    arguments[0]+'\n',
    {
      filePath:cellSite.getFileName(),
      lineNumber:cellSite.getLineNumber()
    }
  ]);
}
//导出使用
module.exports = logger;
```




## JavaScript注意事项
### es6的常见问题
es6如何转译es5,参见我的blog,



# 启动服务

## 爬虫服务

`npm start`启动抓取爬虫

## api服务
使用express框架，目前是4.0版本





