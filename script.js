const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Cell {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
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
    }
}

const player = new Cell(canvas.width / 2, canvas.height / 2, 20, 'blue');
const foods = [];

for (let i = 0; i < 100; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = 5 + Math.random() * 10;
    const color = 'red';
    foods.push(new Cell(x, y, radius, color));
}

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

        const dist = Math.hypot(player.x - food.x, player.y - food.y);
        if (dist - player.radius - food.radius < 1) {
            player.radius += food.radius * 0.2;
            foods.splice(i, 1);
            i--;
        }
    }

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

update();
