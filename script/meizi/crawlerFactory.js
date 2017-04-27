/**
 * Created by cly on 2017/4/27.
 */

var cheerio  = require("cheerio");

module.exports =  class crawlerFactory{


  /**
   * 解析首页,返回对象数组
   * @param html
   */
  analysisIndex(html){
    var $ = cheerio.load(html); //引入cheerio的方法。这样的引入方法可以很好的结合jQuery的用法。
    //#号是id选择器 .号是class选择器
    var postContentList = $("#maincontent").find(".postContent");
    var taglist = $("#maincontent").find(".postmeta");
    var dateArray = new Array();
    //解析首页并存入数据
    postContentList.each(function (idx,element) {
      var postContent = $(element);
      var a = $(postContent).find("a");
      var href = $(a).attr("href");
      var title = $(a).attr("title");
      var img = $(a).find("img");
      var imgSrc = $(img).attr("src");
      var tempArray = imgSrc.split("uploads");
      var imgNameTemp = tempArray[tempArray.length - 1].toString();
      var imgName = imgNameTemp.replace(/\//g,"");

      var tagcontent = taglist[idx];
      var tagstring =  $(tagcontent).find("p").text().replace(/\//g);

      var imageItem = {href:href,title:title,thumb:imgSrc,imgName:imgName,tags:tagstring};
      dateArray.push(imageItem);
    });

    return dateArray;
  }

}