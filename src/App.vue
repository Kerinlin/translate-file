<template>
  <div id="app">
    <header class="header-container">
      <i @click="openConfig" class="fa fa-cog" aria-hidden="true"></i>
      <i @click="minimize" class="fa fa-minus" aria-hidden="true"></i>
      <i @click="close" class="fa fa-times" aria-hidden="true"></i>
    </header>

    <div class="config-wrapper" v-if="isOpen">
      <div class="input-item">
        <p>APPID</p>
        <input v-model="appid" type="text" :placeholder="appidPlaceholder" />
      </div>

      <div class="input-item">
        <p>KEY</p>
        <input v-model="key" type="text" :placeholder="keyPlaceholder" />
      </div>

      <button class="btn btn-confim" @click="configValue">确认修改</button>
    </div>
    <router-view />
  </div>
</template>

<script>
const { globalData } = require("./common/config.js");
const { ipcRenderer } = require("electron");
import jscookie from "js-cookie";
export default {
  data() {
    return {
      isOpen: false,
      appid: "",
      key: "",
      appidPlaceholder: "",
      keyPlaceholder: globalData.key
    };
  },
  methods: {
    close() {
      ipcRenderer.send("close");
    },
    minimize() {
      ipcRenderer.send("minimize");
    },
    openConfig() {
      this.isOpen = !this.isOpen;
    },
    configValue() {
      let appid, transkey;
      if (!this.appid || !this.key) {
        appid = globalData.appid;
        transkey = globalData.key;
      } else {
        appid = this.appid;
        transkey = this.key;
      }
      jscookie.set("appid", appid, { expires: 180 });
      jscookie.set("keys", transkey, { expires: 180 });
      this.isOpen = !this.isOpen;
      window.location.reload();
    },
    getConfig() {
      this.appidPlaceholder = jscookie.get("appid") || globalData.appid;
      this.keyPlaceholder = jscookie.get("keys") || globalData.key;
    }
  },
  mounted() {
    this.getConfig();
  }
};
</script>

<style lang="less" scoped>
#app {
  position: relative;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  background-image: url("./assets/bg1.png");
  background-size: cover;
  // background-repeat: no-repeat;
  .header-container {
    width: 100%;
    text-align: right;
    i {
      padding: 5px 10px;
      border-radius: 50%;
      background-color: transparent;
      &:hover {
        cursor: pointer;
        background: #413f4c;
      }
    }
    .fa {
      -webkit-app-region: no-drag;
      margin: 5px 5px 0px 0px;
      font-size: 28px;
      color: #fff;
      font-weight: 200;
    }
  }
  .config-wrapper {
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    z-index: 678;
    position: absolute;
    width: 400px;
    height: 250px;
    border-radius: 12px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .input-item {
      width: 80%;
      margin: 0 auto;
      margin-bottom: 18px;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: center;
      p {
        width: 60px;
        font-size: 12px;
      }
      input {
        width: 80%;
        font-size: 12px;
        outline: none;
        border: none;
        border-radius: 4px;
        padding: 6px 4px;
      }
    }
    .btn-confim {
      background-color: #fff;
      outline: none;
      border: none;
      margin-top: 30px;
      width: 120px;
      height: 30px;
      text-align: center;
      font-size: 12px;
      border-radius: 4px;
      cursor: pointer;
    }
  }
}
</style>
