import Shape from './shape.js';
import Fill from './fill.js';

// CANVAS - this is where drawings will show up
let canvas = document.querySelector('#canvas');
let context = canvas.getContext('2d');

// PREVIEW CANVAS - this is where shape previews will appear before the final mouse release
let previewCanvas = document.querySelector('#preview-canvas');
let previewContext = previewCanvas.getContext('2d');


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
}

initCanvas();

let strokeWeight = 0;

// Sidebar buttons
let brushCheck = document.querySelector('#brush-check');
let rectCheck = document.querySelector('#rect-check');
let circleCheck = document.querySelector('#circle-check');
let fillCheck = document.querySelector('#fill-check');
let pickerCheck = document.querySelector('#picker-check');
pickerCheck.addEventListener('click', event => {
    // set the slider size to 0 so the hover cursor doesn't block our view
    strokeWeight = strokeSlider.value;
    strokeSlider.value = 1;
});
let clearButton = document.querySelector('#canvas-clear');
clearButton.addEventListener('click', clearCanvas);
let strokeColor = document.querySelector('#stroke-color');
let fillColor = document.querySelector('#fill-color');
let strokeSlider = document.querySelector('#stroke-slider');


let shape = new Shape(context);
// these are just testing shapes in the top left corner
// shape.drawFillRect(0, 0, 10, 10, '#ffff00');
// shape.drawFillRect(10, 0, 10, 10, '#ff0000');

let fill = new Fill();

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
    if (!painting) { return; }
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

function startFill(event) {
    painting = true;
    let { mouseX, mouseY } = getMousePosition(event);
    let startClr = fill.getPixelColor(mouseX, mouseY, context);
    let fillClr = fillColor.value;
    fill.floodFill(mouseX, mouseY, startClr, fillClr, canvas, context);

    // previewContext.clearRect(0,0,previewCanvas.width,previewCanvas.height);
}

// TODO
function finishFill(event) {

}


function startPicker(event) {
  // get the color at this specific pixel and use it as the new stroke color
    let { mouseX, mouseY } = getMousePosition(event);
    let colorPicked = fill.getPixelColor(mouseX, mouseY, context);
    strokeColor.value = colorPicked;
    // update the color of the hover cursor
    showLineHover(event);
}

function finishPicker(event) {
    // return the paint mode to brush, this should actually go back to the last selected mode
    brushCheck.checked = true;
    // change the brush size back to its value before clicking the picker
    strokeSlider.value = strokeWeight;
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
    if (!painting) { return; }

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
    else if (fillCheck.checked)     { startFill(event); }
    else if (pickerCheck.checked)   { startPicker(event); }
    else                            { startLine(event); }
}

function draw(event) {
    if (!mouseDown)                 { showLineHover(event); }
    if (rectCheck.checked)          { drawRect(event); } 
    else if (circleCheck.checked)   { drawCircle(event); }
    else if (fillCheck.checked)     {  }
    else if (pickerCheck.checked)   {  }
    else                            { drawLine(event); }
}

function finish(event) {
    if (rectCheck.checked)          { finishRect(event); } 
    else if (circleCheck.checked)   { finishCircle(event); }
    else if (fillCheck.checked)     { finishFill(event); }
    else if (pickerCheck.checked)   { finishPicker(event); }
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
    // if we weren't painting, clear the preview context so that the hover cursor goes away
    if (!painting) { previewContext.clearRect(0, 0, canvas.width, canvas.height); } 
});


canvas.addEventListener('wheel', checkScrollDirection);

function checkScrollDirection(event) {
    if (scrollIsUp(event)) {
        strokeSlider.value--;
        showLineHover(event);
    } else {
        strokeSlider.value++;
        showLineHover(event);
    }
}

function scrollIsUp(event) {
    if (event.wheelDelta) { return event.wheelDelta > 0; }
    return event.deltaY < 0;
}

window.addEventListener('resize', initCanvas);  // this should call some resize function that maintains the canvas state across sizes

// this is a bandaid fix, i'd like to make it so that you can keep painting if you leave the window and come back but releasing mouse outside of the window lets you keep painting without mouse held.
document.body.onmouseleave = event => { painting = false; mouseDown = false; previewContext.clearRect(0, 0, canvas.width, canvas.height); }    
document.body.onmousedown = event => { mouseDown = true; }
document.body.onmouseup = event => { mouseDown = false; finish(event); }



function clearCanvas() {
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);    
}

// gets the starting X and Y position of given HTML element. Use this to find top left corner of canvas
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

// returns the position of the mouse on the canvas since (0, 0) on the cnavas is offset from (0,0) on the overall window
function getMousePosition(event) {

    // Get the canvas X and Y coordinates so we knwow where to draw
    let { x, y } = getElementPosition(canvas);

    return {
        mouseX: event.clientX - x,   
        mouseY: event.clientY - y
    };
}


