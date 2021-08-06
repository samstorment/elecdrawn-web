import CanvasState from '../canvas/canvas-state.js';
import { Ellipse } from '../canvas/shape.js';
import { getMouse } from '../canvas/util.js';

// super class for drawing tools
export default class Tool {

    constructor(context) {
        this.context = context;
        this.painting = false;
        this.left = true;
        this.setStart(0, 0);
        this.previewContext = document.querySelector("#preview-canvas").getContext('2d');
    }

    // painting is true once we start using a tool. Push the current canvas state to the undo stack since we will be modifying it right after
    startLeft(event) {
        this.painting = true;
        this._setWhich(event);

        // push the state to the undo stack
        const imageData = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height);
        CanvasState.pushUndoStack(imageData);
        CanvasState.resetRedoStack();
    }

    startMiddle(event) {
        this.painting = true;
        this._setWhich(event);

        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        this.setStart(mouseX, mouseY);
    }

    startRight(event) {
        this.painting = true;
        this._setWhich(event);
    }

    drawLeft(event) { 
        if (!this.painting) {
            this.drawHoverCursor(event);
        }
    }
    
    drawMiddle(event) {
        this.drawHoverCursor(event);
    }

    drawRight(event) {
        this.drawHoverCursor(event);
    }


    // we are no longer painting when we finish
    finishLeft(event) {
        this.painting = false;
        this.resetStroke();
    }

    finishMiddle(event) {
        this.painting = false;
        // this._resetWhich();
    }

    finishRight(event) {
        this.painting = false;
        // this._resetWhich();
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

    setStart(x, y) {
        this.startX = x;
        this.startY = y;
    }

    resetStroke() {
        // reset preview stroke color and weight
        this.previewContext.lineWidth = document.querySelector('#stroke-slider').value;
        this.previewContext.strokeStyle = document.querySelector('#stroke-color').value;
    }

    _setWhich(event) {
        this.left = event.which === 1;
        this.middle = event.which === 2;
        this.right = event.which === 3;
    }
}