// ---------------- VARIABLES ----------------
let money = 0;
let lifts = 0;
let liftCost = 100;

// ---------------- SCREEN CONTROL ----------------
function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(s => s.style.display = "none");
    document.getElementById(screenId).style.display = "block";
}

// ---------------- LOGIN ----------------
function login() {
    const username = document.getElementById("username").value;

    if (username === "") {
        alert("Enter a username!");
        return;
    }

    localStorage.setItem("username", username);
    showScreen("homeScreen");
}

// ---------------- START GAME ----------------
function startGame() {
    showScreen("gameScreen");
}

// ---------------- GAME ----------------
function updateUI() {
    document.getElementById("money").innerText = money;
    document.getElementById("lifts").innerText = lifts;
    document.getElementById("liftCost").innerText = liftCost;
}

function earnMoney() {
    money += 10;
    updateUI();
}

function buyLift() {
    if (money >= liftCost) {
        money -= liftCost;
        lifts += 1;
        liftCost = Math.floor(liftCost * 1.5);
        updateUI();
    } else {
        alert("Not enough money!");
    }
}

// ---------------- AUTO INCOME ----------------
setInterval(() => {
    money += lifts;
    updateUI();
}, 1000);

// ---------------- LOAD ----------------
window.onload = () => {
    showScreen("loginScreen");
    updateUI();
};
