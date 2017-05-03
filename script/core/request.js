/**
 * Created by cly on 17/3/17.
 */

var axios = require("axios");

let request = (options)=>{
  //配置请求的头部
  //const {access_token} = global;
  return axios.create(options)
};

module.exports = request;
module.exports.default = request;
