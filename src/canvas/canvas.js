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
let circleCheck = document.querySelector('#circle-check');
let clearButton = document.querySelector('#canvas-clear');
clearButton.addEventListener('click', clearCanvas);
let strokeColor = document.querySelector('#stroke-color');
let fillColor = document.querySelector('#fill-color');
let strokeSlider = document.querySelector('#stroke-slider');

function setCanvasSize() {
    canvas.height = window.innerHeight - 70;   // subtract 80 to make room for the margin and the buttons
    canvas.width = window.innerWidth - 200 - 40;     // subtract 200 to make room for the sidebar. subtract 40 for padding-left and right
    previewCanvas.height = window.innerHeight - 70; 
    previewCanvas.width = window.innerWidth - 200 - 40; 
}

function initCanvas() {
    setCanvasSize();
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    previewContext.clearRect(0,0,previewCanvas.width, previewCanvas.height);
    // the array of imageData contains info about every pixel's color
    // var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
    // console.log(imgData.data);
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
}

function finishRect(event) {
    painting = false;
    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;
    shape.context = context;
    
    shape.drawFillRect(startX, startY, width, height, fillColor.value);
    shape.drawStrokeRect(startX, startY, width, height, strokeSlider.value, strokeColor.value);
    // only clear the preview canvas if the mouse moved
    if (mouseX !== startX || mouseY !== startY) { previewContext.clearRect(0,0,previewCanvas.width,previewCanvas.height); }
    
}

function drawRect(event) {

    if (!painting) { return; }
    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;

    previewContext.clearRect(0, 0, canvas.width, canvas.height);

    shape.context = previewContext;

    shape.drawFillRect(startX, startY, width, height, fillColor.value);
    shape.drawStrokeRect(startX, startY, width, height, strokeSlider.value, strokeColor.value);
}

function startCircle(event) {
    painting = true;
    let { mouseX, mouseY } = getMousePosition(event);
    startX = mouseX;
    startY = mouseY;

    context.beginPath();

    previewContext.beginPath();    // start a new path so we don't draw from old position
    previewContext.strokeStyle = strokeColor.value;
    previewContext.lineWidth = strokeSlider.value;
    previewContext.lineCap = 'round';
}

// NEED TO DO A LOT OF CLEANING ON THE FINISH CIRCLE AND DRAW CIRCLE FUNCTIONS
function finishCircle(event) {
    painting = false;
    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;
    let radius = Math.sqrt(width*width + height*height);

    shape.context = context;
    
    context.strokeStyle = strokeColor.value;
    context.fillStyle = fillColor.value;
    context.lineWidth = strokeSlider.value;

    context.arc(startX, startY, radius, 0, 2 * Math.PI, true);
    context.fill();

    context.arc(startX, startY, radius, 0, 2 * Math.PI, true);
    context.stroke();

    // only clear the preview canvas if the mouse moved
    if (mouseX !== startX || mouseY !== startY) { previewContext.clearRect(0,0,previewCanvas.width,previewCanvas.height); }
    
}

function drawCircle(event) {

  
    if (!painting) { return; }
    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;
    let radius = Math.sqrt(width*width + height*height);

    previewContext.clearRect(0, 0, canvas.width, canvas.height);

    previewContext.strokeStyle = strokeColor.value;
    previewContext.fillStyle = fillColor.value;
    previewContext.lineWidth = strokeSlider.value;

    previewContext.arc(startX, startY, radius, 0, 2 * Math.PI, true);
    previewContext.fill();

    previewContext.arc(startX, startY, radius, 0, 2 * Math.PI, true);
    previewContext.stroke();


    previewContext.beginPath();

}


function startLine(event) {
    painting = true;

    context.beginPath();    // start a new path so we don't draw from old position
    context.strokeStyle = strokeColor.value;
    context.lineWidth = strokeSlider.value;
    context.lineCap = 'round';

    draw(event);   // this is just for drawing a single dot
}

function finishLine(event) {
    painting = false;
}

function drawLine(event) {

    if (!painting) { return; }
    let { mouseX, mouseY } = getMousePosition(event);

    // draw a line from your last painting point to your current mouse position
    context.lineTo(mouseX, mouseY);
    context.stroke();

    // these two lines should make the line less pixelated
    context.beginPath();
    context.moveTo(mouseX, mouseY);
}

function start(event) {
    if (rectCheck.checked)          { startRect(event); }
    else if (circleCheck.checked)   { startCircle(event); }
    else                            { startLine(event); }
}

function draw(event) {
    if (!mouseDown)                 { showLineHover(event); }
    if (rectCheck.checked)          { drawRect(event); } 
    else if (circleCheck.checked)   { drawCircle(event); }
    else                            { drawLine(event); }
}

function finish(event) {
    if (rectCheck.checked)          { finishRect(event); } 
    else if (circleCheck.checked)   { finishCircle(event); }
    else                            { finishLine(event); }
}


function showLineHover(event) {
    let { mouseX, mouseY } = getMousePosition(event);

    previewContext.clearRect(0, 0, canvas.width, canvas.height);

    previewContext.beginPath();
    previewContext.arc(mouseX, mouseY, strokeSlider.value/2, 0, 2 * Math.PI, true);
    previewContext.fillStyle = strokeColor.value;
    previewContext.fill();
}

// Determines if user is still allowed to paint after they leave the canvas
function paintOnEnter() {
    // if we were already painting and leave the canvas, this will let us keep painting if we keep holding the mouse down.
    // if we hold the mouse down outside of the canvas and try to enter the canvas, we won't paint
    if (mouseDown && painting) {
        context.beginPath();
    } else {    // set painting to false if we enter without the mouse down. otherwise we can paint without holding mouse down
        painting = false;
    }
}


canvas.addEventListener('mousedown', start);
canvas.addEventListener('mouseup', finish);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseenter', paintOnEnter);
canvas.addEventListener('mouseleave', e => { 
    if (!painting) { previewContext.clearRect(0, 0, canvas.width, canvas.height); } 
});


canvas.addEventListener('wheel', checkScrollDirection);

function checkScrollDirection(event) {
    if (scrollIsUp(event)) {
        strokeSlider.value++;
        showLineHover(event);
    } else {
        strokeSlider.value--;
        showLineHover(event);
    }
}

function scrollIsUp(event) {
    if (event.wheelDelta) { return event.wheelDelta > 0; }
    return event.deltaY < 0;
}

window.addEventListener('resize', initCanvas);  // this should call some resize function that maintains the canvas state across sizes

// this is a bandaid fix, i'd like to make it so that you can keep painting if you leave the window and come back but releasing mouse outside of the window lets you keep painting without mouse held.
document.body.onmouseleave = () => { painting = false; mouseDown = false; }    
document.body.onmousedown = e => { mouseDown = true; }
document.body.onmouseup = e => { mouseDown = false; }



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


