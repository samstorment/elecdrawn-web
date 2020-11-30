// The goal here should be to create an undo and redo stack for each canvas layer
export default class CanvasState {

    constructor(context) {
        this.context = context;
    }

    static undoStack = [];
    static redoStack = [];

 
    static undo(context) {
        if (this.undoStack.length > 0) {
            const newImage = this.undoStack.pop();
            const oldImage = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
            this.redoStack.push(oldImage);
            context.putImageData(newImage, 0, 0);
        }
    }

    static redo(context) {
        if (this.redoStack.length > 0) {
            const newImage = this.redoStack.pop();
            const oldImage = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
            this.undoStack.push(oldImage);
            context.putImageData(newImage, 0, 0);
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
}