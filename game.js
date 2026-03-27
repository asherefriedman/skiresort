let scene, camera, renderer, player, money = 100, income = 0;
let activePad = null, gpsPath = null;
let npcs = [];
const keys = {};

const buildSteps = [
    { id: 1, x: 0, z: -10, cost: 0, label: "Lodge Floor", type: "floor", bought: false, unlocked: true, inc: 5, needs: 0 },
    { id: 2, x: 0, z: -10, cost: 50, label: "Lodge Walls", type: "walls", bought: false, unlocked: false, inc: 10, needs: 1 },
    { id: 3, x: 0, z: -10, cost: 200, label: "Lodge Roof", type: "roof", bought: false, unlocked: false, inc: 15, needs: 2 },
    { id: 4, x: 25, z: -5, cost: 500, label: "Cocoa Floor", type: "floor", bought: false, unlocked: false, inc: 30, needs: 3 },
    { id: 5, x: 25, z: -5, cost: 800, label: "Cocoa Walls", type: "walls", bought: false, unlocked: false, inc: 40, needs: 4 },
    { id: 6, x: 25, z: -5, cost: 1200, label: "Cocoa Roof", type: "roof", bought: false, unlocked: false, inc: 60, needs: 5 }
];

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x81ecec); // VIBRANT SKY BLUE

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('gameScreen').appendChild(renderer.domElement);

    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(10, 20, 10);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // FROSTY BLUE GROUND
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0xe3f2fd }));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    player = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 1.2), new THREE.MeshPhongMaterial({ color: 0xff7675 }));
    player.position.y = 1;
    scene.add(player);

    // THICK GPS PATH (A mesh ribbon)
    const pathGeo = new THREE.PlaneGeometry(1, 1);
    const pathMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
    gpsPath = new THREE.Mesh(pathGeo, pathMat);
    gpsPath.rotation.x = -Math.PI / 2;
    gpsPath.position.y = 0.05;
    scene.add(gpsPath);

    createNPCs();
    refreshPads();
    update();
}

function createNPCs() {
    for (let i = 0; i < 8; i++) {
        const npc = new THREE.Mesh(new THREE.BoxGeometry(1, 1.8, 1), new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff }));
        npc.position.set(Math.random() * 40 - 20, 0.9, Math.random() * 40 - 20);
        npc.userData = { targetX: npc.position.x, targetZ: npc.position.z };
        scene.add(npc);
        npcs.push(npc);
    }
}

function spawnObject(step) {
    let geo, mat, mesh;
    if (step.type === "floor") { geo = new THREE.BoxGeometry(12, 0.5, 12); mat = new THREE.MeshPhongMaterial({ color: 0x95a5a6 }); }
    else if (step.type === "walls") { geo = new THREE.BoxGeometry(11, 7, 11); mat = new THREE.MeshPhongMaterial({ color: 0x5d4037 }); }
    else if (step.type === "roof") { geo = new THREE.ConeGeometry(9, 6, 4); mat = new THREE.MeshPhongMaterial({ color: 0xffffff }); }
    
    mesh = new THREE.Mesh(geo, mat);
    let y = (step.type === "floor" ? 0.25 : step.type === "walls" ? 3.5 : 9.5);
    mesh.position.set(step.x, y, step.z);
    if (step.type === "roof") mesh.rotation.y = Math.PI / 4;
    scene.add(mesh);
}

function refreshPads() {
    scene.children.filter(c => c.isPad).forEach(p => scene.remove(p));
    const next = buildSteps.find(s => s.unlocked && !s.bought);
    if (next) {
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.3, 32), new THREE.MeshPhongMaterial({ color: 0xff0000 }));
        pad.position.set(next.x, 0.1, next.z);
        pad.isPad = true; pad.stepData = next;
        scene.add(pad);
        activePad = pad;
        document.getElementById('zoneDisplay').innerText = `Next: ${next.label} ($${next.cost})`;
    } else { activePad = null; document.getElementById('zoneDisplay').innerText = "Resort Complete!"; }
}

function update() {
    requestAnimationFrame(update);
    const speed = 0.25;
    if (keys['w']) player.position.z -= speed; if (keys['s']) player.position.z += speed;
    if (keys['a']) player.position.x -= speed; if (keys['d']) player.position.x += speed;

    camera.position.set(player.position.x, player.position.y + 20, player.position.z + 20);
    camera.lookAt(player.position);

    // NPC WANDERING LOGIC
    npcs.forEach(npc => {
        if (Math.abs(npc.position.x - npc.userData.targetX) < 0.2) {
            npc.userData.targetX = npc.position.x + (Math.random() * 20 - 10);
            npc.userData.targetZ = npc.position.z + (Math.random() * 20 - 10);
        }
        npc.position.x += (npc.userData.targetX - npc.position.x) * 0.01;
        npc.position.z += (npc.userData.targetZ - npc.position.z) * 0.01;
    });

    // THICK GPS PATH LOGIC
    if (activePad) {
        let dx = activePad.position.x - player.position.x;
        let dz = activePad.position.z - player.position.z;
        let dist = Math.sqrt(dx * dx + dz * dz);
        gpsPath.scale.set(2, dist, 1); // 2 units wide
        gpsPath.position.set(player.position.x + dx/2, 0.06, player.position.z + dz/2);
        gpsPath.rotation.z = Math.atan2(dz, dx) + Math.PI/2;
        gpsPath.visible = true;

        if (dist < 3 && money >= activePad.stepData.cost) {
            money -= activePad.stepData.cost; activePad.stepData.bought = true; income += activePad.stepData.inc;
            spawnObject(activePad.stepData);
            let n = buildSteps.find(item => item.needs === activePad.stepData.id);
            if (n) n.unlocked = true;
            refreshPads();
        }
    } else { gpsPath.visible = false; }

    renderer.render(scene, camera);
    document.getElementById('moneyDisplay').innerText = Math.floor(money);
    document.getElementById('incomeDisplay').innerText = income;
}

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
document.getElementById('guestPlay').onclick = () => { 
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    init();
};
setInterval(() => { money += income; }, 1000);

// Emergency check to show play button
const check = setInterval(() => { if (typeof THREE !== 'undefined') { document.getElementById('engineStatus').innerText = "Engine Ready!"; document.getElementById('guestPlay').style.display = "inline-block"; clearInterval(check); } }, 500);
