let shortcuts = document.querySelector("#shortcuts-container");
let canvases = document.querySelectorAll(".canvas");


let shortcutsButton = document.querySelector('#shortcuts-button');
shortcutsButton.addEventListener('click', () => {
    canvases.forEach(element => {
        element.style.visibility = "hidden";
        shortcuts.style.display = "flex";
    });
});

let shortcutClose = document.querySelector("#shortcut-close");
shortcutClose.addEventListener('click', () => {
    canvases.forEach(element => {
        element.style.visibility = "visible";
        shortcuts.style.display = "none";
    });
});