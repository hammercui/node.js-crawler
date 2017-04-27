/**
 * 爬虫工厂类
 * Created by cly on 2017/4/25.
 */
"use strict";

var cheerio = require('cheerio');

module.exports = class crawlerFactory {

  constructor() {}

  /**
   * 解析首页,返回对象数组
   * @param html
   */
  analysisIndex(html) {
    var $ = cheerio.load(html); //引入cheerio的方法。这样的引入方法可以很好的结合jQuery的用法。
    var postContentList = $("#maincontent").find(".postContent");
    var dateArray = new Array();
    //解析首页并存入数据
    postContentList.each(function (idx, element) {
      var postContent = $(this);
      var a = $(postContent).find("a");
      var href = $(a).attr("href");
      var title = $(a).attr("title");
      var img = $(a).find("img");
      var imgSrc = $(img).attr("src");
      var tempArray = imgSrc.split("uploads");
      var imgNameTemp = tempArray[tempArray.length - 1].toString();
      var imgName = imgNameTemp.replace(/\//g, "");

      var imageItem = { href: href, title: title, imgSrc: imgSrc, imgName: imgName };
      dateArray.push(imageItem);
    });

    return dateArray;
  }

};

//# sourceMappingURL=crawlerFactory_temp-compiled.js.map