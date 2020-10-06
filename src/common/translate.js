const md5 = require("md5");
var rp = require("request-promise");
const { globalData } = require("./config.js");

function translate(msg = "") {
  const q = msg;
  const salt = parseInt(Math.random() * 1000000000);
  const sign = md5(globalData.appid + q + salt + globalData.key);
  const params = encodeURI(
    `q=${q}&from=auto&to=${globalData.to}&appid=${globalData.appid}&salt=${salt}&sign=${sign}`
  );
  const options = {
    uri: `https://fanyi-api.baidu.com/api/trans/vip/translate?${params}`
  };
  return rp(options).then(res => JSON.parse(res).trans_result);
}

module.exports = {
  translate
};
