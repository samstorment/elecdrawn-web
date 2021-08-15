// add a 0 to the front of the hexstring if its length is 1
function hexify(hexString) {
    if (hexString.length === 1) { return `0${hexString}`; } 
    return hexString;
}

export function rgbToHex(rgbArray) {
    // convert each RGB value to a 2 character hex string
    let red = hexify(rgbArray[0].toString(16));
    let green = hexify(rgbArray[1].toString(16));
    let blue = hexify(rgbArray[2].toString(16));
    // return the concatenated RGB values as a full hex color string
    return `#${red}${green}${blue}`;
}

export function hexToRGB(hexString) {
    let red = parseInt(hexString.slice(1,3), 16);
    let green = parseInt(hexString.slice(3,5), 16);
    let blue = parseInt(hexString.slice(5, 7), 16);
    return [ red, green, blue, 255 ]; 
}

// rgb color of particular pixel
export function getPixelColor(x, y, context) {
    let pixel = context.getImageData(x, y, 1, 1).data;
    return Array.from(pixel);
}

// takes picker and slider ids and returns css rgba function
export const pickerSliderToRgba = (picker, slider) => {
    const colorPicker = document.querySelector(`#${picker}`);
    const opacitySlider = document.querySelector(`#${slider}`);

    const [r,g,b] = hexToRGB(colorPicker.value);
    const a = opacitySlider.value;

    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export const getStrokeColor = () => {
    return pickerSliderToRgba('stroke-color', 'stroke-opacity');
}

export const getFillColor = () => {
    return pickerSliderToRgba('fill-color', 'fill-opacity');
}

export const setStrokeColor = (context) => {
    context.strokeStyle = getStrokeColor();
}

export const setFillColor = (context) => {
    context.fillStyle = getFillColor();
}