'use strict';

/**
 * Created by cly on 17/3/18.
 */
var cheerio = require('cheerio');
var request = require('request');
// http://www.meizitu.com/a/list_1_1.html
var meizitu_url = 'http://www.meizitu.com/a/list_1_';

var page = 1;

var testUrl = meizitu_url + page + '.html';

request(testUrl, function (error, response) {

  // console.log(response.body);
  if (error) {
    console.log("error", error);
  }
  var $ = cheerio.load(response.body);
  //find 用于匹配单个
  //children 用于列表，返回符合li子节点的列表
  var links = $("#wp_page_numbers").find('ul').children("li");
  var count = links.length;
  links.each(function (item) {
    var li = $(this); //获得每个课程li
    var a = li.find("a").attr("href");
    console.log(a);
  });
  console.log("count:" + count);

  //console.log(links);

});

//# sourceMappingURL=test-compiled.js.map