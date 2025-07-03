const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const canvas2 = document.getElementById('snakeSelected');
const ctx2 = canvas2.getContext('2d');
const box = 30; // tamanho da "caixinha" do grid
const colorSnake = document.querySelectorAll('.colorSnake')
let isGameStarted = false;
let isWaitingToRestart = false;

let score = 0;
let time = 0;
let snake = [];
snake[0] = { x: 9 * box, y: 9 * box }; // posição inicial
let direction = 'RIGHT';
let food = {x: 0, y: 0};
let gameInterval;
let speed = 200; // Velocidade inicial (ms)
let skinColor = ['green', 'lime']
let timeInterval;
const scoreboard = {
  record: {
    pontuacao: 0,
    tempo: 0,
  },
  partidas: []
};

// Sons
const eatSound = new Audio('assets/eat.mp3');
const gameOverSound = new Audio('assets/gameover.mp3');


// Carregar ao iniciar a página
if (!localStorage.getItem('jogoData')) {
  localStorage.setItem('jogoData', JSON.stringify(scoreboard))
} else {
  data = JSON.parse(localStorage.getItem('jogoData'));
  data.partidas = [];
  localStorage.setItem('jogoData', JSON.stringify(data))
}

let savedData = JSON.parse(localStorage.getItem('jogoData'));
document.getElementById('record').textContent = `Pontuação: ${savedData.record.pontuacao} Tempo: ${savedData.record.tempo}`;


function foodRandon() {
  food = {
  x: Math.floor(Math.random() * 20) * box,
  y: Math.floor(Math.random() * 20) * box
  };
  while (collision(food, snake)) {
    food = {
    x: Math.floor(Math.random() * 20) * box,
    y: Math.floor(Math.random() * 20) * box
    };
  }
}
foodRandon();


window.addEventListener('DOMContentLoaded', () => {
    const radios = document.querySelectorAll('input.colorSnake');
    if(radios.length > 0) {
        radios[0].checked = true; // Marca o primeiro radio da lista
    }
});

colorSnake.forEach(radio => {
    radio.addEventListener('change', colorSelected);
});

function colorSelected() {
    const selected = document.querySelector('input.colorSnake:checked');
    
    if (selected.value == 'green') skinColor = ['green', 'lime'];
    else if (selected.value == 'orange') skinColor = ['darkOrange', 'gold'];
    else if (selected.value == 'blue') skinColor = ['darkBlue', 'mediumBlue'];
    else if (selected.value == 'purple') skinColor = ['darkViolet', 'blueViolet'];

    selected.blur();
    drawModel();
}


function startGame() {
  if (isWaitingToRestart) {
      resetGame();
      setTimeout(1500)
      isWaitingToRestart = false;
  }
  if (!isGameStarted) {
      isGameStarted = true;
      timeInterval = setInterval(function() {
        time = time + 0.1;
        document.getElementById('timeInterval').textContent = time.toFixed(1);
        }, 100);
      clearInterval(gameInterval)
      gameInterval = setInterval(draw, speed);
  }
}

document.addEventListener('keydown', function(e) {
    startGame();
    directionControl(e);
});

function directionControl(event) {
  if (event.key === 'ArrowLeft' || event.key === 'a') direction = 'LEFT';
  else if (event.key === 'ArrowUp' || event.key === 'w') direction = 'UP';
  else if (event.key === 'ArrowRight' || event.key === 'd') direction = 'RIGHT';
  else if (event.key === 'ArrowDown' || event.key === 's') direction = 'DOWN';
}

function draw() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, 600, 600);

  // Desenha a cobrinha
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = (i === 0) ? skinColor[1] : skinColor[0];
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
    score += 5;
    document.getElementById('score').textContent = score;
    eatSound.play();
    foodRandon();
    // Aumenta a velocidade
    clearInterval(gameInterval);
    speed = Math.max(50, speed - 5); // limite mínimo
    gameInterval = setInterval(draw, speed);
  } else {
    snake.pop(); // remove o rabo
  }

  // Nova cabeça
  let newHead = { x: headX, y: headY };

  // Game Over: bate na parede ou em si mesmo
  if (headX < 0 || headY < 0 || headX >= 600 || headY >= 600 || collision(newHead, snake)) {
    gameOverSound.play();
    clearInterval(timeInterval);
    clearInterval(gameInterval);
    isGameStarted = false;
    isWaitingToRestart = true;
    document.addEventListener('keydown', startGame, { once: true });
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
  saveScore(score, time.toFixed(1));
  score = 0;
  time = 0;
  document.getElementById('score').textContent = score;
  snake = [];
  snake[0] = { x: 9 * box, y: 9 * box };
  direction = 'RIGHT';
  speed = 200;
  foodRandon();
  clearInterval(gameInterval);
  gameInterval = setInterval(draw, speed);
}


// Atualizar após uma partida
function saveScore(newScore, newTime) {
  // Selecionar dados atualizados
  let data = JSON.parse(localStorage.getItem('jogoData'));
  const ul = document.getElementById('scoreboard');

  let partida = {
    pontuacao: newScore,
    tempo: newTime,
  };

  // Verificar se é recorde
  if (newScore > data.record.pontuacao) {
    data.record.pontuacao = newScore;
    data.record.tempo = newTime;
  }
  
  // Inserir pontuação na lista
  data.partidas.unshift(partida)
  
  // Manter somente as 4 últimas
  if (data.partidas.length > 4) {
    data.partidas.pop();
  }
  
  // Exibir pontuações
  document.getElementById('record').textContent = `Pontuação: ${data.record.pontuacao} Tempo: ${data.record.tempo}`;
  
  ul.innerHTML = '';
  data.partidas.forEach((partida, i) => {
    const li = document.createElement('li');

    li.textContent = `${i + 1}. Pontuação: ${partida.pontuacao} Tempo: ${partida.tempo}`;
    ul.appendChild(li);
  });

  localStorage.setItem('jogoData', JSON.stringify(data));
}

function drawModel() {
  ctx2.fillStyle = '#111';
  ctx2.fillRect(0, 0, 300, 150);

  // Desenha a cobrinha
  for (let i = 0; i < 3; i++) {
    ctx2.fillStyle = (i === 0) ? skinColor[1] : skinColor[0];
    ctx2.fillRect(120 - (30 * i), 60, box, box);
  }
  // ctx2.fillStyle = skinColor[0];
  // ctx2.fillRect(60, 90, box, box)

  // Desenha a comida
  ctx2.fillStyle = 'red';
  ctx2.fillRect(210, 60, box, box);
}
drawModel();
