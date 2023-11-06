// Define the mode of drawing and the default values for symmetries and petals
const Mode = {
    SYMMETRY: 'symmetry',
    RADIAL: 'radial'
};

// Starting defaults
let currentMode = Mode.SYMMETRY;
let symmetry = 4; // Default to four-way symmetry as a sensible default
let petals = 10; // Default number of petals

// Set up the canvas and event listeners when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    const symmetriesButton = document.getElementById('symmetriesButton');
    const radialButton = document.getElementById('radialButton');
    const petalSlider = document.getElementById('petalSlider');
    const symmetrySelector = document.getElementById('symmetrySelector');

    symmetriesButton.addEventListener('click', () => toggleMode(Mode.SYMMETRY));
    radialButton.addEventListener('click', () => toggleMode(Mode.RADIAL));
    petalSlider.addEventListener('input', (e) => petals = e.target.value);
    symmetrySelector.addEventListener('change', (e) => symmetry = e.target.value);
});

// Toggle between symmetry and radial modes
function toggleMode(mode) {
    currentMode = mode;
    document.getElementById('symmetryOptions').classList.toggle('collapse', mode !== Mode.SYMMETRY);
    document.getElementById('radialOptions').classList.toggle('collapse', mode !== Mode.RADIAL);
}

// p5.js functions for drawing
function setup() {
    createCanvas(windowWidth, windowHeight);
    background(255);
}

function draw() {
    if (mouseIsPressed && mouseOverCanvas()) {
        drawSymmetricalLines(mouseX, mouseY, pmouseX, pmouseY);
    }
}

// Simplified function to draw lines according to the current mode
function drawSymmetricalLines(x, y, px, py) {
    const count = currentMode === Mode.SYMMETRY ? symmetry : petals;
    const angle = TWO_PI / count;

    for (let i = 0; i < count; i++) {
        const currentAngle = angle * i;
        drawLineAtAngle(x, y, px, py, currentAngle, currentMode === Mode.SYMMETRY);
    }
}

// Drawing a line at a given angle and optionally reflecting it
function drawLineAtAngle(x, y, px, py, angle, reflect = false) {
    push();
    translate(width / 2, height / 2);
    rotate(angle);
    if (reflect) scale(1, -1);
    line(x - width / 2, y - height / 2, px - width / 2, py - height / 2);
    pop();
}

// Check if the mouse is over the canvas area
function mouseOverCanvas() {
    return mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height;
}

// Adjust canvas size when the window is resized
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background(255);
}
