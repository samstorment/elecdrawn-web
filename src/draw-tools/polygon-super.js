import Tool from './tool.js';
import { getKey, getMouse } from '../canvas/util.js';
import { Polygon } from '../canvas/shape.js';

export default class PolygonTool extends Tool {

    constructor(context) {
        super(context);
        // init a sizeless rect for tracking the bounds of the polygon
        this.poly = new Polygon(0, 0);
        this.hover = new Polygon(0, 0);
        this.shift = getKey('Shift');
    }

    start(event) {
        super.start(event);
        // set the start point of the rectangle to the position of the first mouse click
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        this.poly = new Polygon(mouseX, mouseY);
    }

    draw(event) { 
        super.draw(event);

        if (!this.painting) { return; }

        // be sure we have the correct number of sides
        this.setSides();
        
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        let width = mouseX - this.poly.startX;
        let height = mouseY - this.poly.startY;

        // the length of our drawn line on screen
        let hypotenuse = Math.sqrt(width*width + height*height);
        let radius = hypotenuse;

        // these two lines find the real angle of our line at current mouse position
        let angle = (Math.atan2(height, width) / Math.PI * 180);
        angle = (angle) % 360 + 180;

        if (this.shift.isDown) {
            // these two lines convert the raw angle to the nearest 15 degrees
            angle = parseInt(((angle + 7.5) % 360 ) / 15 ) * 15;
            angle -= 140;

            // calculate new width and height given angle and line length
            width = radius * Math.cos(angle * Math.PI / 180);
            height = radius * Math.sin(angle * Math.PI / 180);
        }

        // clear the preview context before each draw so we don't stack polygons
        this.clear();

        // draw a new polygon originating from the center of the rectangle
        this.poly = new Polygon(this.poly.startX, this.poly.startY);
        this.poly.getRegularPolygon(this.numSides, radius, angle);
    }

    finish(event) {
        super.finish(event);

        let { mouseX, mouseY } = getMouse(event, this.context.canvas);

        // if mouse didn't move
        if (mouseX === this.poly.startX && mouseY === this.poly.startY) {
            this.drawHoverCursor(event, this.context);
            this.resetStroke();
            return;
        }

        // clear the preview context before each draw so we don't stack polygons
        this.clear();

        // this.poly.drawFill(this.context);
        // this.poly.drawStroke(this.context);
    }

    drawHoverCursor(event, context=this.previewContext) {
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        this.setSides();

        // clear the preview canvas anytime we move, but draw right after
        this.clear();
        context.beginPath();

        console.log(this.numSides);

        this.hover = new Polygon(mouseX, mouseY);
        this.hover.getRegularPolygon(this.numSides, this.context.lineWidth/2, 0);
    }

    setSides() {
        let polygonSides = document.querySelector('#polygon-sides');
        this.numSides = polygonSides.value;
    }
}