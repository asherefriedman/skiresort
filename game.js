/* 3D SKI RESORT - RED BUTTONS & NAVIGATION */
let scene, camera, renderer, player, money = 100, income = 0;
let activePad = null, arrow = null;
const keys = {};

const buildSteps = [
    { id: 1, x: 0, z: -10, cost: 0, label: "Lodge Floor", type: "floor", bought: false, unlocked: true, inc: 5, needs: 0 },
    { id: 2, x: 0, z: -10, cost: 50, label: "Lodge Walls", type: "walls", bought: false, unlocked: false, inc: 10, needs: 1 },
    { id: 3, x: 0, z: -10, cost: 250, label: "Lodge Roof", type: "roof", bought: false, unlocked: false, inc: 20, needs: 2 },
    { id: 4, x: 20, z: -20, cost: 1000, label: "Cocoa Shop", type: "floor", bought: false, unlocked: false, inc: 100, needs: 3 }
];

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x81ecec); // Sky Blue
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('gameScreen').appendChild(renderer.domElement);

    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(10, 20, 10);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    // ICY BLUE GROUND (So white roofs show up!)
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(2000, 2000),
        new THREE.MeshPhongMaterial({ color: 0xe1f5fe }) 
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // PLAYER
    player = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 1.2), new THREE.MeshPhongMaterial({ color: 0xff7675 }));
    player.position.y = 1;
    scene.add(player);

    // FLOATING ARROW
    const arrowGeo = new THREE.ConeGeometry(0.5, 1, 4);
    const arrowMat = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
    arrow = new THREE.Mesh(arrowGeo, arrowMat);
    arrow.rotation.x = Math.PI; // Point down
    scene.add(arrow);

    refreshPads();
    update();
}

function refreshPads() {
    // Remove old pads
    const oldPads = scene.children.filter(child => child.isPad);
    oldPads.forEach(p => scene.remove(p));

    // Find the next thing to buy
    const nextStep = buildSteps.find(s => s.unlocked && !s.bought);
    if (nextStep) {
        // Create 3D Red Button (Cylinder)
        const padGeo = new THREE.CylinderGeometry(2, 2, 0.2, 32);
        const padMat = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        activePad = new THREE.Mesh(padGeo, padMat);
        activePad.position.set(nextStep.x, 0.1, nextStep.z);
        activePad.isPad = true;
        activePad.stepData = nextStep;
        scene.add(activePad);
        
        arrow.visible = true;
        arrow.position.set(nextStep.x, 5, nextStep.z);
    } else {
        arrow.visible = false;
    }
}

function spawnObject(step) {
    let geo, mat, mesh;
    if (step.type === "floor") {
        geo = new THREE.BoxGeometry(10, 0.5, 10);
        mat = new THREE.MeshPhongMaterial({ color: 0x95a5a6 });
    } else if (step.type === "walls") {
        geo = new THREE.BoxGeometry(9.5, 6, 9.5);
        mat = new THREE.MeshPhongMaterial({ color: 0x5d4037 });
    } else if (step.type === "roof") {
        geo = new THREE.ConeGeometry(8, 5, 4);
        mat = new THREE.MeshPhongMaterial({ color: 0xffffff }); // Bright White
    }
    mesh = new THREE.Mesh(geo, mat);
    let yPos = (step.type === "floor" ? 0.25 : step.type === "walls" ? 3 : 8.5);
    mesh.position.set(step.x, yPos, step.z);
    if (step.type === "roof") mesh.rotation.y = Math.PI / 4;
    scene.add(mesh);
}

function update() {
    requestAnimationFrame(update);
    const speed = 0.25;
    if (keys['w']) player.position.z -= speed;
    if (keys['s']) player.position.z += speed;
    if (keys['a']) player.position.x -= speed;
    if (keys['d']) player.position.x += speed;

    camera.position.set(player.position.x, player.position.y + 18, player.position.z + 18);
    camera.lookAt(player.position);

    // Bounce the arrow
    if (arrow.visible) {
        arrow.position.y = 4 + Math.sin(Date.now() * 0.005) * 0.5;
        arrow.rotation.y += 0.02;
    }

    // Check collision with the Red Pad
    if (activePad) {
        let dist = player.position.distanceTo(new THREE.Vector3(activePad.position.x, 1, activePad.position.z));
        let step = activePad.stepData;
        if (dist < 2.5 && money >= step.cost) {
            money -= step.cost;
            step.bought = true;
            income += step.inc;
            spawnObject(step);
            
            // Unlock next
            let next = buildSteps.find(n => n.needs === step.id);
            if (next) next.unlocked = true;
            
            refreshPads();
        }
    }

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
