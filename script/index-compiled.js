'use strict';

/**
 * Created by cly on 17/3/10.
 */

var cheerio = require('cheerio');
//var request = require('sync-request');
var request = require("./script/api/request");
var fs = require('fs');

//这里是举个例子而已，豆瓣的具体的电影网址可以自己替换
var meizitu_url = 'http://www.meizitu.com/';
// Promise.resolve(request('GET', url))
//   .then((response,body)=>{
//     console.log(response);
//     console.log(body.toString());
//   }).catch(error=>{
//     console.log(error);
// });
//封装的头部
var headers = {
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Encoding": "gzip, deflate, sdch",
  "Accept-Language": "zh-CN,zh;q=0.8",
  "Cache-Control": "max-age=0",
  "Connection": "keep-alive",
  "Cookie": "safedog-flow-item=A10C5DA46FC6EFAEE54E4BA691B4D2E0",
  "Upgrade-Insecure-Requests": 1,
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36"
};

//首页数据
var INDEX_FILE_PATH = "meizi_index.txt";

function captureMeizi() {
  var exist = fs.existsSync(INDEX_FILE_PATH);

  loadMeizHtml(exist).then(function (data) {
    analysisMezi(data);
  }).catch(function (error) {
    console.log("错误信息：" + error);
  });
}

function loadMeizHtml(exists) {
  if (exists) {
    return loadByTxt();
  } else {
    return loadByRequest();
  }
}

//通过网络抓取
function loadByRequest() {
  return request(headers).get(meizitu_url).then(function (response) {
    if (response.status == 200) {
      console.log("request的头部", response.config.headers);
      console.log("response的头部", response.headers);
      var data = response.data;
      //写入文档
      Promise.all([fs.appendFile(INDEX_FILE_PATH, data, 'utf-8')]).then(function (resolve) {
        console.log(data, "信息写入成功");
      }).catch(function (error) {
        return console.log(error);
      });

      return Promise.resolve(response.data);
    } else {
      return Promise.reject({ status: response.status });
    }
    // console.log(body.toString());
  }).catch(function (error) {
    return Promise.reject(error);
  });
}

//通过本地文档抓取
function loadByTxt() {
  //同步读取文件
  var text = fs.readFileSync(INDEX_FILE_PATH, 'utf8');
  return Promise.resolve(text);
  //异步读取文件
  // Promise.all([fs.readFile(INDEX_FILE_PATH)])
  //   .then(buffer=>{
  //     return Promise.resolve(process(buffer))
  //   }).catch(error=>{
  //     return Promise.reject(error);
  // })
}

//
// var request = request('GET', url);
// console.log(request)
// var html = request.getBody().toString();
function analysisMezi(html) {
  //html存入txt文档
  Promise.all([fs.appendFile("meizi_index.txt", html, 'utf-8')]).then(function (resolve) {
    console.log(data, "信息写入成功");
  }).catch(function (error) {
    return console.log(error);
  });

  var $ = cheerio.load(html); //引入cheerio的方法。这样的引入方法可以很好的结合jQuery的用法。
  var maincontent = $.find("maincontent");
  console.log(maincontent);
  //var a_list =

  // $("div.postContent").each(function (idx,element) {
  //   var $element = $(element);
  //   var picture = $element.find("picture");
  //   console.log(picture);
  // });
}

function handleDB(html) {
  var $ = cheerio.load(html); //引入cheerio的方法。这样的引入方法可以很好的结合jQuery的用法。
  var info = $('#info');
  // 获取电影名
  var movieName = $('#content>h1>span').filter(function (i, el) {
    return $(this).attr('property') === 'v:itemreviewed';
  }).text();
  // 获取影片导演名
  var directories = '- 导演：' + $('#info span a').filter(function (i, el) {
    return $(this).attr('rel') === 'v:directedBy';
  }).text();
  // 获取影片演员
  var starsName = '- 主演：';
  $('.actor .attrs a').each(function (i, elem) {
    starsName += $(this).text() + '/';
  });
  // 获取片长
  var runTime = '- 片长：' + $('#info span').filter(function (i, el) {
    return $(this).attr('property') === 'v:runtime';
  }).text();
  // 获取影片类型
  var kind = $('#info span').filter(function (i, el) {
    return $(this).attr('property') === 'v:genre';
  }).text();
  // 处理影片类型数据
  var kLength = kind.length;
  var kinds = '- 影  片类型：';
  for (var i = 0; i < kLength; i += 2) {
    kinds += kind.slice(i, i + 2) + '/';
  }
  // 获取电影评分和电影评分人数
  // 豆瓣
  var DBScore = $('.ll.rating_num').text();
  var DBVotes = $('a.rating_people>span').text().replace(/\B(?=(\d{3})+$)/g, ',');
  var DB = '- 豆  瓣评分：' + DBScore + '/10' + '(' + 'from' + DBVotes + 'users' + ')';
  // IMDBLink
  var IMDBLink = $('#info').children().last().prev().attr('href');

  var data = movieName + '\r\n' + directories + '\r\n' + starsName + '\r\n' + runTime + '\r\n' + kinds + '\r\n' + DB + '\r\n';

  Promise.all([fs.appendFile("dbmovie.txt", data, 'utf-8')]).then(function (resolve) {
    console.log(data, "信息写入成功");
  }).catch(function (error) {
    return console.log(error);
  });
  // 输出文件
  // fs.appendFile('dbmovie.txt', data, 'utf-8', function(err){
  //   if (err) throw err;
  //   else console.log('大体信息写入成功'+'\r\n' + data)
  // });
}

//handleDB(html);

captureMeizi();

//# sourceMappingURL=index-compiled.js.map