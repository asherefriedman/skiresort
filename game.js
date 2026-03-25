// ------------------
// THREE.JS SETUP
// ------------------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ------------------
// LIGHT
// ------------------
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5,10,5);
scene.add(light);

// ------------------
// GROUND (snow)
// ------------------
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ------------------
// CAMERA + CONTROLS
// ------------------
camera.position.set(0, 2, 10);

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

const speed = 0.15;

// Track keys
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") moveForward = true;
  if (e.key === "ArrowDown") moveBackward = true;
  if (e.key === "ArrowLeft") moveLeft = true;
  if (e.key === "ArrowRight") moveRight = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp") moveForward = false;
  if (e.key === "ArrowDown") moveBackward = false;
  if (e.key === "ArrowLeft") moveLeft = false;
  if (e.key === "ArrowRight") moveRight = false;
});

// ------------------
// MOUSE LOOK
// ------------------
let yaw = 0;
let pitch = 0;

document.addEventListener("mousemove", (e) => {
  if (document.pointerLockElement === document.body) {
    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;

    pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));

    camera.rotation.set(pitch, yaw, 0);
  }
});

// Click to lock mouse
document.body.addEventListener("click", () => {
  document.body.requestPointerLock();
});

// ------------------
// GAME DATA
// ------------------
let money = 0;
let liftCost = 100;

// Load save
if (localStorage.getItem("money")) {
  money = parseInt(localStorage.getItem("money"));
}

// ------------------
// UPDATE UI
// ------------------
function updateUI() {
  document.getElementById("money").textContent = money;
}

// ------------------
// SAVE
// ------------------
function saveGame() {
  localStorage.setItem("money", money);
}

// ------------------
// BUTTONS
// ------------------
document.getElementById("earn").onclick = () => {
  money += 10;
  updateUI();
  saveGame();
};

document.getElementById("buildLift").onclick = () => {
  if (money >= liftCost) {
    money -= liftCost;
    createLift();
    updateUI();
    saveGame();
  } else {
    alert("Not enough money!");
  }
};

// ------------------
// CREATE LIFT (3D object)
// ------------------
function createLift() {
  const lift = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 5, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x444444 })
  );

  lift.position.set(
    (Math.random() - 0.5) * 20,
    2.5,
    (Math.random() - 0.5) * 20
  );

  scene.add(lift);
}

// ------------------
// LOOP
// ------------------
function animate() {
  requestAnimationFrame(animate);

  scene.rotation.y += 0.001; // slow rotate for cool effect

  renderer.render(scene, camera);
}

animate();
updateUI();
