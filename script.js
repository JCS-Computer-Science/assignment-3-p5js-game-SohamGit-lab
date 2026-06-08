let bird;
let pipes = [];
let score = 0;
let gameOver = false;
let showHitbox = false;

// Game States: "START", "MENU", "SHOP", "PLAY"
let state = "START"; 

// Images
let img2; // Background
let dragonSkins = {}; // Object to hold our skin images
let currentSkin = "Classic"; // Track equipped skin

// Economy & Unlockables
let gold = 0;
let highScore = 0;

// Shop Data
let shopItems = {
    "Classic": { price: 0, unlocked: true, file: '/dragon.gif' },
    "Ice Dragon": { price: 15, unlocked: false, file: '/ice_dragon.gif' }, // Change to your filename
    "Gold Dragon": { price: 50, unlocked: false, file: '/gold_dragon.gif' } // Change to your filename
};

function preload() {
    img2 = loadImage('/long.jpg');
    
    // Load all skins from the shop data dynamically
    for (let skinName in shopItems) {
        // Fallback to main dragon if you don't have all files yet so it doesn't crash
        dragonSkins[skinName] = loadImage(shopItems[skinName].file, 
            success => {}, 
            error => { dragonSkins[skinName] = loadImage('/dragon.gif'); }
        );
    }
}

function setup() {
    createCanvas(1900, 1000);
    bird = new Bird();
    pipes.push(new Pipe());
    
    // Load Saved Data from Browser Storage
    if (localStorage.getItem('flappyDragonHighScore')) {
        highScore = int(localStorage.getItem('flappyDragonHighScore'));
    }
    if (localStorage.getItem('flappyDragonGold')) {
        gold = int(localStorage.getItem('flappyDragonGold'));
    }
    if (localStorage.getItem('flappyDragonSkins')) {
        let savedSkins = JSON.parse(localStorage.getItem('flappyDragonSkins'));
        for (let skin in savedSkins) {
            if (shopItems[skin]) shopItems[skin].unlocked = savedSkins[skin];
        }
    }
    if (localStorage.getItem('flappyDragonCurrentSkin')) {
        currentSkin = localStorage.getItem('flappyDragonCurrentSkin');
    }
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
    else if (state === "SHOP") {
        drawShopScreen();
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
    text("MAIN MENU", width / 2, 200);
    
    textSize(25);
    text("High Score: " + highScore + "  |  Gold Balance: 🪙 " + gold, width / 2, 280);
    text("Equipped Skin: " + currentSkin, width / 2, 330);

    // Draw Menu Buttons
    drawButton(width / 2 - 200, 450, 400, 80, "START GAME", color(50, 150, 50));
    drawButton(width / 2 - 200, 580, 400, 80, "SKIN SHOP", color(150, 50, 150));
}

function drawShopScreen() {
    fill(0, 0, 0, 180);
    rect(0, 0, width, height);
    
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(50);
    text("SKIN SHOP", width / 2, 100);
    textSize(30);
    text("Your Gold: 🪙 " + gold, width / 2, 160);

    // Draw Back Button
    drawButton(50, 50, 150, 50, "<- BACK", color(100));

    // Render Skin Cards dynamically
    let xOffset = width / 2 - 450;
    for (let skinName in shopItems) {
        let item = shopItems[skinName];
        
        // Card box
        fill(40, 40, 50);
        stroke(100);
        strokeWeight(3);
        rect(xOffset, 300, 260, 400, 15);
        noStroke();
        
        // Preview Skin Image
        imageMode(CENTER);
        image(dragonSkins[skinName], xOffset + 130, 400, 160, 150);
        
        // Text details
        fill(255);
        textSize(24);
        text(skinName, xOffset + 130, 520);
        
        // Button Logic inside the card
        let btnColor = color(50, 120, 200);
        let btnText = "BUY: 🪙" + item.price;
        
        if (item.unlocked) {
            if (currentSkin === skinName) {
                btnColor = color(50, 200, 50);
                btnText = "EQUIPPED";
            } else {
                btnColor = color(100, 100, 100);
                btnText = "EQUIP";
            }
        }
        
        drawButton(xOffset + 30, 580, 200, 50, btnText, btnColor);
        xOffset += 350; // Move next card right
    }
}

function drawButton(x, y, w, h, label, btnColor) {
    fill(btnColor);
    rect(x, y, w, h, 10);
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    text(label, x + w / 2, y + h / 2);
}

// --- CORE GAMEPLAY ---

function runGameplay() {
    imageMode(CENTER);

    if (!gameOver) {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('flappyDragonHighScore', highScore);
        }
        
        // Fixed text scaling/colors
        fill(255);
        textSize(40);
        textAlign(LEFT, TOP);
        text("Score: " + score, 50, 40);
        text("Best: " + highScore, 50, 90);
        text("Gold: 🪙 " + gold, 50, 140);

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
                saveStats(); // Save gold when you die!
            }

            // Score & Gold reward
            if (!pipes[i].passed && pipes[i].x < bird.x) {
                score++;
                gold += 1; // Gain 1 gold per pipe passed!
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
        
        fill(255);
        textSize(25);
        text("Gold Earned This Run: 🪙 " + score, width / 2, height / 2 + 20);
        
        drawButton(width / 2 - 250, height / 2 + 80, 240, 60, "PLAY AGAIN", color(50, 150, 50));
        drawButton(width / 2 + 10, height / 2 + 80, 240, 60, "MAIN MENU", color(150, 50, 50));
    }
}

function saveStats() {
    localStorage.setItem('flappyDragonGold', gold);
    
    // Save unlocked states
    let unlockedObj = {};
    for (let skin in shopItems) {
        unlockedObj[skin] = shopItems[skin].unlocked;
    }
    localStorage.setItem('flappyDragonSkins', JSON.stringify(unlockedObj));
    localStorage.setItem('flappyDragonCurrentSkin', currentSkin);
}

// --- INPUT CONTROL (MOUSE CLICKS & BUTTONS) ---

function mousePressed() {
    if (state === "START") {
        state = "MENU";
        return;
    }

    if (state === "MENU") {
        // Start Game Button clicked
        if (mouseX > width / 2 - 200 && mouseX < width / 2 + 200 && mouseY > 450 && mouseY < 530) {
            resetGame();
            state = "PLAY";
        }
        // Shop Button clicked
        if (mouseX > width / 2 - 200 && mouseX < width / 2 + 200 && mouseY > 580 && mouseY < 660) {
            state = "SHOP";
        }
        return;
    }

    if (state === "SHOP") {
        // Back Button
        if (mouseX > 50 && mouseX < 200 && mouseY > 50 && mouseY < 100) {
            state = "MENU";
        }

        // Detect shop item card button clicks
        let xOffset = width / 2 - 450;
        for (let skinName in shopItems) {
            let item = shopItems[skinName];
            
            if (mouseX > xOffset + 30 && mouseX < xOffset + 230 && mouseY > 580 && mouseY < 630) {
                if (!item.unlocked && gold >= item.price) {
                    gold -= item.price;
                    item.unlocked = true;
                    currentSkin = skinName;
                    saveStats();
                } else if (item.unlocked) {
                    currentSkin = skinName;
                    saveStats();
                }
            }
            xOffset += 350;
        }
        return;
    }

    if (state === "PLAY") {
        if (!gameOver) {
            bird.jump();
        } else {
            // Play Again Button
            if (mouseX > width / 2 - 250 && mouseX < width / 2 - 10 && mouseY > height / 2 + 80 && mouseY < height / 2 + 140) {
                resetGame();
            }
            // Exit to Menu Button
            if (mouseX > width / 2 + 10 && mouseX < width / 2 + 250 && mouseY > height / 2 + 80 && mouseY < height / 2 + 140) {
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
        this.w = 180; // Shrunk hitboxes slightly so it feels fairer with a 400px image
        this.h = 60;
        this.gravity = 0.45;
        this.lift = -10;
        this.velocity = 0;
    }

    show() {
        push();
        translate(this.x, this.y);
        rotate(map(this.velocity, -10, 10, -PI / 12, PI / 12));
        
        // Dynamically use the saved currentSkin image layer
        image(dragonSkins[currentSkin], 0, 0, 400, 380);
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
            if (!gameOver) { gameOver = true; saveStats(); }
        }
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    }

    jump() {
        this.velocity = this.lift; // Snappy jump fix applied!
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
        this.speed = 5 + (score * 0.15); // Balanced speed progression scaling fix applied!
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