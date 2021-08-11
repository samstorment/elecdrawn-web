import Tool from './tool.js';
import { getMouse } from '../canvas/util.js';
import { getPixelColor } from '../canvas/color.js';

// super class for drawing tools
export default class PickerTool extends Tool {

    constructor(context, pickerType) {
        super(context);
        this.pickerType = pickerType;
    }

    start(event) {
        super.start(event);

        // get the two color selectors so we can set their colors
        let strokeColor = document.querySelector('#stroke-color');
        let fillColor = document.querySelector('#fill-color');

        // get the color slsected at the mouse position. This is currently flawed because you cant select from background color. We need a way to ignore canvas if color picked is transparent
        let { mouseX, mouseY } = getMouse(event, this.context.canvas);
        let colorPicked = getPixelColor(mouseX, mouseY, this.context);

        // set the stroke/fill based on the picker type
        if (this.pickerType === 'stroke') {
            strokeColor.value = colorPicked; 
            this.context.strokeStyle = colorPicked;
            this.previewContext.strokeStyle = colorPicked;
        }
        else if (this.pickerType === 'fill') {
            fillColor.value = colorPicked; 
            this.context.fillStyle = colorPicked;
            this.previewContext.fillStyle = colorPicked;
        }
    }

    // we never want a hover cursor with this tool
    drawHoverCursor() {}
}