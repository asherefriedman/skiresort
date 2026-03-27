// --- CORE VARIABLES ---
let scene, camera, renderer, player, wallet = 200, income = 0;
let activePad = null, gps, isJumping = false, yVel = 0;
let moveSpeed = 0;
const keys = {}, buildings = [];

// --- 1. THE MASSIVE BUILD LIST (25+ STEPS) ---
const buildSteps = [
    { id: 1, x: 0, z: 0, cost: 0, label: "Lobby Foundation", type: "floor", mat: 0x95a5a6, inc: 5, w: 40, d: 40 },
    { id: 2, x: 12, z: 8, cost: 100, label: "Reception Desk", type: "furniture", mat: 0x34495e, inc: 8, w: 10, d: 3, needs: 1 },
    { id: 3, x: 14, z: 10, cost: 150, label: "Reception Computer", type: "furniture", mat: 0x2d3436, inc: 10, w: 2, d: 2, needs: 2 },
    { id: 4, x: 10, z: 10, cost: 150, label: "Guest Registry", type: "furniture", mat: 0xffffff, inc: 10, w: 1.5, d: 1.5, needs: 3 },
    { id: 5, x: 0, z: 25, cost: 200, label: "Entry Palm Tree L", type: "palm", mat: 0x2ecc71, inc: 2, w: 2, d: 2, needs: 4 },
    { id: 6, x: 10, z: 25, cost: 200, label: "Entry Palm Tree R", type: "palm", mat: 0x2ecc71, inc: 2, w: 2, d: 2, needs: 5 },
    { id: 7, x: -10, z: -10, cost: 300, label: "Lobby Sofa 1", type: "furniture", mat: 0xc0392b, inc: 12, w: 6, d: 3, needs: 6 },
    { id: 8, x: -10, z: -4, cost: 300, label: "Lobby Sofa 2", type: "furniture", mat: 0xc0392b, inc: 12, w: 6, d: 3, needs: 7 },
    { id: 9, x: 0, z: 19, cost: 800, label: "Glass Front Wall", type: "walls", mat: 0x81ecec, inc: 20, w: 40, d: 1, needs: 8 },
    { id: 10, x: 0, z: -40, cost: 2500, label: "Suite 101 Floor", type: "floor", mat: 0xecf0f1, inc: 50, w: 30, d: 30, needs: 9 },
    { id: 11, x: 0, z: -45, cost: 1200, label: "King Bed Frame", type: "furniture", mat: 0x3e2723, inc: 40, w: 10, d: 12, needs: 10 },
    { id: 12, x: 0, z: -45, cost: 600, label: "Luxury Mattress", type: "furniture", mat: 0xffffff, inc: 30, w: 9, d: 11, needs: 11 },
    { id: 13, x: 0, z: -42, cost: 200, label: "Silk Pillows", type: "furniture", mat: 0xecf0f1, inc: 10, w: 7, d: 2, needs: 12 },
    { id: 14, x: -8, z: -48, cost: 400, label: "Suite Nightstand L", type: "furniture", mat: 0x5d4037, inc: 15, w: 3, d: 3, needs: 13 },
    { id: 15, x: 8, z: -48, cost: 400, label: "Suite Nightstand R", type: "furniture", mat: 0x5d4037, inc: 15, w: 3, d: 3, needs: 14 },
    { id: 16, x: 0, z: -30, cost: 1800, label: "Suite Smart TV", type: "furniture", mat: 0x1a1a1a, inc: 80, w: 8, d: 1, needs: 15 },
    { id: 17, x: 50, z: 0, cost: 8000, label: "Pool Deck Tiles", type: "floor", mat: 0xbdc3c7, inc: 200, w: 50, d: 60, needs: 16 },
    { id: 18, x: 50, z: 0, cost: 15000, label: "Heated Pool Water", type: "floor", mat: 0x00d2ff, inc: 500, w: 30, d: 40, needs: 17 },
    { id: 19, x: 38, z: 15, cost: 1000, label: "Pool Lounge Chair", type: "furniture", mat: 0xffffff, inc: 40, w: 3, d: 6, needs: 18 },
    { id: 20, x: 75, z: 25, cost: 1500, label: "Tropical Ferns", type: "nature", mat: 0x27ae60, inc: 20, w: 4, d: 4, needs: 19 },
    { id: 21, x: 75, z: 30, cost: 500, label: "Decorative Rocks", type: "rock", mat: 0x7f8c8d, inc: 10, w: 3, d: 3, needs: 20 },
    { id: 22, x: 70, z: -10, cost: 10000, label: "Outdoor Tiki Bar", type: "furniture", mat: 0xe67e22, inc: 400, w: 8, d: 8, needs: 21 },
    { id: 23, x: 70, z: -18, cost: 4000, label: "Tiki Palm Tree", type: "palm", mat: 0x2ecc71, inc: 100, w: 2, d: 2, needs: 22 },
    { id: 24, x: 100, z: 0, cost: 40000, label: "Bridge Support", type: "floor", mat: 0x7f8c8d, inc: 1000, w: 15, d: 15, needs: 23 },
    { id: 25, x: 140, z: 0, cost: 80000, label: "Bridge Cables", type: "walls", mat: 0x34495e, inc: 1500, w: 1, d: 80, needs: 24 },
    { id: 26, x: 140, z: 0, cost: 120000, label: "Bridge Roadway", type: "bridge", mat: 0x2d3436, inc: 2500, w: 80, d: 15, needs: 25 },
    { id: 27, x: 185, z: 12, cost: 20000, label: "Mountain Pine", type: "nature", mat: 0x013220, inc: 500, w: 3, d: 3, needs: 26 },
    { id: 28, x: 200, z: 0, cost: 200000, label: "Mountain Sign", type: "furniture", mat: 0xf1c40f, inc: 8000, w: 10, d: 2, needs: 27 }
];

// --- 2. INITIALIZATION ---
function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gui').style.display = 'block';
    init();
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0fbcf9);
    scene.fog = new THREE.Fog(0x81ecec, 10, 1200);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 5000);
    renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    let sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(50, 100, 50);
    scene.add(sun);

    // Island Base
    const island = new THREE.Mesh(new THREE.CylinderGeometry(600, 620, 3, 64), new THREE.MeshPhongMaterial({ color: 0x2ecc71 }));
    island.position.y = -1.5;
    scene.add(island);

    // Sea Base
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(20000, 20000), new THREE.MeshPhongMaterial({ color: 0x0984e3, transparent: true, opacity: 0.7 }));
    sea.rotation.x = -Math.PI/2;
    sea.position.y = -2.5;
    scene.add(sea);

    // Player Setup
    player = new THREE.Group();
    const pMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 2, 4, 8), new THREE.MeshStandardMaterial({ color: 0x341f97 }));
    pMesh.position.y = 1.75;
    player.add(pMesh);
    scene.add(player);
    player.position.set(0, 5, 40); 

    gps = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 1), new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.5 }));
    scene.add(gps);

    initSaveSystem();

    // Force build the first item if starting fresh
    if (!buildSteps.find(s => s.bought)) {
        let first = buildSteps[0];
        first.bought = true;
        spawnObject(first);
        income = first.inc;
    }

    refreshPads();
    animate();
}

// --- 3. PHYSICS & COLLISIONS ---
function checkCollision(nx, nz) {
    if (player.position.y > 2.8) return false; // Allowed to jump over stuff
    for (let b of buildings) {
        if (b.type === "walls" || b.type === "furniture" || b.type === "palm" || b.type === "nature") {
            let buffer = 1.3;
            if (nx > b.x - (b.w/2 + buffer) && nx < b.x + (b.w/2 + buffer) &&
                nz > b.z - (b.d/2 + buffer) && nz < b.z + (b.d/2 + buffer)) return true;
        }
    }
    return false;
}

// --- 4. ADVANCED SPAWNER (THE RESTORED LOGIC) ---
function spawnObject(s) {
    const group = new THREE.Group();
    let mesh;
    const isGlass = s.mat === 0x81ecec;
    const mat = new THREE.MeshStandardMaterial({ color: s.mat, roughness: 0.8, transparent: isGlass, opacity: isGlass ? 0.4 : 1.0 });

    if (s.type === "floor") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, 1.2, s.d), mat);
        mesh.position.y = 0.6;
    } else if (s.type === "bridge") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, 2.5, s.d), mat);
        mesh.position.y = 1.25;
    } else if (s.type === "palm") {
        // Build a proper tree
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 8, 8), new THREE.MeshStandardMaterial({ color: 0x5d4037 }));
        trunk.position.y = 4;
        group.add(trunk);
        mesh = new THREE.Mesh(new THREE.SphereGeometry(s.w * 2.5, 8, 8), mat);
        mesh.position.y = 9;
    } else if (s.type === "nature") {
        mesh = new THREE.Mesh(new THREE.SphereGeometry(s.w, 8, 8), mat);
        mesh.position.y = s.w;
    } else if (s.type === "rock") {
        mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(s.w, 0), mat);
        mesh.position.y = s.w/2;
    } else if (s.type === "furniture") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, s.w/3 + 1, s.d), mat);
        mesh.position.y = (s.w/6) + 1.2;
    } else {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, 15, s.d), mat);
        mesh.position.y = 7.5;
    }

    if (mesh) group.add(mesh);
    group.position.set(s.x, 0, s.z);
    group.scale.set(0.01, 0.01, 0.01);
    scene.add(group);
    s.obj = group;
    if (!buildings.includes(s)) buildings.push(s);

    // Bounce player out of the way
    if (player.position.distanceTo(group.position) < 6) player.position.z += 10;
}

// --- 5. ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);

    let targetSpeed = 0;
    if (keys['w']) targetSpeed = 0.85;
    if (keys['s']) targetSpeed = -0.45;
    moveSpeed += (targetSpeed - moveSpeed) * 0.15;

    let nx = player.position.x + Math.sin(player.rotation.y) * -moveSpeed;
    let nz = player.position.z + Math.cos(player.rotation.y) * -moveSpeed;

    if (!checkCollision(nx, nz)) {
        player.position.x = nx;
        player.position.z = nz;
    } else { moveSpeed *= 0.2; }

    if (keys['a']) player.rotation.y += 0.06;
    if (keys['d']) player.rotation.y -= 0.06;

    if (keys[' '] && !isJumping) { yVel = 0.5; isJumping = true; }
    if (isJumping) {
        player.position.y += yVel;
        yVel -= 0.025;
        if (player.position.y <= 0) { player.position.y = 0; isJumping = false; }
    }

    // Camera Smoothing
    const camOffset = new THREE.Vector3(0, 10, 22).applyMatrix4(player.matrixWorld);
    camera.position.lerp(camOffset, 0.12);
    camera.lookAt(player.position.x, player.position.y + 3.5, player.position.z);

    // Unlock Animation
    buildSteps.forEach(b => { if(b.obj && b.obj.scale.x < 1) b.obj.scale.lerp(new THREE.Vector3(1,1,1), 0.1); });

    // GPS & Purchasing
    if (activePad) {
        let dist = player.position.distanceTo(activePad.position);
        gps.position.set(player.position.x + (activePad.position.x - player.position.x)/2, 1.2, player.position.z + (activePad.position.z - player.position.z)/2);
        gps.scale.set(1.2, 1, dist);
        gps.lookAt(activePad.position);
        
        if (dist < 5 && wallet >= activePad.data.cost) {
            wallet -= activePad.data.cost;
            activePad.data.bought = true;
            income += activePad.data.inc;
            spawnObject(activePad.data);
            refreshPads();
        }
    }

    renderer.render(scene, camera);
    document.getElementById('m-val').innerText = Math.floor(wallet);
    document.getElementById('i-val').innerText = income;
}

// --- 6. UTILITY FUNCTIONS ---
function refreshPads() {
    scene.children.filter(c => c.isPad).forEach(p => scene.remove(p));
    const next = buildSteps.find(s => !s.bought && (!s.needs || buildSteps.find(x => x.id === s.needs).bought));
    if (next) {
        activePad = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.5, 32), new THREE.MeshPhongMaterial({ color: 0x2ecc71, emissive: 0x003300 }));
        activePad.position.set(next.x, 0.8, next.z); 
        activePad.isPad = true; activePad.data = next;
        scene.add(activePad);
        document.getElementById('hint').innerText = `Next: ${next.label} ($${next.cost})`;
    }
}

function initSaveSystem() {
    const raw = localStorage.getItem('MegaResort_Save');
    if (raw) {
        const data = JSON.parse(raw);
        wallet = data.wallet; income = data.income;
        data.bought.forEach(id => {
            const s = buildSteps.find(x => x.id === id);
            if(s) { s.bought = true; spawnObject(s); }
        });
    }
}

// Persistent Save Timer
setInterval(() => {
    wallet += income;
    localStorage.setItem('MegaResort_Save', JSON.stringify({ 
        wallet, income, bought: buildSteps.filter(s => s.bought).map(s => s.id) 
    }));
}, 1000);

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
