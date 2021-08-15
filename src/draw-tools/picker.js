import Tool from './tool.js';
import { getMouse } from '../canvas/util.js';
import { getPixelColor, rgbToHex } from '../canvas/color.js';

// super class for drawing tools
export default class PickerTool extends Tool {

    constructor(context, pickerType) {
        super(context);
        this.pickerType = pickerType;
    }

    start(event) {
        super.start(event);

        // get the two color selectors and opacity sliders so we can set their values
        let strokeColor = document.querySelector('#stroke-color');
        let fillColor = document.querySelector('#fill-color');
        let strokeOpacity = document.querySelector('#stroke-opacity');
        let fillOpacity = document.querySelector('#fill-opacity');

        // get the color slsected at the mouse position.
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        let [ r, g, b, a ] = getPixelColor(mouseX, mouseY, this.context);

        // if the canvas was transparent, try the background canvas
        if (a === 0) {
            const backgroundContext = document.querySelector("#background-canvas").getContext('2d');
            [ r, g, b, a] = getPixelColor(mouseX, mouseY, backgroundContext);
            if (a === 0) r = g = b = 255;
        }

        const colorPicked = rgbToHex([r,g,b,a]);
        const opacityPicked = a / 255;        
        const contextStyle = `rgba(${r}, ${g}, ${b}, ${a})`;

        // set the stroke/fill based on the picker type
        if (this.pickerType === 'stroke') {
            strokeColor.value = colorPicked;
            strokeOpacity.value = opacityPicked;
            this.context.strokeStyle = contextStyle;
            this.previewContext.strokeStyle = contextStyle;
        }
        else if (this.pickerType === 'fill') {
            fillColor.value = colorPicked;
            fillOpacity.value = opacityPicked;
            this.context.fillStyle = contextStyle;
            this.previewContext.fillStyle = contextStyle;
        }
    }

    // we never want a hover cursor with this tool
    drawHoverCursor() {}
}