const md5 = require("md5");
const axios = require("axios");
const { globalData } = require("./config.js");
axios.defaults.withCredentials = true;
axios.defaults.crossDomain = true;
axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";
axios.defaults.baseURL = "http://api.fanyi.baidu.com";
async function translate(msg = "", appid, key) {
  try {
    const q = msg;
    const salt = parseInt(Math.random() * 1000000000);
    let str = `${appid}${q}${salt}${key}`;
    const sign = md5(str);
    console.log({ str });
    const query = encodeURI(q);
    const params = `q=${query}&from=${globalData.from}&to=${globalData.to}&appid=${appid}&salt=${salt}&sign=${sign}`;
    const url = `/api/trans/vip/translate?${params}`;
    const res = await axios.get(url);
    // console.log({ res });
    return res.data;
  } catch (error) {
    console.log({ error });
  }
}

module.exports = {
  translate
};
