/**
 * Created by cly on 17/3/22.
 */

var request = require("../api/request");
var iconv = require('iconv-lite');
var cheerio = require('cheerio');
var cookie = "safedog-flow-item=4D72DD1431AFCC72F5CEC36D4F5EF70B";
var baseUrl = 'http://www.meizitu.com/';
var fs = require('fs');
var dao = require("./db");
//封装html的request头部
var htmlHeaders = {
  "Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Encoding":"gzip, deflate, sdch",
  "Accept-Language":"zh-CN,zh;q=0.8",
  "Cache-Control":"max-age=0",
  "Connection":"keep-alive",
 // "Cookie":cookie,
  "Upgrade-Insecure-Requests":1,
  "Host":"www.meizitu.com",
  "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
};

//封装image的request头部
var imageHeaders = {
  "Accept":"image/webp,image/*,*/*;q=0.8",
  "Accept-Encoding":"gzip, deflate, sdch",
  "Accept-Language":"zh-CN,zh;q=0.8",
  "Cache-Control":"max-age=0",
  "Connection":"keep-alive",
  "Cookie":cookie,
  "Upgrade-Insecure-Requests":1,
  "Host":"mm.howkuai.com",
  "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
};
//编码格式
var charset = "gb2312";


const index_options = {
  responseType:"arraybuffer",
  timeout: 10000,
  headers: htmlHeaders,
  proxy: {
    host: '127.0.0.1',
    port: 9743,
  },//代理
};


var image_options = {
  timeout: 10000,
  responseType:"stream",//二进制
  headers:imageHeaders,
  proxy: {
    host: '127.0.0.1',
    port: 9743,
  },//代理
}



//抓取妹子
function captureMeizi() {
  request(index_options).get(baseUrl)
    .then(response=>{
      if(response.status == 200){
        //console.log("response头部",response.headers);
        return Promise.resolve(response.data);
      }
      else{
        var error = {status:response.status,msg:response.statusText};
        return Promise.reject(error);
      }
    })
    .then(html=>{
      var newhtml = iconv.decode(html,"gb2312");
       analysisMezi(newhtml);
      //console.log("response",newhtml);
      return Promise.resolve();
    })
    .catch(error=>{
      console.log("错误信息："+error);
    })
}

function analysisMezi(html) {
  //打开数据库
  var dbInstance;
  dao.connectDB()
    .then(db=>{
      dbInstance = db;
    }).catch(error=>console.log(error));


  var $ = cheerio.load(html); //引入cheerio的方法。这样的引入方法可以很好的结合jQuery的用法。
  var postContentList = $("#maincontent").find(".postContent");
  var imageArray = new Array();
  postContentList.each(function (idx,element) {
    var postContent = $(this);
    var a = $(postContent).find("a");
    var href = $(a).attr("href");
    var title = $(a).attr("title");
    var img = $(a).find("img");
    var imgSrc = $(img).attr("src");
    var tempArray = imgSrc.split("uploads");
    var imgNameTemp = tempArray[tempArray.length - 1].toString();
    var imgName = imgNameTemp.replace(/\//g,"");

    var imageItem = {href:href,title:title,imgSrc:imgSrc,imgName:imgName};
    dao.selectData(dbInstance,"homePage",{imgSrc:imgSrc})
      .then(result=>{

      })
      .catch(error=>{
        console.log("查询",error);
        dao.insertData(dbInstance,"homePage",imageItem)
          .then(result=>{
            console.log("插入数据",result);
          })
          .then(error=>{
            console.log("插入",error);
          })
      });

    imageArray.push(imageItem);
  })
  console.log(imageArray);

  //写入文档
  var str = JSON.stringify(imageArray);
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
  Promise.all(json.map(imageItem=>{
      return request(image_options).get(imageItem.imgSrc)
        .then(response=>{
            if(response.status == 200){
              return Promise.resolve(response.data)
            }
            else{
              var error = {status:response.status,msg:response.statusText};
              return Promise.reject(error);
            }

        })
        .then(body=>{
          //创建写入流
          var writerStream = fs.createWriteStream("../../image/"+imageItem.imgName);
          writerStream.on('finish', function() {
            console.log(imageItem.imgName+"下载成功！");
            return Promise.resolve(imageItem);
          });

          writerStream.on('error', function(err){
            console.log(err.stack);
            console.log(imageItem.imgName+"下载失败！",err.stack);
            return Promise.reject(imageItem.imgSrc);
          });
          body.pipe(writerStream);
        })
  }))
    .then(result=>{
      //result是数组
      console.log("result success:",result);
    })
    .catch(error=>{
      console.log("result error:",error);
    });
}


captureMeizi();
//downloadImg();