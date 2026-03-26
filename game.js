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

// ---------------- Game State ----------------
let money = 0;
let incomePerSecond = 0;
const keys = {};

const player = { 
  x: window.innerWidth / 2, 
  y: window.innerHeight - 150, 
  size: 30, color: '#e74c3c', 
  dx: 0, dy: 0, maxSpeed: 5, type: 'player' 
};

const buttons = [
  { x: 200, y: 300, width: 130, height: 45, cost: 0, type: 'building', label: 'Starter Lift', bought: false, income: 1 },
  { x: 600, y: 500, width: 130, height: 45, cost: 100, type: 'building', label: 'Wax Station', bought: false, speedUpgrade: 1.4 },
  { x: 900, y: 250, width: 130, height: 45, cost: 500, type: 'building', label: 'Main Gondola', bought: false, income: 8 }
];

const trees = [
  { x: 300, y: 200, size: 60, type: 'tree' },
  { x: 800, y: 450, size: 85, type: 'tree' },
  { x: 450, y: 650, size: 70, type: 'tree' }
];

// ---------------- Initialization ----------------

window.onload = () => {
  console.log("Game Engine Ready");

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // --- Auth Listeners ---
  
  // Email Login
  document.getElementById('emailSignIn').onclick = async () => {
    console.log("Attempting Email Login...");
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    try {
      await auth.signInWithEmailAndPassword(email, pass);
    } catch(err) {
      if(err.code === 'auth/user-not-found') {
        await auth.createUserWithEmailAndPassword(email, pass);
      } else {
        document.getElementById('loginError').textContent = err.message;
      }
    }
  };

  // Google Login
  document.getElementById('googleSignIn').onclick = async () => {
    console.log("Opening Google Popup...");
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await auth.signInWithPopup(provider);
    } catch (err) {
      console.error("Google Error:", err);
      document.getElementById('loginError').textContent = err.message;
    }
  };

  // Sign Out
  document.getElementById('signOutBtn').onclick = () => {
    auth.signOut().then(() => location.reload());
  };

  // --- Game Loop Start ---
  auth.onAuthStateChanged(user => {
    if (user) {
      console.log("Logged in as:", user.email);
      document.getElementById('loginScreen').style.display = 'none';
      document.getElementById('gameScreen').style.display = 'block';
      loadGame(user.uid).then(() => {
        requestAnimationFrame(gameLoop);
      });
      setInterval(() => saveGame(user.uid), 10000);
    }
  });

  function gameLoop() {
    update();
    draw(ctx, canvas);
    requestAnimationFrame(gameLoop);
  }
};

// ---------------- Logic & Rendering ----------------

document.onkeydown = e => keys[e.key] = true;
document.onkeyup = e => keys[e.key] = false;

function update() {
  if (keys['ArrowUp'] || keys['w']) player.dy -= 0.5;
  if (keys['ArrowDown'] || keys['s']) player.dy += 0.5;
  if (keys['ArrowLeft'] || keys['a']) player.dx -= 0.5;
  if (keys['ArrowRight'] || keys['d']) player.dx += 0.5;

  player.dx *= 0.9; player.dy *= 0.9;
  player.x += player.dx; player.y += player.dy;

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

function isNear(p, b) {
  return p.x < b.x + b.width && p.x + p.size > b.x && p.y < b.y + b.height && p.y + p.size > b.y;
}

function draw(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f7fdff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const drawables = [...trees, ...buttons, player];
  drawables.sort((a, b) => (a.y + (a.size||a.height)) - (b.y + (b.size||b.height)));

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
      ctx.font = 'bold 11px Arial';
      ctx.fillText(obj.bought ? 'OWNED' : `${obj.label} $${obj.cost}`, obj.x + 5, obj.y + 25);
    } else if (obj.type === 'player') {
      ctx.fillStyle = obj.color;
      ctx.fillRect(obj.x, obj.y, obj.size, obj.size);
    }
  });
  document.getElementById('money').innerText = `$${Math.floor(money)}`;
}

async function saveGame(uid) {
  await db.collection('users').doc(uid).set({ money, incomePerSecond, playerSpeed: player.maxSpeed, buttons: buttons.map(b => b.bought) });
}

async function loadGame(uid) {
  const doc = await db.collection('users').doc(uid).get();
  if (doc.exists) {
    const data = doc.data();
    money = data.money || 0;
    incomePerSecond = data.incomePerSecond || 0;
    player.maxSpeed = data.playerSpeed || 5;
    data.buttons?.forEach((b, i) => { if(buttons[i]) buttons[i].bought = b; });
  }
}

setInterval(() => { money += incomePerSecond; }, 1000);
