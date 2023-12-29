const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');
const startScreen = document.getElementById("start-screen");
const overScreen = document.getElementById("over-screen");
const scoreScreen = document.getElementById("score-screen");
const score = document.getElementById("score");
canvas.width = 1300;
canvas.height = 700;
startScreen.style.width = `${canvas.width}px`;
startScreen.style.height = `${canvas.height}px`;
overScreen.style.width = `${canvas.width}px`;
overScreen.style.height = `${canvas.height}px`;
scoreScreen.style.width = `${canvas.width}px`;
scoreScreen.style.height = `${canvas.height}px`;


const gravity = 0.1;

class Player {
    constructor() {
        
        this.radius = 30;
        this.position = {
            x: (canvas.width / 2) + 4,
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
            score.textContent = `${passCount}`;
        }

        // Game over if player is not between the rectangles
        if (withPlat) {
            if (this.position.y - this.radius <= platform.position.y - 21 || this.position.y + this.radius >= platform.position.y + platform.height + 21) {
                platform.velocity = 0;
                this.position.x = platform.position.x - this.radius - 1;
                //gameStarted = 0;
                score.style.fontSize = "100px";
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

                // Ball hits bottom of zone, friction with value of 1 applied
                if (this.velocity.y < 0 || this.velocity.y > 1) {
                    this.velocity.y = -this.velocity.y + 1;
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
                gameStarted ? this.velocity.y = -this.velocity.y + 1 : this.velocity.y = -this.velocity.y;
            }
            // So the ball doesnt bounce at very small values
            else {
                this.velocity.y = 0;
            }

        }
    }

}

class Platform {
    constructor() {
        this.width = 100;
        this.height = 300;
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
        this.position.x -= this.velocity;
        if (this.position.x <= -this.width) {
            if (this.velocity < 6.6) {
                passCount++;
                
            }
            this.velocity = 2 + (passCount / 6);
            console.log(this.velocity);
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

    window.addEventListener('mousedown', handleMouseDown);

}

function restartGame() {
    gameStarted = 1;
    platform.velocity = 2;
    overScreen.style.display = "none";
    platform.position.x = canvas.width;
    //platform.position.y = Math.floor(Math.random() * (canvas.height - this.height));
    passCount = 1;
    platform.velocity = 2;
    player.velocity.y = 5;
    player.position.y = canvas.height / 2;
    score.textContent = "0";
    score.style.fontSize = "31px";
    window.addEventListener('mousedown', handleMouseDown);

}

function handleMouseDown(event) {
    if (player.velocity.y == 0) {
        player.velocity.y = 8;
    } else {
        player.velocity.y += 3;
    }
}