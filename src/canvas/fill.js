import Color from './color.js'

let color = new Color;

export default class Fill {

    constructor() {
        this.pixelStack = [];
    }

    // startX, startY are the mosue coordinates where the paint bucket click started
    floodFill(startX, startY, startColor, fillColor, canvas, context) {
        // BASE CASE - if X or Y are outside of the canvas, return
        if (startX < 0 || startX > canvas.width || startY < 0 || startY > canvas.height) { return; }
        let pixelColor = this.getPixelColor(startX, startY, context);
        
        console.log(pixelColor);
        console.log(color.hexToRGB(pixelColor));



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
}