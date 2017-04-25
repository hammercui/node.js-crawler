"use strict";

/**
 * Created by cly on 17/3/17.
 */

var axios = require("axios");

var request = function request(headers) {
  //配置请求的头部

  //const {access_token} = global;
  return axios.create({
    timeout: 10000,
    headers: headers
  });
};
module.exports = request;
module.exports.default = request;

//# sourceMappingURL=request-compiled.js.map