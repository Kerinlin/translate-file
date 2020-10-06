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

module.exports = {
  throttle
};
