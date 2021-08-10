import { DrawTool } from '../draw-tools/draw-tools.js';
import CanvasState from '../canvas/canvas-state.js';
import { backgroundColor, dashLengthInput, dashSpaceInput, fillColor, linecapSelect, lineJoinSelect, opacitySlider, shadowBlur, shadowColor, shadowOffsetX, shadowOffsetY, strokeColor, strokeSlider } from '../sidebar/sidebar.js';
import { getKey } from './util.js';

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
        if (e.button === 0) {
            throw 'error';
        } else {
            e.preventDefault();
            e.stopPropagation();
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
    // set the inital canvas styles
    setupContext(context);
    setupContext(previewContext);

    // context.globalAlpha = 0.5;
    // context.strokeRect(200, 200, 50, 50);

    const imageURL = localStorage.getItem("canvas");
    const image = new Image;
    image.src = imageURL;
    image.onload = () => {
        context.drawImage(image, 0, 0);
        // set these after or image will get more faded every time we reload page
        context.globalAlpha = opacitySlider.value;
        previewContext.globalAlpha = opacitySlider.value;
    }

})();

function setupContext(ctx = context, strokeStyle = strokeColor.value, 
    lineWidth = strokeSlider.value, lineCap = linecapSelect.value, 
    lineJoin = lineJoinSelect.value, fillStyle = fillColor.value,
    dashLength = dashLengthInput.value, dashSpace = dashSpaceInput.value,
    shadowColorStyle = shadowColor.value, shadowBlurStyle = shadowBlur.value,
    shadowX = shadowOffsetX.value, shadowY = shadowOffsetY.value) {
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = lineCap;
    ctx.fillStyle = fillStyle;
    ctx.setLineDash([dashLength, dashSpace]);
    ctx.lineJoin = lineJoin;
    ctx.shadowColor = shadowColorStyle;
    ctx.shadowBlur = shadowBlurStyle;
    ctx.shadowOffsetX = shadowX;
    ctx.shadowOffsetY = shadowY;
}


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
    drawTools.selectedTool.start(e);
});

canvas.addEventListener('mousemove', e => {
    drawTools.selectedTool.draw(e);
});

canvas.addEventListener('mouseup', e => { 
    drawTools.selectedTool.finish(e);
    // after drawing is finished, update the localstorage image
    localStorage.setItem("canvas", canvas.toDataURL());
});

// SCREEN ENTER AND LEAVE -- these don't work well in all aspects. especially leaving the canvas while drawing the lasso
canvas.addEventListener('mouseenter', e => { drawTools.selectedTool.enter(e); });
canvas.addEventListener('mouseleave', e => { drawTools.selectedTool.leave(e); });
document.body.onmouseleave = e => { drawTools.selectedTool.leave(e); }    

// disables the right click menu on the canvas
canvas.addEventListener('contextmenu', e => e.preventDefault());

// UPDATES HOVER CURSOR and ZOOM
const shift = getKey('Shift');
canvas.parentElement.addEventListener('wheel', e => {
    if (shift.isDown) {
        panzoom.zoomWithWheel(e);
    } else {
        checkScrollDirection(e);
    }
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