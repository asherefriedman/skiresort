// --- 1. GLOBALS ---
let scene, camera, renderer, player, wallet = 200, income = 0;
let activePad = null, gps, isJumping = false, yVel = 0;
const keys = {}, buildings = [];

// --- 2. THE STABLE 10-STEP LIST ---
const buildSteps = [
    { id: 1, x: 0, z: 0, cost: 0, label: "Lobby Foundation", type: "floor", mat: 0x95a5a6, inc: 5, w: 40, d: 40 },
    { id: 2, x: 12, z: 8, cost: 100, label: "Reception Desk", type: "furniture", mat: 0x34495e, inc: 8, w: 10, d: 3, needs: 1 },
    { id: 3, x: 14, z: 10, cost: 150, label: "Reception Computer", type: "furniture", mat: 0x2d3436, inc: 10, w: 2, d: 2, needs: 2 },
    { id: 4, x: -10, z: -10, cost: 300, label: "Lobby Sofa", type: "furniture", mat: 0xc0392b, inc: 12, w: 6, d: 3, needs: 1 },
    { id: 5, x: 0, z: 25, cost: 200, label: "Palm Tree", type: "palm", mat: 0x2ecc71, inc: 2, w: 2, d: 2, needs: 1 },
    { id: 6, x: 0, z: -40, cost: 1000, label: "Suite Floor", type: "floor", mat: 0xecf0f1, inc: 50, w: 30, d: 30, needs: 4 },
    { id: 7, x: 0, z: -45, cost: 500, label: "Bed", type: "furniture", mat: 0xffffff, inc: 30, w: 10, d: 12, needs: 6 },
    { id: 8, x: 50, z: 0, cost: 5000, label: "Pool Area", type: "floor", mat: 0x00d2ff, inc: 200, w: 40, d: 40, needs: 6 },
    { id: 9, x: 100, z: 0, cost: 10000, label: "Bridge", type: "floor", mat: 0x7f8c8d, inc: 500, w: 20, d: 10, needs: 8 },
    { id: 10, x: 150, z: 0, cost: 50000, label: "Grand Sign", type: "furniture", mat: 0xf1c40f, inc: 2000, w: 10, d: 2, needs: 9 }
];

// --- 3. STARTUP ---
function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gui').style.display = 'block';
    init();
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0fbcf9);
    // Added Fog for depth
    scene.fog = new THREE.Fog(0x81ecec, 1, 3000);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 5000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const sun = new THREE.DirectionalLight(0xffffff, 1.0);
    sun.position.set(50, 150, 50);
    scene.add(sun);

    // --- RESTORED ISLAND ---
    const island = new THREE.Mesh(
        new THREE.CylinderGeometry(800, 820, 5, 64), 
        new THREE.MeshPhongMaterial({ color: 0x2ecc71 })
    );
    island.position.y = -2.5;
    scene.add(island);

    // --- RESTORED SEA ---
    const sea = new THREE.Mesh(
        new THREE.PlaneGeometry(15000, 15000), 
        new THREE.MeshPhongMaterial({ color: 0x0984e3, transparent: true, opacity: 0.7 })
    );
    sea.rotation.x = -Math.PI/2; 
    sea.position.y = -3.5;
    scene.add(sea);

    // Player (Back to Blue Capsule)
    player = new THREE.Group();
    const pMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.7, 2, 4, 8), new THREE.MeshStandardMaterial({ color: 0x341f97 }));
    pMesh.position.y = 1.75;
    player.add(pMesh);
    scene.add(player);
    player.position.set(0, 10, 45); 

    // Force Start Item
    buildSteps[0].bought = true;
    spawnObject(buildSteps[0]);

    refreshPads();
    animate();
}

function animate() {
    requestAnimationFrame(animate);

    // --- RESTORED SMOOTH MOVEMENT ---
    let targetSpeed = 0;
    if (keys['w']) targetSpeed = 0.85;
    if (keys['s']) targetSpeed = -0.45;
    moveSpeed += (targetSpeed - moveSpeed) * 0.15;

    player.position.x += Math.sin(player.rotation.y) * -moveSpeed;
    player.position.z += Math.cos(player.rotation.y) * -moveSpeed;

    if (keys['a']) player.rotation.y += 0.06;
    if (keys['d']) player.rotation.y -= 0.06;

    // Jump Physics
    if (keys[' '] && !isJumping) { yVel = 0.55; isJumping = true; }
    if (isJumping) {
        player.position.y += yVel;
        yVel -= 0.03;
        if (player.position.y <= 0) { player.position.y = 0; isJumping = false; }
    }

    // --- RESTORED CHASE CAMERA ---
    const camPos = new THREE.Vector3(0, 12, 28).applyMatrix4(player.matrixWorld);
    camera.position.lerp(camPos, 0.15);
    camera.lookAt(player.position.x, player.position.y + 2.5, player.position.z);

    if (activePad) {
        if (player.position.distanceTo(activePad.position) < 5) {
            if (wallet >= activePad.data.cost) {
                wallet -= activePad.data.cost;
                activePad.data.bought = true;
                income += activePad.data.inc;
                spawnObject(activePad.data);
                refreshPads();
            }
        }
    }

    renderer.render(scene, camera);
    document.getElementById('m-val').innerText = Math.floor(wallet);
    document.getElementById('i-val').innerText = income;
}

function spawnObject(s) {
    const geo = new THREE.BoxGeometry(s.w, (s.type === "palm" ? 10 : 1), s.d);
    const mat = new THREE.MeshStandardMaterial({color: s.mat});
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(s.x, (s.type === "palm" ? 5 : 0.5), s.z);
    scene.add(mesh);
    s.obj = mesh;
}

    camera.position.set(player.position.x, 20, player.position.z + 40);
    camera.lookAt(player.position);

    if (activePad) {
        if (player.position.distanceTo(activePad.position) < 5) {
            if (wallet >= activePad.data.cost) {
                wallet -= activePad.data.cost;
                activePad.data.bought = true;
                income += activePad.data.inc;
                spawnObject(activePad.data);
                refreshPads();
            }
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
        activePad = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 0.5, 32), new THREE.MeshBasicMaterial({color: 0xffff00}));
        activePad.position.set(next.x, 0.1, next.z);
        activePad.isPad = true; activePad.data = next;
        scene.add(activePad);
        document.getElementById('hint').innerText = `Next: ${next.label} ($${next.cost})`;
    } else {
        document.getElementById('hint').innerText = "All Built!";
    }
}

// Money Timer
setInterval(() => { wallet += income; }, 1000);

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
