// Breakout en p5.js con 3 niveles de dificultad ajustado a rúbrica
let paddle;
let ball;
let blocks = [];
let blockWidth, blockHeight;
let score = 0;
let lives = 3;
let level = 1;
let gameStarted = false;

function setup() {
  createCanvas(600, 400);
  paddle = new Paddle();
  ball = new Ball();
  setupLevel();
}

function draw() {
  background(10, 20, 40); // azul oscuro

  paddle.show();
  paddle.update();

  if (gameStarted) {
    ball.show();
    ball.update();
    ball.checkPaddle(paddle);
    showBlocks();
    checkLevelComplete();
  } else {
    fill(255);
    textSize(20);
    textAlign(CENTER);
    text("Presiona ESPACIO para iniciar", width / 2, height / 2);
  }

  fill(255);
  textSize(16);
  textAlign(LEFT);
  text(`Puntuación: ${score}  Vidas: ${lives}  Nivel: ${level}`, 10, height - 10);

  if (lives <= 0) {
    noLoop();
    fill(255, 0, 0);
    textSize(32);
    textAlign(CENTER);
    text("¡Juego Terminado!", width / 2, height / 2);
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) paddle.move(-1);
  if (keyCode === RIGHT_ARROW) paddle.move(1);
  if (key === ' ') gameStarted = true;
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) paddle.move(0);
}

function setupLevel() {
  blocks = [];
  let numRows = level === 1 ? 4 : level === 2 ? 5 : 6;
  let numCols = 10;
  blockWidth = width / numCols;
  blockHeight = 20;

  let hardBlocks = 0;
  let unbreakablePlaced = false;

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      let type = 1;

      if (level === 2 && hardBlocks < 1) {
        type = 3;
        hardBlocks++;
      } else if (level === 3) {
        if (!unbreakablePlaced && r === 0 && c === 0) {
          type = -1;
          unbreakablePlaced = true;
        } else if (hardBlocks < 2) {
          type = 3;
          hardBlocks++;
        }
      }

      blocks.push(new Block(c * blockWidth, r * blockHeight + 30, blockWidth, blockHeight, type));
    }
  }
  ball.reset();
  gameStarted = false;
}

function showBlocks() {
  for (let i = blocks.length - 1; i >= 0; i--) {
    blocks[i].show();
    if (ball.hits(blocks[i])) {
      if (blocks[i].hit()) {
        blocks.splice(i, 1);
        score++;
      }
      ball.reverseY();
    }
  }
}

function checkLevelComplete() {
  if (blocks.every(b => b.type === -1)) {
    level++;
    if (level > 3) {
      noLoop();
      fill(0, 255, 0);
      textSize(32);
      textAlign(CENTER);
      text("¡Ganaste el juego!", width / 2, height / 2);
    } else {
      setupLevel();
    }
  }
}

class Paddle {
  constructor() {
    this.w = 100;
    this.h = 15;
    this.x = width / 2 - this.w / 2;
    this.y = height - 40;
    this.speed = 7;
    this.dir = 0;
  }

  show() {
    fill(255, 0, 0); // rojo
    rect(this.x, this.y, this.w, this.h);
  }

  move(dir) {
    this.dir = dir;
  }

  update() {
    this.x += this.dir * this.speed;
    this.x = constrain(this.x, 0, width - this.w);
  }
}

class Ball {
  constructor() {
    this.r = 10;
    this.reset();
  }

  reset() {
    this.x = width / 2;
    this.y = height / 2;
    let baseSpeed = level === 1 ? 4 : level === 2 ? 5 : 6;
    this.speed = baseSpeed;
    this.xSpeed = this.speed;
    this.ySpeed = -this.speed;
  }

  show() {
    fill(255, 105, 180); // rosa
    ellipse(this.x, this.y, this.r * 2);
  }

  update() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;

    if (this.x < 0 || this.x > width) this.xSpeed *= -1;
    if (this.y < 0) this.ySpeed *= -1;

    if (this.y > height) {
      lives--;
      this.reset();
      gameStarted = false;
    }
  }

  checkPaddle(p) {
    if (
      this.x > p.x && this.x < p.x + p.w &&
      this.y + this.r > p.y && this.y - this.r < p.y + p.h
    ) {
      this.ySpeed *= -1;
      this.y = p.y - this.r;
    }
  }

  hits(block) {
    return (
      this.x + this.r > block.x &&
      this.x - this.r < block.x + block.w &&
      this.y + this.r > block.y &&
      this.y - this.r < block.y + block.h
    );
  }

  reverseY() {
    this.ySpeed *= -1;
  }
}

class Block {
  constructor(x, y, w, h, type = 1) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type; // -1 = irrompible, 1 = normal, 3 = tres golpes
    this.hits = 0;
  }

  show() {
    if (this.type === -1) fill(150); // gris
    else if (this.type === 3) fill(255, 100, 100);
    else fill(0, 255, 0); // verde
    rect(this.x, this.y, this.w, this.h);
  }

  hit() {
    if (this.type === -1) return false;
    this.hits++;
    if (this.type === 3 && this.hits < 3) return false;
    return true;
  }
}
