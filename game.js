// ---------------- Firebase Setup ----------------
const firebaseConfig = {
  apiKey: "AIzaSyCq9pz49uAjIL12MeY9vWWNEZq8kqJ_2Ck",
  authDomain: "ski-resort-tycoon-545fb.firebaseapp.com",
  projectId: "ski-resort-tycoon-545fb",
  storageBucket: "ski-resort-tycoon-545fb.appspot.com",
  messagingSenderId: "358545799127",
  appId: "1:358545799127:web:6953dadd5604c3b631fd92"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ---------------- Elements ----------------
const loginScreen = document.getElementById('loginScreen');
const gameScreen = document.getElementById('gameScreen');
const moneyDisplay = document.getElementById('money');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ---------------- Game State ----------------
let money = 0;
let incomePerSecond = 0;
const keys = {};

const player = { 
  x: canvas.width/2, 
  y: canvas.height-150, 
  size: 30, 
  color: '#e74c3c', 
  dx: 0, dy: 0, 
  maxSpeed: 5,
  type: 'player' // for sorting
};

const buttons = [
  {x: 200, y: 300, width: 100, height: 40, cost: 0, type: 'building', label: 'Small Lift', bought: false, income: 1},
  {x: 600, y: 500, width: 100, height: 40, cost: 100, type: 'building', label: 'Speed Wax', bought: false, speedUpgrade: 1.5},
  {x: 900, y: 250, width: 100, height: 40, cost: 500, type: 'building', label: 'Medium Lift', bought: false, income: 5}
];

const trees = [
  {x: 400, y: 400, size: 60, type: 'tree'},
  {x: 750, y: 350, size: 80, type: 'tree'},
  {x: 300, y: 600, size: 70, type: 'tree'},
  {x: 1100, y: 200, size: 90, type: 'tree'}
];

// ---------------- Input ----------------
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// ---------------- Auth Logic ----------------
document.getElementById('emailSignIn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;
  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch(err) {
    if(err.code === 'auth/user-not-found') await auth.createUserWithEmailAndPassword(email, pass);
    else document.getElementById('loginError').textContent = err.message;
  }
});

auth.onAuthStateChanged(user => {
  if (user) loginSuccess(user);
});

async function loginSuccess(user) {
  loginScreen.style.display = 'none';
  gameScreen.style.display = 'block';
  await loadGame(user.uid);
  gameLoop();
  setInterval(() => saveGame(user.uid), 10000); // Auto-save every 10s
}

// ---------------- Save/Load ----------------
async function saveGame(uid) {
  const data = { money, incomePerSecond, playerSpeed: player.maxSpeed, buttons: buttons.map(b => b.bought) };
  await db.collection('users').doc(uid).set(data);
}

async function loadGame(uid) {
  const doc = await db.collection('users').doc(uid).get();
  if (doc.exists) {
    const data = doc.data();
    money = data.money || 0;
    incomePerSecond = data.incomePerSecond || 0;
    player.maxSpeed = data.playerSpeed || 5;
    data.buttons?.forEach((b, i) => buttons[i].bought = b);
  }
}

// ---------------- Logic ----------------
function isNear(p, b) {
  return p.x < b.x + b.width && p.x + p.size > b.x && p.y < b.y + b.height && p.y + p.size > b.y;
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function update() {
  // Friction movement
  if (keys['ArrowUp']) player.dy -= 0.6;
  if (keys['ArrowDown']) player.dy += 0.6;
  if (keys['ArrowLeft']) player.dx -= 0.6;
  if (keys['ArrowRight']) player.dx += 0.6;

  player.dx *= 0.85;
  player.dy *= 0.85;
  player.x += player.dx;
  player.y += player.dy;

  // Interaction
  buttons.forEach(btn => {
    if (!btn.bought && isNear(player, btn) && keys[' ']) {
      if (money >= btn.cost) {
        money -= btn.cost;
        btn.bought = true;
        if (btn.income) incomePerSecond += btn.income;
        if (btn.speedUpgrade) player.maxSpeed *= btn.speedUpgrade;
      }
    }
  });
}

// ---------------- Rendering ----------------
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Background
  ctx.fillStyle = '#f0faff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Combine everything for depth sorting (Y-sorting)
  const drawables = [...trees, ...buttons, player];
  drawables.sort((a, b) => (a.y + (a.size || a.height)) - (b.y + (b.size || b.height)));

  drawables.forEach(obj => {
    if (obj.type === 'tree') {
      ctx.fillStyle = '#2d5a27';
      ctx.beginPath();
      ctx.moveTo(obj.x, obj.y);
      ctx.lineTo(obj.x - obj.size/2, obj.y + obj.size);
      ctx.lineTo(obj.x + obj.size/2, obj.y + obj.size);
      ctx.fill();
    } else if (obj.type === 'building') {
      ctx.fillStyle = obj.bought ? '#2ecc71' : '#3498db';
      ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText(obj.bought ? 'OWNED' : `${obj.label} ($${obj.cost})`, obj.x + 5, obj.y + 25);
    } else if (obj.type === 'player') {
      ctx.fillStyle = obj.color;
      ctx.fillRect(obj.x, obj.y, obj.size, obj.size);
    }
  });

  moneyDisplay.innerText = `$${Math.floor(money)}`;
}

// Income Tick
setInterval(() => { money += incomePerSecond; }, 1000);
