const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
const gameOverScreen = document.getElementById("game-over-screen")
const finalScore = document.getElementById("final-score")
const restartBtn = document.getElementById("restart-btn")
const countdownScreen = document.getElementById("countdown-screen")
const heartContainer = document.getElementById("heart-container")
const hearts = document.querySelectorAll(".heart")
const backButton = document.getElementById("back-button")

const questionText = document.querySelector(".question-text")

const choice1 = document.querySelector(".choice1");
const choice1Text = document.querySelector(".choice1 .choice-text"); 
const choice2 = document.querySelector(".choice2");
const choice2Text = document.querySelector(".choice2 .choice-text");
const choice3 = document.querySelector(".choice3");
const choice3Text = document.querySelector(".choice3 .choice-text");
const choice4 = document.querySelector(".choice4");
const choice4Text = document.querySelector(".choice4 .choice-text");

const timerText = document.querySelector(".timer-text")
const boardQuestion = document.querySelector(".boardquestion")
const choices = document.querySelectorAll(".choice")
const choiceTexts = document.querySelectorAll(".choice-text")

const touchUp = document.querySelector(".touch-up")
const touchDown = document.querySelector(".touch-down")
const touchLeft = document.querySelector(".touch-left")
const touchRight = document.querySelector(".touch-right")

const levelCompleteScreen = document.getElementById("level-complete-screen");
const levelCompleteMessage = document.getElementById("level-complete-message"); 
const nextLevelBtn = document.getElementById("next-level-btn"); 
const levelDisplayText = document.getElementById("level-display"); 
const scoreDivText = document.querySelector(".score > .score-text"); 

const backgroundImage = new Image()
backgroundImage.src = "images/background.png"; 
backgroundImage.crossOrigin = "anonymous"

const gridSize = 20
let snake = []
let food = { x: 0, y: 0 }
let direction = "right"
let nextDirection = "right"
let gameRunning = true
let isDead = false
let timerInterval
let timeLeft = 0
let questionActive = false
let currentQuestion = null
let countdownInterval
let lives = 3
let isHurting = false
let snakeShakeOffset = { x: 0, y: 0 }
let lastTapTime = 0
const doubleTapDelay = 300

let currentLevel = 1; 

let maze = [];
let MAZE_COLS;
let MAZE_ROWS;
const rockyTexture = createRockyTexture();

let mouthState = "closed"; 
let mouthProgress = 0; let mouthAnimationStartTime = 0; const mouthAnimationDuration = 150; const mouthOpenDuration = 300; let lastFoodEatenTime = 0; const keepMouthOpenAfterEating = 500; let tongueAnimationPhase = 0; let headWobblePhase = 0; let jawRotation = 0; let jawOpenAmount = 0; let tongueOut = false;
let isSwallowing = false; let swallowProgress = 0; let swallowBulgePosition = 0; let swallowStartTime = 0; const swallowDuration = 1000;
let growthPulse = 0; let isPulsing = false; 
let scoreAnimations = [];
let screenShake = { active: false, intensity: 0, duration: 0, stepsElapsed: 0, startTime: 0 };
let lightningEffect = { active: false, alpha: 0, duration: 0, stepsElapsed: 0, startTime: 0, color: "#ffffff" };
const TIME_PASSED_PER_STEP = 0.1; 


const bgMusic = new Audio(); bgMusic.src = "../audios/backgroundmusic.mp3"; bgMusic.loop = true; bgMusic.volume = 0.3;
const eatingSound = new Audio(); eatingSound.src = "../audios/success.wav"; eatingSound.volume = 0.7;
const correctAnswerSound = new Audio(); correctAnswerSound.src = "../audios/correct.wav"; correctAnswerSound.volume = 0.7;
const wrongAnswerSound = new Audio(); wrongAnswerSound.src = "../audios/lose-health.wav"; wrongAnswerSound.volume = 0.7;
const tickingSound = new Audio(); tickingSound.src = "../audios/game-question.wav"; tickingSound.volume = 0.5; tickingSound.loop = true;
const loseLifeSound = new Audio(); loseLifeSound.src = "../audios/lose-health.wav"; loseLifeSound.volume = 0.7;
const gameOverSound = new Audio(); gameOverSound.src = "../audios/lose.wav"; gameOverSound.volume = 0.7;
const clickSound = new Audio(); clickSound.src = "../audios/click.mp3"; clickSound.volume = 0.5;


let soundEnabled = true; let globalShakeInterval = null;

function playSound(sound) { if (soundEnabled && sound) { sound.currentTime = 0; sound.play().catch((error) => { console.error("Error playing sound:", sound.src, error); });}}
function toggleSound() {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
        if (bgMusic && bgMusic.paused) {
            const playPromise = bgMusic.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn("bgMusic play failed in toggleSound. User interaction might be needed.", error);
                   
                    addInteractionListenersForMusic();
                });
            }
        }
        if(document.getElementById("sound-toggle")) document.getElementById("sound-toggle").textContent = "🔊";
    } else {
        if(bgMusic) bgMusic.pause();
        if(tickingSound) tickingSound.pause();
        if(document.getElementById("sound-toggle")) document.getElementById("sound-toggle").textContent = "🔇";
    }
}

function addInteractionListenersForMusic() {
    const startMusicOnInteraction = () => {
        if (soundEnabled && bgMusic && bgMusic.paused) {
            bgMusic.play().catch(e => console.error("Error playing music after interaction:", e));
        }
        window.removeEventListener('click', startMusicOnInteraction);
        window.removeEventListener('keydown', startMusicOnInteraction);
        window.removeEventListener('touchstart', startMusicOnInteraction);
    };
    window.addEventListener('click', startMusicOnInteraction, { once: true });
    window.addEventListener('keydown', startMusicOnInteraction, { once: true });
    window.addEventListener('touchstart', startMusicOnInteraction, { once: true });
}


function resizeCanvas() {
  const container = document.getElementById("game-container");
  if (!container) return;
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;
  const oldCanvasWidth = canvas.width;
  const oldCanvasHeight = canvas.height;
  canvas.width = Math.floor(containerWidth / gridSize) * gridSize;
  canvas.height = Math.floor(containerHeight / gridSize) * gridSize;
  if (canvas.width !== oldCanvasWidth || canvas.height !== oldCanvasHeight) { resetGame(); }
  else { if (gameRunning || isDead || questionActive) draw(); }
}

function initializeMazeState() {
  MAZE_COLS = Math.floor(canvas.width / gridSize); MAZE_ROWS = Math.floor(canvas.height / gridSize);
  if (MAZE_COLS <= 2 || MAZE_ROWS <= 2) {
    maze = []; for (let r = 0; r < MAZE_ROWS; r++) { maze[r] = []; for (let c = 0; c < MAZE_COLS; c++) { maze[r][c] = (r === 0 || r === MAZE_ROWS -1 || c === 0 || c === MAZE_COLS -1) ? 1: 0; } } return;
  }
  maze = []; for (let r = 0; r < MAZE_ROWS; r++) { maze[r] = []; for (let c = 0; c < MAZE_COLS; c++) { maze[r][c] = 1; } }
}

function generateMazeRecursiveBacktracker() {
  initializeMazeState(); if (MAZE_COLS <= 2 || MAZE_ROWS <= 2) return;
  const stack = [];
  let startR = Math.floor(Math.random() * (MAZE_ROWS - 2)); if (startR % 2 === 0) startR = (startR + 1 < MAZE_ROWS -1) ? startR + 1 : (startR -1 > 0 ? startR -1 : 1) ; if (startR <=0) startR = 1; if (startR >= MAZE_ROWS -1) startR = MAZE_ROWS -2;
  let startC = Math.floor(Math.random() * (MAZE_COLS - 2)); if (startC % 2 === 0) startC = (startC + 1 < MAZE_COLS-1) ? startC + 1 : (startC -1 > 0 ? startC -1 : 1) ; if (startC <=0) startC = 1; if (startC >= MAZE_COLS -1) startC = MAZE_COLS -2;
  if (maze[startR]) maze[startR][startC] = 0; stack.push([startR, startC]);
  while (stack.length > 0) {
    const [r, c] = stack[stack.length - 1]; const neighbors = [];
    if (r - 2 > 0 && maze[r - 2] && maze[r - 2][c] === 1) neighbors.push([r - 2, c, r - 1, c]);
    if (r + 2 < MAZE_ROWS - 1 && maze[r + 2] && maze[r + 2][c] === 1) neighbors.push([r + 2, c, r + 1, c]);
    if (c - 2 > 0 && maze[r][c - 2] === 1) neighbors.push([r, c - 2, r, c - 1]);
    if (c + 2 < MAZE_COLS - 1 && maze[r][c + 2] === 1) neighbors.push([r, c + 2, r, c + 1]);
    if (neighbors.length > 0) { const [nextR, nextC, wallR, wallC] = neighbors[Math.floor(Math.random() * neighbors.length)]; maze[nextR][nextC] = 0; maze[wallR][wallC] = 0; stack.push([nextR, nextC]); } else { stack.pop(); }
  }
  for (let r_idx = 0; r_idx < MAZE_ROWS; r_idx++) { if (maze[r_idx]) { maze[r_idx][0] = 1; maze[r_idx][MAZE_COLS - 1] = 1;}}
  for (let c_idx = 0; c_idx < MAZE_COLS; c_idx++) { if (maze[0]) maze[0][c_idx] = 1; if (maze[MAZE_ROWS - 1]) maze[MAZE_ROWS - 1][c_idx] = 1; }
}

function getAllPathCells() {
    const pathCells = []; if (!maze || maze.length === 0) return pathCells;
    for (let r = 0; r < MAZE_ROWS; r++) { for (let c = 0; c < MAZE_COLS; c++) { if (maze[r] && maze[r][c] === 0) { pathCells.push({ r, c }); } } } return pathCells;
}

function setInitialSnakePosition() {
    const pathCells = getAllPathCells(); 
    snake = []; 
    if (pathCells.length === 0 && (MAZE_COLS > 2 && MAZE_ROWS > 2)) { snake = [{ x: gridSize, y: gridSize }]; direction = "right"; nextDirection = "right"; return; }
    if (pathCells.length === 0) { snake = [{ x: gridSize, y: gridSize }]; direction = "right"; nextDirection = "right"; return; }

    let placed = false; let attempts = 0; const maxAttempts = pathCells.length * 5 + 20;
    while (!placed && attempts < maxAttempts) {
        attempts++; const headCandidateCell = pathCells[Math.floor(Math.random() * pathCells.length)]; const rH = headCandidateCell.r; const cH = headCandidateCell.c;
        if (cH - 2 >= 0 && maze[rH] && maze[rH][cH-1] === 0 && maze[rH][cH-2] === 0) { snake = [ { x: cH * gridSize, y: rH * gridSize }, { x: (cH - 1) * gridSize, y: rH * gridSize }, { x: (cH - 2) * gridSize, y: rH * gridSize }, ]; direction = "right"; nextDirection = "right"; placed = true; }
        else if (cH + 2 < MAZE_COLS && maze[rH] && maze[rH][cH+1] === 0 && maze[rH][cH+2] === 0) { snake = [ { x: cH * gridSize, y: rH * gridSize }, { x: (cH + 1) * gridSize, y: rH * gridSize }, { x: (cH + 2) * gridSize, y: rH * gridSize }, ]; direction = "left"; nextDirection = "left"; placed = true; }
        else if (rH - 2 >= 0 && maze[rH-1] && maze[rH-1][cH] === 0 && maze[rH-2] && maze[rH-2][cH] === 0) { snake = [ { x: cH * gridSize, y: rH * gridSize }, { x: cH * gridSize, y: (rH - 1) * gridSize }, { x: cH * gridSize, y: (rH - 2) * gridSize }, ]; direction = "down"; nextDirection = "down"; placed = true; }
        else if (rH + 2 < MAZE_ROWS && maze[rH+1] && maze[rH+1][cH] === 0 && maze[rH+2] && maze[rH+2][cH] === 0) { snake = [ { x: cH * gridSize, y: rH * gridSize }, { x: cH * gridSize, y: (rH + 1) * gridSize }, { x: cH * gridSize, y: (rH + 2) * gridSize }, ]; direction = "up"; nextDirection = "up"; placed = true; }
    }
    if (!placed) { 
        const startCell = pathCells[Math.floor(Math.random() * pathCells.length)]; snake = [{ x: startCell.c * gridSize, y: startCell.r * gridSize }]; const {r, c} = startCell;
        if (c + 1 < MAZE_COLS && maze[r] && maze[r][c+1] === 0) { direction = "right"; nextDirection = "right"; }
        else if (c - 1 >= 0 && maze[r] && maze[r][c-1] === 0) { direction = "left"; nextDirection = "left"; }
        else if (r + 1 < MAZE_ROWS && maze[r+1] && maze[r+1][c] === 0) { direction = "down"; nextDirection = "down"; }
        else if (r - 1 >= 0 && maze[r-1] && maze[r-1][c] === 0) { direction = "up"; nextDirection = "up"; }
        else {direction = "right"; nextDirection = "right";} 
    }
    if (snake.length === 0) { 
        snake = [{ x: gridSize, y: gridSize }]; direction = "right"; nextDirection = "right";
    }
}

function generateFood() {
    if (!maze || maze.length === 0 || !snake || snake.length === 0) { food = {x:-gridSize, y:-gridSize}; return; }
    const pathCells = getAllPathCells(); if (pathCells.length === 0) { food = { x: -gridSize, y: -gridSize }; return; }
    let foodCell = null; let attempts = 0; const maxAttempts = pathCells.length * 2 + 10;
    do {
        const potentialCell = pathCells[Math.floor(Math.random() * pathCells.length)]; const potentialFoodPos = { x: potentialCell.c * gridSize, y: potentialCell.r * gridSize };
        const isOnSnake = snake.some(segment => segment.x === potentialFoodPos.x && segment.y === potentialFoodPos.y);
        if (!isOnSnake) foodCell = potentialFoodPos; attempts++;
    } while (!foodCell && attempts < maxAttempts);
    if (foodCell) { food = foodCell; } else {
        const availablePathCells = pathCells.filter(cell => !snake.some(s => s.x === cell.c * gridSize && s.y === cell.r * gridSize));
        if (availablePathCells.length > 0) { const finalChoice = availablePathCells[Math.floor(Math.random() * availablePathCells.length)]; food = { x: finalChoice.c * gridSize, y: finalChoice.r * gridSize }; }
        else { food = {x: -gridSize, y: -gridSize}; }
    }
}

function drawMaze() { if (!maze || maze.length === 0) return; ctx.fillStyle = rockyTexture; for (let r = 0; r < MAZE_ROWS; r++) { for (let c = 0; c < MAZE_COLS; c++) { if (maze[r] && maze[r][c] === 1) { ctx.fillRect(c * gridSize, r * gridSize, gridSize, gridSize); }}}}
function createRockyTexture() { const tC = document.createElement("canvas"); tC.width = 100; tC.height = 100; const tX = tC.getContext("2d"); tX.fillStyle = "#7a6848"; tX.fillRect(0, 0, 100, 100); tX.strokeStyle = "#54442F"; tX.lineWidth = 1.5; for (let i = 0; i < 30; i++) { tX.beginPath(); tX.moveTo(Math.random() * 100, Math.random() * 100); tX.bezierCurveTo(Math.random() * 100,Math.random() * 100,Math.random() * 100,Math.random() * 100,Math.random() * 100,Math.random() * 100); tX.stroke(); } for (let i = 0; i < 20; i++) { tX.fillStyle = `rgba(60, 50, 30, ${Math.random() * 0.4})`; tX.beginPath(); tX.arc(Math.random() * 100,Math.random() * 100,Math.random() * 6 + 3,0,Math.PI*2); tX.fill(); } for (let i = 0; i < 15; i++) { tX.fillStyle = `rgba(160, 140, 110, ${Math.random() * 0.3})`; tX.beginPath(); tX.arc(Math.random() * 100,Math.random() * 100,Math.random() * 4 + 2,0,Math.PI*2); tX.fill(); } return ctx.createPattern(tC, "repeat");}

function createScoreAnimation(v,x,y){scoreAnimations.push({value:v>0?`+${v}`:v,x:x,y:y,alpha:1,scale:1.5,color:v>0?"#ffcc00":"#ff5555",life:60})}
function updateScoreAnimations(){for(let i=scoreAnimations.length-1;i>=0;i--){const a=scoreAnimations[i];a.y-=1;a.alpha-=0.02;a.scale-=0.01;a.life--;if(a.life<=0)scoreAnimations.splice(i,1)}}
function drawScoreAnimations(){for(const a of scoreAnimations){ctx.save();ctx.globalAlpha=a.alpha;ctx.font=`bold ${Math.floor(24*a.scale)}px Arial`;ctx.fillStyle=a.color;ctx.strokeStyle="#000";ctx.lineWidth=3;ctx.textAlign="center";ctx.strokeText(a.value,a.x,a.y);ctx.fillText(a.value,a.x,a.y);ctx.restore()}}
function createScreenShake(intensity,durationInSteps){screenShake={active:true,intensity:intensity,duration:durationInSteps,stepsElapsed:0}}
function updateScreenShake(){if(!screenShake.active)return;screenShake.stepsElapsed++;if(screenShake.stepsElapsed>=screenShake.duration){screenShake.active=false;canvas.style.transform="translate(0,0)";return}const p=screenShake.stepsElapsed/screenShake.duration;const cI=screenShake.intensity*(1-p);canvas.style.transform=`translate(${(Math.random()-.5)*cI*2}px,${(Math.random()-.5)*cI*2}px)`}
function createLightningEffect(color,durationInSteps){lightningEffect={active:true,alpha:.7,color:color||"#fff",duration:durationInSteps,stepsElapsed:0}}
function updateLightningEffect(){if(!lightningEffect.active)return;lightningEffect.stepsElapsed++;if(lightningEffect.stepsElapsed>=lightningEffect.duration){lightningEffect.active=false;return}const p=lightningEffect.stepsElapsed/lightningEffect.duration;lightningEffect.alpha=.7*(1-p)}
function drawLightningEffect(){if(!lightningEffect.active)return;ctx.save();ctx.fillStyle=lightningEffect.color;ctx.globalAlpha=lightningEffect.alpha;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore()}

let statisticsQuestions = []; fetch('./questions.json').then(r=>r.json()).then(d=>{statisticsQuestions=d}).catch(e=>console.error('Error loading questions:',e));

function updateHeartsDisplay(){hearts.forEach((h,i)=>{if(i<lives)h.classList.remove("lost");else h.classList.add("lost")})}
function startTimer(s){timeLeft=s;updateTimerDisplay();if(timerText)timerText.style.color="white";clearInterval(timerInterval);timerInterval=setInterval(()=>{timeLeft--;updateTimerDisplay();if(timeLeft<=5){if(timerText)timerText.style.color="#ff5555";if(timeLeft===5&&tickingSound){tickingSound.currentTime=0;playSound(tickingSound)}}if(timeLeft<=0){clearInterval(timerInterval);if(tickingSound)tickingSound.pause();questionActive=false;loseLife()}},1000)}
function updateTimerDisplay(){if(!timerText) return; const m=Math.floor(timeLeft/60).toString().padStart(2,"0"),s=(timeLeft%60).toString().padStart(2,"0");timerText.textContent=`${m} : ${s}`}
function showQuestionUI(){
  if(questionText)setTimeout(()=>{
    questionText.classList.add("show")
    questionText.style.marginTop = "13vw";
    questionText.style.fontSize = "3.5vw";
  },50);

    choiceTexts.forEach((t,i)=>{setTimeout(()=>{t.classList.add("show")},100*(i+1)
  )})}
function resetQuestionUI(){if(questionText){questionText.classList.remove("show");questionText.innerHTML="The question will <br>appear here!";questionText.style.marginTop="18vw";questionText.style.marginLeft="1vw"}choiceTexts.forEach(t=>t.classList.remove("show"));if(choice1Text)choice1Text.textContent="";if(choice2Text)choice2Text.textContent="";if(choice3Text)choice3Text.textContent="";if(choice4Text)choice4Text.textContent=""}

function checkMathQuestion(){
    questionActive=true;
    gameRunning=false;
    if(statisticsQuestions.length===0){
        startCountdown();
        return;
    }
    const rI=Math.floor(Math.random()*statisticsQuestions.length);
    currentQuestion=statisticsQuestions[rI];
    if(questionText)questionText.innerHTML=currentQuestion.question;
    if(questionText){
        questionText.style.marginTop="18vw"; 
        questionText.style.marginLeft="1vw"; 
    }
    const sO=[...currentQuestion.options].sort(()=>Math.random()-.5);
    if(choice1Text)choice1Text.textContent=sO[0];
    if(choice2Text)choice2Text.textContent=sO[1]; 
    if(choice3Text)choice3Text.textContent=sO[2];
    if(choice4Text)choice4Text.textContent=sO[3];
    showQuestionUI();
    startTimer(15);
}

function updateLevelDisplay() {
  if (levelDisplayText) { 
    levelDisplayText.textContent = ``;
  }
  if (scoreDivText) {
    scoreDivText.textContent = `Level: ${currentLevel}`;
  }
}

function prepareNextLevel() {
  if (levelCompleteScreen) {
    levelCompleteScreen.classList.remove("show");
    setTimeout(() => { levelCompleteScreen.style.display = "none"; }, 500);
  }
  currentLevel++;
  updateLevelDisplay();
  
  generateMazeRecursiveBacktracker(); 
  setInitialSnakePosition();          
  generateFood();                     
  
  isSwallowing = false; isPulsing = false;
  screenShake = { active: false, intensity: 0, duration: 0, stepsElapsed: 0 };
  lightningEffect = { active: false, alpha: 0, duration: 0, stepsElapsed: 0, color: "#ffffff" };
  if (canvas.style.transform !== "translate(0px, 0px)") { canvas.style.transform = "translate(0px, 0px)"; }
  gameRunning = false; questionActive = false; isDead = false;
  draw(); 
  startCountdown(); 
}

function checkAnswer(selectedAnswer) {
  clearInterval(timerInterval); 
  if(tickingSound) tickingSound.pause();
  if (globalShakeInterval) { clearInterval(globalShakeInterval); globalShakeInterval = null; isHurting = false; snakeShakeOffset = { x: 0, y: 0 }; }

  if (currentQuestion && selectedAnswer !== currentQuestion.correctAnswer) {
    playSound(wrongAnswerSound); isHurting = true;
    let shakeTime = 0; const shakeDuration = 500; const shakeStartTime = Date.now();
    globalShakeInterval = setInterval(() => {
      shakeTime = Date.now() - shakeStartTime;
      if (shakeTime >= shakeDuration || !isHurting) { clearInterval(globalShakeInterval); globalShakeInterval = null; isHurting = false; snakeShakeOffset = { x: 0, y: 0 }; if (!questionActive && !isDead) draw(); return; }
      const progress = shakeTime / shakeDuration; const intensity = 1 - progress;
      snakeShakeOffset = { x: (Math.random() * 6 - 3) * intensity, y: (Math.random() * 6 - 3) * intensity, };
      if (!questionActive && !isDead) draw();
    }, 16);
    createScreenShake(15, 5); createLightningEffect("#ff0000", 3);
    loseLife();
  } else if (currentQuestion) { 
    playSound(correctAnswerSound); createLightningEffect("#00ff00", 3);
    createScoreAnimation(10, canvas.width / 2, canvas.height / 2);
    questionActive = false; gameRunning = false; 
    if (levelCompleteMessage) levelCompleteMessage.textContent = `Level ${currentLevel} Complete!`;
    if (levelCompleteScreen) {
        levelCompleteScreen.style.display = "block";
        setTimeout(() => { levelCompleteScreen.classList.add("show"); }, 50);
    }
  } else { questionActive = false; startCountdown(); }
  resetQuestionUI();
}

function loseLife() {
  lives--; updateHeartsDisplay(); playSound(loseLifeSound);
  questionActive = false; isHurting = false; snakeShakeOffset = {x:0, y:0};
  if (lives <= 0) { gameOver(); }
  else { gameRunning = false; startCountdown(); }
}

function startCountdown() {
  if (globalShakeInterval) { clearInterval(globalShakeInterval); globalShakeInterval = null; }
  isHurting = false; snakeShakeOffset = { x: 0, y: 0 };
  questionActive = false; gameRunning = false; isDead = false;
  clearInterval(countdownInterval);
  let count = 3;
  if (countdownScreen) { 
    countdownScreen.textContent = count; countdownScreen.style.display = "block";
    countdownScreen.style.transform = "scale(2)"; countdownScreen.style.opacity = "0";
    setTimeout(() => { countdownScreen.style.transform = "scale(1)"; countdownScreen.style.opacity = "1"; }, 100);
  }
  function animateDuringCountdown() {
    if (gameRunning) return;
    if (lightningEffect.active) { updateLightningEffect(); if (!lightningEffect.active) lightningEffect.alpha = 0; }
    if (screenShake.active) { updateScreenShake(); if (!screenShake.active) canvas.style.transform = "translate(0,0)"; }
    draw();
    if (!gameRunning && countdownScreen && countdownScreen.style.display === "block") { requestAnimationFrame(animateDuringCountdown); }
    else { if (screenShake.active) canvas.style.transform = "translate(0,0)"; lightningEffect.active = false; lightningEffect.alpha = 0; draw(); }
  }
  requestAnimationFrame(animateDuringCountdown);
  countdownInterval = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(countdownInterval); if (countdownScreen) countdownScreen.style.display = "none";
      screenShake.active = false; canvas.style.transform = "translate(0,0)";
      lightningEffect.active = false; lightningEffect.alpha = 0;
      questionActive = false; isHurting = false; snakeShakeOffset = { x: 0, y: 0 }; isDead = false; gameRunning = true;

      draw(); return;
    }
    if (countdownScreen) {
        countdownScreen.textContent = count;
        countdownScreen.style.transform = "scale(2)"; countdownScreen.style.opacity = "0";
        setTimeout(() => { countdownScreen.style.transform = "scale(1)"; countdownScreen.style.opacity = "1"; }, 100);
    }
  }, 1000);
}

function updateMouthAnimation(){const n=Date.now();if(mouthState==="opening"){const p=(n-mouthAnimationStartTime)/mouthAnimationDuration;if(p>=1){mouthState="open";mouthProgress=1;jawOpenAmount=1;mouthAnimationStartTime=n}else{mouthProgress=p;jawOpenAmount=p}}else if(mouthState==="open"){if(n-mouthAnimationStartTime>=mouthOpenDuration&&n-lastFoodEatenTime>=keepMouthOpenAfterEating){mouthState="closing";mouthAnimationStartTime=n}tongueAnimationPhase+=.3;if(Math.random()<.05)tongueOut=!tongueOut}else if(mouthState==="closing"){const p=(n-mouthAnimationStartTime)/mouthAnimationDuration;if(p>=1){mouthState="closed";mouthProgress=0;jawOpenAmount=0;tongueOut=false}else{mouthProgress=1-p;jawOpenAmount=1-p}}else if(mouthState==="eating"){const eT=n-mouthAnimationStartTime;if(eT<mouthAnimationDuration){mouthProgress=Math.min(1,eT/mouthAnimationDuration);jawOpenAmount=mouthProgress}else if(eT<mouthAnimationDuration+mouthOpenDuration){mouthProgress=1;jawOpenAmount=1;tongueOut=true;tongueAnimationPhase+=.5;headWobblePhase+=.4}else if(eT<mouthAnimationDuration*2+mouthOpenDuration){mouthProgress=1-(eT-(mouthAnimationDuration+mouthOpenDuration))/mouthAnimationDuration;jawOpenAmount=mouthProgress}else{mouthState="closed";mouthProgress=0;jawOpenAmount=0;tongueOut=false;isSwallowing=true;swallowProgress=0;swallowBulgePosition=0;swallowStartTime=n}}if(isSwallowing){const sP=(n-swallowStartTime)/swallowDuration;if(sP>=1){isSwallowing=false}else{swallowProgress=sP;swallowBulgePosition=Math.floor(sP*snake.length*.8)}}}

function gameOver() {
  if (globalShakeInterval) { clearInterval(globalShakeInterval); globalShakeInterval = null; }
  isHurting = false; snakeShakeOffset = { x: 0, y: 0 };
  questionActive = false; gameRunning = false; isDead = true;
  clearInterval(timerInterval); if(bgMusic) bgMusic.pause(); playSound(gameOverSound);
  if(finalScore) finalScore.textContent = `Your Best Level: ${currentLevel}`; 
  createScreenShake(30, 10); createLightningEffect("#ff0000", 10);
  document.body.classList.add("game-over-active");
  if(gameOverScreen) {gameOverScreen.style.display="block";setTimeout(()=>{gameOverScreen.classList.add("show")},50)}
  resetQuestionUI(); draw();
}

function processPlayerMove() {
    if (!gameRunning || questionActive || isDead || !snake || snake.length === 0) return;
    direction = nextDirection; 
    
    updateScoreAnimations();
    updateScreenShake(); updateLightningEffect(); 
    updateMouthAnimation();
    if(isPulsing){growthPulse+=.1;if(growthPulse>=Math.PI){isPulsing=false;growthPulse=0}}

    const newHead = { ...snake[0] }; 
    switch (direction) { 
        case "right": newHead.x += gridSize; break; 
        case "left": newHead.x -= gridSize; break; 
        case "up": newHead.y -= gridSize; break; 
        case "down": newHead.y += gridSize; break; 
    }

    const headGridX = Math.floor(newHead.x / gridSize);
    const headGridY = Math.floor(newHead.y / gridSize);
    let collisionDetected = false;

    if (headGridX < 0 || headGridX >= MAZE_COLS || headGridY < 0 || headGridY >= MAZE_ROWS || (maze[headGridY] && maze[headGridY][headGridX] === 1)) { 
        collisionDetected = true; 
    }
    

    if (collisionDetected) { 
        gameOver(); 
        return; 
    }
    snake.unshift(newHead); 

    if (newHead.x === food.x && newHead.y === food.y) { 
        lastFoodEatenTime = Date.now();
        playSound(eatingSound); createScoreAnimation(1, food.x + gridSize / 2, food.y);
        createScreenShake(5, 2); isPulsing = true; growthPulse = 0; mouthState="eating"; mouthAnimationStartTime=Date.now();
        generateFood(); 
        checkMathQuestion(); 
    } else {
        snake.pop(); 
    }
    
    if (!questionActive && !isDead) { 
        draw(); 
    }
}

function draw() {
  if(screenShake.active){if(!screenShake.stepsElapsed||screenShake.stepsElapsed>=screenShake.duration)canvas.style.transform="translate(0,0)"}else canvas.style.transform="translate(0,0)";
  if(backgroundImage&&backgroundImage.complete)ctx.drawImage(backgroundImage,0,0,canvas.width,canvas.height);else{ctx.fillStyle="#2a623d";ctx.fillRect(0,0,canvas.width,canvas.height)}
  drawMaze(); 
  ctx.strokeStyle="#5a3a20";ctx.lineWidth=8;ctx.strokeRect(0,0,canvas.width,canvas.height);
  if(!snake||snake.length===0)return;
  ctx.lineJoin="round";ctx.lineCap="round";ctx.lineWidth=gridSize;
  let grad;
  grad=ctx.createLinearGradient(0,0,canvas.width,canvas.height);grad.addColorStop(0,"#6aff6a");grad.addColorStop(1,"#00cc66");
  
  ctx.strokeStyle="#007744";ctx.lineWidth=gridSize+4;ctx.beginPath();ctx.moveTo(snake[0].x+gridSize/2+snakeShakeOffset.x,snake[0].y+gridSize/2+snakeShakeOffset.y);for(let i=1;i<snake.length;i++)ctx.lineTo(snake[i].x+gridSize/2+snakeShakeOffset.x,snake[i].y+gridSize/2+snakeShakeOffset.y);ctx.stroke();
  
  ctx.strokeStyle=grad;ctx.lineWidth=gridSize;ctx.beginPath();ctx.moveTo(snake[0].x+gridSize/2+snakeShakeOffset.x,snake[0].y+gridSize/2+snakeShakeOffset.y);for(let i=1;i<snake.length;i++)ctx.lineTo(snake[i].x+gridSize/2+snakeShakeOffset.x,snake[i].y+gridSize/2+snakeShakeOffset.y);ctx.stroke();
  
  ctx.fillStyle="#009955"; 
  for(let i=1;i<snake.length;i++){const s=snake[i];let bE=0;if(isSwallowing){const dB=Math.abs(i-swallowBulgePosition);if(dB<2)bE=Math.max(0,6*(1-dB/2))}let pE=0;if(isPulsing)pE=Math.sin(growthPulse)*3;const tE=bE+pE;if(i%2===0){
    ctx.fillStyle="#007744";
    ctx.beginPath();ctx.arc(s.x+gridSize/2+snakeShakeOffset.x,s.y+gridSize/2+snakeShakeOffset.y,gridSize/6+2+tE,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#009955";
    ctx.beginPath();ctx.arc(s.x+gridSize/2+snakeShakeOffset.x,s.y+gridSize/2+snakeShakeOffset.y,gridSize/6+tE,0,Math.PI*2);ctx.fill()
  }}
  const h=snake[0];let wO=0;if(mouthState==="eating")wO=Math.sin(headWobblePhase)*3;
  ctx.fillStyle="#007744";
  ctx.beginPath();const cX=h.x+gridSize/2+snakeShakeOffset.x,cY=h.y+gridSize/2+snakeShakeOffset.y+wO,bR=gridSize/1.5+2;if(mouthState==="closed"||jawOpenAmount<=0){ctx.arc(cX,cY,bR,0,Math.PI*2)}else{ctx.save();ctx.translate(cX,cY);ctx.beginPath();ctx.arc(0,0,bR,0,Math.PI*2);ctx.fill();ctx.rotate(jawRotation*jawOpenAmount);const jH=bR*.7*jawOpenAmount,jW=bR*(1+.3*jawOpenAmount);ctx.beginPath();ctx.ellipse(0,jH/2,jW,jH,0,0,Math.PI);ctx.fill();ctx.restore()}ctx.fill();
  
  ctx.fillStyle="#00cc66";
  ctx.beginPath();const mR=gridSize/1.5;if(mouthState==="closed"||jawOpenAmount<=0){ctx.arc(cX,cY,mR,0,Math.PI*2)}else{ctx.save();ctx.translate(cX,cY);ctx.beginPath();ctx.arc(0,0,mR,0,Math.PI*2);ctx.fill();ctx.rotate(jawRotation*jawOpenAmount);const jH=mR*.7*jawOpenAmount,jW=mR*(1+.3*jawOpenAmount);ctx.beginPath();ctx.ellipse(0,jH/2,jW,jH,0,0,Math.PI);ctx.fill();if(tongueOut){const tL=mR*(.8+.2*Math.sin(tongueAnimationPhase)),tS=tL/3;ctx.fillStyle="#ff6666";ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(tL,-tS);ctx.lineTo(tL,tS);ctx.closePath();ctx.fill();ctx.fillStyle="#ff99aa";ctx.beginPath();ctx.arc(tL,-tS,3,0,Math.PI*2);ctx.arc(tL,tS,3,0,Math.PI*2);ctx.fill()}ctx.restore()}ctx.fill();
  
  let eOX=0,eOY=wO,pOX=0,pOY=0;switch(direction){case"right":eOX=gridSize/3-(gridSize/10)*mouthProgress;pOX=gridSize/8;break;case"left":eOX=-gridSize/3+(gridSize/10)*mouthProgress;pOX=-gridSize/8;break;case"up":eOY=-gridSize/3+(gridSize/10)*mouthProgress+wO;pOY=-gridSize/8;break;case"down":eOY=gridSize/3-(gridSize/10)*mouthProgress+wO;pOY=gridSize/8;break}
  const eS=gridSize/3;ctx.fillStyle="white";ctx.beginPath();ctx.arc(h.x+gridSize/3+eOX+snakeShakeOffset.x,h.y+gridSize/3+eOY+snakeShakeOffset.y,eS,0,Math.PI*2);ctx.arc(h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x,h.y+gridSize/3+eOY+snakeShakeOffset.y,eS,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(0,0,0,0.1)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(h.x+gridSize/3+eOX+snakeShakeOffset.x,h.y+gridSize/3+eOY+snakeShakeOffset.y,eS,0,Math.PI*2);ctx.arc(h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x,h.y+gridSize/3+eOY+snakeShakeOffset.y,eS,0,Math.PI*2);ctx.stroke();
  const pS=eS/1.5;ctx.fillStyle="#222";ctx.beginPath();if(isDead){ctx.moveTo(h.x+gridSize/3+eOX+snakeShakeOffset.x-pS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y-pS/2);ctx.lineTo(h.x+gridSize/3+eOX+snakeShakeOffset.x+pS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y+pS/2);ctx.moveTo(h.x+gridSize/3+eOX+snakeShakeOffset.x+pS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y-pS/2);ctx.lineTo(h.x+gridSize/3+eOX+snakeShakeOffset.x-pS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y+pS/2);ctx.moveTo(h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x-pS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y-pS/2);ctx.lineTo(h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x+pS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y+pS/2);ctx.moveTo(h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x+pS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y-pS/2);ctx.lineTo(h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x-pS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y+pS/2);ctx.stroke()}else{ctx.arc(h.x+gridSize/3+eOX+snakeShakeOffset.x+pOX,h.y+gridSize/3+eOY+snakeShakeOffset.y+pOY,pS,0,Math.PI*2);ctx.arc(h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x+pOX,h.y+gridSize/3+eOY+snakeShakeOffset.y+pOY,pS,0,Math.PI*2);ctx.fill();const hS=pS/2;ctx.fillStyle="white";ctx.beginPath();ctx.arc(h.x+gridSize/3+eOX+snakeShakeOffset.x+pOX+hS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y+pOY-hS/2,hS,0,Math.PI*2);ctx.arc(h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x+pOX+hS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y+pOY-hS/2,hS,0,Math.PI*2);ctx.fill()}
  ctx.strokeStyle="#007744";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(h.x+gridSize/3+eOX+snakeShakeOffset.x-eS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y-eS);ctx.quadraticCurveTo(h.x+gridSize/3+eOX+snakeShakeOffset.x,h.y+gridSize/3+eOY+snakeShakeOffset.y-eS-3,h.x+gridSize/3+eOX+snakeShakeOffset.x+eS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y-eS);ctx.moveTo(h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x-eS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y-eS);ctx.quadraticCurveTo(h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x,h.y+gridSize/3+eOY+snakeShakeOffset.y-eS-3,h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x+eS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y-eS);ctx.stroke();
  const fP=Math.sin(Date.now()*.005)*.2+.8,fG=ctx.createRadialGradient(food.x+gridSize/2,food.y+gridSize/2,0,food.x+gridSize/2,food.y+gridSize/2,gridSize*1.5*fP);fG.addColorStop(0,"rgba(255,255,100,.6)");fG.addColorStop(1,"rgba(255,255,100,0)");ctx.fillStyle=fG;ctx.beginPath();ctx.arc(food.x+gridSize/2,food.y+gridSize/2,gridSize*1.5*fP,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#ff3333";ctx.beginPath();ctx.arc(food.x+gridSize/2,food.y+gridSize/2,gridSize/2,0,Math.PI*2);ctx.fill();ctx.fillStyle="#33ff33";ctx.beginPath();ctx.moveTo(food.x+gridSize/2,food.y+gridSize/4);ctx.lineTo(food.x+gridSize/1.5,food.y);ctx.lineTo(food.x+gridSize/3,food.y);ctx.closePath();ctx.fill();
  
  drawScoreAnimations();drawLightningEffect();
}

function resetGame() {
  document.body.classList.remove("game-over-active");
  if (gameOverScreen) { gameOverScreen.classList.remove("show"); setTimeout(() => { gameOverScreen.style.display = "none"; }, 500); }
  if (levelCompleteScreen) { levelCompleteScreen.classList.remove("show"); setTimeout(() => { levelCompleteScreen.style.display = "none"; }, 500); }
  if (globalShakeInterval) { clearInterval(globalShakeInterval); globalShakeInterval = null; }
  isHurting = false; snakeShakeOffset = { x: 0, y: 0 };
  currentLevel = 1; updateLevelDisplay(); 
  generateMazeRecursiveBacktracker(); 
  setInitialSnakePosition(); 
  generateFood();          
  isDead = false; questionActive = false; mouthState = "closed"; mouthProgress = 0; lives = 3; 
  scoreAnimations = [];
  isSwallowing = false; isPulsing = false; 
  screenShake = { active: false, intensity: 0, duration: 0, stepsElapsed: 0 };
  lightningEffect = { active: false, alpha: 0, duration: 0, stepsElapsed: 0, color: "#ffffff" };
  if (canvas.style.transform !== "translate(0px, 0px)") { canvas.style.transform = "translate(0px, 0px)"; }
  updateHeartsDisplay(); resetQuestionUI();
  clearInterval(countdownInterval); clearInterval(timerInterval);
  
  if (soundEnabled && bgMusic) {
    bgMusic.currentTime = 0;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn("Background music autoplay was prevented. Adding listeners for user interaction.", error);
        addInteractionListenersForMusic(); 
      });
    }
  }
  
  gameRunning = false; isDead = false; 
  startCountdown(); 
}

function handlePlayerInput(attemptedDirection) {
  if (!gameRunning || questionActive || isDead || !snake || snake.length === 0) return;
  
  if (soundEnabled && bgMusic && bgMusic.paused) {
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
        playPromise.catch(e => console.warn("bgMusic play failed on player input.", e));
    }
  }
  
  nextDirection = attemptedDirection;

  if (gameRunning && !questionActive && !isDead) { 
      processPlayerMove();
  }
}

window.addEventListener("keydown", (e) => {
  if (questionActive || isDead) return;
  let newDir = null;
  if (e.key === "ArrowRight" || e.key === "d") newDir = "right";
  else if (e.key === "ArrowLeft" || e.key === "a") newDir = "left";
  else if (e.key === "ArrowUp" || e.key === "w") newDir = "up";
  else if (e.key === "ArrowDown" || e.key === "s") newDir = "down";
  
  if (newDir) {
      e.preventDefault(); 
      handlePlayerInput(newDir);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  backgroundImage.src = "images/background.png"; 

  if (choice1) choice1.addEventListener("click", () => { if (questionActive) checkAnswer(choice1Text.textContent); });
  if (choice2) choice2.addEventListener("click", () => { if (questionActive) checkAnswer(choice2Text.textContent); });
  if (choice3) choice3.addEventListener("click", () => { if (questionActive) checkAnswer(choice3Text.textContent); });
  if (choice4) choice4.addEventListener("click", () => { if (questionActive) checkAnswer(choice4Text.textContent); });
  
  if (restartBtn) restartBtn.addEventListener("click", resetGame);
  
  if (nextLevelBtn) {
    nextLevelBtn.addEventListener("click", () => { playSound(clickSound); prepareNextLevel(); });
  }

  if(touchUp) touchUp.addEventListener("touchstart",e=>{e.preventDefault();if(questionActive||isDead)return;handlePlayerInput("up")});
  if(touchDown) touchDown.addEventListener("touchstart",e=>{e.preventDefault();if(questionActive||isDead)return;handlePlayerInput("down")});
  if(touchLeft) touchLeft.addEventListener("touchstart",e=>{e.preventDefault();if(questionActive||isDead)return;handlePlayerInput("left")});
  if(touchRight) touchRight.addEventListener("touchstart",e=>{e.preventDefault();if(questionActive||isDead)return;handlePlayerInput("right")});

  let resizeTimeout; window.addEventListener("resize", () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(() => { resizeCanvas(); }, 250); });
  let touchStartX=0,touchStartY=0;
  if(canvas){
    canvas.addEventListener("touchstart",e=>{
        touchStartX=e.touches[0].clientX;touchStartY=e.touches[0].clientY;
        if (soundEnabled && bgMusic && bgMusic.paused) {
            const playPromise = bgMusic.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => console.warn("bgMusic play failed on canvas touchstart.", err));
            }
        }
    },{passive:false});
    canvas.addEventListener("touchmove",e=>e.preventDefault(),{passive:false}); 
    canvas.addEventListener("touchend",e=>{
        if(questionActive||isDead)return;
        const tEX=e.changedTouches[0].clientX,tEY=e.changedTouches[0].clientY;
        const dX=tEX-touchStartX,dY=tEY-touchStartY;
        const thresh=gridSize/1.5; 
        let newDir = null;
        if(Math.abs(dX)>Math.abs(dY)){ 
            if(dX>thresh) newDir = "right";
            else if(dX<-thresh) newDir = "left";
        }else{ 
            if(dY>thresh) newDir = "down"; 
            else if(dY<-thresh) newDir = "up";
        }
        if (newDir) handlePlayerInput(newDir);
    },{passive:false});
  }
  document.querySelectorAll(".choice,#restart-btn,#back-button,#next-level-btn,#sound-toggle").forEach(b=>{
      if(b) {
          b.addEventListener("mouseenter",()=>b.style.transform="scale(1.1)");
          b.addEventListener("mouseleave",()=>b.style.transform="scale(1)");
          b.addEventListener("mousedown",()=>b.style.transform="scale(.95)");
          b.addEventListener("mouseup",()=>b.style.transform="scale(1.1)");
          b.addEventListener("click",()=> {
              playSound(clickSound);
              if (soundEnabled && bgMusic && bgMusic.paused) {
                  const playPromise = bgMusic.play();
                  if (playPromise !== undefined) {
                      playPromise.catch(e => console.warn("bgMusic play failed on button click.", e));
                  }
              }
          });
      }
  });
  
  window.addEventListener("blur",()=>{if(soundEnabled){if(bgMusic)bgMusic.pause();if(tickingSound)tickingSound.pause()}});
  window.addEventListener("focus",()=>{
      if(soundEnabled && bgMusic && bgMusic.paused) { 
          const playPromise = bgMusic.play();
          if (playPromise !== undefined) {
              playPromise.catch(e => console.warn("bgMusic play failed on window focus.", e));
          }
      }
  });
  
  resizeCanvas(); 
  resetGame();    
});

function back() { 
    window.location.href = "../geometry.html"; 
}