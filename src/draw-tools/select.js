import Tool from './tool.js';
import { getMouse } from '../canvas/util.js';
import CanvasState from '../canvas/canvas-state.js';
import { Rectangle } from '../canvas/shape.js';

export default class SelectTool extends Tool {

    constructor(context) {
        super(context);
        // init a sizeless rect, get the preview context
        this.selectDrawn = false;
        this.anchorSize = 0;
        this.select = new Rectangle(0, 0, 0);
        this.selectedImage = {};
        this.mouseStart = { x: 0, y: 0 };
        this.previewContext = document.querySelector("#preview-canvas").getContext('2d');
    }

    start(event, anchorSize) {
        
        // we don't call super.start because we don't want to save the canvas state to the undo stack immeditaely
        this.painting = true;

        this.context.beginPath();
        this.anchorSize = anchorSize;
      
        // set the start point of the rectangle to the position of the first mouse click
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        this.mouseStart.x = mouseX;
        this.mouseStart.y = mouseY;

        if (this.selectDrawn) {
            // if we click outside of the select rectangle, end the selection and clear the rectangle
            if (!this.select.isInside(mouseX, mouseY)) {
                this.selectDrawn = false;
                this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);
                // remove the canvas state that we popped needlessly
                CanvasState.popUndoStack();
            }
        }
    }

    draw(event) { 
        // if painting is false, the mouse isn't clicked so we shouldn't draw
        if (!this.painting) { return; }

        // get the current mouse coordinates on the canvas
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        let width = mouseX - this.mouseStart.x;
        let height = mouseY - this.mouseStart.y;

        // if the select rectangle is drawn we want to drag it, otherwise we need to draw the select rect
        if (this.selectDrawn) {
            this.dragSelectedImage(mouseX, mouseY);
        } else {
            this.drawSelectRect(width, height);
        }
    }

    finish(event) {
        if (!this.painting) { return; }
        super.finish(event);
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);

        // if we clicked and never moved out mouse, do nothing
        if (this.mouseStart.x === mouseX && this.mouseStart.y === mouseY) { return; }

        if (this.selectDrawn) {

            // get the coords of the select rect
            let { topLeftX, topLeftY, botRightX, botRightY } = this.select.getCoords();
            // subtract the select coords from the initial mouse click coords to find the offset from the top left corner
            let imageXOffset = this.mouseStart.x - topLeftX;
            let imageYOffset = this.mouseStart.y - topLeftY;

            this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);

            // put the image to the preview context so the background color data doesnt override the main context. comment the next to lines out to see what i mean. 
            this.previewContext.putImageData(this.selectedImage, mouseX - imageXOffset, mouseY - imageYOffset);

            this.context.drawImage(this.previewContext.canvas, 0, 0);
            this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height); // clear the preview so the selection we made doesn't linger
            
            this.selectDrawn = false;
        } else {

            this.selectedImage = this.context.getImageData(this.mouseStart.x, this.mouseStart.y, this.select.width, this.select.height);

            // push the current canvas state to the stack
            let imageData = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height);
            CanvasState.pushUndoStack(imageData);
            CanvasState.resetRedoStack();

            this.selectDrawn = true;
        }
    }

    dragSelectedImage(mouseX, mouseY) {

        let { topLeftX, topLeftY, botRightX, botRightY } = this.select.getCoords();

        // we have to get these offsets so we clan click anywhere in the select square to move it.
        // the rect and image have different offsets because the image always draws from top left and the rect draws from whereever the rect's startX and startY were (which could be any of the four corners)
    
        // get the top offset from the first mouse click to the rectangle's starting point
        let rectXOffset = this.mouseStart.x - this.select.startX;
        let rectYOffset = this.mouseStart.y - this.select.startY;

        // subtract the select coords from the initial mouse click coords to set an find the offset from the top left corner
        let imageXOffset = this.mouseStart.x - topLeftX;
        let imageYOffset = this.mouseStart.y - topLeftY;

        // draw a clearRect at the exact spot where we picked up our selection so we dont copy it. Remove these 2 lines and we'll create a copy
        this.context.beginPath();
        this.context.clearRect(this.select.startX, this.select.startY, this.select.width, this.select.height);
        this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);

        // draw a rect and the selected image at the current mouse position, but account for the initial click's offset
        let rect = new Rectangle(mouseX - rectXOffset, mouseY - rectYOffset, this.select.width, this.select.height);
        rect.drawStroke(3, '#000000', this.previewContext);

        this.previewContext.putImageData(this.selectedImage, mouseX - imageXOffset, mouseY - imageYOffset);

    }

    drawSelectRect(width, height) {
        this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);
        this.select = new Rectangle(this.mouseStart.x, this.mouseStart.y, width, height);
        this.select.drawStroke(1, '#000000', this.previewContext);
    }
}