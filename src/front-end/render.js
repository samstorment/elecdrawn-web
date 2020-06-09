const { remote, ipcRenderer } = require('electron');


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

// CANVAS
let canvas = document.querySelector('#canvas');
let context = canvas.getContext('2d');

// PREVIEW CANVAS
let previewCanvas = document.querySelector('#preview-canvas');
let previewContext = previewCanvas.getContext('2d');

function setCanvasSize() {
    canvas.height = window.innerHeight - 100;   // subtract 100 to make room for the margin and the buttons
    canvas.width = window.innerWidth - 200;     // subtract 200 to make room for the sidebar 
    previewCanvas.height = window.innerHeight - 100;   // subtract 100 to make room for the margin and the buttons
    previewCanvas.width = window.innerWidth - 200; 
}

function initCanvas() {
    setCanvasSize();
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    previewContext.clearRect(0,0,previewCanvas.width, previewCanvas.height);
}

initCanvas();

// sample set of points for a pentagon
let shape = [
                { "x": 55, "y": 5 },
                { "x": 75, "y": 5 },
                { "x": 75, "y": 15 },
                { "x": 65, "y": 25 },
                { "x": 55, "y": 15 }
            ]

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

function getMousePosition(event) {
    return {
        mouseX: event.clientX - 200,     // subtract 200 for sidebar
        mouseY: event.clientY - 30 - 30  // subtract 30 for title bar, 30 for canvas margin-top 
    };
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
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

document.body.onmousedown = () => {
    let { mouseX, mouseY } = getMousePosition(event);
    startX = mouseX;
    startY = mouseY;
    mouseDown = true; 
}
document.body.onmouseup = () => {
    if (painting && rectCheck.checked) {
        let { mouseX, mouseY } = getMousePosition(event);
        let width = mouseX - startX;
        let height = mouseY - startY;
        drawStrokeRect(startX, startY, width, height, strokeSlider.value, strokeColor.value, context);
        drawFillRect(startX, startY, width, height, fillColor.value);
        previewContext.clearRect(0,0,previewCanvas.width,previewCanvas.height);
    } 
    mouseDown = false; 
}


canvas.addEventListener('mousedown', startPainting);
canvas.addEventListener('mouseup', finishedPainting);
canvas.addEventListener('mousemove', paint);

canvas.addEventListener('mouseleave', e => {
    if (!mouseDown ) { painting = false; }
});
canvas.addEventListener('mouseenter', e => {
    if (!mouseDown) {
        painting = false;
    }
    else {
        context.beginPath();
        previewContext.beginPath();
        painting = true;
        paint(event);
    }
});


window.addEventListener('resize', e => {
    initCanvas();
});

// examples for our draw methods
drawStrokeRect(5,5,20,20,5,'red',context);
drawFillRect(30, 5, 20, 20,'blue');
drawStrokeShape(shape, 2, 'green');


