import { Rectangle } from "../canvas/shape.js";
import { getMouse } from "../canvas/util.js";
import Tool from "./tool.js";

export default class SelectorTool extends Tool {

    constructor(context) {
        super(context);
        this.cleanup();
    }

    // dont call super because we don't need to update CanvasState immediately
    start(event) {

        this.painting = true;

        const { mouseX, mouseY } = getMouse(event, this.context.canvas);

        if (!this.selectRect.isInside(mouseX, mouseY)) {
            this.startSelect(mouseX, mouseY);
        } else {
            this.startDrag(mouseX, mouseY);
        }
    }

    draw(event) {
        super.draw(event);

        if (!this.painting) return;

        const { mouseX, mouseY } = getMouse(event, this.context.canvas);

        if (this.startedInside) {
            this.drawDrag(mouseX, mouseY);
        } else if (!this.selectDrawn) {   
            this.drawSelect(mouseX, mouseY);
        }

    }

    finish(event) {
        super.finish(event);

        if (this.selecting) {
            this.finishSelect();
        } if (this.dragging) {
            this.dragging = false;
            this.startedInside = false;
            this.offset = { x: 0, y: 0 };
        }
    }
 
    startSelect(mouseX, mouseY) {
        this.selectDrawn = false;
        this.clear();
        this.selectRect = new Rectangle(mouseX, mouseY, 0);
    }

    drawSelect(mouseX, mouseY) {

        this.selecting = true;

        const width = mouseX - this.selectRect.startX;
        const height = mouseY - this.selectRect.startY;

        this.selectRect.setSize(width, height);

        this.clear();

        this.selectRect.drawStroke(this.previewContext, 'black', 2);
    }

    finishSelect() {
        const { width, height } = this.selectRect.getSize();

        if (width === 0 || height === 0) return;

        this.selectDrawn = true;
        this.selecting = false;
        const { x, y } = this.selectRect.getStart();
        const { topLeftX, topLeftY } = this.selectRect.getCoords();

        this.selectedImage = this.context.getImageData(x, y, width, height);

        this.context.clearRect(x, y, width, height);
        
        this.previewContext.putImageData(this.selectedImage, topLeftX, topLeftY);
        this.selectRect.drawStroke(this.previewContext, 'black', 2);
    }

    startDrag(mouseX, mouseY) {
        this.startedInside = true;
        const { topLeftX, topLeftY } = this.selectRect.getCoords();
        this.offset = { x: topLeftX - mouseX, y: topLeftY - mouseY }
    }

    drawDrag(mouseX, mouseY) {
        this.dragging = true;

        this.clear();

        const x = mouseX + this.offset.x;
        const y = mouseY + this.offset.y;
        const width = Math.abs(this.selectRect.width);
        const height = Math.abs(this.selectRect.height);

        this.selectRect = new Rectangle(x, y, width, height);

        this.previewContext.putImageData(this.selectedImage, x, y);
        this.selectRect.drawStroke(this.previewContext, 'black', 2);
    }

    finishDrag() {
        
    }

    cleanup() {
        this.selectRect = new Rectangle(0, 0, 0);
        this.selecting = false;
        this.dragging = false;
        this.scaling = false;
        this.selectDrawn = false;
        this.startedInside = false;
        this.offset = { x: 0, y: 0 };
        this.lineDashOffset = 0;
    }

    drawHoverCursor() {}

}