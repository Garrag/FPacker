const electron = require('electron')
const app = electron.app
const Menu = electron.Menu
const MenuItem = electron.MenuItem
const ipcMain = require('electron').ipcMain;
const BrowserWindow = electron.BrowserWindow
const exec = require('child_process').exec;

const path = require('path')
const url = require('url')
const fs = require('fs')

let mainWindow
var dataMap = []; //图片数据

//打包处理
function packFunc(){
    console.log('start packer!!!!!!');
    // 执行run脚本 启动打包exe
    exec('run', function(err,stdout,stderr){
        if(err) {
            console.log('get weather api error:' + stderr);
        } else {
            console.log('packer OK!!!')
            fs.writeFileSync(path.join(__dirname, '/outfnt/fnt.png'), fs.readFileSync(path.join(__dirname, '/temp/output/fnt.png')));                 
            fs.writeFileSync(path.join(__dirname, '/outfnt/fnt.fnt'), fs.readFileSync(path.join(__dirname, '/temp/output/fnt.fnt')));  
        }
    });
}

//到处处理
function daochuFunction(){
  // 移动打包软件
  fs.writeFileSync(path.join(__dirname, '/temp/images2fnt.exe'), fs.readFileSync(path.join(__dirname, '/outfnt/images2fnt.exe')));
  // 复制图片到指定文件夹
  for (var i=0; i<dataMap.length; i++) {
      var element = dataMap[i];
      var asc = element.zifu.charCodeAt(0);
      fs.writeFileSync(path.join(__dirname, '/temp/fnt_' + asc + '.png'), fs.readFileSync(element.path));
      if(i == dataMap.length-1){
          packFunc()
      }
  }
}


function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 600, height: 600});
    
    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }))
    
    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    //添加一个图片
    ipcMain.on('handel-fnt-img', function(event, arg) {
      for (var key in dataMap) {
        var element = dataMap[key];
        if(element.path == arg.path){  //已经存在
          element.zifu = arg.zifu;
          event.returnValue = 2;
          return;
        }
      }
      // console.log('add:' + arg);
      dataMap.push(arg);
        event.returnValue = 1;
    })
    
    // 关闭事件
    mainWindow.on('closed', function () {
      mainWindow = null
    })
    //注册菜单
    const template = [
      {
        role: 'help',
        submenu: [
          {
            label: '导出',
            click: daochuFunction
          }
        ]
      }
    ]
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})