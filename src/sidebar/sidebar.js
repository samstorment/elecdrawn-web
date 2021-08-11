import CanvasState from '../canvas/canvas-state.js';
import { pickerSliderToRgba, setFillColor, setStrokeColor } from '../canvas/color.js';

let canvas = document.querySelector('#canvas');
let context = canvas.getContext('2d');

let previewCanvas = document.querySelector('#preview-canvas');
let previewContext = previewCanvas.getContext('2d');

let backgroundCanvas = document.querySelector('#background-canvas');
let backgroundContext = backgroundCanvas.getContext('2d');

const canvasProperties = {
    lineCap: 'line-caps',
    lineJoin: 'line-joins',
    shadowColor: 'shadow-color',
    shadowBlur: 'shadow-blur',
    shadowOffsetX: 'shadow-offset-x',
    shadowOffsetY: 'shadow-offset-y',
    lineWidth: 'stroke-slider',
    globalAlpha: 'opacity',
    globalCompositeOperation: 'composite-operation',
    textAlign: 'text-align',
    textBaseline: 'text-baseline'
}

export const setUp = () => {

    for (let prop in canvasProperties) {
        const id = `#${canvasProperties[prop]}`;
        const element = document.querySelector(id);
        
        context[prop] = element.value;
        previewContext[prop] = element.value;
        
        element.addEventListener('change', e => {
            context[prop] = e.target.value;
            previewContext[prop] = e.target.value;
        });
    }

    setDash();
    setFont();
    setupBackground();
    setColors();
}

let dashLengthInput = document.querySelector('#dash-length');
let dashSpaceInput = document.querySelector('#dash-space');

const setDash = e => {
    let dashLength = parseInt(dashLengthInput.value);
    let dashSpace = parseInt(dashSpaceInput.value);
    context.setLineDash([dashLength, dashSpace]);
    previewContext.setLineDash([dashLength, dashSpace]);
}

dashLengthInput.addEventListener('change', setDash);
dashSpaceInput.addEventListener('change', setDash);

let boldButton = document.querySelector(`#text-bold`);
let italicButton = document.querySelector(`#text-italic`);
let underlineButton = document.querySelector(`#text-underline`);
let textFontFamily = document.querySelector('#text-font');
let textSize = document.querySelector('#text-size');
let textVariant = document.querySelector('#text-variant');

const setFont = () => {
    const bold = boldButton.classList.contains('clicked');
    const italic = italicButton.classList.contains('clicked');
    const fontFamily = textFontFamily.value;
    const size = textSize.value;
    const variant = textVariant.value;
    const font = `${italic ? 'italic' : ''} ${bold ? 'bold' : ''} ${variant} ${size}px ${fontFamily}`;
    context.font = font;
    previewContext.font = font;
}

const textButtonClick = e => {
    e.target.classList.toggle('clicked');
    setFont();
}

boldButton.addEventListener('click', textButtonClick);
italicButton.addEventListener('click', textButtonClick);
underlineButton.addEventListener('click', textButtonClick);

const fontChangers = ['text-bold', 'text-italic', 'text-font', 'text-size', 'text-variant'];
fontChangers.forEach(id => {
    document.querySelector(`#${id}`).addEventListener('change', setFont);
});

const fonts = [
    'Serif', 'Trebuchet MS', 'Verdana', 'Avantgarde', 'Brush Script MT', 
    'Comic Sans MS', 'Impact', 'Courier',
    'Pangolin',
];
const fontSelect = document.querySelector('#text-font');
fonts.forEach(font => {
    const option = document.createElement('option');
    option.innerHTML = font;
    option.value = font;
    fontSelect.appendChild(option);
});

const setColors = () => {
    setFillColor(context);
    setStrokeColor(context);
    setFillColor(previewContext);
    setStrokeColor(previewContext);
}

const colorChangeIds = ['stroke-color', 'stroke-opacity', 'fill-color', 'fill-opacity'];
colorChangeIds.forEach(ele => {
    document.querySelector(`#${ele}`).addEventListener('change', setColors);
});

let backgroundColor = document.querySelector('#background-color');
let backgroundOpacity = document.querySelector('#background-opacity');
const setupBackground = () => {
    const backgroundStyle = pickerSliderToRgba('background-color', 'background-opacity');
    console.log(backgroundStyle);
    backgroundContext.fillStyle = backgroundStyle;
    backgroundContext.clearRect(0, 0, canvas.width, canvas.height);
    backgroundContext.fillRect(0, 0, canvas.width, canvas.height);
}
backgroundColor.addEventListener('input', setupBackground);
backgroundOpacity.addEventListener('input', setupBackground);

let clearButton = document.querySelector('#canvas-clear');
clearButton.addEventListener('click', () => {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    CanvasState.pushUndoStack(imageData);
    context.clearRect(0, 0, canvas.width, canvas.height);
});

let downloadCanvas = document.querySelector('#download-canvas');
downloadCanvas.addEventListener('click', function (e) {
    // draw the canvas to the background just when we save so eveything from the canvas shows up
    backgroundContext.drawImage(canvas, 0, 0);
    let dataURL = backgroundCanvas.toDataURL('image/png');
    downloadCanvas.href = dataURL;
    setupBackground();
});

// setup the arrow dropdowns for each row
let rows = document.querySelectorAll('.sidebar-row');
rows.forEach(row => {
    const arrowButton = row.querySelector('.arrow-button');
    const subrows = row.querySelectorAll('.sidebar-subrow');

    arrowButton && arrowButton.addEventListener('click', e => {
        // toggle the arrow and display the subrow or hide it
        if (e.target.classList.contains("arrow-closed")) {
            e.target.classList.remove("arrow-closed");
            e.target.classList.add("arrow-open");
            e.target.innerHTML = `<i class="fa fa-angle-down"></i>`;
            subrows.forEach(subrow => {
                subrow.style.display = 'flex';
            });
        } else {
            e.target.classList.add("arrow-closed");
            e.target.classList.remove("arrow-open");
            e.target.innerHTML = `<i class="fa fa-angle-right"></i>`;
            subrows.forEach(subrow => {
                subrow.style.display = 'none';
            });
        }
    });
});

let numberInputs = document.querySelectorAll('input[type="number"]');
numberInputs.forEach(input => {
    input.addEventListener('focusout', e => {
        let val = parseInt(e.target.value);
        let min = parseInt(e.target.min);
        let max = parseInt(e.target.max);
    
        if (val > max) {
            e.target.value = max;
        } else if (val < min) {
            e.target.value = min;
        }
    });
});