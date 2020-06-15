export default class Color {

    // add a 0 to the front of the hexstring if its length is 1
    hexify(hexString) {
        if (hexString.length === 1) { return `0${hexString}`; } 
        return hexString;
    }

    rgbToHex(rgbaObject) {
        // convert each RGB value to a 2 character hex string
        let red = this.hexify(rgbaObject.red.toString(16));
        let green = this.hexify(rgbaObject.green.toString(16));
        let blue = this.hexify(rgbaObject.blue.toString(16));
        // return the concatenated RGB values as a full hex color string
        return `#${red}${green}${blue}`;
    }

    hexToRGB(hexString) {
        let red = parseInt(hexString.slice(1,3), 16);
        let green = parseInt(hexString.slice(3,5), 16);
        let blue = parseInt(hexString.slice(5, 7), 16);
        return {
            red: red,
            green: green,
            blue: blue,
            alpha: 255
        }
    }

}
