export default class Shape {

    constructor(context) {
        this.context = context;
    }

    drawStrokeRect(startX, startY, width, height, lineWeight, color) {
        this.context.strokeStyle = color;
        this.context.lineWidth = lineWeight;
        this.context.strokeRect(startX, startY, width, height);
    }

    drawFillRect(startX, startY, width, height, color) {
        this.context.fillStyle = color;
        this.context.fillRect(startX, startY, width, height);
    }

    // can be used to draw a shape with any number of sides
    drawStrokeShape(points, lineWeight, color) {
        this.context.strokeStyle = color;
        this.context.lineWidth = lineWeight;
        this.context.beginPath();

        // draw a line to each point in the array
        points.forEach(element => {
            this.context.lineTo(element.x, element.y);
        });
        
        // finish the path by drawing a line from end-point of last line to start-point of first line
        this.context.closePath()
        // actually put the lines on screen
        this.context.stroke();
    }
}