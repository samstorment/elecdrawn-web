import Tool from './tool.js';
import CanvasState from '../canvas/canvas-state.js';
import { getKey } from '../canvas/util.js';
import { getMouse } from '../canvas/util.js';
import { Rectangle } from '../canvas/shape.js';

// TODO:
//          keep the select box around selection after we finish moving selection so we can keep moving it if need
//          add a copy paste to selection
//          add a rotate tool to selection
//          add a delete tool for selection
export default class SelectTool extends Tool {

    constructor(context) {
        super(context);
        // init a sizeless rect, get the preview context
        this.selectDrawn = false;
        this.scaleClicked = false;
        this.select = new Rectangle(0, 0, 0);
        this.setDeleteListener();
        this.selectedImage = {};
        this.mouseStart = { x: 0, y: 0 };
    }

    startLeft(event) {
        
        // we don't call super.start because we don't want to save the canvas state to the undo stack immeditaely
        this.painting = true;

        this.context.beginPath();
        
        // set the start point of the rectangle to the position of the first mouse click
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        this.mouseStart.x = mouseX;
        this.mouseStart.y = mouseY;

        
        if (this.selectDrawn) {
            
            this.ghostContext = document.createElement("canvas").getContext('2d');
            // get the anchor we clicked inside of. Will be 0 (false) if we didn't click in one
            let anchor = this.anchors.getAnchor(mouseX, mouseY);

            // if we click outside of the select rectangle and the anchors, end the selection and clear the rectangle
            if (!this.select.isInside(mouseX, mouseY) && !anchor) {
                this.selectDrawn = false;
                this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);
                // remove the canvas state that we pushed needlessly since we didn't move the selection
                CanvasState.popUndoStack();
            } else if (anchor) {
                let { x, y } = this.anchors.getOppositeAnchor(anchor);
                this.mouseStart.x = x;
                this.mouseStart.y = y;
                this.ghostContext.canvas.width = this.selectedImage.width;
                this.ghostContext.canvas.height = this.selectedImage.height;
                this.ghostContext.putImageData(this.selectedImage, 0, 0);
                this.scaleClicked = true;
            }
        }
    }

    startMiddle(event) {
        this.startLeft(event);
    }

    startRight(event) {
        this.startLeft(event);
    }

    drawLeft(event) { 

        // get the mouse position on the canvas
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        let width = mouseX - this.mouseStart.x;
        let height = mouseY - this.mouseStart.y;
        
        // update the scale cursor if we hover an anchor, do this regardless of if we are painting
        this.updateScaleCursor(mouseX, mouseY);
        
        // if painting is false, the mouse isn't clicked so we shouldn't draw
        
        if (this.scaleClicked) {
            this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);
            
            // clear the context at the inital point where the select rect was drawn
            this.context.beginPath();
            this.context.clearRect(this.select.startX, this.select.startY, this.select.width, this.select.height);
            
            // draw the scaled select rect image from the ghost canvas to the preview to update the scaled image
            this.previewContext.drawImage(this.ghostContext.canvas, this.mouseStart.x, this.mouseStart.y, width, height)
        
            // draw the black outline of the changing scale rect
            let scaleRect = new Rectangle(this.mouseStart.x, this.mouseStart.y, width, height);
            scaleRect.drawStroke(1, '#000000', this.previewContext);
            
            // draw the anchors as we move the scale rect
            let anchors = new Anchors(scaleRect, 10);
            anchors.drawAnchors(this.previewContext, 'red');
            
            return;
        }
        
        if (!this.painting) { return; }
        
        // if the select rectangle is drawn we want to drag it, otherwise we need to draw the select rect
        if (this.selectDrawn) {
            this.dragSelectedImage(mouseX, mouseY);
        } else {
            this.drawSelectRect(width, height);
        }
    }

    finishLeft(event) {
        if (!this.painting) { return; }
        super.finishLeft(event);
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        let width = mouseX - this.mouseStart.x;
        let height = mouseY - this.mouseStart.y;

        // if we clicked and never moved our mouse, do nothing
        if (this.mouseStart.x === mouseX && this.mouseStart.y === mouseY) { return; }

        // if we are scaling the selected rect
        if (this.scaleClicked) {

            // clear the preview context so the scale rect/anchors disappear when we end
            this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);

            // draw the scaled up ghost context image to the main context
            this.context.drawImage(this.ghostContext.canvas, this.mouseStart.x, this.mouseStart.y, width, height);
            
            // reset the cursor and the ghost canvas back to their default states
            this.context.canvas.style.cursor = 'default';
        
            // remove the ghost context because we are done with it
            this.ghostContext.canvas.remove();
            
            // end the scale and the selection
            this.scaleClicked = false;
            this.selectDrawn = false;

            return;
        }

        if (this.selectDrawn) {

            // get the coords of the select rect
            let { topLeftX, topLeftY, botRightX, botRightY } = this.select.getCoords();
            // subtract the select coords from the initial mouse click coords to find the offset from the top left corner
            let imageXOffset = this.mouseStart.x - topLeftX;
            let imageYOffset = this.mouseStart.y - topLeftY;

            // clear the preview context so the we putImageData below to an empty canvas
            this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);

            // put the image to the preview context so the background color data doesnt override the main context. comment the next to lines out to see what i mean. 
            this.previewContext.putImageData(this.selectedImage, mouseX - imageXOffset, mouseY - imageYOffset);

            // draw the image data from the preview context onto the main canvas, then reset the preview context
            this.context.drawImage(this.previewContext.canvas, 0, 0);
            this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height); // clear the preview so the selection we made doesn't linger
            
            this.selectDrawn = false;
        } else {

            // create the draggable corner anchors for scaling the rectangle
            this.anchors = new Anchors(this.select, 10);
            this.anchors.drawAnchors(this.previewContext, 'red');

            
            // only do this if the select box doesn't have a size of 0
            if (this.select.width > 0 && this.select.height > 0) {
                // get the image data inside the selection rectangle that was drawn
                this.selectedImage = this.context.getImageData(this.mouseStart.x, this.mouseStart.y, this.select.width, this.select.height);
            }

            // push the current canvas state to the stack
            let imageData = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height);
            CanvasState.pushUndoStack(imageData);
            CanvasState.resetRedoStack();

            // we have just finished drawing the selection box
            this.selectDrawn = true;
        }
    }

    // drag the selected image around the screen
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

    // draw the thin black selection box to the preview context
    drawSelectRect(width, height) {
        this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);
        this.select = new Rectangle(this.mouseStart.x, this.mouseStart.y, width, height);
        this.select.drawStroke(1, '#000000', this.previewContext);
    }

    // if the select rect is drawn, check if the cursor is hovering over a scale anchor and change the cursor to a scale cursor if it is
    updateScaleCursor(mouseX, mouseY) {
        // only check the anchors if the select rect is drawn. If scale is clicked we don't check because we'd then instantly set cursor back to default
        if (this.selectDrawn && !this.scaleClicked) {
            let anchor = this.anchors.getAnchor(mouseX, mouseY);
            if (anchor === 1 || anchor === 4) { this.context.canvas.style.cursor = 'nw-resize'; }
            else if (anchor === 2 || anchor === 3) { this.context.canvas.style.cursor = 'ne-resize'; }
            else { this.context.canvas.style.cursor = 'default'; }
        }
    }

    // this is causing problems with pressing ctrl+shift+i 
    setDeleteListener() {
        let del = getKey("Delete");
        del.press = () => {
            if (this.selectDrawn) {
                this.context.clearRect(this.select.startX, this.select.startY, this.select.width, this.select.height);
                this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);
                this.context.canvas.style.cursor = 'default';
                this.selectDrawn = false;
            }
        }
    }
}

class Anchors {

    constructor(rectangle, anchorSize) {
        this.rectangle = rectangle;
        this.createAnchors(anchorSize);
    }

    // creates the 4 rectangular anchors on the base rectangle's corners
    createAnchors(anchorSize) {
        let { topLeftX, topLeftY, botRightX, botRightY } = this.rectangle.getCoords();

        this.topLeft = new Rectangle(topLeftX - anchorSize / 2, topLeftY - anchorSize / 2, anchorSize);
        this.topRight = new Rectangle(botRightX - anchorSize / 2, topLeftY - anchorSize / 2, anchorSize);
        this.botLeft = new Rectangle(topLeftX - anchorSize / 2, botRightY - anchorSize / 2, anchorSize);
        this.botRight = new Rectangle(botRightX - anchorSize / 2, botRightY - anchorSize / 2, anchorSize);
    }

    // draws the 4 rectangles with the chosen color
    drawAnchors(context, color) {
        this.topLeft.drawFill(color, context);
        this.topRight.drawFill(color, context);
        this.botLeft.drawFill(color, context);
        this.botRight.drawFill(color, context);
    }

    // returns a number corresponding to the anchor that the mouse is inside. returns 0 if mouse is in no anchor
    getAnchor(mouseX, mouseY) {

        if (this.topLeft.isInside(mouseX, mouseY))  { return 1; }
        if (this.topRight.isInside(mouseX, mouseY)) { return 2; }
        if (this.botLeft.isInside(mouseX, mouseY))  { return 3; }
        if (this.botRight.isInside(mouseX, mouseY)) { return 4; }

        return 0;
    }

    // returns the x, y coords of the diagonal opposite anchor
    getOppositeAnchor(anchorNum) {
        let { topLeftX, topLeftY, botRightX, botRightY } = this.rectangle.getCoords();
        switch(anchorNum) {
            case 1:
                return {x: botRightX, y: botRightY };
            case 2:
                return {x: topLeftX, y: botRightY };
            case 3:
                return {x: botRightX, y: topLeftY };
            case 4:
                return {x: topLeftX, y: topLeftY };
        } 
    }
}