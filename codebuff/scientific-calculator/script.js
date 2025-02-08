let display = document.getElementById('display');
let expression = '';

function appendNumber(num) {
    expression += num;
    display.value = expression;
}

function appendOperator(operator) {
    expression += operator;
    display.value = expression;
}

function clearDisplay() {
    expression = '';
    display.value = '';
}

function calculate(func) {
    try {
        let value = parseFloat(expression);
        switch(func) {
            case 'sin':
                expression = Math.sin(value * Math.PI / 180).toFixed(8);
                break;
            case 'cos':
                expression = Math.cos(value * Math.PI / 180).toFixed(8);
                break;
            case 'tan':
                expression = Math.tan(value * Math.PI / 180).toFixed(8);
                break;
            case 'sqrt':
                expression = Math.sqrt(value).toString();
                break;
            case 'log':
                expression = Math.log10(value).toString();
                break;
            case 'ln':
                expression = Math.log(value).toString();
                break;
            case 'pow':
                expression += '^';
                break;
        }
        display.value = expression;
    } catch (error) {
        display.value = 'Error';
        expression = '';
    }
}

function calculateResult() {
    try {
        // Handle power operation
        if (expression.includes('^')) {
            let parts = expression.split('^');
            if (parts.length === 2) {
                expression = Math.pow(parseFloat(parts[0]), parseFloat(parts[1])).toString();
            }
        } else {
            expression = eval(expression).toString();
        }
        display.value = expression;
    } catch (error) {
        display.value = 'Error';
        expression = '';
    }
}

// Add keyboard support
document.addEventListener('keydown', (event) => {
    const key = event.key;
    if (/[0-9.]/.test(key)) {
        appendNumber(key);
    } else if (['+', '-', '*', '/'].includes(key)) {
        appendOperator(key);
    } else if (key === 'Enter') {
        calculateResult();
    } else if (key === 'Escape') {
        clearDisplay();
    }
});
