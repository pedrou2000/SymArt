const Mode = {
    SYMMETRY: 'symmetry',
    RADIAL: 'radial'
};

let currentMode = Mode.SYMMETRY;
let symmetry = 64;
let petals = 10;

document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
    setupButtonListeners();
    setupInputListeners();
    setupSidebarToggle();
}

function setupButtonListeners() {
    document.getElementById('symmetriesButton').addEventListener('click', () => toggleMode(Mode.SYMMETRY));
    document.getElementById('radialButton').addEventListener('click', () => toggleMode(Mode.RADIAL));
    document.getElementById('clearButton').addEventListener('click', clearCanvas);
    document.getElementById('bgColorButton').addEventListener('click', toggleColorPicker);
    document.getElementById('pencilColorButton').addEventListener('click', togglePencilOptions);
    document.getElementById('pencilWidthButton').addEventListener('click', togglePencilOptions);
    document.getElementById('downloadButton').addEventListener('click', downloadCanvas);
}

function setupInputListeners() {
    document.getElementById('petalInput').addEventListener('input', handlePetalInput);
    document.getElementById('symmetryInput').addEventListener('input', handleSymmetryInput);
    document.getElementById('bgColorPicker').addEventListener('input', changeBackgroundColor);
    document.getElementById('pencilColorPicker').addEventListener('input', changeStrokeColor);
    document.getElementById('pencilWidthRange').addEventListener('input', changeStrokeWeight);
}

function setupSidebarToggle() {
    const toggleSidebarButton = document.getElementById('toggleSidebarButton');
    toggleSidebarButton.addEventListener('click', toggleSidebar);
}

function toggleMode(mode) {
    currentMode = mode;
    const showElement = document.getElementById(`${mode}Options`);
    const hideElement = document.getElementById(`${mode === Mode.SYMMETRY ? Mode.RADIAL : Mode.SYMMETRY}Options`);
    showElement.classList.remove('collapse');
    hideElement.classList.add('collapse');
}

function handlePetalInput(event) {
    if (currentMode === Mode.RADIAL) {
        petals = Math.max(parseInt(event.target.value, 10), 2); // Ensure at least 2 petals
    }
}

function handleSymmetryInput(event) {
    if (currentMode === Mode.SYMMETRY) {
        symmetry = Math.max(parseInt(event.target.value, 10), 2); // Ensure at least 2-way symmetry
    }
}

function toggleColorPicker() {
    const bgColorOptions = document.getElementById('bgColorOptions');
    bgColorOptions.classList.toggle('collapse');
}

function togglePencilOptions(event) {
    const optionsId = event.currentTarget.id.replace('Button', 'Options');
    const optionsElement = document.getElementById(optionsId);
    optionsElement.classList.toggle('collapse');
}

function changeBackgroundColor(event) {
    background(event.target.value);
}

function changeStrokeColor(event) {
    stroke(event.target.value);
}

function changeStrokeWeight(event) {
    strokeWeight(event.target.value);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const canvasContainer = document.getElementById('canvas-container');
    sidebar.classList.toggle('collapsed');
    adjustCanvasLayout(sidebar, canvasContainer);
}

function adjustCanvasLayout(sidebar, canvasContainer) {
    const sidebarWidth = sidebar.classList.contains('collapsed') ? 0 : sidebar.offsetWidth;
    canvasContainer.style.marginLeft = `${sidebarWidth}px`;
    const canvas = document.getElementById('defaultCanvas0');
    if (canvas) {
        canvas.style.left = `${sidebarWidth}px`;
    }
}
// Canvas and drawing related functions
function setup() {
    createCanvasInContainer();
    setInitialCanvasState();
}

function createCanvasInContainer() {
    const canvasContainer = document.getElementById('canvas-container');
    const cw = canvasContainer.offsetWidth;
    const ch = canvasContainer.offsetHeight;
    const canvas = createCanvas(cw, ch);
    canvas.parent('canvas-container');
}

function setInitialCanvasState() {
    clearCanvas();
}

function clearCanvas() {
    clear();
    background(255);
}

function draw() {
    if (shouldDraw()) {
        const x = mouseX - width / 2;
        const y = mouseY - height / 2;
        const px = pmouseX - width / 2;
        const py = pmouseY - height / 2;
        drawSymmetricalLines(x, y, px, py);
    }
}

function shouldDraw() {
    return mouseIsPressed && mouseOverCanvas() && !mouseIsOverSidebar() && !mouseIsOverGearIcon();
}

function drawSymmetricalLines(x, y, px, py) {
    const angle = TWO_PI / (currentMode === Mode.RADIAL ? petals : symmetry);
    for (let i = 0; i < (currentMode === Mode.RADIAL ? petals : symmetry); i++) {
        drawLineInSymmetry(x, y, px, py, angle, i);
    }
}

function drawLineInSymmetry(x, y, px, py, angle, index) {
    push();
    translate(width / 2, height / 2);
    rotate(angle * index);
    if (currentMode === Mode.SYMMETRY && index % 2 === 1) scale(1, -1);
    line(currentMode === Mode.RADIAL ? 0 : x, currentMode === Mode.RADIAL ? 0 : y, px, py);
    pop();
}

// Helper functions for UI interactions
function mouseIsOverSidebar() {
    const sidebar = document.getElementById('sidebar');
    return sidebar.classList.contains('collapsed') ? false : mouseX <= sidebar.offsetWidth;
}

function mouseOverCanvas() {
    const canvasRect = document.getElementById('defaultCanvas0').getBoundingClientRect();
    return mouseX > canvasRect.left && mouseX < canvasRect.right && mouseY > canvasRect.top && mouseY < canvasRect.bottom;
}

function mouseIsOverGearIcon() {
    const gearIconRect = document.getElementById('gearIcon').getBoundingClientRect();
    return mouseX >= gearIconRect.left && mouseX <= gearIconRect.right &&
           mouseY >= gearIconRect.top && mouseY <= gearIconRect.bottom;
}

// Window resize handling
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Function for downloading the canvas
function downloadCanvas() {
    saveCanvas('myCanvas', 'png');
}

// Call setup function on window load
window.onload = setup;
