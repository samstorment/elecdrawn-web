let hotkeys = document.querySelector("#hotkeys-container");
let canvases = document.querySelectorAll(".canvas");


let hotkeysButton = document.querySelector('#hotkeys-button');
hotkeysButton.addEventListener('click', () => {
    canvases.forEach(element => {
        element.style.visibility = "hidden";
        hotkeys.style.display = "flex";
    });
});

let hotkeysClose = document.querySelector("#hotkeys-close");
hotkeysClose.addEventListener('click', () => {
    canvases.forEach(element => {
        element.style.visibility = "visible";
        hotkeys.style.display = "none";
    });
});