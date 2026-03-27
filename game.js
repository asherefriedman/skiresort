/* 3D SKI RESORT PRO - MODEL LOADING & TEXTURES */
let scene, camera, renderer, player, money = 150, income = 0;
let activePad = null, gpsPath = null, npcs = [];
let modelLoader, textureLoader;
const keys = {};

// Building Data (Uses new modelNames)
const buildSteps = [
    { id: 1, x: 0, z: -10, cost: 0, label: "Lodge Foundation", type: "floor", model: "lodge_base", bought: false, unlocked: true, inc: 5 },
    { id: 2, x: 0, z: -10, cost: 100, label: "Lodge Windows & Walls", type: "walls", model: "lodge_walls", bought: false, unlocked: false, inc: 10, needs: 1 },
    { id: 3, x: 0, z: -10, cost: 500, label: "Red Lodge Roof", type: "roof", model: "lodge_roof", bought: false, unlocked: false, inc: 20, needs: 2 },
    
    /* CAFE WITH SIGN */
    { id: 4, x: 40, z: -15, cost: 1000, label: "Cocoa Cafe Foundation", type: "floor", model: "cafe_base", bought: false, unlocked: false, inc: 50, needs: 3 },
    { id: 5, x: 40, z: -15, cost: 2500, label: "Cafe Structure & Windows", type: "walls", model: "cafe_walls", bought: false, unlocked: false, inc: 100, needs: 4 },
    { id: 6, x: 40, z: -15, cost: 5000, label: "Main Cafe SIGN", type: "sign", model: "cafe_sign", bought: false, unlocked: false, inc: 200, needs: 5 }
];

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x81ecec);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('gameScreen').appendChild(renderer.domElement);

    // Initializing the Loaders
    modelLoader = new THREE.GLTFLoader();
    textureLoader = new THREE.TextureLoader();

    // Soft Ambient Light and a strong directional sun
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(50, 100, 50);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    // REALISTIC SNOW GROUND (Requires snow_texture.jpg)
    const snowTex = textureLoader.load('snow_texture.jpg');
    snowTex.wrapS = THREE.RepeatWrapping;
    snowTex.wrapT = THREE.RepeatWrapping;
    snowTex.repeat.set(50, 50);

    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(2000, 2000),
        new THREE.MeshStandardMaterial({ map: snowTex }) 
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    loadPlayer();
    loadNPCs();
    refreshPads();
    update();
}

function loadPlayer() {
    // We create a dummy box initially, then replace it with the loaded model
    const pGeo = new THREE.BoxGeometry(1.5, 3, 1.5);
    const pMat = new THREE.MeshPhongMaterial({ visible: false }); // Box is invisible
    player = new THREE.Mesh(pGeo, pMat);
    player.position.y = 1.5;
    scene.add(player);

    // Requires player_skier.glb
    modelLoader.load('player_skier.glb', (gltf) => {
        gltf.scene.scale.set(1.5, 1.5, 1.5);
        player.add(gltf.scene); // Attach model to the invisible player physics box
    });
}

function loadNPCs() {
    // Requires npcs_skier.glb
    for (let i = 0; i < 6; i++) {
        modelLoader.load('npcs_skier.glb', (gltf) => {
            const npc = gltf.scene;
            npc.position.set(Math.random() * 80 - 40, 0, Math.random() * 80 - 40);
            npc.userData = { tx: npc.position.x, tz: npc.position.z };
            scene.add(npc);
            npcs.push(npc);
        });
    }
}

function spawnObject(s) {
    // Instead of Geometry, we load the specific 3D model named in buildSteps
    // Requires model files: lodge_base.glb, lodge_walls.glb, lodge_roof.glb, cafe_sign.glb
    modelLoader.load(`${s.model}.glb`, (gltf) => {
        const mesh = gltf.scene;
        mesh.position.set(s.x, 0, s.z); // Most models rest at 0 height
        mesh.scale.set(1.5, 1.5, 1.5);
        
        // Recolor Roofs if they are labeled 'roof' type (requires model to have named material)
        if (s.type === 'roof') {
            mesh.traverse((o) => {
                if (o.isMesh && o.material.name.includes('RoofMat')) {
                    o.material.color.set(0xa52a2a); // Deep Cherry Red
                }
            });
        }
        
        scene.add(mesh);
    });
}

// ... All other functions (refreshPads, update, keys) remain the same ...
// IMPORTANT: Add this logic inside update() for NPCs

function update() {
    // ... Existing Player movement, GPS Line, collision logic ...
    npcs.forEach(n => {
        if (Math.abs(n.position.x - n.userData.tx) < 1) {
            n.userData.tx = n.position.x + (Math.random() * 50 - 25);
            n.userData.tz = n.position.z + (Math.random() * 50 - 25);
        }
        n.position.x += (n.userData.tx - n.position.x) * 0.005;
        n.position.z += (n.userData.tz - n.position.z) * 0.005;
        n.lookAt(n.userData.tx, 0, n.userData.tz); // Skier faces direction they are moving
    });
    // ... existing render calls ...
}
