let canvas, ctx, money = 0, incomePerSecond = 0;
const keys = {};

const player = { 
    x: 400, y: 400, size: 30, 
    color: '#ff7675', // Soft Red
    speed: 5 
};

const tycoonButtons = [
  { id: 1, x: 300, y: 500, cost: 0, label: "Starter Lift", bought: false, unlocked: true, income: 5 },
  { id: 2, x: 600, y: 500, cost: 50, label: "Ski Rack", bought: false, unlocked: false, income: 15 },
  { id: 3, x: 450, y: 250, cost: 250, label: "Main Lodge", bought: false, unlocked: false, income: 50 }
];

window.onload = () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    document.getElementById('guestPlay').onclick = () => {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        requestAnimationFrame(gameLoop);
    };
};

document.onkeydown = e => keys[e.key] = true;
document.onkeyup = e => keys[e.key] = false;

// --- BUILDINGS ---

function drawLodge(x, y) {
    ctx.fillStyle = "#784212"; // Wood walls
    ctx.fillRect(x - 40, y - 60, 80, 60);
    ctx.fillStyle = "#2ecc71"; // Door
    ctx.fillRect(x - 10, y - 25, 20, 25);
    ctx.fillStyle = "#ffffff"; // Snow Roof
    ctx.beginPath();
    ctx.moveTo(x - 55, y - 60);
    ctx.lineTo(x + 55, y - 60);
    ctx.lineTo(x, y - 110);
    ctx.fill();
}

function drawSkiLift(x, y) {
    ctx.fillStyle = "#636e72"; // Pillars
    ctx.fillRect(x - 5, y - 150, 10, 150);
    ctx.fillRect(x + 100, y - 150, 10, 150);
    ctx.strokeStyle = "#2d3436"; // Wire
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y - 130);
    ctx.lineTo(x + 105, y - 130);
    ctx.stroke();
}

function drawSkiRack(x, y) {
    ctx.fillStyle = "#a04000"; // Rack base
    ctx.fillRect(x - 40, y - 10, 80, 10);
    const skiColors = ["#e74c3c", "#3498db", "#f1c40f", "#2ecc71"];
    for(let i=0; i<8; i++) {
        ctx.fillStyle = skiColors[i % 4];
        ctx.fillRect(x - 35 + (i * 10), y - 50, 5, 45);
    }
}

function update() {
    // 3D Perspective Movement
    if (keys['w'] || keys['ArrowUp']) player.y -= player.speed * 0.7;
    if (keys['s'] || keys['ArrowDown']) player.y += player.speed * 0.7;
    if (keys['a'] || keys['ArrowLeft']) player.x -= player.speed;
    if (keys['d'] || keys['ArrowRight']) player.x += player.speed;

    // Purchasing
    tycoonButtons.forEach((btn, i) => {
        if (btn.unlocked && !btn.bought) {
            let dist = Math.hypot(player.x - btn.x, player.y - btn.y);
            if (dist < 45) {
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
    // Snow Background
    ctx.fillStyle = "#f0faff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sort items by Y so player can walk behind buildings
    const renderList = [...tycoonButtons, player].sort((a,b) => a.y - b.y);

    renderList.forEach(obj => {
        if (obj.label) { // Building/Button
            if (obj.unlocked && !obj.bought) {
                // 3D Pad
                ctx.fillStyle = "rgba(0,0,0,0.1)";
                ctx.beginPath(); ctx.ellipse(obj.x, obj.y + 5, 45, 22, 0, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = "#00d2ff";
                ctx.beginPath(); ctx.ellipse(obj.x, obj.y, 40, 20, 0, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = "black"; ctx.font = "bold 14px Arial"; ctx.textAlign = "center";
                ctx.fillText(obj.label.toUpperCase(), obj.x, obj.y - 50);
                ctx.fillText("$" + obj.cost, obj.x, obj.y - 35);
            }
            if (obj.bought) {
                if (obj.label === "Starter Lift") drawSkiLift(obj.x, obj.y);
                if (obj.label === "Ski Rack") drawSkiRack(obj.x, obj.y);
                if (obj.label === "Main Lodge") drawLodge(obj.x, obj.y);
            }
        } else { // Player
            ctx.fillStyle = "rgba(0,0,0,0.2)";
            ctx.beginPath(); ctx.ellipse(obj.x, obj.y + 5, 20, 10, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = obj.color;
            ctx.fillRect(obj.x - 15, obj.y - 35, 30, 30);
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.fillRect(obj.x - 15, obj.y - 10, 30, 10); // 3D side
        }
    });

    document.getElementById('moneyDisplay').innerText = Math.floor(money);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Direct Income Interval
setInterval(() => {
    money += incomePerSecond;
}, 1000);
