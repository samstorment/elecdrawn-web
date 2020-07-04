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

// starting mouse x and y coordinates when we draw squares, circles, etc 
let startX = 0;
let startY = 0;

let selectDrawn = false;
let selectedImage;
let selectRect;
let scaleClicked = false;

let clips = [];
let lassoDrawn = false;
let lassoCoords = {
    topLeftX: 100000,
    topLeftY: 100000,
    botRightX: -100000,
    botRightY: -100000
}

let showHover = true;
let painting = false;
let mouseDown = false;
let shiftDown = false;

// CANVAS - this is where drawings will show up
let canvas = document.querySelector('#canvas');
let context = canvas.getContext('2d');

// PREVIEW CANVAS - this is where shape previews will appear before the final mouse release
let previewCanvas = document.querySelector('#preview-canvas');
let previewContext = previewCanvas.getContext('2d');

let backgroundCanvas = document.querySelector('#background-canvas');
let backgroundContext = backgroundCanvas.getContext('2d');

let ghostCanvas = document.createElement('canvas');
let ghostContext = ghostCanvas.getContext('2d');

function setCanvasSize() {
    canvas.height = window.innerHeight - 70;   // subtract 80 to make room for the margin and the buttons
    canvas.width = window.innerWidth - 200 - 40;     // subtract 200 to make room for the sidebar. subtract 40 for padding-left and right
    previewCanvas.height = window.innerHeight - 70; 
    previewCanvas.width = window.innerWidth - 200 - 40; 
    backgroundCanvas.height = window.innerHeight - 70; 
    backgroundCanvas.width = window.innerWidth - 200 - 40; 
    ghostCanvas.height = window.innerHeight - 70; 
    ghostCanvas.width = window.innerWidth - 200 - 40; 
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


// THIS Sloppy keboard shortcuts for now
document.onkeydown = e => {
    if (e.ctrlKey) {
        if (e.key === 'z') { CanvasState.undo(context); }
        if (e.key === 'y') { CanvasState.redo(context); }
    }
    if (e.key === 'Shift') { shiftDown = true; }
    if (e.key === 'Delete') { 
        if (selectDrawn) { 
            context.clearRect(selectRect.startX, selectRect.startY, selectRect.width, selectRect.height); 
            clearContext(previewContext);
            selectDrawn = false;
        }
    }
}

document.onkeyup = e => {
    if (e.key === 'Shift') { shiftDown = false; }
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


// TODO:
//      Fx behavior when performing one click with no movement. If you haven't lassod yet, this prevents your next lasso from clearing the canvas when you start moving it. If you have lassod, this draws a duplicate directly on tp of the current canvas, making the lines thicker
//      end lasso when click outside of lasso area.
function startLasso(event) {

    painting = true;
    pushImage(undoStack);  
    clearRedoStack();

    let { mouseX, mouseY } = getMousePosition(event);
    startX = mouseX; startY = mouseY;

    context.beginPath();
    // we actually draw to preview and ghost so we need to specify stroke weight and color. Make the ghost weight thicker because some of the line gets cut off when we clip
    setupContext(previewContext, 'black', 1);
    setupContext(ghostContext, 'black', 3);

    // Set up for drawing lasso selection
    if (!lassoDrawn) { 
        // These 4 lines are for handling a a situation where we never dragged after drawing the lasso (like leaving the canvas after drawing)
        clips = [];         // reset any (x, y) coordinates that were drawn to the clips 
        context.restore();  // restore the canvas to its pre clipped state. otherwise we can only draw to the lasso'd area we made before cancelling the lasso
        clearContext(ghostContext); // clear the ghost context since it might contain bad data. Like the drawn lasso or an outdated version of the main canvas
        lassoCoords = { topLeftX: 100000, topLeftY: 100000, botRightX: -100000, botRightY: -100000 }; // reset the rectangle coords of the lasso

        // These 3 lines are for managing the canvas state from the start of lasso until we finish moving it
        selectedImage = context.getImageData(0, 0, canvas.width, canvas.height);    // save the current state of the canvas so we can draw it to the ghost canvas without the black lasso line
        ghostContext.drawImage(canvas, 0, 0);                                       // copy the main canvas to the ghost so we can clip the main canvas and clear it while still being able to reference the data on the ghost
        context.save();                                                             // save the current state of the context so that we can restore it after we clip it
    }

    // we need some conditional to here to actually check if the click is in the clipped area
    // if (lassoDrawn && !previewContext.isPointInPath(mouseX, mouseY))  { lassoDrawn = false; }
}

// repeatedly draw a bunch of lines small lines to mimic a single large line
function drawLasso(event) {
    if (!painting) { return; }

    let { mouseX, mouseY } = getMousePosition(event);

    if (lassoDrawn) {  

        // if no lasso was actually drawn and it was just a click. 
        // if (clips.length === 0) { lassoDrawn = false; return;  }

        // clear the preview on each frame we draw. just like any other draw 
        clearContext(previewContext);

        // get the coords of the rectangle surrounding the lasso'd selection. this lets us determine how to drag the lasso'd selection relative to our mouse position
        let { topLeftX, topLeftY, botRightX, botRightY } = lassoCoords;

        // subtract the select coords from the initial mouse click coords to find the offset from the top left corner
        let imageXOffset = startX - topLeftX;
        let imageYOffset = startY - topLeftY;

        // The context has been clipped by the lasso tool at this point in time. Completely clear everything inside the clipped area of the context
        context.clearRect(topLeftX, topLeftY, botRightX - topLeftX, botRightY - topLeftY);

        // draw the lasso'd region of the canvas to the given the current mouse positions - offsets. We use the ghost canvas since it contains the FULL canvas before we clear it in the line above
        drawClippedImgAtXY(ghostCanvas, previewContext, clips, mouseX - imageXOffset, mouseY - imageYOffset);

    } else {
        // add the current mouse drawing coords to the clips array
        clips.push( {x: mouseX, y: mouseY} );

        // this finds the lowest and highest x and y values in our lasso
        if (mouseX < lassoCoords.topLeftX) { lassoCoords.topLeftX = mouseX; }
        if (mouseX > lassoCoords.botRightX) { lassoCoords.botRightX = mouseX; }
        if (mouseY < lassoCoords.topLeftY) { lassoCoords.topLeftY = mouseY; }
        if (mouseY > lassoCoords.botRightY) { lassoCoords.botRightY = mouseY; }
    
        // Set up the line points for the clipping region. 
        context.lineTo(mouseX, mouseY);

        // Actually draw the LIVE lasso line to the preview context
        previewContext.lineTo(mouseX, mouseY);
        previewContext.stroke();

        // draw the lines to the ghost as well so we can pt the black lasso line there. This way when we move the lasso'd region, there is a black outline
        ghostContext.lineTo(mouseX, mouseY);
    }

}

function finishLasso(event) {
    if (!painting) { return; }
    painting = false;
    let { mouseX, mouseY } = getMousePosition(event);

    // line draw
    if (!lassoDrawn) {

        // close the path and draw the final line from the end point to the start point. Do the same on the ghost canvas since when we drag the preview context, we are dragging the content on the ghost canvas
        previewContext.closePath();
        previewContext.stroke();

        ghostContext.closePath();
        ghostContext.stroke(); 

        // This lets us draw only inside the clipped region of the canvas (the area we lasso'd). We can clear this area when we begin to move the lasso'd region, without clearing the whole canvas.
        context.clip();

        clearRedoStack();
        lassoDrawn = true;
    } 
    // the select and drag
    else {

        // if (clips.length === 0) { lassoDrawn = false; return; }

        // reset the ghost canvas to the state of the main canvas before we ever drew a lasso line. This gets rid of the black line when we finish moving the lasso'd area
        ghostContext.putImageData(selectedImage, 0, 0);

        // do one more DRAW call (exactly like drawLasso()) so we draw the clipped canvas region without the black lasso line
        clearContext(previewContext);
        let { topLeftX, topLeftY, botRightX, botRightY } = lassoCoords;
        let imageXOffset = startX - topLeftX;
        let imageYOffset = startY - topLeftY;
        drawClippedImgAtXY(ghostCanvas, previewContext, clips, mouseX - imageXOffset, mouseY - imageYOffset);

        // restore the canvas to its pre-clip state so that we can draw anywhere on the canvas again - not just the clipped region
        context.restore();

        // draw the lasso selection that we've stored on the previewCanvas to the main canvas
        context.drawImage(previewCanvas, 0, 0);
        
        // clear the preview so the selection we made doesn't double up (1 on the canvas, 1 on the preview canvas makes it look too thick temporarily)
        clearContext(previewContext); 

        // clear the array of clip points so we dont redraw all of the clipping points from previous lassos - just the current ones
        clips = [];

        lassoDrawn = false;
    }
}


// this does draw the clipped area at the 
function drawClippedImgAtXY(img, ctx, clipPts, x ,y) {

    let minX = lassoCoords.topLeftX;
    let minY = lassoCoords.topLeftY;

    // we need to begin and close path so we dont expand the clipping area everytime we move lasso'd selection
    ctx.beginPath();

    ctx.save();
    ctx.translate(-minX + x, -minY + y);
    ctx.moveTo(clipPts[0].x, clipPts[0].y);

    for(let i = 1; i < clipPts.length; i++) {
        ctx.lineTo(clipPts[i].x,clipPts[i].y);
    }

    ctx.clip();
    ctx.drawImage(img, 0, 0);
    
    ctx.restore();  
    ctx.closePath();

}

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
// MAIN START, DRAW, FINISH
function start(event) {
    if (brushCheck.checked)         { brush.start(event, strokeSlider.value, strokeColor.value); }
    else if (selectCheck.checked)   { select.start(event, 15); }
    else if (lassoCheck.checked)    { startLasso(event); }
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
    else if (lassoCheck.checked)    { drawLasso(event); }
    else if (rectCheck.checked)     { rect.draw(event); } 
    else if (lineCheck.checked)     { line.draw(event); }
    else if (radialCheck.checked)   { radial.draw(event); }
    else if (circleCheck.checked)   { ell.draw(event); }
    else if (polygonCheck.checked)  { poly.draw(event); }
}

function finish(event) {
    if (brushCheck.checked)         { brush.finish(event); }
    else if (selectCheck.checked)   { select.finish(event); }
    else if (lassoCheck.checked)    { finishLasso(event); }
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
document.body.onmouseup = event => { mouseDown = false; } //finish(event); } // we need to call finish again to draw shapes if mouse goes up off cnavas

// when reducing screen size, any part of the canvas that gets cut off is lost with this approach
window.addEventListener('resize', e => {
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
    if (!painting) { 
        clearContext(previewContext); 
        selectDrawn = false; 
        lassoDrawn = false; 
    } 
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



