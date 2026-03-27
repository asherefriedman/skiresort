let scene, camera, renderer, player, wallet = 200, income = 0;
let activePad = null, gps, isJumping = false, yVel = 0;
let moveSpeed = 0;
const keys = {}, buildings = [];

// DATA WITH COLLISION SIZES (w: width, d: depth)
const buildSteps = [
    { id: 1, x: 0, z: 0, cost: 0, label: "Main Lobby Floor", type: "floor", mat: 0x95a5a6, inc: 10, w: 40, d: 40 },
    { id: 2, x: 10, z: 5, cost: 200, label: "Reception Desk", type: "furniture", mat: 0x784212, inc: 15, w: 8, d: 4 },
    { id: 3, x: -10, z: -5, cost: 500, label: "Lobby Sofa", type: "furniture", mat: 0xd35400, inc: 20, w: 6, d: 3 },
    { id: 4, x: 0, z: 19, cost: 2000, label: "Lobby Back Wall", type: "walls", mat: 0xecf0f1, inc: 50, w: 40, d: 2 },
    { id: 5, x: 0, z: -40, cost: 5000, label: "Hotel Wing 1", type: "floor", mat: 0x95a5a6, inc: 100, w: 40, d: 40 }
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

    // ZOOMED IN CAMERA: FOV changed from 75 to 60 for "Life-size" feel
    camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 5000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(100, 200, 100);
    scene.add(sun, new THREE.AmbientLight(0xffffff, 0.7));

    // Ground layers to prevent "Button Eating"
    const ocean = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000), new THREE.MeshPhongMaterial({ color: 0x0984e3 }));
    ocean.rotation.x = -Math.PI/2; ocean.position.y = -2;
    scene.add(ocean);

    const island = new THREE.Mesh(new THREE.CylinderGeometry(200, 210, 2, 64), new THREE.MeshPhongMaterial({ color: 0x2ecc71 }));
    island.position.y = -1; // Top of grass is at Y = 0
    scene.add(island);

    player = new THREE.Group();
    const pMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 3.5, 1.5), new THREE.MeshPhongMaterial({ color: 0x2d3436 }));
    pMesh.position.y = 1.75; 
    player.add(pMesh);
    scene.add(player);

    gps = new THREE.Mesh(new THREE.BoxGeometry(1, 0.2, 1), new THREE.MeshBasicMaterial({ color: 0xffeaa7, transparent: true, opacity: 0.6 }));
    scene.add(gps);

    refreshPads();
    animate();
}

// COLLISION CHECKER
function checkCollision(nextX, nextZ) {
    for (let b of buildings) {
        // Only collide with furniture and walls
        if (b.type === "furniture" || b.type === "walls") {
            let halfW = b.w / 2 + 1; // +1 for player thickness
            let halfD = b.d / 2 + 1;
            if (nextX > b.x - halfW && nextX < b.x + halfW && 
                nextZ > b.z - halfD && nextZ < b.z + halfD) {
                return true; // Wall hit!
            }
        }
    }
    return false;
}

function spawnObject(s) {
    const group = new THREE.Group();
    let mesh;
    const mat = new THREE.MeshPhongMaterial({ color: s.mat });

    if (s.type === "floor") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, 1, s.d), mat);
        mesh.position.y = 0.5; // Sit on grass
    } else if (s.type === "furniture") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, 2, s.d), mat);
        mesh.position.y = 2; // High enough to see clearly
    } else if (s.type === "walls") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(s.w, 15, s.d), mat);
        mesh.position.y = 8.5;
    }

    group.add(mesh);
    group.position.set(s.x, 0, s.z);
    group.scale.set(0.1, 0.1, 0.1);
    scene.add(group);
    s.obj = group;
    buildings.push(s);
}

function animate() {
    requestAnimationFrame(animate);

    // MOVE LOGIC WITH COLLISION
    let targetSpeed = 0;
    if (keys['arrowup'] || keys['w']) targetSpeed = 0.8;
    if (keys['arrowdown'] || keys['s']) targetSpeed = -0.5;
    moveSpeed += (targetSpeed - moveSpeed) * 0.15;

    // Calculate potential next position
    let nextX = player.position.x + Math.sin(player.rotation.y) * -moveSpeed;
    let nextZ = player.position.z + Math.cos(player.rotation.y) * -moveSpeed;

    if (!checkCollision(nextX, nextZ)) {
        player.position.x = nextX;
        player.position.z = nextZ;
    } else {
        moveSpeed = 0; // Stop if hitting wall
    }

    if (keys['arrowleft'] || keys['a']) player.rotation.y += 0.05;
    if (keys['arrowright'] || keys['d']) player.rotation.y -= 0.05;

    // JUMPING
    if (keys[' '] && !isJumping) { yVel = 0.4; isJumping = true; }
    if (isJumping) {
        player.position.y += yVel;
        yVel -= 0.02;
        if (player.position.y <= 0) { player.position.y = 0; isJumping = false; }
    }

    // LIFE-SIZE CAMERA: Closer and lower to the ground
    const camOffset = new THREE.Vector3(0, 15, 25).applyQuaternion(player.quaternion);
    const camTarget = player.position.clone().add(camOffset);
    camera.position.lerp(camTarget, 0.1);
    camera.lookAt(new THREE.Vector3(player.position.x, player.position.y + 2, player.position.z));

    buildSteps.forEach(b => { if(b.obj && b.obj.scale.x < 1) b.obj.scale.lerp(new THREE.Vector3(1,1,1), 0.1); });

    if (activePad) {
        let dist = player.position.distanceTo(activePad.position);
        gps.position.set(player.position.x + (activePad.position.x - player.position.x)/2, 0.8, player.position.z + (activePad.position.z - player.position.z)/2);
        gps.scale.set(1.5, 1, dist);
        gps.lookAt(activePad.position);
        
        if (dist < 6 && wallet >= activePad.data.cost) {
            wallet -= activePad.data.cost;
            activePad.data.bought = true;
            income += activePad.data.inc;
            spawnObject(activePad.data);
            if(window.autoSave) autoSave();
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
        // Buttons are at Y=1.2 so they "float" clearly above any floor
        activePad = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 1.2, 32), new THREE.MeshPhongMaterial({ color: 0x27ae60, emissive: 0x002200 }));
        activePad.position.set(next.x, 1.2, next.z); 
        activePad.isPad = true; activePad.data = next;
        scene.add(activePad);
        document.getElementById('hint').innerText = `Next: ${next.label} ($${next.cost})`;
    }
}

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
setInterval(() => { wallet += income; }, 1000);
