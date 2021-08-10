import Tool from './tool.js';
import { getMouse } from '../canvas/util.js';

export default class TextTool extends Tool {

    constructor(context) {
        super(context);
    }

    // lets default to a 2 pixel black line with a round end cap
    start(event) {
        super.start(event);
        this.context.beginPath();
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
        
    }

    drawHoverCursor(event) {
        // get the current mouse coordinates on the canvas
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);


        this.previewContext.textAlign = 'left';
        this.previewContext.beginPath();
        this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);
        this.previewContext.textBaseline = 'alphabetic';
        this.previewContext.font = 'small-caps italic bold 300px serif';
        this.previewContext.fillText("Hello", mouseX, mouseY);
        const text = this.previewContext.measureText('Hello 2009');
        this.previewContext.moveTo(mouseX + text.actualBoundingBoxLeft, mouseY);
        this.previewContext.lineTo(mouseX + text.actualBoundingBoxRight, mouseY);
        this.previewContext.stroke();

    }
}