import { Rectangle, Ellipse, Polygon } from './shape.js';
import { getMousePosition } from './util.js';
import { floodFill } from './fill.js';
import { getPixelColor } from './color.js';

// starting mouse x and y coordinates when we draw squares, circles, etc 
let startX = 0;
let startY = 0;

let selectDrawn = false;
let selectedImage;
let selectRect;
let drawX = 0;
let drawY = 0;

let showHover = true;
let painting = false;
let mouseDown = false;
let shiftDown = false;
let undoStack = [];
let redoStack = [];

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
    clearPreview();
}

initCanvas();


// Sidebar buttons
let selectCheck = document.querySelector('#select-check');
let brushCheck = document.querySelector('#brush-check');
let rectCheck = document.querySelector('#rect-check');
let lineCheck = document.querySelector('#line-check');
let radialCheck = document.querySelector('#radial-check');
let circleCheck = document.querySelector('#circle-check');
let fillCheck = document.querySelector('#fill-check');
fillCheck.addEventListener('click', () => { showHover = false; });
let clearButton = document.querySelector('#canvas-clear');
clearButton.addEventListener('click', clearCanvas);
let strokeColor = document.querySelector('#stroke-color');
let strokePicker = document.querySelector('#stroke-picker');
let fillPicker = document.querySelector('#fill-picker');
let fillColor = document.querySelector('#fill-color');
let strokeSlider = document.querySelector('#stroke-slider');
let downloadCanvas = document.querySelector('#download-canvas');
downloadCanvas.addEventListener('click', function (e) {
    let dataURL = canvas.toDataURL('image/png');
    downloadCanvas.href = dataURL;
});



// THIS IS A SLOPPY UNDO AND REDO FOR NOW
document.onkeydown = e => {
    if (e.ctrlKey) {
        if (e.key === 'z') { undo(); }
        if (e.key === 'y') { redo(); }
    }
    if (e.key === 'Shift') { shiftDown = true; }
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


// TODO:    add undo/redo stack to select stuff
//          make a background canavs so you don't grab white along with selection
//          when selected, clear selection with delete key
//          keep the select box around selection after we finish moving selection so we can keep moving it if need


function startSelect(event) {
    painting = true;
    let { mouseX, mouseY } = getMousePosition(event);
    startX = mouseX;
    startY = mouseY;

    // if the select box has been drawn and then we click outside of the select rectangle, the select box is no longer drawn
    if (selectDrawn && !selectRect.isInside(mouseX, mouseY)) {
        selectDrawn = false;
    }
   
}

function drawSelect(event) {
    if (!painting) { return; }
    let { mouseX, mouseY } = getMousePosition(event);

    // if the select box is already drawn
    if (selectDrawn) {


        let { topLeftX, topLeftY, botRightX, botRightY } = selectRect.getCoords();


        // we have to get these offsets so we clan click anywhere in the select square to move it.
        // the rect and image have different offsets because the image always draws from top left and the rect draws from whereever the rect's startX and startY were (which could be any of the four corners)

        // get the top offset from the first mouse click to the rectangle's starting point
        let rectXOffset = startX - selectRect.startX;
        let rectYOffset = startY - selectRect.startY;
        // subtract the select coords from the initial mouse click coords to set an find the offset from the top left corner
        let imageXOffset = startX - topLeftX;
        let imageYOffset = startY - topLeftY;

        // we have to draw a white rect at the selectRect's location to prevent creating a duplice. Comment these two lines to see what I mean. We need to add a background canvas layer to solve this.
        let whiteRect = new Rectangle(selectRect.startX, selectRect.startY, selectRect.width, selectRect.height);
        whiteRect.drawFill('#ffffff', context);

        clearPreview(); // clear preview to update location on each move

        // draw a rect and the selected image at the current mouse position, but account for the initial click's offset
        let rect = new Rectangle(mouseX - rectXOffset, mouseY - rectYOffset, selectRect.width, selectRect.height);
        rect.drawStroke(2, '#000000', previewContext);
        previewContext.putImageData(selectedImage, mouseX - imageXOffset, mouseY - imageYOffset);
        

    } else {

        // just draw a preview rect so you know what area you're selecting
        let width = mouseX - startX;
        let height = mouseY - startY;

        // everytime we move our mouse, clear the last rectangle we drew so we only have the most up to date rectangle
        clearPreview();

        let rect = new Rectangle(startX, startY, width, height);
        rect.drawStroke(1, '#000000', previewContext);
    }
}

function finishSelect(event) {
    if (!painting) { return; }  // return so we don't draw a rect when we souldn't
    painting = false; 
    clearPreview();

    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;

    // finish after the initial draw of the select rect
    if (!selectDrawn) {

        // create a rectangle with the size drawn for the select rect, assing select rect to that rectangle so we can store its attributes.
        let rect = new Rectangle(startX, startY, width, height);
        rect.drawStroke(1, '#000000', previewContext);  // we draw the rect to the preview context so the black outline doens't disappear
        selectRect = rect;

        // some funky stuff going on here. Currently you must have started your select box in the top left corner and finish in the bottom right. I think this accounts for starting anywhere, but else where does not.
        drawX = startX; drawY = startY;
        if (startX > mouseX) { drawX = mouseX; }
        if (startY > mouseY) { drawY = mouseY; }

        // get the image at the selected coords
        selectedImage = context.getImageData(startX, startY, width, height);

        selectDrawn = true;
    } 
    // finish after the select rect has been moved
    else {
      
        // get the coords of the select rect
        let { topLeftX, topLeftY, botRightX, botRightY } = selectRect.getCoords();
        // subtract the select coords from the initial mouse click coords to find the offset from the top left corner
        let imageXOffset = startX - topLeftX;
        let imageYOffset = startY - topLeftY;
        context.putImageData(selectedImage, mouseX - imageXOffset, mouseY - imageYOffset);

        selectDrawn = false;
    }

}


// when we start, we need to know the starting coordinates of the shape
function startRect(event) {
    painting = true;
    pushImage(undoStack);   // push the current canvas to the undo stack so we can undo
    redoStack = [];         // reset the redoStack anytime we draw so we can only redo undos
    let { mouseX, mouseY } = getMousePosition(event);
    startX = mouseX;
    startY = mouseY;
}

// draw a rectangle from the start point to whereever the current mouse position is.
function drawRect(event) {

    if (!painting) { return; }
    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;
    
    // if shift is down wee need to draw a perfect square
    let maxLength;
    if (shiftDown) {
        // get the max value of the width and height. Abs because we want the pure width and height, not relative to the startX,y
        maxLength = Math.max(Math.abs(width), Math.abs(height));
        width = maxLength; height = maxLength;
        // multiply by -1 if the original width/height were negative
        if (mouseX < startX) { width *= -1; }
        if (mouseY < startY) { height *= -1; }
    }

    // everytime we move our mouse, clear the last rectangle we drew so we only have the most up to date rectangle
    clearPreview();

    let rect = new Rectangle(startX, startY, width, height);
    rect.drawFill(fillColor.value, previewContext);
    rect.drawStroke(strokeSlider.value, strokeColor.value, previewContext);
}

// do the final draw of the rectangle to the actual canvas from the start coordinates to wherever the mouse was released
function finishRect(event) {
    if (!painting) { return; }  // return so we don't draw a rect when we souldn't
    painting = false;           // when we finish, we are no longer painting

    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;

    // if shift is down wee need to draw a perfect square
    let maxLength;
    if (shiftDown) {
        maxLength = Math.max(Math.abs(width), Math.abs(height));
        width = maxLength; height = maxLength;
        if (mouseX < startX) { width *= -1; }
        if (mouseY < startY) { height *= -1; }
    }
    
    let rect = new Rectangle(startX, startY, width, height);
    rect.drawFill(fillColor.value, context);
    rect.drawStroke(strokeSlider.value, strokeColor.value, context);
}


// Flood fills the canvas starting at the current mouse position
function startFill(event) {

    pushImage(undoStack);
    redoStack = [];
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

function startEllipse(event) {
    painting = true;
    pushImage(undoStack);
    redoStack = [];
    let { mouseX, mouseY } = getMousePosition(event);
    startX = mouseX; startY = mouseY;

    setupContext();
    setupContext(previewContext); 
}


function drawEllipse(event) {
    if (!painting) { return; }
    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;


    // if shift is down wee need to draw a perfect square
    let maxLength;
    if (shiftDown) {
        maxLength = Math.max(Math.abs(width), Math.abs(height));
        width = maxLength; height = maxLength;
        if (mouseX < startX) { width *= -1; }
        if (mouseY < startY) { height *= -1; }
    }

    clearPreview(); 

    // start points are the direct center of the ellipse
    // radii are half the width and half the height of a rectangle
    let ellipse = new Ellipse(startX + width/2, startY + height/2, Math.abs(width/2), Math.abs(height/2));
    ellipse.drawFill(fillColor.value, previewContext);
    ellipse.drawStroke(strokeSlider.value, strokeColor.value, previewContext);

    // draw a rectangle around the ellipse so you can see the start and end points
    let rectangle = new Rectangle(startX, startY, width, height);
    rectangle.drawStroke(2, "#000000", previewContext);
}

// actually draw the final ellipse to the screen
function finishEllipse(event) {
    if (!painting) { return; }
    painting = false;

    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;
        
    
    // if shift is down wee need to draw a perfect square
    let maxLength;
    if (shiftDown) {
        maxLength = Math.max(Math.abs(width), Math.abs(height));
        width = maxLength; height = maxLength;
        if (mouseX < startX) { width *= -1; }
        if (mouseY < startY) { height *= -1; }
    }

    let ellipse = new Ellipse(startX + width/2, startY + height/2, Math.abs(width/2), Math.abs(height/2));
    ellipse.drawFill(fillColor.value, context);
    ellipse.drawStroke(strokeSlider.value, strokeColor.value, context);
}

// set set up the line stroke
function startBrush(event) {

    painting = true;
    pushImage(undoStack);  
    redoStack = [];
    setupContext();

    draw(event);   // this is just for drawing a single dot
}

// repeatedly draw a bunch of lines small lines to mimic a single large line
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
    // ipcRenderer.send('undo', 'cool');
}

function startLine(event) {
    painting = true;
    pushImage(undoStack);
    redoStack = [];
    let { mouseX, mouseY } = getMousePosition(event);
    startX = mouseX; startY = mouseY;

    setupContext();
    setupContext(previewContext);
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
    pushImage(undoStack);
    redoStack = [];
    let { mouseX, mouseY } = getMousePosition(event);
    startX = mouseX; startY = mouseY;
    setupContext();
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
    if (brushCheck.checked)         { startBrush(event); }
    else if (selectCheck.checked)   { startSelect(event); }
    else if (rectCheck.checked)     { startRect(event); }
    else if (lineCheck.checked)     { startLine(event); }
    else if (radialCheck.checked)   { startRadialLine(event); }
    else if (circleCheck.checked)   { startEllipse(event); }
    else if (fillCheck.checked)     { startFill(event); }
    else if (fillPicker.checked)    { startPicker(event, fillPicker.value); }
    else if (strokePicker.checked)  { startPicker(event, strokePicker.value); }
}

function draw(event) {
    // if we are just hovering over the canvas without holding the mouse, show the hover
    if (!mouseDown)                 { showHoverCursor(event); }

    if (brushCheck.checked)         { drawBrush(event); }
    else if (selectCheck.checked)   { drawSelect(event); }
    else if (rectCheck.checked)     { drawRect(event); } 
    else if (lineCheck.checked)     { drawLine(event); }
    else if (radialCheck.checked)   { drawRadialLine(event); }
    else if (circleCheck.checked)   { drawEllipse(event); }
}

function finish(event) {
    if (brushCheck.checked)         { finishBrush(event); }
    else if (selectCheck.checked)   { finishSelect(event); }
    else if (rectCheck.checked)     { finishRect(event); } 
    else if (lineCheck.checked)     { finishLine(event); }
    else if (radialCheck.checked)   { finishRadialLine(event); }
    else if (circleCheck.checked)   { finishEllipse(event); }
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
document.body.onmouseleave = () => { painting = false; mouseDown = false; clearPreview(); }    
document.body.onmousedown = () => { mouseDown = true; }
document.body.onmouseup = event => { mouseDown = false; } //finish(event); } // we need to call finish again to draw shapes if mouse goes up off cnavas

// when reducing screen size, any part of the canvas that gets cut off is lost with this approach
window.addEventListener('resize', e => {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    setCanvasSize();
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);  
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
    pushImage(undoStack);
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);    
}

function clearPreview() {
    previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
}

function setupContext(ctx = context, strokeStyle = strokeColor.value, lineWidth = strokeSlider.value, lineCap = 'round', fillStyle = fillColor.value) {
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = lineCap;
    ctx.fillStyle = fillStyle;
}

function pushImage(stack) {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    stack.push(imageData);
}



// these undo/redos need an upper bound so we don't store infinite undo/redos
let undo = () => {
    if (undoStack.length > 0) {
        const imageData = undoStack.pop();
        pushImage(redoStack);
        context.putImageData(imageData, 0, 0);
    }
}

// maybe push the contents of the redo stack to the undo stack once we start drawing somehting
let redo = () => {
    // if (!redoQueue.isEmpty()) {
    if (redoStack.length > 0) {
        const imageData = redoStack.pop();
        pushImage(undoStack);
        context.putImageData(imageData, 0, 0);
        
    }
}

function showHoverCursor(event) {

    // just do nothing if show hover is false
    if (!showHover) { return; }

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



