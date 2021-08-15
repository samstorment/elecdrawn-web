import BrushTool from './brush.js';
import RectangleTool from './rectangle.js';
import EllipseTool from './ellipse.js';
import LineTool from './line.js';
import RadialTool from './radial.js';
import PolygonTool from './polygon.js';
import SelectTool from './select.js';
import LassoTool from './lasso.js';
import BucketTool from './bucket.js';
import PickerTool from './picker.js';
import BrushFillTool from './brush-fill.js';
import TextTool from './text.js';
import EraserTool from './eraser.js';
import MirrorTool from './mirror.js';
import ImageTool from './image.js';

// manager for all drawing tools
export class DrawTool {

    constructor(context) {
        this.context = context;
        this.setTools(context);
        this.setToolChange();
    }

    setTools(context) {
        this.tools = {
            text: new TextTool(context),
            image: new ImageTool(context),
            eraser: new EraserTool(context),
            brush: new BrushTool(context),
            brushFill: new BrushFillTool(context),
            rectangle: new RectangleTool(context),
            ellipse: new EllipseTool(context),
            line: new LineTool(context),
            radial: new RadialTool(context),
            mirror: new MirrorTool(context),
            polygon: new PolygonTool(context),
            select: new SelectTool(context),
            lasso: new LassoTool(context),
            bucket: new BucketTool(context),
            strokePicker: new PickerTool(context, 'stroke'),
            fillPicker: new PickerTool(context, 'fill'),
        }

        let checkedTool = document.querySelector('.sidebar-radio:checked');
        this.selectedTool = this.tools[checkedTool.value];
    }

    setToolChange() {
        let sidebarTools = document.querySelectorAll('.sidebar-radio');
        // add click event to all sidebar tools
        sidebarTools.forEach(tool => {
            // when we click a sidebar tool, make that the selected tool
            tool.addEventListener('click', () => {
                this.selectedTool.cleanup();
                this.selectedTool = this.tools[tool.value];
                this.selectedTool.setup();
            });
        });
    }
}