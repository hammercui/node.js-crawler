/**
 * 测试phantomJs
 * Created by cly on 2017/5/4.
 */
'use strict';
const phantom = require("phantom");
var utils = require("../core/utils");
//var analysis = require("../javbus/analysisFactory");

//   直接测试phantom
let url = "https://www.javbus.com/KAWD-811";
 url = "https://www.baidu.com/";
url = "https://www.baidu.com/";
function testPhantomjs() {
  var page = require('webpage').create();
  page.viewportSize={width:1024,height:800};
  page.open(url, function (status) {
    console.log("Status: " + status);
    if (status !== 'success') {
      console.log('FAIL to load the address');
    }else{
      //success
      page.render("example.jpg");
    }
    phantom.exit();
  });
}

//测试phantoms-node
var log = console.log;
const logInfo = console.log;

async function testPhantomjsNode() {
  //添加图片n过滤
  const instance = await phantom.create(['--proxy=127.0.0.1:8080 --ignore-ssl-errors=yes', '--load-images=no'],{ logger: {info:log, warn: log, error: log } });
  const page  = await creatPageInstance(instance);
  adblock(page);
  logInfo("stat time",utils.getTime());
  const status = await page.open(url);
  if(status == "success"){
     // await page.render("ex2.jpg");
    var html = await page.property('content');
    var jqueryUrl = "https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js";

    //注入jquery脚本
    page.injectJs(jqueryUrl).then(function () {
      logInfo("inject jquery success");
      page.evaluate(function(){
        var htm  = $('title');
        var btn = $("#index-bn");
        return htm.text();
      })
        .then(element=>{
          console.log(element)
        })
    })

    // page.evaluate(function () {
    //     //var href = $("#next").val("href");
    //     var submit = document.getElementById("su");
    //     return submit;
    //     console.log("test submit",submit.getAttribute("value"));
    //   }).then(element=>{
    //     element.onclick = function () {
    //
    //     }
    // });

    //console.log("html:",html);
    logInfo("end time",utils.getTime());
  }
  console.log(status);
  //await  instance.exit();
}

/**
 * 增加图片或者广告的过滤
 * @param page
 */
function adblock( page ) {
  page.property('onResourceRequested', function(requestData, networkRequest) {
    var regexpImg = /(\.(jpg|jpeg|png|gif|svg|)(\?|\/)?$)|(ads)/;
    if ( regexpImg.test(requestData.url ) ) {
      console.log( "  - BLOCKED URL: " + requestData.url );
      networkRequest.abort();
    }
    else{
      console.log("- SUCCESS URL: " + requestData.url);
    }
  });
}

async function creatPageInstance(phantomInstance) {
  const page =  await phantomInstance.createPage();
  page.property('onLoadStart').then(()=>logInfo("onLoadStart"));
  //page.property('onUrlChanged').then(targetUrl=>logInfo("onUrlChanged",targetUrl));
  return page;
}

testPhantomjsNode();