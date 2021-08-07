// gets the starting X and Y position of given HTML element. Use this to find top left corner of canvas
function getElementPosition(element) {

    let boundingBox = element.getBoundingClientRect();
    let offsetX = boundingBox.left;
    let offsetY = boundingBox.top;

    const dynamicWidth = element.getBoundingClientRect().width;
    const staticWidth = element.offsetWidth;

    const scale = dynamicWidth / staticWidth;

    return {
        x: offsetX,
        y: offsetY,
        scale: scale
    }
}

//  returns the position of the mouse relative to the top left corner of the element
export function getMouse(event, element) {

    // Get the canvas X and Y coordinates so we knwow where to draw
    let { x, y, scale } = getElementPosition(element);

    return {
        mouseX: (event.clientX - x)  / scale,   
        mouseY: (event.clientY - y) / scale
    };
}

// we should get rid of this but a lot of stuff depends on it right now
export let redoStack = [];
export let undoStack = [];
export function clearRedoStack() {
    redoStack = [];
}

export function getKey(value) {

    // key object to store information about key that was pressed
    let key = {
        value: value,
        isDown: false,
        isUp: true,
        press: undefined,
        release: undefined,
    };

    // lets us track a key being up/down. Also lets us define custom press function on the fly
    let downHandler = event => {
        // if the key received from the event is the same as the argument we passed to keyboard. And the key isn't already down.
        if (event.key === key.value && key.isUp) {
            key.isDown = true;
            key.isUp = false;
        }
        // If the key.press function is defined, call it
        if (key.press) { key.press(); }
    };

    let upHandler = event => {
        if (event.key === key.value && key.isDown) {
            key.isDown = false;
            key.isUp = true;
        }
        if (key.release) { key.release(); }
    };

    // add the key event listeners
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);

    // detaching event listeners. IDK if this is neccesary, i've never done this
    key.unsubscribe = () => {
        window.removeEventListener("keydown", downHandler);
        window.removeEventListener("keyup", upHandler);
    }

    return key;
}