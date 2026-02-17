/* ======================
   CANVAS & CONTEXT
====================== */
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/* ======================
   ASSETS
====================== */
const bgImg = new Image();
bgImg.src = "assets/background.png";

const pipeImg = new Image();
pipeImg.src = "assets/pipe2-.png";

const birdImg = new Image();
birdImg.src = "assets/Flappy-Bird.png";

/* ======================
   POPUP & UI
====================== */
const popup = document.getElementById("gameOverPopup");
const retryBtn = document.getElementById("retryBtn");
const finalScoreElement = document.getElementById("finalScore");

/* ======================
   GAME STATE
====================== */
let gameStarted = false;
let gameOver = false;
let score = 0;
let frame = 0;

/* ======================
   BIRD
====================== */
let bird = {
  x: 80,
  y: 250,
  width: 40,
  height: 30,
  gravity: 0.5,
  jump: -8,
  speed: 0,
};

/* ======================
   PIPES
====================== */
let pipes = [];
const pipeWidth = 60;
const pipeGap = 160;
const pipeSpeed = 2;

/* ======================
   CONTROLS
====================== */
document.addEventListener("click", control);
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") control(e);
});

function control(e) {
  if (!gameStarted && !gameOver) {
    gameStarted = true;
    return;
  }
  if (gameStarted && !gameOver) {
    bird.speed = bird.jump;
  }
}

/* ======================
   CREATE PIPE
====================== */
function createPipe() {
  let minPipeHeight = 50;
  let maxPipeHeight = canvas.height - pipeGap - minPipeHeight;
  let topHeight =
    Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) +
    minPipeHeight;

  pipes.push({
    x: canvas.width,
    top: topHeight,
    bottom: canvas.height - topHeight - pipeGap,
    passed: false,
  });
}

/* ======================
   UPDATE LOGIC
====================== */
function update() {
  if (!gameStarted || gameOver) return;

  bird.speed += bird.gravity;
  bird.y += bird.speed;

  if (bird.y < 0 || bird.y + bird.height > canvas.height) {
    endGame();
  }

  if (frame % 100 === 0) {
    createPipe();
  }

  pipes.forEach((pipe) => {
    pipe.x -= pipeSpeed;
    if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
      score++;
      pipe.passed = true;
    }
    if (
      bird.x < pipe.x + pipeWidth &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
    ) {
      endGame();
    }
  });

  pipes = pipes.filter((pipe) => pipe.x + pipeWidth > 0);
  frame++;
}

/* ======================
   DRAWING
====================== */
function draw() {
  // 1. Draw Background
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

  // 2. Draw Pipes
  pipes.forEach((pipe) => {
    ctx.save();
    ctx.translate(pipe.x + pipeWidth / 2, pipe.top / 2);
    ctx.scale(1, -1);
    ctx.drawImage(pipeImg, -pipeWidth / 2, -pipe.top / 2, pipeWidth, pipe.top);
    ctx.restore();

    ctx.drawImage(
      pipeImg,
      pipe.x,
      canvas.height - pipe.bottom,
      pipeWidth,
      pipe.bottom,
    );
  });

  // 3. Draw Bird
  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

  // 4. UI: Score Style (Sesuai Gambar User)
  if (gameStarted || gameOver) {
    ctx.save();
    ctx.fillStyle = "#e3c505"; // Kuning emas
    ctx.strokeStyle = "#000000"; // Garis tepi hitam
    ctx.lineWidth = 6;
    ctx.lineJoin = "round";
    ctx.font = "24px 'Press Start 2P', cursive";
    ctx.textAlign = "left";

    const scoreText = "Score: " + score;
    const posX = 30;
    const posY = 60;

    // Gambar outline dulu, lalu isi warna kuning
    ctx.strokeText(scoreText, posX, posY);
    ctx.fillText(scoreText, posX, posY);
    ctx.restore();
  }

  // 5. UI: Start Text dengan Animasi Denyut
  if (!gameStarted && !gameOver) {
    frame++;
    let scale = 1 + Math.sin(frame * 0.1) * 0.1;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.font = "bold 24px Arial"; // Bisa diganti 'Press Start 2P' jika ingin konsisten
    ctx.textAlign = "center";
    ctx.strokeText("START THE GAME", 0, 0);
    ctx.fillText("START THE GAME", 0, 0);
    ctx.restore();
  }
}

/* ======================
   GAME OVER & RESET
====================== */
function endGame() {
  gameOver = true;
  finalScoreElement.innerText = score;
  popup.classList.remove("hidden");
}

function resetGame() {
  bird.y = 250;
  bird.speed = 0;
  pipes = [];
  score = 0;
  frame = 0;
  gameOver = false;
  gameStarted = false;
  popup.classList.add("hidden");
}

retryBtn.addEventListener("click", resetGame);

/* ======================
   GAME LOOP
====================== */
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
