import Vue from "vue";
import Vuex from "vuex";
// const { globalData } = require("../common/config.js");
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // appid: globalData.appid,
    // key: globalData.key
  },
  mutations: {
    // changeAppid(state, appid) {
    //   console.log({ appid });
    //   state.appid = appid;
    // },
    // changeKey(state, key) {
    //   console.log({ key });
    //   state.key = key;
    // }
  },
  actions: {},
  modules: {}
});
