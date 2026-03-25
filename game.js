// -------------------------
// Game variables
// -------------------------
let money = 0;
let lifts = 0;
let liftCost = 100;
let lodges = 0;
let lodgeCost = 500;
let incomePerSecond = 0;

// -------------------------
// Load saved data
// -------------------------
if (localStorage.getItem("money")) {
  money = parseInt(localStorage.getItem("money")) || 0;
  lifts = parseInt(localStorage.getItem("lifts")) || 0;
  liftCost = parseInt(localStorage.getItem("liftCost")) || 100;
  lodges = parseInt(localStorage.getItem("lodges")) || 0;
  lodgeCost = parseInt(localStorage.getItem("lodgeCost")) || 500;

  incomePerSecond = (lifts * 5) + (lodges * 20);
}

// -------------------------
// Update display
// -------------------------
function updateDisplay() {
  document.getElementById("money").textContent = Math.floor(money);
  document.getElementById("lifts").textContent = lifts;
  document.getElementById("liftCost").textContent = liftCost;
  document.getElementById("lodges").textContent = lodges;
  document.getElementById("lodgeCost").textContent = lodgeCost;
}

// -------------------------
// Save game
// -------------------------
function saveGame() {
  localStorage.setItem("money", money);
  localStorage.setItem("lifts", lifts);
  localStorage.setItem("liftCost", liftCost);
  localStorage.setItem("lodges", lodges);
  localStorage.setItem("lodgeCost", lodgeCost);
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
// Buttons
// -------------------------
document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("click").addEventListener("click", () => {
    money += 10;
    updateDisplay();
    saveGame();
  });

  document.getElementById("buyLift").addEventListener("click", () => {
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

  document.getElementById("buyLodge").addEventListener("click", () => {
    if (money >= lodgeCost) {
      money -= lodgeCost;
      lodges++;
      incomePerSecond += 20;
      lodgeCost = Math.floor(lodgeCost * 1.7);
      updateDisplay();
      saveGame();
    } else {
      alert("Not enough money!");
    }
  });

  document.getElementById("play-button").addEventListener("click", () => {
    document.getElementById("home-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    updateDisplay();
  });

});

// -------------------------
// Google Sign-In
// -------------------------
function handleCredentialResponse(response) {
  const data = parseJwt(response.credential);
  const name = data.name;

  alert("Welcome " + name + "!");

  localStorage.setItem("username", name);
  document.getElementById("play-button").disabled = false;
}

// Decode token
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(''));
  return JSON.parse(jsonPayload);
}

// -------------------------
// Google init
// -------------------------
window.onload = function () {
  google.accounts.id.initialize({
    client_id: "722724267613-jr2k1u6l9npv8riulkdrf1sgg2t739pm.apps.googleusercontent.com",
    callback: handleCredentialResponse
  });

  google.accounts.id.renderButton(
    document.getElementById("g_id_signin"),
    {
      theme: "outline",
      size: "large"
    }
  );
};
