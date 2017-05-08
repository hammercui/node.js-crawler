/**
 * 抓取工厂类，提供不同抓取方法
 * Created by cly on 2017/5/2.
 */


"use strict";
var request = require("request");
var iconv = require('iconv-lite');
var cookie = "__cfduid=ddb8a3e2c06034d60f21df66f9f96f2521487642677; HstCfa2807330=1487642691619; c_ref_2807330=https%3A%2F%2Fwww.google.co.jp%2F; 4fJN_2132_saltkey=V7vb9ax9; 4fJN_2132_lastvisit=1492577431; PHPSESSID=v21l7kc2k4iocrhqvfm28rgff6; HstCmu2807330=1493774556554; HstCla2807330=1493796231015; HstPn2807330=6; HstPt2807330=421; HstCnv2807330=10; HstCns2807330=16";
var logger = require("./logFactory");
const phantom = require("phantom");
var utils = require("./utils");

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
function captureDirect(url) {
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


var instance;

/**
 * 使用phantom抓取
 * @param url
 */
//'--proxy=127.0.0.1:8080',
//'--proxy-type=socks5',
async function captureByPhantom(url) {
  if(!instance){
    instance = await  phantom.create(
      [
        '--proxy=127.0.0.1:8080 --proxy-type=https  --ignore-ssl-errors=yes',
        '--load-images=no'],
      { logger: {info:logger.info, warn: logger.warn, error: logger.error } });
    //instance = await instance.setProxy("")
  }

  var page;
  var html;
  //设置超时监听

  try{
    page  = await createPageInstance(instance);
    adblock(page);
    logger.info("phantom start crawler url:",url);

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


      // const status = await page.open(url);
      // if(status == "success") {
      //   html = await page.property('content');
      // }
      // await page.close();
      // if(html)
      //   return Promise.resolve(html);
      // else
      //   return Promise.reject(status);
    });
    return callback;
  }catch(e){
    return Promise.reject(e);
  }

}

/**
 * 增加图片或者广告的过滤
 * @param page
 */
function adblock( page ) {
  page.property('onResourceRequested', function(requestData, networkRequest) {
    var regexpImg = /(\.(jpg|jpeg|png|gif|svg|)(\?|\/)?$)|(ads)|(eyeota)|(areyouahuman)/;
    if ( regexpImg.test(requestData.url ) ) {
      //console.log( "加载中  - BLOCKED URL: " + requestData.url );
      //console.log(" -- 加载中... --");
      networkRequest.abort();
    }
    else{
      //console.log(" -- 加载中... --");
      //console.log("加载中- SUCCESS URL: " + requestData.url);
    }
  });
}

/**
 * 退出phantom
 */
function exitPhantom() {
  phantom.exit();
}

/**
 * 获得page的实例
 * @param phantomInstance
 * @returns {*}
 */
async function createPageInstance(phantomInstance) {
  const page =  await phantomInstance.createPage();
  page.property('onLoadStart').then(()=>logger.info("onLoadStart"));
  //page.property('onUrlChanged').then(targetUrl=>logInfo("onUrlChanged",targetUrl));
  return page;
}

module.exports = {
  captureDirect,
  captureByPhantom
}