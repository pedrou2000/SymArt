const SYMMETRY_OPTIONS = {
    TWO_WAY: 2,
    FOUR_WAY: 4,
    SIX_WAY: 6,
    EIGHT_WAY: 8,
    TEN_WAY: 10,
    TWELVE_WAY: 12,
};

let symmetry = SYMMETRY_OPTIONS.FOUR_WAY; // Default symmetry

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(255);
    setupSymmetrySelector();
}

function setupSymmetrySelector() {
    const selector = document.getElementById('symmetrySelector');
    selector.addEventListener('change', function(event) {
        setSymmetry(int(event.target.value));
    });
}

function setSymmetry(newSymmetry) {
    symmetry = newSymmetry;
    background(255); // Clear the canvas
}

function drawSymmetricalLines(x, y, px, py) {
    const angle = TWO_PI / symmetry;
    for (let i = 0; i < symmetry; i++) {
        // Main line
        drawLineAtAngle(x, y, px, py, angle * i);
        // Reflected line
        drawLineAtAngle(x, y, px, py, angle * i, true);
    }
}

function drawLineAtAngle(x, y, px, py, angle, reflect=false) {
    push();
    translate(width / 2, height / 2);
    rotate(angle);
    if (reflect) scale(1, -1);
    line(x, y, px, py);
    pop();
}

function draw() {
    if (mouseIsPressed) {
        const mx = mouseX - width / 2;
        const my = mouseY - height / 2;
        const pmx = pmouseX - width / 2;
        const pmy = pmouseY - height / 2;
        drawSymmetricalLines(mx, my, pmx, pmy);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background(255);
}