/**
 * Created by cly on 2017/4/27.
 */

var cheerio  = require("cheerio");
var capture = require("./../core/captureFactory");
var logger = require("./../core/logFactory");
var _ = require("lodash");
var dao = require("./odm_db");

module.exports =  class analysisFactory{

  /**
   * 解析缩略图列表
   * @param html
   */
  async analysisThumbList(html){
    var thumbArray  = this.getThumbArray(html);
    var that = this;
    var detailItems = [];
    try{
      //进行乱序
      thumbArray = _.shuffle(thumbArray);
      //进行拆分多个数组,拆分成五个数组
      var twoArray = _.chunk(thumbArray,10);
      for(var i=0,len = twoArray.length;i<len;i++){
        if(twoArray[i] instanceof  Array && twoArray.length>0){
          logger.info("开始detail分组",i);
          var list = await  that.analysisDetailList(twoArray[i]);
          detailItems = _.union(detailItems,list);
        }
      }
      return Promise.resolve(detailItems);
    }catch (e){
      return Promise.reject(e);
    }

    //await  this.analysisDetailList(thumbArray)
  }


  /**
   * 获得缩略图信息数组
   */
  getThumbArray(html){
    var thumbArray = [];
    var $ = cheerio.load(html); //引入cheerio的方法。这样的引入方法可以很好的结合jQuery的用法。
    //#号是id选择器 .号是class选择器
    var waterfall = $("#waterfall");
    var items = $(waterfall).find(".item");
    items.each(function (idx,element) {
      var item = $(element);
      var moviebox = $(item).find(".movie-box");
      var href = $(moviebox).attr("href");

      var img = $(item).find("img");
      var thumb = $(img).attr("src");
      var id = href.replace("https://www.javbus.com/",'');

      var detail = {href:href,thumb:thumb,id:id};

      thumbArray.push(detail);
    });

    return thumbArray;
  }

  /**
   * 分析获得详情列表
   * @param thumbArray
   * @returns {Promise.<TResult>}
   */
  analysisDetailList(thumbArray){
    var that  = this;
    var count = thumbArray.length;
    var promiseArray = thumbArray.map((detail,idx)=> {
      var TAG = (idx+1)+"/"+count;
      //开始休眠
      var sleepTime = Math.floor(Math.random()*1000)+idx*2000;
      //获得写入的数据id
      var db_id =  detail.id;
      logger.info(TAG,"延迟",sleepTime,"毫秒");
      return new Promise(resolve=>setTimeout(()=>resolve(),sleepTime))
      //数据库查询是否存在，如果存在，直接返回
        .then(()=>{
          logger.info(TAG,"延迟结束,查询",db_id,"是否存在");
          var regex = new RegExp("*", 'i');
          return dao.selectDetail({id:db_id,series:regex});
        })
        .then(exist=>{
            if(exist == null){
              logger.info(TAG,db_id,"不存在，开始抓取");
              return Promise.resolve();
            }
            else{
              return Promise.reject("id".concat(db_id," has exist,do not capture"));
            }
          },
          error=>{ Promise.resolve()})
        .then(()=>{
            return capture.captureByPhantom(detail.href);
          },
          reject=>Promise.reject(reject))
        .then(
          resolve=> {
            var item = that.analysisDetail(resolve, detail);
            //logger.info(TAG,"页面解析结束 获得 item:",item);
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



  async analysisDetail(html,detail){
    try{

    var href = detail.href;
    var thumb = detail.thumb;
    var id = detail.id;

    var $ = cheerio.load(html);
    var container = $(".container");
    var title = $(container).find("h3").text();
    var cover = $(container).find(".bigImage").attr("href");
    if(!thumb || thumb==""){
      thumb = cover;
    }


      var info = $(container).find(".col-md-3");
      var ps = $(info).find("p");
      var dateElement =  $("span.header:contains('發行日期:')").parent();
      var date = $(dateElement).text().replace(/([^0-9\-]|\s)/g,"");
    // var date = ps[1].children[1].data;
      var lenElement = $("span.header:contains('長度:')").parent();
    var mvLength = $(lenElement).text().replace(/(長度:|\s)/g,"");

    var mvDirector = $("span.header:contains('導演:')").next().text();
    var mvProducers = $("span.header:contains('製作商:')").next().text();
    var mvPublisher = $("span.header:contains('發行商:')").next().text();
      //解析系列
      var seriesElement = $("span.header:contains('系列:')");
      var series="";
      if(seriesElement){
        series = seriesElement.next().text();
      }

      //解析tag
    var tags = [];
      $("p.header:contains('類別:')").next().find("span.genre").each(function (index,element) {
      var genre = $(element).find("a").text();
        tags.push(genre);
      }
    );


    //解析演员
    var mvActorsElement = $("p.header:contains('推薦:')").prev().find("span.genre");
    var mvActors = [];
    if(mvActorsElement){
      mvActorsElement.each(function (idx,element) {
        var name = $(element).find("a").text();
        mvActors.push(name)
      })
    }

    //解析magnet 暂未完成，需要借助phatomJS
    var magnetTable = $(container).find("#magnet-table");
    var trs = $(magnetTable).find("tr");
    var mvMagnets = [];

      trs.each(function (idx,element) {
          if(idx != 0){
            var tds = $(element).find("td");
            var nameElement = $(($(tds[0]).find("a"))[0]);
            var href = $(nameElement).attr("href")?$(nameElement).attr("href").replace(/\s/g,""):"";
            var title= $(nameElement).text().replace(/\s/g,"");
            var size = $(tds[1]).find("a").text().replace(/\s/g,"") ;
            var time  = $(tds[2]).find("a").text().replace(/\s/g,"") ;
            mvMagnets.push({title:title,url:href,size:size,time:time});
          }
      });

    //解析大小图
    var mvImageSmall=[];
    var mvImageBig=[];
    var samplewaterfall = $(container).find("#sample-waterfall");
    if(samplewaterfall){
      var imgs = $(samplewaterfall).find(".sample-box");
      imgs.each(function (idx,element) {
        var big = $(element).attr("href");
        var small = $(element).find("img").attr("src");
        mvImageSmall.push(small);
        mvImageBig.push(big);
      })
    }

    var item = {
      href:href,
      title:title,
      thumb:thumb,
      tag:tags,
      id:id,
      date:date,
      cover:cover,
      series:series,
      mvLength:mvLength,
      mvProducers:mvProducers,
      mvPublisher:mvPublisher,
      mvDirector:mvDirector,
      mvActors:mvActors,
      mvImageSmall:mvImageSmall,
      mvImageBig:mvImageBig,
      mvMagnets:mvMagnets,
    };
   // logger.info("will insert data:",item);
    //进行插入系列的操作
    if(series){
      await dao.update({id:id},{series:series});
      console.log("插入系列","成功");
    }

      return item;
    }catch(e){
      logger.warn(e);
      return {};
    }
  }

}