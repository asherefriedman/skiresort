// Add this at the VERY TOP of your game.js to kill the "Loading" text immediately
window.onload = () => {
    const hint = document.getElementById('hint');
    if (hint) hint.innerText = "Click Start to Begin!";
};

let scene, camera, renderer, player, wallet = 200, income = 0;
let activePad = null, gps, isJumping = false, yVel = 0;
let moveSpeed = 0;
const keys = {}, buildings = [];

const buildSteps = [
    { id: 1, x: 0, z: 0, cost: 0, label: "Lobby Foundation", type: "floor", mat: 0x95a5a6, inc: 5, w: 40, d: 40 },
    { id: 2, x: 12, z: 8, cost: 100, label: "Reception Desk", type: "furniture", mat: 0x34495e, inc: 8, w: 10, d: 3, needs: 1 }
];

function startGame() {
    console.log("Game Starting...");
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gui').style.display = 'block';
    init();
}

function init() {
    try {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0fbcf9);
        camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        const light = new THREE.AmbientLight(0xffffff, 1);
        scene.add(light);

        player = new THREE.Group();
        const pMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), new THREE.MeshBasicMaterial({color: 0xff0000}));
        player.add(pMesh);
        scene.add(player);
        player.position.set(0, 2, 20);

        // Force item 1
        buildSteps[0].bought = true;
        spawnObject(buildSteps[0]);
        
        refreshPads();
        animate();
    } catch (e) {
        console.error("Three.js failed to load:", e);
        alert("3D Engine Error. Check your internet connection.");
    }
}

function spawnObject(s) {
    const geo = new THREE.BoxGeometry(s.w, 1, s.d);
    const mat = new THREE.MeshStandardMaterial({color: s.mat});
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(s.x, 0, s.z);
    scene.add(mesh);
    s.obj = mesh;
    buildings.push(s);
}

function animate() {
    requestAnimationFrame(animate);
    const offset = new THREE.Vector3(0, 10, 20).applyMatrix4(player.matrixWorld);
    camera.position.lerp(offset, 0.1);
    camera.lookAt(player.position);
    renderer.render(scene, camera);
}

function refreshPads() {
    const next = buildSteps.find(s => !s.bought);
    const hint = document.getElementById('hint');
    if (next) {
        hint.innerText = `Next: ${next.label} ($${next.cost})`;
    } else {
        hint.innerText = "All Built!";
    }
}
