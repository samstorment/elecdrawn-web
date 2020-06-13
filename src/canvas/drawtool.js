import { getMousePosition } from './util.js';

export class DrawTool {

    constructor() {

    }

    drawFill() {};
    drawStroke() {};
    start() {};
    draw() {};
    finish() {};
}

export class Rectangle extends DrawTool {

    constructor() {
        super();
    }

    drawFill(startX, startY, width, height, color, context) {
        context.fillStyle = color;
        context.fillRect(startX, startY, width, height);
    }

    drawStroke(startX, startY, width, height, lineWeight, color, context) {
        context.strokeStyle = color;
        context.lineWidth = lineWeight;
        context.strokeRect(startX, startY, width, height);
    }
}

export class Circle extends DrawTool {

    constructor() {
        super();
    }

    drawFill(startX, startY, radius, color, context) {
        context.fillStyle = color;
        context.arc(startX, startY, radius, 0, 2 * Math.PI, true);
        context.fill();
    }

    drawStroke(startX, startY, radius, lineWeight, color, context) {
        context.strokeStyle = color;
        context.lineWidth = lineWeight;
        context.arc(startX, startY, radius, 0, 2 * Math.PI, true);
        context.stroke();
    }

}

export class Brush extends DrawTool {
    constructor() {
        
    }
}

export class Line extends DrawTool {
    constructor() {

    }
}

export class Radial extends DrawTool {
    constructor() {

    }
}


export class Polygon extends DrawTool {

    constructor() {

    }

    // can be used to draw a shape with any number of sides
    drawStroke(points, lineWeight, color, context) {
        context.strokeStyle = color;
        context.lineWidth = lineWeight;
        context.beginPath();

        // draw a line to each point in the array
        points.forEach(element => {
            context.lineTo(element.x, element.y);
        });
        
        // finish the path by drawing a line from end-point of last line to start-point of first line
        context.closePath()
        // actually put the lines on screen
        context.stroke();
    }
}