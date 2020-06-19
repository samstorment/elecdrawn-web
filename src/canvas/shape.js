// super class for default shape behaviors
class Shape {
    
    // Any shape needs some starting coordinates
    constructor(startX, startY) {
        this.startX = startX;
        this.startY = startY;
    }

    // any fill will need to set the fill color and a context to draw to
    drawFill(color, context) { 
        context.beginPath();
        context.fillStyle = color;
    }

    // any stroke will need to set a stroke weight, stroke color, and a context to draw to
    drawStroke(lineWeight, color, context) {
        context.beginPath();
        context.lineWidth = lineWeight;    
        context.strokeStyle = color;
    }

    // returns true if the given x,y coordinate is inside of the shape
    isInside(x, y) { }
}


export class Rectangle extends Shape {

    // setting height equal to width by default lets us draw squares by just passing a width argument
    constructor(startX, startY, width, height=width) {
        super(startX, startY);
        this.width = width;
        this.height = height;
    }

    drawFill(color, context) {
        super.drawFill(color, context);
        context.fillRect(this.startX, this.startY, this.width, this.height);
    }

    drawStroke(lineWeight, color, context) {
        super.drawStroke(lineWeight, color, context);
        context.strokeRect(this.startX, this.startY, this.width, this.height);
    }

    // returns the coordinates from top left corner of the rectangle. this is different than normal startX, startY because those could be in any corner
    getCoords() {

        // assume by default that the rect started in the top left corner
        let topLeftX = this.startX;
        let topLeftY = this.startY;
        let botRightX = this.startX + this.width;
        let botRightY = this.startY + this.height;

        // if the rectX started to the right
        if (this.width < 0) { 
            topLeftX = this.startX + this.width; 
            botRightX = this.startX;
        }
        // if the rect y started to the bottom
        if (this.height < 0) { 
            topLeftY = this.startY + this.height; 
            botRightY = this.startY;
        }

        // return the normalized coordinates
        return {
            topLeftX: topLeftX,
            topLeftY: topLeftY,
            botRightX: botRightX,
            botRightY: botRightY
        }
    }

    // returns true if the given (x, y) are inside the rectangle
    isInside(x, y) { 

        let { topLeftX, topLeftY, botRightX, botRightY } = this.getCoords();

        if (!(x > topLeftX && x < botRightX && y > topLeftY && y < botRightY)) {
            return false;
        }

        return true;
    }
}

// Makes circles and ovals
export class Ellipse extends Shape {

    // these default params set us up for drawing a perfect circle
    constructor(startX, startY, radiusX, radiusY=radiusX, rotation=0, startAngle=0, endAngle=2*Math.PI, counterClockwise=false) {
        super(startX, startY);
        this.radiusX = radiusX;
        this.radiusY = radiusY;
        this.rotation = rotation;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.counterClockwise = counterClockwise;
    }

    drawFill(color, context) {
        super.drawFill(color, context);
        context.ellipse(this.startX, this.startY, this.radiusX, this.radiusY, this.rotation, this.startAngle, this.endAngle, this.counterClockwise);
        context.fill();
    }

    drawStroke(lineWeight, color, context) {
        super.drawStroke(lineWeight, color, context);
        context.ellipse(this.startX, this.startY, this.radiusX, this.radiusY, this.rotation, this.startAngle, this.endAngle, this.counterClockwise);
        context.stroke();
    }

}


export class Polygon extends Shape {
    // startX and startY here are offsets for the origin. 0, 0 will put the points exactly where you want
    // points is an array of objects where vertices would be placed
    // example triangle: [ {x: 200, y: 300}, {x: 300, y: 300}, {x: 250, y: 100} ]
    constructor(startX, startY, points) {
        super(startX, startY);
        this.points = points;
    }

    // can be used to draw a shape with any number of sides
    drawStroke(lineWeight, color, context) {
        super.drawStroke(lineWeight, color, context);

        // draw a line to each point in the array
        this.points.forEach(element => {
            context.lineTo(this.startX + element.x, this.startY + element.y);
        });
        
        // finish the path by drawing a line from end-point of last line to start-point of first line (where we began path)
        context.closePath()
        // actually put the lines on screen
        context.stroke();
    }
}