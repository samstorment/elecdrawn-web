import Tool from './tool.js';
import { getMouse, getKey } from '../canvas/util.js';
import { Rectangle } from '../canvas/shape.js';

export default class LineTool extends Tool {

    constructor(context) {
        super(context);
        // init a sizeless rect and get the shift key
        this.shift = getKey('Shift');
        this.rectangle = new Rectangle(0, 0, 0);
    }

    start(event) {

        super.start(event);

        this.context.beginPath();
        this.previewContext.beginPath();
      
        // we'll use a rectangle to track our line's start and size
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

        // if shift is held we want to draw a straight line from the start to the larger of the width and height
        if (this.shift.isDown) {
            if (Math.abs(width) > Math.abs(height)) { height = 0; } 
            else                                    { width = 0;  }
        }
      
        // set the rectangle's size to track current width/height
        this.rectangle.setSize(width, height);

        // clear the preview context before each draw so we don't stack rectangles
        this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);
        
        // draw the preview line to each time we move the mouse
        this.previewContext.moveTo(this.rectangle.startX, this.rectangle.startY);
        this.previewContext.lineTo(this.rectangle.startX + width, this.rectangle.startY + height);
        this.previewContext.stroke();
        
        // reset the path - get rid of this for the radial
        this.previewContext.beginPath();
    }

    finish(event) {
        super.finish(event);

        this.context.moveTo(this.rectangle.startX, this.rectangle.startY);
        this.context.lineTo(this.rectangle.startX + this.rectangle.width, this.rectangle.startY + this.rectangle.height);
        this.context.stroke();
    }
}