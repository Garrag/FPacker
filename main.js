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

function createWindow () {
    var dataMap = []; //图片数据
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

    var daochuFunction = function(){
      // 移动图片到本地缓存 并排改名
      fs.writeFileSync(path.join(__dirname, '/temp/images2fnt.exe'), fs.readFileSync(path.join(__dirname, '/outfnt/images2fnt.exe')));
      for (var i=0; i<dataMap.length; i++) {
          var element = dataMap[i];
          var asc = element.zifu.charCodeAt(0)
          fs.writeFileSync(path.join(__dirname, '/temp/fnt_' + asc + '.png'), fs.readFileSync(element.path));
          // console.log('移动一个:' + i)
          if(i == dataMap.length-1){
              // 启动打包exe
              console.log('start packer!!!!!!')
              exec('run', function(err,stdout,stderr){
                  if(err) {
                      console.log('get weather api error:'+stderr);
                  } else {
                      console.log('packer OK!!!')
                      fs.writeFileSync(path.join(__dirname, '/outfnt/fnt.png'), fs.readFileSync(path.join(__dirname, '/temp/output/fnt.png')));                 
                      fs.writeFileSync(path.join(__dirname, '/outfnt/fnt.fnt'), fs.readFileSync(path.join(__dirname, '/temp/output/fnt.fnt')));  
                  }
              });
          }
      }
    }
    
    //添加到处按钮
    // var menu = Menu.getApplicationMenu()
    // menu.push(new MenuItem({
    //   label: '操作',
    //   submenu: [
    //     {
    //       label: '导出当前路径',
    //       click: daochuFunction
    //     }
    //   ]
    // } ))
    // Menu.setApplicationMenu(menu)

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