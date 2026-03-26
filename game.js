// --- Configuration ---
let canvas, ctx;
let money = 0;
let moneyInSafe = 0;
let incomePerSecond = 0;

const player = { x: 400, y: 400, size: 30, color: '#e74c3c', speed: 5 };

// --- The Tycoon Buttons ---
// 'unlocked' determines if the button is even visible yet
const tycoonButtons = [
  { id: 1, x: 300, y: 300, cost: 0, label: "Starter Lift", bought: false, unlocked: true, income: 5 },
  { id: 2, x: 500, y: 300, cost: 50, label: "Ski Rack", bought: false, unlocked: false, income: 10 },
  { id: 3, x: 400, y: 150, cost: 200, label: "Small Lodge", bought: false, unlocked: false, income: 25 },
];

window.onload = () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    document.getElementById('guestPlay').onclick = () => {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        requestAnimationFrame(gameLoop);
    };
};

const keys = {};
document.onkeydown = e => keys[e.key] = true;
document.onkeyup = e => keys[e.key] = false;

function update() {
    // Movement
    if (keys['ArrowUp'] || keys['w']) player.y -= player.speed;
    if (keys['ArrowDown'] || keys['s']) player.y += player.speed;
    if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['d']) player.x += player.speed;

    // 1. COLLECTOR PAD (The "ATM")
    // If player is near top-left (0,0)
    if (player.x < 100 && player.y < 100) {
        if (moneyInSafe > 0) {
            money += moneyInSafe;
            moneyInSafe = 0;
            console.log("Money Collected!");
        }
    }

    // 2. TYCOON BUTTONS
    tycoonButtons.forEach((btn, index) => {
        if (btn.unlocked && !btn.bought) {
            // Check if player is standing on the pad
            let dist = Math.hypot(player.x - btn.x, player.y - btn.y);
            if (dist < 40) { // Player is on the circle
                if (money >= btn.cost) {
                    money -= btn.cost;
                    btn.bought = true;
                    incomePerSecond += btn.income;
                    
                    // Unlock the next button in the sequence!
                    if (tycoonButtons[index + 1]) {
                        tycoonButtons[index + 1].unlocked = true;
                    }
                }
            }
        }
    });
}

function draw() {
    // Draw Snow
    ctx.fillStyle = "#f0f8ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw "Collection Safe" (The Gold Pad)
    ctx.fillStyle = "#f1c40f";
    ctx.beginPath();
    ctx.arc(50, 50, 50, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.font = "bold 14px Arial";
    ctx.fillText("COLLECT", 15, 45);
    ctx.fillText("$" + Math.floor(moneyInSafe), 20, 65);

    // Draw Tycoon Pads
    tycoonButtons.forEach(btn => {
        if (btn.unlocked && !btn.bought) {
            // Shadow
            ctx.fillStyle = "rgba(0,0,0,0.1)";
            ctx.beginPath();
            ctx.ellipse(btn.x, btn.y + 5, 40, 20, 0, 0, Math.PI*2);
            ctx.fill();

            // The Pad (Neon Blue like Roblox)
            ctx.fillStyle = "#00d2ff";
            ctx.beginPath();
            ctx.arc(btn.x, btn.y, 35, 0, Math.PI*2);
            ctx.fill();
            
            // Text above pad
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText(btn.label, btn.x, btn.y - 50);
            ctx.fillText("$" + btn.cost, btn.x, btn.y - 35);
        }

        // Draw the actual "Building" if bought
        if (btn.bought) {
            ctx.fillStyle = "#95a5a6"; // Building color
            ctx.fillRect(btn.x - 40, btn.y - 120, 80, 60); // Simple house shape
            ctx.fillStyle = "#2c3e50";
            ctx.fillText(btn.label + " (Active)", btn.x, btn.y - 130);
        }
    });

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - 15, player.y - 15, player.size, player.size);

    // Update HUD
    document.getElementById('moneyDisplay').innerText = Math.floor(money);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Income goes to the SAFE, not your pocket!
setInterval(() => {
    moneyInSafe += (incomePerSecond / 10); 
}, 100);
