const display = document.querySelector("#display");
const buttons = document.querySelector(".keys");

let currentValue = "0";
let storedValue = null;
let pendingOperation = null;
let waitingForOperand = false;
let hasError = false;

const operationSymbols = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷",
};

function render() {
  display.textContent = currentValue.replace(".", ",");
}

function showError(message) {
  currentValue = message;
  hasError = true;
  storedValue = null;
  pendingOperation = null;
  waitingForOperand = true;
  render();
}

function inputNumber(number) {
  if (hasError || waitingForOperand) {
    currentValue = number;
    hasError = false;
    waitingForOperand = false;
  } else if (currentValue === "0") {
    currentValue = number;
  } else if (currentValue.length < 14) {
    currentValue += number;
  }
  render();
}

function inputDecimal() {
  if (hasError || waitingForOperand) {
    currentValue = "0.";
    hasError = false;
    waitingForOperand = false;
  } else if (!currentValue.includes(".")) {
    currentValue += ".";
  }
  render();
}

function calculate(first, second, operation) {
  if (operation === "add") return first + second;
  if (operation === "subtract") return first - second;
  if (operation === "multiply") return first * second;
  if (operation === "divide") {
    if (second === 0) return null;
    return first / second;
  }
  return null;
}

function formatResult(value) {
  if (!Number.isFinite(value)) return null;
  return String(Number(value.toPrecision(12)));
}

function chooseOperation(operation) {
  if (hasError) return;
  if (!Object.hasOwn(operationSymbols, operation)) {
    showError("Geçersiz işlem");
    return;
  }
  const value = Number(currentValue);
  if (!Number.isFinite(value)) {
    showError("Geçersiz sayı");
    return;
  }

  if (pendingOperation && storedValue !== null && !waitingForOperand) {
    const result = calculate(storedValue, value, pendingOperation);
    const formatted = result === null ? null : formatResult(result);
    if (formatted === null) {
      showError("Sıfıra bölünemez");
      return;
    }
    currentValue = formatted;
    storedValue = result;
  } else {
    storedValue = value;
  }

  pendingOperation = operation;
  waitingForOperand = true;
  render();
}

function calculateResult() {
  if (hasError || pendingOperation === null || storedValue === null) return;
  const result = calculate(storedValue, Number(currentValue), pendingOperation);
  const formatted = result === null ? null : formatResult(result);
  if (formatted === null) {
    showError("Sıfıra bölünemez");
    return;
  }
  currentValue = formatted;
  storedValue = null;
  pendingOperation = null;
  waitingForOperand = true;
  render();
}

function clear() {
  currentValue = "0";
  storedValue = null;
  pendingOperation = null;
  waitingForOperand = false;
  hasError = false;
  render();
}

buttons.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.number !== undefined) inputNumber(button.dataset.number);
  else if (button.dataset.operation) chooseOperation(button.dataset.operation);
  else if (button.dataset.action === "decimal") inputDecimal();
  else if (button.dataset.action === "equals") calculateResult();
  else if (button.dataset.action === "clear") clear();
});

document.addEventListener("keydown", (event) => {
  if (/^\d$/.test(event.key)) inputNumber(event.key);
  else if (event.key === "," || event.key === ".") inputDecimal();
  else if (event.key === "Escape") clear();
  else if (event.key === "Enter" || event.key === "=") calculateResult();
  else {
    const operations = { "+": "add", "-": "subtract", "*": "multiply", "/": "divide" };
    if (operations[event.key]) chooseOperation(operations[event.key]);
    else return;
  }
  event.preventDefault();
});
