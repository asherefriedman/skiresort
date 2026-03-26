let canvas, ctx, money = 0, incomePerSecond = 0;
const keys = {};

const world = { width: 5000, height: 5000 };
const camera = { x: 0, y: 0 };
const player = { x: 400, y: 400, size: 30, color: '#ff7675', speed: 8 };

// --- THE MEGA BUILD DATABASE ---
const buildSteps = [
    // AREA 1: STARTER LODGE
    { id: 1, x: 400, y: 600, cost: 0, label: "Lodge Floor", type: "floor", bought: false, unlocked: true, income: 5 },
    { id: 2, x: 400, y: 600, cost: 50, label: "Lodge Walls", type: "walls", bought: false, unlocked: false, income: 10, needs: 1 },
    { id: 3, x: 400, y: 600, cost: 200, label: "Lodge Roof", type: "roof", bought: false, unlocked: false, income: 20, needs: 2 },

    // AREA 2: COCOA SHOP (800, 500)
    { id: 11, x: 800, y: 500, cost: 1000, label: "Cocoa Floor", type: "floor", bought: false, unlocked: false, income: 50, needs: 3 },
    { id: 12, x: 800, y: 500, cost: 2000, label: "Cocoa Walls", type: "walls", bought: false, unlocked: false, income: 100, needs: 11 },

    // AREA 3: SKI SHOP (1200, 800)
    { id: 21, x: 1200, y: 800, cost: 5000, label: "Shop Floor", type: "floor", bought: false, unlocked: false, income: 200, needs: 12 },

    // AREA 4: SKI SLOPE (400, 1500)
    { id: 31, x: 400, y: 1500, cost: 15000, label: "Slope Gate", type: "floor", bought: false, unlocked: false, income: 500, needs: 21 },

    // AREA 5: ICE RINK (1600, 1500)
    { id: 41, x: 1600, y: 1500, cost: 40000, label: "Rink Floor", type: "floor", bought: false, unlocked: false, income: 1000, needs: 31 },

    // AREA 6: RESTAURANT (2200, 1000)
    { id: 51, x: 2200, y: 1000, cost: 100000, label: "Restaurant Base", type: "floor", bought: false, unlocked: false, income: 2500, needs: 41 },

    // AREA 7: WATERPARK (1000, 3000)
    { id: 61, x: 1000, y: 3000, cost: 500000, label: "Waterpark Floor", type: "floor", bought: false, unlocked: false, income: 6000, needs: 51 },

    // AREA 8: CONDOS (3000, 500)
    { id: 71, x: 3000, y: 500, cost: 1500000, label: "Condo Base", type: "floor", bought: false, unlocked: false, income: 15000, needs: 61 },

    // AREA 9: GRAND HOTEL (3500, 2500)
    { id: 81, x: 3500, y: 2500, cost: 5000000, label: "Hotel Lobby", type: "floor", bought: false, unlocked: false, income: 50000, needs: 71 },

    // AREA 10: SUMMIT STATION (4500, 4500)
    { id: 91, x: 4500, y: 4500, cost: 20000000, label: "The Summit", type: "floor", bought: false, unlocked: false, income: 200000, needs: 81 }
];

/* HOW TO ADD MORE ITEMS:
   Copy this block and change the ID and NEEDS:
   { id: 4, x: 400, y: 600, cost: 500, label: "Lodge Window", type: "glass", bought: false, unlocked: false, income: 25, needs: 3 },
*/

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
    // Basic Movement
    if (keys['w'] || keys['ArrowUp']) player.y -= player.speed;
    if (keys['s'] || keys['ArrowDown']) player.y += player.speed;
    if (keys['a'] || keys['ArrowLeft']) player.x -= player.speed;
    if (keys['d'] || keys['ArrowRight']) player.x += player.speed;

    // Camera follow
    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;

    // Building Collision
    buildSteps.forEach((s) => {
        if (s.unlocked && !s.bought) {
            let d = Math.hypot(player.x - s.x, player.y - s.y);
            if (d < 45 && money >= s.cost) {
                money -= s.cost;
                s.bought = true;
                incomePerSecond += s.income;
                let next = buildSteps.find(item => item.needs === s.id);
                if (next) next.unlocked = true;
            }
        }
    });

    // Zone Tracking for HUD
    if (player.x > 4000) document.getElementById('zoneDisplay').innerText = "The Summit";
    else if (player.y > 2500) document.getElementById('zoneDisplay').innerText = "Waterpark Area";
    else if (player.x > 2500) document.getElementById('zoneDisplay').innerText = "Hotel District";
    else document.getElementById('zoneDisplay').innerText = "Resort Village";
}

function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // Ground & Borders
    ctx.fillStyle = "#cad3d8"; ctx.fillRect(0,0,world.width,world.height);
    ctx.strokeStyle = "white"; ctx.lineWidth = 10; ctx.strokeRect(0,0,world.width,world.height);

    // Render Paths
    ctx.strokeStyle = "#95a5a6"; ctx.lineWidth = 40; ctx.lineJoin="round"; ctx.beginPath();
    ctx.moveTo(400, 400);
    buildSteps.filter(s => s.bought && s.type === "floor").forEach(s => ctx.lineTo(s.x, s.y));
    ctx.stroke();

    // Render Items
    buildSteps.forEach(s => {
        if (s.bought) {
            if (s.type === "floor") { ctx.fillStyle = "#7f8c8d"; ctx.fillRect(s.x-80, s.y-60, 160, 120); }
            if (s.type === "walls") { ctx.fillStyle = "#5d4037"; ctx.fillRect(s.x-75, s.y-115, 150, 90); }
            if (s.type === "roof") { 
                ctx.fillStyle = "white"; ctx.beginPath(); 
                ctx.moveTo(s.x-90, s.y-115); ctx.lineTo(s.x+90, s.y-115); ctx.lineTo(s.x, s.y-190); ctx.fill(); 
            }
            if (s.type === "glass") { ctx.fillStyle = "#81ecec"; ctx.fillRect(s.x-50, s.y-90, 30, 30); ctx.fillRect(s.x+20, s.y-90, 30, 30); }
        } else if (s.unlocked) {
            ctx.fillStyle = "#00d2ff"; ctx.beginPath(); ctx.ellipse(s.x, s.y, 40, 20, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "black"; ctx.textAlign="center"; ctx.font="bold 12px Arial";
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

// --- MOD PANEL LOGIC ---

// 1. Toggle Panel Visibility
document.getElementById('toggleMod').onclick = () => {
    document.getElementById('modPanel').classList.toggle('active');
};

// 2. Add New Building Function
document.getElementById('addBuildBtn').onclick = () => {
    // Generate a unique ID (just use current timestamp)
    const newId = Date.now();
    
    const newStep = {
        id: newId,
        x: parseInt(document.getElementById('modX').value),
        y: parseInt(document.getElementById('modY').value),
        cost: parseInt(document.getElementById('modCost').value),
        label: document.getElementById('modLabel').value || "New Item",
        type: document.getElementById('modType').value,
        bought: false,
        unlocked: false, // Will unlock when the "Needs ID" item is bought
        income: parseInt(document.getElementById('modIncome').value),
        needs: parseInt(document.getElementById('modNeeds').value)
    };

    // Add it to the main game array
    buildSteps.push(newStep);

    // Alert for confirmation
    console.log("Mod Added:", newStep);
    alert("Added " + newStep.label + " to the build list!");
    
    // Auto-unlock if the requirement is already met
    const requirement = buildSteps.find(s => s.id === newStep.needs);
    if (requirement && requirement.bought) {
        newStep.unlocked = true;
    }
};

// --- MOD TIP ---
// To see the ID of an item you just bought, you can add this line 
// inside your update() function where s.bought = true:
// console.log("Just bought ID: " + s.id);
