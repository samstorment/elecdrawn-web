import Tool from './tool.js';
import { getMouse, readFile } from '../canvas/util.js';

export default class ImageTool extends Tool {

    constructor(context) {
        super(context);
        this.image = new Image();
        this.image.crossOrigin = "Anonymous";
        this.uploadClick();
        this.fileDrop();
    }

    // lets default to a 2 pixel black line with a round end cap
    start(event) {
        super.start(event);
        this.context.beginPath();
        // call draw once to draw a single dot if its a left click
        this.draw(event);
        this.clear();
    }

    draw(event) { 
        super.draw(event);
        // if painting is false, the mouse isn't clicked so we shouldn't draw
        if (!this.painting) { return; }
        this.drawHoverCursor(event, this.context);
    }

    drawHoverCursor(event, context=this.previewContext) {
        let { mouseX, mouseY } = getMouse(event, context.canvas);
        this.clear();

        let x = mouseX - this.image.width / 2;
        let y = mouseY - this.image.height / 2;

        context.drawImage(this.image, x, y);
    }

    uploadClick() {
        document.querySelector('#image-upload').addEventListener('change', e => {
            const files = Array.from(e.target.files);
            this.uploadFiles(files);
        });
    }

    fileDrop() {

        const container = document.querySelector('#canvas-container');

        container.addEventListener('dragover', e => e.preventDefault());

        container.addEventListener('drop', e => {
            e.preventDefault();

            const files = Array.from(e.dataTransfer.files);
            const urlData = e.dataTransfer.getData('text/html');
            
            if (files.length <= 0 && !urlData) { return; }

            let src = null;
            const imageHtml = document.createElement('div');
            imageHtml.innerHTML = urlData;
            const img = imageHtml.querySelector('img');
            if (img) {
                console.log(img);
                img.crossOrigin = "Anonymous";
                img.onerror = () => alert("bad image");
                src = img.getAttribute('src');
            }

            if (files.length > 0) this.uploadFiles(files);
            else if (src) this.addImage('Image', src);
        });
    }

    uploadFiles(files) {
        files.forEach(async f => {

            if (f.type.split('/')[0] !== 'image') return;

            const src = await readFile(f);

            this.addImage(f.name, src);
        });
    }

    addImage(name, src) {

        const row = document.createElement('button');
        row.classList.add('sidebar-subrow', 'image-subrow');
        row.style.display = 'flex';

        document.querySelector('#image-row').appendChild(row);
        
        row.innerHTML = `
            <span>${name}</span>
            <img class="image-icon" src="${src}"></img>
        `;

        row.addEventListener('click', e => {
            document.querySelectorAll('.image-selected').forEach(ele => {
                ele.classList.toggle('image-selected');
            });
            this.image.src = src;
            e.target.classList.toggle('image-selected');
        });
    }
}