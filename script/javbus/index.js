/**
 * Created by cly on 17/3/22.
 */
"use strict";
var request = require("../core/request");
var fs = require('fs');
var analysisFactory = require("./analysisFactory");
var dao  = require("./odm_db");
var capture = require("./../core/captureFactory");
var logger = require('./../core/logFactory');
var utils = require("../core/utils");

var analysis = new analysisFactory();
var baseUrl = 'https://www.javbus.com/';

const loggerInfo = logger.info;

var retryTime = 0;

function captureList(index) {
  var indexUrl = getIndexUrl(index);
  var url = baseUrl+indexUrl;
  var TAG = "Page".concat(index);
  logger.info(TAG,utils.getTime(),"start",url);
  capture.captureByPhantom(url)
    .then(html=>{
        loggerInfo(TAG,"capture thumbList success");
        return analysis.analysisThumbList(html);
    },reject=>Promise.reject(reject))
    .then(list=>{
      logger.info(TAG,utils.getTime(),"capture detail success,ready insert list length:",list.length);
      if(list&&list.length>0){
        return dao.insertDetailList(list);
      }
      else{
        return Promise.resolve(TAG,"list为空，直接插入成功");
      }
    },reject=>Promise.reject(reject))
    .then(success=>{
      logger.info(TAG,utils.getTime(),"insert detailList success ");
      logger.info(TAG,utils.getTime(),"end",url);
      //开始休眠
      var sleepTime = Math.floor(Math.random()*10000);
      logger.info(TAG,"开始延迟",sleepTime,"毫秒");
      return new Promise(resolve=>setTimeout(()=>resolve(),sleepTime))
    },reject=>Promise.reject(reject))
    .then(()=>{
      logger.info(TAG,"延时结束");
      //下一个循环
      var curIndex = index + 1;
      if(curIndex < 35){
        retryTime = 0;
        captureList(curIndex);
      }
      else{
        logger.info("抓取到页码".concat(index,",抓取完成"));
        process.exit()
      }
    })
    .catch(error=>{
      logger.warn(TAG,"error 抓取 "+url+"失败",error);
      retryTime = retryTime+1;
      if(retryTime < 4){
        logger.info("第".concat(retryTime,"次重试"));
        captureList(index);
      }
      else{
        logger.info("已经重试".concat(retryTime,"次了，停止"));
        process.exit();
      }

    })
}

function getIndexUrl(index) {
  return "page/".concat(index);
}


//captureHome();
captureList(32);
//test();


function test() {
  // var array = [1,2,3,4];
  // var promiseArray = array.map((t,idx)=>{
  //   return Promise.resolve(t);
  // })
  //
  //
  // Promise.all(promiseArray).then(list=>{
  //   logger.info(list);
  // })


//
// dao.selectDetail({id:'5903'}).then(resolve=>{
//   logger.info("success",resolve);
// },reject=>{
//   logger.info("reject",reject);
// })

//testAll();

//logger.info(utils.getTime());


  var url = "https://www.javbus.com/TYOD-338";
  //抓取一页存入文件
  /**

  capture.captureByPhantom(url)
    .then(html=>{
      fs.writeFileSync("test.txt",html);
      loggerInfo("已存入test.txt");
    })
    .catch(e=>loggerInfo(e));
  **/

  //从文件读取并解析

  var html = fs.readFileSync("test.txt","utf-8");
  var href = url;
  var id = url.replace("https://www.javbus.com/","");
  var detail = {href:href,id:id};
  var item = analysis.analysisDetail(html,detail);
  loggerInfo(item);


  //直接抓取详情页并保存

  // capture.captureByPhantom(url)
  //   .then(html=>{
  //     var href = url;
  //     var id = url.replace("https://www.javbus.com/","");
  //     var detail = {href:href,id:id};
  //     var item = analysis.analysisDetail(html,detail);
  //     return dao.insertDetailList(item);
  //   })
  var list= [];
  list.push(item);
  // dao.insertDetailList(list)
  // .then(
  //     resolve=>loggerInfo("success",resolve),
  //     reject=>loggerInfo("fail",reject))
  //   .catch(e=>loggerInfo("err",e));
  dao.update({id:"TYOD-338"},{series:item.series})
  .then(
      resolve=>loggerInfo("success",resolve),
      reject=>loggerInfo("fail",reject))
    .catch(e=>loggerInfo("err",e));
}
