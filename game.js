let scene, camera, renderer, player, money = 100, income = 0;
let activePad = null, gpsLine = null;
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

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshPhongMaterial({ color: 0xbbdefb }));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    player = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 1.2), new THREE.MeshPhongMaterial({ color: 0xff7675 }));
    player.position.y = 1;
    scene.add(player);

    const lineMat = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    gpsLine = new THREE.Line(lineGeo, lineMat);
    scene.add(gpsLine);

    refreshPads();
    update();
}

function refreshPads() {
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
        document.getElementById('zoneDisplay').innerText = "Next: " + next.label + " ($" + next.cost + ")";
    } else {
        activePad = null;
        document.getElementById('zoneDisplay').innerText = "All Built!";
    }
}

function spawnObject(step) {
    let geo, mat, mesh;
    if (step.type === "floor") { geo = new THREE.BoxGeometry(10, 0.5, 10); mat = new THREE.MeshPhongMaterial({ color: 0x95a5a6 }); }
    else if (step.type === "walls") { geo = new THREE.BoxGeometry(9.5, 6, 9.5); mat = new THREE.MeshPhongMaterial({ color: 0x5d4037 }); }
    else if (step.type === "roof") { geo = new THREE.ConeGeometry(8, 5, 4); mat = new THREE.MeshPhongMaterial({ color: 0xffffff }); }
    mesh = new THREE.Mesh(geo, mat);
    let y = (step.type === "floor" ? 0.25 : step.type === "walls" ? 3 : 8.5);
    mesh.position.set(step.x, y, step.z);
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
    if (activePad) {
        gpsLine.geometry.setFromPoints([new THREE.Vector3(player.position.x, 0.2, player.position.z), new THREE.Vector3(activePad.position.x, 0.2, activePad.position.z)]);
        let dist = player.position.distanceTo(new THREE.Vector3(activePad.position.x, 1, activePad.position.z));
        let s = activePad.stepData;
        if (dist < 2.5 && money >= s.cost) {
            money -= s.cost; s.bought = true; income += s.inc;
            spawnObject(s);
            let n = buildSteps.find(item => item.needs === s.id);
            if (n) n.unlocked = true;
            refreshPads();
        }
    }
    renderer.render(scene, camera);
    document.getElementById('moneyDisplay').innerText = Math.floor(money);
    document.getElementById('incomeDisplay').innerText = income;
}

window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

document.getElementById('guestPlay').onclick = function() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    init();
};

setInterval(() => { money += income; }, 1000);
