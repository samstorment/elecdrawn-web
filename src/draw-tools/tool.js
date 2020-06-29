import { undoStack, clearRedoStack } from "../canvas/util.js";

// super class for drawing tools
export default class Tool {

    constructor(context) {
        this.context = context;
        this.painting = false;
    }

    // painting is true once we start using a tool. Push the current canvas state to the undo stack since we will be modifying it right after
    start(event) {
        this.painting = true;
        const imageData = this.context.getImageData(0, 0, canvas.width, canvas.height);
        undoStack.push(imageData);
        clearRedoStack();
    }

    draw(event) { 
        
    }

    // we are no longer painting when we finish
    finish(event) {
        this.painting = false;
    }

}