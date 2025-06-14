const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const box = 20; // tamanho da "caixinha" do grid
let score = 0;
let snake = [];
snake[0] = { x: 9 * box, y: 9 * box }; // posição inicial
let direction = 'RIGHT';
let food = {
  x: Math.floor(Math.random() * 20) * box,
  y: Math.floor(Math.random() * 20) * box
};
let gameInterval;
let speed = 200; // Velocidade inicial (ms)

// Sons
const eatSound = new Audio('assets/eat.mp3');
const gameOverSound = new Audio('assets/gameover.mp3');

document.addEventListener('keydown', directionControl);

function directionControl(event) {
  if (event.key === 'ArrowLeft' || event.key === 'a') direction = 'LEFT';
  else if (event.key === 'ArrowUp' || event.key === 'w') direction = 'UP';
  else if (event.key === 'ArrowRight' || event.key === 'd') direction = 'RIGHT';
  else if (event.key === 'ArrowDown' || event.key === 's') direction = 'DOWN';
}

function draw() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, 400, 400);

  // Desenha a cobrinha
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = (i === 0) ? 'lime' : 'green';
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // Desenha a comida
  ctx.fillStyle = 'red';
  ctx.fillRect(food.x, food.y, box, box);

  // Posição antiga da cabeça
  let headX = snake[0].x;
  let headY = snake[0].y;

  // Direção
  if (direction === 'LEFT') headX -= box;
  if (direction === 'UP') headY -= box;
  if (direction === 'RIGHT') headX += box;
  if (direction === 'DOWN') headY += box;

  // Se a cobra comer a comida
  if (headX === food.x && headY === food.y) {
    score++;
    document.getElementById('score').textContent = score;
    eatSound.play();
    food = {
      x: Math.floor(Math.random() * 20) * box,
      y: Math.floor(Math.random() * 20) * box
    };
    // Aumenta a velocidade
    clearInterval(gameInterval);
    speed = Math.max(50, speed - 10); // limite mínimo
    gameInterval = setInterval(draw, speed);
  } else {
    snake.pop(); // remove o rabo
  }

  // Nova cabeça
  let newHead = { x: headX, y: headY };

  // Game Over: bate na parede ou em si mesmo
  if (headX < 0 || headY < 0 || headX >= 400 || headY >= 400 || collision(newHead, snake)) {
    gameOverSound.play();
    clearInterval(gameInterval);
    setTimeout(resetGame, 1500);
    return;
  }

  snake.unshift(newHead); // adiciona nova cabeça
}

function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) return true;
  }
  return false;
}

function resetGame() {
  score = 0;
  document.getElementById('score').textContent = score;
  snake = [];
  snake[0] = { x: 9 * box, y: 9 * box };
  direction = 'RIGHT';
  speed = 200;
  food = {
    x: Math.floor(Math.random() * 20) * box,
    y: Math.floor(Math.random() * 20) * box
  };
  clearInterval(gameInterval);
  gameInterval = setInterval(draw, speed);
}

gameInterval = setInterval(draw, speed);
