// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var fs = require('fs');
var holder = document.getElementById('holder');
const {remote} = require('electron')
const {Menu, MenuItem} = remote
const ipcRenderer = require('electron').ipcRenderer;

holder.ondragover = function () {
  return false;
};

holder.ondragleave = holder.ondragend = function () {
  return false;
};
//处理拖拽
holder.ondrop = function (e) {
    e.preventDefault();
    var files = e.dataTransfer.files;
    for (var key in files) {
        if (files.hasOwnProperty(key)) {
            const file = files[key];
            if(file.type == 'image/png'){
                var item = $('<div class="item"><div class="item-1"><img src="'+file.path+'"></div><input type="text" value="'+ file.name.replace('.png', '') +'"></div>')
                item.find('input').on('input propertychange',function(e){
                    var itemData = {
                        path : file.path,  //图片文件地址
                        zifu: $(this).val(),   //需要替换的字符
                    }
                    if(ipcRenderer.sendSync('handel-fnt-img', itemData) == 2){  //成功修改
                    }
                })
                if(item) {
                    var itemData = {
                        path : file.path,  //图片文件地址
                        zifu: file.name.replace('.png', ''),   //需要替换的字符
                    }
                    //发送给主进程,处理数据
                    if(ipcRenderer.sendSync('handel-fnt-img', itemData) == 1){
                        $('#holder').append(item)
                    }   
                }
            }
        }
    }
  return false;
};


