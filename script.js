let bird;
let pipes = [];
let score = 0;
let gameOver = false;
let img;
let img2;
let showHitbox = false;
let highScore = 0;

// Load the image.
function preload() {
    img = loadImage('/dragon.gif');
    img2 = loadImage('/long.jpg')



}


function setup() {
    createCanvas(1900, 1000);

    bird = new Bird();
    pipes.push(new Pipe());
    imageMode(CENTER)

}

function draw() {
    imageMode(CORNER);
    background(0);
    image(img2, 0, 0, width, height);

    imageMode(CENTER);




    if (!gameOver) {

        if (score > highScore) {
            highScore = score;
        }
        text("Score: " + score, 200, 40);
        text("Best: " + highScore, 200, 90);
        textSize(40);

        // Bird
        bird.update();
        bird.show();


        // Pipes
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

            // Score
            if (!pipes[i].passed && pipes[i].x < bird.x) {
                score++;
                pipes[i].passed = true;
            }

            // Remove off screen pipes
            if (pipes[i].offscreen()) {
                pipes.splice(i, 1);
            }
        }


    }

    else {
        fill(400);
        textSize(40);
        textAlign(CENTER);
        text("GAME OVER", width / 2, height / 2);
        textSize(20);
        text("Click to restart")

    }

}
//Jump Mechanism 
function mousePressed() {

    if (!gameOver) {
        bird.jump();
    }
    else {

        pipes = [];
        pipes.push(new Pipe());

        score = 0;

        bird.y = height / 2;
        bird.velocity = 0;

        gameOver = false;
    }
}

// bird class 
class Bird {
    constructor() {
        this.y = height / 2;
        this.x = 300;
        this.w = 300
        this.h = 50
        this.gravity = 0.45;
        this.lift = -9;
        this.velocity = 5;
    }

    show() {
        // Roatation of Dragon mechanics
        push();

        translate(this.x, this.y);

        rotate(map(this.velocity,
            -10, 10,
            -PI / 12, PI / 12));

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
        this.velocity += this.lift;
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
        this.top = random(
            150,
            height - this.spacing - 150
        );
        this.bottom = height - (this.top + this.spacing);
        this.x = width;
        this.w = 80;
        this.speed = 3 + score * 0.8;
        this.passed = false;
    }
    show() {


        // Top pipe
        fill(0, 180, 0);
        rect(this.x, 0, this.w, this.top);

        fill(0, 255, 0);
        rect(this.x - 10, this.top - 20, this.w + 20, 20);

        // Bottom pipe
        fill(0, 180, 0);
        rect(
            this.x,
            height - this.bottom,
            this.w,
            this.bottom
        );

        fill(0, 255, 0);
        rect(
            this.x - 10,
            height - this.bottom,
            this.w + 20,
            20
        );

        rect(this.x - 5, this.top - 20, this.w + 10, 20);
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

        if (
            birdRight > this.x &&
            birdLeft < this.x + this.w
        ) {

            if (
                birdTop < this.top ||
                birdBottom > height - this.bottom
            ) {
                return true;
            }
        }

        return false;
    }
}















