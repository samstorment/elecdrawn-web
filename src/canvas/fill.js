import { hexToRGB } from './color.js';
import Queue from '../data-structures/queue.js';

// Iterative fill
export function floodFill(ctx, x, y, hexFillColor, range = 1) {

    // fillColor needs to be converted to RGB since we get it from color input as a hex val
    let fillColor = hexToRGB(hexFillColor);

    // read the pixels in the canvas
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // flags for if we visited a pixel already
    const visited = new Uint8Array(imageData.width, imageData.height);
    
    // get the color we're filling
    const targetColor = getPixel(imageData, x, y);

    if (colorsIdentical(targetColor, fillColor)) { return; }

    // check we are actually filling a different color
    if (!colorsMatch(targetColor, fillColor)) {
    
        const rangeSq = range * range;

        // let pixelStack = [ {x: x, y: y} ];
        let queue = new Queue();
        queue.push({x: x, y: y});

        // while (pixelStack.length > 0) {

        while (!queue.isEmpty()) {
            // let { x, y } = pixelStack.pop();
            let { x, y } = queue.pop();
            
            const currentColor = getPixel(imageData, x, y);

            if (!visited[y * imageData.width + x] &&
                colorsMatch(currentColor, targetColor, rangeSq)) {
                setPixel(imageData, x, y, fillColor);
                visited[y * imageData.width + x] = 1;  // mark we were here already
                // pixelStack.push( { x: x + 1, y: y } );
                // pixelStack.push( { x: x - 1, y: y } );
                // pixelStack.push( { x: x, y: y + 1 } );
                // pixelStack.push( { x: x, y: y - 1 } );
                queue.push( { x: x + 1, y: y } );
                queue.push( { x: x - 1, y: y } );
                queue.push( { x: x, y: y + 1 } );
                queue.push( { x: x, y: y - 1 } );
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }
}


function getPixel(imageData, x, y) {
    // if the given x,y are outside of the canvas
    if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) {
        return [-1, -1, -1, -1];
    } else {
        // i'm not 100% sure how the offset works
        const offset = (y * imageData.width + x) * 4;
        return imageData.data.slice(offset, offset + 4);
    }
}
    
// set the pixel at the given x,y coordinate to the given color
function setPixel(imageData, x, y, color) {
    const offset = (y * imageData.width + x) * 4;
    imageData.data[offset + 0] = color[0];
    imageData.data[offset + 1] = color[1];
    imageData.data[offset + 2] = color[2];
    imageData.data[offset + 3] = color[3];
}
    
// returns true if the colors are similiar enough
function colorsMatch(a, b, rangeSq) {
    const dr = a[0] - b[0];
    const dg = a[1] - b[1];
    const db = a[2] - b[2];
    const da = a[3] - b[3];
    return dr * dr + dg * dg + db * db + da * da < rangeSq;
}

// returns true if the rgb arrays for both colors are the exact same
function colorsIdentical(a, b) {
    return a[0] == b[0] && a[1] == b[1] && a[2] == b[2] && a[3] == b[3];
}
