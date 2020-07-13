// Modules to control application life and create native browser window
const {app, BrowserWindow,ipcMain,Menu} = require('electron');
const path = require('path');
const mainFunc=require('./mainFunctions.js');


let win;

function createWindow () {
  // Create the browser window.
  Menu.setApplicationMenu(null);

  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration:true,
    },
    icon:path.join(__dirname,'src/icons/school_icon.ico')
  });


  let filename=mainFunc.createOrLogin(path.resolve(__dirname,'./assets/auth/auth_data.json'));
  // and load the index.html of the app.
  win.loadFile(`./src/${filename}`);

  // Preventing Opening the DevTools.
  win.webContents.on("devtools-opened", () => { win.webContents.closeDevTools(); });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit();
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('load_file',(event,filename)=>{
  console.log(filename);
  win.loadFile(filename);
});

ipcMain.on('quit',(event,message)=>{
  app.quit();
})

