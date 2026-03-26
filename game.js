// ---------------- Firebase Setup (Optional for School) ----------------
const firebaseConfig = {
  apiKey: "AIzaSyCq9pz49uAjIL12MeY9vWWNEZq8kqJ_2Ck",
  authDomain: "ski-resort-tycoon-545fb.firebaseapp.com",
  projectId: "ski-resort-tycoon-545fb",
  storageBucket: "ski-resort-tycoon-545fb.appspot.com",
  messagingSenderId: "358545799127",
  appId: "1:358545799127:web:6953dadd5604c3b631fd92"
};

// Initialize Firebase (Try/Catch prevents the whole game from crashing if blocked)
try {
  firebase.initializeApp(firebaseConfig);
} catch (e) {
  console.warn("Firebase blocked by school filter. Using Local Storage only.");
}

const auth = firebase.auth();
const db = firebase.firestore();

// ---------------- Game State ----------------
let money = 0;
let incomePerSecond = 0;
let isGuest = false;
const keys = {};

const player = { 
  x: window.innerWidth / 2, 
  y: window.innerHeight - 150, 
  size: 30, color: '#e74c3c', 
  dx: 0, dy: 0, maxSpeed: 5, type: 'player' 
};

const buttons = [
  { x: 200, y: 300, width: 140, height: 45, cost: 0, type: 'building', label: 'Starter Lift', bought: false, income: 1 },
  { x: 600, y: 500, width: 140, height: 45, cost: 100, type: 'building', label: 'Wax Station', bought: false, speedUpgrade: 1.4 },
  { x: 900, y: 250, width: 140, height: 45, cost: 500, type: 'building', label: 'Main Gondola', bought: false, income: 8 }
];

const trees = [
  { x: 300, y: 200, size: 60, type: 'tree' },
  { x: 800, y: 450, size: 85, type: 'tree' },
  { x: 450, y: 650, size: 70, type: 'tree' },
  { x: 1100, y: 300, size: 90, type: 'tree' }
];

// ---------------- Initialization ----------------

window.onload = () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // --- BUTTON: Guest Mode (School Chromebook Fix) ---
  const guestBtn = document.getElementById('guestPlay');
  if (guestBtn) {
    guestBtn.onclick = () => {
      isGuest = true;
      startGame();
    };
  }

  // --- BUTTON: Email Login ---
  document.getElementById('emailSignIn').onclick = async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    try {
      await auth.signInWithEmailAndPassword(email, pass);
    } catch(err) {
      if(err.code === 'auth/user-not-found') await auth.createUserWithEmailAndPassword(email, pass);
      else document.getElementById('loginError').textContent = err.message;
    }
  };

  // --- BUTTON: Google Login ---
  document.getElementById('googleSignIn').onclick = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try { await auth.signInWithPopup(provider); } 
    catch (err) { document.getElementById('loginError').textContent = "Blocked or Error: " + err.message; }
  };

  // --- Auth State Observer ---
  auth.onAuthStateChanged(user => {
    if (user && !isGuest) {
      startGame(user.uid);
    }
  });

  async function startGame(uid = null) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    
    // Load data from either Firebase or LocalStorage
    if (uid) {
      await loadFromFirebase(uid);
      setInterval(() => saveToFirebase(uid), 10000);
    } else {
      loadFromLocalStorage();
      setInterval(saveToLocalStorage, 10000);
    }

    requestAnimationFrame(gameLoop);
  }

  function gameLoop() {
    update();
    draw(ctx, canvas);
    requestAnimationFrame(gameLoop);
  }
};

// ---------------- Save/Load Systems ----------------

function saveToLocalStorage() {
  const data = { money, incomePerSecond, speed: player.maxSpeed, buttons: buttons.map(b => b.bought) };
  localStorage.setItem('skiResortSave', JSON.stringify(data));
  console.log("Saved to Browser Storage");
}

function loadFromLocalStorage() {
  const data = localStorage.getItem('skiResortSave');
  if (data) {
    const p = JSON.parse(data);
    money = p.money || 0;
    incomePerSecond = p.incomePerSecond || 0;
    player.maxSpeed = p.speed || 5;
    p.buttons?.forEach((b, i) => { if(buttons[i]) buttons[i].bought = b; });
  }
}

async function saveToFirebase(uid) {
  try {
    await db.collection('users').doc(uid).set({ money, incomePerSecond, buttons: buttons.map(b => b.bought) });
  } catch(e) { console.error("Firebase save failed"); }
}

async function loadFromFirebase(uid) {
  try {
    const doc = await db.collection('users').doc(uid).get();
    if (doc.exists) {
      const data = doc.data();
      money = data.money || 0;
      incomePerSecond = data.incomePerSecond || 0;
      data.buttons?.forEach((b, i) => { if(buttons[i]) buttons[i].bought = b; });
    }
  } catch(e) { console.error("Firebase load failed"); }
}

// ---------------- Game Logic & Rendering ----------------

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
        incomePerSecond += (btn.income || 0);
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
      ctx.font = 'bold 12px Arial';
      ctx.fillText(obj.bought ? 'OWNED' : `${obj.label} $${obj.cost}`, obj.x + 5, obj.y + 25);
      if(!obj.bought && isNear(player, obj)) {
        ctx.fillStyle = 'black';
        ctx.fillText('[SPACE]', obj.x + obj.width/2 - 20, obj.y - 10);
      }
    } else if (obj.type === 'player') {
      ctx.fillStyle = obj.color;
      ctx.fillRect(obj.x, obj.y, obj.size, obj.size);
    }
  });
  document.getElementById('money').innerText = `$${Math.floor(money)}`;
}

setInterval(() => { money += incomePerSecond; }, 1000);
