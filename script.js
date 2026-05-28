let bird;
let pipes = [];
let score = 0;
let gameOver = false;
let img;
let img2;


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
        // Bird
        bird.update();
        bird.show();

        // Pipes
        if (frameCount % 300 === 0) {
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

        fill(500);
        textSize(50)
        text("Score " + score, 200, 40);
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
    } else {
        // Restart
        pipes = [];
        pipes.push(new Pipe());
        score = 0;
        gameOver = false;
        bird = new Bird();
    }
}

// bird class 
class Bird {
    constructor() {
        this.y = height / 2;
        this.x = 300;
        this.gravity = 0.230;
        this.lift = -5;
        this.velocity = 5;
    }

    show() {
        // Draw the image 50x50.
        image(img, this.x, this.y, 400, 380);
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

class Pipe {
    constructor() {
        this.spacing = random(120, 180);
        this.top = random(height / 6, 3 / 4 * height);
        this.bottom = height - (this.top + this.spacing);
        this.x = width;
        this.w = 60;
        this.speed = 3;
        this.passed = false;

    }
    show() {
        fill(255, 0, 0);
        rect(this.x, 0, this.w, this.top);
        rect(this.x, height - this.bottom, this.w, this.bottom)
        // Draw the image 50x50.


    }

    update() {
        this.x -= this.speed;
    }

    offscreen() {
        return this.x < -this.w;
    }

    hits(bird) {
        if (bird.y < this.top || bird.y > height - this.bottom) {
            if (bird.x > this.x && bird.x < this.x + this.w) {
                return true;
            }
        }
        return false;
    }
}















