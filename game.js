let canvas, ctx, money = 100, incomePerSecond = 0;
const keys = {};

const world = { width: 5000, height: 5000 };
const camera = { x: 0, y: 0 };
const player = { x: 400, y: 400, speed: 8, color: '#ff7675' };

// BUILD DATA (The "Master List")
let buildSteps = [
    { id: 1, x: 400, y: 600, cost: 0, label: "Lodge Floor", type: "floor", bought: false, unlocked: true, income: 5, needs: 0 },
    { id: 2, x: 400, y: 600, cost: 50, label: "Lodge Walls", type: "walls", bought: false, unlocked: false, income: 10, needs: 1 },
    { id: 3, x: 400, y: 600, cost: 200, label: "Lodge Roof", type: "roof", bought: false, unlocked: false, income: 20, needs: 2 }
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

// MOD PANEL ACTIONS
document.getElementById('toggleMod').onclick = () => document.getElementById('modPanel').classList.toggle('active');

document.getElementById('addBuildBtn').onclick = () => {
    const newStep = {
        id: buildSteps.length + 1,
        x: parseInt(document.getElementById('modX').value) || 400,
        y: parseInt(document.getElementById('modY').value) || 600,
        cost: parseInt(document.getElementById('modCost').value) || 0,
        label: document.getElementById('modLabel').value || "New Item",
        type: document.getElementById('modType').value,
        bought: false,
        unlocked: false,
        income: parseInt(document.getElementById('modIncome').value) || 10,
        needs: parseInt(document.getElementById('modNeeds').value) || 1
    };
    buildSteps.push(newStep);
    alert("Added " + newStep.label + "! ID: " + newStep.id);
};

document.getElementById('exportCodeBtn').onclick = () => {
    let code = "let buildSteps = [\n" + buildSteps.map(s => 
        `    { id: ${s.id}, x: ${s.x}, y: ${s.y}, cost: ${s.cost}, label: "${s.label}", type: "${s.type}", bought: ${s.bought}, unlocked: ${s.unlocked}, income: ${s.income}, needs: ${s.needs} }`
    ).join(",\n") + "\n];";
    document.getElementById('exportBox').value = code;
    document.getElementById('exportBox').select();
};

function update() {
    // Player Movement
    if (keys['w'] || keys['ArrowUp']) player.y -= player.speed;
    if (keys['s'] || keys['ArrowDown']) player.y += player.speed;
    if (keys['a'] || keys['ArrowLeft']) player.x -= player.speed;
    if (keys['d'] || keys['ArrowRight']) player.x += player.speed;

    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;

    // Tycoon Logic (Check buttons)
    buildSteps.forEach(s => {
        if (s.unlocked && !s.bought) {
            if (Math.hypot(player.x - s.x, player.y - s.y) < 45 && money >= s.cost) {
                money -= s.cost;
                s.bought = true;
                incomePerSecond += s.income;
                // Unlock the next item
                buildSteps.forEach(n => { if (n.needs === s.id) n.unlocked = true; });
            }
        }
    });

    // Update HUD Zone
    if (player.x > 2000) document.getElementById('zoneDisplay').innerText = "Upper Mountain";
    else document.getElementById('zoneDisplay').innerText = "Resort Village";
}

function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // World Background
    ctx.fillStyle = "#cad3d8"; ctx.fillRect(0,0,world.width,world.height);

    // Paths
    ctx.strokeStyle = "#95a5a6"; ctx.lineWidth = 40; ctx.lineJoin = "round"; ctx.beginPath();
    ctx.moveTo(400, 400);
    buildSteps.filter(s => s.bought && s.type === "floor").forEach(s => ctx.lineTo(s.x, s.y));
    ctx.stroke();

    // Render Buildings
    buildSteps.forEach(s => {
        if (s.bought) {
            ctx.fillStyle = s.type === "floor" ? "#7f8c8d" : s.type === "walls" ? "#5d4037" : s.type === "glass" ? "#81ecec" : "white";
            if (s.type === "floor") ctx.fillRect(s.x-80, s.y-60, 160, 120);
            if (s.type === "walls") ctx.fillRect(s.x-75, s.y-115, 150, 90);
            if (s.type === "glass") { ctx.fillRect(s.x-50, s.y-90, 30, 30); ctx.fillRect(s.x+20, s.y-90, 30, 30); }
            if (s.type === "roof") { ctx.beginPath(); ctx.moveTo(s.x-90, s.y-115); ctx.lineTo(s.x+90, s.y-115); ctx.lineTo(s.x, s.y-190); ctx.fill(); }
        } else if (s.unlocked) {
            ctx.fillStyle = "#00d2ff"; ctx.beginPath(); ctx.ellipse(s.x, s.y, 40, 20, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "black"; ctx.font = "bold 12px Arial"; ctx.textAlign = "center";
            ctx.fillText(s.label.toUpperCase(), s.x, s.y-50);
            ctx.fillText("$"+s.cost, s.x, s.y-35);
        }
    });

    // Player
    ctx.fillStyle = player.color; ctx.fillRect(player.x-15, player.y-45, 30, 30);
    ctx.restore();

    document.getElementById('moneyDisplay').innerText = Math.floor(money);
    document.getElementById('incomeDisplay').innerText = incomePerSecond;
}

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }
setInterval(() => { money += (incomePerSecond/10); }, 100);
