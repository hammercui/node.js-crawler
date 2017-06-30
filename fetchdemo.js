/**
 * Created by cly on 2017/5/31.
 */

"use strict";
var request = require("./script/core/request");

var htmlHeaders = {
  "Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiIxIiwiZXhwIjoxNDk2NzIzMzYyLCJkYXRhIjp7InBsdCI6IndlYiJ9LCJqdGkiOiI4Y2QzMTdlMC00OWE3LTExZTctOTVmOS1lMTQ5ODljYTE1YmEiLCJpYXQiOjE0OTY2MzY5NjJ9.cL-YtKzh7USPQqUl-NR_vMbvNuiIMhijo4IvHqwd-mw",
  "platform":"web",
  "scheme":"https",
  "accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "accept-encoding":"gzip, deflate, sdch, br",
  "accept-language":"zh-CN,zh;q=0.8",
  "referer":"https://www.javbus.com/",
  "upgrade-insecure-requests":"1",
  "user-agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.81 Safari/537.36"
};

const index_options = {
  responseType:"json",
  timeout: 60000,
  headers: htmlHeaders,
};

const url = "http://45.32.170.186:8899/meizi/page/1";
async function startFetch(index) {
  let startTime  = Date.now();
  try{
    let result = await request(index_options).get(url);
    if(result.status === 200){
      let endTime = Date.now();
      console.log("index%d请求成功,用时%d ms",index,endTime-startTime);
      //console.log(result);
    }else{
      console.log(result);
      console.log("请求失败")
    }
  }catch (e){
    console.log("error",e.toString());
  }

}



(function () {
  for(let i=0;i<1000;i++){
    startFetch(i);
  }
})();

