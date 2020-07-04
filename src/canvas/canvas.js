import { Rectangle, Ellipse, Polygon } from './shape.js';
import { getMousePosition, undoStack, redoStack, clearRedoStack } from './util.js';
import { floodFill } from './fill.js';
import { getPixelColor } from './color.js';
import CanvasState from '../canvas/canvas-state.js';

import BrushTool from '../draw-tools/brush.js';
import RectangleTool from '../draw-tools/rectangle.js';
import EllipseTool from '../draw-tools/ellipse.js';
import LineTool from '../draw-tools/line.js';
import RadialTool from '../draw-tools/radial.js';
import PolygonTool from '../draw-tools/polygon.js';
import SelectTool from '../draw-tools/select.js';
import LassoTool from '../draw-tools/lasso.js';

let showHover = true;
let painting = false;
let mouseDown = false;

// CANVAS - this is where drawings will show up
let canvas = document.querySelector('#canvas');
let context = canvas.getContext('2d');

// PREVIEW CANVAS - this is where shape previews will appear before the final mouse release
let previewCanvas = document.querySelector('#preview-canvas');
let previewContext = previewCanvas.getContext('2d');

let backgroundCanvas = document.querySelector('#background-canvas');
let backgroundContext = backgroundCanvas.getContext('2d');

function setCanvasSize() {
    canvas.height = window.innerHeight - 70;   // subtract 80 to make room for the margin and the buttons
    canvas.width = window.innerWidth - 200 - 40;     // subtract 200 to make room for the sidebar. subtract 40 for padding-left and right
    previewCanvas.height = window.innerHeight - 70; 
    previewCanvas.width = window.innerWidth - 200 - 40; 
    backgroundCanvas.height = window.innerHeight - 70; 
    backgroundCanvas.width = window.innerWidth - 200 - 40; 
}


// Sidebar buttons
let selectCheck = document.querySelector('#select-check');
let lassoCheck = document.querySelector('#lasso-check');
let brushCheck = document.querySelector('#brush-check');
let rectCheck = document.querySelector('#rect-check');
let lineCheck = document.querySelector('#line-check');
let radialCheck = document.querySelector('#radial-check');
let circleCheck = document.querySelector('#circle-check');
let polygonCheck = document.querySelector('#polygon-check');
let polygonSides = document.querySelector('#polygon-sides');
let fillCheck = document.querySelector('#fill-check');
fillCheck.addEventListener('click', () => { showHover = false; });
let clearButton = document.querySelector('#canvas-clear');
clearButton.addEventListener('click', clearCanvas);
let strokeColor = document.querySelector('#stroke-color');
let strokePicker = document.querySelector('#stroke-picker');
let fillPicker = document.querySelector('#fill-picker');
let fillColor = document.querySelector('#fill-color');
let backgroundColor = document.querySelector('#background-color');
backgroundColor.addEventListener('input', () => {
    backgroundContext.fillStyle = backgroundColor.value;
    backgroundContext.fillRect(0, 0, canvas.width, canvas.height);
});
let strokeSlider = document.querySelector('#stroke-slider');
let downloadCanvas = document.querySelector('#download-canvas');
downloadCanvas.addEventListener('click', function (e) {
    // draw the canvas to the background just when we save so eveything from the canvas shows up
    backgroundContext.drawImage(canvas, 0, 0);
    let dataURL = backgroundCanvas.toDataURL('image/png');
    downloadCanvas.href = dataURL;
    backgroundContext.fillStyle = backgroundColor.value;
    backgroundContext.fillRect(0, 0, canvas.width, canvas.height);
});

function initCanvas() {
    setCanvasSize();
    backgroundContext.fillStyle = backgroundColor.value;
    backgroundContext.fillRect(0, 0, canvas.width, canvas.height);
    clearContext(previewContext);
}

initCanvas();

context.font = 'bold 48px serif';
context.strokeText("Gabby is cool", 200, 200);

// these are the draw tools that have been moved to separate files
let brush = new BrushTool(context);
let rect = new RectangleTool(context);
let ell = new EllipseTool(context);
let line = new LineTool(context);
let radial = new RadialTool(context);
let poly = new PolygonTool(context);
let select = new SelectTool(context);
let lasso = new LassoTool(context);


// // THIS Sloppy keboard shortcuts for now
document.onkeydown = e => {
    if (e.ctrlKey) {
        if (e.key === 'z') { CanvasState.undo(context); }
        if (e.key === 'y') { CanvasState.redo(context); }
    }
}

// we want to show the hover for the normal hover tools
let checkBoxes = document.querySelectorAll('.default-hover');
checkBoxes.forEach(element => {
    element.addEventListener('click', () => {
        showHover = true;
    });
});

// disable the hover if one of the color pickers is selected
let colorPickers = document.querySelectorAll('.no-hover');
colorPickers.forEach(element => {
    element.addEventListener('click', () => {
        showHover = false;
    });
});

// Flood fills the canvas starting at the current mouse position
function startFill(event) {

    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    CanvasState.pushUndoStack(imageData);
    CanvasState.resetRedoStack();
    let { mouseX, mouseY } = getMousePosition(event);
    // pass 128 as the range, seems kinda arbitrary? maybe not
    floodFill(mouseX, mouseY, fillColor.value, context, 128);
    context.beginPath();    // start a new path so we don't mess our other tools don't start at weird spot
}

// changes the 
function startPicker(event, pickerType) {

    // get the color at this specific pixel and use it as the new stroke color
    let { mouseX, mouseY } = getMousePosition(event);
    let colorPicked = getPixelColor(mouseX, mouseY, context);


    if (pickerType === 'stroke') { 
        strokeColor.value = colorPicked; 
        showHoverCursor(event); // update the color of the hover cursor
    }
    else if (pickerType === 'fill') { 
        fillColor.value = colorPicked; 
    }

}

function finishPicker(event) {
    // return the paint mode to brush, this should actually go back to the last selected mode
    brushCheck.checked = true;
    showHover = true;
}

// THIS SHIT IS UGLY AND BAD. How do we do it better???
function start(event) {
    if (brushCheck.checked)         { brush.start(event, strokeSlider.value, strokeColor.value); }
    else if (selectCheck.checked)   { select.start(event, 15); }
    else if (lassoCheck.checked)    { lasso.start(event); }
    else if (rectCheck.checked)     { rect.start(event, strokeSlider.value, strokeColor.value, fillColor.value); }
    else if (lineCheck.checked)     { line.start(event, strokeSlider.value, strokeColor.value); }
    else if (radialCheck.checked)   { radial.start(event, strokeSlider.value, strokeColor.value); }
    else if (circleCheck.checked)   { ell.start(event, strokeSlider.value, strokeColor.value, fillColor.value); }
    else if (polygonCheck.checked)  { poly.start(event, polygonSides.value, strokeSlider.value, strokeColor.value, fillColor.value); }
    else if (fillCheck.checked)     { startFill(event); }
    else if (fillPicker.checked)    { startPicker(event, fillPicker.value); }
    else if (strokePicker.checked)  { startPicker(event, strokePicker.value); }
}

function draw(event) {
    // if we are just hovering over the canvas without holding the mouse, show the hover
    if (!mouseDown)                 { showHoverCursor(event); }

    if (brushCheck.checked)         { brush.draw(event); }
    else if (selectCheck.checked)   { select.draw(event); }
    else if (lassoCheck.checked)    { lasso.draw(event); }
    else if (rectCheck.checked)     { rect.draw(event); } 
    else if (lineCheck.checked)     { line.draw(event); }
    else if (radialCheck.checked)   { radial.draw(event); }
    else if (circleCheck.checked)   { ell.draw(event); }
    else if (polygonCheck.checked)  { poly.draw(event); }
}

function finish(event) {
    if (brushCheck.checked)         { brush.finish(event); }
    else if (selectCheck.checked)   { select.finish(event); }
    else if (lassoCheck.checked)    { lasso.finish(event); }
    else if (rectCheck.checked)     { rect.finish(event); } 
    else if (lineCheck.checked)     { line.finish(event); }
    else if (radialCheck.checked)   { radial.finish(event); }
    else if (circleCheck.checked)   { ell.finish(event); }
    else if (polygonCheck.checked)  { poly.finish(event); }
    else if (fillPicker.checked || strokePicker.checked)   { finishPicker(event); }
}

// EVENT LISTENERS
canvas.addEventListener('mousedown', start);    
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', finish);
canvas.addEventListener('mouseenter', paintOnEnter);
canvas.addEventListener('mouseleave', clearOnLeave);
canvas.addEventListener('wheel', checkScrollDirection);

// this is a bandaid fix, i'd like to make it so that you can keep painting if you leave the window and come back. However, releasing mouse outside of the window lets you keep painting without mouse held.
document.body.onmouseleave = () => { painting = false; mouseDown = false; clearContext(previewContext); }    
document.body.onmousedown = () => { mouseDown = true; }
document.body.onmouseup = () => { mouseDown = false; } //finish(event); } // we need to call finish again to draw shapes if mouse goes up off cnavas

// when reducing screen size, any part of the canvas that gets cut off is lost with this approach
window.addEventListener('resize', () => {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    setCanvasSize();
    backgroundContext.fillStyle = backgroundColor.value;
    backgroundContext.fillRect(0, 0, canvas.width, canvas.height);  
    context.putImageData(imageData, 0, 0);
});


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

// when we leave the canvas, clear the preview hover unless we are still painting. select drawn becomes false so we can't select and move an invisible selection
function clearOnLeave() {
    if (!painting) { clearContext(previewContext); } 
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
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    CanvasState.pushUndoStack(imageData);
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function clearContext(ctx) {
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
}

function setupContext(ctx = context, strokeStyle = strokeColor.value, lineWidth = strokeSlider.value, lineCap = 'round', fillStyle = fillColor.value) {
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = lineCap;
    ctx.fillStyle = fillStyle;
}


function showHoverCursor(event) {

    // just do nothing if show hover is false
    if (!showHover) { return; }

    let { mouseX, mouseY } = getMousePosition(event);

    // clear the preview canvas anytime we move, but draw right after
    clearContext(previewContext);
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



