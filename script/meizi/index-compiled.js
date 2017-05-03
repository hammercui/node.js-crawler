/**
 * Created by cly on 17/3/22.
 */
"use strict";

var _crawlerFactoryCompiled = require("./analysisFactory-compiled");

var _crawlerFactoryCompiled2 = _interopRequireDefault(_crawlerFactoryCompiled);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var request = require("./request");
var iconv = require('iconv-lite');
var cookie = "safedog-flow-item=4D72DD1431AFCC72F5CEC36D4F5EF70B";
var baseUrl = 'http://www.meizitu.com/';
var fs = require('fs');

//var dao = require("./db");

var crawler = new _crawlerFactoryCompiled2.default();

//封装html的request头部
var htmlHeaders = {
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Encoding": "gzip, deflate, sdch",
  "Accept-Language": "zh-CN,zh;q=0.8",
  "Cache-Control": "max-age=0",
  "Connection": "keep-alive",
  // "Cookie":cookie,
  "Upgrade-Insecure-Requests": 1,
  "Host": "www.meizitu.com",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) " + "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36"
};

//封装image的request头部
var imageHeaders = {
  "Accept": "image/webp,image/*,*/*;q=0.8",
  "Accept-Encoding": "gzip, deflate, sdch",
  "Accept-Language": "zh-CN,zh;q=0.8",
  "Cache-Control": "max-age=0",
  "Connection": "keep-alive",
  "Cookie": cookie,
  "Upgrade-Insecure-Requests": 1,
  "Host": "mm.howkuai.com",
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) " + "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36"
};
//编码格式
var charset = "gb2312";

const index_options = {
  responseType: "arraybuffer",
  timeout: 10000,
  headers: htmlHeaders
};

var image_options = {
  timeout: 10000,
  responseType: "stream", //二进制
  headers: imageHeaders
};

//抓取妹子
function captureMeizi() {
  request(index_options).get(baseUrl).then(response => {
    if (response.status == 200) {
      return Promise.resolve(response.data);
    } else {
      var error = { status: response.status, msg: response.statusText };
      return Promise.reject(error);
    }
  }).then(resolve => {
    var html = iconv.decode(resolve, "gb2312");
    analysisMezi(html);
  }, reject => Promise.reject(reject)).catch(error => {
    console.log("错误信息：" + error);
  });
}

function analysisMezi(html) {
  //打开数据库
  // var dbInstance;
  // dao.connectDB()
  //   .then(db=>{
  //     dbInstance = db;
  //   }).catch(error=>console.log(error));
  //
  // console.log(imageArray);
  //
  // dao.selectData(dbInstance,"homePage",{imgSrc:imgSrc})
  //   .then(result=>{
  //
  //   })
  //   .catch(error=>{
  //     console.log("查询",error);
  //     dao.insertData(dbInstance,"homePage",imageItem)
  //       .then(result=>{
  //         console.log("插入数据",result);
  //       })
  //       .then(error=>{
  //         console.log("插入",error);
  //       })
  //   });

  //写入文档
  //var str = JSON.stringify(imageArray);

  console.log(crawler.analysisIndex(html));

  // fs.writeFile("../../data/index.json",str,function (error) {
  //   if(error){
  //     console.log('写入json失败：'+error.toString());
  //     return ;
  //   }
  //   console.log('写入json成功：');
  // });
  //写入数据库
}

function downloadImg() {
  var json = require("../../data/index.json");
  Promise.all(json.map(imageItem => {
    return request(image_options).get(imageItem.imgSrc).then(response => {
      if (response.status == 200) {
        return Promise.resolve(response.data);
      } else {
        var error = { status: response.status, msg: response.statusText };
        return Promise.reject(error);
      }
    }).then(body => {
      //创建写入流
      var writerStream = fs.createWriteStream("../../image/" + imageItem.imgName);
      writerStream.on('finish', function () {
        console.log(imageItem.imgName + "下载成功！");
        return Promise.resolve(imageItem);
      });

      writerStream.on('error', function (err) {
        console.log(err.stack);
        console.log(imageItem.imgName + "下载失败！", err.stack);
        return Promise.reject(imageItem.imgSrc);
      });
      body.pipe(writerStream);
    });
  })).then(result => {
    //result是数组
    console.log("result success:", result);
  }).catch(error => {
    console.log("result error:", error);
  });
}

captureMeizi();
//downloadImg();

//# sourceMappingURL=index-compiled.js.map