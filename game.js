// --- Configuration & State ---
let canvas, ctx;
let money = 0;
let moneyInSafe = 0;

const player = { 
    x: 400, 
    y: 400, 
    size: 30, 
    color: '#e74c3c', 
    speed: 5 
};

// This array holds the moving chairs (the "droppers")
const chairs = [];

// --- Tycoon Buttons (Progression System) ---
const tycoonButtons = [
  { id: 1, x: 300, y: 300, cost: 0, label: "Starter Lift", bought: false, unlocked: true, income: 5 },
  { id: 2, x: 600, y: 400, cost: 50, label: "Ski Rack", bought: false, unlocked: false, income: 15 },
  { id: 3, x: 400, y: 150, cost: 250, label: "Main Lodge", bought: false, unlocked: false, income: 50 },
  { id: 4, x: 700, y: 150, cost: 1000, label: "Luxury Gondola", bought: false, unlocked: false, income: 200 }
];

window.onload = () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set size and handle resizing
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    document.getElementById('guestPlay').onclick = () => {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        requestAnimationFrame(gameLoop);
    };
};

// Input Handling
const keys = {};
document.onkeydown = e => keys[e.key] = true;
document.onkeyup = e => keys[e.key] = false;

// --- Core Logic ---

function spawnChair(startX, startY, value) {
    chairs.push({
        x: startX,
        y: startY,
        targetX: 50, // The Vault position
        targetY: 50,
        value: value,
        speed: 3
    });
}

function update() {
    // 1. Movement
    if (keys['ArrowUp'] || keys['w']) player.y -= player.speed;
    if (keys['ArrowDown'] || keys['s']) player.y += player.speed;
    if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['d']) player.x += player.speed;

    // 2. Collection Vault (The Gold Pad)
    let distToVault = Math.hypot(player.x - 50, player.y - 50);
    if (distToVault < 60) {
        if (moneyInSafe > 0) {
            money += Math.floor(moneyInSafe);
            moneyInSafe = 0;
        }
    }

    // 3. Moving the Chairs ("Droppers")
    for (let i = chairs.length - 1; i >= 0; i--) {
        let c = chairs[i];
        let dx = c.targetX - c.x;
        let dy = c.targetY - c.y;
        let angle = Math.atan2(dy, dx);

        c.x += Math.cos(angle) * c.speed;
        c.y += Math.sin(angle) * c.speed;

        // If chair reaches the vault
        if (Math.hypot(c.x - c.targetX, c.y - c.targetY) < 10) {
            moneyInSafe += c.value;
            chairs.splice(i, 1);
        }
    }

    // 4. Tycoon Button Logic
    tycoonButtons.forEach((btn, index) => {
        if (btn.unlocked && !btn.bought) {
            let distToPad = Math.hypot(player.x - btn.x, player.y - btn.y);
            if (distToPad < 40) {
                if (money >= btn.cost) {
                    money -= btn.cost;
                    btn.bought = true;
                    // Unlock the next button
                    if (tycoonButtons[index + 1]) {
                        tycoonButtons[index + 1].unlocked = true;
                    }
                }
            }
        }
    });
}

function draw() {
    // Background (Snow)
    ctx.fillStyle = "#f0f8ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the "ATM / Safe" Vault
    ctx.fillStyle = "#f1c40f";
    ctx.beginPath();
    ctx.arc(50, 50, 50, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText("COLLECT", 50, 45);
    ctx.fillText("$" + Math.floor(moneyInSafe), 50, 65);

    // Draw Purchase Pads
    tycoonButtons.forEach(btn => {
        if (btn.unlocked && !btn.bought) {
            // Shadow
            ctx.fillStyle = "rgba(0,0,0,0.1)";
            ctx.beginPath();
            ctx.ellipse(btn.x, btn.y + 5, 40, 20, 0, 0, Math.PI*2);
            ctx.fill();

            // The Pad
            ctx.fillStyle = "#00d2ff";
            ctx.beginPath();
            ctx.arc(btn.x, btn.y, 35, 0, Math.PI*2);
            ctx.fill();
            
            // Text labels
            ctx.fillStyle = "black";
            ctx.fillText(btn.label, btn.x, btn.y - 50);
            ctx.fillText("$" + btn.cost, btn.x, btn.y - 35);
        }

        // Draw the Building if bought
        if (btn.bought) {
            ctx.fillStyle = "#2c3e50";
            ctx.fillRect(btn.x - 30, btn.y - 80, 60, 40);
            ctx.fillStyle = "white";
            ctx.font = "10px Arial";
            ctx.fillText("LVL 1", btn.x, btn.y - 55);
        }
    });

    // Draw Moving Chairs
    chairs.forEach(c => {
        ctx.fillStyle = "#34495e";
        ctx.fillRect(c.x - 10, c.y - 5, 20, 10); // The Chair
        ctx.fillStyle = "gold";
        ctx.beginPath();
        ctx.arc(c.x, c.y, 4, 0, Math.PI*2); // The Money on the chair
        ctx.fill();
    });

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.fillRect(player.x - 15, player.y - 15, player.size, player.size);
    ctx.shadowBlur = 0;

    // HUD Update
    document.getElementById('moneyDisplay').innerText = money;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Every 2 seconds, buildings send a "money chair" to the vault
setInterval(() => {
    tycoonButtons.forEach(btn => {
        if (btn.bought && btn.income > 0) {
            spawnChair(btn.x, btn.y, btn.income);
        }
    });
}, 2000);
