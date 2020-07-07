import Tool from './tool.js';
import { getMouse } from '../canvas/util.js';

export default class BrushTool extends Tool {

    constructor(context) {
        super(context);
    }

    // lets default to a 2 pixel black line with a round end cap
    start(event) {
        super.start(event);
        this.context.beginPath();
        // call draw once to draw a single dot
        this.draw(event);
    }

    draw(event) { 

        super.draw(event);
        // if painting is false, the mouse isn't clicked so we shouldn't draw
        if (!this.painting) { return; }

        // get the current mouse coordinates on the canvas
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);

        // draw a line to the current mouse cooridnates
        this.context.lineTo(mouseX, mouseY);
        this.context.stroke();

        // these two lines help to smooth the line
        this.context.beginPath();
        this.context.moveTo(mouseX, mouseY);
    }

    finish(event) {
        super.finish(event);
    }
}