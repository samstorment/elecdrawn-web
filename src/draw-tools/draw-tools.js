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

// manager for all drawing tools
export class DrawTool {

    constructor(context) {
        this.context = context;
        this.setTools(context);
    }

    setTools(context) {
        this.tools = {
            brush: new BrushTool(context),
            brushFill: new BrushFillTool(context),
            rectangle: new RectangleTool(context),
            ellipse: new EllipseTool(context),
            line: new LineTool(context),
            radial: new RadialTool(context),
            polygon: new PolygonTool(context),
            select: new SelectTool(context),
            lasso: new LassoTool(context),
            bucket: new BucketTool(context),
            strokePicker: new PickerTool(context, 'stroke'),
            fillPicker: new PickerTool(context, 'fill'),
        }

        this.selectedTool = this.tools.brush;
    }
}