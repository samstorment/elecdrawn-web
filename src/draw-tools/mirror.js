import PolygonTool from './polygon-super.js';

export default class MirrorTool extends PolygonTool {
    draw(event) {
        super.draw(event);
        if (!this.painting) return;
        const radius = document.querySelector('#stroke-slider').value;
        const lineWidth = document.querySelector('#mirror-line-width').value;
        this.poly.drawPoints(this.context, radius, lineWidth);
    }

    drawHoverCursor(event, context=this.previewContext) {
        super.drawHoverCursor(event, context);
        const radius = document.querySelector('#stroke-slider').value;
        const lineWidth = document.querySelector('#mirror-line-width').value;
        this.hover.drawPoints(context, radius, lineWidth);
    }

    setSides() {
        let polygonSides = document.querySelector('#num-mirrors');
        this.numSides = polygonSides.value;
    }
}