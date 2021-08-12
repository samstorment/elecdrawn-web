// The goal here should be to create an undo and redo stack for each canvas layer
export default class CanvasState {

    static undoStack = [];
    static redoStack = [];
    static timeout;

 
    static undo(context) {
        if (this.undoStack.length > 0) {
            const newImage = this.undoStack.pop();
            const oldImage = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
            this.redoStack.push(oldImage);
            context.putImageData(newImage, 0, 0);
            this.saveLocally(context);
        }
    }

    static redo(context) {
        if (this.redoStack.length > 0) {
            const newImage = this.redoStack.pop();
            const oldImage = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
            this.undoStack.push(oldImage);
            context.putImageData(newImage, 0, 0);
            this.saveLocally(context);
        }
    }

    static pushUndoStack(imageData) {
        this.undoStack.push(imageData);
    }

    static pushRedoStack(imageData) {
        this.redoStack.push(imageData);
    }

    static popUndoStack() {
        this.undoStack.pop();
    }

    static popRedoStack() {
        this.redoStack.pop();
    }

    static resetRedoStack() {
        this.redoStack = [];
    }

    static resetUndoStack() {
        this.undoStack = [];
    }

    // after 3 seconds of no save calls, truly save
    static saveLocally(context) {
        
        clearTimeout(this.timeout);
        
        this.timeout = setTimeout(() => {
            localStorage.setItem("canvas", context.canvas.toDataURL());
        }, 3000);
    }
}