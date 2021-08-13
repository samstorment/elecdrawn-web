import Tool from './tool.js';
import { getMouse } from '../canvas/util.js';
import { Rectangle, Polygon } from '../canvas/shape.js';

export default class PolygonTool extends Tool {

    constructor(context) {
        super(context);
        // init a sizeless rect for tracking the bounds of the polygon
        this.rectangle = new Rectangle(0, 0, 0);
    }

    start(event) {
        super.start(event);
      
        // set the start point of the rectangle to the position of the first mouse click
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        this.rectangle = new Rectangle(mouseX, mouseY, 0);
    }

    draw(event) { 
        super.draw(event);

        if (!this.painting) { return; }

        // be sure we have the correct number of sides
        this.setSides();
        
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        let width = mouseX - this.rectangle.startX;
        let height = mouseY - this.rectangle.startY;

        // because we are drawing a PERFECT square around the polygon, width and height will be the same (max of the actual width and height)
        width = height = Math.max(Math.abs(width), Math.abs(height));
        // if width or height is actually negative, lets account for that
        if (mouseX < this.rectangle.startX) { width *= -1; }
        if (mouseY < this.rectangle.startY) { height *= -1; }
        // the radius is half the width (diameter). This will let the polygon flip when we cross the x axis of the start origin
        let radius = height / 2;

        // clear the preview context before each draw so we don't stack polygons
        this.clear();

        // draw a new polygon originating from the center of the rectangle
        let poly = new Polygon(this.rectangle.startX + width/2, this.rectangle.startY + height/2);
        poly.getRegularPolygon(this.numSides, radius);
        poly.drawFill(this.previewContext);
        poly.drawStroke(this.previewContext);
    
        this.rectangle.setSize(width, height);
        this.rectangle.drawStroke(this.previewContext, 'black', 2);
    }

    finish(event) {
        super.finish(event);

        let width = this.rectangle.width;
        let height = this.rectangle.height;

        // if mouse didn't move
        if (width === 0 && height === 0) {
            this.drawHoverCursor(event, this.context);
            this.resetStroke();
            return;
        }

        // because we are drawing a PERFECT square around the polygon, width and height will be the same (max of the actual width and height)
        width = height = Math.max(Math.abs(width), Math.abs(height));
        // if width or height is actually negative, lets account for that
        if (this.rectangle.width < 0) { width *= -1; }
        if (this.rectangle.height < 0) { height *= -1; }
        // the radius is half the width (diameter). This will let the polygon flip when we cross the x axis of the start origin
        let radius = height / 2;

        // clear the preview context before each draw so we don't stack polygons
        this.clear();
        // draw a new polygon originating from the center of the rectangle
        let poly = new Polygon(this.rectangle.startX + width/2, this.rectangle.startY + height/2);
        poly.getRegularPolygon(this.numSides, radius);
        poly.drawFill(this.context);
        poly.drawStroke(this.context);
    }

    drawHoverCursor(event, context=this.previewContext) {
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        this.setSides();

        // clear the preview canvas anytime we move, but draw right after
        this.clear();
        this.previewContext.beginPath();

        let radius = this.context.lineWidth / 2;

        let poly = new Polygon(mouseX, mouseY);
        poly.getRegularPolygon(this.numSides, radius);
        poly.drawFill(context, context.strokeStyle);
    }

    setSides() {
        let polygonSides = document.querySelector('#polygon-sides');
        this.numSides = polygonSides.value;
    }
}