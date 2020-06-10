import Shape from './shape.js';

// CANVAS - this is where drawings will show up
let canvas = document.querySelector('#canvas');
let context = canvas.getContext('2d');

// PREVIEW CANVAS - this is where shape previews will appear before the final mouse release
let previewCanvas = document.querySelector('#preview-canvas');
let previewContext = previewCanvas.getContext('2d');

// Get the canvas X and Y coordinates so we knwow where to draw
let canvasPosition = getElementPosition(canvas);
let canvasX = canvasPosition.x;
let canvasY = canvasPosition.y;


let shape = new Shape(context);


// Sidebar buttons
let rectCheck = document.querySelector('#rect-check');
let clearButton = document.querySelector('#canvas-clear');
clearButton.addEventListener('click', clearCanvas);
let strokeColor = document.querySelector('#stroke-color');
let fillColor = document.querySelector('#fill-color');
let strokeSlider = document.querySelector('#stroke-slider');

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

// checks if the mouse is down (we are painting when the mouse is clicked)
let painting = false;
let mouseDown = false;
let startX = 0;
let startY = 0;



function startRect(event) {
    painting = true;
    let { mouseX, mouseY } = getMousePosition(event);
    startX = mouseX;
    startY = mouseY;

    // this is for drawing the preview line
    previewContext.strokeStyle = strokeColor.value;
    previewContext.lineWidth = strokeSlider.value;
    previewContext.lineCap = 'round';
}

function finishedRect(event) {
    painting = false;
    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;
    shape.drawStrokeRect(startX, startY, width, height, strokeSlider.value, strokeColor.value, context);
    shape.drawFillRect(startX, startY, width, height, fillColor.value);
    previewContext.clearRect(0,0,previewCanvas.width,previewCanvas.height);
    
}

function drawRect(event) {

    previewContext.lineTo(mouseX, mouseY);
    previewContext.stroke();

    // to reduce pixelated-ness in the line
    previewContext.beginPath();
    previewContext.moveTo(mouseX, mouseY);
}


function startPainting(event) {
    painting = true;

    context.beginPath();    // start a new path so we don't draw from old position
    context.strokeStyle = strokeColor.value;
    context.lineWidth = strokeSlider.value;
    context.lineCap = 'round';

    paint(event);   // this is just for drawing a single dot
}

function finishedPainting() {
    painting = false;
}

function paint(event) {


    // MOUSE DOWN IS SET TO TRUE IF I LEAVE CANVAS, LIFT MOUSE, AND REENTER CANVAS
    console.log(mouseDown);



    if (!mouseDown || !painting) { return; }

    let { mouseX, mouseY } = getMousePosition(event);

    // draw a line from your last painting point to your current mouse position
    context.lineTo(mouseX, mouseY);
    context.stroke();

    // these two lines should make the line less pixelated
    context.beginPath();
    context.moveTo(mouseX, mouseY);
}

// Determines if user is still allowed to paint after they leave the canvas
function paintOnEnter() {
    // if we were already painting and leave the canvas, this will let us keep painting if we keep holding the mouse down.
    // if we hold the mouse down outside of the canvas and try to enter the canvas, we won't paint

    console.log('COOL');

    if (mouseDown && painting) {
        context.beginPath();
    } else {    // set painting to false if we enter without the mouse down. otherwise we can paint without holding mouse down
        painting = false;
    }
}


canvas.addEventListener('mousedown', startPainting);
canvas.addEventListener('mouseup', finishedPainting);
canvas.addEventListener('mousemove', paint);
canvas.addEventListener('mouseenter', paintOnEnter);
// canvas.addEventListener('mouseleave', e => {
//     if (!mouseDown ) { painting = false; }
// });

window.addEventListener('resize', e => {
    initCanvas();
});

document.body.onmousedown = e => { mouseDown = true; }
document.body.onmouseup = e => { mouseDown = false; }
document.body.onmouseleave = () => { painting = false; }
document.body.onmouseenter = () => { if (mouseDown) { painting = true; } }





function clearCanvas() {
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);    
}

// HELPERS!
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


