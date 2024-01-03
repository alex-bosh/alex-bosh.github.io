const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const startScreen = document.getElementById("start-screen");
const settingsScreen = document.getElementById("settings-screen");
const overScreen = document.getElementById("over-screen");
const scoreScreen = document.getElementById("score-screen");

const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
highScoreEl.style.display = "none";

canvas.width = 800;
canvas.height = 500;

startScreen.style.width = `${canvas.width}px`;
startScreen.style.height = `${canvas.height}px`;

settingsScreen.style.width = `${canvas.width}px`;
settingsScreen.style.height = `${canvas.height}px`;

overScreen.style.width = `${canvas.width}px`;
overScreen.style.height = `${canvas.height}px`;

scoreScreen.style.width = `${canvas.width}px`;
scoreScreen.style.height = `${canvas.height}px`;

var radiusSlider = document.getElementById("radiusSlider");
radiusSlider.oninput = function () {
    player.radius = Number(this.value);
}

var pipeGapSlider = document.getElementById("pipeGapSlider");
pipeGapSlider.oninput = function () {
    platform.height = Number(this.value);
}

var gravitySlider = document.getElementById("gravitySlider");
gravitySlider.oninput = function () {
    gravity = Number(this.value) / 250;
}

var frictionSlider = document.getElementById("frictionSlider");
frictionSlider.oninput = function () {
    groundFriction = Number(this.value) / 30;
}

var multiplierSlider = document.getElementById("multiplierSlider");
multiplierSlider.oninput = function () {
    speedMultiplier = 20 - Number(this.value);
}
var maxSpeedSlider = document.getElementById("maxSpeedSlider");
maxSpeedSlider.oninput = function () {
    maxSpeed = Number(this.value);
}

function defaultSettings() {
    radiusSlider.value = '18';
    player.radius = 18;
    pipeGapSlider.value = '165';
    platform.height = 165;
    gravitySlider.value = '25';
    gravity = 0.1;
    frictionSlider.value = '30';
    groundFriction = 1;
    multiplierSlider.value = '10';
    speedMultiplier = 10;
    maxSpeedSlider.value = '6';
    maxSpeed = 6;
}


let gravity = 0.1;
let groundFriction = 1;
let speedMultiplier = 7;
let maxSpeed = 6;
let highScore = 0;

class Player {
    constructor() {
        this.radius = Number(radiusSlider.value);
        this.position = {
            x: (canvas.width / 4),
            y: 100
        };
        this.color = 'blue';

        this.velocity = {
            x: 0,
            y: 1
        };
    }

    draw() {
        c.beginPath();
        c.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
        c.fillStyle = this.color;
        c.fill();
        c.stroke();
    }

    update() {
        this.draw();

        // Just in case player goes below map
        if (this.position.y >= canvas.height + 50) {
            this.position.y = canvas.height / 2;
        }

        // Update the score
        if (this.position.x >= platform.position.x + (platform.width / 2) && this.position.x <= platform.position.x + platform.height) {
            scoreEl.textContent = `${passCount}`;
            if (passCount > highScore) highScore = passCount;
        }

        // Game over if player is not between the rectangles
        if (withPlat) {
            if (this.position.y - this.radius <= platform.position.y - 21 || this.position.y + this.radius >= platform.position.y + platform.height + 21) {
                platform.velocity = -platform.velocity;
                platFriction = 0.994;
                this.position.x = platform.position.x - this.radius - 1; // Prevent the ball from getting stuck
                scoreEl.style.fontSize = "100px";
                highScoreEl.textContent = `High Score: ${highScore}`;
                highScoreEl.style.display = "block";
                window.removeEventListener('mousedown', handleMouseDown);
                overScreen.style.display = "block";
            }
        }

        // Prevent the ball from going too high
        if (this.position.y > this.radius) {
            
            // Hit top of zone
            if (withPlat && this.position.y - this.radius <= platform.position.y + 1 && this.position.y - this.radius >= platform.position.y - 20 && this.velocity.y < 0) {
                this.position.y += 1;
                this.velocity.y = 0;
            } else {
                this.position.y += this.velocity.y;
            }
        }
        else { 
            this.position.y += 1;
            this.velocity.y = 0;
        }

        // Gravity acts on velocity
        if (this.position.y + this.radius + this.velocity.y <= canvas.height) {
            if (withPlat && this.velocity.y >= 0 && this.position.y + this.radius >= platform.position.y + platform.height - 1 && this.position.y + this.radius <= platform.position.y + platform.height + 20) {

                // Ball hits bottom of zone, friction applied
                if (this.velocity.y < 0 || this.velocity.y > 1) {
                    this.velocity.y = -this.velocity.y + groundFriction;
                }
                // So the ball doesnt bounce at very small values
                else {
                    this.velocity.y = 0;
                }

            } else {
                this.velocity.y += gravity;
            }

        }
        // Ball hits the ground
        else {
            
            // Ball hits ground, friction with value of 1 applied
            if (this.velocity.y < 0 || this.velocity.y > 1) {
                gameStarted ? this.velocity.y = -this.velocity.y + groundFriction : this.velocity.y = -this.velocity.y;
            }
            // So the ball doesnt bounce at very small values
            else {
                this.velocity.y = 0;
            }

        }
    }

}

let platFriction = 0;
let newVel = 0;

class Platform {
    constructor() {
        this.width = 36;
        this.height = Number(pipeGapSlider.value);
        this.velocity = 0;
        this.position = {
            x: canvas.width,
            y: Math.floor(Math.random() * (canvas.height - this.height))
        };
    }

    draw() {
        c.fillStyle = 'red';
        c.fillRect(this.position.x, 0, this.width, this.position.y);
        c.fillStyle = 'white';
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
        c.fillStyle = 'red';
        c.fillRect(this.position.x, this.position.y + this.height, this.width, canvas.height - this.height);
    }

    update() {
        this.draw();
        if (platFriction == 0) this.position.x -= this.velocity;
        else {
            this.velocity *= platFriction;
            this.position.x -= this.velocity;
        }
        if (this.position.x <= -this.width) {
            passCount++;
            if (this.velocity < maxSpeed) {
                //this.velocity = 2 + (passCount / speedMultiplier);
                this.velocity = 2 + (passCount / speedMultiplier); 
            }
            else this.velocity = maxSpeed;
            this.position.x = canvas.width;
            this.position.y = Math.floor(Math.random() * (canvas.height - this.height));
        }
    }

}

let passCount = 1;
const player = new Player();
const platform = new Platform();


let withPlat = 0; // If the ball is in line with the platform

function animate() {

    requestAnimationFrame(animate);
      
    c.clearRect(0, 0, canvas.width, canvas.height);
    platform.update();
    player.update();

    if (player.position.x + player.radius >= platform.position.x && player.position.x - player.radius <= platform.position.x + platform.width) {
        withPlat = 1;
    } else {
        withPlat = 0;
    }

}

animate();

let gameStarted = 0;


function startGame() {
    
    gameStarted = 1;
    platform.velocity = 2;
    startScreen.style.display = "none";
    scoreScreen.style.display = "block";
    window.addEventListener('mousedown', handleMouseDown);

}

function clickSettings() {
    startScreen.style.display = "none";
    settingsScreen.style.display = "block";
}

function backToStart() {
    settingsScreen.style.display = "none";
    startScreen.style.display = "block";
}


function restartGame() {
    gameStarted = 1;
    overScreen.style.display = "none";
    highScoreEl.style.display = "none";
    platform.position.x = canvas.width;
    passCount = 1;
    platform.velocity = 2;
    platFriction = 0;
    player.velocity.y = 5;
    player.position.x = (canvas.width / 4);
    player.position.y = canvas.height / 2;
    scoreEl.textContent = "0";
    scoreEl.style.fontSize = "31px";
    window.addEventListener('mousedown', handleMouseDown);

}

function retryToStart() {
    overScreen.style.display = "none";
    startScreen.style.display = "block";
    scoreScreen.style.display = "none";
    highScoreEl.style.display = "none";
    gameStarted = 0;
    platform.position.x = canvas.width;
    passCount = 1;
    platFriction = 0;
    player.velocity.y = 1;
    player.position.x = (canvas.width / 4);
    player.position.y = 100;
    scoreEl.textContent = "0";
    scoreEl.style.fontSize = "31px";
}

function handleMouseDown(event) {
    if (player.velocity.y == 0) {
        player.velocity.y = 8;
    } else {
        player.velocity.y += 3;
    }
}