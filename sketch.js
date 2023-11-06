const Mode = {
    SYMMETRY: 'symmetry',
    RADIAL: 'radial'
};

let currentMode = Mode.SYMMETRY;
let symmetry = 16;
let petals = 10;

document.addEventListener('DOMContentLoaded', () => {
    const symmetriesButton = document.getElementById('symmetriesButton');
    const radialButton = document.getElementById('radialButton');
    const symmetryOptions = document.getElementById('symmetryOptions');
    const radialOptions = document.getElementById('radialOptions');
    const petalInput = document.getElementById('petalInput'); // Updated to petalInput
    const symmetryInput = document.getElementById('symmetryInput');
    const clearButton = document.getElementById('clearButton');

    symmetriesButton.addEventListener('click', () => toggleMode(Mode.SYMMETRY, symmetryOptions, radialOptions));
    radialButton.addEventListener('click', () => toggleMode(Mode.RADIAL, radialOptions, symmetryOptions));

    petalInput.addEventListener('input', event => { // Updated to petalInput
        if (currentMode === Mode.RADIAL) {
            const value = parseInt(event.target.value, 10);
            if (value >= 2) petals = value; // Ensure at least 2 petals
        }
    });

    symmetryInput.addEventListener('input', event => {
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
    const canvasContainer = document.getElementById('canvas-container');
    const cw = canvasContainer.offsetWidth;
    const ch = canvasContainer.offsetHeight;
    
    // Create a canvas that is smaller than the container dimensions
    // For example, 90% of the width and height
    const canvas = createCanvas(cw, ch);
    canvas.parent('canvas-container'); // This makes sure the canvas is placed inside the 'canvas-container' div

    // Since the container uses flexbox, no need to set absolute position styles
    // canvas.style('position', 'absolute'); // These lines can be removed
    // canvas.style('left', '0px'); // These lines can be removed
    // canvas.style('top', '0px'); // These lines can be removed

    background(200); // Light grey background for the canvas
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
    const canvasRect = document.getElementById('defaultCanvas0').getBoundingClientRect();
    return mouseX > canvasRect.left && mouseX < canvasRect.right && mouseY > canvasRect.top && mouseY < canvasRect.bottom;
}




function windowResized() {
    // No need to subtract the sidebar width anymore
    resizeCanvas(windowWidth, windowHeight);

    // Update canvas position
    const canvas = document.getElementById('defaultCanvas0');
    if (canvas) {
        canvas.style('position', 'absolute');
        canvas.style('left', '250px'); // Position the canvas right next to the sidebar
        canvas.style('top', '0px');
    }
}



