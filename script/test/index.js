/**
 * Created by cly on 17/3/10.
 */
'use strict';
var cheerio = require('cheerio');
var request = require("request");
var requestProgress = require("request-progress");
var download  = require("download");
//var request = require("./core/request");
var iconv = require('iconv-lite');
var fs = require('fs');
//编码格式
var charset = "gb2312";

global.cookie = "__jsluid=4ed82ed90a22a44e3b0b08ca4dc7df58";

//这里是举个例子而已，豆瓣的具体的电影网址可以自己替换
var meizitu_url = 'http://www.meizitu.com/';
//封装html的request头部
var htmlHeaders = {
    "Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Encoding":"gzip, deflate, sdch",
    "Accept-Language":"zh-CN,zh;q=0.8",
    "Cache-Control":"max-age=0",
    "Connection":"keep-alive",
    "Cookie":global.cookie,
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
  "Cookie":global.cookie,
  "Upgrade-Insecure-Requests":1,
  "Host":"mm.howkuai.com",
  "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
};



//request请求options
var htmlOptions = {
  encoding:null,
  headers:htmlHeaders,
  //代理服务器
  //proxy: 'http://xxx.xxx.xxx.xxx:8888',
}
var imageOptions = {
  encoding:"binary",//二进制
  headers:imageHeaders,
}

//首页数据存档
var DATA_INDEX_FILE = "./data/meizi_index.txt";

//抓取妹子
function captureMeizi() {
    var exist = fs.existsSync(DATA_INDEX_FILE);
    loadMeizHtml(exist)
    .then(data=>{
        analysisMezi(data);
      })
      .catch(error=>{
        console.log("错误信息："+error);
      })
}

function loadMeizHtml(exists) {
  // if(exists){
  //   return loadByTxt();
  // }
  // else{
    return loadByRequest();
  //}
}

//通过网络抓取
function loadByRequest() {
  //异步网络请求
  return new Promise(function (resolve,reject) {
          request(meizitu_url,htmlOptions,function (error,response) {
            if(error)
              return reject(error);
            //请求成功
            if(response.statusCode == 200){
              //更新token
              var responseHeader = response.toJSON().headers;
              if(responseHeader.hasOwnProperty("set-cookie")){
                var cookie = responseHeader["set-cookie"][0].split(";")[0];
                if(cookie){
                  global.cookie = cookie;
                  console.log(cookie);
                }
              }
              var html = iconv.decode(response.body,charset) ;
              return resolve(html);
          }
          else{
            var error= {statusCode:response.statusCode,statusMessage:response.statusCode};
            reject(error);
          }
        });
  })
    // //再存入
    // .then(html=>{
    //   return Promise.resolve(fs.writeFile(DATA_INDEX_FILE,html);
    // });
}

//通过本地文档抓取
function loadByTxt() {
  //同步读取文件
  var text = fs.readFileSync(DATA_INDEX_FILE);
  return Promise.resolve(text);
}



function analysisMezi(html) {
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
    var image = {href:href,title:title,imgSrc:imgSrc,imgName:imgName};
    imageArray.push(image);
  })
  console.log(imageArray);
  var str = JSON.stringify(imageArray);
  //写入文档
  fs.writeFile("./data/index.json",str,function (error) {
    if(error){
      console.log('写入json失败：'+error.toString());
    }
    console.log('写入json成功：');
  });
  //console.log("imageArray count:"+imageArray.length);
}


function downloadImg() {
  var json = require("./../../data/index.json");
  Promise.all(
    json.map(imageItem=>{
      //下载
      return new Promise(function (resolve,reject) {
        request.get(imageItem.imgSrc,imageOptions,function (error,res,body) {
          //错误
          if(error)
            return reject(error);
          return resolve(body);
        })
      })
        .then(body=>{
          fs.writeFileSync("./image/"+imageItem.imgName, body, 'binary');
          console.log(imageItem.imgName+"下载成功！");
          return Promise.resolve(imageItem.imgName+"下载成功！");
        })
        .catch(error=>{
          return Promise.resolve(error);
        })

    })
  ).then((result)=>{

  }).catch(error=>{
    console.log("下载错误",error)
  });
}

captureMeizi();
//downloadImg();
//downloadImageWithProgress();