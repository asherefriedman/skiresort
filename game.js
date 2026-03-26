// Variables declared at the top so they work everywhere
let canvas, ctx;
let money = 0;
let player = { x: 50, y: 50, size: 30 };

window.onload = function() {
    console.log("Page loaded...");

    // Setup Canvas
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        alert("Canvas not found!");
        return;
    }
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Setup Button
    const btn = document.getElementById('guestPlay');
    if (btn) {
        btn.onclick = function() {
            console.log("Button clicked!");
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('gameScreen').style.display = 'block';
            
            // Start the loop ONLY after clicking the button
            requestAnimationFrame(mainLoop);
        };
    } else {
        alert("Guest button not found in HTML!");
    }
};

// Movement
const keys = {};
document.onkeydown = (e) => keys[e.key] = true;
document.onkeyup = (e) => keys[e.key] = false;

function mainLoop() {
    // 1. Move Player
    if (keys['ArrowRight']) player.x += 5;
    if (keys['ArrowLeft']) player.x -= 5;
    if (keys['ArrowUp']) player.y -= 5;
    if (keys['ArrowDown']) player.y += 5;

    // 2. Clear Screen (Draw Snow)
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. Draw a Tree (Just a green box for now to test)
    ctx.fillStyle = "green";
    ctx.fillRect(200, 200, 50, 80);

    // 4. Draw Player (Red box)
    ctx.fillStyle = "red";
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // 5. Update Money UI
    const mDisplay = document.getElementById('moneyDisplay');
    if (mDisplay) mDisplay.innerText = money;

    requestAnimationFrame(mainLoop);
}
