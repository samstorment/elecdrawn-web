import CanvasState from '../canvas/canvas-state.js';
import { Ellipse } from '../canvas/shape.js';
import { getMouse } from '../canvas/util.js';

// super class for drawing tools
export default class Tool {

    constructor(context) {
        this.context = context;
        this.painting = false;
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

    drawHoverCursor(event) {
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);

        // clear the preview canvas anytime we move, but draw right after
        this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);
        this.previewContext.beginPath();

        let radius = this.context.lineWidth / 2;
        let ellipse = new Ellipse(mouseX, mouseY, radius);
        ellipse.drawFill(this.context.strokeStyle, this.previewContext);
    }

    resetStroke() {
        // reset preview stroke color and weight
        this.previewContext.lineWidth = document.querySelector('#stroke-slider').value;
        this.previewContext.strokeStyle = document.querySelector('#stroke-color').value;
    }
}