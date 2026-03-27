let scene, camera, renderer, player, wallet = 200, income = 0;
let activePad = null, gps, isJumping = false, yVel = 0;
let moveSpeed = 0;
const keys = {}, buildings = [];

// GRANULAR DATA: Every piece must be bought
const buildSteps = [
    { id: 1, x: 0, z: 0, cost: 0, label: "Main Lobby Floor", type: "floor", mat: 0x95a5a6, inc: 10 },
    { id: 2, x: 10, z: 5, cost: 200, label: "Reception Desk", type: "furniture", mat: 0x784212, inc: 15, needs: 1 },
    { id: 3, x: -10, z: -5, cost: 500, label: "Lobby Sofa", type: "furniture", mat: 0xd35400, inc: 20, needs: 2 },
    { id: 4, x: 0, z: 0, cost: 2000, label: "Lobby Walls", type: "walls", mat: 0xecf0f1, inc: 50, needs: 3 },
    { id: 5, x: 0, z: 18, cost: 5000, label: "Hotel Wing 1", type: "floor", mat: 0x95a5a6, inc: 100, needs: 4 },
    { id: 6, x: 0, z: 18, cost: 12000, label: "Room 101 Bed", type: "furniture", mat: 0x2980b9, inc: 250, needs: 5 },
    { id: 7, x: 0, z: 18, cost: 15000, label: "Room 101 TV", type: "furniture", mat: 0x2c3e50, inc: 300, needs: 6 },
    { id: 8, x: 50, z: 0, cost: 50000, label: "Pool Foundation", type: "floor", mat: 0x3498db, inc: 1000, needs: 7 },
    { id: 9, x: 50, z: 0, cost: 100000, label: "Pool Lounge Chairs", type: "furniture", mat: 0xffffff, inc: 2000, needs: 8 },
    { id: 10, x: 150, z: 50, cost: 500000, label: "Mountain Bridge", type: "bridge", mat: 0x7f8c8d, inc: 5000, needs: 9 }
];

function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gui').style.display = 'block';
    init();
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x81ecec);
    scene.fog = new THREE.FogExp2(0x81ecec, 0.001);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 10000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(100, 200, 100);
    scene.add(sun, new THREE.AmbientLight(0xffffff, 0.7));

    // Sea Level
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(20000, 20000), new THREE.MeshPhongMaterial({ color: 0x0984e3 }));
    sea.rotation.x = -Math.PI/2; sea.position.y = -3;
    scene.add(sea);

    // Island Ground (Y=0)
    const island = new THREE.Mesh(new THREE.CylinderGeometry(200, 220, 5, 64), new THREE.MeshPhongMaterial({ color: 0x2ecc71 }));
    island.position.y = -2.5; scene.add(island);

    // Player (Y start at 1.5)
    player = new THREE.Group();
    const pMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3, 1.5), new THREE.MeshPhongMaterial({ color: 0x2d3436 }));
    pMesh.position.y = 1.5; player.add(pMesh);
    scene.add(player);

    // GPS Beam (Y=0.5 to avoid floor clip)
    gps = new THREE.Mesh(new THREE.BoxGeometry(1, 0.1, 1), new THREE.MeshBasicMaterial({ color: 0xf1c40f, transparent: true, opacity: 0.8 }));
    scene.add(gps);

    refreshPads();
    animate();
}

function spawnObject(s) {
    const group = new THREE.Group();
    let mesh;
    const mat = new THREE.MeshPhongMaterial({ color: s.mat });

    if (s.type === "floor") mesh = new THREE.Mesh(new THREE.BoxGeometry(40, 1, 40), mat);
    else if (s.type === "furniture") mesh = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 4), mat);
    else if (s.type === "walls") mesh = new THREE.Mesh(new THREE.BoxGeometry(40, 15, 1), mat);
    else if (s.type === "bridge") mesh = new THREE.Mesh(new THREE.BoxGeometry(100, 1, 15), mat);

    mesh.position.y = (s.type === "walls") ? 7.5 : 0.5;
    group.add(mesh);
    group.position.set(s.x, 0, s.z);
    group.scale.set(0.1, 0.1, 0.1);
    scene.add(group);
    s.obj = group;
    buildings.push(s);
}

function animate() {
    requestAnimationFrame(animate);

    // 1. INPUT & SMOOTH MOVEMENT
    let targetSpeed = 0;
    if (keys['arrowup'] || keys['w']) targetSpeed = 0.9;
    if (keys['arrowdown'] || keys['s']) targetSpeed = -0.6;
    moveSpeed += (targetSpeed - moveSpeed) * 0.15;
    player.translateZ(-moveSpeed);

    if (keys['arrowleft'] || keys['a']) player.rotation.y += 0.06;
    if (keys['arrowright'] || keys['d']) player.rotation.y -= 0.06;

    // 2. JUMPING PHYSICS
    if (keys[' '] && !isJumping) { yVel = 0.5; isJumping = true; }
    if (isJumping) {
        player.position.y += yVel;
        yVel -= 0.025; // Gravity
        if (player.position.y <= 0) { player.position.y = 0; isJumping = false; yVel = 0; }
    }

    // 3. CAMERA LERP
    const camTarget = new THREE.Vector3(player.position.x, player.position.y + 40, player.position.z + 55);
    camera.position.lerp(camTarget, 0.1);
    camera.lookAt(player.position);

    // 4. BUILDING ANIMATION
    buildSteps.forEach(b => { if(b.obj && b.obj.scale.x < 1) b.obj.scale.lerp(new THREE.Vector3(1,1,1), 0.1); });

    // 5. GPS & PURCHASE LOGIC
    if (activePad) {
        activePad.rotation.y += 0.03;
        let dist = player.position.distanceTo(activePad.position);
        
        // GPS Line Math
        let dx = activePad.position.x - player.position.x;
        let dz = activePad.position.z - player.position.z;
        gps.position.set(player.position.x + dx/2, 0.5, player.position.z + dz/2);
        gps.scale.set(2, 1, dist);
        gps.lookAt(activePad.position);

        if (dist < 8 && wallet >= activePad.data.cost) {
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
    document.getElementById('p-bar').style.width = (buildings.length / buildSteps.length * 100) + "%";
}

function refreshPads() {
    scene.children.filter(c => c.isPad).forEach(p => scene.remove(p));
    const next = buildSteps.find(s => !s.bought && (!s.needs || buildSteps.find(x => x.id === s.needs).bought));
    if (next) {
        activePad = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 1, 32), new THREE.MeshPhongMaterial({ color: 0x27ae60, emissive: 0x004400 }));
        activePad.position.set(next.x, 0.1, next.z); // Fixed Height
        activePad.isPad = true; activePad.data = next;
        scene.add(activePad);
        document.getElementById('hint').innerText = `Next: ${next.label} ($${next.cost})`;
    } else {
        gps.visible = false;
        document.getElementById('hint').innerText = "RESORT COMPLETE!";
    }
}

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
setInterval(() => { wallet += income; }, 1000);
