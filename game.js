let canvas, ctx, money = 0, moneyInSafe = 0, incomePerSecond = 0;
const keys = {};
const chairs = [];

// Player starts as a 3D Red Cube
const player = { x: 400, y: 400, size: 30, color: '#ff7675', speed: 5 };

// Tycoon Buttons with "Next Button" logic
const tycoonButtons = [
  { id: 1, x: 300, y: 400, cost: 0, label: "Starter Lift", bought: false, unlocked: true, income: 5, color: '#55efc4' },
  { id: 2, x: 500, y: 400, cost: 50, label: "Ski Rack", bought: false, unlocked: false, income: 15, color: '#fab1a0' },
  { id: 3, x: 400, y: 250, cost: 250, label: "Main Lodge", bought: false, unlocked: false, income: 50, color: '#a29bfe' }
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

document.onkeydown = e => keys[e.key] = true;
document.onkeyup = e => keys[e.key] = false;

// --- 3D RENDER ENGINE ---
function draw3DBox(x, y, w, h, depth, color) {
    // Front Face
    ctx.fillStyle = color;
    ctx.fillRect(x - w/2, y - h - depth, w, h);
    
    // Side Face (Darker)
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.moveTo(x + w/2, y - h - depth);
    ctx.lineTo(x + w/2 + 10, y - h - depth + 5);
    ctx.lineTo(x + w/2 + 10, y - depth + 5);
    ctx.lineTo(x + w/2, y - depth);
    ctx.fill();

    // Bottom thickness
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x - w/2, y - depth, w, 5);
}

function update() {
    // 3D Perspective movement: Y moves a bit slower than X
    if (keys['w'] || keys['ArrowUp']) player.y -= player.speed * 0.7;
    if (keys['s'] || keys['ArrowDown']) player.y += player.speed * 0.7;
    if (keys['a'] || keys['ArrowLeft']) player.x -= player.speed;
    if (keys['d'] || keys['ArrowRight']) player.x += player.speed;

    // Collect Money
    let distToSafe = Math.hypot(player.x - 70, player.y - 70);
    if (distToSafe < 50) {
        money += Math.floor(moneyInSafe);
        moneyInSafe = 0;
    }

    // Buy Buttons
    tycoonButtons.forEach((btn, i) => {
        if (btn.unlocked && !btn.bought) {
            if (Math.hypot(player.x - btn.x, player.y - btn.y) < 40) {
                if (money >= btn.cost) {
                    money -= btn.cost;
                    btn.bought = true;
                    incomePerSecond += btn.income;
                    if (tycoonButtons[i+1]) tycoonButtons[i+1].unlocked = true;
                }
            }
        }
    });

    // Move Money Chairs
    for (let i = chairs.length - 1; i >= 0; i--) {
        let c = chairs[i];
        c.x += (70 - c.x) * 0.03;
        c.y += (70 - c.y) * 0.03;
        if (Math.hypot(c.x - 70, c.y - 70) < 10) {
            moneyInSafe += c.value;
            chairs.splice(i, 1);
        }
    }
}

function draw() {
    // Clear & Snow Background
    ctx.fillStyle = "#f0faff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Collection Safe (Gold 3D Disk)
    ctx.fillStyle = "rgba(0,0,0,0.1)"; // Shadow
    ctx.beginPath(); ctx.ellipse(70, 75, 50, 25, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#f1c40f";
    ctx.beginPath(); ctx.ellipse(70, 70, 45, 20, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "black"; ctx.textAlign = "center";
    ctx.fillText("SAFE: $" + Math.floor(moneyInSafe), 70, 75);

    // Sort objects by Y so the player can walk behind buildings
    const renderList = [...tycoonButtons, player].sort((a,b) => a.y - b.y);

    renderList.forEach(obj => {
        if (obj.label) { // It's a Building/Button
            if (obj.unlocked && !obj.bought) {
                // Draw 3D Pad
                ctx.fillStyle = "rgba(0,0,0,0.1)";
                ctx.beginPath(); ctx.ellipse(obj.x, obj.y + 5, 40, 20, 0, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = "#00d2ff";
                ctx.beginPath(); ctx.ellipse(obj.x, obj.y, 35, 18, 0, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = "black";
                ctx.fillText(obj.label + " $" + obj.cost, obj.x, obj.y - 40);
            }
            if (obj.bought) {
                // Draw Building as a 3D block
                draw3DBox(obj.x, obj.y, 60, 40, 0, "#bdc3c7");
            }
        } else {
            // It's the Player (Red 3D Cube)
            ctx.fillStyle = "rgba(0,0,0,0.2)"; // Player Shadow
            ctx.beginPath(); ctx.ellipse(obj.x, obj.y + 5, 20, 10, 0, 0, Math.PI*2); ctx.fill();
            draw3DBox(obj.x, obj.y, 30, 30, 0, obj.color);
        }
    });

    // Draw Floating Money
    chairs.forEach(c => {
        ctx.fillStyle = "gold";
        ctx.beginPath(); ctx.arc(c.x, c.y - 30, 6, 0, Math.PI*2); ctx.fill();
    });

    document.getElementById('moneyDisplay').innerText = Math.floor(money);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Spawner logic
setInterval(() => {
    tycoonButtons.forEach(btn => {
        if (btn.bought) {
            chairs.push({ x: btn.x, y: btn.y, value: btn.income });
        }
    });
}, 2500);
