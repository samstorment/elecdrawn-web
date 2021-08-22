const canvas = document.querySelector('#grid-canvas');
const context = canvas.getContext('2d');

let colorInput1 = document.querySelector('#grid-color-1');
let colorInput2 = document.querySelector('#grid-color-2');
let sizeInput = document.querySelector('#grid-square-size');
let resetButton = document.querySelector('#grid-reset-button');

// gray and lightgray
const defaultColor1 = '#808080';
const defaultColor2 = '#d3d3d3';
const defaultSize = 15;

let color1 = colorInput1.value;
let color2 = colorInput2.value;
let size = parseInt(sizeInput.value);

const drawGrid = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    let squares = 0;

    // loop through the canvas width and height to draw checkerboard rows and cols
    for (let j = 0; j <= height; j += size) {
        for (let i = 0; i <= width; i += size) {
            
            // if even column, use color 1, if odd, use color 2
            if (squares % 2 === 0) context.fillStyle = color1;
            else context.fillStyle = color2;
            
            // fill at current position with 
            context.fillRect(i, j, size, size);
            
            squares++;
        }

        // if this number of squares per row is odd, we want to offset the the next row
        if (Math.floor(width / size) % 2 !== 0) squares++;
    }

}

drawGrid();

window.addEventListener('resize', e => {
    drawGrid();
});

colorInput1.addEventListener('change', e => {
    color1 = e.target.value;
    drawGrid();
});

colorInput2.addEventListener('change', e => {
    color2 = e.target.value;
    drawGrid();
});

sizeInput.addEventListener('change', e => {

    const val = parseInt(e.target.value);
    const min = parseInt(e.target.min);
    const max = parseInt(e.target.max);

    if (isNaN(val)) return;
    if (val < min) size = min;
    else if (val > max) size = max;
    else size = val;

    drawGrid();
});

resetButton.addEventListener('click', () => {
    colorInput1.value = color1 = defaultColor1;
    colorInput2.value = color2 = defaultColor2;
    sizeInput.value = size = defaultSize;
    drawGrid();
});