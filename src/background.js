"use strict";
const electron = require("electron");
import { app, protocol, BrowserWindow, dialog } from "electron";
import { autoUpdater } from "electron-updater";
const path = require("path");
// console.log(path.join(app.getAppPath()));
import {
  createProtocol
  // installVueDevtools
} from "vue-cli-plugin-electron-builder/lib";
const isDevelopment = process.env.NODE_ENV !== "production";
const globalShortcut = electron.globalShortcut;
const { ipcMain } = require("electron");
console.log(app.getAppPath());
// require('@electron/remote/main').initialize();
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);
// const request = require("request-promise");
function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 568,
    height: 379,
    autoHideMenuBar: true,
    frame: false,
    resizable: false,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(app.getAppPath(), "preload.js"),
      webSecurity: false
    }
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
    autoUpdater.checkForUpdates();
  }

  win.on("closed", () => {
    win = null;
  });
}

function createWindow2() {
  // Create the browser window.
  let win1 = new BrowserWindow({
    width: 568,
    height: 379,
    autoHideMenuBar: true
    // webPreferences: {
    //   nodeIntegration: true
    // }
  });

  win1.loadURL("http://api.fanyi.baidu.com/api/trans/product/desktop");
  // if (process.env.WEBPACK_DEV_SERVER_URL) {
  //   // Load the url of the dev server if in development mode
  //   win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
  //   if (!process.env.IS_TEST) win.webContents.openDevTools();
  // } else {
  //   // createProtocol("app");
  //   // Load the index.html when not in development
  //   win.loadURL("http://api.fanyi.baidu.com/api/trans/product/index");
  //   // autoUpdater.checkForUpdates();
  // }

  win1.on("closed", () => {
    win1 = null;
  });
}

// async function getUsed() {
//   try {
//     const url =
//       "http://api.fanyi.baidu.com/api/trans/product/desktopint?req=query_balance";
//     const options = {
//       uri: url
//     };
//     const res = await request(options);
//     console.log({ res });
//   } catch (error) {
//     console.log(error);
//   }
// }

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

ipcMain.on("closewindow", () => {
  console.log("recieive close");
  // win.close();
  app.exit();
});

ipcMain.on("openNew", () => {
  createWindow2();
});

ipcMain.on("minimize", () => {
  win.minimize();
});

ipcMain.on("confirmDir", () => {
  dialog.showMessageBox({
    type: "info",
    title: "确认",
    message: "请确认是否选择了文件或者目录"
  });
});

ipcMain.on("errorRename", () => {
  dialog.showErrorBox("错误", "翻译失败，请关闭软件重试");
});

ipcMain.on("transError", () => {
  dialog.showMessageBox({
    type: "error",
    title: "错误",
    message: "翻译接口服务出错"
  });
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  // if (isDevelopment && !process.env.IS_TEST) {
  //   // Install Vue Devtools
  //   // Devtools extensions are broken in Electron 6.0.0 and greater
  //   // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
  //   // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
  //   // If you are not using Windows 10 dark mode, you may uncomment these lines
  //   // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
  //   // try {
  //   //   await installVueDevtools()
  //   // } catch (e) {
  //   //   console.error('Vue Devtools failed to install:', e.toString())
  //   // }
  // }
  globalShortcut.register("CommandOrControl+K", function() {
    win.webContents.openDevTools();
  });
  createWindow();
});

autoUpdater.on("checking-for-update", () => {});
autoUpdater.on("update-available", info => {
  console.log(info);
  dialog.showMessageBox({
    title: "新版本发布",
    message: "有新内容更新，稍后将重新为您安装",
    buttons: ["确定"],
    type: "info",
    noLink: true
  });
});

autoUpdater.on("update-downloaded", info => {
  console.log(info);
  autoUpdater.quitAndInstall();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
