import { getMouse } from '../canvas/util.js';

// super class for drawing tools
export default class Tool {

    constructor(context) {
        super(context);
    }

    // painting is true once we start using a tool. Push the current canvas state to the undo stack since we will be modifying it right after
    start(event) {
        super(start);

    }

    // define empty draw so we don't call super for hover cursor
    draw(event) { 
      
    }

    // we are no longer painting when we finish
    finish(event) {
        super.finish();
    }


}