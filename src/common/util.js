const { globalData } = require("./config.js");

const throttle = (function(delay = 1500) {
  const wait = [];
  let canCall = true;
  return function throttle(callback) {
    if (!canCall) {
      if (callback) wait.push(callback);
      return;
    }

    callback();
    canCall = false;
    setTimeout(() => {
      canCall = true;
      if (wait.length) {
        throttle(wait.shift());
      }
    }, delay);
  };
})(globalData.delay);

const remove = (arr, func) =>
  Array.isArray(arr)
    ? arr.filter(func).reduce((acc, val) => {
        arr.splice(arr.indexOf(val), 1);
        return acc.concat(val);
      }, [])
    : [];

const uniqueElementsByRight = (arr, fn) =>
  arr.reduceRight((acc, v) => {
    if (!acc.some(x => fn(v, x))) acc.push(v);
    return acc;
  }, []);

module.exports = {
  throttle,
  remove,
  uniqueElementsByRight
};
