// ---------------- Firebase Setup ----------------
const firebaseConfig = {
  apiKey: "AIzaSyCq9pz49uAjIL12MeY9vWWNEZq8kqJ_2Ck",
  authDomain: "ski-resort-tycoon-545fb.firebaseapp.com",
  projectId: "ski-resort-tycoon-545fb",
  storageBucket: "ski-resort-tycoon-545fb.appspot.com",
  messagingSenderId: "358545799127",
  appId: "1:358545799127:web:6953dadd5604c3b631fd92",
  measurementId: "G-J10KDH8V7D"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ---------------- HTML Elements ----------------
const loginScreen = document.getElementById('loginScreen');
const gameScreen = document.getElementById('gameScreen');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailSignInBtn = document.getElementById('emailSignIn');
const googleSignInBtn = document.getElementById('googleSignIn');
const loginError = document.getElementById('loginError');
const signOutBtn = document.getElementById('signOutBtn');
const moneyDisplay = document.getElementById('money');

// ---------------- Canvas ----------------
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ---------------- Game Variables ----------------
const player = { x: canvas.width/2, y: canvas.height-150, size:30, color:'red', dx:0, dy:0, maxSpeed:4 };
let money = 0;
let incomePerSecond = 0;
const keys = {};

// ---------------- Event Listeners ----------------
document.addEventListener('keydown', e => keys[e.key]=true);
document.addEventListener('keyup', e => keys[e.key]=false);

// ---------------- Buttons ----------------
const buttons = [
  {x:200, y:300, width:80, height:30, cost:0, type:'Small Lift', bought:false, income:1},
  {x:600, y:500, width:80, height:30, cost:100, type:'Ski Upgrade', bought:false, speedUpgrade:1.5},
  {x:900, y:250, width:80, height:30, cost:200, type:'Medium Lift', bought:false, income:3}
];

// ---------------- Lifts & Trees ----------------
const lifts = [
  {x:100, y:100, width:60, height:15, speed:1},
  {x:400, y:200, width:60, height:15, speed:1.2}
];

const trees = [
  {x:400, y:400, size:50},
  {x:750, y:350, size:60},
  {x:300, y:550, size:45}
];

// ---------------- Authentication ----------------
emailSignInBtn.addEventListener('click', async () => {
  const email = emailInput.value;
  const pass = passwordInput.value;
  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch(err) {
    if(err.code === 'auth/user-not-found'){
      try { await auth.createUserWithEmailAndPassword(email, pass); }
      catch(innerErr){ loginError.textContent = innerErr.message; return; }
    } else { loginError.textContent = err.message; return; }
  }
  loginSuccess(auth.currentUser);
});

googleSignInBtn.addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try { await auth.signInWithPopup(provider); loginSuccess(auth.currentUser); } 
  catch(err){ loginError.textContent = err.message; }
});

signOutBtn.addEventListener('click', async () => {
  await auth.signOut();
  loginScreen.style.display='block';
  gameScreen.style.display='none';
});

// ---------------- Login Success ----------------
async function loginSuccess(user){
  loginScreen.style.display='none';
  gameScreen.style.display='block';
  await loadGame(user.uid);
  update();
  setInterval(()=>saveGame(user.uid),5000);
}

// ---------------- Save / Load ----------------
async function saveGame(uid){
  const saveData = {
    money,
    incomePerSecond,
    playerX: player.x,
    playerY: player.y,
    playerSpeed: player.maxSpeed,
    buttons: buttons.map(btn=>btn.bought)
  };
  await db.collection('users').doc(uid).set(saveData);
}

async function loadGame(uid){
  const doc = await db.collection('users').doc(uid).get();
  if(doc.exists){
    const data = doc.data();
    money = data.money || 0;
    incomePerSecond = data.incomePerSecond || 0;
    player.x = data.playerX || canvas.width/2;
    player.y = data.playerY || canvas.height-150;
    player.maxSpeed = data.playerSpeed || 4;
    buttons.forEach((btn,i)=>btn.bought=data.buttons[i]||false);
  }
}

// ---------------- Game Functions ----------------
function isNear(p, btn){ return p.x+p.size>btn.x && p.x<btn.x+btn.width && p.y+p.size>btn.y && p.y<btn.y+btn.height; }

function update(){
  // Smooth movement
  if(keys['ArrowUp']) player.dy=Math.max(player.dy-0.2,-player.maxSpeed);
  else if(keys['ArrowDown']) player.dy=Math.min(player.dy+0.2,player.maxSpeed);
  else player.dy*=0.9;

  if(keys['ArrowLeft']) player.dx=Math.max(player.dx-0.2,-player.maxSpeed);
  else if(keys['ArrowRight']) player.dx=Math.min(player.dx+0.2,player.maxSpeed);
  else player.dx*=0.9;

  player.x+=player.dx;
  player.y+=player.dy;
  player.x=Math.max(0,Math.min(canvas.width-player.size,player.x));
  player.y=Math.max(0,Math.min(canvas.height-player.size,player.y));

  // Interact with buttons
  buttons.forEach(btn=>{
    if(!btn.bought && isNear(player,btn) && keys[' ']){
      if(money>=btn.cost || btn.cost===0){
        money-=btn.cost;
        btn.bought=true;
        if(btn.income) incomePerSecond+=btn.income;
        if(btn.speedUpgrade) player.maxSpeed*=btn.speedUpgrade;
      }
    }
  });

  draw();
  requestAnimationFrame(update);
}

// ---------------- Draw ----------------
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Background gradient for depth
  const grad = ctx.createLinearGradient(0,0,0,canvas.height);
  grad.addColorStop(0,'#ccefff'); // sky
  grad.addColorStop(1,'#e0f7fa'); // snow
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // Trees
  trees.forEach(tree=>{
    ctx.fillStyle='green';
    ctx.beginPath();
    ctx.moveTo(tree.x,tree.y);
    ctx.lineTo(tree.x-tree.size/2,tree.y+tree.size);
    ctx.lineTo(tree.x+tree.size/2,tree.y+tree.size);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle='#8B4513';
    ctx.fillRect(tree.x-5,tree.y+tree.size,10,15);
  });

  // Lifts
  lifts.forEach(lift=>{
    const gradLift = ctx.createLinearGradient(lift.x,lift.y,lift.x,lift.y+lift.height);
    gradLift.addColorStop(0,'#888');
    gradLift.addColorStop(1,'#555');
    ctx.fillStyle=gradLift;
    ctx.fillRect(lift.x,lift.y,lift.width,lift.height);
    lift.y += lift.speed;
    if(lift.y>canvas.height) lift.y=-lift.height;
  });

  // Buttons
  buttons.forEach(btn=>{
    const gradBtn = ctx.createLinearGradient(btn.x,btn.y,btn.x,btn.y+btn.height);
    gradBtn.addColorStop(0, btn.bought?'#00aa00':'#3399ff');
    gradBtn.addColorStop(1, btn.bought?'#007700':'#0066cc');
    ctx.fillStyle=gradBtn;
    ctx.fillRect(btn.x,btn.y,btn.width,btn.height);
    ctx.fillStyle='#fff';
    ctx.font='14px sans-serif';
    ctx.fillText(btn.cost===0?'FREE':`$${btn.cost}`,btn.x+5,btn.y+18);
  });

  // Player
  ctx.fillStyle='rgba(0,0,0,0.2)'; // shadow
  ctx.fillRect(player.x+2,player.y+player.size-5,player.size,5);
  ctx.fillStyle=player.color;
  ctx.fillRect(player.x,player.y,player.size,player.size);
}

// ---------------- Money Timer ----------------
setInterval(()=>{
  money+=incomePerSecond;
  moneyDisplay.innerText=`Money: $${money}`;
},1000);
