<template>
  <div id="app">
    <header class="header-container">
      <i @click="openConfig" class="fa fa-cog" aria-hidden="true"></i>
      <i @click="minimize" class="fa fa-minus" aria-hidden="true"></i>
      <i @click="close" class="fa fa-times" aria-hidden="true"></i>
    </header>

    <div class="config-wrapper" v-if="isOpen">
      <div class="config-content">
        <div class="icon">
          <i @click="closeOpen" class="fa fa-times" aria-hidden="true"></i>
        </div>

        <div class="input-item">
          <p>选择账户</p>
          <!-- <input v-model="appid" type="text" :placeholder="appidPlaceholder" /> -->
          <select v-model="accountName" @change="getSelect">
            <option
              v-for="(item, index) in accountList"
              :key="index"
              :value="item.name"
              >{{ item.name }}</option
            >
          </select>
        </div>

        <div class="input-item">
          <p>选择类型</p>
          <!-- <input v-model="appid" type="text" :placeholder="appidPlaceholder" /> -->
          <select v-model="transType" @change="getSelectType">
            <option
              v-for="(item, index) in typeList"
              :key="index"
              :value="item.type"
              >{{ item.name }}</option
            >
          </select>
        </div>

        <div class="input-item">
          <p>APPID</p>
          <input v-model="appid" type="text" readonly class="showInput" />
        </div>

        <div class="input-item mb5">
          <p>KEY</p>
          <input v-model="key" readonly class="showInput" type="text" />
        </div>

        <div class="btn-wrappper">
          <button class="btn btn-confim" @click="addAccount">添加账户</button>
          <button class="btn btn-confim ml" @click="remove">删除此账户</button>
          <button class="btn btn-confim ml" @click="openNew">
            查看剩余字符
          </button>
        </div>
      </div>

      <!-- <div class="input-item">
        <p>KEY</p>
        <input v-model="key" type="text" :placeholder="keyPlaceholder" />
      </div> -->

      <!-- <div class="input-item">
        <p>Used</p>
        <input v-model="symbolNum" readonly type="text" placeholder="登录后即可查看已使用字符" />
      </div> -->
    </div>

    <div class="config-wrapper" v-if="isAdd">
      <div class="config-content add-content">
        <div class="icon">
          <i @click="closeAdd" class="fa fa-times" aria-hidden="true"></i>
        </div>

        <div class="input-item mt10">
          <p>备注</p>
          <input v-model="newName" type="text" />
        </div>

        <div class="input-item">
          <p>APPID</p>
          <input v-model="newAppid" type="text" />
        </div>

        <div class="input-item">
          <p>KEY</p>
          <input v-model="newKey" type="text" />
        </div>

        <div class="btn-wrappper2">
          <button class="btn btn-confim" @click="confirmAddAccount">
            确认添加
          </button>
        </div>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script>
const { globalData, defaultAccount } = require("./common/config.js");
// import jscookie from 'js-cookie';
const { ipcRenderer } = window.require("electron");
const { remove, uniqueElementsBy } = require("./common/util.js");
export default {
  data() {
    return {
      isOpen: false,
      appid: "",
      key: "",
      appidPlaceholder: "",
      keyPlaceholder: globalData.key,
      symbolNum: "",
      isAdd: false,
      accountName: "",
      defaultList: defaultAccount,
      accountList: [],
      newName: "",
      newAppid: "",
      newKey: "",
      transType: "sound",
      typeList: [
        {
          name: "音效",
          type: "sound"
        },
        {
          name: "音乐",
          type: "music"
        }
      ]
    };
  },
  methods: {
    getSelect(e) {
      console.log("更新了");
      this.accountName = e.target.value;
      const [item] = this.accountList.filter(
        item => item.name === this.accountName
      );
      this.appid = item.appid;
      this.key = item.key;

      localStorage.setItem("accountName", this.accountName);
      localStorage.setItem("appid", this.appid);
      localStorage.setItem("keys", this.key);

      console.log(item.name, item.appid, item.key);
      // this.$store.commit('changeAppid', this.appid);
      // this.$store.commit('changeKey', this.appid);

      // this.$notify.success(`知道你切换账户了,即将刷新！！！⚡️`);
      // setTimeout(() => {
      // window.location.reload();
      // }, 2000);
    },
    getSelectType(e) {
      console.log(e.target.value);
      this.transType = e.target.value;
      localStorage.setItem("type", this.transType);
    },
    addAccount() {
      this.isAdd = true;
      this.isOpen = false;
    },

    // 添加账户
    confirmAddAccount() {
      if (!this.newName || !this.newAppid || !this.newKey) {
        this.$notify.error(`漏填信息啦,全部都要填，不要偷懒!👹`);
        return false;
      }
      const newItem = {
        name: this.newName,
        appid: this.newAppid,
        key: this.newKey
      };
      this.accountList.push(newItem);
      this.accountList = uniqueElementsBy(
        this.accountList,
        (a, b) => a.appid === b.appid
      );
      console.log("去重检测", this.accountList);
      localStorage.setItem("accountList", JSON.stringify(this.accountList));
      this.$notify.success(`添加账号 ${this.newName} 成功啦✨✨✨✨✨✨✨`);
      this.isOpen = true;
      this.isAdd = false;
    },
    openNew() {
      ipcRenderer.send("openNew");
    },

    // 删除账户
    remove() {
      // if (this.appid === globalData.appid && this.key === globalData.key) {
      //   this.$notify.warning(`这是你自己的账户，不允许删除`);
      //   return false;
      // }

      if (this.accountList.length <= 1) {
        this.$notify.warning(
          `这是最后一个账户啦，删除后，会在5秒后自动刷新页面来重置账户👻`
        );
        // return false;
        setTimeout(() => {
          window.location.reload();
        }, 5000);
      }

      // 移除当前账户
      this.accountList = remove(
        this.accountList,
        item => item.name !== this.accountName
      );
      console.log("删除后剩余数组", this.accountList);
      localStorage.setItem("accountList", JSON.stringify(this.accountList));

      this.appid = this.accountList[0].appid;
      this.key = this.accountList[0].key;
      this.accountName = this.accountList[0].name;

      localStorage.setItem("appid", this.accountList[0].appid);
      localStorage.setItem("keys", this.accountList[0].key);
      localStorage.setItem("accountName", this.accountList[0].name);
      // this.$store.commit('changeAppid', this.accountList[0].appid);
      // this.$store.commit('changeKey', this.accountList[0].key);

      if (this.accountList.length <= 1) {
        this.$notify.warning(`删的还剩一个账户啦😪,记得备份好APPID和Key!🤨`);
      } else {
        this.$notify.info(`删除账号成功啦🎉🎉🎉🎉🎉🎉🎉`);
      }
      // setTimeout(() => {
      //   this.$notify.info(`更新当前账户，即将刷新！！！🌈`);
      // window.location.reload();
      // }, 2000);
    },

    closeAdd() {
      this.isAdd = false;
    },
    closeOpen() {
      this.isOpen = false;
    },
    close() {
      console.log("click close");
      ipcRenderer.send("closewindow");
    },
    minimize() {
      ipcRenderer.send("minimize");
    },
    openConfig() {
      this.isOpen = !this.isOpen;
    },

    // 获取账户列表
    getList() {
      // 从localstorage中读取
      const remoteList = localStorage.getItem("accountList");
      if (!remoteList || JSON.parse(remoteList).length <= 0) {
        // 设置默认账户
        localStorage.setItem("accountList", JSON.stringify(this.defaultList));
        const defautList = localStorage.getItem("accountList");
        this.accountList = JSON.parse(defautList);
      } else {
        this.accountList = JSON.parse(remoteList);
      }
      console.log(this.accountList);
      this.getConfig();
    },
    getConfig() {
      this.appid = localStorage.getItem("appid") || globalData.appid;
      this.key = localStorage.getItem("keys") || globalData.key;
      this.accountName = localStorage.getItem("accountName") || globalData.name;
      this.transType = localStorage.getItem("type") || globalData.type;
      console.log(
        "getconfig",
        this.appid,
        this.key,
        this.accountName,
        this.transType
      );

      // 检查从coojie读取的账户在不在账户列表里面
      const [item] = this.accountList.filter(
        item => item.appid === this.appid && item.key === this.key
      );
      console.log({ item });

      if (!item) {
        // console.log('a');
        localStorage.clear();
        localStorage.setItem("appid", globalData.appid);
        localStorage.setItem("keys", globalData.key);
        localStorage.setItem("accountName", globalData.name);
        this.appid = globalData.appid;
        this.key = globalData.key;
        this.accountName = globalData.name;
        // window.location.reload();
      }
    }
  },
  created() {
    this.getList();
  }
  // mounted() {
  //   this.getConfig();
  // },
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
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
    z-index: 678;
    width: 400px;
    height: 280px;
    border-radius: 12px;
    .config-content {
      width: 100%;
      height: 100%;
      .icon {
        margin-top: 5px;
        margin-right: 10px;
        text-align: right;
        i {
          padding: 4px 6px;
          border-radius: 4px;
          &:hover {
            cursor: pointer;
            background: #413f4c;
          }
        }
      }
      .input-item {
        width: 80%;
        margin: 0 auto;
        margin-bottom: 5px;
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
        select {
          box-sizing: border-box;
          width: 260.77px;
          outline: none;
          font-size: 12px;
          height: 25px;
          border-radius: 4px;
          line-height: 25px;
          font-style: italic;
        }
        .showInput {
          background-color: transparent;
          border: none;
          color: #fff;
          font-size: 12px;
        }
      }

      .open-item {
        margin-bottom: 6px;
      }

      .btn-wrappper {
        width: 80%;
        margin: 0 auto;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
      .btn-wrappper2 {
        width: 80%;
        margin: 0 auto;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        .btn-confim {
          width: 120px;
        }
      }
      .btn-confim {
        background-color: #fff;
        outline: none;
        border: none;
        margin-top: 15px;
        // width: 120px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        font-size: 12px;
        border-radius: 4px;
        cursor: pointer;
        padding: 0 10px;
      }
      .ml {
        margin-left: 40px;
      }
    }
  }
}
.mt30 {
  margin-top: 30px !important;
}
.mt10 {
  margin-top: 10px !important;
}
</style>
