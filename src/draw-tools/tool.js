import CanvasState from '../canvas/canvas-state.js';
import { setFillColor, setStrokeColor } from '../canvas/color.js';
import { Ellipse } from '../canvas/shape.js';
import { getMouse } from '../canvas/util.js';

// super class for drawing tools
export default class Tool {

    constructor(context) {
        this.context = context;
        this.painting = false;
        this.mouseUp();
        this.previewContext = document.querySelector("#preview-canvas").getContext('2d');
    }

    // painting is true once we start using a tool. Push the current canvas state to the undo stack since we will be modifying it right after
    start(event) {
        this.painting = true;
        // push the state to the undo stack
        const imageData = this.context.getImageData(0, 0, this.context.canvas.width, this.context.canvas.height);
        CanvasState.pushUndoStack(imageData);
        CanvasState.resetRedoStack();
    }

    draw(event) { 
        if (!this.painting) {
            this.drawHoverCursor(event);
        }
    }

    // we are no longer painting when we finish
    finish(event) {
        this.painting = false;
        this.resetStroke();
    }

    leave(event) {
        // remove the hover cursor if we leave and we aren't painting
        if (!this.painting) {
            this.clear();
        }

        if (this.painting) {
            this.context.canvas.style.backgroundColor = "rgb(255,0,0,0.25)";
        }
    }

    enter(event) {
        this.context.beginPath();
        this.context.canvas.style.backgroundColor = "rgb(0,0,0,0)";
    }

    cleanup() {
        this.resetStroke();
        this.clear();
    }

    drawHoverCursor(event, context=this.previewContext) {
        let { mouseX, mouseY } = getMouse(event, context.canvas);
        
        // clear the preview canvas anytime we move, but draw right after
        this.clear();
        context.beginPath();

        let radius = this.context.lineWidth / 2;
        let ellipse = new Ellipse(mouseX, mouseY, radius);
        ellipse.drawFill(context, context.strokeStyle);
    }

    clear(context=this.previewContext, x=0, y=0, width=context.canvas.width, height=context.canvas.height) {
        context.clearRect(x, y, width, height);
    }

    resetStroke() {        
        const strokeWeigth = document.querySelector('#stroke-slider').value;
        // reset preview stroke color and weight
        this.previewContext.lineWidth = strokeWeigth;
        this.context.lineWidth = strokeWeigth;
        setFillColor(this.context);
        setStrokeColor(this.context);
        setFillColor(this.previewContext);
        setStrokeColor(this.previewContext);
    }

    ignoreAlphaShadow() {
        this.context.globalAlpha = 1;
        this.context.shadowBlur = 0;
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 0;
        this.previewContext.globalAlpha = 1;
        this.previewContext.shadowBlur = 0;
        this.previewContext.shadowOffsetX = 0;
        this.previewContext.shadowOffsetY = 0;
        this.context.globalCompositeOperation = "source-over";
        this.previewContext.globalCompositeOperation = "source-over";
    }

    restoreAlphaShadow() {
        const opacitySlider = document.querySelector('#opacity');
        const shadowBlur = document.querySelector('#shadow-blur');
        const shadowOffsetX = document.querySelector('#shadow-offset-x');
        const shadowOffsetY = document.querySelector('#shadow-offset-y');
        const compositeOperation = document.querySelector('#composite-operation');

        this.context.globalAlpha = opacitySlider.value;
        this.context.shadowBlur = shadowBlur.value;
        this.context.shadowOffsetX = shadowOffsetX.value;
        this.context.shadowOffsetY = shadowOffsetY.value;
        this.previewContext.globalAlpha = opacitySlider.value;
        this.previewContext.shadowBlur = shadowBlur.value;
        this.previewContext.shadowOffsetX = shadowOffsetX.value;
        this.previewContext.shadowOffsetY = shadowOffsetY.value;
        this.context.globalCompositeOperation = compositeOperation.value;
        this.previewContext.globalCompositeOperation = compositeOperation.value;
    }

    mouseUp() {
        document.body.addEventListener('mouseup', e => {
            // check if painting because painting will be false only if we mouseup outside of the canvas
            if (this.painting) {                
                this.painting = false;
                this.clear();
                this.context.canvas.style.backgroundColor = "rgb(0,0,0,0)";
            }
        });
    }
}