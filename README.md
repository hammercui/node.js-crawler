> 一个用nodejs实现的爬虫

# 目标

* 爬取图片，并下载保存文件
* 爬取数据，并存入mongoDB

# 开发进度
## mongoDB搭配Mongoose存储数据

####mongoDB的启动：

1 mac启动mongoDB服务：

打开终端，输入`cd Application/mongodb/bin`回车后，再输入
`./mongod`


2 启动客户端命令行：

打开另一个终端，输入`Application/mongodb/bin`,回车，输入`./mongo`,这时候可以用命令行操作数据库

####mongoDB的文档与集合：

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

####Mongoose
Mongoose是MongoDB的js版本的orm框架。

## JavaScript注意事项
### es6的常见问题
es6如何转译es5,参见我的blog,


# 启动服务

`npm start`启动首页脚本



