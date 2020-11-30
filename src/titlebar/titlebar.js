const { remote, ipcRenderer, webFrame } = require('electron');

// (ctrl- to zoom out), (ctrl0 to zoom back to default), this line manually sets the zoom to default. A param of 2 would make it 2x zoom
// webFrame.setZoomFactor(1);

// Log the current zoom
// console.log(webFrame.getZoomFactor());

// file button in the top left corner
let fileButton = document.querySelector('#file-button');
fileButton.addEventListener('click', () => {
    // send 'display-app-menu' to the main process when the file button is clicked
    ipcRenderer.send('display-app-menu');
});

// minimize the window when this is clicked
let minButton = document.querySelector('#min-button');
minButton.addEventListener('click', () => {
    remote.getCurrentWindow().minimize();
});

// Minimize/maximize button right next to the X button
let maxButton = document.querySelector('#max-button');
maxButton.addEventListener('click', () => {
    const currentWindow = remote.getCurrentWindow();
    currentWindow.isMaximized() ? currentWindow.unmaximize() : currentWindow.maximize();
});

// close the application when we click the x in the top right
let closeButton = document.querySelector('#close-button');
closeButton.addEventListener('click', () => {
    remote.app.quit();
});
