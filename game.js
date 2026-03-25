let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
let renderer = new THREE.WebGLRenderer();


renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


// Camera position
camera.position.set(0, 5, 10);


// Light
let light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);


// Snow ground
let groundGeo = new THREE.PlaneGeometry(50, 50);
let groundMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
let ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);


// Money system
let money = 0;
let income = 0;


// UI
const moneyDisplay = document.getElementById("money");
const buyButton = document.getElementById("buyLift");


// Ski lifts array
let lifts = [];


// Buy lift
buyButton.onclick = () => {
  if (money >= 100) {
    money -= 100;
    income += 1;


    let lift = new THREE.Mesh(
      new THREE.BoxGeometry(1, 5, 1),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );


    lift.position.set(Math.random() * 10 - 5, 2.5, Math.random() * 10 - 5);
    scene.add(lift);
    lifts.push(lift);
  }
};


// Passive income
setInterval(() => {
  money += income;
}, 1000);


// Basic camera movement
window.addEventListener("keydown", (e) => {
  if (e.key === "w") camera.position.z -= 0.5;
  if (e.key === "s") camera.position.z += 0.5;
  if (e.key === "a") camera.position.x -= 0.5;
  if (e.key === "d") camera.position.x += 0.5;
});


// Game loop
function animate() {
  requestAnimationFrame(animate);


  moneyDisplay.textContent = money;


  renderer.render(scene, camera);
}


animate();