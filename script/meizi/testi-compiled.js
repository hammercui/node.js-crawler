'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by cly on 2017/4/25.
 */

var Main = function () {
  function Main() {
    _classCallCheck(this, Main);

    this.parent = 'this is parent msg';
  }

  _createClass(Main, [{
    key: 'say',
    value: function say() {
      var _this = this;

      setTimeout(function () {
        console.log(_this.parent);
      }, 500);
    }
  }]);

  return Main;
}();

exports.default = Main;

//# sourceMappingURL=testi-compiled.js.map