import BrushTool from '../draw-tools/brush.js';
import RectangleTool from '../draw-tools/rectangle.js';
import EllipseTool from '../draw-tools/ellipse.js';
import LineTool from '../draw-tools/line.js';
import RadialTool from '../draw-tools/radial.js';
import PolygonTool from '../draw-tools/polygon.js';
import SelectTool from '../draw-tools/select.js';
import LassoTool from '../draw-tools/lasso.js';
import BucketTool from '../draw-tools/bucket.js';

// manager for all drawing tools
export class DrawTool {

    constructor(context) {
        this.context = context;
        this.setTools(context);
    }

    setTools(context) {
        this.tools = {
            brush: new BrushTool(context),
            rectangle: new RectangleTool(context),
            ellipse: new EllipseTool(context),
            line: new LineTool(context),
            radial: new RadialTool(context),
            polygon: new PolygonTool(context),
            select: new SelectTool(context),
            lasso: new LassoTool(context),
            bucket: new BucketTool(context),
        }

        this.selectedTool = this.tools.brush;
    }
}