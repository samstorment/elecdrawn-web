import Tool from './tool.js';
import { getMouse } from '../canvas/util.js';

export default class RadialTool extends Tool {

    constructor(context) {
        super(context);
        this.didPaint = false;
        this.startX = 0;
        this.startY = 0;
    }

    start(event) {
        super.start(event);

        this.context.beginPath();
       
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        this.startX = mouseX;
        this.startY = mouseY;

        // draw a single dot
        this.draw(event);
        // clear the hover cursor
        this.clear();
    }

    draw(event) { 
        super.draw(event);

        if (!this.painting) return;

        // get the current mouse coordinates on the canvas
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
      
        // draw the preview line to each time we move the mouse
        this.context.moveTo(this.startX, this.startY);
        this.context.lineTo(mouseX, mouseY);
        this.context.stroke();

        // makes the drawn lines look smoother
        this.context.beginPath();
        this.context.moveTo(mouseX, mouseY);
    }
}