// -------------------------
// Game variables
// -------------------------
let money = 0;
let lifts = 0;
let liftCost = 100;
let incomePerSecond = 0;

// Load saved data
if (localStorage.getItem("money")) {
  money = parseInt(localStorage.getItem("money"));
  lifts = parseInt(localStorage.getItem("lifts"));
  liftCost = parseInt(localStorage.getItem("liftCost"));
  incomePerSecond = lifts * 5;
}

// -------------------------
// Update display
// -------------------------
function updateDisplay() {
  document.getElementById("money").textContent = Math.floor(money);
  document.getElementById("lifts").textContent = lifts;
  document.getElementById("liftCost").textContent = liftCost;
}

// -------------------------
// Passive income
// -------------------------
setInterval(() => {
  money += incomePerSecond;
  updateDisplay();
  saveGame();
}, 1000);

// -------------------------
// Button actions
// -------------------------
document.getElementById("click")?.addEventListener("click", () => {
  money += 10;
  updateDisplay();
  saveGame();
});

document.getElementById("buyLift")?.addEventListener("click", () => {
  if (money >= liftCost) {
    money -= liftCost;
    lifts++;
    incomePerSecond += 5;
    liftCost = Math.floor(liftCost * 1.5);
    updateDisplay();
    saveGame();
  } else {
    alert("Not enough money!");
  }
});

// -------------------------
// Save & Load
// -------------------------
function saveGame() {
  localStorage.setItem("money", money);
  localStorage.setItem("lifts", lifts);
  localStorage.setItem("liftCost", liftCost);
}

// -------------------------
// Google Sign-In
// -------------------------
function handleCredentialResponse(response) {
  const decoded = parseJwt(response.credential);
  const userName = decoded.name;
  alert(`Welcome, ${userName}! You can now play the game.`);

  // Enable play button
  document.getElementById("play-button").disabled = false;
  localStorage.setItem("username", userName);
}

// Decode JWT helper
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(''));
  return JSON.parse(jsonPayload);
}

// -------------------------
// Home screen Play button
// -------------------------
document.getElementById("play-button").addEventListener("click", () => {
  document.getElementById("home-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  updateDisplay();
});

// Lodges variables
let lodges = 0;
let lodgeCost = 500;

// Load saved lodges
if (localStorage.getItem("lodges")) {
  lodges = parseInt(localStorage.getItem("lodges"));
  lodgeCost = parseInt(localStorage.getItem("lodgeCost"));
  incomePerSecond += lodges * 20;
}

// UpdateDisplay: add lodges
function updateDisplay() {
  document.getElementById("money").textContent = Math.floor(money);
  document.getElementById("lifts").textContent = lifts;
  document.getElementById("liftCost").textContent = liftCost;
  document.getElementById("lodges").textContent = lodges;
  document.getElementById("lodgeCost").textContent = lodgeCost;
}

// Buy Lodge button
document.getElementById("buyLodge")?.addEventListener("click", () => {
  if (money >= lodgeCost) {
    money -= lodgeCost;
    lodges++;
    incomePerSecond += 20; // each lodge adds $20/sec
    lodgeCost = Math.floor(lodgeCost * 1.7);
    updateDisplay();
    saveGame();
  } else {
    alert("Not enough money for a lodge!");
  }
});

// Save lodges
function saveGame() {
  localStorage.setItem("money", money);
  localStorage.setItem("lifts", lifts);
  localStorage.setItem("liftCost", liftCost);
  localStorage.setItem("lodges", lodges);
  localStorage.setItem("lodgeCost", lodgeCost);
}
