/**
 * Created by cly on 2017/4/27.
 */

var cheerio  = require("cheerio");
var capture = require("./captureFactory");
var logger = require("./../core/logFactory");
var _ = require("lodash");
var dao = require("./odm_db");

module.exports =  class analysisFactory{


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
      var tagstring =  $(tagcontent).find("p").text().replace(/[\s\w:]/g,"");
      var tags = tagstring.split(',');
      var id = imgName.replace(/[^0-9]/g,"");
      id = id.replace(/2017/g,"2015");
      var imageItem = {href:href,title:title,thumb:imgSrc,imgName:imgName,tags:tags,id:id};
      dateArray.push(imageItem);
    });
    return dateArray;
  }

  /**
   * 解析缩略图列表
   * @param html
   */
  analysisThumbList(html){
    var $ = cheerio.load(html); //引入cheerio的方法。这样的引入方法可以很好的结合jQuery的用法。
    //#号是id选择器 .号是class选择器
    var thumbList = $(".wp-item");
    var detailArray = [];
    thumbList.each(function (idx,element) {
      var wp_item = $(element);
      var pic = wp_item.find(".pic");
      var a = wp_item.find("a");
      var href = $(a).attr("href");
      var img = $(a).find("img");
      var thumb = $(img).attr("src");
      var detail = {href:href,thumb:thumb};
      detailArray.push(detail);
    });

    var that  = this;
    //进行乱序
    detailArray = _.shuffle(detailArray);
    var count = detailArray.length;
    var promiseArray = detailArray.map((detail,idx)=> {
      //开始休眠
      var sleepTime = Math.floor(Math.random()*1000)+idx*1000;
      //获得写入的数据id
      var db_id =  detail.href.replace(/[\D]/g,"");
      return new Promise(resolve=>setTimeout(()=>resolve(),sleepTime))
        //数据库查询是否存在，如果存在，直接返回
        .then(()=>{
            return dao.selectDetail({id:db_id+""});
        })
        .then(exist=>{
            if(exist == null)
              return Promise.resolve();
            else{
              return Promise.reject("id".concat(db_id," has exist,do not capture"));
            }
          },
          error=>{ Promise.resolve()})
        .then(()=>{
              logger.info("详情页延迟",sleepTime,"毫秒,结束");
              return capture.captureHtml(detail.href);
              },
          reject=>Promise.reject(reject))
        .then(
          resolve=> {
            logger.info("页面解析结束",idx+"/"+count);
            var item = that.analysisDetail(resolve, detail.thumb,db_id);
            logger.info("will insert item:",item);
            return Promise.resolve({code: 202, item: item});
          },
          reject=> Promise.resolve({code:404,msg:reject,href:detail.href})
        );
    });

    var result =  Promise
      .all(promiseArray)
      .then(list=>{
          var resultList = [];
          list.forEach(function(ir,idx){
            if(ir.code && ir.code == 202)
              resultList.push(ir.item);
            else{
              logger.info("无效的抓取",ir.msg);
            }
          });
          return Promise.resolve(resultList);
        },
        reject=>Promise.reject(reject)
      );


    return result;
  }

  analysisDetail(html,thumb,db_id){
    var $ = cheerio.load(html);
    var mainContent = $("#maincontent");
    var postmeta = $(mainContent).find(".postmeta");
    var metaRight = $(postmeta).find(".metaRight");
    var href = $(metaRight).find("a").attr("href");
    var title = $(metaRight).find("a").text();
    var tags = $(metaRight).find("p").text().replace(/[\s\w:]/g,"").split(',');
    var day = $(postmeta).find(".day").text();
    var month_year = $(postmeta).find(".month_Year").text().replace(/[\s]/g,",").split(',');
    var date = (month_year[1]?month_year[1]:"").concat(month_year[0]?month_year[0]:"",day);
    var id = db_id;
    var images = [];
    var postContent =  $(mainContent).find(".postContent");
    var picture = $(postContent).find("#picture");
    var imgs = $(picture).find("img");
    imgs.each(function (idx,element) {
      var img = $(element);
      images.push(img.attr("src"));
    })

    var item = {
      id:id,
      date:date,
      href:href,
      title:title,
      thumb:thumb,
      tag:tags,
      images:images,

    };
   // logger.info("will insert data:",item);
    return item;
  }



}