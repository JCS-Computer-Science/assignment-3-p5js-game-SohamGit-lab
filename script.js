let bird;
let pipes = [];
let score = 0;
let gameOver = false;
let img;
let img2;
let showHitbox = false;
let highScore = 0;

// Game States: "START", "MENU", "PLAY"
let state = "START";

function preload() {
    img = loadImage('/dragon.gif');
    img2 = loadImage('/long.jpg');
}

function setup() {
    createCanvas(1900, 1000);
    bird = new Bird();
    pipes.push(new Pipe());
}

function draw() {
    // 1. Draw Background first for all states
    imageMode(CORNER);
    background(0);
    image(img2, 0, 0, width, height);

    // 2. Handle States
    if (state === "START") {
        drawStartScreen();
    }
    else if (state === "MENU") {
        drawMenuScreen();
    }
    else if (state === "PLAY") {
        runGameplay();
    }
}

// --- SCREEN RENDERING FUNCTIONS ---

function drawStartScreen() {
    fill(0, 0, 0, 150); // Dark overlay
    rect(0, 0, width, height);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(80);
    text("MY COOL DRAGON GAME", width / 2, height / 3);

    textSize(30);
    text("Click Anywhere to Enter Main Menu", width / 2, height / 2 + 50);
}

function drawMenuScreen() {
    fill(0, 0, 0, 100);
    rect(0, 0, width, height);

    textAlign(CENTER, CENTER);
    fill(255);
    textSize(60);
    text("MAIN MENU", width / 2, 250);

    textSize(25);
    text("High Score: " + highScore, width / 2, 350);

    // Draw Menu Button
    drawButton(width / 2 - 200, 480, 400, 80, "START GAME", color(50, 150, 50));
}

function drawButton(x, y, w, h, label, btnColor) {
    fill(btnColor);
    rect(x, y, w, h, 10);
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    text(label, x + w / 2, y + h / 2);
}

// --- CORE GAMEPLAY Loop ---

function runGameplay() {
    imageMode(CENTER);

    if (!gameOver) {
        if (score > highScore) {
            highScore = score;
        }

        fill(255);
        textSize(40);
        textAlign(LEFT, TOP);
        text("Score: " + score, 50, 40);
        text("Best: " + highScore, 50, 90);

        // Bird
        bird.update();
        bird.show();

        // Pipes spawning
        if (pipes.length === 0 || pipes[pipes.length - 1].x < width - 700) {
            pipes.push(new Pipe());
        }

        for (let i = pipes.length - 1; i >= 0; i--) {
            pipes[i].update();
            pipes[i].show();

            // Collision
            if (pipes[i].hits(bird)) {
                gameOver = true;
            }

            // Score logic
            if (!pipes[i].passed && pipes[i].x < bird.x) {
                score++;
                pipes[i].passed = true;
            }

            if (pipes[i].offscreen()) {
                pipes.splice(i, 1);
            }
        }
    }
    else {
        // Game Over Overlay
        fill(0, 0, 0, 150);
        rect(0, 0, width, height);

        fill(255, 50, 50);
        textSize(60);
        textAlign(CENTER, CENTER);
        text("GAME OVER", width / 2, height / 2 - 50);

        drawButton(width / 2 - 250, height / 2 + 50, 240, 60, "PLAY AGAIN", color(50, 150, 50));
        drawButton(width / 2 + 10, height / 2 + 50, 240, 60, "MAIN MENU", color(150, 50, 50));
    }
}

// --- INPUT CONTROL ---

function mousePressed() {
    if (state === "START") {
        state = "MENU";
        return;
    }

    if (state === "MENU") {
        // Start Game Button clicked
        if (mouseX > width / 2 - 200 && mouseX < width / 2 + 200 && mouseY > 480 && mouseY < 560) {
            resetGame();
            state = "PLAY";
        }
        return;
    }

    if (state === "PLAY") {
        if (!gameOver) {
            bird.jump();
        } else {
            // Play Again Button
            if (mouseX > width / 2 - 250 && mouseX < width / 2 - 10 && mouseY > height / 2 + 50 && mouseY < height / 2 + 110) {
                resetGame();
            }
            // Exit to Menu Button
            if (mouseX > width / 2 + 10 && mouseX < width / 2 + 250 && mouseY > height / 2 + 50 && mouseY < height / 2 + 110) {
                state = "MENU";
            }
        }
    }
}

function resetGame() {
    pipes = [];
    pipes.push(new Pipe());
    score = 0;
    bird.y = height / 2;
    bird.velocity = 0;
    gameOver = false;
}

// --- ENTITY CLASSES ---

class Bird {
    constructor() {
        this.y = height / 2;
        this.x = 300;
        this.w = 180;
        this.h = 60;
        this.gravity = 0.45;
        this.lift = -10;
        this.velocity = 0;
    }

    show() {
        push();
        translate(this.x, this.y);
        rotate(map(this.velocity, -10, 10, -PI / 12, PI / 12));
        image(img, 0, 0, 400, 380);
        pop();

        if (showHitbox) {
            noFill();
            stroke(255, 0, 0);
            strokeWeight(3);
            rectMode(CENTER);
            rect(this.x, this.y, this.w, this.h);
            rectMode(CORNER);
            noStroke();
        }
    }

    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        if (this.y > height) {
            this.y = height;
            gameOver = true;
        }
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    }

    jump() {
        this.velocity = this.lift;
    }
}

function keyPressed() {
    if (key === 'H' || key === 'h') {
        showHitbox = !showHitbox;
    }
}

class Pipe {
    constructor() {
        this.spacing = 375;
        this.top = random(150, height - this.spacing - 150);
        this.bottom = height - (this.top + this.spacing);
        this.x = width;
        this.w = 80;
        this.speed = 5 + (score * 0.15);
        this.passed = false;
    }

    show() {
        fill(55, 55, 65);
        rect(this.x, 0, this.w, this.top);
        fill(120, 30, 30);
        rect(this.x - 10, this.top - 20, this.w + 20, 20);

        fill(55, 55, 65);
        rect(this.x, height - this.bottom, this.w, this.bottom);
        fill(120, 30, 30);
        rect(this.x - 10, height - this.bottom, this.w + 20, 20);

        if (showHitbox) {
            stroke(0, 255, 0);
            noFill();
            rect(this.x, 0, this.w, this.top);
            rect(this.x, height - this.bottom, this.w, this.bottom);
            noStroke();
        }
    }

    update() {
        this.x -= this.speed;
    }

    offscreen() {
        return this.x < -this.w;
    }

    hits(bird) {
        let birdLeft = bird.x - bird.w / 2;
        let birdRight = bird.x + bird.w / 2;
        let birdTop = bird.y - bird.h / 2;
        let birdBottom = bird.y + bird.h / 2;

        if (birdRight > this.x && birdLeft < this.x + this.w) {
            if (birdTop < this.top || birdBottom > height - this.bottom) {
                return true;
            }
        }
        return false;
    }
}

