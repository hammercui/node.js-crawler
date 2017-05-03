/**
 * Created by cly on 2017/5/2.
 */


"use strict";
var request = require("../core/request");
var iconv = require('iconv-lite');
var cookie = "__cfduid=ddb8a3e2c06034d60f21df66f9f96f2521487642677; HstCfa2807330=1487642691619; c_ref_2807330=https%3A%2F%2Fwww.google.co.jp%2F; 4fJN_2132_saltkey=V7vb9ax9; 4fJN_2132_lastvisit=1492577431; PHPSESSID=v21l7kc2k4iocrhqvfm28rgff6; HstCmu2807330=1493774556554; HstCla2807330=1493796231015; HstPn2807330=6; HstPt2807330=421; HstCnv2807330=10; HstCns2807330=16";
var logger = require("./../core/logFactory");

//封装html的request头部
var htmlHeaders = {
  "authority":"www.javbus.com",
  "scheme":"https",
  "accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "accept-encoding":"gzip, deflate, sdch, br",
  "accept-language":"zh-CN,zh;q=0.8",
  "cookie":cookie,
  "referer":"https://www.javbus.com/",
  "upgrade-insecure-requests":"1",
  "user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36"
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
  "Host":"www.meizitu.com",
  "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
};
//编码格式
var charset = "gb2312";


const index_options = {
  responseType:"arraybuffer",
  timeout: 15000,
  headers: htmlHeaders,
  proxy: {
    host: '127.0.0.1',
    port: 1080,
  },//代理
};


var image_options = {
  timeout: 10000,
  responseType:"stream",//二进制
  headers:imageHeaders,
  // proxy: {
  //   host: '127.0.0.1',
  //   port: 9743,
  // },//代理
}



//根据url抓取文档
function captureHtml(url) {
  logger.info("抓取页面url:",url);
  return request(index_options).get(url)
    .then(response=>{
      if(response.status == 200){
        return Promise.resolve(response.data);
      }
      else{
        var error = {status:response.status,msg:response.statusText};
        return Promise.reject(error);
      }
    })
    .then(
      resolve=>Promise.resolve(iconv.decode(resolve,"gb2312")),
      reject=>Promise.reject(reject)
    )
}

function captureMagent(params= {gid:0,ur:0,img:""}) {
  logger.info("抓取页面url:",url);
  return request(index_options).get(url)
    .then(response=>{
      if(response.status == 200){
        return Promise.resolve(response.data);
      }
      else{
        var error = {status:response.status,msg:response.statusText};
        return Promise.reject(error);
      }
    })
    .then(
      resolve=>Promise.resolve(iconv.decode(resolve,"gb2312")),
      reject=>Promise.reject(reject)
    )
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


module.exports = {
  captureHtml,
}