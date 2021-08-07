import CanvasState from '../canvas/canvas-state.js';

let canvas = document.querySelector('#canvas');
let context = canvas.getContext('2d');

let previewCanvas = document.querySelector('#preview-canvas');
let previewContext = previewCanvas.getContext('2d');

let backgroundCanvas = document.querySelector('#background-canvas');
let backgroundContext = backgroundCanvas.getContext('2d');

// Sidebar change listeners
export let strokeColor = document.querySelector('#stroke-color');
strokeColor.addEventListener('input', () => {
    context.strokeStyle = strokeColor.value;
    previewContext.strokeStyle = strokeColor.value;
});

export let fillColor = document.querySelector('#fill-color');
fillColor.addEventListener('input', () => {
    context.fillStyle = fillColor.value;
    previewContext.fillStyle = fillColor.value;
});

export let backgroundColor = document.querySelector('#background-color');
backgroundColor.addEventListener('input', e => {
    backgroundContext.fillStyle = backgroundColor.value;
    backgroundContext.fillRect(0, 0, canvas.width, canvas.height);
});

export let strokeSlider = document.querySelector('#stroke-slider');
strokeSlider.addEventListener('change', () => {
    context.lineWidth = strokeSlider.value;
    previewContext.lineWidth = strokeSlider.value;
});

export let linecapSelect = document.querySelector('#line-caps');
linecapSelect.addEventListener('change', e => {
    context.lineCap = e.target.value;
    previewContext.lineCap = e.target.value;
});

export let downloadCanvas = document.querySelector('#download-canvas');
downloadCanvas.addEventListener('click', function (e) {
    // draw the canvas to the background just when we save so eveything from the canvas shows up
    backgroundContext.drawImage(canvas, 0, 0);
    let dataURL = backgroundCanvas.toDataURL('image/png');
    downloadCanvas.href = dataURL;
    backgroundContext.fillStyle = backgroundColor.value;
    backgroundContext.fillRect(0, 0, canvas.width, canvas.height);
});

export let clearButton = document.querySelector('#canvas-clear');
clearButton.addEventListener('click', () => {
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    CanvasState.pushUndoStack(imageData);
    context.clearRect(0, 0, canvas.width, canvas.height);
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