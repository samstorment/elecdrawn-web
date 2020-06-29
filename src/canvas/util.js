// gets the starting X and Y position of given HTML element. Use this to find top left corner of canvas
function getElementPosition(element) {
    var xPosition = 0;
    var yPosition = 0;
    
    while (element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return {
        x: xPosition,
        y: yPosition
    };
}

// returns the position of the mouse on the canvas since (0, 0) on the cnavas is offset from (0,0) on the overall window
export function getMousePosition(event) {

    // Get the canvas X and Y coordinates so we knwow where to draw
    let { x, y } = getElementPosition(canvas);

    return {
        mouseX: event.clientX - x,   
        mouseY: event.clientY - y
    };
}

// this is a copy paste of above but lets us use any element to get the x and y
export function getMouse(event, element) {

    // Get the canvas X and Y coordinates so we knwow where to draw
    let { x, y } = getElementPosition(element);

    return {
        mouseX: event.clientX - x,   
        mouseY: event.clientY - y
    };
}

// we should move this stuff elsewhere
export let redoStack = [];
export let undoStack = [];
export function clearRedoStack() {
    redoStack = [];
}