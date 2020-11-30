import Tool from './tool.js';
import { getMouse, getKey } from '../canvas/util.js';
import { Ellipse, Rectangle } from '../canvas/shape.js';

export default class EllipseTool extends Tool {

    constructor(context) {
        super(context);
        // init a sizeless rect and ellipse, get the preview context, and get the shift key
        this.rectangle = new Rectangle(0, 0, 0);
        this.ellipse = new Ellipse(0, 0, 0);
        this.shift = getKey('Shift');
    }

    start(event) {
        super.start(event);
        this.context.beginPath();
      
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

        // if shift is down, draw a perfect circle
        if (this.shift.isDown) {
            width = height = Math.max(Math.abs(width), Math.abs(height));
            if (mouseX < this.rectangle.startX) { width *= -1; }
            if (mouseY < this.rectangle.startY) { height *= -1; }
        }
      
        // clear the preview context before each draw so we don't stack rectangles
        this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);

        // draw an ellipse based on current mouse position
        this.ellipse.setStart(this.rectangle.startX + width/2, this.rectangle.startY + height/2);
        this.ellipse.setSize(Math.abs(width/2), Math.abs(height/2));
        this.ellipse.drawFill(this.context.fillStyle, this.previewContext);
        this.ellipse.drawStroke(this.context.lineWidth, this.context.strokeStyle, this.previewContext);

        // draw a rectangle to indicate the outer bounds of the ellipse
        this.rectangle.setSize(width, height);
        this.rectangle.drawStroke(2, 'black', this.previewContext);
    }

    finish(event) {
        super.finish(event);

        // draw an ellipse with a stroke border on top of a filled ellipse
        this.ellipse.drawFill(this.context.fillStyle, this.context);
        this.ellipse.drawStroke(this.context.lineWidth, this.context.strokeStyle, this.context);
    }
}