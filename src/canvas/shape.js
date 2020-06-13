class Shape {
    constructor(startX, startY, context) {
        this.startX = startX;
        this.startY = startY;
        this.context = context;
    }

    drawFill(color) { 
        this.context.fillStyle = color; 
    }

    drawStroke(lineWeight, color) {
        this.context.lineWidth = lineWeight;
        this.context.strokeStyle = color;
    }
}


export class Rectangle extends Shape {

    constructor(startX, startY, width, height, context) {
        super(startX, startY, context);
        this.width = width;
        this.height = height;
    }

    drawFill(color) {
        super.drawFill(color);
        this.context.fillRect(this.startX, this.startY, this.width, this.height);
    }

    drawStroke(lineWeight, color) {
        super.drawStroke(lineWeight, color);
        this.context.strokeRect(this.startX, this.startY, this.width, this.height);
    }
}

export class Circle extends Shape {

    constructor(startX, startY, radius, context) {
        super(startX, startY, context);
        this.radius = radius;
    }

    drawFill(color) {
        super.drawFill(color);
        this.context.arc(this.startX, this.startY, this.radius, 0, 2 * Math.PI, true);
        this.context.fill();
    }

    drawStroke(lineWeight, color) {
        super.drawStroke(lineWeight, color);
        this.context.arc(this.startX, this.startY, this.radius, 0, 2 * Math.PI, true);
        this.context.stroke();
    }

}


export class Polygon extends Shape {

    constructor(startX, startY, points, context) {
        super(startX, startY, context);
        this.points = points;
    }

    // can be used to draw a shape with any number of sides
    drawStroke(lineWeight, color) {
        super.drawStroke(lineWeight, color);
        this.context.beginPath();

        // draw a line to each point in the array
        this.points.forEach(element => {
            this.context.lineTo(element.x, element.y);
        });
        
        // finish the path by drawing a line from end-point of last line to start-point of first line
        this.context.closePath()
        // actually put the lines on screen
        this.context.stroke();
    }
}