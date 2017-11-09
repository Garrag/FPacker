const electron = require('electron')
const app = electron.app
const Menu = electron.Menu
const MenuItem = electron.MenuItem
const ipcMain = require('electron').ipcMain;
const BrowserWindow = electron.BrowserWindow
const execSync = require('child_process').execSync;

const path = require('path')
const url = require('url')
const fs = require('fs')

let mainWindow
var dataMap = []; //图片数据

var exeName = 'images2fnt.exe';
var runName = 'run.bat'
//打包exe的位置
var packEXEPath = path.resolve('resources', exeName);
//缓存文件夹
var tempPath =  path.resolve('resources', 'temp')
//最终输出位置
var runBatPath =  path.resolve('resources', runName)
var outPath =  path.resolve('resources', 'output')

// console.log('---------------------------------------------')
// console.log(packEXEPath)
// console.log(tempPath)
// console.log(runBatPath)
// console.log('---------------------------------------------')

//复制文件
var copyFile = function(src, dst) {
  fs.writeFileSync(dst, fs.readFileSync(src));
}
//删除文件夹
function deleteAll(path) {  
  var files = [];  
  if(fs.existsSync(path)) {  
      files = fs.readdirSync(path);  
      files.forEach(function(file, index) {  
          var curPath = path + "/" + file;  
          if(fs.statSync(curPath).isDirectory()) { // recurse  
              deleteAll(curPath);  
          } else { // delete file  
              fs.unlinkSync(curPath);  
          }  
      });  
      // fs.rmdirSync(path);  
  }  
};  


//打包处理
function packFunc(){
    console.log('run bat ===== ', path.join(tempPath, runName));
    // 执行run脚本 启动打包exe
    execSync('cd resources/temp && run');
    copyFile(path.join(tempPath, 'output', 'fnt.fnt'), path.join(outPath, 'fnt.fnt'))
    copyFile(path.join(tempPath, 'output', 'fnt.png'), path.join(outPath, 'fnt.png'))
}

//到处处理
function daochuFunction(){
  deleteAll(tempPath)
  deleteAll(outPath)
  copyFile(packEXEPath, path.join(tempPath, exeName))
  copyFile(runBatPath, path.join(tempPath, runName))
  // 复制图片到指定文件夹
  for (var i=0; i<dataMap.length; i++) {
      var element = dataMap[i];
      var asc = element.zifu.charCodeAt(0);
      copyFile(element.path, path.join(tempPath, 'fnt_' + asc + '.png'))
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
    // mainWindow.webContents.openDevTools()

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