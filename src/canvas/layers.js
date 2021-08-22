import { getMouse } from "./util.js";

const container = document.querySelector('#layer-container');

let startY = 0;
let startHeight = 0;
let resizeAllowed = false;

container.addEventListener('mousedown', e => {

    const containerMouse = getMouse(e, container);
    const bodyMouse = getMouse(e, document.body);
    startY = bodyMouse.mouseY;
    startHeight = container.offsetHeight;

    if (containerMouse.mouseY <= 4) resizeAllowed = true;
});

window.addEventListener('mousemove', e => {

    if (!resizeAllowed) return;

    const { mouseY } = getMouse(e, document.body);
    const change = mouseY - startY;

    container.style.height = `${startHeight - change}px`
});

window.addEventListener('mouseup', e => {
    resizeAllowed = false;
});