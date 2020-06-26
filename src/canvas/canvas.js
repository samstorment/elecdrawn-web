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
let undoStack = [];
let redoStack = [];

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


// THIS Sloppy keboard shortcuts for now
document.onkeydown = e => {
    if (e.ctrlKey) {
        if (e.key === 'z') { undo(); }
        if (e.key === 'y') { redo(); }
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
//          keep the select box around selection after we finish moving selection so we can keep moving it if need
//          add a copy paste to selection
//          add a rotate tool to selection
//          add a scale tool to selection

function startSelect(event) {
    painting = true;
    let { mouseX, mouseY } = getMousePosition(event);
    startX = mouseX;
    startY = mouseY;

    // JUST THIS IF IS NEW SCALE STUFF
    if (selectDrawn) {
        // the mouse went down in the red scale rect, lets grab the selected image and prepare to scale it
        let { topLeftX, topLeftY, botRightX, botRightY } = selectRect.getCoords();
        let scaleBotRight = new Rectangle(botRightX - 7, botRightY - 7, 10, 10);
        scaleBotRight.drawFill('red', previewContext);
        if (scaleBotRight.isInside(mouseX, mouseY)) { 
            ghostContext.putImageData(selectedImage, topLeftX, topLeftY);
            scaleClicked = true;
        }
    }
    // if the select box has been drawn and then we click outside of the select rectangle, the select box is no longer drawn 
    else if (selectDrawn && !selectRect.isInside(mouseX, mouseY)) {
        selectDrawn = false;
        // pop the save we made off of the stack since we didn't do anything with it
        undoStack.pop();
    } 
   
}

function drawSelect(event) {

    let { mouseX, mouseY } = getMousePosition(event);

    // SCALE STUFF
    if (!scaleClicked && selectDrawn) {
        //  if the mouse is in the red square (the scale area) change the cursor to the scale cursor
        let { topLeftX, topLeftY, botRightX, botRightY } = selectRect.getCoords();
        let scaleBotRight = new Rectangle(botRightX - 7, botRightY - 7, 10, 10);
        scaleBotRight.drawFill('red', previewContext);
        if (scaleBotRight.isInside(mouseX, mouseY)) { 
            canvas.style.cursor = 'se-resize';
        } else {
            canvas.style.cursor = 'default';
        }
    }
    // if we started our click in the in the scale area, draw the scaled image. this doesnt work!!!!!!
    if (scaleClicked) {
        let { topLeftX, topLeftY, botRightX, botRightY } = selectRect.getCoords();
        console.log('We scalin');
        clearContext(previewContext);
        selectRect = new Rectangle(topLeftX, topLeftY, mouseX - topLeftX , mouseY - topLeftY);
        selectRect.drawStroke(1, 'black', previewContext);
        previewContext.drawImage(ghostCanvas, topLeftX, topLeftY, canvas.width + mouseX - topLeftX , canvas.height + mouseY - topLeftY);
        return;
    }
    // END SCALE STUFF


    if (!painting) { return; }

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

        // draw a clearRect at the exact spot where we picked up our selection so we dont copy it. Remove these 2 lines and we'll create a copy
        context.beginPath();
        context.clearRect(selectRect.startX, selectRect.startY, selectRect.width, selectRect.height);

        clearContext(previewContext); // clear preview to update location on each move

        // draw a rect and the selected image at the current mouse position, but account for the initial click's offset
        let rect = new Rectangle(mouseX - rectXOffset, mouseY - rectYOffset, selectRect.width, selectRect.height);
        rect.drawStroke(2, '#000000', previewContext);
        previewContext.putImageData(selectedImage, mouseX - imageXOffset, mouseY - imageYOffset);
        

    } else {

        // just draw a preview rect so you know what area you're selecting
        let width = mouseX - startX;
        let height = mouseY - startY;

        // everytime we move our mouse, clear the last rectangle we drew so we only have the most up to date rectangle
        clearContext(previewContext);

        let rect = new Rectangle(startX, startY, width, height);
        rect.drawStroke(1, '#000000', previewContext);
    }
}

function finishSelect(event) {
    if (!painting) { return; }  // return so we don't draw a rect when we souldn't
    painting = false; 
    clearContext(previewContext);

    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;

    // finish after the initial draw of the select rect
    if (!selectDrawn) {

        // create a rectangle with the size drawn for the select rect, assing select rect to that rectangle so we can store its attributes.
        let rect = new Rectangle(startX, startY, width, height);
        rect.drawStroke(1, '#000000', previewContext);  // we draw the rect to the preview context so the black outline doens't disappear
        selectRect = rect;

        let { topLeftX, topLeftY, botRightX, botRightY } = selectRect.getCoords();

        // SCALE STUFF
        let scaleBotRight = new Rectangle(botRightX - 7, botRightY - 7, 10, 10);
        scaleBotRight.drawFill('red', previewContext);
        // END

        // get the image at the selected coords
        selectedImage = context.getImageData(startX, startY, width, height);

        // push the current canvas state to the stack
        pushImage(undoStack);
        redoStack = [];

        selectDrawn = true;
    } 
    // finish after the select rect has been moved
    else {
      
        // get the coords of the select rect
        let { topLeftX, topLeftY, botRightX, botRightY } = selectRect.getCoords();
        // subtract the select coords from the initial mouse click coords to find the offset from the top left corner
        let imageXOffset = startX - topLeftX;
        let imageYOffset = startY - topLeftY;

        // put the image to the preview context so the background color data doesnt override the main context. comment the next to lines out to see what i mean. 
        previewContext.putImageData(selectedImage, mouseX - imageXOffset, mouseY - imageYOffset);
        // take the selection we just put on the preview context and put it to the main context
        context.drawImage(previewCanvas, 0, 0);
        
        clearContext(previewContext); // clear the preview so the selection we made doesn't linger
        selectDrawn = false;
        
        // SCALE STUFF
        scaleClicked = false;
        canvas.style.cursor = 'default';
    }
}


// TODO:
//      Fx behavior when performing one click with no movement. If you haven't lassod yet, this prevents your next lasso from clearing the canvas when you start moving it. If you have lassod, this draws a duplicate directly on tp of the current canvas, making the lines thicker
//      end lasso when click outside of lasso area.
function startLasso(event) {

    painting = true;
    pushImage(undoStack);  
    redoStack = [];

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

        redoStack = [];
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

// when we start, we need to know the starting coordinates of the shape
function startRect(event) {
    painting = true;
    pushImage(undoStack);   // push the current canvas to the undo stack so we can undo
    redoStack = [];         // reset the redoStack anytime we draw so we can only redo undos
    let { mouseX, mouseY } = getMousePosition(event);
    startX = mouseX;
    startY = mouseY;

    console.log(startX, startY);
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
    clearContext(previewContext);

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

    clearContext(previewContext); 

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

// this is IDENTICAL to start circle, and probably others. NEED to modularize
function startPolygon(event) {
    painting = true;
    pushImage(undoStack);
    redoStack = [];
    let { mouseX, mouseY } = getMousePosition(event);
    startX = mouseX; startY = mouseY;

    setupContext();
    setupContext(previewContext); 
}

function drawPolygon(event) {
    if (!painting) { return; }
    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;

    // because we are drawing a PERFECT square around the polygon, width and height will be the same (max of the actual width and height)
    width = height = Math.max(Math.abs(width), Math.abs(height));
    // if width or height is actually negative, lets account for that
    if (mouseX < startX) { width *= -1; }
    if (mouseY < startY) { height *= -1; }
    // the radius is half the width (diameter). This will let the polygon flip when we cross the x axis of the start origin
    let radius = height / 2;
    
    // clear on each draw frame
    clearContext(previewContext); 

    // draw a new polygon originating from the center of the rectangle
    let poly = new Polygon(startX + width/2, startY + height/2);
    let points = poly.getRegularPolygon(polygonSides.value, radius);
    poly.points = points;
    poly.drawFill(fillColor.value, previewContext);
    poly.drawStroke(strokeSlider.value, strokeColor.value, previewContext);

    // draw the outline rectangle
    let rectangle = new Rectangle(startX, startY, width, height);
    rectangle.drawStroke(2, "#000000", previewContext);
}



function finishPolygon(event) {
    if (!painting) { return; }
    painting = false;

    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;
    let height = mouseY - startY;
        
    width = height = Math.max(Math.abs(width), Math.abs(height));
    if (mouseX < startX) { width *= -1; }
    if (mouseY < startY) { height *= -1; }
    let radius = height / 2;

    // draw a new polygon originating from the center of the rectangle
    let poly = new Polygon(startX + width/2, startY + height/2);
    let points = poly.getRegularPolygon(polygonSides.value, radius);
    poly.points = points;
    poly.drawFill(fillColor.value, context);
    poly.drawStroke(strokeSlider.value, strokeColor.value, context);
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

    let width = mouseX - startX;    let height = mouseY - startY;
    let drawToX = mouseX;           let drawToY = mouseY;

    // if shift is down, draw a straight line
    if (shiftDown) {
        if (Math.abs(width) > Math.abs(height)) { drawToY = startY; } 
        else                                    { drawToX = startX; }
    }

    // clear the preview when the mouse moves
    clearContext(previewContext);

    // move the line start point to (startX, startY) then draw a line to the current drawTo position
    previewContext.moveTo(startX, startY);
    previewContext.lineTo(drawToX, drawToY);
    previewContext.stroke();

    // Need these so that the preview just draws a single line each time we move rather than all of them
    previewContext.beginPath();
    previewContext.moveTo(drawToX, drawToY);
}

// draw the final line once the mouse releases
function finishLine(event) {
    if (!painting) { return; }
    painting = false;
    let { mouseX, mouseY } = getMousePosition(event);
    let width = mouseX - startX;    let height = mouseY - startY;
    let drawToX = mouseX;           let drawToY = mouseY;

    // if shift is down, draw a straight line
    if (shiftDown) {
        if (Math.abs(width) > Math.abs(height)) { drawToY = startY; } 
        else                                    { drawToX = startX; }
    }

    // move the line start point to (startX, startY) then draw a line to the current drawTo position
    context.moveTo(startX, startY);
    context.lineTo(drawToX, drawToY);
    context.stroke();

    clearContext(previewContext); // clear the preview after drawing the last line in case we finish the line off canvas
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
    else if (lassoCheck.checked)    { startLasso(event); }
    else if (rectCheck.checked)     { startRect(event); }
    else if (lineCheck.checked)     { startLine(event); }
    else if (radialCheck.checked)   { startRadialLine(event); }
    else if (circleCheck.checked)   { startEllipse(event); }
    else if (polygonCheck.checked)  { startPolygon(event); }
    else if (fillCheck.checked)     { startFill(event); }
    else if (fillPicker.checked)    { startPicker(event, fillPicker.value); }
    else if (strokePicker.checked)  { startPicker(event, strokePicker.value); }
}

function draw(event) {
    // if we are just hovering over the canvas without holding the mouse, show the hover
    if (!mouseDown)                 { showHoverCursor(event); }

    if (brushCheck.checked)         { drawBrush(event); }
    else if (selectCheck.checked)   { drawSelect(event); }
    else if (lassoCheck.checked)    { drawLasso(event); }
    else if (rectCheck.checked)     { drawRect(event); } 
    else if (lineCheck.checked)     { drawLine(event); }
    else if (radialCheck.checked)   { drawRadialLine(event); }
    else if (circleCheck.checked)   { drawEllipse(event); }
    else if (polygonCheck.checked)  { drawPolygon(event); }
}

function finish(event) {
    if (brushCheck.checked)         { finishBrush(event); }
    else if (selectCheck.checked)   { finishSelect(event); }
    else if (lassoCheck.checked)    { finishLasso(event); }
    else if (rectCheck.checked)     { finishRect(event); } 
    else if (lineCheck.checked)     { finishLine(event); }
    else if (radialCheck.checked)   { finishRadialLine(event); }
    else if (circleCheck.checked)   { finishEllipse(event); }
    else if (polygonCheck.checked)  { finishPolygon(event); }
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
    pushImage(undoStack);
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



