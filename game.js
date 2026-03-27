let scene, camera, renderer, player, money = 150, income = 0;
let activePad = null, gpsPath = null, npcs = [];
const loader = new THREE.GLTFLoader();
const keys = {};

const buildSteps = [
    { id: 1, x: 0, z: -15, cost: 0, label: "Lodge Floor", type: "floor", inc: 10 },
    { id: 2, x: 0, z: -15, cost: 250, label: "Lodge Walls", type: "walls", inc: 25, needs: 1 },
    { id: 3, x: 0, z: -15, cost: 1000, label: "Cherry Roof", type: "roof", inc: 60, needs: 2 },
    { id: 4, x: 45, z: -25, cost: 5000, label: "Cocoa Shop", type: "floor", inc: 200, needs: 3 },
    { id: 5, x: -55, z: -20, cost: 15000, label: "Hotel Base", type: "floor", inc: 1000, needs: 4 },
    { id: 6, x: -55, z: -20, cost: 40000, label: "Hotel Floor 1", type: "walls", inc: 2500, needs: 5 },
    { id: 7, x: -55, z: -20, cost: 100000, label: "Hotel Floor 2", type: "walls", inc: 5000, needs: 6 },
    { id: 8, x: -55, z: -20, cost: 250000, label: "VIP Balcony", type: "balcony", inc: 12000, needs: 7 },
    { id: 9, x: -55, z: -20, cost: 500000, label: "Neon Hotel Sign", type: "neon", inc: 25000, needs: 8 },
    { id: 10, x: -55, z: -20, cost: 1000000, label: "Grand Penthouse", type: "roof", inc: 60000, needs: 9 },
    { id: 11, x: 0, z: -180, cost: 5000000, label: "Summit Observatory", type: "floor", inc: 250000, needs: 10 }
];

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x81ecec); 

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 2000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('gameScreen').appendChild(renderer.domElement);

    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(50, 100, 50);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshPhongMaterial({ color: 0xdaeaf6 }));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    createMountains();
    createForest();
    createPlayer();
    createNPCs();

    // GPS Path
    gpsPath = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0x55efc4, transparent: true, opacity: 0.6 }));
    gpsPath.rotation.x = -Math.PI / 2;
    gpsPath.position.y = 0.2;
    scene.add(gpsPath);

    refreshPads();
    update();
}

function createMountains() {
    for(let i=0; i < 15; i++) {
        const h = 200 + Math.random() * 300;
        const m = new THREE.Mesh(new THREE.ConeGeometry(100, h, 4), new THREE.MeshPhongMaterial({color: 0xffffff}));
        const angle = (i / 15) * Math.PI * 2;
        m.position.set(Math.cos(angle)*800, h/2 - 20, Math.sin(angle)*800);
        m.rotation.y = Math.random() * Math.PI;
        scene.add(m);
    }
}

function createForest() {
    for (let i = 0; i < 100; i++) {
        const x = Math.random()*800-400, z = Math.random()*800-400;
        if (Math.abs(x) < 60 && Math.abs(z) < 60) continue; 
        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 3), new THREE.MeshPhongMaterial({color: 0x4e342e}));
        const leaves = new THREE.Mesh(new THREE.ConeGeometry(3, 8, 6), new THREE.MeshPhongMaterial({color: 0xffffff}));
        leaves.position.y = 4;
        tree.add(trunk, leaves);
        tree.position.set(x, 0, z);
        scene.add(tree);
    }
}

function createPlayer() {
    player = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 0.8), new THREE.MeshPhongMaterial({color: 0xff7675}));
    body.position.y = 1.3;
    const ski = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 4), new THREE.MeshPhongMaterial({color: 0x222}));
    const sL = ski.clone(); sL.position.set(-0.5, 0.1, 0);
    const sR = ski.clone(); sR.position.set(0.5, 0.1, 0);
    player.add(body, sL, sR);
    scene.add(player);
}

function createNPCs() {
    for (let i = 0; i < 20; i++) {
        const npc = new THREE.Group();
        const b = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.8), new THREE.MeshPhongMaterial({color: Math.random()*0xffffff}));
        b.position.y = 1.1; npc.add(b);
        npc.position.set(Math.random()*150-75, 0, Math.random()*150-75);
        npc.userData = { tx: npc.position.x, tz: npc.position.z };
        scene.add(npc); npcs.push(npc);
    }
}

function spawnObject(s) {
    let group = new THREE.Group();
    let mesh;
    const existingAtPos = scene.children.filter(c => c.userData.isBuilding && c.position.x === s.x && c.position.z === s.z);
    let hOffset = existingAtPos.length * 8;

    if (s.type === "floor") mesh = new THREE.Mesh(new THREE.BoxGeometry(20, 0.6, 20), new THREE.MeshPhongMaterial({color: 0x95a5a6}));
    else if (s.type === "walls") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(18, 8, 18), new THREE.MeshPhongMaterial({color: 0x5d4037}));
        mesh.position.y = 4 + (hOffset > 0 ? hOffset - 0.6 : 0);
    } else if (s.type === "balcony") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(26, 1, 26), new THREE.MeshPhongMaterial({color: 0x2f3640}));
        mesh.position.y = hOffset - 0.6;
    } else if (s.type === "neon") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 1), new THREE.MeshLambertMaterial({color: 0x00d2d3, emissive: 0x00d2d3}));
        mesh.position.set(0, hOffset - 3, 9.5);
    } else if (s.type === "roof") {
        mesh = new THREE.Mesh(new THREE.ConeGeometry(20, 12, 4), new THREE.MeshPhongMaterial({color: 0xae2012}));
        mesh.position.y = hOffset + 2;
        mesh.rotation.y = Math.PI/4;
    }

    if(mesh) {
        group.add(mesh);
        group.position.set(s.x, 0, s.z);
        group.userData.isBuilding = true;
        group.scale.set(0.1, 0.1, 0.1); 
        scene.add(group);
        s.objRef = group;
    }
}

function refreshPads() {
    scene.children.filter(c => c.isPad).forEach(p => scene.remove(p));
    const next = buildSteps.find(s => !s.bought && (!s.needs || buildSteps.find(x => x.id === s.needs).bought));
    if (next) {
        activePad = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 0.5, 32), new THREE.MeshPhongMaterial({ color: 0xff0000, emissive: 0x440000 }));
        activePad.position.set(next.x, 0.1, next.z); activePad.isPad = true; activePad.stepData = next;
        scene.add(activePad);
        document.getElementById('zoneDisplay').innerText = `NEXT: ${next.label} ($${next.cost})`;
    } else { activePad = null; document.getElementById('zoneDisplay').innerText = "RESORT COMPLETE!"; }
}

function update() {
    requestAnimationFrame(update);
    const spd = 0.42;
    if (keys['w']) player.position.z -= spd; if (keys['s']) player.position.z += spd;
    if (keys['a']) player.position.x -= spd; if (keys['d']) player.position.x += spd;
    
    camera.position.set(player.position.x, player.position.y + 30, player.position.z + 30);
    camera.lookAt(player.position);

    buildSteps.forEach(s => { if(s.bought && s.objRef && s.objRef.scale.x < 1) s.objRef.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1); });

    npcs.forEach(n => {
        if (Math.abs(n.position.x - n.userData.tx) < 1) {
            n.userData.tx = n.position.x + (Math.random()*120-60);
            n.userData.tz = n.position.z + (Math.random()*120-60);
        }
        n.position.x += (n.userData.tx - n.position.x) * 0.007;
        n.position.z += (n.userData.tz - n.position.z) * 0.007;
        n.lookAt(n.userData.tx, 0, n.userData.tz);
    });

    if (activePad) {
        let dx = activePad.position.x - player.position.x, dz = activePad.position.z - player.position.z;
        let d = Math.sqrt(dx*dx + dz*dz);
        gpsPath.scale.set(4, d, 1);
        gpsPath.position.set(player.position.x + dx/2, 0.2, player.position.z + dz/2);
        gpsPath.rotation.z = Math.atan2(dz, dx) + Math.PI/2;
        gpsPath.visible = true;
        activePad.rotation.y += 0.03;
        if (d < 4.5 && money >= activePad.stepData.cost) {
            money -= activePad.stepData.cost; activePad.stepData.bought = true; income += activePad.stepData.inc;
            spawnObject(activePad.stepData);
            refreshPads();
        }
    } else gpsPath.visible = false;

    renderer.render(scene, camera);
    document.getElementById('moneyDisplay').innerText = Math.floor(money);
    document.getElementById('incomeDisplay').innerText = income;
}

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
document.getElementById('guestPlay').onclick = () => { document.getElementById('loginScreen').style.display='none'; document.getElementById('gameScreen').style.display='block'; init(); };
setInterval(() => { money += (income/10); }, 100);
