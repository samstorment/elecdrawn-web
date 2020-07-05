import { Rectangle, Ellipse, Polygon } from './shape.js';
import { getMousePosition, undoStack, redoStack, clearRedoStack } from './util.js';
import { floodFill } from './fill.js';
import { getPixelColor } from './color.js';
import CanvasState from '../canvas/canvas-state.js';

import { DrawTool } from '../draw-tools/draw-tools.js';

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
let brushCheck = document.querySelector('#brush-check');
let polygonSides = document.querySelector('#polygon-sides');
polygonSides.addEventListener('input', () => {
    drawTools.tools.polygon.numSides = polygonSides.value;
});
let fillCheck = document.querySelector('#fill-check');
fillCheck.addEventListener('click', () => { showHover = false; });
let clearButton = document.querySelector('#canvas-clear');
clearButton.addEventListener('click', clearCanvas);
let strokeColor = document.querySelector('#stroke-color');
strokeColor.addEventListener('input', () => {
    context.strokeStyle = strokeColor.value;
    previewContext.strokeStyle = strokeColor.value;
});
let fillColor = document.querySelector('#fill-color');
fillColor.addEventListener('input', () => {
    context.fillStyle = fillColor.value;
    previewContext.fillStyle = fillColor.value;
});
let backgroundColor = document.querySelector('#background-color');
backgroundColor.addEventListener('input', () => {
    backgroundContext.fillStyle = backgroundColor.value;
    backgroundContext.fillRect(0, 0, canvas.width, canvas.height);
});
let strokeSlider = document.querySelector('#stroke-slider');
strokeSlider.addEventListener('change', () => {
    context.lineWidth = strokeSlider.value;
    previewContext.lineWidth = strokeSlider.value;
});
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
    // set the inital canvas styles
    setupContext(context);
    setupContext(previewContext);
}

initCanvas();


// manager for drawing tools
let drawTools = new DrawTool(context);
drawTools.tools.polygon.numSides = polygonSides.value;

// get all of the selectable sidebar tools
let sidebarTools = document.querySelectorAll('.sidebar-checkbox');
sidebarTools.forEach(tool => {
    // when we click a sidebar tool, make that the selected tool
    tool.addEventListener('click', () => {
        drawTools.selectedTool = drawTools.tools[tool.value];
    });
});

// Sloppy undo/redo shortcuts for now
document.onkeydown = e => {
    if (e.ctrlKey) {
        if (e.key === 'z') { CanvasState.undo(context); }
        if (e.key === 'y') { CanvasState.redo(context); }
    }
}

// changes the 
function startPicker(event, pickerType) {

    // get the color at this specific pixel and use it as the new stroke color
    let { mouseX, mouseY } = getMousePosition(event);
    let colorPicked = getPixelColor(mouseX, mouseY, context);


    if (pickerType === 'stroke') { 
        strokeColor.value = colorPicked; 
        context.strokeStyle = colorPicked;
        previewContext.strokeStyle = colorPicked;
        showHoverCursor(event); // update the color of the hover cursor
    }
    else if (pickerType === 'fill') { 
        fillColor.value = colorPicked; 
        context.fillStyle = colorPicked;
        previewContext.fillStyle = colorPicked;
    }

}

function finishPicker(event) {
    // return the paint mode to brush, this should actually go back to the last selected mode
    brushCheck.checked = true;
    showHover = true;
}


// EVENT LISTENERS
canvas.addEventListener('mousedown', e => { drawTools.selectedTool.start(e); });    
canvas.addEventListener('mousemove', e => { drawTools.selectedTool.draw(e); });
canvas.addEventListener('mouseup', e => { drawTools.selectedTool.finish(e); });
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
    setupContext(context);
    setupContext(previewContext);
    backgroundContext.fillStyle = backgroundColor.value;
    backgroundContext.fillRect(0, 0, canvas.width, canvas.height);  
    context.putImageData(imageData, 0, 0);
});

// when we leave the canvas, clear the preview hover unless we are still painting. select drawn becomes false so we can't select and move an invisible selection
function clearOnLeave() {
    if (!painting) { clearContext(previewContext); } 
}

// change the stroke weight based on scroll direction
function checkScrollDirection(event) {
    if (scrollIsUp(event))  { 
        strokeSlider.value--; 
    } 
    else { 
        strokeSlider.value++; 
    }
    context.lineWidth = strokeSlider.value;
    previewContext.lineWidth = strokeSlider.value;
    drawTools.selectedTool.drawHoverCursor(event);
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


