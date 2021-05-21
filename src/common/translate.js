const md5 = require("md5");
var rp = require("request-promise");
const { globalData } = require("./config.js");

function translate(msg = "", appid, key) {
  const q = msg;
  const salt = parseInt(Math.random() * 1000000000);
  // console.log(globalData.appid, key);
  let str = `${appid}${q}${salt}${key}`;
  const sign = md5(str);
  console.log({ str });
  // console.log(appid + q + salt + key);
  console.log({ sign });
  const query = encodeURI(q);
  const params = `q=${query}&from=en&to=${globalData.to}&appid=${appid}&salt=${salt}&sign=${sign}`;

  console.log({ params });
  const options = {
    uri: `https://fanyi-api.baidu.com/api/trans/vip/translate?${params}`
  };
  console.log({ options });
  return rp(options).then(res => {
    console.log({ res });
    return JSON.parse(res).trans_result;
  });
}

module.exports = {
  translate
};
