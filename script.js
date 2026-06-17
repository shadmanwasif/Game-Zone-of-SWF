// ==========================================
// POPUP SYSTEM (Open & Close Game)
// ==========================================
const gamePopup = document.getElementById("gamePopup");
const openGameBtn = document.getElementById("openGameBtn");
const closeGameBtn = document.getElementById("closeGameBtn");

if(openGameBtn) {
  openGameBtn.onclick = () => {
    gamePopup.style.display = "flex";
    document.getElementById("startScreen").style.display = "flex";
    document.getElementById("modal").style.display = "none";
  };
}

if(closeGameBtn) {
  closeGameBtn.onclick = () => {
    gamePopup.style.display = "none";
    gameOver = true;
    if(spawnInterval) clearInterval(spawnInterval);
    if(moveInterval) clearInterval(moveInterval);
    document.querySelectorAll(".enemy").forEach(e => e.remove());
  };
}


// ==========================================
// MAIN CAR GAME ENGINE
// ==========================================
const car = document.getElementById("car");
const scoreText = document.getElementById("score");
const levelText = document.getElementById("level");
const modal = document.getElementById("modal");
const replayBtn = document.getElementById("replayBtn");
const startScreen = document.getElementById("startScreen");

let carX, carY;
let gameOver = false;
let started = false;
let score = 0;
let level = 1;
let gameSpeed = 1;
let moveInterval = null;
let spawnInterval = null;

let activeKey = null; 

const CAR_WIDTH = 35;

function updateUI(){
    if(scoreText) scoreText.innerText = "Score: " + score;
    if(levelText) levelText.innerText = "Level: " + level;
}

function getRoadBounds() {
    const road = document.getElementById("road");
    return { 
      roadLeft: road ? road.offsetLeft : 0, 
      roadRight: road ? (road.offsetLeft + road.offsetWidth) : window.innerWidth
    };
}

function startGame(){
    score = 0;
    level = 1;
    gameSpeed = 1;
    updateUI();
    gameOver = false;
    started = true;
    if(modal) modal.style.display = "none";
    if(startScreen) startScreen.style.display = "none";
    document.querySelectorAll(".enemy").forEach(e => e.remove());
    
    const { roadLeft, roadRight } = getRoadBounds();
    const gameArea = document.getElementById("game");
    
    carX = roadLeft + (roadRight - roadLeft)/2 - CAR_WIDTH / 2;
    carY = gameArea ? (gameArea.offsetHeight - 90) : 300;
    
    if(car) {
      car.style.left = carX + "px";
      car.style.top = carY + "px";
    }

    if(spawnInterval) clearInterval(spawnInterval);
    spawnEnemies();
}

function spawnEnemies(){
    spawnInterval = setInterval(() => {
        if(!gameOver && started){
            createEnemy();
        }
    }, 900);
}

function startMove(dx, dy){
    if(moveInterval) clearInterval(moveInterval);
    moveInterval = setInterval(() => {
        if(gameOver || !started) return;
        carX += dx;
        carY += dy;
        const { roadLeft, roadRight } = getRoadBounds();
        const minX = roadLeft + 5;
        const maxX = roadRight - CAR_WIDTH - 5;
        const gameArea = document.getElementById("game");
        const gameHeight = gameArea ? gameArea.offsetHeight : 400;
        
        if (carX < minX) carX = minX;
        if (carX > maxX) carX = maxX;
        if (carY < 10) carY = 10;
        if (carY > gameHeight - 75) {
          carY = gameHeight - 75;
        }

        if(car) {
          car.style.left = carX + "px";
          car.style.top = carY + "px";
        }
    }, 20);
}

function stopMove(){
    if(moveInterval) clearInterval(moveInterval);
    activeKey = null;
}

// ==========================================
// LAPTOP/COMPUTER ARROW KEYS CONTROL
// ==========================================
window.addEventListener("keydown", (e) => {
    if(gameOver || !started) return;
    if (activeKey === e.key) return; 
    
    if (e.key === "ArrowLeft") {
        activeKey = e.key;
        startMove(-6, 0);
    } else if (e.key === "ArrowRight") {
        activeKey = e.key;
        startMove(6, 0);
    } else if (e.key === "ArrowUp") {
        activeKey = e.key;
        startMove(0, -6);
    } else if (e.key === "ArrowDown") {
        activeKey = e.key;
        startMove(0, 6);
    }
});

window.addEventListener("keyup", (e) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        if (activeKey === e.key) {
            stopMove();
        }
    }
});


// On-Screen Buttons (Mouse/Touch Support)
const leftBtn = document.getElementById("left");
const rightBtn = document.getElementById("right");
const upBtn = document.getElementById("up");
const downBtn = document.getElementById("down");

if(leftBtn && rightBtn && upBtn && downBtn) {
  leftBtn.onmousedown = () => startMove(-6, 0);
  rightBtn.onmousedown = () => startMove(6, 0);
  upBtn.onmousedown = () => startMove(0, -6);
  downBtn.onmousedown = () => startMove(0, 6);

  leftBtn.onmouseup = stopMove;
  rightBtn.onmouseup = stopMove;
  upBtn.onmouseup = stopMove;
  downBtn.onmouseup = stopMove;

  leftBtn.ontouchstart = (e)=>{e.preventDefault(); startMove(-6,0);};
  rightBtn.ontouchstart = (e)=>{e.preventDefault(); startMove(6,0);};
  upBtn.ontouchstart = (e)=>{e.preventDefault(); startMove(0,-6);};
  downBtn.ontouchstart = (e)=>{e.preventDefault(); startMove(0,6);};

  leftBtn.ontouchend = stopMove;
  rightBtn.ontouchend = stopMove;
  upBtn.ontouchend = stopMove;
  downBtn.ontouchend = stopMove;
}


function createEnemy(){
    if(gameOver || !started) return;
    let enemy = document.createElement("div");
    enemy.className = "enemy";
    
    const { roadLeft, roadRight } = getRoadBounds();
    let roadWidth = roadRight - roadLeft;
    const gameArea = document.getElementById("game");
    
    enemy.style.left = roadLeft + Math.random() * (roadWidth - 35) + "px";
    enemy.style.top = "-70px";
    if(gameArea) gameArea.appendChild(enemy);

    let enemySpeed = 4 + (gameSpeed * 1.2);
    let move = setInterval(() => {
        if(gameOver){
            clearInterval(move);
            return;
        }
        let top = parseInt(enemy.style.top) || 0;
        enemy.style.top = (top + enemySpeed) + "px";

        let er = enemy.getBoundingClientRect();
        let cr = car ? car.getBoundingClientRect() : {left:0, right:0, top:0, bottom:0};

        // Collision Check
        if (er.left < cr.right && er.right > cr.left && 
            er.top < cr.bottom && er.bottom > cr.top){
            gameOver = true;
            if(modal) modal.style.display = "flex";
            clearInterval(move);
            if(spawnInterval) clearInterval(spawnInterval);
        }

        const currentHeight = gameArea ? gameArea.offsetHeight : 400;
        if(top > currentHeight){
            score++;
            if(score % 5 === 0 && gameSpeed < 6){
                gameSpeed += 0.5;
                level = Math.floor(gameSpeed);
            }
            updateUI();
            enemy.remove();
            clearInterval(move);
        }
    }, 20);
}

const startBtn = document.getElementById("startBtn");
if(startBtn) startBtn.onclick = startGame;
if(replayBtn) replayBtn.onclick = startGame;