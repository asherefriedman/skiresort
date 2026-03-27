let scene, camera, renderer, player, wallet = 150, banked = 0, income = 0;
let activePad = null, gps, isDriving = false, safePad;
const keys = {}, buildings = [];

const buildSteps = [
    // ISLAND 1: STARTER
    { id: 1, x: 0, z: 0, cost: 0, label: "Lodge Base", type: "floor", inc: 20 },
    { id: 2, x: 0, z: 0, cost: 400, label: "Lodge Walls", type: "walls", inc: 45, needs: 1 },
    { id: 3, x: 0, z: 0, cost: 1500, label: "Blue Slate Roof", type: "roof", inc: 100, needs: 2 },
    { id: 4, x: 45, z: 15, cost: 6000, label: "Island Bridge", type: "bridge", inc: 200, needs: 3 },
    
    // ISLAND 2: THE GARAGE & VEHICLE
    { id: 5, x: 110, z: 20, cost: 20000, label: "Vehicle Bay", type: "floor", inc: 800, needs: 4 },
    { id: 6, x: 110, z: 20, cost: 50000, label: "Snowmobile", type: "vehicle", inc: 2000, needs: 5 },
    
    // ISLAND 3: THE SKI HOTEL
    { id: 7, x: 80, z: -100, cost: 150000, label: "Hotel Plaza", type: "floor", inc: 8000, needs: 6 },
    { id: 8, x: 80, z: -100, cost: 400000, label: "Hotel Level 1", type: "walls", inc: 20000, needs: 7 },
    { id: 9, x: 80, z: -100, cost: 1000000, label: "VIP Balcony", type: "balcony", inc: 50000, needs: 8 }
];

function begin() {
    document.getElementById('startMenu').style.display = 'none';
    document.getElementById('ui').style.display = 'block';
    init();
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa29bfe); 
    scene.fog = new THREE.FogExp2(0xa29bfe, 0.002);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 4000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const sun = new THREE.DirectionalLight(0xffffff, 1.6);
    sun.position.set(100, 200, 100);
    scene.add(sun, new THREE.AmbientLight(0xffffff, 0.4));

    // Snowy Water/Ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(8000, 8000), new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 80 }));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    createIslands();
    createPlayer();
    
    // THE SAFE (TRT2 Style Money Collector)
    safePad = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 8), new THREE.MeshPhongMaterial({ color: 0xf1c40f, emissive: 0x333300 }));
    safePad.position.set(-15, 0.1, 10);
    scene.add(safePad);

    gps = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.2, 1.5), new THREE.MeshBasicMaterial({ color: 0x55efc4, transparent: true, opacity: 0.6 }));
    scene.add(gps);

    refreshPads();
    update();
}

function createIslands() {
    const islandPos = [[0,0], [110, 20], [80, -100], [-150, 50]];
    islandPos.forEach(p => {
        const isl = new THREE.Mesh(new THREE.CylinderGeometry(55, 65, 8, 32), new THREE.MeshPhongMaterial({color: 0xdaeaf6}));
        isl.position.set(p[0], -4.1, p[1]);
        scene.add(isl);
    });
}

function createPlayer() {
    player = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.8, 1), new THREE.MeshPhongMaterial({color: 0x0984e3}));
    body.position.y = 1.4;
    player.add(body);
    scene.add(player);
}

function spawnObject(s) {
    const group = new THREE.Group();
    const stack = buildings.filter(b => b.x === s.x && b.z === s.z).length;
    let mesh;

    if (s.type === "floor") mesh = new THREE.Mesh(new THREE.BoxGeometry(40, 1, 40), new THREE.MeshPhongMaterial({color: 0xecf0f1}));
    else if (s.type === "bridge") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(120, 1.2, 15), new THREE.MeshPhongMaterial({color: 0xffffff}));
        mesh.position.set(-45, 0, 5); 
    } else if (s.type === "walls") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(36, 15, 36), new THREE.MeshPhongMaterial({color: 0xffffff}));
        mesh.position.y = 7.5 + (stack * 15) - 15;
    } else if (s.type === "balcony") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(50, 2, 50), new THREE.MeshPhongMaterial({color: 0x2d3436}));
        mesh.position.y = (stack * 15) - 15;
    } else if (s.type === "roof") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(42, 4, 42), new THREE.MeshPhongMaterial({color: 0x0984e3}));
        mesh.position.y = (stack * 15) + 3;
    } else if (s.type === "vehicle") {
        mesh = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 14), new THREE.MeshPhongMaterial({color: 0xf1c40f}));
        mesh.position.y = 2;
    }

    if(mesh) {
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
    
    let speed = isDriving ? 1.8 : 0.7;
    if (keys['w']) player.translateZ(-speed);
    if (keys['s']) player.translateZ(speed);
    if (keys['a']) player.rotation.y += 0.05;
    if (keys['d']) player.rotation.y -= 0.05;

    camera.position.set(player.position.x, player.position.y + 50, player.position.z + 65);
    camera.lookAt(player.position);

    // TRT2 Pop Animation
    buildSteps.forEach(s => { if(s.obj && s.obj.scale.x < 1) s.obj.scale.lerp(new THREE.Vector3(1,1,1), 0.08); });

    // Safe Collection Logic
    if(player.position.distanceTo(safePad.position) < 6) {
        wallet += banked;
        banked = 0;
        safePad.scale.set(1.2, 1, 1.2);
    } else safePad.scale.lerp(new THREE.Vector3(1,1,1), 0.1);

    if (activePad) {
        let d = player.position.distanceTo(activePad.position);
        gps.position.set(player.position.x + (activePad.position.x - player.position.x)/2, 0.6, player.position.z + (activePad.position.z - player.position.z)/2);
        gps.scale.set(5, 1, d);
        gps.lookAt(activePad.position);
        activePad.rotation.y += 0.04;

        if (d < 7 && wallet >= activePad.data.cost) {
            wallet -= activePad.data.cost; activePad.data.bought = true;
            income += activePad.data.inc;
            spawnObject(activePad.data);
            if(activePad.data.type === "vehicle") { isDriving = true; camera.fov = 90; camera.updateProjectionMatrix(); }
            refreshPads();
        }
    }

    renderer.render(scene, camera);
    document.getElementById('wallet').innerText = Math.floor(wallet);
    document.getElementById('banked').innerText = Math.floor(banked);
}

function refreshPads() {
    scene.children.filter(c => c.isPad).forEach(p => scene.remove(p));
    const next = buildSteps.find(s => !s.bought && (!s.needs || buildSteps.find(x => x.id === s.needs).bought));
    if (next) {
        activePad = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 1, 32), new THREE.MeshPhongMaterial({ color: 0x00cec9, emissive: 0x004444 }));
        activePad.position.set(next.x, 0.1, next.z);
        activePad.isPad = true; activePad.data = next;
        scene.add(activePad);
        document.getElementById('zoneInfo').innerText = `NEXT: ${next.label} ($${next.cost})`;
    }
}

window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
setInterval(() => { banked += (income/5); }, 200);
