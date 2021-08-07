import Tool from './tool.js';
import { getMouse } from '../canvas/util.js';
import { Polygon } from '../canvas/shape.js';
import CanvasState from '../canvas/canvas-state.js';

export default class BrushFillTool extends Tool {

    constructor(context) {
        super(context);
        this.points = [];
        this.mouseStart = { x: 0, y: 0 };
        this.drawClosingLine = false;
    }

    // lets default to a 2 pixel black line with a round end cap
    start(event) {
        super.start(event);
        this.setDrawClosingLine();
        this.previewContext.beginPath();

        let { mouseX, mouseY } = getMouse(event, this.context.canvas, 105);
        this.mouseStart.x = mouseX;
        this.mouseStart.y = mouseY;

        this.draw(event);
    }

    draw(event) { 

        super.draw(event);
        // if painting is false, the mouse isn't clicked so we shouldn't draw
        if (!this.painting) { return; }

        // get the current mouse coordinates on the canvas
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);

        // start saving points for the drawn polygon
        this.points.push({x: mouseX, y: mouseY});
        
        let poly = new Polygon(0, 0, this.points);
        poly.drawFill(this.context.fillStyle, this.context);

        // draw a line to the current mouse cooridnates
        this.previewContext.lineTo(mouseX, mouseY);
        this.previewContext.stroke();

        // these two lines help to smooth the line
        this.previewContext.beginPath();
        this.previewContext.moveTo(mouseX, mouseY);
    }

    finish(event) {
        super.finish(event);

        // draw the final line from start to finish on the preview context. cant use close path because we are consistently re-beginning path
        if (this.drawClosingLine) {
            this.previewContext.lineTo(this.mouseStart.x, this.mouseStart.y)
            this.previewContext.stroke();
        }

        // draw the preview to the main canvas since the main line was drawn to the preview so it shows over the polygon fill
        this.context.drawImage(this.previewContext.canvas, 0, 0);

        // reset the points
        this.points = [];
    }

    setDrawClosingLine() {
        let checkbox = document.querySelector('#closing-line-checkbox');
        this.drawClosingLine = checkbox.checked;
    }

    // need special mouse up because we draw polygon straight to the canvas
    mouseUp() {
        document.body.addEventListener('mouseup', e => {
            // check if painting so we only fire this on mouse up outside of canvas. painting will be false inside canvas as canvas mouseup event fires first
            if (this.painting) {                
                this.painting = false;
                // clear the preview
                this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);
                // effectively clearing the main context by undoing the most recent draw to it
                CanvasState.undo(this.context);
                // clear backgrond color
                this.context.canvas.style.backgroundColor = "rgb(0,0,0,0)";
                // reset the points in the polygon
                this.points = [];
            }
        });
    }
}