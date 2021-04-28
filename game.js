const canvas = document.getElementById("canvas");
canvas.width = innerWidth;
canvas.height = innerHeight;

const ctx = canvas.getContext("2d");
//ctx.globalCompositeOperation = 'destination-over'

const scoreText = document.getElementById("score");
const levelText = document.getElementById("level");
const audioLevelUp = document.getElementById("levelUp");
const audioProjectileLaunch = document.getElementById("projectileLaunch");
const startButton = document.getElementById("startButton");
const popUp = document.getElementById("popUp");
const popUpScore = document.getElementById("popUpScore");
const popUpLevel = document.getElementById("popUpLevel");

// Jugador

class Player {
    constructor (x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    drawPlayer() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    
}

const x = canvas.width/2
const y = canvas.height/2

let aPlayer = new Player (x, y, 30, 'white')
aPlayer.drawPlayer();

// Proyectil

class Projectile {
    constructor (x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    drawProjectile () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update () {
        
        this.drawProjectile()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const friction = 0.98;

class Particle {
    constructor (x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    drawProjectile () {
        ctx.save();
        ctx.globalAlpha = this.alpha
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    update () {
        this.drawProjectile()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    
    }
}

let projectilesArray = [];
let particlesArray = [];
let animation;
let score = 0;
let level = 1;

function animate () {
    animation = requestAnimationFrame(animate)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    aPlayer.drawPlayer();
    particlesArray.forEach((particle, partIndex ) => {
        if (particle.alpha <= 0 ) {
            particlesArray.splice(partIndex, 1)
        } else {
        particle.update();
        }    
    })
    projectilesArray.forEach((element, index) => {
        element.update()

        // Remove from edges from screen

        if (element.x + element.radius < 0 || 
            element.x - element.radius > canvas.width || 
            element.y + element.radius < 0 || 
            element.y - element.radius > canvas.height) 
            {
            projectilesArray.splice(index, 1)
            }
        }) 

    spawnedEnemies.forEach((enemy, index) => {
        enemy.update()

        // Player and enemies touch - End the game

        const distanceBetween = Math.hypot(aPlayer.x - enemy.x, aPlayer.y - enemy.y)
        if (distanceBetween - aPlayer.radius - enemy.radius < 1) {
            cancelAnimationFrame(animation);
            removeEventListener("click", clickFunction);
            popUp.style.display = 'flex';
            popUpScore.innerHTML = score;
            popUpLevel.innerHTML = `Level reached: <b>${level}</b>`;
        }

    projectilesArray.forEach((element, pIndex) => {

        // Projectile and enemies touch - Collission detection

        const distanceBetween = Math.hypot(element.x - enemy.x, element.y - enemy.y)

        if (distanceBetween - enemy.radius - element.radius < 1) {
            score += 100;
            scoreText.innerHTML = score;
            
            if (scoreText.innerHTML == 1000) {
                audioLevelUp.play();
                level = 2;
                levelText.innerHTML = level;

            } else if (scoreText.innerHTML == 2000) {
                audioLevelUp.currentTime = 0;
                audioLevelUp.play();
                level = 3;
                levelText.innerHTML = level;

            } else if (scoreText.innerHTML == 3000) {
                audioLevelUp.currentTime = 0;
                audioLevelUp.play();
                level = 4;
                levelText.innerHTML = level;
            } else if (scoreText.innerHTML == 4000) {
                audioLevelUp.currentTime = 0;

                audioLevelUp.play();
                level = "GOD!";
                levelText.innerHTML = level;
            } 

         // This creates the particles  and pushes them to the particles Array
            for (let i=0; i < enemy.radius * 2; i++) {
                particlesArray.push(new Particle (element.x, element.y, Math.random()*3, enemy.color, 
                    {x: (Math.random() - 0.5)*(Math.random() * 8), y: (Math.random() - 0.5)*(Math.random() * 8)}))
            }
            if (enemy.radius - 10 > 15) {
                    gsap.to(enemy, {
                    radius: enemy.radius - 10,
                    })
                    setTimeout(() => {
                    enemy.velocity.x = enemy.velocity.x/1.5;
                    enemy.velocity.y = enemy.velocity.y/1.5;
                    projectilesArray.splice(pIndex, 1)
                    }, 0) 
            } else {
                    setTimeout(() => {
                    spawnedEnemies.splice(index, 1)
                    projectilesArray.splice(pIndex, 1)
                    }, 0)            
                }          
            } 
        
        })  
    })
}

clickFunction = (event) => {

    // Find the angle between the center and the clicked area

    const angle = Math.atan2(event.clientY - y, event.clientX - x)
    const velocity = {
        x: Math.cos(angle) * 6, 
        y: Math.sin(angle) * 6
    }
    // console.log(angle)

    //const secondProjectile = new Projectile(x, y, 5, 'red', {x: -10, y: -10})

    projectilesArray.push(new Projectile(x, y, 10, 'pink', velocity))
    audioProjectileLaunch.currentTime = 0;
    audioProjectileLaunch.play();
    
}

class Enemies {
    constructor (x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    drawEnemy () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update () {
        this.drawEnemy();
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}



let spawnedEnemies = []
let a;
let b;

function init () {
    score = 0;
    level = 1;
    aPlayer = new Player (x, y, 30, 'white')
    projectilesArray = [];
    particlesArray = [];
    spawnedEnemies = [];
    score = 0;
    level = 1;
    scoreText.innerHTML = score;
    levelText.innerHTML = level;
    popUpScore.innerHTML = score;
    popUpLevel.innerHTML = level;
    addEventListener("click", clickFunction, false)

}

function randomlySpawn () {
    setInterval(() => {
        const radius = Math.random()* (30-15)+15;
        if (Math.random() < 0.5) {
            a =  Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
            b = Math.random() * canvas.height;
        } else {
            a = Math.random() * canvas.width;
            b = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
         }

        // Generate random color. Another alternative is using: let color = `hsl(${Math.random () * 360}, 50%, 50%)`

        let r = () => Math.random() * 256 >> 0;
        let color = `rgb(${r()}, ${r()}, ${r()})`;

        // Find the angle between the external areas and the center

        const angle = Math.atan2(canvas.height/2 - b, canvas.width/2 - a)
        const velocity = {
            x: Math.cos(angle), 
            y: Math.sin(angle)
        }
        spawnedEnemies.push(new Enemies (a, b, radius, color, velocity));
    }, 500)
}

startButton.addEventListener("click", () => {
    init();
    animate();
    popUp.style.display = 'none';
    randomlySpawn();
}) 
    






