let scene, camera, renderer, player, money = 150, income = 0;
let activePad = null, gpsPath = null, npcs = [];
const keys = {};

const buildSteps = [
    /* LODGE SECTION */
    { id: 1, x: 0, z: -10, cost: 0, label: "Lodge Foundation", type: "floor", bought: false, unlocked: true, inc: 5, needs: 0 },
    { id: 2, x: 0, z: -10, cost: 100, label: "Lodge Walls", type: "walls", bought: false, unlocked: false, inc: 10, needs: 1 },
    { id: 3, x: 0, z: -10, cost: 500, label: "Lodge Snow-Roof", type: "roof", bought: false, unlocked: false, inc: 20, needs: 2 },
    
    /* CAFE SECTION */
    { id: 4, x: 30, z: -10, cost: 1000, label: "Cafe Floor", type: "floor", bought: false, unlocked: false, inc: 50, needs: 3 },
    { id: 5, x: 30, z: -10, cost: 1500, label: "Cafe Walls", type: "walls", bought: false, unlocked: false, inc: 75, needs: 4 },
    { id: 6, x: 30, z: -10, cost: 2500, label: "Cafe Roof", type: "roof", bought: false, unlocked: false, inc: 100, needs: 5 },

    /* RENTAL SHOP */
    { id: 7, x: -30, z: -10, cost: 5000, label: "Rental Shop Floor", type: "floor", bought: false, unlocked: false, inc: 150, needs: 6 },
    { id: 8, x: -30, z: -10, cost: 7500, label: "Rental Shop Walls", type: "walls", bought: false, unlocked: false, inc: 200, needs: 7 },
    { id: 9, x: -30, z: -10, cost: 10000, label: "Rental Shop Roof", type: "roof", bought: false, unlocked: false, inc: 300, needs: 8 },

    /* SKI LIFT SYSTEM */
    { id: 10, x: 0, z: -50, cost: 15000, label: "Lift Station Base", type: "floor", bought: false, unlocked: false, inc: 500, needs: 9 },
    { id: 11, x: 0, z: -50, cost: 20000, label: "Lift Tower 1", type: "pole", bought: false, unlocked: false, inc: 600, needs: 10 },
    { id: 12, x: 0, z: -100, cost: 30000, label: "Lift Tower 2", type: "pole", bought: false, unlocked: false, inc: 700, needs: 11 },
    { id: 13, x: 0, z: -150, cost: 45000, label: "Lift Tower 3", type: "pole", bought: false, unlocked: false, inc: 800, needs: 12 },
    { id: 14, x: 0, z: -100, cost: 60000, label: "Main Cable", type: "cable", bought: false, unlocked: false, inc: 1500, needs: 13 },

    /* LUXURY CABINS */
    { id: 15, x: 50, z: -50, cost: 80000, label: "Cabin 1 Floor", type: "floor", bought: false, unlocked: false, inc: 2000, needs: 14 },
    { id: 16, x: 50, z: -50, cost: 100000, label: "Cabin 1 Walls", type: "walls", bought: false, unlocked: false, inc: 2500, needs: 15 },
    { id: 17, x: 50, z: -50, cost: 125000, label: "Cabin 1 Roof", type: "roof", bought: false, unlocked: false, inc: 3000, needs: 16 }
];

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x81ecec); // VIBRANT SKY BLUE

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('gameScreen').appendChild(renderer.domElement);

    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(50, 100, 50);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    /* FROSTY BLUE GROUND - PREVENTS WHITE-OUT */
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), new THREE.MeshPhongMaterial({ color: 0xd6eaf8 }));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    player = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 1.5), new THREE.MeshPhongMaterial({ color: 0xff7675 }));
    player.position.y = 1.25;
    scene.add(player);

    const pathGeo = new THREE.PlaneGeometry(1, 1);
    const pathMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.6 });
    gpsPath = new THREE.Mesh(pathGeo, pathMat);
    gpsPath.rotation.x = -Math.PI / 2;
    gpsPath.position.y = 0.1;
    scene.add(gpsPath);

    createNPCs();
    refreshPads();
    update();
}

function createNPCs() {
    for (let i = 0; i < 15; i++) {
        const npc = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff }));
        npc.position.set(Math.random() * 100 - 50, 1, Math.random() * 100 - 50);
        npc.userData = { tx: npc.position.x, tz: npc.position.z };
        scene.add(npc);
        npcs.push(npc);
    }
}

function spawnObject(s) {
    let geo, mat, mesh;
    if (s.type === "floor") { geo = new THREE.BoxGeometry(15, 0.5, 15); mat = new THREE.MeshPhongMaterial({ color: 0x95a5a6 }); }
    else if (s.type === "walls") { geo = new THREE.BoxGeometry(14, 8, 14); mat = new THREE.MeshPhongMaterial({ color: 0x5d4037 }); }
    else if (s.type === "roof") { geo = new THREE.ConeGeometry(12, 7, 4); mat = new THREE.MeshPhongMaterial({ color: 0xffffff }); }
    else if (s.type === "pole") { geo = new THREE.CylinderGeometry(1, 1.5, 25, 8); mat = new THREE.MeshPhongMaterial({ color: 0x636e72 }); }
    else if (s.type === "cable") { geo = new THREE.BoxGeometry(1, 0.3, 150); mat = new THREE.MeshPhongMaterial({ color: 0x2d3436 }); }
    
    mesh = new THREE.Mesh(geo, mat);
    let y = 0.25;
    if (s.type === "walls") y = 4;
    if (s.type === "roof") y = 11;
    if (s.type === "pole") y = 12.5;
    if (s.type === "cable") y = 24;
    
    mesh.position.set(s.x, y, s.z);
    if (s.type === "roof") mesh.rotation.y = Math.PI / 4;
    scene.add(mesh);
}

function refreshPads() {
    scene.children.filter(c => c.isPad).forEach(p => scene.remove(p));
    const n = buildSteps.find(s => s.unlocked && !s.bought);
    if (n) {
        const p = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 0.4, 32), new THREE.MeshPhongMaterial({ color: 0xff0000 }));
        p.position.set(n.x, 0.2, n.z);
        p.isPad = true; p.stepData = n;
        scene.add(p);
        activePad = p;
        document.getElementById('zoneDisplay').innerText = `Next: ${n.label} ($${n.cost})`;
    } else { activePad = null; document.getElementById('zoneDisplay').innerText = "Resort Finished!"; }
}

function update() {
    requestAnimationFrame(update);
    const spd = 0.35;
    if (keys['w']) player.position.z -= spd; if (keys['s']) player.position.z += spd;
    if (keys['a']) player.position.x -= spd; if (keys['d']) player.position.x += spd;

    camera.position.set(player.position.x, player.position.y + 25, player.position.z + 25);
    camera.lookAt(player.position);

    npcs.forEach(n => {
        if (Math.abs(n.position.x - n.userData.tx) < 0.5) {
            n.userData.tx = n.position.x + (Math.random() * 40 - 20);
            n.userData.tz = n.position.z + (Math.random() * 40 - 20);
        }
        n.position.x += (n.userData.tx - n.position.x) * 0.01;
        n.position.z += (n.userData.tz - n.position.z) * 0.01;
    });

    if (activePad) {
        let dx = activePad.position.x - player.position.x;
        let dz = activePad.position.z - player.position.z;
        let d = Math.sqrt(dx * dx + dz * dz);
        gpsPath.scale.set(3, d, 1); // THICKER PATH
        gpsPath.position.set(player.position.x + dx/2, 0.15, player.position.z + dz/2);
        gpsPath.rotation.z = Math.atan2(dz, dx) + Math.PI/2;
        gpsPath.visible = true;

        if (d < 3.5 && money >= activePad.stepData.cost) {
            money -= activePad.stepData.cost; activePad.stepData.bought = true; income += activePad.stepData.inc;
            spawnObject(activePad.stepData);
            let next = buildSteps.find(item => item.needs === activePad.stepData.id);
            if (next) next.unlocked = true;
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
setInterval(() => { money += (income/10); }, 100);

const check = setInterval(() => { if (typeof THREE !== 'undefined') { document.getElementById('engineStatus').innerText = "Engine Ready!"; document.getElementById('guestPlay').style.display = "inline-block"; clearInterval(check); } }, 500);
