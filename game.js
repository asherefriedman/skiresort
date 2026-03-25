// Game variables
let money = 0;
let lifts = 0;
let liftCost = 100;
let incomePerSecond = 0;

// Load saved data (if any)
if (localStorage.getItem("money")) {
  money = parseInt(localStorage.getItem("money"));
  lifts = parseInt(localStorage.getItem("lifts"));
  liftCost = parseInt(localStorage.getItem("liftCost"));
  incomePerSecond = lifts * 5;
}

// Update the HTML display
function updateDisplay() {
  document.getElementById("money").textContent = Math.floor(money);
  document.getElementById("lifts").textContent = lifts;
  document.getElementById("liftCost").textContent = liftCost;
}

// Passive income every second
setInterval(() => {
  money += incomePerSecond;
  updateDisplay();
  saveGame(); // auto-save every second
}, 1000);

// Button: Sell lift tickets (click)
document.getElementById("click").onclick = () => {
  money += 10;
  updateDisplay();
  saveGame();
};

// Button: Buy a ski lift
document.getElementById("buyLift").onclick = () => {
  if (money >= liftCost) {
    money -= liftCost;
    lifts += 1;
    incomePerSecond += 5; // each lift adds $5/sec
    liftCost = Math.floor(liftCost * 1.5); // price increases
    updateDisplay();
    saveGame();
  } else {
    alert("Not enough money!");
  }
};

// Save game function
function saveGame() {
  localStorage.setItem("money", money);
  localStorage.setItem("lifts", lifts);
  localStorage.setItem("liftCost", liftCost);
}

// Optional: load game manually on page load
updateDisplay();

document.getElementById("saveGame").onclick = saveGame;

document.getElementById("resetGame").onclick = () => {
  if (confirm("Are you sure you want to reset your game?")) {
    money = 0;
    lifts = 0;
    liftCost = 100;
    incomePerSecond = 0;
    saveGame();
    updateDisplay();
  }
};
