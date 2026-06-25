// Global focus dynamic tracker
let activeGame = null; // 'CAR' ba 'SNAKE' ba null

// ==========================================
// POPUP SYSTEM (Strict JavaScript Display Router)
// ==========================================
const carPopup = document.getElementById("carPopup");
const snakePopup = document.getElementById("snakePopup");

const openCarBtn = document.getElementById("openCarBtn");
const openSnakeBtn = document.getElementById("openSnakeBtn");

const closeCarBtn = document.getElementById("closeCarBtn");
const closeSnakeBtn = document.getElementById("closeSnakeBtn");

if(openCarBtn) {
  openCarBtn.onclick = () => {
    carPopup.style.display = "flex";
    activeGame = "CAR";
    document.getElementById("startScreen").style.display = "flex";
    document.getElementById("modal").style.display = "none";
  };
}
if(closeCarBtn) {
  closeCarBtn.onclick = () => {
    carPopup.style.display = "none";
    activeGame = null;
    gameOverCar = true;
    if(spawnInterval) clearInterval(spawnInterval);
    if(moveInterval) clearInterval(moveInterval);
    document.querySelectorAll(".enemy").forEach(e => e.remove());
  };
}

if(openSnakeBtn) {
  openSnakeBtn.onclick = () => {
    snakePopup.style.display = "flex";
    activeGame = "SNAKE";
    document.getElementById("menu-overlay").classList.remove("opacity-0", "pointer-events-none");
    document.getElementById("menu-title").innerText = "SNAKE GAME";
    document.getElementById("menu-title").className = "text-2xl font-black text-green-400 tracking-widest mb-1";
    document.getElementById("menu-subtitle").innerHTML = "Play using Arrow Keys / WASD on Laptop, or the buttons below.";
    document.getElementById("action-btn").innerText = "START GAME";
    drawSnakeGameInit();
  };
}
if(closeSnakeBtn) {
  closeSnakeBtn.onclick = () => {
    snakePopup.style.display = "none";
    activeGame = null;
    isPlayingSnake = false;
    if (gameLoopSnake) clearInterval(gameLoopSnake);
  };
}

// ==========================================
// GAME 1 ENGINE: ENDLESS CAR RUSH
// ==========================================
const car = document.getElementById("car");
const scoreText = document.getElementById("score");
const levelText = document.getElementById("level");
const modal = document.getElementById("modal");
const replayBtn = document.getElementById("replayBtn");
const startScreen = document.getElementById("startScreen");

let carX, carY;
let gameOverCar = false;
let startedCar = false;
let scoreCar = 0;
let levelCar = 1;
let gameSpeedCar = 1;
let moveInterval = null;
let spawnInterval = null;
let activeCarKey = null; 

const CAR_WIDTH = 35;

function updateCarUI(){
    if(scoreText) scoreText.innerText = "Score: " + scoreCar;
    if(levelText) levelText.innerText = "Level: " + levelCar;
}

function getRoadBounds() {
    const road = document.getElementById("road");
    return { 
      roadLeft: road ? road.offsetLeft : 0, 
      roadRight: road ? (road.offsetLeft + road.offsetWidth) : window.innerWidth
    };
}

function startCarGame(){
    scoreCar = 0;
    levelCar = 1;
    gameSpeedCar = 1;
    updateCarUI();
    gameOverCar = false;
    startedCar = true;
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
        if(!gameOverCar && startedCar){
            createEnemy();
        }
    }, 900);
}

function startCarMove(dx, dy){
    if(moveInterval) clearInterval(moveInterval);
    moveInterval = setInterval(() => {
        if(gameOverCar || !startedCar) return;
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
        if (carY > gameHeight - 75) carY = gameHeight - 75;

        if(car) {
          car.style.left = carX + "px";
          car.style.top = carY + "px";
        }
    }, 20);
}

function stopCarMove(){
    if(moveInterval) clearInterval(moveInterval);
    activeCarKey = null;
}

const leftBtn = document.getElementById("left");
const rightBtn = document.getElementById("right");
const upBtn = document.getElementById("up");
const downBtn = document.getElementById("down");

if(leftBtn) {
  leftBtn.onmousedown = () => startCarMove(-6, 0);
  rightBtn.onmousedown = () => startCarMove(6, 0);
  upBtn.onmousedown = () => startCarMove(0, -6);
  downBtn.onmousedown = () => startCarMove(0, 6);
  leftBtn.onmouseup = stopCarMove;
  rightBtn.onmouseup = stopCarMove;
  upBtn.onmouseup = stopCarMove;
  downBtn.onmouseup = stopCarMove;
  
  leftBtn.ontouchstart = () => startCarMove(-6, 0);
  rightBtn.ontouchstart = () => startCarMove(6, 0);
  upBtn.ontouchstart = () => startCarMove(0, -6);
  downBtn.ontouchstart = () => startCarMove(0, 6);
  leftBtn.ontouchend = stopCarMove;
  rightBtn.ontouchend = stopCarMove;
  upBtn.ontouchend = stopCarMove;
  downBtn.ontouchend = stopCarMove;
}

function createEnemy(){
    if(gameOverCar || !startedCar) return;
    let enemy = document.createElement("div");
    enemy.className = "enemy";
    
    const { roadLeft, roadRight } = getRoadBounds();
    let roadWidth = roadRight - roadLeft;
    const gameArea = document.getElementById("game");
    
    enemy.style.left = roadLeft + Math.random() * (roadWidth - 35) + "px";
    enemy.style.top = "-70px";
    if(gameArea) gameArea.appendChild(enemy);

    let enemySpeed = 4 + (gameSpeedCar * 1.2);
    let move = setInterval(() => {
        if(gameOverCar){
            clearInterval(move);
            return;
        }
        let top = parseInt(enemy.style.top) || 0;
        enemy.style.top = (top + enemySpeed) + "px";

        let er = enemy.getBoundingClientRect();
        let cr = car ? car.getBoundingClientRect() : {left:0, right:0, top:0, bottom:0};

        if (er.left < cr.right && er.right > cr.left && er.top < cr.bottom && er.bottom > cr.top){
            gameOverCar = true;
            if(modal) modal.style.display = "flex";
            clearInterval(move);
            if(spawnInterval) clearInterval(spawnInterval);
        }

        const currentHeight = gameArea ? gameArea.offsetHeight : 400;
        if(top > currentHeight){
            scoreCar++;
            if(scoreCar % 5 === 0 && gameSpeedCar < 6){
                gameSpeedCar += 0.5;
                levelCar = Math.floor(gameSpeedCar);
            }
            updateCarUI();
            enemy.remove();
            clearInterval(move);
        }
    }, 20);
}

if(startBtn) startBtn.onclick = startCarGame;
if(replayBtn) replayBtn.onclick = startCarGame;


// ==========================================
// GAME 2 ENGINE: CLASSIC SNAKE GAME
// ==========================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const snakeScoreElement = document.getElementById("snakeScore");
const snakeHighScoreElement = document.getElementById("snakeHighScore");

const overlay = document.getElementById("menu-overlay");
const menuTitle = document.getElementById("menu-title");
const menuSubtitle = document.getElementById("menu-subtitle");
const actionBtn = document.getElementById("action-btn");

const box = 20; 
const cols = canvas.width / box;
const rows = canvas.height / box;

let snake = [];
let food = {};
let d = "RIGHT";
let nextD = "RIGHT";
let scoreSnake = 0;
let highScoreSnake = parseInt(localStorage.getItem("snake_high_score_simple")) || 0;
let gameLoopSnake = null;
let isPlayingSnake = false;
const gameSpeedSnake = 110; 

if(snakeHighScoreElement) {
    snakeHighScoreElement.innerText = String(highScoreSnake).padStart(3, '0');
}

function generateFood() {
    let placed = false;
    while (!placed) {
        food = {
            x: Math.floor(Math.random() * cols) * box,
            y: Math.floor(Math.random() * rows) * box
        };
        placed = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
}

function setSnakeDirection(newDir) {
    if (!isPlayingSnake) return;
    if (newDir === "LEFT" && d !== "RIGHT") nextD = "LEFT";
    else if (newDir === "UP" && d !== "DOWN") nextD = "UP";
    else if (newDir === "RIGHT" && d !== "LEFT") nextD = "RIGHT";
    else if (newDir === "DOWN" && d !== "UP") nextD = "DOWN";
}

function startSnakeGame() {
    snake = [
        { x: 9 * box, y: 10 * box },
        { x: 8 * box, y: 10 * box },
        { x: 7 * box, y: 10 * box }
    ];
    d = "RIGHT";
    nextD = "RIGHT";
    scoreSnake = 0;
    if(snakeScoreElement) snakeScoreElement.innerText = "000";
    generateFood();

    if(overlay) overlay.classList.add("opacity-0", "pointer-events-none");
    isPlayingSnake = true;

    if (gameLoopSnake) clearInterval(gameLoopSnake);
    gameLoopSnake = setInterval(updateSnake, gameSpeedSnake);
}

function gameOverSnake(reason) {
    isPlayingSnake = false;
    clearInterval(gameLoopSnake);

    if (scoreSnake > highScoreSnake) {
        highScoreSnake = scoreSnake;
        localStorage.setItem("snake_high_score_simple", highScoreSnake);
        if(snakeHighScoreElement) snakeHighScoreElement.innerText = String(highScoreSnake).padStart(3, '0');
    }

    if(menuTitle) {
      menuTitle.innerText = "GAME OVER";
      menuTitle.className = "text-3xl font-black text-red-500 tracking-widest mb-1";
    }
    
    if(menuSubtitle) {
      if (reason === "border") {
          menuSubtitle.innerHTML = `You hit the boundary limit!<br><span class="text-white text-md font-bold">Score: ${scoreSnake}</span>`;
      } else {
          menuSubtitle.innerHTML = `You ran into yourself!<br><span class="text-white text-md font-bold">Score: ${scoreSnake}</span>`;
      }
    }
    
    if(actionBtn) actionBtn.innerText = "PLAY AGAIN";
    if(overlay) overlay.classList.remove("opacity-0", "pointer-events-none");
}

function updateSnake() {
    d = nextD;

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (d === "LEFT") snakeX -= box;
    if (d === "UP") snakeY -= box;
    if (d === "RIGHT") snakeX += box;
    if (d === "DOWN") snakeY += box;

    if (snakeY < 0 || snakeY >= canvas.height) {
        gameOverSnake("border");
        return;
    }

    if (snakeX < 0) snakeX = canvas.width - box;
    if (snakeX >= canvas.width) snakeX = 0;

    const crashedSelf = snake.some((segment, index) => {
        return index !== 0 && segment.x === snakeX && segment.y === snakeY;
    });

    if (crashedSelf) {
        gameOverSnake("self");
        return;
    }

    if (snakeX === food.x && snakeY === food.y) {
        scoreSnake++;
        if(snakeScoreElement) snakeScoreElement.innerText = String(scoreSnake).padStart(3, '0');
        generateFood();
    } else {
        snake.pop();
    }

    snake.unshift({ x: snakeX, y: snakeY });
    drawSnakeGame();
}

function drawSnakeGame() {
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    for (let i = 0; i < cols; i++) {
        ctx.beginPath(); ctx.moveTo(i * box, 0); ctx.lineTo(i * box, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * box); ctx.lineTo(canvas.width, i * box); ctx.stroke();
    }

    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.roundRect(food.x + 2, food.y + 2, box - 4, box - 4, 6);
    ctx.fill();

    snake.forEach((segment, index) => {
        ctx.fillStyle = (index === 0) ? "#10b981" : "#34d399";
        ctx.beginPath();
        ctx.roundRect(segment.x + 1, segment.y + 1, box - 2, box - 2, (index === 0 ? 6 : 4));
        ctx.fill();

        if (index === 0) {
            ctx.fillStyle = "#000";
            if (d === "RIGHT" || d === "LEFT") {
                ctx.fillRect(segment.x + box/2, segment.y + 4, 3, 3);
                ctx.fillRect(segment.x + box/2, segment.y + box - 7, 3, 3);
            } else {
                ctx.fillRect(segment.x + 4, segment.y + box/2, 3, 3);
                ctx.fillRect(segment.x + box - 7, segment.y + box/2, 3, 3);
            }
        }
    });
}

function drawSnakeGameInit() {
  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

if(actionBtn) actionBtn.onclick = startSnakeGame;

// Mobile pointer interactions
document.getElementById("snakeUpBtn").onpointerdown = () => setSnakeDirection("UP");
document.getElementById("snakeLeftBtn").onpointerdown = () => setSnakeDirection("LEFT");
document.getElementById("snakeDownBtn").onpointerdown = () => setSnakeDirection("DOWN");
document.getElementById("snakeRightBtn").onpointerdown = () => setSnakeDirection("RIGHT");


// ==========================================
// UNIVERSAL KEYBOARD MANAGER
// ==========================================
window.addEventListener("keydown", (e) => {
    const key = e.key;
    const lowerKey = e.key.toLowerCase();
    
    if(activeGame === "CAR") {
        if(gameOverCar || !startedCar) return;
        if (activeCarKey === key) return; 
        if (key === "ArrowLeft") { activeCarKey = key; startCarMove(-6, 0); }
        else if (key === "ArrowRight") { activeCarKey = key; startCarMove(6, 0); }
        else if (key === "ArrowUp") { activeCarKey = key; startCarMove(0, -6); }
        else if (key === "ArrowDown") { activeCarKey = key; startCarMove(0, 6); }
    }
    
    if(activeGame === "SNAKE") {
        if (key === "ArrowLeft" || lowerKey === "a") setSnakeDirection("LEFT");
        else if (key === "ArrowUp" || lowerKey === "w") setSnakeDirection("UP");
        else if (key === "ArrowRight" || lowerKey === "d") setSnakeDirection("RIGHT");
        else if (key === "ArrowDown" || lowerKey === "s") setSnakeDirection("DOWN");
    }
});

window.addEventListener("keyup", (e) => {
    if(activeGame === "CAR") {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
            if (activeCarKey === e.key) stopCarMove();
        }
    }
});

drawSnakeGameInit();