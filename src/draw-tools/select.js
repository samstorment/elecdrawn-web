import Tool from './tool.js';
import CanvasState from '../canvas/canvas-state.js';
import { getKey } from '../canvas/util.js';
import { getMouse } from '../canvas/util.js';
import { Rectangle } from '../canvas/shape.js';

// TODO:
//          keep the select box around selection after we finish moving selection so we can keep moving it if need
//          add a copy paste to selection
//          add a rotate tool to selection
export default class SelectTool extends Tool {

    constructor(context) {
        super(context);
        // init a sizeless rect, get the preview context
        this.selectDrawn = false;
        this.scaleClicked = false;
        this.scaling = false;
        this.dragging = false;
        this.select = new Rectangle(0, 0, 0);
        this.selectedImage = {};
        this.mouseStart = { x: 0, y: 0 };
        this.setDeleteListener();
    }

    start(event) {
        // we don't call super.start because we don't want to save the canvas state to the undo stack immeditaely
        this.painting = true;
        this.ignore();
        
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
                this.clear();
                // remove the canvas state that we pushed needlessly since we didn't move the selection
                CanvasState.popUndoStack();
            } 
            // if anchor exists
            else if (anchor) {
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

    draw(event) { 

        // get the mouse position on the canvas
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        let width = mouseX - this.mouseStart.x;
        let height = mouseY - this.mouseStart.y;

        // update the scale cursor if we hover an anchor, do this regardless of if we are painting
        this.updateCursor(mouseX, mouseY);
        
        // if painting is false, the mouse isn't clicked so we shouldn't draw
        if (!this.painting) { return; }

        if (this.scaleClicked) {

            // we start scaling if we draw while scaleClicked is true
            this.scaling = true;

            this.clear();
            
            // clear the context at the inital point where the select rect was drawn
            this.context.beginPath();
            this.context.clearRect(this.select.startX, this.select.startY, this.select.width, this.select.height);
            
            // draw the scaled select rect image from the ghost canvas to the preview to update the scaled image
            this.previewContext.drawImage(this.ghostContext.canvas, this.mouseStart.x, this.mouseStart.y, width, height)
        
            // draw the black outline of the changing scale rect
            let scaleRect = new Rectangle(this.mouseStart.x, this.mouseStart.y, width, height);
            scaleRect.drawStroke(this.previewContext, 'black', 2);
            
            // draw the anchors as we move the scale rect
            let anchors = new Anchors(scaleRect, 10);
            anchors.drawAnchors(this.previewContext, 'red');
 
        }
        // if the select rectangle is drawn we want to drag it, otherwise we need to draw the select rect
        else if (this.selectDrawn) {
            this.dragSelectedImage(mouseX, mouseY);
        } else {
            this.drawSelectRect(width, height);
        }
    }

    finish(event) {
        super.finish(event);
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        let width = mouseX - this.mouseStart.x;
        let height = mouseY - this.mouseStart.y;

        // if we clicked and never moved our mouse, do nothing
        if (width === 0 && height === 0) { return; }

        // if we are scaling the selected rect
        if (this.scaleClicked) {

            // clear the preview context so the scale rect/anchors disappear when we end
            this.clear();

            // draw the scaled up ghost context image to the main context
            this.context.drawImage(this.ghostContext.canvas, this.mouseStart.x, this.mouseStart.y, width, height);
            
            // remove the ghost context because we are done with it
            this.ghostContext.canvas.remove();
            
            // end scaleClicked, scaling and the selection
            this.scaleClicked = false;
            this.scaling = false;
            this.selectDrawn = false;

        } else if (this.selectDrawn) {

            // get the coords of the select rect
            let { topLeftX, topLeftY, botRightX, botRightY } = this.select.getCoords();
            // subtract the select coords from the initial mouse click coords to find the offset from the top left corner
            let imageXOffset = this.mouseStart.x - topLeftX;
            let imageYOffset = this.mouseStart.y - topLeftY;

            // clear the preview context so the we putImageData below to an empty canvas
            this.clear();

            // put the image to the preview context so the background color data doesnt override the main context. comment the next to lines out to see what i mean. 
            this.previewContext.putImageData(this.selectedImage, mouseX - imageXOffset, mouseY - imageYOffset);
            
            // draw the image data from the preview context onto the main canvas, then reset the preview context
            this.context.drawImage(this.previewContext.canvas, 0, 0);
            this.clear();

            // we ignored opacity and shadow at the start of select, now we restore it after drawing
            this.restore();

            // select box no longer drawn and we stop dragging
            this.selectDrawn = false;
            this.dragging = false;
        } else {

            // create the draggable corner anchors for scaling the rectangle
            this.anchors = new Anchors(this.select, 10);
            this.anchors.drawAnchors(this.previewContext, 'red');

            // if the width or height is 0 we want to clear the drawn select rect and return
            if (this.select.width === 0 || this.select.height === 0) {
                return this.clear();
            }
        
            // get the image data inside the selection rectangle that was drawn
            this.selectedImage = this.context.getImageData(this.mouseStart.x, this.mouseStart.y, this.select.width, this.select.height);
           
            // push the current canvas state to the stack
            let imageData = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height);
            CanvasState.pushUndoStack(imageData);
            CanvasState.resetRedoStack();

            // we have just finished drawing the selection box
            this.selectDrawn = true;

        }
        this.updateCursor(mouseX, mouseY);
    }

    // reset anything we may have changed
    cleanup() {
        super.cleanup();
        this.selectDrawn = false;
        this.selectDrawn = false;
        this.dragging = false;
        this.scaleClicked = false;
        this.scaling = false;
        this.context.canvas.style.cursor = 'default';
        this.restore();
    }

    // drag the selected image around the screen
    dragSelectedImage(mouseX, mouseY) {

        // we start dragging
        this.dragging = true;

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
        this.clear();

        // top left coords of the dragged select rectangle
        let newTopLeftX = mouseX - rectXOffset;
        let newTopLeftY = mouseY - rectYOffset;

        // draw a rect and the selected image at the current mouse position, but account for the initial click's offset
        let rect = new Rectangle(newTopLeftX, newTopLeftY, this.select.width, this.select.height);
        rect.drawStroke(this.previewContext, 'black', 2);
        this.previewContext.putImageData(this.selectedImage, mouseX - imageXOffset, mouseY - imageYOffset);
    }

    // draw the thin black selection box to the preview context
    drawSelectRect(width, height) {
        this.clear();
        this.select = new Rectangle(this.mouseStart.x, this.mouseStart.y, width, height);
        this.select.drawStroke(this.previewContext, 'black', 2);
    }

    // if the select rect is drawn, we change to cursor to a drag arrow if hovering anchor. Move arrow if hovering select box
    updateCursor(mouseX, mouseY) {
        // only check the anchors if the select rect is drawn.
        if (this.dragging) { this.context.canvas.style.cursor = 'move'; }
        else if (this.scaling) { 
            let anchor = this.anchors.getAnchor(mouseX, mouseY);
            if (anchor === 1 || anchor === 4) { this.context.canvas.style.cursor = 'nw-resize'; }
            else if (anchor === 2 || anchor === 3) { this.context.canvas.style.cursor = 'ne-resize'; }
        }
        else if (this.selectDrawn) {
            let anchor = this.anchors.getAnchor(mouseX, mouseY);
            if (anchor === 1 || anchor === 4) { this.context.canvas.style.cursor = 'nw-resize'; }
            else if (anchor === 2 || anchor === 3) { this.context.canvas.style.cursor = 'ne-resize'; }
            else if (this.select.isInside(mouseX, mouseY)) { this.context.canvas.style.cursor = 'move'; }
            else { this.context.canvas.style.cursor = 'default'; }
        } else {
            this.context.canvas.style.cursor = 'default';
        }
    }

    setDeleteListener() {
        let del = getKey("Delete");
        del.press = () => {
            if (this.selectDrawn) {
                this.context.clearRect(this.select.startX, this.select.startY, this.select.width, this.select.height);
                this.clear();
                this.context.canvas.style.cursor = 'default';
                this.selectDrawn = false;
            }
        }
    }

    // never want to draw hover cursor for select
    drawHoverCursor() {}
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
        this.topLeft.drawFill(context, color);
        this.topRight.drawFill(context, color);
        this.botLeft.drawFill(context, color);
        this.botRight.drawFill(context, color);
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