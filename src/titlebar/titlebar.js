import CanvasState from '../canvas/canvas-state.js';

let hotkeys = document.querySelector("#hotkeys-container");
let canvases = document.querySelectorAll(".canvas");
let drawingArea = document.querySelector("#drawing-area");
let sidebar = document.querySelector("#sidebar");

let canvas = document.querySelector("#canvas");
let context = canvas.getContext('2d');

let hotkeysButton = document.querySelector('#hotkeys-button');
hotkeysButton.addEventListener('click', () => {

    if (hotkeys.style.display === 'flex') {
        closeHotkeys();
    } else {   
        canvases.forEach(element => {
            element.style.visibility = "hidden";
        });
        hotkeys.style.display = "flex";
        drawingArea.style.display = "none";
    }
});

let hotkeysClose = document.querySelector("#hotkeys-close");
hotkeysClose.addEventListener('click', closeHotkeys);

function closeHotkeys() {
    canvases.forEach(element => {
        element.style.visibility = "visible";
    });
    hotkeys.style.display = "none";
    drawingArea.style.display = "flex";
}

let burgerButton = document.querySelector("#burger-button");
burgerButton.addEventListener('click', e => {
    const vis = sidebar.style.display;
    if (vis === 'none')
        sidebar.style.display = 'flex';
    else
        sidebar.style.display = 'none';
});

let undoButton = document.querySelector("#undo-button");
undoButton.addEventListener('click', e => {
    CanvasState.undo(context);
});

let redoButton = document.querySelector("#redo-button");
redoButton.addEventListener('click', e => {
    CanvasState.redo(context);
});