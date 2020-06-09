const { remote, ipcRenderer } = require('electron');
import Rectangle from './rectangle.js';

let r = new Rectangle();

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



let mouseDown = false;

// CANVAS - this is where drawings will show up
let canvas = document.querySelector('#canvas');
let context = canvas.getContext('2d');

// PREVIEW CANVAS - this is where shape previews will appear before the final mouse release
let previewCanvas = document.querySelector('#preview-canvas');
let previewContext = previewCanvas.getContext('2d');

let canvasPosition = getElementPosition(canvas);
let canvasX = canvasPosition.x;
let canvasY = canvasPosition.y;

function setCanvasSize() {
    canvas.height = window.innerHeight - 100;   // subtract 100 to make room for the margin and the buttons
    canvas.width = window.innerWidth - 200;     // subtract 200 to make room for the sidebar 
    previewCanvas.height = window.innerHeight - 100; 
    previewCanvas.width = window.innerWidth - 200; 
}

function initCanvas() {
    setCanvasSize();
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    previewContext.clearRect(0,0,previewCanvas.width, previewCanvas.height);
    // the array of imageData contains info about every pixel's color
    var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    console.log(imgData.data);
}

initCanvas();

// rectangle with no fill
function drawStrokeRect(x, y, width, height, lineWeight, color, context) {
    context.strokeStyle = color;
    context.lineWidth = lineWeight;
    context.strokeRect(x, y, width, height);
}

function drawFillRect(x, y,  width, height, color) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
}

// can be used to draw a shape with any number of sides
function drawStrokeShape(points, lineWeight, color) {
    context.strokeStyle = color;
    context.lineWidth = lineWeight;
    context.beginPath();

    // draw a line to each point in the array
    points.forEach(element => {
        context.lineTo(element.x, element.y);
    });
    
    // finish the path by drawing a line from end-point of last line to start-point of first line
    context.closePath()
    // actually put the lines on screen
    context.stroke();
}

function getElementPosition(element) {
    var xPosition = 0;
    var yPosition = 0;
    
    while (element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return {
        x: xPosition,
        y: yPosition
    };
}

function getMousePosition(event) {
    return {
        mouseX: event.clientX - canvasX,   
        mouseY: event.clientY - canvasY  
    };
}

// to clear the canvas, just fill it with a white rectangle
function clearCanvas() {
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);    
}

let rectCheck = document.querySelector('#rect-check');

let clearButton = document.querySelector('#canvas-clear');
clearButton.addEventListener('click', clearCanvas);

let strokeColor = document.querySelector('#stroke-color');
let fillColor = document.querySelector('#fill-color');

let strokeSlider = document.querySelector('#stroke-slider');

// checks if the mouse is down (we are painting when the mouse is clicked)
let painting = false;
let startX = 0;
let startY = 0;

function startPainting(event) {
    context.beginPath();
    previewContext.beginPath();
    if (rectCheck.checked) {
        let { mouseX, mouseY } = getMousePosition(event);
        startX = mouseX;
        startY = mouseY;
    }
    painting = true;
    paint(event);   // this is just for drawing a single dot
}

function finishedPainting() {
    painting = false;
    if (rectCheck.checked) {
        let { mouseX, mouseY } = getMousePosition(event);
        let width = mouseX - startX;
        let height = mouseY - startY;
        drawStrokeRect(startX, startY, width, height, strokeSlider.value, strokeColor.value, context);
        drawFillRect(startX, startY, width, height, fillColor.value);
        previewContext.clearRect(0,0,previewCanvas.width,previewCanvas.height);
    }
}

function paint(event) {
    if (!painting) { return; }
    // context.beginPath();     // this line makes the painting have spaced dots
    context.strokeStyle = strokeColor.value;
    context.lineWidth = strokeSlider.value;
    context.lineCap = 'round';

    previewContext.strokeStyle = strokeColor.value;
    previewContext.lineWidth = strokeSlider.value;
    previewContext.lineCap = 'round';


    let {mouseX, mouseY } = getMousePosition(event);

    if (!rectCheck.checked) {
        // draw a line from your last painting point to your current mouse position
        context.lineTo(mouseX, mouseY);
        context.stroke();
    } else {
        previewContext.lineTo(mouseX, mouseY);
        previewContext.stroke();
    }

    // these two lines should make the line less pixelated
    context.beginPath();
    context.moveTo(mouseX, mouseY);

    previewContext.beginPath();
    previewContext.moveTo(mouseX, mouseY);
}

document.body.onmousedown = e => {
    mouseDown = true;
}
document.body.onmouseup = e => {
    mouseDown = false;
}


canvas.addEventListener('mousedown', startPainting);
canvas.addEventListener('mouseup', finishedPainting);
canvas.addEventListener('mousemove', paint);

canvas.addEventListener('mouseleave', e => {
    if (!mouseDown ) { painting = false; }
});


canvas.addEventListener('mouseenter', e => {
    // if we were already painting and leave the canvas, this will let us keep painting if we keep holding the mouse down.
    // if we hold the mouse down outside of the canvas and try to enter the canvas, we won't paint
    if (mouseDown && painting) {
        context.beginPath();
    } else {    // set painting to false if we enter without the mouse down. otherwise we can paint without holding mouse down
        painting = false;
    }
});


window.addEventListener('resize', e => {
    initCanvas();
});


