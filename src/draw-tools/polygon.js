import PolygonTool from './polygon-super.js';

export default class MirrorTool extends PolygonTool {
    draw(event) {
        super.draw(event);
        if (!this.painting) return;
        this.poly.drawFill(this.previewContext);
        this.poly.drawStroke(this.previewContext);
    }

    finish(event) {
        super.finish(event);
        this.poly.drawFill(this.context);
        this.poly.drawStroke(this.context);
    }

    drawHoverCursor(event, context=this.previewContext) {
        super.drawHoverCursor(event, context);
        this.hover.drawFill(context, context.strokeStyle);
    }
}