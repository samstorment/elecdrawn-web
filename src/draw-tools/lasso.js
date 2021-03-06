import Tool from './tool.js';
import CanvasState from '../canvas/canvas-state.js';
import { getKey, getMouse } from '../canvas/util.js';

export default class LassoTool extends Tool {

    constructor(context) {
        super(context);
        
        this.lassoDrawn = false;
        this.points = [];
        this.mouseStart = { x: 0, y: 0 };
        this.lassoCoords = { topLeftX: 100000, topLeftY: 100000, botRightX: -100000, botRightY: -100000 };
        this.selectedImage = {};
        this.setDeleteListener();
    }

    start(event) {

        super.start(event);

        // set up the preview context
        this.previewContext.lineWidth = 1;
        this.previewContext.strokeStyle = 'black';

        // set opacity and shadow to default values
        this.ignore();
      
        // set the start point of the rectangle to the position of the first mouse click
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        this.mouseStart.x = mouseX;
        this.mouseStart.y = mouseY;

        // if the lasso is drawn and we dont click inside the lassoed area
        if (this.lassoDrawn && !this.mouseInLasso(mouseX, mouseY)) {
            this.lassoDrawn = false;
            this.clear();
            this.context.restore();
            this.points = [];
        }

        if (!this.lassoDrawn) {
            // create the ghost canvas at the canvas size each time we draw
            this.ghostContext = document.createElement("canvas").getContext('2d');
            this.ghostContext.canvas.width = this.context.canvas.width;
            this.ghostContext.canvas.height = this.context.canvas.height;

            // These 3 lines are for managing the canvas state from the start of lasso until we finish moving it
            this.selectedImage = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height); // save the current state of the canvas so we can draw it to the ghost canvas without the black lasso line
            this.ghostContext.drawImage(this.context.canvas, 0, 0);     // copy the main canvas to the ghost so we can clip the main canvas and clear it while still being able to reference the data on the ghost
            this.context.save();    // save the current state of the context so that we can restore it after we clip it
            
        }
        // reset the path from the last lasso selection for the context and preview context
        this.context.beginPath();
        this.previewContext.beginPath();
    }

    draw(event) { 

        super.draw();

        // get the current mouse coordinates on the canvas
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
 
        if (this.lassoDrawn && this.mouseInLasso(mouseX, mouseY)) {
            this.context.canvas.style.cursor = "move";
        } else {
            this.context.canvas.style.cursor = "default";
        }

        // if painting is false, the mouse isn't clicked so we shouldn't draw
        if (!this.painting) { return; }
        
        
        if (this.lassoDrawn) {

            // clear the preview context like any draw
            this.clear();

            // get the coords of the rectangle surrounding the lasso'd selection. this lets us determine how to drag the lasso'd selection relative to our mouse position
            let { topLeftX, topLeftY, botRightX, botRightY } = this.lassoCoords;

            // subtract the select coords from the initial mouse click coords to find the offset from the top left corner
            let imageXOffset = this.mouseStart.x - topLeftX;
            let imageYOffset = this.mouseStart.y - topLeftY;

            // The context has been clipped by the lasso tool at this point in time. Completely clear everything inside the clipped area of the context
            this.context.clearRect(topLeftX, topLeftY, botRightX - topLeftX, botRightY - topLeftY);

            // draw the lasso'd region of the canvas to the given the current mouse positions - offsets. We use the ghost canvas since it contains the FULL canvas before we clear it in the line above
            this.drawClippedImage(this.ghostContext.canvas, this.previewContext, this.points, mouseX - imageXOffset, mouseY - imageYOffset);
        
            // reset back to normal stroke weight and color
            this.resetStroke();
        } else {
            // add the current mouse drawing coords to the points array
            this.points.push( {x: mouseX, y: mouseY} );

            // this finds the lowest and highest x and y values in our lasso
            if (mouseX < this.lassoCoords.topLeftX) { this.lassoCoords.topLeftX = mouseX; }
            if (mouseX > this.lassoCoords.botRightX) { this.lassoCoords.botRightX = mouseX; }
            if (mouseY < this.lassoCoords.topLeftY) { this.lassoCoords.topLeftY = mouseY; }
            if (mouseY > this.lassoCoords.botRightY) { this.lassoCoords.botRightY = mouseY; }

            // Set up the line points for the clipping region. 
            this.context.lineTo(mouseX, mouseY);

            // Actually draw the LIVE lasso line to the preview context
            this.previewContext.lineTo(mouseX, mouseY);
            this.previewContext.stroke();

            // draw the lines to the ghost as well so we can pt the black lasso line there. This way when we move the lasso'd region, there is a black outline
            this.ghostContext.lineTo(mouseX, mouseY);
        }
    }

    finish(event) {

        if (!this.painting) { return; }
        this.painting = false;

        // get the current mouse coordinates on the canvas
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);

        // if we clicked and never moved our mouse, do nothing
        if (this.mouseStart.x === mouseX && this.mouseStart.y === mouseY) { return; }

        if (this.lassoDrawn) {

            // reset the ghost canvas to the state of the main canvas before we ever drew a lasso line. This gets rid of the black line when we finish moving the lasso'd area
            this.ghostContext.putImageData(this.selectedImage, 0, 0);

            // do one more DRAW call (exactly like drawLasso()) so we draw the clipped canvas region without the black lasso line
            this.clear();
            let { topLeftX, topLeftY, botRightX, botRightY } = this.lassoCoords;
            let imageXOffset = this.mouseStart.x - topLeftX;
            let imageYOffset = this.mouseStart.y - topLeftY;
            this.drawClippedImage(this.ghostContext.canvas, this.previewContext, this.points, mouseX - imageXOffset, mouseY - imageYOffset);

            // restore the canvas to its pre-clip state so that we can draw anywhere on the canvas again - not just the clipped region
            this.context.restore();

            // draw the lasso selection that we've stored on the previewCanvas to the main canvas
            this.context.drawImage(this.previewContext.canvas, 0, 0);
            
            // clear the preview so the selection we made doesn't double up (1 on the canvas, 1 on the preview canvas makes it look too thick temporarily)
            this.clear();

            // set alpha and shadow back to user selected values since we ignored it at start
            this.restore();

            // clear the array of clip points so we dont redraw all of the clipping points from previous lassos - just the current ones
            this.points = [];

            // get rid of the ghost canvas since we are done with the lasso
            this.ghostContext.canvas.remove();

            this.lassoDrawn = false;

        } else {
            // close the path and draw the final line from the end point to the start point. Do the same on the ghost canvas since when we drag the preview context, we are dragging the content on the ghost canvas
            this.previewContext.closePath();
            this.previewContext.stroke();

            this.ghostContext.closePath();
            this.ghostContext.stroke(); 

            // close the path so we can determine if mouse is in the clipper region of the path
            this.previewContext.closePath();

            // This lets us draw only inside the clipped region of the canvas (the area we lasso'd). We can clear this area when we begin to move the lasso'd region, without clearing the whole canvas.
            this.context.clip();

            // when we finish drawing somehting, we reset the redo stack for all tools
            CanvasState.resetRedoStack();
            this.lassoDrawn = true;
        }
    }

    cleanup() {
        super.cleanup();
        // lasso is no longer drawn
        this.lassoDrawn = false;
        // reset lasso points
        this.points = [];
        // restore the full context since we clipped it to the lasso region
        this.context.restore();
        // fix the shadow and opacity
        this.restore();
    }

    // this does draw the clipped area at the 
    drawClippedImage(img, ctx, clipPts, x ,y) {

        let minX = this.lassoCoords.topLeftX;
        let minY = this.lassoCoords.topLeftY;

        // we need to begin and close path so we dont expand the clipping area everytime we move lasso'd selection
        ctx.beginPath();

        ctx.save();
        ctx.translate(-minX + x, -minY + y);
        ctx.moveTo(clipPts[0].x, clipPts[0].y);

        for(let i = 1; i < clipPts.length; i++) {
            ctx.lineTo(clipPts[i].x,clipPts[i].y);
        }

        ctx.clip();
        ctx.drawImage(img, 0, 0);
        
        ctx.restore();  
        ctx.closePath();
    }

    setDeleteListener() {
        let del = getKey("Delete");
        del.press = () => {
            if (this.lassoDrawn) {
                this.clear(this.context);
                this.lassoDrawn = false;
                this.cleanup();
            }
        }
    }

    mouseInLasso(x, y) {
        return this.previewContext.isPointInPath(x, y);
    }

    // never want to draw a hover cursor for lasso
    drawHoverCursor() {}
}