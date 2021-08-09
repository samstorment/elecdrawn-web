import CanvasState from '../canvas/canvas-state.js';
import { Ellipse } from '../canvas/shape.js';
import { getMouse } from '../canvas/util.js';

// super class for drawing tools
export default class Tool {

    constructor(context) {
        this.context = context;
        this.painting = false;
        this.mouseUp();
        this.previewContext = document.querySelector("#preview-canvas").getContext('2d');
    }

    // painting is true once we start using a tool. Push the current canvas state to the undo stack since we will be modifying it right after
    start(event) {
        this.painting = true;

        // push the state to the undo stack
        const imageData = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height);
        CanvasState.pushUndoStack(imageData);
        CanvasState.resetRedoStack();
        
    }

    draw(event) { 
        if (!this.painting) {
            this.drawHoverCursor(event);
        }
    }

    // we are no longer painting when we finish
    finish(event) {
        this.painting = false;
        this.resetStroke();
    }

    leave(event) {
        // remove the hover cursor if we leave and we aren't painting
        if (!this.painting) {
            this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);
        }

        if (this.painting) {
            this.context.canvas.style.backgroundColor = "rgb(255,0,0,0.25)";
        }
    }

    enter(event) {
        this.context.beginPath();
        this.context.canvas.style.backgroundColor = "rgb(0,0,0,0)";
    }

    cleanup() {
        this.resetStroke();
        this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);
    }

    drawHoverCursor(event, context=this.previewContext) {
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);

        // clear the preview canvas anytime we move, but draw right after
        this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);
        this.previewContext.beginPath();

        let radius = this.context.lineWidth / 2;
        let ellipse = new Ellipse(mouseX, mouseY, radius);
        ellipse.drawFill(this.context.strokeStyle, context);
    }

    resetStroke() {
        const strokeWeigth = document.querySelector('#stroke-slider').value;
        const strokeColor = document.querySelector('#stroke-color').value;
        const fillColor = document.querySelector('#fill-color').value;
        // reset preview stroke color and weight
        this.previewContext.lineWidth = strokeWeigth;
        this.previewContext.strokeStyle = strokeColor;
        this.context.lineWidth = strokeWeigth;
        this.context.strokeStyle = strokeColor;
        this.context.fillStyle = fillColor;

    }

    mouseUp() {
        document.body.addEventListener('mouseup', e => {
            // check if painting because painting will be false only if we mouseup outside of the canvas
            if (this.painting) {                
                this.painting = false;
                this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);
                this.context.canvas.style.backgroundColor = "rgb(0,0,0,0)";
            }
        });
    }
}