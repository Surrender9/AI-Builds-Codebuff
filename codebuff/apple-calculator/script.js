let currentOperand = "0";
let shouldResetScreen = false;
let zoomLevel = 1;
let isInverseActive = false;
let currentSpacing = 1;

function updateDisplay() {
  const displayElement = document.getElementById("current-operand");
  displayElement.textContent = currentOperand;
}

function appendText(text) {
    if (isInverseActive && event && event.target.hasAttribute('data-inverse')) {
        text = event.target.getAttribute('data-inverse');
        isInverseActive = false;
        document.getElementById('inverseBtn').classList.remove('active');
    }
    
    if (currentOperand === "0" || shouldResetScreen) {
        currentOperand = text;
        shouldResetScreen = false;
    } else {
        currentOperand += text;
    }
    updateDisplay();
}

function clearDisplay() {
  currentOperand = "0";
  updateDisplay();
}

function toggleSign() {
  // Try to convert the whole expression to a number
  try {
    let result = eval(prepareExpression(currentOperand));
    result = -result;
    currentOperand = result.toString();
    updateDisplay();
  } catch (error) {
    currentOperand = "Error";
    updateDisplay();
  }
}

function percentage() {
  try {
    let result = eval(prepareExpression(currentOperand));
    result = result / 100;
    currentOperand = result.toString();
    updateDisplay();
  } catch (error) {
    currentOperand = "Error";
    updateDisplay();
  }
}

function calculate() {
  try {
    let expr = prepareExpression(currentOperand);
    let computation = eval(expr);
    currentOperand = computation.toString();
    shouldResetScreen = true;
    updateDisplay();
  } catch (error) {
    currentOperand = "Error";
    shouldResetScreen = true;
    updateDisplay();
  }
}

// Prepare the expression for eval by replacing UI symbols and functions.
function prepareExpression(exp) {
  return exp
    .replace(/÷/g, "/")
    .replace(/×/g, "*")
    .replace(/√\(/g, "Math.sqrt(")
    .replace(/sin\(/g, "Math.sin(")
    .replace(/cos\(/g, "Math.cos(")
    .replace(/tan\(/g, "Math.tan(")
    .replace(/asin\(/g, "Math.asin(")
    .replace(/acos\(/g, "Math.acos(")
    .replace(/atan\(/g, "Math.atan(")
    .replace(/log\(/g, "Math.log10(")
    .replace(/ln\(/g, "Math.log(")
    .replace(/e\^/g, "Math.exp")
    .replace(/e\^?\(/g, "Math.exp(")
    .replace(/10\^/g, "Math.pow(10,")
    .replace(/\^/g, "**");
}

// Mode switching
function switchMode(mode) {
  const calcSection = document.getElementById("calc-section");
  const graphSection = document.getElementById("graph-section");
  const calcBtn = document.getElementById("calcModeBtn");
  const graphBtn = document.getElementById("graphModeBtn");
  if (mode === "calc") {
    calcSection.style.display = "block";
    graphSection.style.display = "none";
    calcBtn.classList.add("active");
    graphBtn.classList.remove("active");
  } else if (mode === "graph") {
    calcSection.style.display = "none";
    graphSection.style.display = "block";
    graphBtn.classList.add("active");
    calcBtn.classList.remove("active");
    // Optionally clear any previous graph
    clearGraph();
  }
}

// Graphing functions
function plotGraph() {
  const input = document.getElementById("function-input").value;
  if (!input) return;
  
  const canvas = document.getElementById("graph-canvas");
  const ctx = canvas.getContext("2d");
  
  // Set canvas size to be square based on container width
  const containerWidth = canvas.parentElement.offsetWidth;
  canvas.width = containerWidth;
  canvas.height = containerWidth;
  
  // Clear the canvas and draw grid
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid(ctx, canvas);
  
  // Prepare the function expression
  let expr = prepareExpression(input);
  
  // Define graph parameters - adjusted range to -10 to +10
  const xMin = -10;
  const xMax = 10;
  const yMin = -10;
  const yMax = 10;
  
  // Calculate pixel ratios
  const xPixelRatio = canvas.width / (xMax - xMin);
  const yPixelRatio = canvas.height / (yMax - yMin);
  
  // Function to convert math coordinates to pixel coordinates
  const toPixelCoords = (x, y) => ({
    px: (x - xMin) * xPixelRatio,
    py: canvas.height - ((y - yMin) * yPixelRatio)
  });
  
  // Draw graph
  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ff9f0a";
  
  let isFirstValidPoint = true;
  let lastValidY = null;
  
  // Sample more points for smoother curves
  const steps = canvas.width;
  const dx = (xMax - xMin) / steps;
  
  for (let i = 0; i <= steps; i++) {
    const x = xMin + (i * dx);
    let y;
    
    try {
      // Evaluate the function for this x value
      y = evaluateMathExpression(expr, x);
      
      // Skip if y is not a valid number or is infinite
      if (!isFinite(y) || isNaN(y)) {
        lastValidY = null;
        continue;
      }
      
      // Skip extreme values that would make the graph look discontinuous
      if (lastValidY !== null && Math.abs(y - lastValidY) > 20) {
        lastValidY = y;
        ctx.stroke();
        ctx.beginPath();
        continue;
      }
      
      // Convert to pixel coordinates
      const { px, py } = toPixelCoords(x, y);
      
      if (isFirstValidPoint) {
        ctx.moveTo(px, py);
        isFirstValidPoint = false;
      } else {
        ctx.lineTo(px, py);
      }
      
      lastValidY = y;
    } catch (e) {
      lastValidY = null;
      continue;
    }
  }
  ctx.stroke();
  
  // Update value table
  updateValueTable(expr, xMin, xMax);
}

function evaluateMathExpression(expr, x) {
  // Create a safe evaluation context with Math functions
  const context = {
    x: x,
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    asin: Math.asin,
    acos: Math.acos,
    atan: Math.atan,
    sqrt: Math.sqrt,
    log: Math.log10,
    ln: Math.log,
    exp: Math.exp,
    pow: Math.pow,
    pi: Math.PI,
    e: Math.E
  };
  
  // Replace mathematical constants
  expr = expr.replace(/π/g, 'pi')
           .replace(/PI/g, 'pi')
           .replace(/\be\b/g, 'Math.E');
  
  try {
    // Use Function constructor to create a safe evaluation environment
    const func = new Function(...Object.keys(context), `return ${expr}`);
    return func(...Object.values(context));
  } catch (e) {
    throw new Error('Invalid expression');
  }
}

function updateValueTable(expr, xMin, xMax) {
  const tableBody = document.getElementById('value-table-body');
  tableBody.innerHTML = '';
  
  // Calculate number of points based on spacing
  const points = Math.ceil((xMax - xMin) / currentSpacing) + 1;
  
  for (let i = 0; i < points; i++) {
    const x = xMin + (i * currentSpacing);
    if (x > xMax) break;
    
    try {
      const y = evaluateMathExpression(expr, x);
      if (isFinite(y) && !isNaN(y)) {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${x.toFixed(2)}</td>
          <td>${y.toFixed(3)}</td>
        `;
        tableBody.appendChild(row);
      }
    } catch (e) {
      continue;
    }
  }
}

function updateSpacing() {
  const spacingInput = document.getElementById('tick-spacing');
  let newSpacing = parseFloat(spacingInput.value);
  
  // Validate input
  if (isNaN(newSpacing) || newSpacing < 0.1) {
    newSpacing = 0.1;
    spacingInput.value = "0.1";
  } else if (newSpacing > 5) {
    newSpacing = 5;
    spacingInput.value = "5";
  }
  
  currentSpacing = newSpacing;
  const input = document.getElementById('function-input').value;
  if (input) {
    plotGraph();
  } else {
    const canvas = document.getElementById("graph-canvas");
    const ctx = canvas.getContext("2d");
    drawGrid(ctx, canvas);
  }
}

function drawGrid(ctx, canvas) {
  const size = Math.min(canvas.width, canvas.height);
  const totalRange = 20; // -10 to +10
  const step = size / totalRange;
  
  // Draw minor grid lines
  ctx.strokeStyle = '#2c2c2e';
  ctx.lineWidth = 0.5;
  
  // Draw grid lines
  for (let i = 0; i <= totalRange; i++) {
    const pos = i * step;
    
    // Vertical lines
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, size);
    ctx.stroke();
    
    // Horizontal lines
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(size, pos);
    ctx.stroke();
  }
  
  // Draw axes
  ctx.strokeStyle = '#3c3c3e';
  ctx.lineWidth = 2;
  
  // X-axis
  ctx.beginPath();
  ctx.moveTo(0, size/2);
  ctx.lineTo(size, size/2);
  ctx.stroke();
  
  // Y-axis
  ctx.beginPath();
  ctx.moveTo(size/2, 0);
  ctx.lineTo(size/2, size);
  ctx.stroke();
  
  // Add numbers and tick marks
  ctx.font = '12px -apple-system, BlinkMacSystemFont, "SF Pro Display"';
  ctx.fillStyle = '#8e8e93';
  
  // Draw tick marks and numbers
  for (let i = -10; i <= 10; i += currentSpacing) {
    const x = (i + 10) * step;
    const y = size - (i + 10) * step;
    
    if (i === 0) continue; // Skip zero for cleaner look
    
    // X-axis ticks and numbers
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.beginPath();
    ctx.moveTo(x, size/2 - 3);
    ctx.lineTo(x, size/2 + 3);
    ctx.stroke();
    ctx.fillText(i.toString(), x, size/2 + 5);
    
    // Y-axis ticks and numbers
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.beginPath();
    ctx.moveTo(size/2 - 3, y);
    ctx.lineTo(size/2 + 3, y);
    ctx.stroke();
    ctx.fillText(i.toString(), size/2 - 5, y);
  }
}

function clearGraph() {
  const canvas = document.getElementById("graph-canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid(ctx, canvas);
}

function adjustZoom(factor) {
    zoomLevel *= factor;
    plotGraph();
}

// Initialize display on load
updateDisplay();

// Add keyboard support
document.addEventListener('keydown', (event) => {
    if (event.key >= '0' && event.key <= '9' || event.key === '.') {
        appendText(event.key);
    }
    if (event.key === '=' || event.key === 'Enter') {
        calculate();
    }
    if (event.key === 'Backspace') {
        currentOperand = currentOperand.slice(0, -1);
        if (currentOperand === '') currentOperand = '0';
        updateDisplay();
    }
    if (event.key === 'Escape') {
        clearDisplay();
    }
    if (event.key === '+') {
        appendText('+');
    }
    if (event.key === '-') {
        appendText('-');
    }
    if (event.key === '*') {
        appendText('×');
    }
    if (event.key === '/') {
        event.preventDefault();
        appendText('÷');
    }
    if (event.key === '^') {
        appendText('^');
    }
    if (event.key === '(') {
        appendText('(');
    }
    if (event.key === ')') {
        appendText(')');
    }
    // Scientific function shortcuts
    if (event.key === 's') {
        appendText('sin(');
    }
    if (event.key === 'c') {
        appendText('cos(');
    }
    if (event.key === 't') {
        appendText('tan(');
    }
    if (event.key === 'l') {
        appendText('log(');
    }
    if (event.key === 'n') {
        appendText('ln(');
    }
    if (event.key === 'r') {
        appendText('√(');
    }
    if (event.key === 'i') {
        toggleInverse();
    }
    if (event.key === 'e' && event.ctrlKey) {
        event.preventDefault();
        appendText('e^(');
    }
    if (event.key === '2' && event.ctrlKey) {
        event.preventDefault();
        appendText('x^2');
    }
    if (event.key === '3' && event.ctrlKey) {
        event.preventDefault();
        appendText('x^3');
    }
});

// Add new function for inverse toggle
function toggleInverse() {
    isInverseActive = !isInverseActive;
    const inverseBtn = document.getElementById('inverseBtn');
    inverseBtn.classList.toggle('active', isInverseActive);
}

// Initialize graph on page load
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById("graph-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    
    // Set initial size
    const containerWidth = canvas.parentElement.offsetWidth;
    canvas.width = containerWidth;
    canvas.height = containerWidth;
    
    // Draw initial grid
    drawGrid(ctx, canvas);
  }
});

// Add window resize handler to maintain square aspect ratio
window.addEventListener('resize', () => {
  const canvas = document.getElementById("graph-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    
    // Update size
    const containerWidth = canvas.parentElement.offsetWidth;
    canvas.width = containerWidth;
    canvas.height = containerWidth;
    
    // Redraw grid or full graph if there's an active function
    const input = document.getElementById("function-input").value;
    if (input) {
      plotGraph();
    } else {
      drawGrid(ctx, canvas);
    }
  }
});
