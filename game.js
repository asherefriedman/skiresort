// ---------------- Firebase Setup ----------------
const firebaseConfig = {
  apiKey: "AIzaSyCq9pz49uAjIL12MeY9vWWNEZq8kqJ_2Ck",
  authDomain: "ski-resort-tycoon-545fb.firebaseapp.com",
  projectId: "ski-resort-tycoon-545fb",
  storageBucket: "ski-resort-tycoon-545fb.appspot.com",
  messagingSenderId: "358545799127",
  appId: "1:358545799127:web:6953dadd5604c3b631fd92"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ---------------- HTML Elements ----------------
const loginScreen = document.getElementById('loginScreen');
const gameScreen = document.getElementById('gameScreen');
const moneyDisplay = document.getElementById('money');
const loginError = document.getElementById('loginError');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set Canvas Size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ---------------- Game State & Variables ----------------
let money = 0;
let incomePerSecond = 0;
const keys = {};

const player = { 
  x: canvas.width / 2, 
  y: canvas.height - 150, 
  size: 30, 
  color: '#e74c3c', 
  dx: 0, 
  dy: 0, 
  maxSpeed: 5,
  type: 'player' 
};

const buttons = [
  { x: 200, y: 300, width: 120, height: 45, cost: 0, type: 'building', label: 'Starter Lift', bought: false, income: 1 },
  { x: 600, y: 500, width: 120, height: 45, cost: 100, type: 'building', label: 'Wax Station', bought: false, speedUpgrade: 1.4 },
  { x: 900, y: 250, width: 120, height: 45, cost: 500, type: 'building', label: 'Main Gondola', bought: false, income: 8 }
];

const trees = [
  { x: 300, y: 200, size: 60, type: 'tree' },
  { x: 800, y: 450, size: 85, type: 'tree' },
  { x: 450, y: 650, size: 70, type: 'tree' },
  { x: 1200, y: 300, size: 100, type: 'tree' },
  { x: 150, y: 500, size: 55, type: 'tree' }
];

// ---------------- Input Listeners ----------------
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// ---------------- Authentication Logic ----------------

// 1. Email Sign In / Register
document.getElementById('emailSignIn').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;
  
  if (!email || !pass) {
    loginError.textContent = "Please enter both email and password.";
    return;
  }

  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch(err) {
    if(err.code === 'auth/user-not-found') {
      try {
        await auth.createUserWithEmailAndPassword(email, pass);
      } catch (regErr) {
        loginError.textContent = regErr.message;
      }
    } else {
      loginError.textContent = err.message;
    }
  }
});

// 2. Google Sign In (The Fix)
document.getElementById('googleSignIn').addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    await auth.signInWithPopup(provider);
    // Success is handled by onAuthStateChanged below
  } catch (err) {
    console.error("Google Auth Error:", err);
    loginError.textContent = `Google Error: ${err.message}`;
  }
});

// 3. Sign Out
document.getElementById('signOutBtn').addEventListener('click', () => {
  auth.signOut().then(() => {
    location.reload(); // Refresh page to clear state on logout
  });
});

// 4. Auth State Observer (Main Entry Point)
auth.onAuthStateChanged(user => {
  if (user) {
    loginSuccess(user);
  } else {
    loginScreen.style.display = 'flex';
    gameScreen.style.display = 'none';
  }
});

async function loginSuccess(user) {
  loginScreen.style.display = 'none';
  gameScreen.style.display = 'block';
  
  await loadGame(user.uid);
  gameLoop();
  
  // Auto-save every 10 seconds
  setInterval(() => saveGame(user.uid), 10000);
}

// ---------------- Database Persistence ----------------

async function saveGame(uid) {
  const data = { 
    money, 
    incomePerSecond, 
    playerSpeed: player.maxSpeed, 
    buttons: buttons.map(b => b.bought) 
  };
  try {
    await db.collection('users').doc(uid).set(data);
    console.log("Game Saved");
  } catch (e) {
    console.error("Save error:", e);
  }
}

async function loadGame(uid) {
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists) {
      const data = doc.data();
      money = data.money || 0;
      incomePerSecond = data.incomePerSecond || 0;
      player.maxSpeed = data.playerSpeed || 5;
      if (data.buttons) {
        data.buttons.forEach((isBought, i) => {
          if (buttons[i]) buttons[i].bought = isBought;
        });
      }
    }
  } catch (e) {
    console.error("Load error:", e);
  }
}

// ---------------- Game Logic ----------------

function isNear(p, b) {
  // Simple AABB collision check
  return p.x < b.x + b.width && 
         p.x + p.size > b.x && 
         p.y < b.y + b.height && 
         p.y + p.size > b.y;
}

function update() {
  // Friction-based movement (Feels like skiing!)
  if (keys['ArrowUp'] || keys['w']) player.dy -= 0.5;
  if (keys['ArrowDown'] || keys['s']) player.dy += 0.5;
  if (keys['ArrowLeft'] || keys['a']) player.dx -= 0.5;
  if (keys['ArrowRight'] || keys['d']) player.dx += 0.5;

  player.dx *= 0.9; // Friction
  player.dy *= 0.9;

  // Clamp speed to maxSpeed
  player.dx = Math.max(-player.maxSpeed, Math.min(player.maxSpeed, player.dx));
  player.dy = Math.max(-player.maxSpeed, Math.min(player.maxSpeed, player.dy));

  player.x += player.dx;
  player.y += player.dy;

  // Keep player on screen
  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

  // Shop Interaction
  buttons.forEach(btn => {
    if (!btn.bought && isNear(player, btn)) {
      if (keys[' ']) { // Spacebar to buy
        if (money >= btn.cost) {
          money -= btn.cost;
          btn.bought = true;
          if (btn.income) incomePerSecond += btn.income;
          if (btn.speedUpgrade) player.maxSpeed *= btn.speedUpgrade;
        }
      }
    }
  });
}

// ---------------- Rendering ----------------

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Background Snow
  ctx.fillStyle = '#f7fdff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Combine everything for Depth Sorting (Y-Axis)
  // This makes the player appear behind things when "above" them on screen
  const drawables = [...trees, ...buttons, player];
  drawables.sort((a, b) => {
    const aY = a.type === 'player' ? a.y + a.size : (a.type === 'tree' ? a.y + a.size : a.y + a.height);
    const bY = b.type === 'player' ? b.y + b.size : (b.type === 'tree' ? b.y + b.size : b.y + b.height);
    return aY - bY;
  });

  drawables.forEach(obj => {
    if (obj.type === 'tree') {
      // Draw Tree
      ctx.fillStyle = '#2d5a27';
      ctx.beginPath();
      ctx.moveTo(obj.x, obj.y);
      ctx.lineTo(obj.x - obj.size/2, obj.y + obj.size);
      ctx.lineTo(obj.x + obj.size/2, obj.y + obj.size);
      ctx.fill();
      // Trunk
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(obj.x - 4, obj.y + obj.size, 8, 10);
    } 
    else if (obj.type === 'building') {
      // Draw Shop Button
      ctx.fillStyle = obj.bought ? '#2ecc71' : '#3498db';
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0,0,0,0.1)';
      ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
      ctx.shadowBlur = 0; // Reset shadow
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      const statusText = obj.bought ? 'OWNED' : `${obj.label} ($${obj.cost})`;
      ctx.fillText(statusText, obj.x + obj.width/2, obj.y + obj.height/1.6);
      
      // Proximity Indicator
      if (!obj.bought && isNear(player, obj)) {
        ctx.fillStyle = '#2c3e50';
        ctx.fillText("[PRESS SPACE]", obj.x + obj.width/2, obj.y - 10);
      }
    } 
    else if (obj.type === 'player') {
      // Draw Player Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.ellipse(obj.x + obj.size/2, obj.y + obj.size, 15, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw Player
      ctx.fillStyle = obj.color;
      ctx.fillRect(obj.x, obj.y, obj.size, obj.size);
      // Goggles
      ctx.fillStyle = '#333';
      ctx.fillRect(obj.x + 5, obj.y + 5, obj.size - 10, 8);
    }
  });

  // UI Updates
  moneyDisplay.innerText = `$${Math.floor(money)}`;
}

// ---------------- Game Loop ----------------
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Income Tick (Once per second)
setInterval(() => {
  money += incomePerSecond;
}, 1000);

// Handle window resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
