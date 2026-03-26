let canvas, ctx, money = 0, incomePerSecond = 0;
const keys = {};

const player = { x: 400, y: 500, size: 30, color: '#ff7675', speed: 5 };

// Expanded Progression
const tycoonButtons = [
  { id: 1, x: 200, y: 600, cost: 0, label: "Starter Lift", bought: false, unlocked: true, income: 5 },
  { id: 2, x: 400, y: 600, cost: 50, label: "Ski Rack", bought: false, unlocked: false, income: 10 },
  { id: 3, x: 600, y: 600, cost: 200, label: "Cocoa Stand", bought: false, unlocked: false, income: 25 },
  { id: 4, x: 400, y: 400, cost: 600, label: "Ski Shop", bought: false, unlocked: false, income: 60 },
  { id: 5, x: 700, y: 300, cost: 1500, label: "Main Lodge", bought: false, unlocked: false, income: 150 },
  { id: 6, x: 200, y: 200, cost: 5000, label: "Grand Hotel", bought: false, unlocked: false, income: 500 }
];

window.onload = () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize); resize();

    document.getElementById('guestPlay').onclick = () => {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        requestAnimationFrame(gameLoop);
    };
};

document.onkeydown = e => keys[e.key] = true;
document.onkeyup = e => keys[e.key] = false;

// --- ADVANCED BUILDING RENDERERS ---

function drawCocoaStand(x, y) {
    // Counter
    ctx.fillStyle = "#5d4037"; 
    ctx.fillRect(x - 25, y - 40, 50, 40);
    // Red/White Awning
    for(let i=0; i<5; i++) {
        ctx.fillStyle = i % 2 === 0 ? "#e74c3c" : "#ffffff";
        ctx.fillRect(x - 25 + (i * 10), y - 55, 10, 15);
    }
    // Steam
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.beginPath(); ctx.moveTo(x, y-60); ctx.quadraticCurveTo(x+5, y-70, x, y-80); ctx.stroke();
}

function drawSkiShop(x, y) {
    // Main Floor
    ctx.fillStyle = "#3e2723"; 
    ctx.fillRect(x - 45, y - 50, 90, 50);
    // Large Glass Windows
    ctx.fillStyle = "#cae9ff";
    ctx.fillRect(x - 35, y - 35, 30, 25);
    ctx.fillRect(x + 5, y - 35, 30, 25);
    // Roof
    ctx.fillStyle = "#2c3e50";
    ctx.beginPath(); ctx.moveTo(x-50, y-50); ctx.lineTo(x+50, y-50); ctx.lineTo(x+40, y-70); ctx.lineTo(x-40, y-70); ctx.fill();
}

function drawHotel(x, y) {
    // 3 Stories
    ctx.fillStyle = "#ecf0f1"; 
    ctx.fillRect(x - 60, y - 120, 120, 120);
    // Balconies
    ctx.fillStyle = "#7f8c8d";
    for(let i=0; i<3; i++) {
        ctx.fillRect(x - 50, y - 30 - (i * 35), 100, 5);
        ctx.fillStyle = "#3498db"; // Window behind balcony
        ctx.fillRect(x - 40, y - 55 - (i * 35), 20, 20);
        ctx.fillRect(x + 20, y - 55 - (i * 35), 20, 20);
        ctx.fillStyle = "#7f8c8d";
    }
    // Grand Entrance Roof
    ctx.fillStyle = "#c0392b";
    ctx.fillRect(x - 70, y - 130, 140, 15);
}

function drawLodge(x, y) {
    ctx.fillStyle = "#5d4037"; // Log color
    ctx.fillRect(x - 50, y - 70, 100, 70);
    // Chimney
    ctx.fillStyle = "#34495e";
    ctx.fillRect(x + 20, y - 100, 15, 40);
    // Windows with Crosses
    ctx.fillStyle = "#f1c40f";
    ctx.fillRect(x - 35, y - 50, 20, 20);
    ctx.strokeStyle = "#5d4037"; ctx.strokeRect(x - 35, y - 50, 20, 20);
    // A-Frame Snow Roof
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.moveTo(x-60, y-70); ctx.lineTo(x+60, y-70); ctx.lineTo(x, y-120); ctx.fill();
}

function drawSkiLift(x, y) {
    ctx.fillStyle = "#2d3436";
    ctx.fillRect(x - 8, y - 180, 16, 180); // Main Tower
    ctx.fillStyle = "#b2bec3";
    ctx.fillRect(x - 40, y - 180, 80, 10); // Crossbar
    // Pulleys
    ctx.fillStyle = "#636e72";
    ctx.beginPath(); ctx.arc(x-30, y-175, 8, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+30, y-175, 8, 0, Math.PI*2); ctx.fill();
}

function drawSkiRack(x, y) {
    ctx.fillStyle = "#4e342e";
    ctx.fillRect(x - 45, y - 15, 90, 15);
    const colors = ["#ff7675", "#74b9ff", "#55efc4", "#fdcb6e"];
    for(let i=0; i<10; i++) {
        ctx.fillStyle = colors[i % 4];
        ctx.fillRect(x - 40 + (i * 9), y - 60, 4, 50);
    }
}

// --- CORE ENGINE ---

function update() {
    if (keys['w'] || keys['ArrowUp']) player.y -= player.speed * 0.7;
    if (keys['s'] || keys['ArrowDown']) player.y += player.speed * 0.7;
    if (keys['a'] || keys['ArrowLeft']) player.x -= player.speed;
    if (keys['d'] || keys['ArrowRight']) player.x += player.speed;

    tycoonButtons.forEach((btn, i) => {
        if (btn.unlocked && !btn.bought) {
            if (Math.hypot(player.x - btn.x, player.y - btn.y) < 45) {
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
    ctx.fillStyle = "#f0faff"; // Clear snow
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const renderList = [...tycoonButtons, player].sort((a,b) => a.y - b.y);

    renderList.forEach(obj => {
        if (obj.label) {
            if (obj.unlocked && !obj.bought) {
                ctx.fillStyle = "rgba(0,0,0,0.1)";
                ctx.beginPath(); ctx.ellipse(obj.x, obj.y + 5, 45, 22, 0, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = "#00d2ff";
                ctx.beginPath(); ctx.ellipse(obj.x, obj.y, 40, 20, 0, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = "#2d3436"; ctx.font = "bold 13px Arial"; ctx.textAlign = "center";
                ctx.fillText(obj.label.toUpperCase(), obj.x, obj.y - 50);
                ctx.fillText("$" + obj.cost, obj.x, obj.y - 35);
            }
            if (obj.bought) {
                if (obj.label === "Starter Lift") drawSkiLift(obj.x, obj.y);
                if (obj.label === "Ski Rack") drawSkiRack(obj.x, obj.y);
                if (obj.label === "Cocoa Stand") drawCocoaStand(obj.x, obj.y);
                if (obj.label === "Ski Shop") drawSkiShop(obj.x, obj.y);
                if (obj.label === "Main Lodge") drawLodge(obj.x, obj.y);
                if (obj.label === "Grand Hotel") drawHotel(obj.x, obj.y);
            }
        } else {
            ctx.fillStyle = "rgba(0,0,0,0.15)";
            ctx.beginPath(); ctx.ellipse(obj.x, obj.y, 18, 9, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = obj.color;
            ctx.fillRect(obj.x - 15, obj.y - 35, 30, 30);
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            ctx.fillRect(obj.x - 15, obj.y - 10, 30, 10);
        }
    });
    document.getElementById('moneyDisplay').innerText = Math.floor(money);
}

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }

setInterval(() => { money += incomePerSecond; }, 1000);
