/**
 * Created by cly on 17/3/22.
 */
"use strict";
var request = require("../core/request");
var fs = require('fs');
var analysisFactory = require("./analysisFactory");
var dao  = require("./odm_db");
var capture = require("./captureFactory");
var logger = require('./../core/logFactory');
var utils = require("../core/utils");

var analysis = new analysisFactory();
var baseUrl = 'https://www.javbus.com/';


function captureList(index) {
  var indexUrl = getIndexUrl(index);
  var url = baseUrl+indexUrl;
  logger.info(url,utils.getTime(),"start",url);
  var retryTime = 0;
  capture.captureHtml(url)
    .then(html=>{
        return analysis.analysisThumbList(html);
    })
    .then(list=>{
      logger.info(utils.getTime(),"capture success,ready insert list length:",list.length);
      if(list&&list.length>0)
        return dao.insertDetailList(list);
      else{
        return Promise.resolve("list为空，直接插入成功");
      }
    })
    .then(success=>{
      logger.info(utils.getTime(),"insert success".concat(indexUrl,success));
      logger.info(utils.getTime(),"end",url);
      //开始休眠
      var sleepTime = Math.floor(Math.random()*10000);
      logger.info("开始延迟",sleepTime,"毫秒");
      return new Promise(resolve=>setTimeout(()=>resolve(),sleepTime))
    })
    .then(()=>{
      logger.info("延时结束");
      //下一个循环
      // var curIndex = index + 1;
      // if(curIndex < 35)
      //   captureList(curIndex);
      // else{
      //   logger.info("抓取到页码".concat(index,",抓取完成"));
      //   process.exit()
      // }

    })
    .catch(error=>{
      logger.warn("error 抓取 "+url+"失败",error);
      // retryTime++;
      // if(retryTime < 4){
      //   logger.info("第".concat(retryTime,"次重试"));
      //   captureList(index);
      // }
      // else{
      //   logger.info("已经重试".concat(retryTime,"次了，停止"));
      //   process.exit()
      // }

    })
}

function getIndexUrl(index) {
  return "page/".concat(index);

}


//captureHome();
captureList(1);

function testAll() {
  var array = [1,2,3,4];
  var promiseArray = array.map((t,idx)=>{
    return Promise.resolve(t);
  })


  Promise.all(promiseArray).then(list=>{
    logger.info(list);
  })
}

//
// dao.selectDetail({id:'5903'}).then(resolve=>{
//   logger.info("success",resolve);
// },reject=>{
//   logger.info("reject",reject);
// })

//testAll();

//logger.info(utils.getTime());