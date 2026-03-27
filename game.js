let scene, camera, renderer, player, wallet = 150, income = 0;
let activePad = null, gps, isDriving = false;
let currentSpeed = 0; 
const keys = {}, buildings = [];

const buildSteps = [
    { id: 1, x: 0, z: 0, cost: 0, label: "Lodge Base", type: "floor", inc: 20 },
    { id: 2, x: 0, z: 0, cost: 400, label: "Lodge Walls", type: "walls", inc: 50, needs: 1 },
    { id: 3, x: 0, z: 0, cost: 1500, label: "Crimson Roof", type: "roof", inc: 120, needs: 2 },
    { id: 4, x: 50, z: 15, cost: 6000, label: "Island Bridge", type: "bridge", inc: 250, needs: 3 },
    { id: 5, x: 120, z: 20, cost: 20000, label: "Vehicle Bay", type: "floor", inc: 1000, needs: 4 },
    { id: 6, x: 120, z: 20, cost: 50000, label: "Snowmobile", type: "vehicle", inc: 2500, needs: 5 },
    { id: 7, x: 90, z: -100, cost: 150000, label: "Hotel Plaza", type: "floor", inc: 8000, needs: 6 },
    { id: 8, x: 90, z: -100, cost: 400000, label: "Hotel Floor 1", type: "walls", inc: 20000, needs: 7 },
    { id: 9, x: 90, z: -100, cost: 1000000, label: "VIP Balcony", type: "balcony", inc: 55000, needs: 8 }
];

function begin() {
    document.getElementById('startMenu').style.display = 'none';
    document.getElementById('ui').style.display = 'block';
    init();
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x81ecec); 
    scene.fog = new THREE.FogExp2(0x81ecec, 0.002);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 5000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(100, 200, 100);
    scene.add(sun, new THREE.AmbientLight(0xffffff, 0.45));

    // Snowy Ocean base
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000), new THREE.MeshPhongMaterial({ color: 0xffffff }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    scene.add(ground);

    createIslands();
    createPlayer();
    
    // GPS Line
    gps = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1), new THREE.MeshBasicMaterial({ color: 0x55efc4, transparent: true, opacity: 0.8 }));
    scene.add(gps);

    refreshPads();
    update();
}

function createIslands() {
    const islandPos = [[0,0], [120, 20], [90, -100], [-180, 60]];
    islandPos.forEach(p => {
        const isl = new THREE.Mesh(new THREE.CylinderGeometry(60, 70, 2, 32), new THREE.MeshPhongMaterial({color: 0xdaeaf6}));
        isl.position.set(p[0], 0, p[1]);
        scene.add(isl);
    });
}

function createPlayer() {
    player = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.8, 1.2), new THREE.MeshPhongMaterial({color: 0x0984e3}));
    body.position.y = 1.4;
    player.add(body);
    scene.add(player);
}

function spawnObject(s) {
    const group = new THREE.Group();
    const stack = buildings.filter(b => b.x === s.x && b.z === s.z).length;
    let mesh;

    // BUILDING COLORS (Non-White for visibility)
    if (s.type === "floor") mesh = new THREE.Mesh(new THREE.BoxGeometry(40, 1, 40), new THREE.MeshPhongMaterial({color: 0x2c3e50})); // Dark Slate
    else if (s.type === "bridge") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(130, 1.5, 18), new THREE.MeshPhongMaterial({color: 0x784212})); // Cedar Wood
        mesh.position.set(-50, 0, 5); 
    } else if (s.type === "walls") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(36, 15, 36), new THREE.MeshPhongMaterial({color: 0x784212})); // Cedar Wood
        mesh.position.y = 7.5 + (stack * 15) - 15;
    } else if (s.type === "balcony") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(50, 2, 50), new THREE.MeshPhongMaterial({color: 0x212f3d})); // Charcoal
        mesh.position.y = (stack * 15) - 15;
    } else if (s.type === "roof") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(42, 5, 42), new THREE.MeshPhongMaterial({color: 0xb03a2e})); // Crimson Red
        mesh.position.y = (stack * 15) + 3;
    } else if (s.type === "vehicle") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 14), new THREE.MeshPhongMaterial({color: 0xf1c40f})); // Yellow
        mesh.position.y = 2;
    }

    if(mesh) {
        group.add(mesh);
        group.position.set(s.x, 0.5, s.z);
        group.scale.set(0.01, 0.01, 0.01);
        scene.add(group);
        s.obj = group;
        buildings.push(s);
    }
}

function update() {
    requestAnimationFrame(update);
    
    // SMOOTH MOVEMENT
    let targetSpeed = 0;
    if (keys['w'] || keys['arrowup']) targetSpeed = isDriving ? 2.5 : 0.85;
    else if (keys['s'] || keys['arrowdown']) targetSpeed = isDriving ? -1.5 : -0.5;
    
    currentSpeed += (targetSpeed - currentSpeed) * 0.12; 
    player.translateZ(-currentSpeed);

    if (keys['a'] || keys['arrowleft']) player.rotation.y += 0.06;
    if (keys['d'] || keys['arrowright']) player.rotation.y -= 0.06;

    // CAMERA
    let targetCamPos = new THREE.Vector3(player.position.x, player.position.y + 45, player.position.z + 65);
    camera.position.lerp(targetCamPos, 0.15); 
    camera.lookAt(player.position);

    // Build Animations
    buildSteps.forEach(s => { if(s.obj && s.obj.scale.x < 1) s.obj.scale.lerp(new THREE.Vector3(1,1,1), 0.1); });

    // GPS LINE
    if (activePad) {
        let dx = activePad.position.x - player.position.x;
        let dz = activePad.position.z - player.position.z;
        let dist = Math.sqrt(dx*dx + dz*dz);
        
        gps.position.set(player.position.x + dx/2, 0.6, player.position.z + dz/2);
        gps.scale.set(1.5, 1, dist); 
        gps.lookAt(activePad.position);
        gps.visible = true;

        activePad.rotation.y += 0.04;

        if (dist < 7 && wallet >= activePad.data.cost) {
            wallet -= activePad.data.cost; activePad.data.bought = true;
            income += activePad.data.inc;
            spawnObject(activePad.data);
            if(activePad.data.type === "vehicle") { 
                isDriving = true; 
                camera.fov = 95; 
                camera.updateProjectionMatrix(); 
            }
            refreshPads();
        }
    } else gps.visible = false;

    renderer.render(scene, camera);
    document.getElementById('wallet').innerText = Math.floor(wallet);
    document.getElementById('inc').innerText = income;
}

function refreshPads() {
    scene.children.filter(c => c.isPad).forEach(p => scene.remove(p));
    const next = buildSteps.find(s => !s.bought && (!s.needs || buildSteps.find(x => x.id === s.needs).bought));
    if (next) {
        activePad = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 1, 32), new THREE.MeshPhongMaterial({ color: 0x00cec9, emissive: 0x004444 }));
        activePad.position.set(next.x, 0.2, next.z);
        activePad.isPad = true; activePad.data = next;
        scene.add(activePad);
        document.getElementById('zoneInfo').innerText = `NEXT: ${next.label} ($${next.cost})`;
    }
}

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// AUTO COLLECT LOOP
setInterval(() => { wallet += income; }, 1000);
