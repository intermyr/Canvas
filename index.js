function rndmInterval(min, max) {
  return Math.random() * (max - min) + min;
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const playButton = document.getElementById("play");

const needleImg = new Image();
needleImg.src = "needle.png";

const colors = ["Green", "Purple", "Red"];

const balloonColor = colors.map((el) => {
  let balloon = new Image();
  balloon.src = `balloon${el}.png`;
  return balloon;
});

let isPlaying = false,
  remainingTime = 60,
  balloonsCount = 0,
  poppedBalloonsCount = 0,
  balloons = [],
  spawnRate = 700,
  speedRate = 1,
  lastSpawn = null,
  direction = 0;

let rightPressed = false,
  leftPressed = false;

const windDirection = setInterval(() => {
  direction = Math.round(rndmInterval(-1, 1));
}, 10000);

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
playButton.addEventListener("click", buttonHandler, false);

function mouseMoveHandler(e) {
  var relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    needle.x = relativeX - needle.w / 2;
  }
}

function keyDownHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = true;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = false;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = false;
  }
}

const needle = {
  x: canvas.width / 2,
  y: 27,
  w: 9,
  h: 100,
  speed: 8,
};

function drawNeedle() {
  ctx.drawImage(needleImg, needle.x, needle.y);
}

function needleControls() {
  if (rightPressed) {
    needle.x += needle.speed;
    if (needle.x + needle.w > canvas.width) {
      needle.x = canvas.width - needle.w;
    }
  } else if (leftPressed) {
    needle.x -= needle.speed;
    if (needle.x < 0) {
      needle.x = 0;
    }
  }
}

class Balloon {
  constructor(x, speed, scale, color) {
    this.x = x;
    this.dx = 0;
    this.y = canvas.height + 48;
    this.w = 27;
    this.h = 48;
    this.speed = speed;
    this.scale = scale;
    this.pop = false;
    this.image = color;
  }

  draw() {
    if (this.pop === false && this.y > -(this.h * this.scale)) {
      ctx.drawImage(
        this.image,
        this.x,
        this.y,
        this.w * this.scale,
        this.h * this.scale
      );
      this.y -= this.speed;
      this.x += this.dx;
    }
  }
}

function spawnRandomBalloon() {
  const x = Math.random() * (canvas.width - 200),
    speed = rndmInterval(1, 2) * speedRate,
    scale = rndmInterval(1, 2),
    color = balloonColor[Math.floor(Math.random() * balloonColor.length)];
  balloons.push(new Balloon(x, speed, scale, color));
  balloonsCount++;
}

function blowWind(balloon) {
  let power = rndmInterval(0, 1);

  if (direction === 1) {
    balloon.dx = power * (300 / balloon.x);
  } else if (direction === -1) {
    balloon.dx = (-power * balloon.x) / 300;
  }
}

function drawTimer() {
  ctx.font = "18px pixel";
  ctx.fillStyle = "white";
  ctx.textBaseline = "hanging";
  ctx.fillText(remainingTime, 20, 3);
}

function drawEndGame() {
  ctx.font = "24px pixel";
  ctx.fillStyle = "white";
  ctx.textBaseline = "hanging";
  ctx.textAlign = "center";
  ctx.fillText(`Balloons popped`, canvas.width / 2, canvas.height / 2 - 50);
  ctx.fillText(
    `${poppedBalloonsCount} out of ${balloonsCount}`,
    canvas.width / 2,
    canvas.height / 2
  );
}

function drawStartGame() {
  ctx.font = "24px pixel";
  ctx.fillStyle = "white";
  ctx.textBaseline = "hanging";
  ctx.textAlign = "center";
  ctx.fillText(`Press button to `, canvas.width / 2, canvas.height / 2 - 50);
}

function collisionDetection(balloon) {
  if (balloon.pop === false) {
    if (
      needle.x > balloon.x &&
      needle.x < balloon.x + balloon.w * balloon.scale &&
      needle.y + needle.h - 10 > balloon.y &&
      needle.y + needle.h < balloon.y + balloon.h
    ) {
      balloon.pop = true;
      poppedBalloonsCount++;
    }
    if (balloon.x + balloon.w * balloon.scale > canvas.width || balloon.x < 0) {
      balloon.dx = 0;
    }
  }
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function gameCycle() {
  if (isPlaying) {
    if (remainingTime > 0) {
      const time = Date.now();
      clear();

      drawNeedle();
      drawTimer();

      if (time > lastSpawn + spawnRate) {
        lastSpawn = time;
        spawnRandomBalloon();
      }

      for (let i = 0; i < balloons.length; i++) {
        const balloon = balloons[i];
        blowWind(balloon);
        collisionDetection(balloon);
        balloon.draw();
      }

      needleControls();

      requestAnimationFrame(gameCycle);
      spawnRate -= 0.12;
      speedRate += 0.001;
    } else {
      clear();
      for (let i = 0; i < balloons.length; i++) {
        const balloon = balloons[i];
        balloon.draw();
      }
      drawEndGame();
      requestAnimationFrame(gameCycle);
    }
  } else {
    clear();
    drawStartGame();
    requestAnimationFrame(gameCycle);
  }
}

gameCycle();

const gameTick = setInterval(() => {
  if (isPlaying) {
    remainingTime -= 1;
  }
}, 1000);

function buttonHandler(e) {
  playButton.style.display = "none";
  isPlaying = true;
  setTimeout(() => {
    if (remainingTime < 1) {
      clearInterval(gameTick);
      clearInterval(windDirection);
    }
  }, remainingTime * 1000);
}
