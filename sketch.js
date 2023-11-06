const Mode = {
    SYMMETRY: 'symmetry',
    RADIAL: 'radial'
};

let currentMode = Mode.SYMMETRY;
let symmetry = 4;
let petals = 10;

document.addEventListener('DOMContentLoaded', () => {
    const symmetriesButton = document.getElementById('symmetriesButton');
    const radialButton = document.getElementById('radialButton');
    const symmetryOptions = document.getElementById('symmetryOptions');
    const radialOptions = document.getElementById('radialOptions');
    const petalSlider = document.getElementById('petalSlider');
    const symmetryInput = document.getElementById('symmetryInput'); // Updated to symmetryInput
    const clearButton = document.getElementById('clearButton');

    symmetriesButton.addEventListener('click', () => toggleMode(Mode.SYMMETRY, symmetryOptions, radialOptions));
    radialButton.addEventListener('click', () => toggleMode(Mode.RADIAL, radialOptions, symmetryOptions));
    petalSlider.addEventListener('input', event => {
        if (currentMode === Mode.RADIAL) petals = parseInt(event.target.value, 10);
    });
    symmetryInput.addEventListener('input', event => { // Updated to listen for 'input' event
        if (currentMode === Mode.SYMMETRY) {
            const value = parseInt(event.target.value, 10);
            if (value >= 2) symmetry = value; // Ensure at least 2-way symmetry
        }
    });
    clearButton.addEventListener('click', clearCanvas);
});


function toggleMode(mode, showElement, hideElement) {
    currentMode = mode;
    showElement.classList.toggle('collapse');
    hideElement.classList.add('collapse');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
}

function clearCanvas() {
    clear();
    background(255);
}

function drawSymmetricalLines(x, y, px, py) {
    const angle = TWO_PI / (currentMode === Mode.RADIAL ? petals : symmetry);
    for (let i = 0; i < (currentMode === Mode.RADIAL ? petals : symmetry); i++) {
        push();
        translate(width / 2, height / 2);
        rotate(angle * i);
        if (currentMode === Mode.SYMMETRY && i % 2 === 1) scale(1, -1);
        line(currentMode === Mode.RADIAL ? 0 : x, currentMode === Mode.RADIAL ? 0 : y, px, py);
        pop();
    }
}

function draw() {
    if (mouseIsPressed && mouseOverCanvas()) {
        drawSymmetricalLines(mouseX - width / 2, mouseY - height / 2, pmouseX - width / 2, pmouseY - height / 2);
    }
}

function mouseOverCanvas() {
    const sidebarWidth = document.getElementById('sidebar').offsetWidth;
    return mouseX > sidebarWidth && mouseX < windowWidth && mouseY > 0 && mouseY < windowHeight;
}

function windowResized() {
    resizeCanvas(windowWidth - document.getElementById('sidebar').offsetWidth, windowHeight);
}
