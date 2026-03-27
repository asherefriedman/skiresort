/* 3D SKI RESORT ENGINE */
let scene, camera, renderer, player, money = 100, income = 0;
const keys = {};

const buildSteps = [
    { id: 1, x: 0, z: -5, cost: 0, label: "Lodge Floor", type: "floor", bought: false, unlocked: true, inc: 5, needs: 0 },
    { id: 2, x: 0, z: -5, cost: 50, label: "Lodge Walls", type: "walls", bought: false, unlocked: false, inc: 10, needs: 1 },
    { id: 3, x: 0, z: -5, cost: 250, label: "Lodge Roof", type: "roof", bought: false, unlocked: false, inc: 20, needs: 2 },
    { id: 4, x: 15, z: -15, cost: 1000, label: "Cocoa Shop", type: "floor", bought: false, unlocked: false, inc: 100, needs: 3 }
];

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x81ecec);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('gameScreen').appendChild(renderer.domElement);
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(10, 20, 10);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0xffffff }));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    player = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshPhongMaterial({ color: 0xff7675 }));
    player.position.y = 1;
    scene.add(player);
    update();
}

function spawnObject(step) {
    let geo, mat, mesh;
    if (step.type === "floor") {
        geo = new THREE.BoxGeometry(8, 0.5, 8);
        mat = new THREE.MeshPhongMaterial({ color: 0x95a5a6 });
    } else if (step.type === "walls") {
        geo = new THREE.BoxGeometry(7.5, 5, 7.5);
        mat = new THREE.MeshPhongMaterial({ color: 0x5d4037 });
    } else if (step.type === "roof") {
        geo = new THREE.ConeGeometry(6, 4, 4);
        mat = new THREE.MeshPhongMaterial({ color: 0xfafafa });
    }
    mesh = new THREE.Mesh(geo, mat);
    let yPos = 0.25;
    if (step.type === "walls") yPos = 2.75;
    if (step.type === "roof") yPos = 7;
    mesh.position.set(step.x, yPos, step.z);
    if (step.type === "roof") mesh.rotation.y = Math.PI / 4;
    scene.add(mesh);
}

function update() {
    requestAnimationFrame(update);
    const speed = 0.2;
    if (keys['w']) player.position.z -= speed;
    if (keys['s']) player.position.z += speed;
    if (keys['a']) player.position.x -= speed;
    if (keys['d']) player.position.x += speed;
    camera.position.set(player.position.x, player.position.y + 15, player.position.z + 15);
    camera.lookAt(player.position);
    buildSteps.forEach(s => {
        if (s.unlocked && !s.bought) {
            let dist = player.position.distanceTo(new THREE.Vector3(s.x, 1, s.z));
            if (dist < 3 && money >= s.cost) {
                money -= s.cost;
                s.bought = true;
                income += s.inc;
                spawnObject(s);
                let next = buildSteps.find(n => n.needs === s.id);
                if (next) next.unlocked = true;
            }
        }
    });
    renderer.render(scene, camera);
    document.getElementById('moneyDisplay').innerText = Math.floor(money);
    document.getElementById('incomeDisplay').innerText = income;
}

window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

document.getElementById('guestPlay').onclick = function() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    init();
};

setInterval(() => { money += income; }, 1000);
