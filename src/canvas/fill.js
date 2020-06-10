export default class Fill {

    constructor(canvas, context) {
        this.canvas = canvas;
        this.context = context;
        this.pixelStack = [];
    }

    floodFill(startX, startY) {
        
        this.pixelStack.push( { x: startX, y: startY } );

        while (this.pixelStack.length !== 0) {

            let { x, y } = this.pixelStack.pop();
            let pixelPosition = (y * this.canvas + x) * 4;

           console.log(x, y);


        }
    }

}