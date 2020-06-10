const { app, remote, ipcRenderer } = require('electron');

// Title menu button event listeners
let fileButton = document.querySelector('#file-button');
fileButton.addEventListener('click', e => {
    ipcRenderer.send('display-app-menu', {
        x: event.x,
        y: event.y
    })
});

let minButton = document.querySelector('#min-button');
minButton.addEventListener('click', e => {
    remote.getCurrentWindow().minimize();
});

let maxButton = document.querySelector('#max-button');
maxButton.addEventListener('click', e => {
    const currentWindow = remote.getCurrentWindow();
    currentWindow.isMaximized() ? currentWindow.unmaximize() : currentWindow.maximize();
});

let closeButton = document.querySelector('#close-button');
closeButton.addEventListener('click', e => {
    remote.app.quit();
});
