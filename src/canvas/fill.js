import Color from './color.js'

let color = new Color;

export default class Fill {

    constructor() {
        this.pixelqueue = [];
    }

    // startX, startY are the mosue coordinates where the paint bucket click started
    // Recursive flood fill often times causes a queue overflow
    floodFillRecurse(startX, startY, startColor, fillColor, canvas, context) {
        // BASE CASE - if X or Y are outside of the canvas, return
        if (startX < 0 || startX > canvas.width || startY < 0 || startY > canvas.height) { return; }
        
        let pixelColor = this.getPixelColor(startX, startY, context);

        // BASE CASES - if the selected pixel color != start color or == the fill color, return
        if (pixelColor !== startColor) { return; }
        if (pixelColor === fillColor) { return; }

        

        // update the selected pixel to the fill color
        this.setPixelColor(startX, startY, fillColor, context);

        // recursively call floodfill to the left, right, top, and bottom cooridinates respectively
        this.floodFillRecurse(startX + 1, startY, startColor, fillColor, canvas, context);
        this.floodFillRecurse(startX - 1, startY, startColor, fillColor, canvas, context);
        this.floodFillRecurse(startX, startY + 1, startColor, fillColor, canvas, context);
        this.floodFillRecurse(startX, startY - 1, startColor, fillColor, canvas, context);
    }

    // TODO: DEBUG. This currently does not work properly, not sure why yet.
    floodFill(startX, startY, startColor, fillColor, canvas, context) {

        let queue = [];
        queue.push({x: startX, y: startY})
        while (queue.length !== 0) {
            let { x, y } = queue.shift();
            this.setPixelColor(x, y, fillColor, context);

            if (this.checkValid(x + 1, y, startColor, fillColor, canvas, context)) {
                queue.push({x: x + 1, y: y});
            }
            if (this.checkValid(x - 1, y, startColor, fillColor, canvas, context)) {
                queue.push({x: x - 1, y: y});
            }
            if (this.checkValid(x, y + 1, startColor, fillColor, canvas, context)) {
                queue.push({x: x, y: y + 1});
            }
            if (this.checkValid(x, y - 1, startColor, fillColor, canvas, context)) {
                queue.push({x: x, y: y - 1});
            }
        }
    }


    checkValid(startX, startY, startColor, fillColor, canvas, context) {
        if (startX < 0 || startX > canvas.width || startY < 0 || startY > canvas.height) { return false; }
        let pixelColor = this.getPixelColor(startX, startY, context);
        if (pixelColor !== startColor) { return false; }
        if (pixelColor === fillColor) { return false; }

        return true;
    }

    

    getPixelColor(x, y, context) {
        // start at x, y and get data for a single 1x1 pixel
        let pixel = context.getImageData(x, y, 1, 1).data;
        let pixelColor = {
            red: pixel[0],
            green: pixel[1],
            blue: pixel[2],
            alpha: pixel[3]
        }
        return color.rbgToHex(pixelColor);
    }


    setPixelColor(x, y, fillColor, context) {
        context.fillStyle = fillColor;
        context.fillRect(x, y, 1, 1);
    }
}