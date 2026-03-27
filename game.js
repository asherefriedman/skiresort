let scene, camera, renderer, player, wallet = 150, income = 0;
let activePad = null, gps, isDriving = false;
let currentSpeed = 0; 
const keys = {}, buildings = [];

// NEW PROGRESSION: Mega Resort -> Ski Expansion
const buildSteps = [
    // ZONE 1: THE TROPICAL MEGA HOTEL
    { id: 1, x: 0, z: 0, cost: 0, label: "Hotel Foundation", type: "floor", mat: "concrete", inc: 20 },
    { id: 2, x: 0, z: 0, cost: 400, label: "Lobby Walls", type: "walls", mat: "glass", inc: 50, needs: 1 },
    { id: 3, x: 0, z: 0, cost: 1500, label: "Luxury Roof", type: "roof", mat: "dark", inc: 120, needs: 2 },
    { id: 4, x: -60, z: 0, cost: 4000, label: "Mega Pool", type: "floor", mat: "water", inc: 200, needs: 3 },
    
    // ZONE 2: TRANSIT & BRIDGE
    { id: 5, x: 50, z: 15, cost: 10000, label: "Highway to Mountain", type: "bridge", mat: "road", inc: 500, needs: 4 },
    
    // ZONE 3: THE SKI RESORT EXPANSION
    { id: 6, x: 120, z: 20, cost: 25000, label: "Ski Lodge Base", type: "floor", mat: "wood", inc: 1500, needs: 5 },
    { id: 7, x: 120, z: 20, cost: 60000, label: "Lodge Walls", type: "walls", mat: "wood", inc: 3000, needs: 6 },
    { id: 8, x: 120, z: 20, cost: 120000, label: "Snow Roof", type: "roof", mat: "snow", inc: 6000, needs: 7 },
    
    // ZONE 4: VEHICLES
    { id: 9, x: 150, z: -10, cost: 300000, label: "Snowmobile Garage", type: "floor", mat: "concrete", inc: 10000, needs: 8 },
    { id: 10, x: 150, z: -10, cost: 750000, label: "Unlock Snowmobile", type: "vehicle", mat: "yellow", inc: 25000, needs: 9 }
];

function begin() {
    document.getElementById('startMenu').style.display = 'none';
    document.getElementById('ui').style.display = 'block';
    init();
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x74b9ff); // Bright clear sky
    scene.fog = new THREE.FogExp2(0x74b9ff, 0.002);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 5000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const sun = new THREE.DirectionalLight(0xffffff, 1.3);
    sun.position.set(100, 200, 100);
    scene.add(sun, new THREE.AmbientLight(0xffffff, 0.6));

    // Base Ocean / Under-layer (Deep down at Y = -2)
    const ocean = new THREE.Mesh(new THREE.PlaneGeometry(10000, 10000), new THREE.MeshPhongMaterial({ color: 0x0984e3 }));
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -2;
    scene.add(ocean);

    createZones();
    createPlayer();
    
    // THE FIXED GPS LINE: Will always float at waist height (Y = 1.0)
    gps = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.2, 1), new THREE.MeshBasicMaterial({ color: 0xffeaa7, transparent: true, opacity: 0.9 }));
    scene.add(gps);

    refreshPads();
    update();
}

function createZones() {
    // Zone 1: Lush Grass (Mega Hotel)
    const grass = new THREE.Mesh(new THREE.CylinderGeometry(80, 90, 2, 32), new THREE.MeshPhongMaterial({color: 0x55efc4}));
    grass.position.set(0, -1, 0); // Top face is at Y = 0
    scene.add(grass);

    // Zone 2: Snow Mountain Base (Ski Resort)
    const snow = new THREE.Mesh(new THREE.CylinderGeometry(100, 120, 2, 32), new THREE.MeshPhongMaterial({color: 0xffffff}));
    snow.position.set(130, -1, 10); // Top face is at Y = 0
    scene.add(snow);
}

function createPlayer() {
    player = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.8, 1.2), new THREE.MeshPhongMaterial({color: 0x2d3436}));
    body.position.y = 1.4; // Stands perfectly on Y = 0
    player.add(body);
    scene.add(player);
}

// Fixed Material Library
const materials = {
    concrete: new THREE.MeshPhongMaterial({color: 0x95a5a6}),
    glass: new THREE.MeshPhongMaterial({color: 0x81ecec, transparent: true, opacity: 0.7}),
    dark: new THREE.MeshPhongMaterial({color: 0x2d3436}),
    water: new THREE.MeshPhongMaterial({color: 0x0984e3}),
    road: new THREE.MeshPhongMaterial({color: 0x34495e}),
    wood: new THREE.MeshPhongMaterial({color: 0xd35400}),
    snow: new THREE.MeshPhongMaterial({color: 0xffffff}),
    yellow: new THREE.MeshPhongMaterial({color: 0xf1c40f})
};

function spawnObject(s) {
    const group = new THREE.Group();
    const stack = buildings.filter(b => b.x === s.x && b.z === s.z).length;
    let mesh;
    let mat = materials[s.mat];

    // ALL HEIGHTS FIXED: Added +0.5 to offset from the Y=0 ground.
    if (s.type === "floor") mesh = new THREE.Mesh(new THREE.BoxGeometry(40, 1, 40), mat);
    else if (s.type === "bridge") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(130, 1, 18), mat);
        mesh.position.set(-50, 0, 5); 
    } else if (s.type === "walls") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(36, 15, 36), mat);
        mesh.position.y = 8 + (stack * 15) - 15;
    } else if (s.type === "roof") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(42, 5, 42), mat);
        mesh.position.y = 3.5 + (stack * 15);
    } else if (s.type === "vehicle") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 14), mat);
        mesh.position.y = 2;
    }

    if(mesh) {
        if(s.type === "floor" || s.type === "bridge") mesh.position.y = 0.5; // Rest exactly on ground
        group.add(mesh);
        group.position.set(s.x, 0, s.z);
        group.scale.set(0.01, 0.01, 0.01);
        scene.add(group);
        s.obj = group;
        buildings.push(s);
    }
}

function update() {
    requestAnimationFrame(update);
    
    // Smooth Movement
    let targetSpeed = 0;
    if (keys['w'] || keys['arrowup']) targetSpeed = isDriving ? 2.5 : 0.85;
    else if (keys['s'] || keys['arrowdown']) targetSpeed = isDriving ? -1.5 : -0.5;
    
    currentSpeed += (targetSpeed - currentSpeed) * 0.12; 
    player.translateZ(-currentSpeed);

    if (keys['a'] || keys['arrowleft']) player.rotation.y += 0.06;
    if (keys['d'] || keys['arrowright']) player.rotation.y -= 0.06;

    // Camera
    let targetCamPos = new THREE.Vector3(player.position.x, player.position.y + 45, player.position.z + 65);
    camera.position.lerp(targetCamPos, 0.15); 
    camera.lookAt(player.position);

    buildSteps.forEach(s => { if(s.obj && s.obj.scale.x < 1) s.obj.scale.lerp(new THREE.Vector3(1,1,1), 0.1); });

    // PERFECTED GPS LINE & BUTTON FIX
    if (activePad) {
        let dx = activePad.position.x - player.position.x;
        let dz = activePad.position.z - player.position.z;
        let dist = Math.sqrt(dx*dx + dz*dz);
        
        // Line sits safely at Y = 1.0 (Waist height) so it never clips into grass
        gps.position.set(player.position.x + dx/2, 1.0, player.position.z + dz/2);
        gps.scale.set(1.5, 1, dist); 
        gps.lookAt(new THREE.Vector3(activePad.position.x, 1.0, activePad.position.z));
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
        // Pads are now at Y = 0.4 (Clearly sitting on top of the Y=0 ground)
        activePad = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 0.8, 32), new THREE.MeshPhongMaterial({ color: 0x27ae60, emissive: 0x004400 }));
        activePad.position.set(next.x, 0.4, next.z);
        activePad.isPad = true; activePad.data = next;
        scene.add(activePad);
        document.getElementById('zoneInfo').innerText = `NEXT: ${next.label} ($${next.cost})`;
    }
}

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

setInterval(() => { wallet += income; }, 1000);
