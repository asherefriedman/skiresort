let canvas, ctx, money = 0, incomePerSecond = 0;
const keys = {};

// 1. World & Camera Settings
const world = { width: 3000, height: 3000 };
const camera = { x: 0, y: 0 };
const player = { x: 400, y: 400, size: 30, color: '#ff7675', speed: 7 };

// 2. Sequential Build Parts
// Needs: references the ID of the button that must be bought FIRST
const buildSteps = [
    { id: 1, x: 400, y: 600, cost: 0, label: "Lodge Floor", type: "floor", bought: false, unlocked: true, income: 5 },
    { id: 2, x: 400, y: 600, cost: 50, label: "Lodge Walls", type: "walls", bought: false, unlocked: false, income: 10, needs: 1 },
    { id: 3, x: 400, y: 600, cost: 100, label: "Lodge Roof", type: "roof", bought: false, unlocked: false, income: 20, needs: 2 },
    
    { id: 4, x: 1000, y: 800, cost: 500, label: "Shop Floor", type: "floor", bought: false, unlocked: false, income: 50, needs: 3 },
    { id: 5, x: 1000, y: 800, cost: 1000, label: "Shop Walls", type: "walls", bought: false, unlocked: false, income: 100, needs: 4 },
    
    { id: 6, x: 1500, y: 1500, cost: 5000, label: "Hotel Base", type: "floor", bought: false, unlocked: false, income: 500, needs: 5 }
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

function update() {
    // Movement
    if (keys['w'] || keys['ArrowUp']) player.y -= player.speed;
    if (keys['s'] || keys['ArrowDown']) player.y += player.speed;
    if (keys['a'] || keys['ArrowLeft']) player.x -= player.speed;
    if (keys['d'] || keys['ArrowRight']) player.x += player.speed;

    // Camera Logic: Keep player in center
    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;

    // Build Logic
    buildSteps.forEach((step) => {
        if (step.unlocked && !step.bought) {
            let dist = Math.hypot(player.x - step.x, player.y - step.y);
            if (dist < 45 && money >= step.cost) {
                money -= step.cost;
                step.bought = true;
                incomePerSecond += step.income;
                // Unlock the next item that depends on this one
                let next = buildSteps.find(s => s.needs === step.id);
                if (next) next.unlocked = true;
            }
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-camera.x, -camera.y); // Transform world to Camera view

    // Draw Ground (Tundra Blue)
    ctx.fillStyle = "#cad3d8"; 
    ctx.fillRect(0, 0, world.width, world.height);

    // Draw Paths (Connects all bought "Floor" parts)
    ctx.strokeStyle = "#95a5a6";
    ctx.lineWidth = 40;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(400, 400); // Start at spawn
    buildSteps.forEach(s => {
        if (s.bought && s.type === "floor") ctx.lineTo(s.x, s.y);
    });
    ctx.stroke();

    // Draw Constructions
    buildSteps.forEach(s => {
        if (s.bought) {
            if (s.type === "floor") {
                ctx.fillStyle = "#7f8c8d"; // Gray Foundation
                ctx.fillRect(s.x - 70, s.y - 50, 140, 100);
            }
            if (s.type === "walls") {
                ctx.fillStyle = "#5d4037"; // Brown Walls
                ctx.fillRect(s.x - 60, s.y - 100, 120, 80);
                ctx.fillStyle = "#81ecec"; // Window
                ctx.fillRect(s.x - 30, s.y - 80, 20, 20);
            }
            if (s.type === "roof") {
                ctx.fillStyle = "white"; // Snow Roof
                ctx.beginPath();
                ctx.moveTo(s.x - 75, s.y - 100);
                ctx.lineTo(s.x + 75, s.y - 100);
                ctx.lineTo(s.x, s.y - 160);
                ctx.fill();
            }
        } else if (s.unlocked) {
            // Purchase Pad
            ctx.fillStyle = "rgba(0,0,0,0.1)";
            ctx.beginPath(); ctx.ellipse(s.x, s.y+5, 45, 22, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "#00d2ff";
            ctx.beginPath(); ctx.ellipse(s.x, s.y, 40, 20, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "black"; ctx.textAlign = "center";
            ctx.fillText(s.label.toUpperCase(), s.x, s.y - 50);
            ctx.fillText("$" + s.cost, s.x, s.y - 35);
        }
    });

    // Draw Player
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath(); ctx.ellipse(player.x, player.y+5, 20, 10, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - 15, player.y - 40, 30, 30);
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.fillRect(player.x - 15, player.y - 10, 30, 10);

    ctx.restore(); // Return to HUD view

    document.getElementById('moneyDisplay').innerText = Math.floor(money);
}

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }
setInterval(() => { money += incomePerSecond; }, 1000);
