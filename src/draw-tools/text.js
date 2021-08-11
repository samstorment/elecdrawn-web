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
        this.previewContext.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    }

    draw(event) { 

        super.draw(event);
        // if painting is false, the mouse isn't clicked so we shouldn't draw
        if (!this.painting) { return; }

        this.drawHoverCursor(event, this.context);
    }

    drawHoverCursor(event, context=this.previewContext) {
        // get the current mouse coordinates on the canvas
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);

        context.beginPath();
        // since we reuse this for draw() we need to check if painting
        if (!this.painting) {
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        }
        const textValue = document.querySelector('#text-value').value;            
        context.strokeText(textValue, mouseX, mouseY);
        const text = context.measureText(textValue);
        const underline = document.querySelector('#text-underline').classList.contains('clicked');
        if (underline) {
            context.moveTo(mouseX + text.actualBoundingBoxLeft, mouseY);
            context.lineTo(mouseX + text.actualBoundingBoxRight, mouseY);
        }
        context.stroke();
    }
}