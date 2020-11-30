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
    constructor(startX, startY, width, height=width, radius=0) {
        super(startX, startY);
        this.width = width;
        this.height = height;
        this.setRadius(radius);
    }

    drawFill(color, context) {
        super.drawFill(color, context);
        this._draw(context);
        context.fill();
    }

    drawStroke(lineWeight, color, context) {
        super.drawStroke(lineWeight, color, context);
        this._draw(context);
        context.stroke();
    }

    _draw(context) {
        context.beginPath();

        context.moveTo(this.startX + this.radius.tl, this.startY);
        
        context.lineTo(this.startX + this.width - this.radius.tr, this.startY);
        context.quadraticCurveTo(this.startX + this.width, this.startY, this.startX + this.width, this.startY + this.radius.tr);

        context.lineTo(this.startX + this.width, this.startY + this.height - this.radius.br);
        context.quadraticCurveTo(this.startX + this.width, this.startY + this.height, this.startX + this.width - this.radius.br, this.startY + this.height);

        context.lineTo(this.startX + this.radius.bl, this.startY + this.height);
        context.quadraticCurveTo(this.startX, this.startY + this.height, this.startX, this.startY + this.height - this.radius.bl);

        context.lineTo(this.startX, this.startY + this.radius.tl);
        context.quadraticCurveTo(this.startX, this.startY, this.startX + this.radius.tl, this.startY);

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

    // THESE two are for a regular canvas rectangle with no consideration of border radii

    // drawFill(color, context) {
    //     super.drawFill(color, context);
    //     context.fillRect(this.startX, this.startY, this.width, this.height);
    // }

    // drawStroke(lineWeight, color, context) {
    //     super.drawStroke(lineWeight, color, context);
    //     context.strokeRect(this.startX, this.startY, this.width, this.height);
    // }

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

    setStart(startX, startY) {
        this.startX = startX;
        this.startY = startY;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
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

    setStart(startX, startY) {
        this.startX = startX;
        this.startY = startY;
    }

    setSize(radiusX, radiusY) {
        this.radiusX = radiusX;
        this.radiusY = radiusY;
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

    drawFill(color, context) {
        super.drawFill(color, context);

        // draw a line to each point in the array. add the startX and Y to the point for an offset 
        this.points.forEach(point => {
            context.lineTo(this.startX + point.x, this.startY + point.y);
        });
        
        // finish the path by drawing a line from end-point of last line to start-point of first line (where we began path)
        context.closePath()
        // actually put the lines on screen
        context.fill();
    }

    drawStroke(lineWeight, color, context) {
        super.drawStroke(lineWeight, color, context);

        // draw a line to each point in the array. add the startX and Y to the point for an offset 
        this.points.forEach(point => {
            context.lineTo(this.startX + point.x, this.startY + point.y);
        });
        
        // finish the path by drawing a line from end-point of last line to start-point of first line (where we began path)
        context.closePath()
        // actually put the lines on screen
        context.stroke();
    }

    // return the points for a REGULAR polygon. One with equilateral side lengths and equiangular interior/exterior angles
    // radius is the distance from the polygon's center to any of the polygon's vertices
    getRegularPolygon(numSides, radius) {
        let points = [];

        for (let i = 0; i < numSides; i++) {
            // find each vertex point for a regular polygon with numSides sides
            let x = radius * Math.cos(2 * Math.PI * i / numSides) ;
            let y = radius * Math.sin(2 * Math.PI * i / numSides) ;

            // calculate a rotation for each point so we draw triangles, pentagons, etc with the flat side down
            let interiorAngle = ((numSides - 2) * 180) / numSides;
            let rotationAngle = 90 - interiorAngle;;

            let rotatedPoint = this.rotatePoint(x, y, rotationAngle * Math.PI / 180);
            points.push(rotatedPoint);
        }

        return points;
    }

    // return a set of points with a rotation applied
    rotatePoint(x, y, angle){

        let s = Math.sin(angle); // angle is in radians
        let c = Math.cos(angle); // angle is in radians

        // counter-clockwise rotation
        let xnew = x * c - y * s;
        let ynew = x * s + y * c;

        return {x: xnew, y: ynew };
    }
}