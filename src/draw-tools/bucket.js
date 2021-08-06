import Tool from './tool.js';
import { getMouse } from '../canvas/util.js';
import { hexToRGB } from '../canvas/color.js';

export default class BucketTool extends Tool {

    constructor(context) {
        super(context);
    }

    startLeft(event) {
        super.startLeft(event);
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        let x = Math.round(mouseX);
        let y = Math.round(mouseY);
        this.floodFill(x, y, this.context.fillStyle, this.context, 128);
        this.context.beginPath();    // start a new path so we don't mess our other tools don't start at weird spot
    }

    // define an empty draw functions to override super class because we don't want to draw a gover cursor
    drawLeft(event) {}
    drawRight(event) {}
    drawMiddle(event) {}

    finishLeft(event) {
        super.finishLeft(event);
    }

    floodFill(startX, startY, hexFillColor, context, range = 1) {

        // fillColor needs to be converted to RGB since we get it from color input as a hex val
        let fillColor = hexToRGB(hexFillColor);

        // read the pixels in the canvas
        const imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
        
        // flags for if we visited a pixel already
        const visited = new Uint8Array(imageData.width, imageData.height);
        
        // get the color of the first pixel we clicked on
        const targetColor = this.getPixel(startX, startY, imageData);

    
        // if the target color we tried to fill is identical to our fill color, we're done
        if (this.colorsIdentical(targetColor, fillColor)) { return; }
    
        const rangeSq = range * range;

        // Stack is a DFS approach. We could also use a queue.
        let stack = [ {x: startX, y: startY} ];

        while (stack.length > 0) {

            // // get the (x, y) coords of pixel at the top of the stack
            let { x, y } = stack.pop();

            // get the color data for the pixel at (x, y)
            const currentColor = this.getPixel(x, y, imageData); 

            // if we haven't already visited this pixel AND the current pixel's color matches the targetColor
            // colorsMatch(currentColor, targetColor, rangeSq) causes a problem when you try to fill a very similiar but slightly different color, not exactly sure how to fix.
            // this problem also comes up when trying to fill some parts of the empty canvas?? Changing colorsMatch to colorsIdentical solves this but the fill is much uglier
            if (!visited[y * imageData.width + x] && this.colorsIdentical(currentColor, targetColor)) {
                this.setPixel(x, y, fillColor, imageData);   // color the pixel at (x, y)
                visited[y * imageData.width + x] = 1;   // mark that we've visited this pixel
                // push the right, left, top, and bottom pixels to the stack for evaluation
                stack.push( { x: x + 1, y: y } );       
                stack.push( { x: x - 1, y: y } );
                stack.push( { x: x, y: y + 1 } );
                stack.push( { x: x, y: y - 1 } );
            }
        }
        // draw the updated imageData back to the screen
        context.putImageData(imageData, 0, 0);
        
    }
    
    // returns the RGB color array of the pixel at (x, y)
    getPixel(x, y, imageData) {
        // if the given (x, y) are outside of the canvas we return an impossible (error) color
        if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) {
            return [-1, -1, -1, -1];
        } else {
            // lets us get the RGB array for the single pixel at (x, y)
            const offset = (y * imageData.width + x) * 4;
            return imageData.data.slice(offset, offset + 4);
        }
    }
        
    // set the pixel at the given x,y coordinate to the given color
    setPixel(x, y, color, imageData) {
        const offset = (y * imageData.width + x) * 4;
        imageData.data[offset + 0] = color[0];
        imageData.data[offset + 1] = color[1];
        imageData.data[offset + 2] = color[2];
        imageData.data[offset + 3] = color[3];
    }
        
    // returns true if the colors are similiar enough. similiarity is determined by rangeSq
    colorsMatch(clr1, clr2, rangeSq) {
        const red = clr1[0] - clr2[0];
        const green = clr1[1] - clr2[1];
        const blue = clr1[2] - clr2[2];
        const alpha = clr1[3] - clr2[3];
    
        return red * red + green * green + blue * blue + alpha * alpha < rangeSq;
    }
    
    // returns true if the rgb arrays for both colors are the exact same
    colorsIdentical(clr1, clr2) {
        return clr1[0] == clr2[0] && clr1[1] == clr2[1] && clr1[2] == clr2[2] && clr1[3] == clr2[3];
    }
    
}