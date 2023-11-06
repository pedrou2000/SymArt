const SYMMETRY_OPTIONS = {
    TWO_WAY: 2,
    FOUR_WAY: 4,
    SIX_WAY: 6,
    EIGHT_WAY: 8,
    TEN_WAY: 10,
    TWELVE_WAY: 12,
    RADIAL: 'radial', // Radial symmetry option
};

let symmetry = SYMMETRY_OPTIONS.FOUR_WAY; // Default symmetry
let petals = 10; // Default number of petals

function setup() {
    createCanvas(windowWidth, windowHeight);
    setupSymmetrySelector();
    // Add event listener for the petal slider
    const petalSlider = document.getElementById('petalSlider');
    petalSlider.addEventListener('input', function(event) {
        petals = event.target.value;
    });

    // Add event listener for the clear button
    const clearButton = document.getElementById('clearButton');
    clearButton.addEventListener('click', function() {
        clearCanvas();
    });
}
// Function to clear the canvas
function clearCanvas() {
    clear(); // Clears the pixels within a buffer
    background(255); // Set to white background
}

function setupSymmetrySelector() {
    const selector = document.getElementById('symmetrySelector');
    selector.addEventListener('change', function(event) {
        setSymmetry(event.target.value);
    });
}

function setSymmetry(newSymmetry) {
    symmetry = newSymmetry;
}

function drawSymmetricalLines(x, y, px, py) {
    if (symmetry === SYMMETRY_OPTIONS.RADIAL) {
        drawRadialLines(x, y, px, py);
    } else {
        const angle = TWO_PI / symmetry;
        for (let i = 0; i < symmetry; i++) {
            drawLineAtAngle(x, y, px, py, angle * i);
            drawLineAtAngle(x, y, px, py, angle * i, true);
        }
    }
}

function drawRadialLines(x, y, px, py) {
    const angle = TWO_PI / petals;
    for (let i = 0; i < petals; i++) {
        push();
        translate(width / 2, height / 2);
        rotate(angle * i);
        let sx = 0; // Start at the center for radial symmetry
        let sy = 0;
        line(sx, sy, x, y);
        pop();
    }
}

function drawLineAtAngle(x, y, px, py, angle, reflect = false) {
    push();
    translate(width / 2, height / 2);
    rotate(angle);
    if (reflect) scale(1, -1);
    line(x, y, px, py);
    pop();
}

function draw() {
    // Check if the mouse is pressed and over the canvas
    if (mouseIsPressed && mouseOverCanvas()) {
        const mx = mouseX - width / 2;
        const my = mouseY - height / 2;
        const pmx = pmouseX - width / 2;
        const pmy = pmouseY - height / 2;
        drawSymmetricalLines(mx, my, pmx, pmy);
    }
}

// Updated helper function to check if the mouse is over the canvas area specifically
function mouseOverCanvas() {
    const sidebarWidth = document.getElementById('sidebar').offsetWidth;
    // Check if the mouse is within the bounds of the canvas, accounting for the sidebar
    return mouseX > sidebarWidth && mouseX < windowWidth && mouseY > 0 && mouseY < windowHeight;
}

function windowResized() {
    const canvasWidth = windowWidth - document.getElementById('sidebar').offsetWidth;
    const canvasHeight = windowHeight;
    resizeCanvas(canvasWidth, canvasHeight);
}