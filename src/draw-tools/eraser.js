import Tool from './tool.js';
import { getMouse } from '../canvas/util.js';
import { Ellipse, Rectangle } from '../canvas/shape.js';

export default class EraserTool extends Tool {

    constructor(context) {
        super(context);
    }

    // lets default to a 2 pixel black line with a round end cap
    start(event) {
        super.start(event);
        this.context.beginPath();
        this.context.globalCompositeOperation = "destination-out";
        // call draw once to draw a single dot if its a left click
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

        this.drawHoverCursor(event);
        
        // these lines help to smooth the line
        const [,space] = this.context.getLineDash();
        if (space === 0) {    
            this.context.beginPath();
            this.context.moveTo(mouseX, mouseY);
        }
    }

    drawHoverCursor(event, context=this.previewContext) {
        let { mouseX, mouseY } = getMouse(event, context.canvas);
        
        // clear the preview canvas anytime we move, but draw right after
        this.clear();
        context.beginPath();

        let radius = this.context.lineWidth / 2;

        if (context.lineCap === 'square') {
            let xStart = mouseX - radius;
            let yStart =  mouseY - radius;
    
            let rect = new Rectangle(xStart, yStart, this.context.lineWidth);
            rect.drawStroke(context, 'black', 1);
            return;
        }

        let ellipse = new Ellipse(mouseX, mouseY, radius);
        ellipse.drawStroke(context, 'black', 1);
    }

    cleanup() {
        super.cleanup();
        this.restore();
    }
}