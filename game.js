let money = 0;
let lifts = 0;
let liftCost = 100;
let incomePerSecond = 0;

// Update display
function updateDisplay() {
  document.getElementById("money").textContent = Math.floor(money);
  document.getElementById("lifts").textContent = lifts;
  document.getElementById("liftCost").textContent = liftCost;
}

// Passive income
setInterval(() => {
  money += incomePerSecond;
  updateDisplay();
}, 1000);

// Buy lift
document.getElementById("buyLift").onclick = () => {
  if (money >= liftCost) {
    money -= liftCost;
    lifts++;
    incomePerSecond += 5;
    liftCost = Math.floor(liftCost * 1.5);
    updateDisplay();
  }
};
