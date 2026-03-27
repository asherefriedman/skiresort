/* 3D SKI RESORT - GPS PATH & COST DISPLAY */
let scene, camera, renderer, player, money = 100, income = 0;
let activePad = null, gpsLine = null, costLabel = null;
const keys = {};

const buildSteps = [
    { id: 1, x: 0, z: -10, cost: 0, label: "Lodge Floor", type: "floor", bought: false, unlocked: true, inc: 5, needs: 0 },
    { id: 2, x: 0, z: -10, cost: 50, label: "Lodge Walls", type: "walls", bought: false, unlocked: false, inc: 10, needs: 1 },
    { id: 3, x: 0, z: -10, cost: 250, label: "Lodge Roof", type: "roof", bought: false, unlocked: false, inc: 20, needs: 2 },
    { id: 4, x: 25, z: -25, cost: 1000, label: "Cocoa Shop", type: "floor", bought: false, unlocked: false, inc: 100, needs: 3 }
];

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x81ecec); 

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('gameScreen').appendChild(renderer.domElement);

    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(10, 20, 10);
    scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    // ICY BLUE GROUND
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(2000, 2000),
        new THREE.MeshPhongMaterial({ color: 0xbbdefb }) // Clear Ice Blue
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    function addTrees() {
    for (let i = 0; i < 100; i++) {
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.2, 1);
        const trunkMat = new THREE.MeshPhongMaterial({ color: 0x5d4037 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);

        const leavesGeo = new THREE.ConeGeometry(1.5, 4, 8);
        const leavesMat = new THREE.MeshPhongMaterial({ color: 0x27ae60 });
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        
        leaves.position.y = 2.5;
        const tree = new THREE.Group();
        tree.add(trunk);
        tree.add(leaves);

        // Randomly scatter trees
        tree.position.set(
            Math.random() * 400 - 200, 
            0.5, 
            Math.random() * 400 - 200
        );
        scene.add(tree);
    }
}
addTrees(); // Call this in init()

    // PLAYER
    player = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 1.2), new THREE.MeshPhongMaterial({ color: 0xff7675 }));
    player.position.y = 1;
    scene.add(player);

    // GPS LINE SETUP
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 5 });
    const points = [new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0)];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    gpsLine = new THREE.Line(lineGeo, lineMat);
    scene.add(gpsLine);

    refreshPads();
    update();

    function init() {
    // ... (your existing light, ground, and player code) ...

    // ADD THESE TWO LINES:
    addForest();
    addMountains();

    refreshPads();
    update();
}
}

function refreshPads() {
    // Clean up old pads
    scene.children.filter(c => c.isPad).forEach(p => scene.remove(p));

    const next = buildSteps.find(s => s.unlocked && !s.bought);
    if (next) {
        const padGeo = new THREE.CylinderGeometry(2, 2, 0.2, 32);
        const padMat = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        activePad = new THREE.Mesh(padGeo, padMat);
        activePad.position.set(next.x, 0.1, next.z);
        activePad.isPad = true;
        activePad.stepData = next;
        scene.add(activePad);
        
        // Show cost in HUD or console (3D Text is complex, so we'll use a dynamic HUD)
        document.getElementById('zoneDisplay').innerText = `Next: ${next.label} ($${next.cost})`;
    } else {
        activePad = null;
        document.getElementById('zoneDisplay').innerText = "All Built!";
    }
}

function spawnObject(step) {
    let geo, mat, mesh;
    if (step.type === "floor") {
        geo = new THREE.BoxGeometry(10, 0.5, 10);
        mat = new THREE.MeshPhongMaterial({ color: 0x95a5a6 });
    } else if (step.type === "walls") {
        geo = new THREE.BoxGeometry(9.5, 6, 9.5);
        mat = new THREE.MeshPhongMaterial({ color: 0x5d4037 });
    } else if (step.type === "roof") {
        geo = new THREE.ConeGeometry(8, 5, 4);
        mat = new THREE.MeshPhongMaterial({ color: 0xffffff }); // Snowy White
    }
    mesh = new THREE.Mesh(geo, mat);
    let yPos = (step.type === "floor" ? 0.25 : step.type === "walls" ? 3 : 8.5);
    mesh.position.set(step.x, yPos, step.z);
    if (step.type === "roof") mesh.rotation.y = Math.PI / 4;
    scene.add(mesh);
}

function update() {
    requestAnimationFrame(update);
    const speed = 0.25;
    if (keys['w']) player.position.z -= speed;
    if (keys['s']) player.position.z += speed;
    if (keys['a']) player.position.x -= speed;
    if (keys['d']) player.position.x += speed;

    camera.position.set(player.position.x, player.position.y + 18, player.position.z + 18);
    camera.lookAt(player.position);

    // UPDATE GPS LINE
    if (activePad) {
        const points = [];
        points.push(new THREE.Vector3(player.position.x, 0.2, player.position.z));
        points.push(new THREE.Vector3(activePad.position.x, 0.2, activePad.position.z));
        gpsLine.geometry.setFromPoints(points);
        gpsLine.visible = true;

        // Check Collision
        let dist = player.position.distanceTo(new THREE.Vector3(activePad.position.x, 1, activePad.position.z));
        let step = activePad.stepData;
        if (dist < 2.5 && money >= step.cost) {
            money -= step.cost;
            step.bought = true;
            income += step.inc;
            spawnObject(step);
            let n = buildSteps.find(item => item.needs === step.id);
            if (n) n.unlocked =

/* --- ENVIRONMENT GENERATOR --- */

function addForest() {
    // Create 150 trees scattered around
    for (let i = 0; i < 150; i++) {
        // Random Position
        const rx = Math.random() * 800 - 400;
        const rz = Math.random() * 800 - 400;

        // Don't spawn trees too close to the starting lodge (0,0)
        if (Math.abs(rx) < 15 && Math.abs(rz) < 15) continue;

        // Tree Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 1.5);
        const trunkMat = new THREE.MeshPhongMaterial({ color: 0x4e342e });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);

        // Snowy Leaves (Cone)
        const leavesGeo = new THREE.ConeGeometry(2, 5, 6);
        const leavesMat = new THREE.MeshPhongMaterial({ color: 0x2d6a4f });
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.y = 3;

        // Add a "Snow Cap" to the tree
        const snowCapGeo = new THREE.ConeGeometry(1, 2, 6);
        const snowCapMat = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const snowCap = new THREE.Mesh(snowCapGeo, snowCapMat);
        snowCap.position.y = 4.5;

        const treeGroup = new THREE.Group();
        treeGroup.add(trunk);
        treeGroup.add(leaves);
        treeGroup.add(snowCap);
        
        treeGroup.position.set(rx, 0.75, rz);
        // Random scale so trees aren't all the same size
        const s = 0.5 + Math.random();
        treeGroup.scale.set(s, s, s);
        
        scene.add(treeGroup);
    }
}

function addMountains() {
    // Create big distant peaks
    for (let i = 0; i < 8; i++) {
        const mGeo = new THREE.ConeGeometry(80, 150, 4);
        const mMat = new THREE.MeshPhongMaterial({ color: 0xd1d8e0 });
        const mountain = new THREE.Mesh(mGeo, mMat);
        
        // Place them far away in a circle
        const angle = (i / 8) * Math.PI * 2;
        const dist = 400;
        mountain.position.set(
            Math.cos(angle) * dist,
            40, // Half height so base is underground
            Math.sin(angle) * dist
        );
        mountain.rotation.y = Math.random() * Math.PI;
        scene.add(mountain);
    }
}
