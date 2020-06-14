// super class for default shape behaviors
class Shape {
    // Any shape needs some starting coordinates and a context to draw to
    constructor(startX, startY, context) {
        this.startX = startX;
        this.startY = startY;
        this.context = context;
    }

    // any fill will need to set the fill color
    drawFill(color) { 
        this.context.beginPath();
        this.context.fillStyle = color;
    }

    // any stroke will need to set a stroke weight and a stroke color
    drawStroke(lineWeight, color) {
        this.context.beginPath();
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

    // When params 4 and 5 of context.arc are 0 and 1*pi, we can draw a half circle.
    // there is also a 6th optional bool param that lets us draw clockwise or counter. Changing this will flip a half circle.
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

export class Ellipse extends Shape {

    constructor(startX, startY, radiusX, radiusY, rotation, context) {
        super(startX, startY, context);
        this.radiusX = radiusX;
        this.radiusY = radiusY;
        this.rotation = rotation;
    }

    // When params 4 and 5 of context.arc are 0 and 1*pi, we can draw a half circle.
    // there is also a 6th optional bool param that lets us draw clockwise or counter. Changing this will flip a half circle.
    drawFill(color) {
        super.drawFill(color);
        this.context.ellipse(this.startX, this.startY, this.radiusX, this.radiusY, Math.PI / 4, 0, 2 * Math.PI, true);
        this.context.fill();
    }

    drawStroke(lineWeight, color) {
        super.drawStroke(lineWeight, color);
        this.context.arc(this.startX, this.startY, this.radius, 0, 2 * Math.PI, true);
        this.context.stroke();
    }

}


export class Polygon extends Shape {
    // startX and startY here are offsets for the origin. 0, 0 will put the points exactly where you want
    // points is an array of objects where vertices would be placed
    // example triangle: [ {x: 200, y: 300}, {x: 300, y: 300}, {x: 250, y: 100} ]
    constructor(startX, startY, points, context) {
        super(startX, startY, context);
        this.points = points;
    }

    // can be used to draw a shape with any number of sides
    drawStroke(lineWeight, color) {
        super.drawStroke(lineWeight, color);

        // draw a line to each point in the array
        this.points.forEach(element => {
            this.context.lineTo(this.startX + element.x, this.startY + element.y);
        });
        
        // finish the path by drawing a line from end-point of last line to start-point of first line (where we began path)
        this.context.closePath()
        // actually put the lines on screen
        this.context.stroke();
    }
}