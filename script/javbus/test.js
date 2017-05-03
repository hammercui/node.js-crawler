/**
 * Created by cly on 2017/5/3.
 */
"use strict";
var analysisFactory = require("./analysisFactory");
var fs = require('fs');
var iconv = require('iconv-lite');

//同步读取文件
var html = fs.readFileSync("test.txt");
html = iconv.decode(html,"utf-8") ;


var analysis = new analysisFactory();


analysis.analysisDetail(html,{});

