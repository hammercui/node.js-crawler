> 一个用nodejs实现的爬虫

* [1.目标](#目标)
 

* [2.开发日志](#开发日志)
 	*  [mongoDB搭配Mongoose存储数据](#mongodb搭配mongoose存储数据)
 		* [mongoDB的启动](#mongodb的启动) 
 		* [mongoDB的文档与集合](#mongodb的文档与集合)
 		* [Mongoose](#mongoose)
 		* [日志框架选择](#日志框架选择)
 	*  [JavaScript注意事项](#javascript注意事项) 
 		* [es6如何转译es5](#es6如何转译es5)
 		* [nodejs文件写入写出](#nodejs文件写入写出)
 		* [PhantomJS的使用](#phantomjs的使用)

* [3.启动服务](#启动服务)
	* [爬虫服务](#爬虫服务)
	* [api服务](#api服务) 

# 目标

* 爬取图片，并下载保存文件
* 爬取数据，并存入mongoDB

- [ x ] 已完成[http://www.meizitu.com/](http://www.meizitu.com/)的抓取工作
- [ x ] 准备javbus的抓取工作

# 开发日志

## mongoDB搭配Mongoose存储数据

### mongoDB的启动

1 mac启动mongoDB服务：

打开终端，输入`cd Application/mongodb/bin`回车后，再输入
`./mongod`


2 启动客户端命令行：

打开另一个终端，输入`Application/mongodb/bin`,回车，输入`./mongo`,这时候可以用命令行操作数据库

### mongoDB的文档与集合

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




### Mongoose
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
### 正则表达式的运用

* 匹配空白 `\\s`
* 匹配非空白`\[^\s]`
* 

### es6如何转译es5
es6如何转译es5,参见我的blog,

### nodejs文件写入写出
常见的问题就是转码的问题了，一般很多页面都是gb2312,我们需要借助`iconv-lite`进行编码转换

```
  var html = iconv.decode(response.body,"gb2312") ;
```
### jquery的遍历
在使用jquery对象遍历时，测试发现`forEach`,`map`等语法不可用，只能使用老旧的`each`语法

```
each(function(index,element)){

}

```

### PhantomJS的使用

很多页面为了解决被爬的问题，使用了ajax异步加载，部分数据通过ajax传递，这样普通的get请求获得的页面就不能完整解析了。

怎么办呢，我发现了[PhantomJS](http://phantomjs.org/),他是一个无头浏览器。简介如下:
>PhantomJS is a headless WebKit scriptable with a JavaScript API. It has fast and native support for various web standards: DOM handling, CSS selector, JSON, Canvas, and SVG
>
>支持所有浏览器能支持的内容

1. 下载安装[http://phantomjs.org/download.html](http://phantomjs.org/download.html) 或者更简单的方式`brew install phantomjs`
2. nodejs环境强烈推荐这个[phantomjs-node](https://github.com/amir20/phantomjs-node)

#### phantomjs-node的使用
>我们在nodejs环境下使用phantom和直接使用phantomjs有很多区别，下面一一罗列

1.创建page类

```
//phantomjs模式
var page = require('webpage').create();
//nodejs模式
 const instance = await phantom.create(['--proxy=127.0.0.1:8080 --ignore-ssl-errors=yes', '--load-images=no'],{ logger: {info:log, warn: log, error: log } });
  
 const page =  await phantomInstance.createPage()
```

2 open一个url

```
//phantomjs模式
page.open(address, function(status) {
  if (status !== 'success') {
    console.log('FAIL to load the address');
  }
  phantom.exit();
});
//nodejs模式
const status = await page.open(url);
  if(status == "success"){
    var html = await page.property('content');
  }
  console.log(status);
  await  instance.exit();
```
3 对广告进行拦截

```
//phantomjs模式
page.onResourceRequested = function(request,networkRequest) {
  console.log('Request ' + JSON.stringify(request, undefined, 4));
};

//nodejs模式
//大部分改成了page.property(key)模式
page.property('onResourceRequested', function(requestData, networkRequest) {
    var regexpImg = /(\.(jpg|jpeg|png|gif|svg|)(\?|\/)?$)|(ads)/;
    if ( regexpImg.test(requestData.url ) ) {
      console.log( "  - BLOCKED URL: " + requestData.url );
      networkRequest.abort();
    }
    // else{
    //   console.log("- SUCCESS URL: " + requestData.url);
    // }
  });
```
4 phantomjs加入超时机制

主要使用setTimeout机制

```
var callback = new Promise(function (resolve,reject) {
      setTimeout(function () {
        reject("请求超时");
      },15000);

      var result;
      page.open(url)
        .then(status=>{
          if(status == "success"){
            return page.property('content')
          }
          return Promise.reject(status);
        })
        .then(html=>{
          result = html;
          return page.close();
        })
        .then(()=>{
          resolve(result);
        })
        .catch(e=>{
          reject(e);
        })
    });
    
    return callback;
```



# 启动服务

## 爬虫服务
1.启动meizitu爬虫

```
//进入目录
cd ./script/meizi
//
node index.js
```

2.启动javbus爬虫

```
//进入目录
cd ./script/javbus
//
node index.js
```

## api服务
使用express框架，目前是4.0版本

1. express提供静态服务

```
var publicPath = __dirname+"/public";
logger.info("publicPath",publicPath);
app.use(express.static(publicPath));
```







