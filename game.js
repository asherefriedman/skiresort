// --- GLOBAL VARIABLES ---
let scene, camera, renderer, player, wallet = 200, income = 0;
let activePad = null, gps, isJumping = false, yVel = 0;
let moveSpeed = 0;
const keys = {}, buildings = [];

// --- 1. THE EXPANDED BUILD LIST (35 STEPS) ---
const buildSteps = [
    // LOBBY PHASE
    { id: 1, x: 0, z: 0, cost: 0, label: "Lobby Foundation", type: "floor", mat: 0x95a5a6, inc: 10, w: 40, d: 40 },
    { id: 2, x: 12, z: 8, cost: 250, label: "Reception Marble Desk", type: "furniture", mat: 0x34495e, inc: 15, w: 10, d: 3, needs: 1 },
    { id: 3, x: 0, z: 25, cost: 500, label: "Entrance Palm Tree L", type: "nature", mat: 0x2ecc71, inc: 5, w: 2, d: 2, needs: 2 },
    { id: 4, x: 10, z: 25, cost: 500, label: "Entrance Palm Tree R", type: "nature", mat: 0x2ecc71, inc: 5, w: 2, d: 2, needs: 3 },
    { id: 5, x: -10, z: -10, cost: 600, label: "Waiting Area Sofa 1", type: "furniture", mat: 0xc0392b, inc: 25, w: 6, d: 3, needs: 4 },
    { id: 6, x: 0, z: 19, cost: 1500, label: "Lobby Glass Wall", type: "walls", mat: 0x81ecec, inc: 40, w: 40, d: 1, needs: 5 },
    
    // SUITE 101
    { id: 7, x: 0, z: -40, cost: 5000, label: "Suite 101 Floor", type: "floor", mat: 0xecf0f1, inc: 100, w: 30, d: 30, needs: 6 },
    { id: 8, x: -18, z: -40, cost: 1200, label: "Balcony Garden Rock", type: "nature", mat: 0x7f8c8d, inc: 10, w: 5, d: 5, needs: 7 },
    { id: 9, x: 0, z: -45, cost: 2500, label: "King Size Bed Frame", type: "furniture", mat: 0x3e2723, inc: 150, w: 10, d: 12, needs: 8 },
    { id: 10, x: 0, z: -30, cost: 3500, label: "Large Smart TV", type: "furniture", mat: 0x1a1a1a, inc: 200, w: 8, d: 1, needs: 9 },
    
    // POOL AREA & NATURE
    { id: 11, x: 50, z: 0, cost: 15000, label: "Poolside Tiling", type: "floor", mat: 0xbdc3c7, inc: 500, w: 50, d: 60, needs: 10 },
    { id: 12, x: 50, z: 0, cost: 25000, label: "Heated Water", type: "floor", mat: 0x00d2ff, inc: 1000, w: 30, d: 40, needs: 11 },
    { id: 13, x: 75, z: 25, cost: 3000, label: "Tropical Fern Patch", type: "nature", mat: 0x27ae60, inc: 50, w: 4, d: 4, needs: 12 },
    { id: 14, x: 38, z: 15, cost: 2000, label: "Pool Lounge Chair A", type: "furniture", mat: 0xffffff, inc: 150, w: 3, d: 6, needs: 13 },
    { id: 15, x: 20, z: -20, cost: 8000, label: "Giant Decorative Rock", type: "nature", mat: 0x95a5a6, inc: 100, w: 12, d: 8, needs: 14 },
    { id: 16, x: 20, z: -15, cost: 4000, label: "Rock Waterfall Base", type: "floor", mat: 0x2980b9, inc: 200, w: 10, d: 5, needs: 15 },
    { id: 17, x: 70, z: -10, cost: 12000, label: "Outdoor Tiki Bar", type: "furniture", mat: 0xe67e22, inc: 800, w: 8, d: 8, needs: 16 },
    { id: 18, x: 70, z: -18, cost: 5000, label: "Tiki Bar Palm L", type: "nature", mat: 0x2ecc71, inc: 150, w: 2, d: 2, needs: 17 },
    { id: 19, x: 78, z: -18, cost: 5000, label: "Tiki Bar Palm R", type: "nature", mat: 0x2ecc71, inc: 150, w: 2, d: 2, needs: 18 },
    
    // BRIDGE & BEYOND
    { id: 20, x: 100, z: 0, cost: 50000, label: "Mountain Bridge Pier", type: "floor", mat: 0x7f8c8d, inc: 2000, w: 15, d: 15, needs: 19 },
    { id: 21, x: 140, z: 0, cost: 100000, label: "Suspension Cables", type: "walls", mat: 0x34495e, inc: 3000, w: 1, d: 80, needs: 20 },
    { id: 22, x: 140, z: 0, cost: 150000, label: "Bridge Tarmac", type: "bridge", mat: 0x2d3436, inc: 5000, w: 80, d: 15, needs: 21 },
    { id: 23, x: 185, z: 12, cost: 20000, label: "Cliffside Pine Tree", type: "nature", mat: 0x013220, inc: 500, w: 3, d: 3, needs: 22 },
    { id: 24, x: 185, z: -12, cost: 20000, label: "Cliffside Boulder", type: "nature", mat: 0x3d3d3d, inc: 500, w: 10, d: 10, needs: 23 },
    { id: 25, x: 200, z: 0, cost: 250000, label: "Mountain Welcome Sign", type: "furniture", mat: 0xf1c40f, inc: 10000, w: 10, d: 2, needs: 24 }
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
    scene.fog = new THREE.Fog(0x81ecec, 10, 600);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 5000);
    renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); 
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(50, 100, 50);
    scene.add(sun, new THREE.HemisphereLight(0xddeeff, 0x202020, 0.5));

    const sea = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000), new THREE.MeshPhongMaterial({ color: 0x0984e3, shininess: 90, transparent: true, opacity: 0.8 }));
    sea.rotation.x = -Math.PI/2; sea.position.y = -2;
    scene.add(sea);

    const island = new THREE.Mesh(new THREE.CylinderGeometry(350, 360, 2, 64), new THREE.MeshPhongMaterial({ color: 0x2ecc71 }));
    island.position.y = -1; 
    scene.add(island);

    player = new THREE.Group();
    const pMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 2, 4, 8), new THREE.MeshStandardMaterial({ color: 0x341f97 }));
    pMesh.position.y = 1.75; 
    player.add(pMesh);
    scene.add(player);

    gps = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 1), new THREE.MeshBasicMaterial({ color: 0xffff00, transparent: true, opacity: 0.4 }));
    scene.add(gps);

    initSaveSystem();
    refreshPads();
    animate();
}

// --- 3. PHYSICS ---
function checkCollision(nx, nz) {
    if (player.position.y > 2.8) return false; 
    for (let b of buildings) {
        // Nature (Trees/Rocks) now have solid trunks/bases
        if (b.type === "walls" || b.type === "furniture" || b.type === "nature") {
            let buffer = 1.1;
            if (nx > b.x - (b.w/2 + buffer) && nx < b.x + (b.w/2 + buffer) &&
                nz > b.z - (b.d/2 + buffer) && nz < b.z + (b.d/2 + buffer)) return true;
        }
    }
    return false;
}

// --- 4. BUILDING LOGIC (NATURE TYPE ADDED) ---
function spawnObject(s) {
    const group = new THREE.Group();
    let mesh;
    const isGlass = s.mat === 0x81ecec;
    const mat = new THREE.MeshStandardMaterial({ color: s.mat, roughness: 0.8, metalness: 0.1 });

    if (s.type === "floor") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, 1.2, s.d), mat);
        mesh.position.y = 0.6;
    } else if (s.type === "bridge") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, 2.5, s.d), mat);
        mesh.position.y = 1.25;
    } else if (s.type === "furniture") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, s.w/2, s.d), mat);
        mesh.position.y = (s.w/4) + 1.0;
    } else if (s.type === "walls") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, 15, s.d), new THREE.MeshStandardMaterial({ color: s.mat, transparent: isGlass, opacity: isGlass ? 0.4 : 1.0 }));
        mesh.position.y = 8;
    } 
    // NEW: NATURE LOGIC
    else if (s.type === "nature") {
        if (s.label.includes("Tree") || s.label.includes("Palm")) {
            // Trunk
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 8, 8), new THREE.MeshStandardMaterial({ color: 0x3e2723 }));
            trunk.position.y = 4;
            group.add(trunk);
            // Leaves
            mesh = new THREE.Mesh(new THREE.SphereGeometry(s.w * 2, 8, 8), mat);
            mesh.position.y = 8;
        } else {
            // Rocks
            mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(s.w/2), mat);
            mesh.position.y = s.w/4 + 0.5;
        }
    }

    if (mesh) group.add(mesh);
    group.position.set(s.x, 0, s.z);
    group.scale.set(0.01, 0.01, 0.01);
    scene.add(group);
    s.obj = group;
    if (!buildings.includes(s)) buildings.push(s);

    // ANTI-STUCK
    if (player.position.distanceTo(group.position) < 5) {
        player.position.x -= Math.sin(player.rotation.y) * 8;
        player.position.z -= Math.cos(player.rotation.y) * 8;
    }
}

// --- 5. MAIN LOOP ---
function animate() {
    requestAnimationFrame(animate);

    let targetSpeed = 0;
    if (keys['arrowup'] || keys['w']) targetSpeed = 0.85;
    if (keys['arrowdown'] || keys['s']) targetSpeed = -0.45;
    moveSpeed += (targetSpeed - moveSpeed) * 0.15;

    let nx = player.position.x + Math.sin(player.rotation.y) * -moveSpeed;
    let nz = player.position.z + Math.cos(player.rotation.y) * -moveSpeed;

    if (!checkCollision(nx, nz)) {
        player.position.x = nx;
        player.position.z = nz;
    } else { moveSpeed *= 0.2; }

    if (keys['arrowleft'] || keys['a']) player.rotation.y += 0.06;
    if (keys['arrowright'] || keys['d']) player.rotation.y -= 0.06;

    if (keys[' '] && !isJumping) { yVel = 0.5; isJumping = true; }
    if (isJumping) {
        player.position.y += yVel;
        yVel -= 0.025;
        if (player.position.y <= 0) { player.position.y = 0; isJumping = false; }
    }

    const camOffset = new THREE.Vector3(0, 9, 20).applyMatrix4(player.matrixWorld);
    camera.position.lerp(camOffset, 0.12);
    camera.lookAt(player.position.x, player.position.y + 3.5, player.position.z);

    buildSteps.forEach(b => { if(b.obj && b.obj.scale.x < 1) b.obj.scale.lerp(new THREE.Vector3(1,1,1), 0.1); });

    if (activePad) {
        let dist = player.position.distanceTo(activePad.position);
        gps.position.set(player.position.x + (activePad.position.x - player.position.x)/2, 1.2, player.position.z + (activePad.position.z - player.position.z)/2);
        gps.scale.set(1.2, 1, dist);
        gps.lookAt(activePad.position);
        
        if (dist < 4.5 && wallet >= activePad.data.cost) {
            wallet -= activePad.data.cost;
            activePad.data.bought = true;
            income += activePad.data.inc;
            spawnObject(activePad.data);
            autoSave();
            refreshPads();
        }
    }

    renderer.render(scene, camera);
    document.getElementById('m-val').innerText = Math.floor(wallet);
    document.getElementById('i-val').innerText = income;
}

function refreshPads() {
    scene.children.filter(c => c.isPad).forEach(p => scene.remove(p));
    const next = buildSteps.find(s => !s.bought && (!s.needs || buildSteps.find(x => x.id === s.needs).bought));
    if (next) {
        activePad = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.6, 32), new THREE.MeshPhongMaterial({ color: 0x2ecc71, emissive: 0x002200 }));
        activePad.position.set(next.x, 1.1, next.z); 
        activePad.isPad = true; activePad.data = next;
        scene.add(activePad);
        document.getElementById('hint').innerText = `NEXT: ${next.label} ($${next.cost})`;
    }
}

// --- 6. SAVE SYSTEM ---
function autoSave() {
    const saveObj = { wallet, income, unlocked: buildSteps.filter(s => s.bought).map(s => s.id) };
    localStorage.setItem('MegaResort_Data', JSON.stringify(saveObj));
}

function initSaveSystem() {
    const raw = localStorage.getItem('MegaResort_Data');
    if (raw) {
        const data = JSON.parse(raw);
        wallet = data.wallet; income = data.income;
        data.unlocked.forEach(id => {
            const s = buildSteps.find(x => x.id === id);
            if (s) { s.bought = true; spawnObject(s); }
        });
    }
}

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
setInterval(() => { wallet += income; }, 1000);
