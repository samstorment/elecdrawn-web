import { getFillColor, getStrokeColor } from "./color.js";

// super class for default shape behaviors
class Shape {
    
    // Any shape needs some starting coordinates
    constructor(startX, startY) {
        this.startX = startX;
        this.startY = startY;
    }

    drawFill(context, color) {
        context.beginPath();
        context.fillStyle = color || getFillColor();
    }

    drawStroke(context, color, lineWidth) {
        context.beginPath();
        context.strokeStyle = color || getStrokeColor();
        context.lineWidth = lineWidth || this.getLineWidth();
    }

    getLineWidth() {
        return document.querySelector('#stroke-slider').value;
    }

    // returns true if the given x,y coordinate is inside of the shape
    isInside(x, y) { }
}


export class Rectangle extends Shape {

    // setting height equal to width by default lets us draw squares by just passing a width argument
    constructor(startX, startY, width, height=width, radius=0) {
        super(startX, startY);
        this.width = width;
        this.height = height;
        this.setRadius(radius);
    }

    drawFill(context, color) {
        super.drawFill(context, color);
        this._draw(context);
        context.fill();
    }

    drawStroke(context, color, lineWidth) {
        super.drawStroke(context, color, lineWidth);
        this._draw(context);
        context.stroke();
    }

    _draw(context) {
        context.beginPath();

        // start in the top left corner of the rectangle
        context.moveTo(this.startX + this.radius.tl, this.startY);

        // draw a line to each corner and a quadratic for the radius if the radius isn't 0 don't draw the quadratic
        context.lineTo(this.startX + this.width - this.radius.tr, this.startY);
        this.radius.tr !== 0 && context.quadraticCurveTo(this.startX + this.width, this.startY, this.startX + this.width, this.startY + this.radius.tr);

        context.lineTo(this.startX + this.width, this.startY + this.height - this.radius.br);
        this.radius.br !== 0 && context.quadraticCurveTo(this.startX + this.width, this.startY + this.height, this.startX + this.width - this.radius.br, this.startY + this.height);

        context.lineTo(this.startX + this.radius.bl, this.startY + this.height);
        this.radius.bl !== 0 && context.quadraticCurveTo(this.startX, this.startY + this.height, this.startX, this.startY + this.height - this.radius.bl);

        context.lineTo(this.startX, this.startY + this.radius.tl);
        this.radius.tl !== 0 && context.quadraticCurveTo(this.startX, this.startY, this.startX + this.radius.tl, this.startY);

        context.closePath();
    }

    setRadius(radius) {

        // if the radius is a single number, make all 4 corner radii the same
        if (typeof(radius) === 'number') {
            this.radius = { tl: radius, tr: radius, bl: radius, br: radius };
        }
        // if the radius is an object set any corresponding object properties 
        else if (typeof(radius) === 'object') {
            // default radius values all 0's
            this.radius = { tl: 0, tr: 0, bl: 0, br: 0 };
            // for each corner (tl, tr, bl, br) set this.radius to the argument if they share the property. otherwise just keep the default value
            for (let corner in this.radius) {
                this.radius[corner] = radius[corner] || this.radius[corner];
            }
        }
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

        return x > topLeftX && x < botRightX && y > topLeftY && y < botRightY;
    }

    
    setStart(startX, startY) {
        this.startX = startX;
        this.startY = startY;
    }
    
    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    getStart() {
        return {
            x: this.startX, y: this.startY
        }
    }

    getSize() {
        return {
            width: this.width, height: this.height
        }
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

    drawFill(context, color) {
        super.drawFill(context, color);
        context.ellipse(this.startX, this.startY, this.radiusX, this.radiusY, this.rotation, this.startAngle, this.endAngle, this.counterClockwise);
        context.fill();
    }

    drawStroke(context, color, lineWidth) {
        super.drawStroke(context, color, lineWidth);
        context.ellipse(this.startX, this.startY, this.radiusX, this.radiusY, this.rotation, this.startAngle, this.endAngle, this.counterClockwise);
        context.stroke();
    }

    setStart(startX, startY) {
        this.startX = startX;
        this.startY = startY;
    }

    setSize(radiusX, radiusY) {
        this.radiusX = radiusX;
        this.radiusY = radiusY;
    }

    setRotation(rotation) {
        this.rotation = rotation * Math.PI / 180;
    }

    setAngle(angle) {
        this.endAngle = angle * Math.PI / 180;
    }
}


export class Polygon extends Shape {
    // startX and startY here are offsets for the origin. 0, 0 will put the points exactly where you want
    // points is an array of objects where vertices would be placed
    // example triangle: [ {x: 200, y: 300}, {x: 300, y: 300}, {x: 250, y: 100} ]
    constructor(startX, startY, points=[]) {
        super(startX, startY);
        this.points = points;
    }

    drawFill(context, color) {
        super.drawFill(context, color);
        this._draw(context);
        context.fill();
    }

    drawStroke(context, color, lineWidth) {
        super.drawStroke(context, color, lineWidth);
        this._draw(context);
        context.stroke();
    }

    _draw(context) {
        // get the first point and the remaining point. Move to the first point and loop through the rest below
        const [ firstPoint, ...points ] = this.points;
        if (!firstPoint) return;
        context.moveTo(this.startX + firstPoint.x, this.startY + firstPoint.y);

        // draw a line to each point in the array. add the startX and Y to the point for an offset 
        points.forEach(point => {
            context.lineTo(this.startX + point.x, this.startY + point.y);
        });
        
        // finish the path by drawing a line from end-point of last line to start-point of first line (where we began path)
        context.closePath();
    }

    drawPoints(context, radius, lineWidth) {
        // get the first point and the remaining point. Move to the first point and loop through the rest below
        const [ firstPoint, ...points ] = this.points;

        let ellipse = new Ellipse(this.startX + firstPoint.x, this.startY + firstPoint.y, radius);
        ellipse.drawFill(context);
        ellipse.drawStroke(context, context.strokeStyle, lineWidth);
        
        // draw a line to each point in the array. add the startX and Y to the point for an offset 
        points.forEach(point => {
            let ellipse = new Ellipse(this.startX + point.x, this.startY + point.y, radius);
            ellipse.drawFill(context);
            ellipse.drawStroke(context, context.strokeStyle, lineWidth);
        });
        
    }

    // return the points for a REGULAR polygon. One with equilateral side lengths and equiangular interior/exterior angles
    // radius is the distance from the polygon's center to any of the polygon's vertices
    getRegularPolygon(numSides, radius, angle=0) {
        let points = [];

        for (let i = 0; i < numSides; i++) {
            // find each vertex point for a regular polygon with numSides sides
            let x = radius * Math.cos(2 * Math.PI * i / numSides) ;
            let y = radius * Math.sin(2 * Math.PI * i / numSides) ;

            // calculate a rotation for each point so we draw triangles, pentagons, etc with the flat side down
            let interiorAngle = this.getInteriorAngle(numSides);
            let adjustedAngle = angle + (interiorAngle / 2);

            let rotatedPoint = this.rotatePoint(x, y, adjustedAngle * Math.PI / 180);
            points.push(rotatedPoint);
        }

        this.points = points;
        return points;
    }

    // return a set of points with a rotation applied
    rotatePoint(x, y, angle) {
        let s = Math.sin(angle); // angle is in radians
        let c = Math.cos(angle); // angle is in radians

        // counter-clockwise rotation
        let xnew = x * c - y * s;
        let ynew = x * s + y * c;

        return {x: xnew, y: ynew };
    }

    // interior angle for a REGULAR polygon of given size
    getInteriorAngle(numSides) {
        return ((numSides - 2) * 180) / numSides;
    }
}