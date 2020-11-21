# Electron+Vue从零开始打造一个本地文件翻译器

又一个愉快的周末快到了，当我脚步轻快的回到家，准备拥抱女朋友的时候，却发现，女朋友愁眉苦脸，望着电脑上一堆英文文件夹，不断的唉声叹气并嘟喃道:"好累啊"。于是，我凑近一看，只见她电脑上一堆英文文件夹，不断的重复着复制文件名，然后放百度翻译里翻译成中文，然后又把翻译后的结果给文件重命名，这也太难受了吧。想到女朋友有难，我作为她的程序猿男朋友，怎么能袖手旁观，我陷入了沉思，突然想到用Node不就能做到她手上的那些操作吗，于是说做就做，我立马把女朋友抛在身后，打开电脑开始行动，毕竟女人只会影响我拔剑的速度。

## 项目搭建
项目搭建依旧使用的是老组合，**Electron + Vue + Node**，这次就不讲怎么整合electron和vue了，具体可看 [Electron+vue从零开始打造一个本地音乐播放器](https://juejin.cn/post/6887964816237920263 "Electron+vue从零开始打造一个本地音乐播放器")这篇文章。懒人可通过克隆我的模板文件直接开发，[戳这里戳这里](https://github.com/Kerinlin/simple-electron-vue-template "戳这里戳这里").

## 项目功能
明确要解决的几个痛点：
- 要能自动翻译
- 要能将翻译好的名字自动重命名
- 要能批量翻译
- 希望能操作简单，能拖拽一个目录，或拖拽文件

需求明确了，下面咱们一步一步来逐个解决。实现效果

[![D3CNdJ.gif](https://s3.ax1x.com/2020/11/21/D3CNdJ.gif)](https://imgchr.com/i/D3CNdJ)

## 项目实现
项目实现并不复杂，逐一解决，有的放矢。

### 自动翻译

测试过有道翻译，百度翻译，谷歌翻译。经过对比，最终选择了百度翻译，百度翻译的通用翻译每月200万字符的免费，（QPS=10）还是很符合我的需求的。
[![DMVOc6.png](https://s3.ax1x.com/2020/11/19/DMVOc6.png)](https://imgchr.com/i/DMVOc6)

#### 注册申请翻译服务
要使用翻译服务需要去[百度翻译开放平台](http://api.fanyi.baidu.com/api/trans/product/apichoose "百度翻译开放平台")申请使用权限，选择通用翻译服务就可以了，注册成为开发者后，新建项目获取appid,这个appid很重要，决定了是否能正确发起翻译请求。

![D1LVAK.png](https://s3.ax1x.com/2020/11/21/D1LVAK.png)

#### 拼接翻译API

通过查看文档可知，通用翻译API HTTP地址为

`https://api.fanyi.baidu.com/api/trans/vip/translate`

可携带下面这些参数

![D1jFns.png](https://s3.ax1x.com/2020/11/21/D1jFns.png)

由于安全限制，需要生成签名，签名需要 按照 appid+q+salt+密钥 的顺序拼接得到字符串,然后对字符串进行md5加密

      const salt = parseInt(Math.random() * 1000000000);
      const sign = md5(globalData.appid + q + salt + globalData.key);

生成签名后拼接请求的URL

```javascript
  const params = encodeURI(
    `q=${q}&from=auto&to=${globalData.to}&appid=${globalData.appid}&salt=${salt}&sign=${sign}`
  );
```
翻译功能代码

```javascript
const md5 = require("md5");
var rp = require("request-promise");
const { globalData } = require("./config.js");

function translate(msg) {
  const q = msg;
  const salt = parseInt(Math.random() * 1000000000); //加盐
  const sign = md5(globalData.appid + q + salt + globalData.key); //生成签名
  const params = encodeURI(
    `q=${q}&from=auto&to=${globalData.to}&appid=${globalData.appid}&salt=${salt}&sign=${sign}`
  );
  const options = {
    uri: `https://fanyi-api.baidu.com/api/trans/vip/translate?${params}`,
  };
  return rp(options).then((res) => JSON.parse(res).trans_result);
}

module.exports = {
  translate,
};

```
### 主体功能实现
主体功能分为：

- 批量翻译，支持向下递归翻译
- 拖拽不定量文件，或者拖拽文件夹翻译
- 重命名

#### 批量翻译
要实现批量需要获取到目标文件夹路径，然后通过 [**fs.readdir**](http://nodejs.cn/api/fs.html#fs_fs_readdir_path_options_callback "**fs.readdir**") 读取到目录下文件信息，遍历文件信息，如果是文件，对文件名和后缀进行分割，然后再进行翻译操作，如果是目录，就执行递归操作。

```javascript
      // 读取目录中的所有文件/目录
      fs.readdir(dirPath, (err, files) => {
        if (err) {
          // throw err;
          remote.dialog.showMessageBox({
            type: 'info',
            title: '确认',
            message: '请确认是否选择了目录',
          });
          this.loading = false;
          throw err;
        }
        files.forEach((fileItem) => {
          //遍历文件
		  fs.stat(fullPath, (err, stat) => {
            if (err) {
              throw err;
            }
            // 判断是否为文件
            if (stat.isFile()) {
				//处理文件名
            } else if (stat.isDirectory()) {
              // 递归翻译
              this.startTrans(fullPath);
            }
          });
        });
      });
```

##### 获取文件夹路径
获取文件夹路径有两种方式获取：
1. 设置input [webkitdirectory directory](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory "webkitdirectory directory")属性，然后监听change事件获取到所选择文件夹的路径

```javascript

<input @change="getFile" id="attach-project-file" type="file" webkitdirectory  directory />

getFile(e) {
   this.path = e.target.files[0].path;
},
```
2. 通过[H5的拖拽API](https://developer.mozilla.org/zh-CN/docs/Web/API/HTML_Drag_and_Drop_API "H5的拖拽API")监听drop事件，获取到 [DataTransfer 对象](https://developer.mozilla.org/zh-CN/docs/Web/API/DataTransfer "DataTransfer 对象")，DataTransfer 对象用于保存拖动并且放下的数据。
```javascript
  <div class="home" @drop.prevent="addFile" @dragover.prevent>
  </div>

    addFile(e) {
      // 将伪数组转换成数组
      this.droppedFiles = [...e.dataTransfer.files];
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
```

##### 分割文件名和后缀
由于是翻译文件名，所以需要通过 [**path.extname**](http://nodejs.cn/api/path/path_extname_path.html "**path.extname**") 将文件名与后缀分割开来，翻译后再将文件名重新组织，需要注意的是这里需要处理下文件名中的特殊字符，特殊字符会影响翻译结果，可能会导致翻译失败。

```javascript
// 获取文件的后缀格式
const suffixName = path.extname(fileItem);

 // 获取前缀
const initSubFileName = this.removeSymbol(
	fileItem.split(suffixName)[0]
);
// 移除文件名中的特殊字符
removeSymbol(fileName) {
	const reg = /[`~_!@#$^&*%()=|{}':;',.<>\\/?~！@#￥……&*（）——|{}'；：""'。，、？\s]/g;
	const newFile = fileName.replace(reg, " ");
	return newFile;
},
```
##### 翻译文件名

对分割好的文件名进行翻译，然后重新新的文件名称，这里要注意的是，由于百度翻译限制了（QPS=10），所以需要添加对翻译请求节流，限制其每秒不能超过10次。

**节流函数**
```javascript
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
```
翻译后重组文件名

```javascript
      throttle(() => {
        translate(initSubFileName).then(res => {
          if (res) {
            // 如果有【】保留文件名,如果没有就加上【】
            const target = this.checkName(res[0].dst);

            // 拼接带后缀的文件名
            const fullSuffixName = `${target}${suffixName}`;

            // 翻译后的文件路径
            const newPath = path.resolve(dirPath, fullSuffixName);

          } else {
            // 翻译失败
            console.log("翻译接口服务出错");
            remote.dialog.showMessageBox({
              type: "error",
              title: "错误",
              message: "翻译接口服务出错"
            });
          }
        });
      });
```

#### 重命名
重命名使用node自带的 [fs.rename](http://nodejs.cn/api/fs.html#fs_fs_rename_oldpath_newpath_callback "fs.rename")

```javascript
            fs.rename(oldPath, newPath, err => {
              if (err) {
                remote.dialog.showErrorBox("错误", "翻译失败，请关闭软件重试");
                this.loading = false;
                throw err;
              }
              console.log(`${initSubFileName} 已翻译成 ${fullSuffixName}`);
              this.path = `${initSubFileName} 已翻译成 ${fullSuffixName}`;
            });
```

## 最后
终于完成了，我伸了伸懒腰，我兴高采烈的准备去女朋友那邀功，不小心摔了一跤，我猛地起来，啊，还好，原来是一场梦！不对！按这么说，我的女朋友。。。。我突然伤感起来，悲伤的打开了网抑云：

> 生不出人，我很抱歉！

原来这一切都是假的！！！那晚我哭红了我的双眼，泪浸湿了我的枕头！！！[源码在这](https://github.com/Kerinlin/translate-file "源码在这")



