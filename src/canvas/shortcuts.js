import CanvasState from '../canvas/canvas-state.js';

export const shortcuts = (e, drawTools, context) => {

    const keyIs = (key) => e.key.toLowerCase() === key.toLowerCase();

    if (e.ctrlKey) {
        if (keyIs('z')) { CanvasState.undo(context); }
        if (keyIs('y')) { CanvasState.redo(context); }
        if (keyIs('s')) {
            e.preventDefault();
            let downloadCanvasButton = document.querySelector('#download-canvas');
            downloadCanvasButton.click();
        }
        return;
    }

    if (keyIs('b')) drawTools.setTool('brush');
    if (keyIs('d')) drawTools.setTool('radial');
    if (keyIs('e')) drawTools.setTool('eraser');
    if (keyIs('f')) drawTools.setTool('brushFill');
    if (keyIs('g')) drawTools.setTool('image');
    if (keyIs('i')) drawTools.setTool('strokePicker');
    if (keyIs('j')) drawTools.setTool('fillPicker');
    if (keyIs('k')) drawTools.setTool('bucket');
    if (keyIs('l')) drawTools.setTool('lasso');
    if (keyIs('m')) drawTools.setTool('mirror');
    if (keyIs('n')) drawTools.setTool('line');
    if (keyIs('o')) drawTools.setTool('oval');
    if (keyIs('p')) drawTools.setTool('polygon');
    if (keyIs('r')) drawTools.setTool('rectangle');
    if (keyIs('t')) drawTools.setTool('text');
    if (keyIs('v')) drawTools.setTool('select');
    if (keyIs('escape')) {
        document.querySelector('#canvas-clear').click();
    }
    if (keyIs(' ')) {
        document.querySelector('#restore-button').click();
    }
    if (keyIs('`')) {
        document.querySelector('#burger-button').click();
    }
}

const mediaQuery = window.matchMedia('(max-width: 800px)');

const setTip = (selector, tip, options={}) => {
    const defaultOptions = {
        content: 'none',
        placement: 'right',
        popperOptions: {
            modifiers: [
                {
                    name: 'flip',
                    options: {
                        fallbackPlacements: ['bottom', 'top', 'left'],
                    }
                }
            ]
        },
        zIndex: 999999,
        duration: 0,
        followCursor: 'vertical',
        hideOnClick: false,
        touch: false,
        ...options
    }
    
    tippy(selector, {...defaultOptions, content: tip });
}

// sidebar tool tips
setTip('#brush-row', 'B');
setTip('#radial-row', 'D');
setTip('#eraser-row', 'E');
setTip('#brushFill-row', 'F');
setTip('#image-row', 'G');
setTip('#strokePicker-row', 'I');
setTip('#fillPicker-row', 'J');
setTip('#bucket-row', 'K');
setTip('#lasso-row', 'L');
setTip('#mirror-row', 'M');
setTip('#line-row', 'N');
setTip('#oval-row', 'O');
setTip('#polygon-row', 'P');
setTip('#rectangle-row', 'R');
setTip('#text-row', 'T');
setTip('#select-row', 'V');
// sidebar buttons
setTip('#canvas-clear', 'Esc');
setTip('#download-canvas', 'Ctrl + S');

const titlebarOptions = {followCursor: '', placement: 'bottom'};

// titlebar
setTip('#burger-button', '`', titlebarOptions);
setTip('#restore-button', 'Spacebar', titlebarOptions);
setTip('#undo-button', 'Ctrl + Z', titlebarOptions);
setTip('#redo-button', 'Ctrl + Y', titlebarOptions);