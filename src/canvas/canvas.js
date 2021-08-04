import { DrawTool } from '../draw-tools/draw-tools.js';
import CanvasState from '../canvas/canvas-state.js';

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

// Sidebar change listeners
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

let linecapSelect = document.querySelector('#line-caps');
linecapSelect.addEventListener('change', e => {
    context.lineCap = e.target.value;
    previewContext.lineCap = e.target.value;
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

let clearButton = document.querySelector('#canvas-clear');
clearButton.addEventListener('click', clearCanvas);

// setup the arrow dropdowns for each row
let rows = document.querySelectorAll('.sidebar-row');
rows.forEach(row => {
    const arrowButton = row.querySelector('.arrow-button');
    const subrows = row.querySelectorAll('.sidebar-subrow');

    arrowButton && arrowButton.addEventListener('click', e => {
        // toggle the arrow and display the subrow or hide it
        if (e.target.classList.contains("arrow-closed")) {
            e.target.classList.remove("arrow-closed");
            e.target.classList.add("arrow-open");
            e.target.innerHTML = `<i class="fa fa-angle-down"></i>`;
            subrows.forEach(subrow => {
                subrow.style.display = 'flex';
            });
        } else {
            e.target.classList.add("arrow-closed");
            e.target.classList.remove("arrow-open");
            e.target.innerHTML = `<i class="fa fa-angle-right"></i>`;
            subrows.forEach(subrow => {
                subrow.style.display = 'none';
            });
        }
    });
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

// manager for drawing tools
let drawTools = new DrawTool(context);

// get all of the selectable sidebar tools
let sidebarTools = document.querySelectorAll('.sidebar-radio');
sidebarTools.forEach(tool => {
    // when we click a sidebar tool, make that the selected tool
    tool.addEventListener('click', () => {
        drawTools.selectedTool = drawTools.tools[tool.value];
    });
});

let numberInputs = document.querySelectorAll('input[type="number"]');
numberInputs.forEach(input => {
    input.addEventListener('focusout', e => {
        let val = parseInt(e.target.value);
        let min = parseInt(e.target.min);
        let max = parseInt(e.target.max);
    
        if (val > max) {
            e.target.value = max;
        } else if (val < min) {
            e.target.value = min;
        }
    });
});

// Sloppy undo/redo shortcuts for now
document.onkeydown = e => {
    if (e.ctrlKey) {
        if (e.key === 'z') { CanvasState.undo(context); }
        if (e.key === 'y') { CanvasState.redo(context); }
    }
}

// MAIN DRAWING EVENT LISTENERS
canvas.addEventListener('mousedown', e => { drawTools.selectedTool.start(e); });    
canvas.addEventListener('mousemove', e => { drawTools.selectedTool.draw(e); });
canvas.addEventListener('mouseup', e => { drawTools.selectedTool.finish(e); });

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


function clearCanvas() {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    CanvasState.pushUndoStack(imageData);
    context.clearRect(0, 0, canvas.width, canvas.height);
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