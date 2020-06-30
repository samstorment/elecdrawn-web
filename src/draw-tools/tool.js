import CanvasState from '../canvas/canvas-state.js';

// super class for drawing tools
export default class Tool {

    constructor(context) {
        this.context = context;
        this.painting = false;
        this.startX = -1;
        this.startY = -1;
    }

    // painting is true once we start using a tool. Push the current canvas state to the undo stack since we will be modifying it right after
    start(event) {
        this.painting = true;
        const imageData = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height);
        CanvasState.pushUndoStack(imageData);
        CanvasState.resetRedoStack();
    }

    draw(event) { 
        
    }

    // we are no longer painting when we finish
    finish(event) {
        this.painting = false;
    }
}