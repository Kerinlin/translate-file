<template>
  <div class="home">
    <div class="input-wrapper" @dragover.prevent @drop.prevent="addFile">
      <label for="attach-project-file">
        <div class="filename" id="attached-project-file">{{ path }}</div>
      </label>
      <input
        @change="getFile"
        id="attach-project-file"
        type="file"
        webkitdirectory
        directory
      />
    </div>

    <button class="button loading-btn" v-if="loading">
      <span class="spinner"></span>
      <span class="spinner-text">翻译中...</span>
    </button>
    <button class="button" v-else @click="startTrans(path)">开始翻译</button>
  </div>
</template>

<script>
var { remote } = require("electron");
import md5 from "md5";
export default {
  name: "home",
  data() {
    return {
      path: "点击选择需要翻译的目录",
      loading: false,
      back: false
    };
  },
  methods: {
    addFile(e) {
      console.log(e);
    },
    getFile(e) {
      this.path = e.target.files[0].path;
    },
    startTrans(src) {
      var that = this;
      that.loading = true;
      //引入模块
      var fs = require("fs");
      var request = require("request");

      // 读取目录中的所有文件/目录
      fs.readdir(src, function(err, paths) {
        if (err) {
          // throw err;
          remote.dialog.showMessageBox({
            type: "info",
            title: "确认",
            message: "请确认是否选择了目录"
          });
          that.loading = false;
          throw err;
        }
        paths.forEach(function(path) {
          // console.log(path);

          //拼合路径
          var _src = src + "/" + path;
          //判断文件状态
          fs.stat(_src, function(err, st) {
            if (err) {
              throw err;
            }
            // 判断是否为文件
            if (st.isFile()) {
              // console.log(path);
              // let query = path.split('.')[0];
              // let dot = path.split('.')[1];
              // // console.log(query);
              // word = query;
              let subFileLength = path.lastIndexOf("."); //获取到文件名开始到最后一个“.”的长度。
              let fullFileLength = path.length; //获取到文件名长度

              let suffixName = path.substring(
                subFileLength + 1,
                fullFileLength
              ); //截取后缀名
              let subFileName = path.substring(0, subFileLength); //文件名

              let appid = "20190618000308470";
              let key = "3Naugqz0ydUXKUh7xXRw"; //注意：暴露appSecret，有被盗用造成损失的风险
              let salt = new Date().getTime();
              // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
              let str = `${appid}${subFileName}${salt}${key}`;

              let sign = md5(str);

              let url = `http://api.fanyi.baidu.com/api/trans/vip/translate?q=${subFileName}&from=auto&to=zh&appid=${appid}&salt=${salt}&sign=${sign}`;

              request(encodeURI(url), function(error, response) {
                if (!error && response.statusCode == 200) {
                  let res = JSON.parse(response.body);
                  let target = `${res &&
                    res.trans_result &&
                    res.trans_result[0] &&
                    res.trans_result[0].dst}`;
                  //将返回的数据拼合成为路径
                  let newPath = `${src}/${target}.${suffixName}`;
                  fs.rename(_src, newPath, function(err) {
                    if (err) {
                      remote.dialog.showErrorBox(
                        "错误",
                        "翻译失败，请关闭软件重试"
                      );
                      that.loading = false;
                      throw err;
                    } else {
                      let timer = setInterval(() => {
                        that.loading = false;
                        clearInterval(timer);
                      }, 1000);

                      const { shell } = require("electron").remote;
                      shell.showItemInFolder(src);
                    }
                  });
                }
              });
            } else if (st.isDirectory()) {
              that.startTrans(_src);
            }
          });
        });
      });
    }
  }
};
</script>

<style lang="less" scoped>
.home {
  width: 100%;
  label {
    cursor: pointer;
    display: block;
    text-align: center;
    color: #fff;
    background-color: transparent;
    font-family: "HappyZcool-2016236609138a226c2";
    border-radius: 4px;
    height: 140px;
    width: 60%;
    border: 2px dashed #e0dfd5;
    position: relative;
    margin: 0 auto;
    margin-top: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  [type="file"] {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }
  .close {
    line-height: 1em;
    font-size: 16px;
    padding: 10px;
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    font-style: normal;
  }
  .filename {
    font-size: 20px;
    line-height: 140px;
  }

  .button {
    position: relative;
    height: 50px;
    width: 200px;
    top: 100px;
    left: calc(50vw - 100px);
    background-image: none;
    border: 1px dashed #fff;
    font-family: "HappyZcool-2016236609138a226c2";
    outline: none;
    background-color: transparent;
    border-radius: 1px;
    color: white;
    text-transform: uppercase;
    font-size: 20px;
    letter-spacing: 2px;
    cursor: pointer;
    transition: all 0.2s ease-out;
    &:hover {
      border-color: rgb(91, 75, 95);
      color: rgb(91, 75, 95);
      border-radius: 16px 4px;
    }
  }

  .button::after {
    content: "";
    display: block;
    position: absolute;
    width: 160px;
    height: 40px;
    background-color: black;
    z-index: -1;
    left: calc(50% - 80px);
    top: 10px;
    opacity: 0.3;
    filter: blur(5px);
    transition: all 0.2s ease-out;
  }
  .button:hover::after {
    opacity: 0.5;
    filter: blur(20px);
    transform: translatey(10px) scalex(1.2);
  }
  .loading {
    border-radius: 50px;
    width: 50px;
    left: calc(50vw - 25px);
  }
  .button.loading::after {
    width: 40px;
    left: 5px;
    top: 12px;
    border-radius: 100%;
  }
  .spinner {
    display: inline-block;
    width: 30px;
    height: 30px;
    position: absolute;
    top: 10px;
    left: 20px;
    background: transparent;
    box-sizing: border-box;
    border-top: 4px solid white;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-radius: 100%;
    animation: spin 0.6s ease-out infinite;
  }
  .loadin-btn {
    font-family: "HappyZcool-2016236609138a226c2";
  }
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
}
</style>
