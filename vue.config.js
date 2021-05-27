module.exports = {
  lintOnSave: false,
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: "com.electron.zztranslate",
        productName: "翻译重命名(姑苏)",
        win: {
          icon: "public/fy.ico"
        },
        mac: {
          target: "dmg",
          icon: "public/fy.png"
        },
        dmg: {
          title: "翻译器",
          icon: "public/fy.png",
          contents: [
            {
              x: 110,
              y: 150
            },
            {
              x: 240,
              y: 150,
              type: "link",
              path: "/Applications"
            }
          ],
          window: {
            x: 400,
            y: 400
          }
        },
        publish: ["github"],
        nsis: {
          oneClick: false, // 是否一键安装，建议为 false，可以让用户点击下一步、下一步、下一步的形式安装程序，如果为true，当用户双击构建好的程序，自动安装程序并打开，即：一键安装
          allowToChangeInstallationDirectory: true // 允许修改安装目录，建议为 true，是否允许用户改变安装目录，默认是不允许
        }
      }
    }
  },
  devServer: {
    proxy: {
      "/api/*": {
        changeOrigin: true, // 是否跨域
        secure: false,
        target: "http://fanyi-api.baidu.com"
      }
    },
    clientLogLevel: "none"
  }
};
