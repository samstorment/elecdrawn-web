import { DrawTool } from '../draw-tools/draw-tools.js';
import CanvasState from '../canvas/canvas-state.js';
import { setUp} from '../sidebar/sidebar.js';
import { shortcuts } from './shortcuts.js';

const width = 1920;
const height = 1080;

// CANVAS - this is where drawings will show up
let canvas = document.querySelector('#canvas');
let context = canvas.getContext('2d');

// PREVIEW CANVAS - this is where shape previews will appear before the final mouse release
let previewCanvas = document.querySelector('#preview-canvas');
let previewContext = previewCanvas.getContext('2d');

let backgroundCanvas = document.querySelector('#background-canvas');

let drawingArea = document.querySelector('#drawing-area');
let canvasContainer = document.querySelector("#canvas-container");
let strokeSlider = document.querySelector('#stroke-slider');

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
        // if we are on mobile, we want to be able to pan when clickable drawing area but not canvas
        if (e.pointerType === 'touch' && e.target !== canvas) {
            panzoom.setOptions({disablePan: false});
            e.preventDefault();
            e.stopPropagation();
        } else if (e.button === 0) {
            // if left click, we draw
            panzoom.setOptions({disablePan: true, cursor: 'default'});
        } else {
            // if right click or mouse button, we pan
            panzoom.setOptions({disablePan: false, cursor: 'grabbing'});
            e.preventDefault();
            e.stopPropagation();
        }
    },
    cursor: 'default',
    canvas: true,
    // origin: "0px 0px",
    // startScale: 0.5,
    // startX: 30,
    // startY: 30
});

// on zoom end make the cursor default since we make it grab while panning
canvasContainer.addEventListener('panzoomend', () => {
    panzoom.setOptions({disablePan: true, cursor: 'default'});
});

(function initCanvas() {
    setCanvasSize();

    const imageURL = localStorage.getItem("canvas");

    if (imageURL) {
        const image = new Image();
        image.src = imageURL;
        image.onload = () => {
            context.drawImage(image, 0, 0);
            // set these after or image will get more faded every time we reload page;
            setUp();
            // do this here because canvas isn't instantly correct size and this styling stands out
            backgroundCanvas.style.boxShadow = "0px 0px 200px 0px black"
        }
    } else {
        setUp();
    }

    let myFont = new FontFace(
        "Pangolin",
        "url(https://fonts.gstatic.com/s/pangolin/v6/cY9GfjGcW0FPpi-tWMfN79z4i6BH.woff2)"
      );
      
    myFont.load().then((font) => {
        document.fonts.add(font);
    });
})();

// manager for drawing tools
let drawTools = new DrawTool(context);

// Sloppy undo/redo shortcuts for now
document.onkeydown = e => {
    shortcuts(e, drawTools, context);
}

const start = e => {
    // don't want to start if we clicked sidebar
    drawTools.selectedTool.start(e);
}

const move = e => {
    drawTools.selectedTool.draw(e);
    // don't save while painting because save impacts performance
    if (drawTools.selectedTool.painting) {
        clearTimeout(CanvasState.timeout);
    }
}

const end = e => {
    // only finish if painting, otherwise finish can be called without ever starting or drawing
    if (drawTools.selectedTool.painting) {
        drawTools.selectedTool.finish(e);
        // save the canvas to local storage
        CanvasState.saveLocally(context);
    }
}

// MAIN DRAWING EVENT LISTENERS
drawingArea.addEventListener('mousedown', start);
window.addEventListener('mousemove', move);
window.addEventListener('mouseup', end);

// disables the right click menu on the canvas
canvas.addEventListener('contextmenu', e => e.preventDefault());

canvas.addEventListener('touchstart', e => {
    e.clientX = e.touches[0].pageX;
    e.clientY = e.touches[0].pageY;
    start(e);
});

canvas.addEventListener('touchmove', e => {
    e.clientX = e.touches[0].pageX;
    e.clientY = e.touches[0].pageY;
    move(e);
});

canvas.addEventListener('touchend', e => {
    e.clientX = e.changedTouches[e.changedTouches.length-1].pageX;
    e.clientY = e.changedTouches[e.changedTouches.length-1].pageY;
    end(e);
});

canvas.addEventListener('touchcancel', e => drawTools.selectedTool.leave(e));

// UPDATES HOVER CURSOR and ZOOM
canvasContainer.addEventListener('wheel', e => {

    if (e.shiftKey) {
        panzoom.zoomWithWheel(e);
        return;
    }
    
    checkScrollDirection(e);
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

document.querySelector('#restore-button').addEventListener('click', e => {
    panzoom.reset();
});

document.querySelector('#zoom-in-button').addEventListener('click', e => {
    panzoom.zoomIn();
});

document.querySelector('#zoom-out-button').addEventListener('click', e => {
    panzoom.zoomOut();
});