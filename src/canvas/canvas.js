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
    clearCanvas();
    clearPreview();
}

initCanvas();


let shape = new Shape();
let fill = new Fill();

let strokeWeight = 0;
// checks if the mouse is down (we are painting when the mouse is clicked)
let painting = false;
let mouseDown = false;
// starting mouse x and y coordinates when we draw squares, circles, etc 
let startX = 0;
let startY = 0;

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


function startRect(event) {
    painting = true;
    let { mouseX, mouseY } = getMousePosition(event);
    startX = mouseX;
    startY = mouseY;
}

function finishRect(event) {
    if (!painting) { return; }
    painting = false;
    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;
    
    shape.drawFillRect(startX, startY, width, height, fillColor.value, context);
    shape.drawStrokeRect(startX, startY, width, height, strokeSlider.value, strokeColor.value, context);
    // only clear the preview canvas if the mouse moved
    if (mouseX !== startX || mouseY !== startY) { clearPreview(); }
}

function drawRect(event) {

    if (!painting) { return; }
    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;

    clearPreview();

    shape.drawFillRect(startX, startY, width, height, fillColor.value, previewContext);
    shape.drawStrokeRect(startX, startY, width, height, strokeSlider.value, strokeColor.value, previewContext);
}

function startFill(event) {
    painting = true;
    let { mouseX, mouseY } = getMousePosition(event);
    let startClr = fill.getPixelColor(mouseX, mouseY, context);
    let fillClr = fillColor.value;
    fill.floodFill(mouseX, mouseY, startClr, fillClr, canvas, context);

    // clearPreview();
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
    showHoverCursor(event);
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
    startX = mouseX; startY = mouseY;

    // start a new path so we don't draw from old position, rect doesn't need this because it doesn't use stroke to draw
    context.beginPath();
    context.lineCap = 'round';
    previewContext.beginPath();
    previewContext.lineCap = 'round';
}

function finishCircle(event) {
    if (!painting) { return; }
    painting = false;

    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;
    let radius = Math.sqrt(width*width + height*height);
        
    shape.drawFillCircle(startX, startY, radius, fillColor.value, context);
    shape.drawStrokeCircle(startX, startY, radius, strokeSlider.value, strokeColor.value, context);
   
    // only clear the preview canvas if the mouse moved
    if (mouseX !== startX || mouseY !== startY) { clearPreview(); }
}

function drawCircle(event) {
    if (!painting) { return; }
    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;
    let radius = Math.sqrt(width*width + height*height);

    clearPreview();

    shape.drawFillCircle(startX, startY, radius, fillColor.value, previewContext);
    shape.drawStrokeCircle(startX, startY, radius, strokeSlider.value, strokeColor.value, previewContext);

    // this line makes the fill appear over the stroke
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

// MAIN START, DRAW, FINISH
function start(event) {
    if (rectCheck.checked)          { startRect(event); }
    else if (circleCheck.checked)   { startCircle(event); }
    else if (fillCheck.checked)     { startFill(event); }
    else if (pickerCheck.checked)   { startPicker(event); }
    else                            { startLine(event); }
}

function draw(event) {
    // if we are just hovering over the canvas without holding the mouse, show the hover
    if (!mouseDown)                 { showHoverCursor(event); }
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

// EVENT LISTENERS
canvas.addEventListener('mousedown', start);    
canvas.addEventListener('mouseup', finish);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseenter', paintOnEnter);
canvas.addEventListener('mouseleave', clearOnLeave);
canvas.addEventListener('wheel', checkScrollDirection);

// this is a bandaid fix, i'd like to make it so that you can keep painting if you leave the window and come back but releasing mouse outside of the window lets you keep painting without mouse held.
document.body.onmouseleave = event => { painting = false; mouseDown = false; clearPreview(); }    
document.body.onmousedown = event => { mouseDown = true; }
document.body.onmouseup = event => { mouseDown = false; finish(event); }

// this should call some resize function that maintains the canvas state across sizes
window.addEventListener('resize', initCanvas);



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

// when we leave the canvas, clear the preview hover unless we are still painting
function clearOnLeave() {
    if (!painting) { clearPreview(); } 
}

// change the stroke weight based on scroll direction
function checkScrollDirection(event) {
    if (scrollIsUp(event)) {
        strokeSlider.value--;
        showHoverCursor(event);
    } else {
        strokeSlider.value++;
        showHoverCursor(event);
    }
}

// returns true if mouse scroll wheel scrolls up
function scrollIsUp(event) {
    if (event.wheelDelta) { return event.wheelDelta > 0; }
    return event.deltaY < 0;
}

function clearCanvas() {
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);    
}

function clearPreview() {
    previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
}

function showHoverCursor(event) {
    let { mouseX, mouseY } = getMousePosition(event);

    // clear the preview canvas anytime we move, but draw right after
    clearPreview();

    previewContext.beginPath();
    // if rect is checked, make our hover cursor a square
    if (rectCheck.checked) {
        let length = strokeSlider.value;
        shape.drawFillRect(mouseX-length/2, mouseY-length/2, length, length, strokeColor.value, previewContext);
    } else {
        previewContext.arc(mouseX, mouseY, strokeSlider.value/2, 0, 2 * Math.PI, true);
        previewContext.fillStyle = strokeColor.value;
        previewContext.fill();
    }
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


