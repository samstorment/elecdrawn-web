const { app } = require('electron');

// File button dropdown menu options
const template = [
{
    label: 'File',
    sublabel: 'Sublabel',
    // toolTip: 'COOL!', // this doesn't show on hover?
    submenu: [
    {
        label: 'Open',
        accelerator: 'CmdOrCtrl+O',
        click() { openFile(); }
    },
    {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        click() { saveFile(); }
    }
    ]
},
{
    label: 'Edit',
    submenu: [
    {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
    },
    {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
    },
    {
        type: 'separator'
    },
    {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
    },
    {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
    },
    {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
    },
    {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
    },
    ]
}
];

if (process.platform == 'darwin') {
var name = app.getName();
template.unshift({
    label: name,
    submenu: [
    {
        label: 'About ' + name,
        role: 'about'
    },
    {
        type: 'separator'
    },
    {
        label: 'Services',
        role: 'services',
        submenu: []
    },
    {
        type: 'separator'
    },
    {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide'
    },
    {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
    },
    {
        label: 'Show All',
        role: 'unhide'
    },
    {
        type: 'separator'
    },
    {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() { app.quit(); }
    },
    ]
});
}

function saveFile() {
    console.log('Whoo. Saved it.');
}

function openFile() {
    console.log('Hey you clicked the open file button. There\'s nothing to open though');
}

module.exports.template = template;