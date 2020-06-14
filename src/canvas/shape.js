// super class for default shape behaviors
class Shape {
    
    // Any shape needs some starting coordinates and a context to draw to
    constructor(context, startX, startY) {
        this.context = context;
        this.startX = startX;
        this.startY = startY;
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

    // setting height equal to width by default lets us draw squares by just passing a width argument
    constructor(context, startX, startY, width, height=width) {
        super(context, startX, startY);
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

// Makes circles and ovals
export class Ellipse extends Shape {

    // these default params set us up for drawing a perfect circle
    constructor(context, startX, startY, radiusX, radiusY=radiusX, rotation=0, startAngle=0, endAngle=2*Math.PI, counterClockwise=false) {
        super(context, startX, startY);
        this.radiusX = radiusX;
        this.radiusY = radiusY;
        this.rotation = rotation;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.counterClockwise = counterClockwise;
    }

    drawFill(color) {
        super.drawFill(color);
        this.context.ellipse(this.startX, this.startY, this.radiusX, this.radiusY, this.rotation, this.startAngle, this.endAngle, this.counterClockwise);
        this.context.fill();
    }

    drawStroke(lineWeight, color) {
        super.drawStroke(lineWeight, color);
        this.context.ellipse(this.startX, this.startY, this.radiusX, this.radiusY, this.rotation, this.startAngle, this.endAngle, this.counterClockwise);
        this.context.stroke();
    }

}


export class Polygon extends Shape {
    // startX and startY here are offsets for the origin. 0, 0 will put the points exactly where you want
    // points is an array of objects where vertices would be placed
    // example triangle: [ {x: 200, y: 300}, {x: 300, y: 300}, {x: 250, y: 100} ]
    constructor(context, startX, startY, points) {
        super(context, startX, startY);
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