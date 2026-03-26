// Global Variables
let canvas, ctx, money = 0, incomePerSecond = 0;
const keys = {};

const player = { x: 100, y: 100, size: 30, color: 'red', dx: 0, dy: 0, maxSpeed: 5, type: 'player' };
const trees = [{ x: 300, y: 200, size: 60, type: 'tree' }, { x: 500, y: 400, size: 80, type: 'tree' }];
const buttons = [{ x: 200, y: 300, width: 140, height: 45, cost: 0, type: 'building', label: 'Starter Lift', bought: false, income: 1 }];

window.onload = () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // LOGIN LOGIC
    document.getElementById('guestPlay').onclick = () => {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        gameLoop();
    };

    // Firebase (Simplified for Chromebook)
    document.getElementById('emailSignIn').onclick = () => alert("Try Guest Mode on school wifi!");
    document.getElementById('googleSignIn').onclick = () => alert("Try Guest Mode on school wifi!");
};

document.onkeydown = e => keys[e.key] = true;
document.onkeyup = e => keys[e.key] = false;

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (keys['ArrowUp']) player.dy = -player.maxSpeed;
    else if (keys['ArrowDown']) player.dy = player.maxSpeed;
    else player.dy = 0;

    if (keys['ArrowLeft']) player.dx = -player.maxSpeed;
    else if (keys['ArrowRight']) player.dx = player.maxSpeed;
    else player.dx = 0;

    player.x += player.dx;
    player.y += player.dy;

    // Buy logic
    buttons.forEach(btn => {
        if (!btn.bought && isNear(player, btn) && keys[' ']) {
            btn.bought = true;
            incomePerSecond += btn.income;
        }
    });
}

function isNear(p, b) {
    return p.x < b.x + b.width && p.x + p.size > b.x && p.y < b.y + b.height && p.y + p.size > b.y;
}

function draw() {
    ctx.fillStyle = "#f0f8ff"; // Snowy Background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Trees
    trees.forEach(t => {
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.moveTo(t.x, t.y);
        ctx.lineTo(t.x - 30, t.y + 60);
        ctx.lineTo(t.x + 30, t.y + 60);
        ctx.fill();
    });

    // Draw Buttons
    buttons.forEach(b => {
        ctx.fillStyle = b.bought ? "gray" : "blue";
        ctx.fillRect(b.x, b.y, b.width, b.height);
        ctx.fillStyle = "white";
        ctx.fillText(b.label, b.x + 10, b.y + 25);
    });

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);

    document.getElementById('money').innerText = "$" + money;
}

setInterval(() => { money += incomePerSecond; }, 1000);
