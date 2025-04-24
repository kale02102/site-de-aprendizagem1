//Classe explosão
class Explosion {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 10;
    this.alpha = 255;
  }

  draw() {
    noStroke();
    fill(255, this.alpha);
    ellipse(this.x, this.y, this.size, this.size);
    this.size += 2;
    this.alpha -= 10; // vai desbotando
  }

  isFinished() {
    return this.alpha <= 0;
  }
}

//Classe estrelas
class Star {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(0.25, 2);
    this.t = random(TAU);
  }
  draw() {
    this.t += 0.1;
    var scale = this.size + sin(this.t) * 2;
    noStroke();
    fill(255);
    ellipse(this.x, this.y, scale, scale);
  }
}

//Classe munição (laser)
class Bullet {
  constructor(posX, posY, color) {
    this.posX = posX;
    this.posY = posY;
    this.color = color;
  }

  draw() {
    noStroke();
    fill(this.color);
    ellipse(this.posX, this.posY, 6, 20);
    this.posY -= 15;
  }
}

//Classe Player (foguete)
class Player {
  constructor(posX, posY, size, color, controls) {
    this.posX = posX;
    this.posY = posY;
    this.size = size;
    this.color = color;
    this.controls = controls;
    this.flash = 0;
  }

  draw() {
    push();
    translate(this.posX, this.posY);
    strokeWeight(2);
    fill(this.flash > 0 ? 255 : this.color);
    stroke(0);
    beginShape();
    vertex(0, -this.size);
    vertex(-this.size/2, this.size);
    vertex(this.size/2, this.size);
    endShape(CLOSE);
    fill(0, 100, 255);
    ellipse(0, 0, this.size/2);
    if (frameCount % 4 === 0) {
      fill(255, random(100, 255), 0);
      triangle(-5, this.size, 0, this.size + random(10, 20), 5, this.size);
    }
    pop();

    if (this.flash > 0) this.flash--;
  }

  move() {
    if (keyIsDown(this.controls.left) && this.posX >= 5) this.posX -= 10;
    if (keyIsDown(this.controls.right) && this.posX <= width - this.size) this.posX += 10;
    if (keyIsDown(this.controls.up) && this.posY >= 5 + this.size) this.posY -= 10;
    if (keyIsDown(this.controls.down) && this.posY <= height - this.size) this.posY += 10;
  }
}

//Classe inimigo
class Enemy {
  constructor(posX, posY, size) {
    this.posX = posX;
    this.posY = posY;
    this.size = size;
    this.dir = random([-1, 1]);
    this.explosions = []; // Armazena as explosões
  }

  draw() {
    this.posX += this.dir * 2;
    this.posY += 1;

    push();
    translate(this.posX, this.posY);
    noStroke();
    fill(100, 255, 200);
    ellipse(0, 0, this.size*2.5, this.size);
    fill(200, 255, 255);
    arc(0, -5, this.size*1.5, this.size, PI, 0);

    for (let i = -1; i <= 1; i++) {
      fill(random(255), random(255), random(255));
      ellipse(i*this.size*0.8, this.size*0.2, 5);
    }
    pop();

    // Desenha e atualiza as explosões
    this.explosions.forEach((explosion, index) => {
      explosion.draw();
      if (explosion.isFinished()) {
        this.explosions.splice(index, 1); // Remove explosões terminadas
      }
    });
  }

  // Método para gerar explosão
  explode() {
    this.explosions.push(new Explosion(this.posX, this.posY));
  }
}

//Declaração geral
let enemies = [];
let bullets = [];
let timer = 1;
let points = 0;
let stars = [];
let gameOver = false; // Variável para verificar se o jogo acabou

let player1, player2;

function setup() {
  createCanvas(displayWidth, 0.5*displayHeight);
  for (var i = 0; i < 1000; i++) stars[i] = new Star();
  player1 = new Player(width/3, 0.9*height, 30, "#FFDD00", {
    left: LEFT_ARROW, right: RIGHT_ARROW, up: UP_ARROW, down: DOWN_ARROW, shoot: 32 // espaço
  });
  player2 = new Player(2*width/3, 0.9*height, 30, "#FF0077", {
    left: 65, right: 68, up: 87, down: 83, shoot: ENTER
  });
  generateRandomEnemies();
}

function draw() {
  if (gameOver) {
    displayGameOver();
    return; // Para o jogo após a tela de Game Over
  }

  background("black");
  for (var i = 0; i < stars.length; i++) stars[i].draw();

  player1.draw(); player1.move();
  player2.draw(); player2.move();

  bullets.forEach(b => b.draw());
  enemies.forEach(e => e.draw());

  checkHit();

  if (frameCount % 60 == 0 && timer > 0) {
    timer--;
    if (timer == 0) {
      generateEnemy();
      timer = 1;
    }
  }

  noStroke();
  fill("lime");
  textSize(25);
  textFont('Courier New');
  text("Score: " + points, 10, 30);
}

function keyReleased() {
  if (keyCode === player1.controls.shoot) {
    shoot(player1.posX, player1.posY, color(0, 255, 255)); // azul claro
  }
  if (keyCode === player2.controls.shoot) {
    shoot(player2.posX, player2.posY, color(255, 50, 200)); // rosa
  }
  return false;
}

function shoot(x, y, cor) {
  bullets.push(new Bullet(x, y - 30, cor));
  bullets = bullets.filter(b => b.posY > -50);
}

function generateRandomEnemies() {
  for (let i = 0; i < 1; i++) {
    enemies.push(new Enemy(random(0.3*width, 0.6*width), random(0.1*height, 0.2*height), 20));
  }
}

function generateEnemy() {
  enemies.push(new Enemy(random(0.3*width, 0.6*width), random(0.1*height, 0.2*height), 20));
}

function checkHit() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    for (let j = enemies.length - 1; j >= 0; j--) {
      let d = dist(bullets[i].posX, bullets[i].posY, enemies[j].posX, enemies[j].posY);
      if (d < enemies[j].size) {
        enemies[j].explode(); // Adiciona a explosão ao ser atingido
        enemies.splice(j, 1);
        bullets.splice(i, 1);
        points += 5;
        break;
      }
    }
  }

  for (let i = 0; i < enemies.length; i++) {
    if (dist(enemies[i].posX, enemies[i].posY, player1.posX, player1.posY) < player1.size) {
      points = 0;
      player1.flash = 10;
      gameOver = true; // Jogo acabou
    }
    if (dist(enemies[i].posX, enemies[i].posY, player2.posX, player2.posY) < player2.size) {
      points = 0;
      player2.flash = 10;
      gameOver = true; // Jogo acabou
    }
  }
}

function resetPlayers() {
  enemies = [];
  bullets = [];
  player1.posX = width/3;
  player2.posX = 2*width/3;
  player1.posY = player2.posY = 0.9*height;
  generateRandomEnemies();
}

function displayGameOver() {
  background(0, 0, 0, 200);
  textSize(50);
  textAlign(CENTER, CENTER);
  fill(255, 0, 0);
  text("GAME OVER", width / 2, height / 2 - 50);
  textSize(30);
  fill(255);
  text("Pontuação: " + points, width / 2, height / 2 + 10);
  textSize(20);
  text("Pressione 'R' para reiniciar", width / 2, height / 2 + 50);
}

function keyPressed() {
  if (gameOver && key === R) {
    // Reinicia o jogo
    gameOver = false;
    points = 0;
    enemies = [];
    bullets = [];
    player1.posX = width / 3;
    player1.posY = 0.9 * height;
    player2.posX = 2 * width / 3;
    player2.posY = 0.9 * height;
    generateRandomEnemies();
  }
}

function mousePressed() {
  if (mouseX > 0 && mouseX < displayWidth && mouseY > 0 && mouseY < displayHeight) {
    fullscreen(!fullscreen());
  }
}
