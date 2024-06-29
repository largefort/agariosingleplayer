const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playButton = document.getElementById('playButton');
const settingsButton = document.getElementById('settingsButton');
const customizeButton = document.getElementById('customizeButton');
const settingsModal = document.getElementById('settingsModal');
const customizeModal = document.getElementById('customizeModal');
const closeButtons = document.getElementsByClassName('close');
const bgColorInput = document.getElementById('bgColor');
const playerColorInput = document.getElementById('playerColor');
const applyCustomizationButton = document.getElementById('applyCustomization');

let playerColor = 'blue';

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Cell {
    constructor(x, y, radius, color, type = 'player') {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.type = type;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
    }

    isColliding(other) {
        const dist = Math.hypot(this.x - other.x, this.y - other.y);
        return dist < this.radius + other.radius;
    }
}

let player = new Cell(canvas.width / 2, canvas.height / 2, 20, playerColor);
const foods = [];
const enemies = [];
const powerUps = [];
let score = 0;

function generateGameObjects() {
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 5 + Math.random() * 10;
        const color = 'red';
        foods.push(new Cell(x, y, radius, color, 'food'));
    }

    for (let i = 0; i < 10; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 15 + Math.random() * 10;
        const color = 'green';
        enemies.push(new Cell(x, y, radius, color, 'enemy'));
    }

    for (let i = 0; i < 5; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = 10;
        const color = 'gold';
        powerUps.push(new Cell(x, y, radius, color, 'powerUp'));
    }
}

generateGameObjects();

let keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    delete keys[e.key];
});

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let dx = 0;
    let dy = 0;

    if (keys['ArrowUp'] || keys['w']) dy -= 2;
    if (keys['ArrowDown'] || keys['s']) dy += 2;
    if (keys['ArrowLeft'] || keys['a']) dx -= 2;
    if (keys['ArrowRight'] || keys['d']) dx += 2;

    player.move(dx, dy);
    player.draw();

    for (let i = 0; i < foods.length; i++) {
        const food = foods[i];
        food.draw();

        if (player.isColliding(food)) {
            player.radius += food.radius * 0.2;
            foods.splice(i, 1);
            score += 10;
            i--;
        }
    }

    for (let i = 0; i < powerUps.length; i++) {
        const powerUp = powerUps[i];
        powerUp.draw();

        if (player.isColliding(powerUp)) {
            player.radius *= 1.5;
            setTimeout(() => {
                player.radius /= 1.5;
            }, 5000);
            powerUps.splice(i, 1);
            score += 50;
            i--;
        }
    }

    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        enemy.draw();

        if (player.isColliding(enemy)) {
            if (player.radius > enemy.radius) {
                player.radius += enemy.radius * 0.2;
                enemies.splice(i, 1);
                score += 50;
                i--;
            } else {
                alert('Game Over! Your score: ' + score);
                document.location.reload();
                return;
            }
        } else {
            const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            enemy.move(Math.cos(angle) * 1, Math.sin(angle) * 1);
        }
    }

    document.getElementById('score').innerText = 'Score: ' + score;
    requestAnimationFrame(update);
}

// Virtual Joystick
const joystick = document.getElementById('joystick');
const stick = document.getElementById('stick');
let joystickActive = false;
let startX, startY;

joystick.addEventListener('touchstart', (e) => {
    joystickActive = true;
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
});

joystick.addEventListener('touchmove', (e) => {
    if (!joystickActive) return;

    const touch = e.touches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;

    const distance = Math.hypot(dx, dy);
    const maxDistance = 50;

    if (distance > maxDistance) {
        const angle = Math.atan2(dy, dx);
        startX += maxDistance * Math.cos(angle);
        startY += maxDistance * Math.sin(angle);
    } else {
        startX = touch.clientX;
        startY = touch.clientY;
    }

    stick.style.transform = `translate(${dx}px, ${dy}px)`;

    player.move(dx * 0.05, dy * 0.05);
});

joystick.addEventListener('touchend', () => {
    joystickActive = false;
    stick.style.transform = 'translate(-50%, -50%)';
});

// Show/Hide Title Screen and Game
function showTitleScreen() {
    document.getElementById('titleScreen').style.display = 'block';
    canvas.style.display = 'none';
    document.getElementById('controls').style.display = 'none';
    document.getElementById('score').style.display = 'none';
    document.getElementById('joystick').style.display = 'none';
}

function startGame() {
    document.getElementById('titleScreen').style.display = 'none';
    canvas.style.display = 'block';
    document.getElementById('controls').style.display = 'block';
    document.getElementById('score').style.display = 'block';
    document.getElementById('joystick').style.display = 'block';
    update();
}

// Event Listeners for Title Screen Buttons
playButton.addEventListener('click', startGame);

settingsButton.addEventListener('click', () => {
    settingsModal.style.display = 'block';
});

customizeButton.addEventListener('click', () => {
    customizeModal.style.display = 'block';
});

// Event Listeners for Modals
Array.from(closeButtons).forEach(button => {
    button.addEventListener('click', () => {
        settingsModal.style.display = 'none';
        customizeModal.style.display = 'none';
    });
});

applyCustomizationButton.addEventListener('click', () => {
    playerColor = playerColorInput.value;
    player.color = playerColor;
    customizeModal.style.display = 'none';
});

bgColorInput.addEventListener('change', () => {
    canvas.style.backgroundColor = bgColorInput.value;
});

window.addEventListener('click', (e) => {
    if (e.target == settingsModal) {
        settingsModal.style.display = 'none';
    }
    if (e.target == customizeModal) {
        customizeModal.style.display = 'none';
    }
});

showTitleScreen();
