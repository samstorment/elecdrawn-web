import Tool from './tool.js';
import { getMouse, getKey } from '../canvas/util.js';
import { Rectangle } from '../canvas/shape.js';

export default class RectangleTool extends Tool {

    constructor(context) {
        super(context);
        // init a sizeless rect, get the preview context, and get the shift key
        this.rectangle = new Rectangle(0, 0, 0);
        this.shift = getKey('Shift');
    }

    start(event) {
        super.start(event);
        this.setRadius();
        this.context.beginPath();
        // clear the preview context like any draw
        this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);
     
        // set the start point of the rectangle to the position of the first mouse click
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        this.rectangle.setStart(mouseX, mouseY);
    }

    draw(event) { 

        super.draw(event);
        // if painting is false, the mouse isn't clicked so we shouldn't draw
        if (!this.painting) { return; }

        // get the current mouse coordinates on the canvas
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        let width = mouseX - this.rectangle.startX;
        let height = mouseY - this.rectangle.startY;

        // if shift is down, draw a perfect square
        if (this.shift.isDown) {
            width = height = Math.max(Math.abs(width), Math.abs(height));
            if (mouseX < this.rectangle.startX) { width *= -1; }
            if (mouseY < this.rectangle.startY) { height *= -1; }
        }
      
        // clear the preview context before each draw so we don't stack rectangles
        this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);

        // draw the rectangle to the preview context at its current size
        this.rectangle.setSize(width, height);
        this.rectangle.drawFill(this.context.fillStyle, this.previewContext);
        this.rectangle.drawStroke(this.context.lineWidth, this.context.strokeStyle, this.previewContext);
    }

    finish(event) {
        super.finish(event);

        // draw a rectangle with a stroke border on top of a filled rectangle
        this.rectangle.drawFill(this.context.fillStyle, this.context);
        this.rectangle.drawStroke(this.context.lineWidth, this.context.strokeStyle, this.context);
    }


    drawHoverCursor(event) {
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);

        // clear the preview canvas anytime we move, but draw right after
        this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);
        this.previewContext.beginPath();
        
        // draw a rect the size of the stroke wherever the cursor is
        let length = this.context.lineWidth;
        let xStart = mouseX-length/2; 
        let yStart =  mouseY-length/2;

        let rect = new Rectangle(xStart, yStart, length);
        rect.drawFill(this.context.strokeStyle, this.previewContext);
    }

    // for now we just have one radius input box so all radii will be the same
    setRadius() {
        let rectangleRadius = document.querySelector('#rectangle-radius');
        this.rectangle.setRadius(parseInt(rectangleRadius.value));
    }
}