let canvas, ctx, money = 0, incomePerSecond = 0;
const keys = {};

const player = { x: 400, y: 400, size: 30, color: '#ff7675', speed: 5 };

const tycoonButtons = [
  { id: 1, x: 300, y: 450, cost: 0, label: "Starter Lift", bought: false, unlocked: true, income: 5 },
  { id: 2, x: 600, y: 450, cost: 50, label: "Ski Rack", bought: false, unlocked: false, income: 15 },
  { id: 3, x: 450, y: 200, cost: 250, label: "Main Lodge", bought: false, unlocked: false, income: 50 }
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

// --- BUILDING RENDERERS ---

function drawLodge(x, y) {
    // Main Cabin Body
    ctx.fillStyle = "#784212"; // Dark wood
    ctx.fillRect(x - 40, y - 60, 80, 60);
    // Windows
    ctx.fillStyle = "#81ecec";
    ctx.fillRect(x - 25, y - 45, 15, 15);
    ctx.fillRect(x + 10, y - 45, 15, 15);
    // Snow Roof (Triangle)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(x - 50, y - 60);
    ctx.lineTo(x + 50, y - 60);
    ctx.lineTo(x, y - 100);
    ctx.fill();
}

function drawSkiLift(x, y) {
    // Metal Pillars
    ctx.fillStyle = "#636e72";
    ctx.fillRect(x - 5, y - 120, 10, 120);
    ctx.fillRect(x + 80, y - 120, 10, 120);
    // Cable Line
    ctx.strokeStyle = "#2d3436";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y - 100);
    ctx.lineTo(x + 85, y - 100);
    ctx.stroke();
    // Static Chair
    ctx.fillStyle = "#d63031";
    ctx.fillRect(x + 35, y - 100, 15, 20);
}

function drawSkiRack(x, y) {
    // Wooden Frame
    ctx.fillStyle = "#a04000";
    ctx.fillRect(x - 30, y - 10, 60, 10);
    // Individual Skis
    const colors = ["#ff7675", "#74b9ff", "#55efc4", "#ffeaa7"];
    for(let i=0; i<6; i++) {
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(x - 25 + (i * 10), y - 40, 4, 35);
    }
}

function update() {
    if (keys['w'] || keys['ArrowUp']) player.y -= player.speed * 0.7;
    if (keys['s'] || keys['ArrowDown']) player.y += player.speed * 0.7;
    if (keys['a'] || keys['ArrowLeft']) player.x -= player.speed;
    if (keys['d'] || keys['ArrowRight']) player.x += player.speed;

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
}

function draw() {
    ctx.fillStyle = "#f0faff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const renderList = [...tycoonButtons, player].sort((a,b) => a.y - b.y);

    renderList.forEach(obj => {
        if (obj.label) {
            if (obj.unlocked && !obj.bought) {
                // 3D Purchase Pad
                ctx.fillStyle = "rgba(0,0,0,0.1)";
                ctx.beginPath(); ctx.ellipse(obj.x, obj.y + 5, 40, 20, 0, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = "#00d2ff";
                ctx.beginPath(); ctx.ellipse(obj.x, obj.y, 35, 18, 0, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = "black"; ctx.textAlign = "center";
                ctx.fillText(obj.label + " $" + obj.cost, obj.x, obj.y - 40);
            }
            if (obj.bought) {
                // Call specific visual drawing based on label
                if (obj.label === "Starter Lift") drawSkiLift(obj.x, obj.y);
                if (obj.label === "Ski Rack") drawSkiRack(obj.x, obj.y);
                if (obj.label === "Main Lodge") drawLodge(obj.x, obj.y);
            }
        } else {
            // Player Shadow & 3D Cube
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            ctx.beginPath(); ctx.ellipse(obj.x, obj.y + 5, 20, 10, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = obj.color;
            ctx.fillRect(obj.x - 15, obj.y - 35, 30, 30);
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            ctx.fillRect(obj.x - 15, obj.y - 5, 30, 5); // Bottom thickness
        }
    });

    document.getElementById('moneyDisplay').innerText = Math.floor(money);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Simple Auto-Income (No more traveling coins!)
setInterval(() => {
    money += incomePerSecond;
}, 1000);
