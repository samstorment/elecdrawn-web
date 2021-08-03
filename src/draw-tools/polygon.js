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
        this.context.beginPath();
      
        // set the start point of the rectangle to the position of the first mouse click
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        this.rectangle.setStart(mouseX, mouseY);
    }

    draw(event) { 

        super.draw(event);

        if (!this.painting) { return; }

        // get the sidebar val
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
        this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);
    
        // draw a new polygon originating from the center of the rectangle
        let poly = new Polygon(this.rectangle.startX + width/2, this.rectangle.startY + height/2);
        poly.getRegularPolygon(this.numSides, radius);
        poly.drawFill(this.context.fillStyle, this.previewContext);
        poly.drawStroke(this.context.lineWidth, this.context.strokeStyle, this.previewContext);
    
        this.rectangle.setSize(width, height);
        this.rectangle.drawStroke(2, "#000000", this.previewContext);
    }

    finish(event) {
        super.finish(event);

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
        this.previewContext.clearRect(0, 0, this.previewContext.canvas.width, this.previewContext.canvas.height);
    
        // draw a new polygon originating from the center of the rectangle
        let poly = new Polygon(this.rectangle.startX + width/2, this.rectangle.startY + height/2);
        let points = poly.getRegularPolygon(this.numSides, radius);
        poly.points = points;
        poly.drawFill(this.context.fillStyle, this.context);
        poly.drawStroke(this.context.lineWidth, this.context.strokeStyle, this.context);
    }

    setSides() {
        let polygonSides = document.querySelector('#polygon-sides');
        this.numSides = polygonSides.value;
    }
}