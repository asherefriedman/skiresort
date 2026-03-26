// ---------------- GAME VARIABLES ----------------
let money = 0;
let lifts = 0;
let liftCost = 100;

// Player position
let playerX = 50;
let playerY = 50;
let speed = 5;

// ---------------- SCREEN CONTROL ----------------
function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.style.display = "none");
    document.getElementById(id).style.display = "block";
}

// ---------------- LOGIN ----------------
function login() {
    let username = document.getElementById("username").value;
    if (username === "") {
        alert("Enter a username");
        return;
    }
    localStorage.setItem("username", username);
    showScreen("homeScreen");
}

// ---------------- START GAME ----------------
function startGame() {
    showScreen("gameScreen");
}

// ---------------- UI ----------------
function updateUI() {
    document.getElementById("money").innerText = money;
    document.getElementById("lifts").innerText = lifts;
    document.getElementById("liftCost").innerText = liftCost;
}

// ---------------- GAME ACTIONS ----------------
function earnMoney() {
    money += 10;
    updateUI();
}

function buyLift() {
    if (money >= liftCost) {
        money -= liftCost;
        lifts++;
        liftCost = Math.floor(liftCost * 1.5);

        createLift(); // NEW VISUAL FEATURE

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

// ---------------- PLAYER MOVEMENT ----------------
document.addEventListener("keydown", (e) => {
    const player = document.getElementById("player");

    if (e.key === "ArrowUp") playerY -= speed;
    if (e.key === "ArrowDown") playerY += speed;
    if (e.key === "ArrowLeft") playerX -= speed;
    if (e.key === "ArrowRight") playerX += speed;

    player.style.top = playerY + "px";
    player.style.left = playerX + "px";
});

// ---------------- VISUAL LIFTS ----------------
function createLift() {
    const lift = document.createElement("div");
    lift.style.width = "20px";
    lift.style.height = "60px";
    lift.style.background = "gray";
    lift.style.position = "absolute";

    lift.style.left = Math.random() * 90 + "%";
    lift.style.top = Math.random() * 300 + "px";

    document.getElementById("gameWorld").appendChild(lift);
}

// ---------------- LOAD ----------------
window.onload = () => {
    showScreen("loginScreen");
    updateUI();
};
