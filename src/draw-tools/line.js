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
        this.rectangle = new Rectangle(mouseX, mouseY, 0);
    }

    draw(event) { 
        super.draw(event);
        // if painting is false, the mouse isn't clicked so we shouldn't draw
        if (!this.painting) { return; }

        // get the current mouse coordinates on the canvas
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        let width = mouseX - this.rectangle.startX;
        let height = mouseY - this.rectangle.startY;

        // if shift is held we want to snap to straight lines every 15 degrees
        if (this.shift.isDown) {
            // the length of our drawn line on screen
            let hypotenuse = Math.sqrt(width*width + height*height);

            // these two lines find the real angle of our line at current mouse position
            let angle = (Math.atan2(height, width) / Math.PI * 180);
            angle = (angle) % 360 + 180;

            // these two lines convert the raw angle to the nearest 15 degrees
            angle = parseInt(((angle + 7.5) % 360 ) / 15 ) * 15;
            angle -= 180;

            // calculate new width and height given angle and line length
            width = hypotenuse * Math.cos(angle * Math.PI / 180);
            height = hypotenuse * Math.sin(angle * Math.PI / 180);
        }
      
        // set the rectangle's size to track current width/height
        this.rectangle.setSize(width, height);

        // clear the preview context before each draw so we don't stack rectangles
        this.clear();
        
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
        this.clear();
    }
}