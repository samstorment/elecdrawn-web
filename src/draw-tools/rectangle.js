import Tool from './tool.js';
import { getMouse, getKey } from '../canvas/util.js';
import { Rectangle } from '../canvas/shape.js';

export default class RectangleTool extends Tool {

    constructor(context) {
        super(context);
        // init a sizeless rect, get the preview context, and get the shift key
        this.rectangle = new Rectangle(0, 0, 0);
        this.previewContext = document.querySelector("#preview-canvas").getContext('2d');
        this.shift = getKey('Shift');
    }

    start(event, lineWidth=2, strokeStyle='#000000', fillStyle='#ff0000') {
        super.start(event);
        this.context.beginPath();
        this.context.lineWidth = lineWidth;
        this.context.strokeStyle = strokeStyle;
        this.context.fillStyle = fillStyle;
      
        // set the start point of the rectangle to the position of the first mouse click
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        this.rectangle.setStart(mouseX, mouseY);
    }

    draw(event) { 
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
}