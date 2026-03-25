const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Player/skier
const player = {
  x: canvas.width/2,
  y: canvas.height - 150,
  size: 30,
  color: 'red',
  dx: 0,
  dy: 0,
  maxSpeed: 4
};

// Money system
let money = 0;
let incomePerSecond = 0; // Base income starts at 0

// Input
const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// Ground buttons (first is free)
const buttons = [
  {x: 200, y: 300, width: 60, height: 20, cost: 0, type: 'Small Lift', bought: false, income: 1},
  {x: 600, y: 500, width: 60, height: 20, cost: 100, type: 'Ski Upgrade', bought: false, speedUpgrade: 1.5},
  {x: 900, y: 250, width: 60, height: 20, cost: 200, type: 'Medium Lift', bought: false, income: 3}
];

// Moving lifts for decoration
const lifts = [
  {x: 100, y: 100, width: 40, height: 10, speed: 1},
  {x: 400, y: 200, width: 40, height: 10, speed: 1.2}
];

// Trees for scenery
const trees = [
  {x: 400, y: 400, size: 40},
  {x: 750, y: 350, size: 50},
  {x: 300, y: 550, size: 35}
];

// Main update loop
function update() {
  // Smooth movement
  if(keys['ArrowUp']) player.dy = Math.max(player.dy - 0.2, -player.maxSpeed);
  else if(keys['ArrowDown']) player.dy = Math.min(player.dy + 0.2, player.maxSpeed);
  else player.dy *= 0.9;

  if(keys['ArrowLeft']) player.dx = Math.max(player.dx - 0.2, -player.maxSpeed);
  else if(keys['ArrowRight']) player.dx = Math.min(player.dx + 0.2, player.maxSpeed);
  else player.dx *= 0.9;

  player.x += player.dx;
  player.y += player.dy;

  // Keep player in bounds
  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

  // Check button interaction
  buttons.forEach(btn => {
    if(!btn.bought && isNear(player, btn) && keys[' ']) {
      if(money >= btn.cost) {
        money -= btn.cost;
        btn.bought = true;
        if(btn.income) incomePerSecond += btn.income;
        if(btn.speedUpgrade) player.maxSpeed *= btn.speedUpgrade;
        alert(`Bought ${btn.type}!`);
      } else if(btn.cost === 0) { // free button
        btn.bought = true;
        if(btn.income) incomePerSecond += btn.income;
        alert(`Received free ${btn.type}!`);
      } else {
        alert("Not enough money!");
      }
    }
  });

  draw();
  requestAnimationFrame(update);
}

// Check if player is near a button
function isNear(p, btn) {
  return p.x + p.size > btn.x &&
         p.x < btn.x + btn.width &&
         p.y + p.size > btn.y &&
         p.y < btn.y + btn.height;
}

// Draw scene
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Snow ground
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw slopes (3D-ish gradient)
  ctx.fillStyle = 'rgba(200,200,200,0.3)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw trees
  trees.forEach(tree => {
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.moveTo(tree.x, tree.y);
    ctx.lineTo(tree.x - tree.size/2, tree.y + tree.size);
    ctx.lineTo(tree.x + tree.size/2, tree.y + tree.size);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#8B4513'; // trunk
    ctx.fillRect(tree.x - 5, tree.y + tree.size, 10, 15);
  });

  // Draw lifts
  lifts.forEach(lift => {
    ctx.fillStyle = 'grey';
    ctx.fillRect(lift.x, lift.y, lift.width, lift.height);
    lift.y += lift.speed;
    if(lift.y > canvas.height) lift.y = -lift.height;
  });

  // Draw buttons
  buttons.forEach(btn => {
    ctx.fillStyle = btn.bought ? 'green' : 'blue';
    ctx.fillRect(btn.x, btn.y, btn.width, btn.height);
    ctx.fillStyle = '#fff';
    ctx.font = '14px sans-serif';
    ctx.fillText(`$${btn.cost}`, btn.x + 5, btn.y + 15);
  });

  // Draw player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.size, player.size);
}

// Money generation from purchased items
setInterval(() => {
  money += incomePerSecond;
  document.getElementById('money').innerText = `Money: $${money}`;
}, 1000);

update();
