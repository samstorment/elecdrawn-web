const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const { template } = require('./titlebar/titlemenu');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    let mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    ipcMain.on('display-app-menu', () => {
        let menu = Menu.buildFromTemplate(template);
        /*  0 and 30 are supposed to be the (x,y) cooridnates where the menu appears. these params dont seem to work? This seems to be a known issue at https://github.com/electron/electron/issues/11514
            instead these paramters default to the current mouse position at the point of clicking  */        
        menu.popup(mainWindow, 0, 30);
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') { app.quit(); }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) { createWindow(); }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.