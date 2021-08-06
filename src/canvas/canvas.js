import { DrawTool } from '../draw-tools/draw-tools.js';
import CanvasState from '../canvas/canvas-state.js';
import { backgroundColor, fillColor, linecapSelect, strokeColor, strokeSlider } from '../sidebar/sidebar.js';

const width = 1920;
const height = 1080;

// CANVAS - this is where drawings will show up
let canvas = document.querySelector('#canvas');
let context = canvas.getContext('2d');

// PREVIEW CANVAS - this is where shape previews will appear before the final mouse release
let previewCanvas = document.querySelector('#preview-canvas');
let previewContext = previewCanvas.getContext('2d');

let backgroundCanvas = document.querySelector('#background-canvas');
let backgroundContext = backgroundCanvas.getContext('2d');

let canvasContainer = document.querySelector("#canvas-container");

function setCanvasSize() {
    canvas.width             = width;
    canvas.height            = height;
    previewCanvas.width      = width;
    previewCanvas.height     = height;
    backgroundCanvas.width   = width;
    backgroundCanvas.height  = height;
}

// Pan the canvas container with middle mouse button
const panzoom = Panzoom(canvasContainer, {
    handleStartEvent: e => {
        if (e.button !== 1) {
            throw 'error';
        } else {
            e.preventDefault();
        }
    },
    cursor: 'default'
});

document.querySelector('#restore-button').addEventListener('click', e => {
    panzoom.reset();
});

(function initCanvas() {
    setCanvasSize();
    backgroundContext.fillStyle = backgroundColor.value;
    backgroundContext.fillRect(0, 0, canvas.width, canvas.height);
    clearContext(previewContext);
    // set the inital canvas styles
    setupContext(context);
    setupContext(previewContext);
})();


// Sloppy undo/redo shortcuts for now
document.onkeydown = e => {
    if (e.ctrlKey) {
        if (e.key === 'z' || e.key === 'Z') { CanvasState.undo(context); }
        if (e.key === 'y' || e.key === 'Y') { CanvasState.redo(context); }
    }
}

// manager for drawing tools
let drawTools = new DrawTool(context);

// MAIN DRAWING EVENT LISTENERS
canvas.addEventListener('mousedown', e => {
    if (e.which === 1) {
        drawTools.selectedTool.startLeft(e);
    } else if (e.which === 2) {
        drawTools.selectedTool.startMiddle(e);
    } else if (e.which === 3) {
        drawTools.selectedTool.startRight(e);
    }
});

canvas.addEventListener('mousemove', e => {
    if (drawTools.selectedTool.left) {
        drawTools.selectedTool.drawLeft(e);
    } else if (drawTools.selectedTool.middle) {
        drawTools.selectedTool.drawMiddle(e);
    } else if (drawTools.selectedTool.right) {
        drawTools.selectedTool.drawRight(e);
    }
});

canvas.addEventListener('mouseup', e => { 
    if (drawTools.selectedTool.left) {
        drawTools.selectedTool.finishLeft(e);
    } else if (drawTools.selectedTool.middle) {
        drawTools.selectedTool.finishMiddle(e);
    } else if (drawTools.selectedTool.right) {
        drawTools.selectedTool.finishRight(e);
    }
});

// SCREEN ENTER AND LEAVE -- these don't work well in all aspects. especially leaving the canvas while drawing the lasso
canvas.addEventListener('mouseenter', e => { context.beginPath(); });
canvas.addEventListener('mouseleave', e => { clearContext(previewContext); });

// UPDATES HOVER CURSOR
canvas.addEventListener('wheel', checkScrollDirection);

document.body.onmouseleave = () => { clearContext(previewContext); }    

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
    // redraw the cursor as size scales up
    drawTools.selectedTool.drawHoverCursor(event);
}

// returns true if mouse scroll wheel scrolls up
function scrollIsUp(event) {
    if (event.wheelDelta) { return event.wheelDelta > 0; }
    return event.deltaY < 0;
}

function clearContext(ctx) {
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
}

function setupContext(ctx = context, strokeStyle = strokeColor.value, lineWidth = strokeSlider.value, lineCap = linecapSelect.value, fillStyle = fillColor.value) {
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = lineCap;
    ctx.fillStyle = fillStyle;
}