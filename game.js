// Global Variables
let scene, camera, renderer, player, money = 100, income = 0;
const keys = {};

// Building Data - Ensure X and Z are always present
const buildSteps = [
    { id: 1, x: 0, z: -5, cost: 0, label: "Lodge Floor", type: "floor", bought: false, unlocked: true, inc: 5, needs: 0 },
    { id: 2, x: 0, z: -5, cost: 50, label: "Lodge Walls", type: "walls", bought: false, unlocked: false, inc: 10, needs: 1 },
    { id: 3, x: 0, z: -5, cost: 250, label: "Lodge Roof", type: "roof", bought: false, unlocked: false, inc: 20, needs: 2 },
    { id: 4, x: 15, z: -15, cost: 1000, label: "Cocoa Shop", type: "floor", bought: false, unlocked: false, inc: 100, needs: 3 }
];

// Wait for the window to fully load before attaching the button
window.onload = () => {
    const playBtn = document.getElementById('guestPlay');
    
    if (playBtn) {
        playBtn.onclick = () => {
            console.log("Starting 3D Engine...");
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('gameScreen').style.display = 'block';
            
            // Check if Three.js loaded
            if (typeof THREE !== 'undefined') {
                init();
            } else {
                alert("Three.js library failed to load. Check your internet connection!");
            }
        };
    }
};

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x81ecec);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Append to the gameScreen div
    document.getElementById('gameScreen').appendChild(renderer.domElement);

    // Lights
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(10, 20, 10);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // Snow Ground
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(2000, 2000),
        new THREE.MeshPhongMaterial({ color: 0xffffff })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Player (Red Cube)
    player = new THREE.Mesh(
        new THREE.BoxGeometry(1, 2, 1),
        new THREE.MeshPhongMaterial({ color: 0xff7675 })
    );
    player.position.y = 1;
    scene.add(player);

    // Controls
    window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

    update();
}

function spawnObject(step) {
    let geo, mat, mesh;
    
    if (step.type === "floor") {
        geo = new THREE.BoxGeometry(8, 0.5, 8);
        mat = new THREE.MeshPhongMaterial({ color: 0x95a5a6 });
        mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(step.x, 0.25, step.z);
    } else if (step.type === "walls") {
        geo = new THREE.BoxGeometry(7.5, 5, 7.5);
        mat = new THREE.MeshPhongMaterial({ color: 0x5d4037 });
        mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(step.x, 2.75, step.z);
    } else if (step.type === "roof") {
        geo = new THREE.ConeGeometry(6, 4, 4);
        mat = new THREE.MeshPhongMaterial({ color: 0xfafafa });
        mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(step.x, 7, step.z);
        mesh.rotation.y = Math.PI / 4;
    }

    scene.add(mesh);
}

function update() {
    requestAnimationFrame(update);

    // Movement
    const speed = 0.2;
    if (keys['w']) player.position.z -= speed;
    if (keys['s']) player.position.z += speed;
    if (keys['a']) player.position.x -= speed;
    if (keys['d']) player.position.x += speed;

    // Camera follow logic
    camera.position.set(player.position.x, player.position.y + 15, player.position.z + 15);
    camera.lookAt(player.position);

    // Tycoon Logic
    buildSteps.forEach(s => {
        if (s.unlocked && !s.bought) {
            // Check if player is near the X, Z coordinate
            let dist = player.position.distanceTo(new THREE.Vector3(s.x, 1, s.z));
            if (dist < 3 && money >= s.cost) {
                money -= s.cost;
                s.bought = true;
                income += s.inc;
                spawnObject(s);
                
                // Unlock the item that needs this one
                let next = buildSteps.find(n => n.needs === s.id);
                if (next) next.unlocked = true;
            }
        }
    });

    renderer.render(scene, camera);
    document.getElementById('moneyDisplay').innerText = Math.floor(money);
    document.getElementById('incomeDisplay').innerText = income;
}

// Money ticker
setInterval(() => { money += income; }, 1000);
