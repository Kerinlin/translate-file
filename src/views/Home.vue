<template>
  <div class="home" @drop.prevent="addFile" @dragover.prevent>
    <div class="input-wrapper">
      <label for="attach-project-file">
        <div class="filename" v-if="!path" id="attached-project-file">
          点击选择或者拖拽文件或者目录
        </div>
        <div class="filename" v-if="path" id="attached-project-file">
          {{ path }}
        </div>
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
const { translate } = require("../common/translate.js");
const { globalData } = require("../common/config.js");
const { throttle } = require("../common/util.js");
const { remote } = require("electron").remote;
const path = require("path");
const fs = require("fs");
const { shell } = require("electron").remote;

export default {
  name: "home",
  data() {
    return {
      path: "",
      loading: false,
      back: false,
      droppedFiles: [],
      isDropMulti: false
    };
  },
  methods: {
    addFile(e) {
      // 将伪数组转换成数组
      this.droppedFiles = [...e.dataTransfer.files];

      // [].forEach.call(
      //   e.dataTransfer.files,
      //   file => {
      //     this.droppedFiles.push(file);
      //   },
      //   false
      // );

      // console.log(this.droppedFiles);

      // 处理多个文件一起拖拽的情况
      if (this.droppedFiles.length > 1) {
        // 只有在同一个目录下才能多选，所以获取到第一个的父级目录就可以了
        this.path = path.dirname(this.droppedFiles[0].path);
        // 标记是否是多选
        this.isDropMulti = true;
      } else {
        this.path = this.droppedFiles[0].path;
      }
    },
    getFile(e) {
      this.path = e.target.files[0].path;
    },

    // 检查文件名中是否存在【】[]
    checkName(fileName, origin) {
      // let newFile;
      // const reg = /[[\]【】\s]/g;
      // const isRename = reg.test(fileName);
      // console.log({isRename});
      // isRename ? (newFile = fileName) : (newFile = `${fileName} ${origin}【】`);
      let newFile = `${origin}${fileName}`;
      return newFile;
    },

    // 多个拖拽文件的翻译
    mapTargetFiles(dir, fileArray) {
      let fileCount = fileArray.length;
      console.log(fileArray);
      console.log(fileCount);
      fileArray.forEach(file => {
        // console.log(file);
        let filePath = file.path;
        let fileItem = file.name;
        let suffixName = path.extname(fileItem);
        let initSubFileName = this.removeSymbol(fileItem.split(suffixName)[0]);
        this.translateFile(filePath, dir, initSubFileName, suffixName);
      });
      let timer = setInterval(() => {
        this.loading = false;
        shell.showItemInFolder(dir);
        clearInterval(timer);
      }, globalData.delay * fileCount);
    },

    // 翻译目录下的文件
    transDirFiles(dirPath) {
      let fileCount;

      // 读取目录中的所有文件/目录
      fs.readdir(dirPath, (err, files) => {
        if (err) {
          // throw err;
          remote.dialog.showMessageBox({
            type: "info",
            title: "确认",
            message: "请确认是否选择了目录"
          });
          this.loading = false;
          throw err;
        }

        fileCount = files.length;

        files.forEach(fileItem => {
          // 文件夹内文件的绝对路劲
          let fullPath = path.resolve(dirPath, fileItem);

          // 检查文件状态
          fs.stat(fullPath, (err, stat) => {
            if (err) {
              throw err;
            }
            // 判断是否为文件
            if (stat.isFile()) {
              // 获取文件的后缀格式
              let suffixName = path.extname(fileItem);

              // 获取前缀
              let initSubFileName = this.removeSymbol(
                fileItem.split(suffixName)[0]
              );

              this.translateFile(
                fullPath,
                dirPath,
                initSubFileName,
                suffixName
              );
            } else if (stat.isDirectory()) {
              this.startTrans(dirPath);
            }
          });
        });
        let timer = setInterval(() => {
          this.loading = false;
          shell.showItemInFolder(dirPath);
          clearInterval(timer);
        }, globalData.delay * fileCount);
      });
    },

    // 移除文件名中的特殊字符
    removeSymbol(fileName) {
      // console.log(fileName);
      const reg = /[`~_!@#$^&*%()=|{}':;',.<>\\/?~！@#￥……&*（）——|{}'；：""'。，、？\s]/g;
      const newFile = fileName.replace(reg, " ");
      return newFile;
    },

    transSingle(filePath) {
      let fileItem = path.basename(filePath);

      let dirPath = path.dirname(filePath);
      // console.log(path);
      let suffixName = path.extname(fileItem);

      let initSubFileName = this.removeSymbol(fileItem.split(suffixName)[0]);
      this.translateFile(filePath, dirPath, initSubFileName, suffixName);

      let timer = setInterval(() => {
        this.loading = false;
        shell.showItemInFolder(dirPath);
        clearInterval(timer);
      }, 1000);
    },

    /**
     * oldPath: 未翻译前的文件夹路径
     * dirPath: 文件的父级目录
     * initSubFileName: 文件的前缀名,比如 a.html => a
     * suffixName: 文件的后缀名,比如 a.html => .html
     */
    translateFile(oldPath, dirPath, initSubFileName, suffixName) {
      throttle(() => {
        translate(initSubFileName).then(res => {
          if (res) {
            // 如果有【】保留文件名,如果没有就加上【】

            const target = this.checkName(res[0].dst, initSubFileName);
            // console.log({initSubFileName,target});

            // 拼接带后缀的文件名
            const fullSuffixName = `${target}${suffixName}`;

            // 翻译后的文件路径
            const newPath = path.resolve(dirPath, fullSuffixName);

            // 重命名
            fs.rename(oldPath, newPath, err => {
              if (err) {
                remote.dialog.showErrorBox("错误", "翻译失败，请关闭软件重试");
                this.loading = false;
                throw err;
              }
              console.log(`${initSubFileName} 已翻译成 ${fullSuffixName}`);
              this.path = `${initSubFileName} 已翻译成 ${fullSuffixName}`;
            });
          } else {
            // 翻译失败
            console.log("翻译接口服务出错");
            remote.dialog.showMessageBox({
              type: "error",
              title: "错误",
              message: "翻译接口服务出错"
            });
            this.loading = false;
          }
        });
      });
    },

    async startTrans(path) {
      this.loading = true;

      if (!path) {
        remote.dialog.showMessageBox({
          type: "info",
          title: "确认",
          message: "请确认是否选择了文件或者目录"
        });
        this.loading = false;
        return false;
      }

      // 当拖动的是文件夹或者单个文件，或者通过点击获取文件夹的时候
      if (!this.isDropMulti) {
        const res = await fs.statSync(path);

        // 判断拖入的文件夹是否是目录
        const isDir = res.isDirectory();

        isDir ? this.transDirFiles(path) : this.transSingle(path);
      } else {
        // 翻译拖拽多选的文件
        this.mapTargetFiles(path, this.droppedFiles);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.home {
  -webkit-app-region: no-drag;
  width: 100%;
  height: 100vh;
  label {
    -webkit-app-region: no-drag;
    cursor: pointer;
    display: block;
    text-align: center;
    color: #fff;
    background-color: transparent;
    font-family: "HappyZcool-2016236609138a226c2";
    border-radius: 4px;
    height: 100px;
    width: 60%;
    border: 2px dashed #e0dfd5;
    position: relative;
    margin: 0 auto;
    margin-top: 30px;
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
    width: 90%;
    font-size: 16px;
    line-height: 100px;
    margin: 0 auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .button {
    -webkit-app-region: no-drag;
    position: relative;
    height: 50px;
    width: 200px;
    top: 50px;
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
