module.exports = {
  lintOnSave: false,
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: "com.translate.eng",
        productName: "翻译重命名",
        win: {
          icon: "public/fy.ico"
        }
      }
    }
  }
};
