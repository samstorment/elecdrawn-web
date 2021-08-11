import Tool from './tool.js';
import { getMouse } from '../canvas/util.js';

export default class TextTool extends Tool {

    constructor(context) {
        super(context);
    }

    // lets default to a 2 pixel black line with a round end cap
    start(event) {
        super.start(event);
        // call draw once to draw a single dot if its a left click
        this.draw(event);
        // clear the hover curson
        this.clear();
    }

    draw(event) { 
        super.draw(event);
        // if painting is false, the mouse isn't clicked so we shouldn't draw
        if (!this.painting) { return; }
        this.drawHoverCursor(event, this.context);
    }

    drawHoverCursor(event, context=this.previewContext) {
        // get the current mouse coordinates on the canvas
        let { mouseX, mouseY } = getMouse(event, context.canvas);

        context.beginPath();
        // since we reuse this for draw() we need to check if painting
        if (!this.painting) {
            this.clear(context);
        }
        const textValue = document.querySelector('#text-value').value;

        context.fillText(textValue, mouseX, mouseY);
        context.strokeText(textValue, mouseX, mouseY);
        
        const text = context.measureText(textValue);
        const underline = document.querySelector('#text-underline').classList.contains('clicked');
        if (underline) {
            this.drawLine(mouseX, mouseY, text, context);
        }
    }

    drawLine(mouseX, mouseY, text, context) {
        let x1 = mouseX;
        let x2 = mouseX + text.width;

        if (context.textAlign === 'right') {
            x2 = mouseX - text.width;
        } else if (context.textAlign === 'center') {
            x1 = mouseX + text.width / 2;
            x2 = mouseX - text.width / 2;
        }

        context.moveTo(x1, mouseY);
        context.lineTo(x2, mouseY);
        context.stroke();
    }
}