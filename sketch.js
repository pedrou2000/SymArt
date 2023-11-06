const Mode = {
    SYMMETRY: 'symmetry',
    RADIAL: 'radial'
};

let currentMode = Mode.SYMMETRY;
let symmetry = 4; // Default to four-way symmetry
let petals = 10; // Default number of petals

document.addEventListener('DOMContentLoaded', setupUI);

function setupUI() {
    const symmetriesButton = document.getElementById('symmetriesButton');
    const radialButton = document.getElementById('radialButton');
    const petalSlider = document.getElementById('petalSlider');
    const symmetrySelector = document.getElementById('symmetrySelector');
    const clearButton = document.getElementById('clearButton');

    symmetriesButton.addEventListener('click', () => toggleMode(Mode.SYMMETRY));
    radialButton.addEventListener('click', () => toggleMode(Mode.RADIAL));
    petalSlider.addEventListener('input', (e) => petals = e.target.value);
    symmetrySelector.addEventListener('change', (e) => symmetry = e.target.value);
    clearButton.addEventListener('click', clearCanvas);
}

function toggleMode(mode) {
    currentMode = mode;
    updateUIForMode(mode);
}

function updateUIForMode(mode) {
    document.getElementById('symmetryOptions').classList.toggle('collapse', mode !== Mode.SYMMETRY);
    document.getElementById('radialOptions').classList.toggle('collapse', mode !== Mode.RADIAL);
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(255);
}

function draw() {
    if (mouseIsPressed && mouseOverCanvas()) {
        drawSymmetricalLines(mouseX, mouseY, pmouseX, pmouseY);
    }
}

function drawSymmetricalLines(x, y, px, py) {
    const count = currentMode === Mode.SYMMETRY ? symmetry : petals;
    const angle = TWO_PI / count;

    for (let i = 0; i < count; i++) {
        drawLineAtAngle(x, y, px, py, angle * i, currentMode === Mode.SYMMETRY);
    }
}

function drawLineAtAngle(x, y, px, py, angle, reflect = false) {
    push();
    translate(width / 2, height / 2);
    rotate(angle);
    if (reflect) scale(1, -1);
    line(x - width / 2, y - height / 2, px - width / 2, py - height / 2);
    pop();
}

function mouseOverCanvas() {
    return mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height;
}

function clearCanvas() {
    background(255);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    clearCanvas(); // Clear the canvas to white after resizing
}
