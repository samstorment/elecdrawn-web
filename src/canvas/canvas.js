import { Rectangle, Ellipse, Polygon } from './shape.js';
import { getMousePosition } from './util.js';
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

let fill = new Fill();

let strokeWeight = 15;
// checks if the mouse is down (we are painting when the mouse is clicked)
let painting = false;
let mouseDown = false;
// starting mouse x and y coordinates when we draw squares, circles, etc 
let startX = 0;
let startY = 0;

// Sidebar buttons
let brushCheck = document.querySelector('#brush-check');
let rectCheck = document.querySelector('#rect-check');
let lineCheck = document.querySelector('#line-check');
let radialCheck = document.querySelector('#radial-check');
let circleCheck = document.querySelector('#circle-check');
let fillCheck = document.querySelector('#fill-check');
fillCheck.addEventListener('click', () => {
    // set the slider size to 0 so the hover cursor doesn't block our view
    strokeSlider.value = 1;
});
let pickerCheck = document.querySelector('#picker-check');
pickerCheck.addEventListener('change', () => {
    // set the slider size to 0 so the hover cursor doesn't block our view
    strokeSlider.value = 1;
});
let clearButton = document.querySelector('#canvas-clear');
clearButton.addEventListener('click', clearCanvas);
let strokeColor = document.querySelector('#stroke-color');
let fillColor = document.querySelector('#fill-color');
let strokeSlider = document.querySelector('#stroke-slider');


let checkBoxes = document.querySelectorAll('.default-hover');
checkBoxes.forEach(element => {
    element.addEventListener('click', () => {
        strokeSlider.value = strokeWeight;
    });
});

function startRect(event) {
    painting = true;
    let { mouseX, mouseY } = getMousePosition(event);
    startX = mouseX;
    startY = mouseY;
}

function drawRect(event) {

    if (!painting) { return; }
    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;

    clearPreview();

    let rect = new Rectangle(startX, startY, width, height);
    rect.drawFill(fillColor.value, previewContext);
    rect.drawStroke(strokeSlider.value, strokeColor.value, previewContext);
}

function finishRect(event) {
    if (!painting) { return; }
    painting = false;
    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;
    
    let rect = new Rectangle(startX, startY, width, height);
    rect.drawFill(fillColor.value, context);
    rect.drawStroke(strokeSlider.value, strokeColor.value, context);
}

// TODO: implement floodfill
function startFill(event) {
    painting = true;
    let { mouseX, mouseY } = getMousePosition(event);
    let startClr = fill.getPixelColor(mouseX, mouseY, context);
    let fillClr = fillColor.value;
    fill.floodFillRecurse(mouseX, mouseY, startClr, fillClr, canvas, context);
    // fill.floodFill(startX, startY, startClr, fillClr, canvas, context);

    // clearPreview();
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
}

function startCircle(event) {
    painting = true;
    let { mouseX, mouseY } = getMousePosition(event);
    startX = mouseX; startY = mouseY;

    // start a new path so we don't draw from old position, rect doesn't need this because it doesn't use stroke to draw
    // set the linecaps to round so drawing a small circle fills everything
    context.beginPath();
    context.lineCap = 'round';
    previewContext.beginPath();
    previewContext.lineCap = 'round';
}


function drawCircle(event) {
    if (!painting) { return; }
    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;
    let radius = Math.sqrt(width*width + height*height);

    clearPreview();

    let ellipse = new Ellipse(startX, startY, radius);
    ellipse.drawFill(fillColor.value, previewContext);
    ellipse.drawStroke(strokeSlider.value, strokeColor.value, previewContext);
}

function finishCircle(event) {
    if (!painting) { return; }
    painting = false;

    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;
    let radius = Math.sqrt(width*width + height*height);
        
    let ellipse = new Ellipse(startX, startY, radius);
    ellipse.drawFill(fillColor.value, context);
    ellipse.drawStroke(strokeSlider.value, strokeColor.value, context);
}






function startEllipse(event) {
    painting = true;
    
    let { mouseX, mouseY } = getMousePosition(event);
    startX = mouseX; startY = mouseY;

    // start a new path so we don't draw from old position, rect doesn't need this because it doesn't use stroke to draw
    // set the linecaps to round so drawing a small circle fills everything
    context.beginPath();
    context.lineCap = 'round';
    context.imageSmoothingEnabled = false;

    previewContext.beginPath();
    previewContext.lineCap = 'round';
}


function drawEllipse(event) {
    if (!painting) { return; }
    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;

    

    clearPreview(); 

    // start points are the direct center of the ellipse
    // radii are half the width and half the height of a rectangle
    let ellipse = new Ellipse(startX + width/2, startY + height/2, Math.abs(width/2), Math.abs(height/2));
    ellipse.drawFill(fillColor.value, previewContext);
    ellipse.drawStroke(strokeSlider.value, strokeColor.value, previewContext);

    let rectangle = new Rectangle(startX, startY, width, height);
    rectangle.drawStroke(2, "#000000", previewContext);
}

function finishEllipse(event) {
    if (!painting) { return; }
    painting = false;

    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;
        
    let ellipse = new Ellipse(startX + width/2, startY + height/2, Math.abs(width/2), Math.abs(height/2));
    ellipse.drawFill(fillColor.value, context);
    ellipse.drawStroke(strokeSlider.value, strokeColor.value, context);
}









function startBrush(event) {
    painting = true;

    context.beginPath();    // start a new path so we don't draw from old position
    context.strokeStyle = strokeColor.value;
    context.lineWidth = strokeSlider.value;
    context.lineCap = 'round';

    draw(event);   // this is just for drawing a single dot
}

function drawBrush(event) {
    if (!painting) { return; }
    let { mouseX, mouseY } = getMousePosition(event);

    // draw a line from your last painting point to your current mouse position
    context.lineTo(mouseX, mouseY);
    context.stroke();

    // these two lines should make the line less pixelated
    context.beginPath();
    context.moveTo(mouseX, mouseY);
}

function finishBrush(event) {
    painting = false;
}

// TODO: Clean up the LINE and RADIAL functions. Lots of duplicate code that could be modularized
function startLine(event) {
    painting = true;
    let { mouseX, mouseY } = getMousePosition(event);
    startX = mouseX; startY = mouseY;

    // do all this to context and previeContext to set up preview line and final drawing
    context.beginPath();
    context.strokeStyle = strokeColor.value;
    context.lineWidth = strokeSlider.value;
    context.lineCap = 'round';  // change this and the preview linecap to square to draw a square line

    previewContext.beginPath();
    previewContext.strokeStyle = strokeColor.value;
    previewContext.lineWidth = strokeSlider.value;
    previewContext.lineCap = 'round';
}

// every fram draw the line to the previewCanvas
function drawLine(event) {
    if (!painting) { return; }
    let { mouseX, mouseY } = getMousePosition(event);

    // clear the preview when the mouse moves
    clearPreview();

    // move the line start point to (startX, startY) then draw a line to the current mouse position
    previewContext.moveTo(startX, startY);
    previewContext.lineTo(mouseX, mouseY);
    previewContext.stroke();

    // Need these so that the preview just draws a single line each time we move rather than all of them
    previewContext.beginPath();
    previewContext.moveTo(mouseX, mouseY);
}

// draw the final line once the mouse releases
function finishLine(event) {
    if (!painting) { return; }
    painting = false;
    let { mouseX, mouseY } = getMousePosition(event);
    // always draw the line from the start coordinates
    context.moveTo(startX, startY);
    context.lineTo(mouseX, mouseY);
    context.stroke();
    clearPreview(); // clear the preview after drawing the last line in case we finish the line off canvas
}



// The RADIAL functions are very similar to the LINE fucntions -- needs fixing
function startRadialLine(event) {
    painting = true;
    let { mouseX, mouseY } = getMousePosition(event);
    startX = mouseX; startY = mouseY;
    context.beginPath();
    context.strokeStyle = strokeColor.value;
    context.lineWidth = strokeSlider.value;
    context.lineCap = 'round';
    draw(event);

}

function drawRadialLine(event) {
    if (!painting) { return; }
    let { mouseX, mouseY } = getMousePosition(event);

    // we don't clear the canvas so every line gets drawn from (startX,startY) to current mouse position
    context.moveTo(startX, startY);
    context.lineTo(mouseX, mouseY);
    context.stroke();

    context.beginPath();
    context.moveTo(mouseX, mouseY);
}

// we draw to the canvas live, so we don't need to make a final draw to the main canvas
function finishRadialLine(event) {
    painting = false;
}



// THIS SHIT IS UGLY AND BAD. How do we do it better???
// MAIN START, DRAW, FINISH
function start(event) {
    if (rectCheck.checked)          { startRect(event); }
    else if (lineCheck.checked)     { startLine(event); }
    else if (radialCheck.checked)   { startRadialLine(event); }
    else if (circleCheck.checked)   { startEllipse(event); }
    else if (fillCheck.checked)     { startFill(event); }
    else if (pickerCheck.checked)   { startPicker(event); }
    else                            { startBrush(event); }
}

function draw(event) {
    // if we are just hovering over the canvas without holding the mouse, show the hover
    if (!mouseDown)                 { showHoverCursor(event); }

    if (rectCheck.checked)          { drawRect(event); } 
    else if (lineCheck.checked)     { drawLine(event); }
    else if (radialCheck.checked)   { drawRadialLine(event); }
    else if (circleCheck.checked)   { drawEllipse(event); }
    else if (fillCheck.checked)     {  }
    else if (pickerCheck.checked)   {  }
    else                            { drawBrush(event); }
}

function finish(event) {
    if (rectCheck.checked)          { finishRect(event); } 
    else if (lineCheck.checked)     { finishLine(event); }
    else if (radialCheck.checked)   { finishRadialLine(event); }
    else if (circleCheck.checked)   { finishEllipse(event); }
    else if (fillCheck.checked)     {  }
    else if (pickerCheck.checked)   { finishPicker(event); }
    else                            { finishBrush(event); }
}

// EVENT LISTENERS
canvas.addEventListener('mousedown', start);    
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', finish);
canvas.addEventListener('mouseenter', paintOnEnter);
canvas.addEventListener('mouseleave', clearOnLeave);
canvas.addEventListener('wheel', checkScrollDirection);

// this is a bandaid fix, i'd like to make it so that you can keep painting if you leave the window and come back. However, releasing mouse outside of the window lets you keep painting without mouse held.
document.body.onmouseleave = () => { painting = false; mouseDown = false; clearPreview(); }    
document.body.onmousedown = () => { mouseDown = true; }
document.body.onmouseup = event => { mouseDown = false; finish(event); }

// TODO
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
    if (scrollIsUp(event))  { strokeSlider.value--; } 
    else                    { strokeSlider.value++; }
    showHoverCursor(event); // update the size of the hover cursor to the new value
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
        let xStart = mouseX-length/2; let yStart =  mouseY-length/2;

        let rect = new Rectangle(xStart, yStart, length);
        rect.drawFill(strokeColor.value, previewContext);

    } else {
        let radius = strokeSlider.value / 2;
        let ellipse = new Ellipse(mouseX, mouseY, radius);
        ellipse.drawFill(strokeColor.value, previewContext);
    }
}



