import Tool from './tool.js';
import { getMouse } from '../canvas/util.js';

export default class RadialTool extends Tool {

    constructor(context) {
        super(context);
        // get the preview context, get the start point of the first mouse click
        this.mouseStart = { x: 0, y: 0 };
    }

    start(event) {

        super.start(event);

        this.context.beginPath();
       
        // we'll use a rectangle to track our line's start coords
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        this.mouseStart.x = mouseX;
        this.mouseStart.y = mouseY;
    }

    draw(event) { 
        super.draw(event);
        // if painting is false, the mouse isn't clicked so we shouldn't draw
        if (!this.painting) { return; }

        // get the current mouse coordinates on the canvas
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
      
        // draw the preview line to each time we move the mouse
        this.context.moveTo(this.mouseStart.x, this.mouseStart.y);
        this.context.lineTo(mouseX, mouseY);
        this.context.stroke();

        // makes the drawn lines look smoother
        this.context.beginPath();
        this.context.moveTo(mouseX, mouseY);
    }

    finish(event) {
        super.finish(event);
    }
}