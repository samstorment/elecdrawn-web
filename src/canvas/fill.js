import Color from './color.js';
import Queue from '../data-structures/queue.js';


let color = new Color();

export default class Fill {

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

      
    // OLD -- used in recursion
    getPixelColor(x, y, context) {
        // start at x, y and get data for a single 1x1 pixel
        let pixel = context.getImageData(x, y, 1, 1).data;
        let pixelColor = {
            red: pixel[0],
            green: pixel[1],
            blue: pixel[2],
            alpha: pixel[3]
        }
        return color.rgbToHex(pixelColor);
    }

    // OLD - used in recursion
    setPixelColor(x, y, fillColor, context) {
        context.fillStyle = fillColor;
        context.fillRect(x, y, 1, 1);
    }



    // Iterative fill
    floodFill(ctx, x, y, fillColor, range = 1) {

        // read the pixels in the canvas
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        // flags for if we visited a pixel already
        const visited = new Uint8Array(imageData.width, imageData.height);
        
        // get the color we're filling
        const targetColor = this.getPixel(imageData, x, y);
        
        // check we are actually filling a different color
        if (!this.colorsMatch(targetColor, fillColor)) {
        
            const rangeSq = range * range;
            const pixelsToCheck = [x, y];
            while (pixelsToCheck.length > 0) {
                const y = pixelsToCheck.pop();
                const x = pixelsToCheck.pop();
                
                const currentColor = this.getPixel(imageData, x, y);

                if (!visited[y * imageData.width + x] &&
                    this.colorsMatch(currentColor, targetColor, rangeSq)) {
                    this.setPixel(imageData, x, y, fillColor);
                    visited[y * imageData.width + x] = 1;  // mark we were here already
                    pixelsToCheck.push(x + 1, y);
                    pixelsToCheck.push(x - 1, y);
                    pixelsToCheck.push(x, y + 1);
                    pixelsToCheck.push(x, y - 1);
                }
            }
            ctx.putImageData(imageData, 0, 0);
        }
    }

    getPixel(imageData, x, y) {
        if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) {
            return [-1, -1, -1, -1];  // impossible color
        } else {
            const offset = (y * imageData.width + x) * 4;
            return imageData.data.slice(offset, offset + 4);
        }
    }
      
    setPixel(imageData, x, y, color) {
        const offset = (y * imageData.width + x) * 4;
        imageData.data[offset + 0] = color[0];
        imageData.data[offset + 1] = color[1];
        imageData.data[offset + 2] = color[2];
        imageData.data[offset + 3] = color[3];
    }
      
    colorsMatch(a, b, rangeSq) {
        const dr = a[0] - b[0];
        const dg = a[1] - b[1];
        const db = a[2] - b[2];
        const da = a[3] - b[3];
        return dr * dr + dg * dg + db * db + da * da < rangeSq;
    }
}