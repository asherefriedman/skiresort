// ─── GLOBALS ───────────────────────────────────────────────────────────────
let scene, camera, renderer, player;
let wallet = 200, income = 0;
let activePad = null, gpsLine = null;
let isJumping = false, yVel = 0, moveSpeed = 0;
let gameStarted = false;
let inRangeOfPad = false;
const keys = {};
const buildings = [];
const pads = [];

// ─── BUILD STEPS ────────────────────────────────────────────────────────────
const buildSteps = [
    { id: 1,  x: 0,   z: 0,   cost: 0,      label: "Lobby Foundation",   type: "floor",     mat: 0x95a5a6, inc: 5,    w: 40, d: 40 },
    { id: 2,  x: 12,  z: 8,   cost: 100,    label: "Reception Desk",     type: "furniture", mat: 0x34495e, inc: 8,    w: 10, d: 3,  needs: 1 },
    { id: 3,  x: 14,  z: 10,  cost: 150,    label: "Reception Computer", type: "furniture", mat: 0x2d3436, inc: 10,   w: 2,  d: 2,  needs: 2 },
    { id: 4,  x: 10,  z: 10,  cost: 150,    label: "Guest Registry",     type: "furniture", mat: 0xffffff, inc: 10,   w: 1.5,d: 1.5,needs: 3 },
    { id: 5,  x: -5,  z: 25,  cost: 200,    label: "Entry Palm Tree L",  type: "palm",      mat: 0x2ecc71, inc: 2,    w: 2,  d: 2,  needs: 4 },
    { id: 6,  x: 5,   z: 25,  cost: 200,    label: "Entry Palm Tree R",  type: "palm",      mat: 0x2ecc71, inc: 2,    w: 2,  d: 2,  needs: 5 },
    { id: 7,  x: -10, z: -10, cost: 300,    label: "Lobby Sofa 1",       type: "furniture", mat: 0xc0392b, inc: 12,   w: 6,  d: 3,  needs: 6 },
    { id: 8,  x: -10, z: -4,  cost: 300,    label: "Lobby Sofa 2",       type: "furniture", mat: 0xc0392b, inc: 12,   w: 6,  d: 3,  needs: 7 },
    { id: 9,  x: 0,   z: 19,  cost: 800,    label: "Glass Front Wall",   type: "walls",     mat: 0x81ecec, inc: 20,   w: 40, d: 1,  needs: 8 },
    { id: 10, x: 0,   z: -40, cost: 2500,   label: "Suite 101 Floor",    type: "floor",     mat: 0xecf0f1, inc: 50,   w: 30, d: 30, needs: 9 },
    { id: 11, x: 0,   z: -45, cost: 1200,   label: "King Bed Frame",     type: "furniture", mat: 0x3e2723, inc: 40,   w: 10, d: 12, needs: 10 },
    { id: 12, x: 0,   z: -45, cost: 600,    label: "Luxury Mattress",    type: "furniture", mat: 0xffffff, inc: 30,   w: 9,  d: 11, needs: 11 },
    { id: 13, x: 0,   z: -42, cost: 200,    label: "Silk Pillows",       type: "furniture", mat: 0xecf0f1, inc: 10,   w: 7,  d: 2,  needs: 12 },
    { id: 14, x: -8,  z: -48, cost: 400,    label: "Suite Nightstand L", type: "furniture", mat: 0x5d4037, inc: 15,   w: 3,  d: 3,  needs: 13 },
    { id: 15, x: 8,   z: -48, cost: 400,    label: "Suite Nightstand R", type: "furniture", mat: 0x5d4037, inc: 15,   w: 3,  d: 3,  needs: 14 },
    { id: 16, x: 0,   z: -30, cost: 1800,   label: "Suite Smart TV",     type: "furniture", mat: 0x1a1a1a, inc: 80,   w: 8,  d: 1,  needs: 15 },
    { id: 17, x: 50,  z: 0,   cost: 8000,   label: "Pool Deck Tiles",    type: "floor",     mat: 0xbdc3c7, inc: 200,  w: 50, d: 60, needs: 16 },
    { id: 18, x: 50,  z: 0,   cost: 15000,  label: "Heated Pool Water",  type: "floor",     mat: 0x00d2ff, inc: 500,  w: 30, d: 40, needs: 17 },
    { id: 19, x: 38,  z: 15,  cost: 1000,   label: "Pool Lounge Chair",  type: "furniture", mat: 0xffffff, inc: 40,   w: 3,  d: 6,  needs: 18 },
    { id: 20, x: 75,  z: 25,  cost: 1500,   label: "Tropical Ferns",     type: "nature",    mat: 0x27ae60, inc: 20,   w: 4,  d: 4,  needs: 19 },
    { id: 21, x: 75,  z: 30,  cost: 500,    label: "Decorative Rocks",   type: "rock",      mat: 0x7f8c8d, inc: 10,   w: 3,  d: 3,  needs: 20 },
    { id: 22, x: 70,  z: -10, cost: 10000,  label: "Outdoor Tiki Bar",   type: "furniture", mat: 0xe67e22, inc: 400,  w: 8,  d: 8,  needs: 21 },
    { id: 23, x: 70,  z: -18, cost: 4000,   label: "Tiki Palm Tree",     type: "palm",      mat: 0x2ecc71, inc: 100,  w: 2,  d: 2,  needs: 22 },
    { id: 24, x: 100, z: 0,   cost: 40000,  label: "Bridge Support",     type: "floor",     mat: 0x7f8c8d, inc: 1000, w: 15, d: 15, needs: 23 },
    { id: 25, x: 140, z: 0,   cost: 80000,  label: "Bridge Cables",      type: "walls",     mat: 0x34495e, inc: 1500, w: 1,  d: 80, needs: 24 },
    { id: 26, x: 140, z: 0,   cost: 120000, label: "Bridge Roadway",     type: "bridge",    mat: 0x2d3436, inc: 2500, w: 80, d: 15, needs: 25 },
    { id: 27, x: 185, z: 12,  cost: 20000,  label: "Mountain Pine",      type: "nature",    mat: 0x013220, inc: 500,  w: 3,  d: 3,  needs: 26 },
    { id: 28, x: 200, z: 0,   cost: 200000, label: "Mountain Sign",      type: "furniture", mat: 0xf1c40f, inc: 8000, w: 10, d: 2,  needs: 27 }
];

// ─── HELPERS ────────────────────────────────────────────────────────────────
function fmt(n) {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000)    return '$' + (n / 1000).toFixed(1) + 'K';
    return '$' + Math.floor(n);
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
}

// ─── GAME START ─────────────────────────────────────────────────────────────
function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gui').style.display = 'block';
    document.getElementById('hint-card').style.display = 'block';
    gameStarted = true;
    init();
}

// ─── INIT ────────────────────────────────────────────────────────────────────
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0fbcf9);
    scene.fog = new THREE.Fog(0x81ecec, 10, 3000);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const sun = new THREE.DirectionalLight(0xfff4e0, 1.2);
    sun.position.set(100, 200, 80);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 2000;
    sun.shadow.camera.left = -500;
    sun.shadow.camera.right = 500;
    sun.shadow.camera.top = 500;
    sun.shadow.camera.bottom = -500;
    scene.add(sun);

    // Island
    const island = new THREE.Mesh(
        new THREE.CylinderGeometry(800, 820, 5, 64),
        new THREE.MeshStandardMaterial({ color: 0x2ecc71, roughness: 0.9 })
    );
    island.position.y = -2.5;
    island.receiveShadow = true;
    scene.add(island);

    // Ocean
    const sea = new THREE.Mesh(
        new THREE.PlaneGeometry(10000, 10000),
        new THREE.MeshStandardMaterial({ color: 0x0984e3, roughness: 0.1, metalness: 0.1 })
    );
    sea.rotation.x = -Math.PI / 2;
    sea.position.y = -4;
    scene.add(sea);

    // GPS guide line
    gpsLine = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.08, 1),
        new THREE.MeshBasicMaterial({ color: 0xf1c40f, transparent: true, opacity: 0.55 })
    );
    gpsLine.visible = false;
    scene.add(gpsLine);

    // Player
    player = new THREE.Group();
    const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.7, 2, 4, 8),
        new THREE.MeshStandardMaterial({ color: 0x341f97 })
    );
    body.position.y = 1.75;
    body.castShadow = true;
    player.add(body);
    scene.add(player);
    player.position.set(0, 0, 45);

    buildSteps[0].bought = true;
    spawnObject(buildSteps[0]);
    refreshPads();
    animate();
}

// ─── ANIMATE ─────────────────────────────────────────────────────────────────
function animate() {
    requestAnimationFrame(animate);
    if (!player || !renderer) return;

    const targetSpeed = keys['w'] ? 0.8 : keys['s'] ? -0.4 : 0;
    moveSpeed += (targetSpeed - moveSpeed) * 0.12;

    player.position.x += Math.sin(player.rotation.y) * -moveSpeed;
    player.position.z += Math.cos(player.rotation.y) * -moveSpeed;

    if (keys['a']) player.rotation.y += 0.05;
    if (keys['d']) player.rotation.y -= 0.05;

    if (keys[' '] && !isJumping) { yVel = 0.5; isJumping = true; }
    if (isJumping) {
        player.position.y += yVel;
        yVel -= 0.03;
        if (player.position.y <= 0) { player.position.y = 0; isJumping = false; yVel = 0; }
    }

    camera.position.set(player.position.x, player.position.y + 25, player.position.z + 45);
    camera.lookAt(player.position);

    buildings.forEach(b => {
        if (b.obj && b.obj.scale.x < 1) {
            const next = Math.min(b.obj.scale.x + 0.06, 1);
            b.obj.scale.set(next, next, next);
        }
    });

    if (activePad) {
        const dist = player.position.distanceTo(activePad.position);
        const canAfford = wallet >= activePad.data.cost;

        const mid = new THREE.Vector3().addVectors(player.position, activePad.position).multiplyScalar(0.5);
        gpsLine.position.set(mid.x, 0.6, mid.z);
        gpsLine.scale.z = dist;
        gpsLine.lookAt(activePad.position.x, 0.6, activePad.position.z);
        gpsLine.visible = true;

        inRangeOfPad = dist < 6;
        const prompt = document.getElementById('buy-prompt');
        prompt.style.display = (inRangeOfPad && canAfford) ? 'block' : 'none';

        if (inRangeOfPad && canAfford && keys['e']) {
            keys['e'] = false;
            purchase(activePad.data);
        }
    } else {
        gpsLine.visible = false;
        document.getElementById('buy-prompt').style.display = 'none';
    }

    renderer.render(scene, camera);
    document.getElementById('m-val').innerText = fmt(wallet);
    document.getElementById('i-val').innerText = fmt(income) + '/s';
}

// ─── PURCHASE ────────────────────────────────────────────────────────────────
function purchase(data) {
    wallet -= data.cost;
    data.bought = true;
    income += (data.inc || 0);
    spawnObject(data);
    showToast('✅ ' + data.label + ' built!');
    refreshPads();
}

// ─── SPAWN OBJECT ────────────────────────────────────────────────────────────
function spawnObject(s) {
    const group = new THREE.Group();

    let height, yOff;
    if (s.type === 'palm' || s.type === 'nature') { height = 10; yOff = 5; }
    else if (s.type === 'floor') { height = 0.5; yOff = 0.25; }
    else { height = 1.8; yOff = 0.9; }

    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(s.w, height, s.d),
        new THREE.MeshStandardMaterial({ color: s.mat, roughness: 0.7 })
    );
    mesh.position.y = yOff;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    if (s.type === 'palm') {
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.4, 6, 8),
            new THREE.MeshStandardMaterial({ color: 0x8B6914 })
        );
        trunk.position.y = 3;
        group.add(trunk);
    }

    group.position.set(s.x, 0, s.z);
    group.scale.set(0.01, 0.01, 0.01);
    scene.add(group);
    s.obj = group;
    buildings.push(s);
}

// ─── REFRESH PADS ────────────────────────────────────────────────────────────
function refreshPads() {
    pads.forEach(p => scene.remove(p));
    pads.length = 0;
    activePad = null;

    const next = buildSteps.find(s =>
        !s.bought && (!s.needs || buildSteps.find(x => x.id === s.needs)?.bought)
    );

    if (next) {
        const pad = new THREE.Mesh(
            new THREE.CylinderGeometry(3, 3, 0.4, 32),
            new THREE.MeshBasicMaterial({ color: 0xf1c40f, transparent: true, opacity: 0.85 })
        );
        pad.position.set(next.x, 0.2, next.z);
        pad.data = next;
        scene.add(pad);
        pads.push(pad);
        activePad = pad;

        document.getElementById('hint-name').innerText = next.label;
        document.getElementById('hint-cost').innerText = next.cost === 0 ? 'FREE' : fmt(next.cost);
    } else {
        document.getElementById('hint-name').innerText = '🏆 Resort Complete!';
        document.getElementById('hint-cost').innerText = '';
        showToast('🎉 Resort Complete! You win!');
    }
}

// ─── INCOME TICK ─────────────────────────────────────────────────────────────
setInterval(() => { if (gameStarted) wallet += income; }, 1000);

// ─── INPUT ───────────────────────────────────────────────────────────────────
window.addEventListener('keydown', e => {
    if (e.key === ' ') e.preventDefault();
    keys[e.key.toLowerCase()] = true;
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

// ─── RESIZE ──────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
