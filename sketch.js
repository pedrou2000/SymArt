const Mode = {
    SYMMETRY: 'symmetry',
    RADIAL: 'radial'
};

let currentMode = Mode.SYMMETRY;
let symmetry = 64;
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

const toggleSidebarButton = document.getElementById('toggleSidebarButton');
const sidebar = document.getElementById('sidebar');
const canvasContainer = document.getElementById('canvas-container');

toggleSidebarButton.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    const sidebarWidth = sidebar.classList.contains('collapsed') ? 0 : 0; // Adjust to your sidebar width
    canvasContainer.style.marginLeft = `${sidebarWidth}px`; // Set margin-left based on the sidebar width
    const canvas = document.getElementById('defaultCanvas0');
    if (canvas) {
        canvas.style.left = `${sidebarWidth}px`; // Adjust canvas position based on sidebar width
    }
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
    const canvas = createCanvas(cw, ch);
    canvas.parent('canvas-container'); // This makes sure the canvas is placed inside the 'canvas-container' div
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
    if (mouseIsPressed && mouseOverCanvas() && !mouseIsOverSidebar() && !mouseIsOverGearIcon()) {
        drawSymmetricalLines(mouseX - width / 2, mouseY - height / 2, pmouseX - width / 2, pmouseY - height / 2);
    }
}


// Helper function to determine if the mouse is over the sidebar
function mouseIsOverSidebar() {
    return sidebar.classList.contains('collapsed') ? false : mouseX <= sidebar.offsetWidth;
}

function mouseOverCanvas() {
    const sidebarWidth = document.getElementById('sidebar').offsetWidth;
    const canvasRect = document.getElementById('defaultCanvas0').getBoundingClientRect();
    return mouseX > canvasRect.left && mouseX < canvasRect.right && mouseY > canvasRect.top && mouseY < canvasRect.bottom;
}

function mouseIsOverGearIcon() {
    const gearIconRect = document.getElementById('gearIcon').getBoundingClientRect();
    return mouseX >= gearIconRect.left && mouseX <= gearIconRect.right &&
           mouseY >= gearIconRect.top && mouseY <= gearIconRect.bottom;
}



function windowResized() {
    const sidebarWidth = sidebar.classList.contains('collapsed') ? 0 : 250; // Adjust to your sidebar width
    resizeCanvas(windowWidth - sidebarWidth, windowHeight);
    
    const canvas = document.getElementById('defaultCanvas0');
    if (canvas) {
        canvas.style.left = `${sidebarWidth}px`; // Adjust canvas position based on sidebar width
    }
}




