const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScore = document.getElementById("final-score");
const restartBtn = document.getElementById("restart-btn");
const countdownScreen = document.getElementById("countdown-screen");
const heartContainer = document.getElementById("heart-container");
const hearts = document.querySelectorAll(".heart");
const backButton = document.getElementById("back-button");

const questionTextElement = document.querySelector(".question-text");

const choice1 = document.querySelector(".choice1");
const choice1Text = document.querySelector(".choice1 .choice-text"); 
const choice2 = document.querySelector(".choice2");
const choice2Text = document.querySelector(".choice2 .choice-text");
const choice3 = document.querySelector(".choice3");
const choice3Text = document.querySelector(".choice3 .choice-text");
const choice4 = document.querySelector(".choice4");
const choice4Text = document.querySelector(".choice4 .choice-text");

const timerText = document.querySelector(".timer-text");

const touchUp = document.querySelector(".touch-up");
const touchDown = document.querySelector(".touch-down");
const touchLeft = document.querySelector(".touch-left");
const touchRight = document.querySelector(".touch-right");

const levelDisplayText = document.getElementById("level-display");
const scoreDivText = document.querySelector(".score > .score-text");

const adventureCompleteScreen = document.getElementById("adventure-complete-screen");
const adventureCompleteMessage = document.getElementById("adventure-complete-message");
const backToHubBtn = document.getElementById("back-to-hub-btn");

const gridSize = 20;
const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 400;

let snake = [];
let food = { x: 0, y: 0 };
let direction = "right";
let nextDirection = "right";
let gameRunning = true;
let isDead = false;
let timerInterval;
let timeLeft = 0;
let questionActive = false;
let currentQuestion = null;
let countdownInterval;
let lives = 3;
let isHurting = false;
let snakeShakeOffset = { x: 0, y: 0 };

let currentLevelNumberFromMenu = 1;

let currentLevelQuestions = [];
let currentQuestionIndexInLevel = 0;

const TOTAL_DEFINED_LEVELS = 10;
const MAX_UNLOCKED_LEVEL_KEY_IN_MENU = 'maxUnlockedLevel_squares';

let mouthState = "closed"; let mouthProgress = 0; let mouthAnimationStartTime = 0; const mouthAnimationDuration = 150; const mouthOpenDuration = 300; let lastFoodEatenTime = 0; const keepMouthOpenAfterEating = 500; let tongueAnimationPhase = 0; let headWobblePhase = 0; let jawRotation = 0; let jawOpenAmount = 0; let tongueOut = false;
let isSwallowing = false; let swallowProgress = 0; let swallowBulgePosition = 0; let swallowStartTime = 0; const swallowDuration = 1000;
let growthPulse = 0; let isPulsing = false;
let scoreAnimations = [];
let screenShake = { active: false, intensity: 0, duration: 0, stepsElapsed: 0, startTime: 0 };
let lightningEffect = { active: false, alpha: 0, duration: 0, stepsElapsed: 0, startTime: 0, color: "#ffffff" };

const bgMusic = new Audio(); bgMusic.src = "../../audios/backgroundmusic.mp3"; bgMusic.loop = true; bgMusic.volume = 0.3;
const eatingSound = new Audio(); eatingSound.src = "../../audios/success.wav"; eatingSound.volume = 0.7;
const correctAnswerSound = new Audio(); correctAnswerSound.src = "../../audios/correct.wav"; correctAnswerSound.volume = 0.7;
const wrongAnswerSound = new Audio(); wrongAnswerSound.src = "../../audios/lose-health.wav"; wrongAnswerSound.volume = 0.7;
const tickingSound = new Audio(); tickingSound.src = "../../audios/game-question.wav"; tickingSound.volume = 0.5; tickingSound.loop = true;
const loseLifeSound = new Audio(); loseLifeSound.src = "../../audios/lose-health.wav"; loseLifeSound.volume = 0.7;
const gameOverSound = new Audio(); gameOverSound.src = "../../audios/lose.wav"; gameOverSound.volume = 0.7;
const clickSound = new Audio(); clickSound.src = "../../audios/click.mp3"; clickSound.volume = 0.5;

let soundEnabled = true; let globalShakeInterval = null;

function createRockyTexture() {
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 100; textureCanvas.height = 100;
    const textureCtx = textureCanvas.getContext('2d');
    textureCtx.fillStyle = '#c2b280'; textureCtx.fillRect(0, 0, textureCanvas.width, textureCanvas.height);
    textureCtx.strokeStyle = '#a09060'; textureCtx.lineWidth = 1;
    for (let i = 0; i < 50; i++) { textureCtx.beginPath(); textureCtx.moveTo(Math.random() * textureCanvas.width, Math.random() * textureCanvas.height); textureCtx.bezierCurveTo( Math.random() * textureCanvas.width, Math.random() * textureCanvas.height, Math.random() * textureCanvas.width, Math.random() * textureCanvas.height, Math.random() * textureCanvas.width, Math.random() * textureCanvas.height); textureCtx.stroke(); }
    for (let i = 0; i < 30; i++) { textureCtx.fillStyle = `rgba(100, 80, 40, ${Math.random() * 0.3})`; textureCtx.beginPath(); textureCtx.arc(Math.random() * textureCanvas.width, Math.random() * textureCanvas.height, Math.random() * 5 + 2, 0, Math.PI * 2 ); textureCtx.fill(); }
    for (let i = 0; i < 20; i++) { textureCtx.fillStyle = `rgba(220, 210, 180, ${Math.random() * 0.4})`; textureCtx.beginPath(); textureCtx.arc( Math.random() * textureCanvas.width, Math.random() * textureCanvas.height, Math.random() * 3 + 1, 0, Math.PI * 2); textureCtx.fill(); }
    return ctx.createPattern(textureCanvas, 'repeat');
}
const rockyTexture = createRockyTexture();

function playSound(sound) { if (soundEnabled && sound) { sound.currentTime = 0; sound.play().catch((error) => {});}}
function toggleSound() { soundEnabled = !soundEnabled; if (soundEnabled) { if (bgMusic && bgMusic.paused) { const playPromise = bgMusic.play(); if (playPromise !== undefined) { playPromise.catch(error => { addInteractionListenersForMusic(); }); }} if(document.getElementById("sound-toggle")) document.getElementById("sound-toggle").textContent = "🔊"; } else { if(bgMusic) bgMusic.pause(); if(tickingSound) tickingSound.pause(); if(document.getElementById("sound-toggle")) document.getElementById("sound-toggle").textContent = "🔇"; }}
function addInteractionListenersForMusic() { const startMusicOnInteraction = () => { if (soundEnabled && bgMusic && bgMusic.paused) { bgMusic.play().catch(e => {}); } window.removeEventListener('click', startMusicOnInteraction); window.removeEventListener('keydown', startMusicOnInteraction); window.removeEventListener('touchstart', startMusicOnInteraction); }; window.addEventListener('click', startMusicOnInteraction, { once: true }); window.addEventListener('keydown', startMusicOnInteraction, { once: true }); window.addEventListener('touchstart', startMusicOnInteraction, { once: true });}
async function loadCurrentLevelQuestions(levelNum) { const filename = `./square${levelNum}.json`; try { const response = await fetch(filename); if (!response.ok) { throw new Error(`HTTP error! status: ${response.status} for ${filename}`); } const questionsData = await response.json(); if (Array.isArray(questionsData) && questionsData.length === 10) { currentLevelQuestions = JSON.parse(JSON.stringify(questionsData)); currentQuestionIndexInLevel = 0; return true; } else { throw new Error(`Invalid data format or question count in ${filename}. Expected array of 10, got ${questionsData?.length || 'undefined'}.`); }} catch (error) { currentLevelQuestions = []; currentQuestionIndexInLevel = 0; if (levelNum > TOTAL_DEFINED_LEVELS && error.message.includes("404")) { showAdventureCompleteScreen(); } else { gameOver(`Error: Question data for Level ${levelNum} is missing or invalid.`); } return false; }}
function getLevelFromURL() { const urlParams = new URLSearchParams(window.location.search); const levelParam = urlParams.get('level'); let levelNum = levelParam ? parseInt(levelParam) : 1; if (levelNum < 1) levelNum = 1; return levelNum; }
function resizeCanvas() {}
function setInitialSnakePosition() { const centerX = Math.floor((CANVAS_WIDTH / gridSize) / 2) * gridSize; const centerY = Math.floor((CANVAS_HEIGHT / gridSize) / 2) * gridSize; snake = [ { x: centerX, y: centerY }, { x: centerX - gridSize, y: centerY }, { x: centerX - (2 * gridSize), y: centerY } ]; direction = "right"; nextDirection = "right"; }
function generateFood() { if (!snake || snake.length === 0) { food = {x:-gridSize, y:-gridSize}; return; } let foodX, foodY; let attempts = 0; const maxAttempts = (CANVAS_WIDTH/gridSize) * (CANVAS_HEIGHT/gridSize) + 50; do { foodX = Math.floor(Math.random() * (CANVAS_WIDTH / gridSize)) * gridSize; foodY = Math.floor(Math.random() * (CANVAS_HEIGHT / gridSize)) * gridSize; attempts++; } while (snake.some(segment => segment.x === foodX && segment.y === foodY) && attempts < maxAttempts); if (attempts >= maxAttempts && snake.some(segment => segment.x === foodX && segment.y === foodY)) { food = { x: -gridSize, y: -gridSize }; } else { food = { x: foodX, y: foodY }; }}
function createScoreAnimation(v,x,y){scoreAnimations.push({value:v>0?`+${v}`:v,x:x,y:y,alpha:1,scale:1.5,color:v>0?"#ffcc00":"#ff5555",life:60})}
function updateScoreAnimations(){for(let i=scoreAnimations.length-1;i>=0;i--){const a=scoreAnimations[i];a.y-=1;a.alpha-=0.02;a.scale-=0.01;a.life--;if(a.life<=0)scoreAnimations.splice(i,1)}}
function drawScoreAnimations(){for(const a of scoreAnimations){ctx.save();ctx.globalAlpha=a.alpha;ctx.font=`bold ${Math.floor(24*a.scale)}px Arial`;ctx.fillStyle=a.color;ctx.strokeStyle="#000";ctx.lineWidth=3;ctx.textAlign="center";ctx.strokeText(a.value,a.x,a.y);ctx.fillText(a.value,a.x,a.y);ctx.restore()}}
function createScreenShake(intensity,durationInSteps){screenShake={active:true,intensity:intensity,duration:durationInSteps,stepsElapsed:0}}
function updateScreenShake(){if(!screenShake.active)return;screenShake.stepsElapsed++;if(screenShake.stepsElapsed>=screenShake.duration){screenShake.active=false;canvas.style.transform="translate(0,0)";return}const p=screenShake.stepsElapsed/screenShake.duration;const cI=screenShake.intensity*(1-p);canvas.style.transform=`translate(${(Math.random()-.5)*cI*2}px,${(Math.random()-.5)*cI*2}px)`}
function createLightningEffect(color,durationInSteps){lightningEffect={active:true,alpha:.7,color:color||"#fff",duration:durationInSteps,stepsElapsed:0}}
function updateLightningEffect(){if(!lightningEffect.active)return;lightningEffect.stepsElapsed++;if(lightningEffect.stepsElapsed>=lightningEffect.duration){lightningEffect.active=false;return}const p=lightningEffect.stepsElapsed/lightningEffect.duration;lightningEffect.alpha=.7*(1-p)}
function drawLightningEffect(){if(!lightningEffect.active)return;ctx.save();ctx.fillStyle=lightningEffect.color;ctx.globalAlpha=lightningEffect.alpha;ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);ctx.restore()}
function updateHeartsDisplay(){hearts.forEach((h,i)=>{if(i<lives)h.classList.remove("lost");else h.classList.add("lost")})}
function startTimer(s){timeLeft=s;updateTimerDisplay();if(timerText)timerText.style.color="white";clearInterval(timerInterval);timerInterval=setInterval(()=>{timeLeft--;updateTimerDisplay();if(timeLeft<=5){if(timerText)timerText.style.color="#ff5555";if(timeLeft===5&&tickingSound){tickingSound.currentTime=0;playSound(tickingSound)}}if(timeLeft<=0){clearInterval(timerInterval);if(tickingSound)tickingSound.pause();questionActive=false;loseLife("Timer ran out!")}},1000)}
function updateTimerDisplay(){if(!timerText) return; const m=Math.floor(timeLeft/60).toString().padStart(2,"0"),s=(timeLeft%60).toString().padStart(2,"0");timerText.textContent=`${m} : ${s}`}
function showQuestionUI(){ 
  questionTextElement.style.fontSize = "2.5vw";
  questionTextElement.style.marginTop = "14vw";

    if(questionTextElement)setTimeout(()=>{questionTextElement.classList.add("show")},50); 
    const choiceElements = [choice1Text, choice2Text, choice3Text, choice4Text]; 
    choiceElements.forEach((t,i)=>{ if(t) 
        setTimeout(()=>{t.classList.add("show")},100*(i+1))
    })}
function resetQuestionUI(){ if(questionTextElement){questionTextElement.classList.remove("show");questionTextElement.innerHTML="The question will <br>appear here!"; questionTextElement.style.fontSize = ""; questionTextElement.style.display = ""; questionTextElement.style.alignItems = ""; questionTextElement.style.justifyContent = "";} const choiceElements = [choice1Text, choice2Text, choice3Text, choice4Text]; choiceElements.forEach(t=>{if(t) {t.classList.remove("show"); t.textContent="";}});}

function adjustQuestionFontSize() {
    if (!questionTextElement) {
        console.warn("adjustQuestionFontSize: questionTextElement is not defined or not found.");
        return;
    }

    const text = (questionTextElement.textContent || questionTextElement.innerText || "").trim();
    const textLength = text.length;


    const styleConfigs = [
        { threshold: 20, fontSize: "clamp(1.8vw, 2.5vw, 38px)", centerText: true  }, 
        { threshold: 40, fontSize: "clamp(1.6vw, 2.2vw, 36px)", centerText: true  }, 
        { threshold: 70, fontSize: "clamp(1.4vw, 2.0vw, 34px)", centerText: false }, 
        { threshold: Infinity, fontSize: "clamp(1.2vw, 1.8vw, 22px)", centerText: false } 
    ];

    const activeConfig = styleConfigs.find(config => textLength <= config.threshold);

    questionTextElement.style.fontSize = activeConfig.fontSize;

    if (activeConfig.centerText) {
        questionTextElement.style.display = "flex";
        questionTextElement.style.alignItems = "center";
        questionTextElement.style.justifyContent = "center";
        questionTextElement.style.textAlign = "center";
        questionTextElement.style.top = "-25px";
    } else {
        questionTextElement.style.display = "block";
        questionTextElement.style.textAlign = "center";
        questionTextElement.style.alignItems = "";
        questionTextElement.style.justifyContent = "";
        questionTextElement.style.top = "-25px";
    }
}

function presentNextQuestion() {
    questionActive = true; gameRunning = false;
    if (currentLevelQuestions.length === 0) { gameOver("Error: Question data missing."); return; }
    if (currentQuestionIndexInLevel >= currentLevelQuestions.length) { handleLevelComplete(); return; }
    currentQuestion = currentLevelQuestions[currentQuestionIndexInLevel];
    if (questionTextElement) {
        questionTextElement.innerHTML = currentQuestion.question;
        adjustQuestionFontSize();
    }
    const shuffledOptions = [...currentQuestion.options].sort(() => Math.random() - 0.5);
    if (choice1Text) choice1Text.textContent = shuffledOptions[0]; if (choice2Text) choice2Text.textContent = shuffledOptions[1];
    if (choice3Text) choice3Text.textContent = shuffledOptions[2]; if (choice4Text) choice4Text.textContent = shuffledOptions[3];
    showQuestionUI(); startTimer(15);
}

function updateLevelDisplay() { if (levelDisplayText) { levelDisplayText.textContent = ``; } if (scoreDivText) { scoreDivText.textContent = `Level: ${currentLevelNumberFromMenu}`; }}
function unlockNextLevelInMenuAfterCompletion(completedMenuLevelNumber) { try { const maxUnlockedInMenu = parseInt(localStorage.getItem(MAX_UNLOCKED_LEVEL_KEY_IN_MENU)) || 1; const nextLevelToUnlockInMenu = completedMenuLevelNumber + 1; if (nextLevelToUnlockInMenu > maxUnlockedInMenu) { localStorage.setItem(MAX_UNLOCKED_LEVEL_KEY_IN_MENU, nextLevelToUnlockInMenu.toString()); }} catch (e) {}}
function showAdventureCompleteScreen() { gameRunning = false; isDead = false; questionActive = false; if(bgMusic) bgMusic.pause(); document.body.classList.remove("game-over-active", "level-complete-temp-active"); document.body.classList.add("adventure-complete-active"); if (adventureCompleteMessage) adventureCompleteMessage.textContent = "All Levels Cleared!"; if (adventureCompleteScreen) { adventureCompleteScreen.style.display = "block"; setTimeout(() => { adventureCompleteScreen.classList.add("show"); }, 50); }}

function checkAnswer(selectedAnswer) {
  clearInterval(timerInterval); if(tickingSound) tickingSound.pause(); if (globalShakeInterval) { clearInterval(globalShakeInterval); globalShakeInterval = null; isHurting = false; snakeShakeOffset = { x: 0, y: 0 }; }
  resetQuestionUI();
  if (!currentQuestion) { questionActive = false; gameRunning = false; startCountdown(); return; }
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
  if (isCorrect) {
    playSound(correctAnswerSound); createLightningEffect("#00ff00", 3); createScoreAnimation(10, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    currentQuestionIndexInLevel++;
    ctx.save(); ctx.fillStyle = "rgba(0, 255, 0, 0.5)"; ctx.fillRect(0, CANVAS_HEIGHT / 2 - 30, CANVAS_WIDTH, 60); ctx.fillStyle = "white"; ctx.font = "bold 30px Chewy"; ctx.textAlign = "center"; ctx.fillText("Good Job! Correct Answer!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10); ctx.restore();
    if (currentQuestionIndexInLevel >= currentLevelQuestions.length) { setTimeout(() => { handleLevelComplete(); }, 1500); }
    else { setTimeout(() => { resumeGameAfterQuestion(); }, 1500); }
  } else {
    playSound(wrongAnswerSound); isHurting = true;
    let shakeTime = 0; const shakeDuration = 500; const shakeStartTime = Date.now();
    globalShakeInterval = setInterval(() => { shakeTime = Date.now() - shakeStartTime; if (shakeTime >= shakeDuration || !isHurting) { clearInterval(globalShakeInterval); globalShakeInterval = null; isHurting = false; snakeShakeOffset = { x: 0, y: 0 }; if (!questionActive && !isDead) draw(); return; } const progress = shakeTime / shakeDuration; const intensity = (1 - progress) * 5; snakeShakeOffset = { x: (Math.random() * 2 - 1) * intensity, y: (Math.random() * 2 - 1) * intensity, }; if (!questionActive && !isDead) draw(); }, 30);
    createScreenShake(15, 30); createLightningEffect("#ff0000", 20);
    loseLife("Incorrect answer.");
  }
}

function resumeGameAfterQuestion() { questionActive = false; isDead = false; startCountdown(); }
function handleLevelComplete() {
    gameRunning = false; questionActive = false; isDead = false;
    unlockNextLevelInMenuAfterCompletion(currentLevelNumberFromMenu);
    if (bgMusic) bgMusic.pause();
    document.body.classList.remove("game-over-active", "level-complete-temp-active");
    if (currentLevelNumberFromMenu >= TOTAL_DEFINED_LEVELS) { showAdventureCompleteScreen(); }
    else { ctx.save(); ctx.fillStyle = "rgba(0, 200, 0, 0.7)"; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); ctx.fillStyle = "white"; ctx.font = "bold 40px Chewy"; ctx.textAlign = "center"; ctx.fillText(`Level ${currentLevelNumberFromMenu} Cleared!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2); ctx.font = "bold 25px Chewy"; ctx.fillText("Returning to Levels...", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40); ctx.restore(); setTimeout(() => { goBackToMenu(); }, 2500); }
}
function loseLife(reason = "Unknown reason") { lives--; updateHeartsDisplay(); playSound(loseLifeSound); questionActive = false; isHurting = false; snakeShakeOffset = {x:0, y:0}; if (lives <= 0) { gameOver(`Game Over. You lost all lives!`); } else { gameRunning = false; startCountdown(); }}
function startCountdown() { if (globalShakeInterval) { clearInterval(globalShakeInterval); globalShakeInterval = null; } isHurting = false; snakeShakeOffset = { x: 0, y: 0 }; questionActive = false; isDead = false;
  clearInterval(countdownInterval); let count = 3;
  if (countdownScreen) { countdownScreen.textContent = count; countdownScreen.style.display = "block"; countdownScreen.style.transform = "scale(2)"; countdownScreen.style.opacity = "0"; setTimeout(() => { countdownScreen.style.transform = "scale(1)"; countdownScreen.style.opacity = "1"; }, 100); }
  let animFrameId; function animateDuringCountdown() { if (gameRunning) { if(animFrameId) cancelAnimationFrame(animFrameId); return; } if (lightningEffect.active) { updateLightningEffect(); if (!lightningEffect.active) lightningEffect.alpha = 0; } if (screenShake.active) { updateScreenShake(); if (!screenShake.active) canvas.style.transform = "translate(0,0)"; } draw(); if (!gameRunning && countdownScreen && countdownScreen.style.display === "block") { animFrameId = requestAnimationFrame(animateDuringCountdown); } else { if (screenShake.active) canvas.style.transform = "translate(0,0)"; lightningEffect.active = false; lightningEffect.alpha = 0; draw(); }}
  animFrameId = requestAnimationFrame(animateDuringCountdown);
  countdownInterval = setInterval(() => { count--; if (count <= 0) { clearInterval(countdownInterval); if(animFrameId) cancelAnimationFrame(animFrameId); if (countdownScreen) countdownScreen.style.display = "none"; screenShake.active = false; canvas.style.transform = "translate(0,0)"; lightningEffect.active = false; lightningEffect.alpha = 0; questionActive = false; isHurting = false; snakeShakeOffset = { x: 0, y: 0 }; isDead = false; gameRunning = true; requestAnimationFrame(gameLoop); return; } if (countdownScreen) { countdownScreen.textContent = count; countdownScreen.style.transform = "scale(2)"; countdownScreen.style.opacity = "0"; setTimeout(() => { countdownScreen.style.transform = "scale(1)"; countdownScreen.style.opacity = "1"; }, 100); }}, 1000);
}
function updateMouthAnimation(){const n=Date.now();if(mouthState==="opening"){const p=(n-mouthAnimationStartTime)/mouthAnimationDuration;if(p>=1){mouthState="open";mouthProgress=1;jawOpenAmount=1;mouthAnimationStartTime=n}else{mouthProgress=p;jawOpenAmount=p}}else if(mouthState==="open"){if(n-mouthAnimationStartTime>=mouthOpenDuration&&n-lastFoodEatenTime>=keepMouthOpenAfterEating){mouthState="closing";mouthAnimationStartTime=n}tongueAnimationPhase+=.3;if(Math.random()<.05)tongueOut=!tongueOut}else if(mouthState==="closing"){const p=(n-mouthAnimationStartTime)/mouthAnimationDuration;if(p>=1){mouthState="closed";mouthProgress=0;jawOpenAmount=0;tongueOut=false}else{mouthProgress=1-p;jawOpenAmount=1-p}}else if(mouthState==="eating"){const eT=n-mouthAnimationStartTime;if(eT<mouthAnimationDuration){mouthProgress=Math.min(1,eT/mouthAnimationDuration);jawOpenAmount=mouthProgress}else if(eT<mouthAnimationDuration+mouthOpenDuration){mouthProgress=1;jawOpenAmount=1;tongueOut=true;tongueAnimationPhase+=.5;headWobblePhase+=.4}else if(eT<mouthAnimationDuration*2+mouthOpenDuration){mouthProgress=1-(eT-(mouthAnimationDuration+mouthOpenDuration))/mouthAnimationDuration;jawOpenAmount=mouthProgress}else{mouthState="closed";mouthProgress=0;jawOpenAmount=0;tongueOut=false;isSwallowing=true;swallowProgress=0;swallowBulgePosition=0;swallowStartTime=n}}if(isSwallowing){const sP=(n-swallowStartTime)/swallowDuration;if(sP>=1){isSwallowing=false}else{swallowProgress=sP;swallowBulgePosition=Math.floor(sP*snake.length*.8)}}}
function gameOver(message = `Failed Level ${currentLevelNumberFromMenu}`) { if (globalShakeInterval) { clearInterval(globalShakeInterval); globalShakeInterval = null; } isHurting = false; snakeShakeOffset = { x: 0, y: 0 }; questionActive = false; gameRunning = false; isDead = true; clearInterval(timerInterval); clearInterval(countdownInterval); if(bgMusic) bgMusic.pause(); playSound(gameOverSound); if(finalScore) finalScore.textContent = message; createScreenShake(30, 10); createLightningEffect("#ff0000", 10); document.body.classList.remove("level-complete-temp-active"); document.body.classList.add("game-over-active"); if(gameOverScreen) {gameOverScreen.style.display="block";setTimeout(()=>{gameOverScreen.classList.add("show")},50)} if (restartBtn) { restartBtn.textContent = "Restart"; restartBtn.disabled = false; restartBtn.style.pointerEvents = 'auto'; restartBtn.onclick = async () => { playSound(clickSound); await resetGame(true); }; } resetQuestionUI(); if (adventureCompleteScreen) { adventureCompleteScreen.style.display = "none"; } if (countdownScreen) { countdownScreen.style.display = "none"; } draw();}
let lastFrameTime = 0; const FPS = 10; const frameInterval = 1000 / FPS;
function gameLoop(currentTime) { if (!gameRunning || questionActive || isDead) { if (isDead || questionActive) { draw(); } return; } requestAnimationFrame(gameLoop); const deltaTime = currentTime - lastFrameTime; if (deltaTime > frameInterval) { lastFrameTime = currentTime - (deltaTime % frameInterval); processPlayerMove(); }}
function processPlayerMove() { if (!gameRunning || questionActive || isDead || !snake || snake.length === 0) { return; } direction = nextDirection; updateScoreAnimations(); updateScreenShake(); updateLightningEffect(); updateMouthAnimation(); if(isPulsing){growthPulse+=.1;if(growthPulse>=Math.PI){isPulsing=false;growthPulse=0}} const newHead = { ...snake[0] }; switch (direction) { case "right": newHead.x += gridSize; break; case "left": newHead.x -= gridSize; break; case "up": newHead.y -= gridSize; break; case "down": newHead.y += gridSize; break; } if (newHead.x < 0 || newHead.x >= CANVAS_WIDTH || newHead.y < 0 || newHead.y >= CANVAS_HEIGHT) { gameOver(`Crashed into wall!`); return; } for (let i = 1; i < snake.length; i++) { if (newHead.x === snake[i].x && newHead.y === snake[i].y) { gameOver(`Crashed into yourself!`); return; } } snake.unshift(newHead); if (newHead.x === food.x && newHead.y === food.y) { lastFoodEatenTime = Date.now(); playSound(eatingSound); createScoreAnimation(1, food.x + gridSize / 2, food.y); createScreenShake(5, 2); isPulsing = true; growthPulse = 0; mouthState="eating"; mouthAnimationStartTime=Date.now(); generateFood(); presentNextQuestion(); } else { snake.pop(); } draw();}

function draw() {
  if(screenShake.active){if(!screenShake.stepsElapsed||screenShake.stepsElapsed>=screenShake.duration)canvas.style.transform="translate(0,0)"}else canvas.style.transform="translate(0,0)";
  ctx.fillStyle = rockyTexture; ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.strokeStyle = 'rgba(150, 130, 100, 0.2)'; ctx.lineWidth = 0.5;
  for (let x = 0; x <= CANVAS_WIDTH; x += gridSize) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke(); }
  for (let y = 0; y <= CANVAS_HEIGHT; y += gridSize) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke(); }
  ctx.strokeStyle="#5a3a20";ctx.lineWidth=8;ctx.strokeRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
  if(!snake||snake.length===0){ return; }
  ctx.lineJoin="round";ctx.lineCap="round";ctx.lineWidth=gridSize;
  let grad = ctx.createLinearGradient(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);grad.addColorStop(0,"#6aff6a");grad.addColorStop(1,"#00cc66");
  ctx.strokeStyle="#007744";ctx.lineWidth=gridSize+4;ctx.beginPath();ctx.moveTo(snake[0].x+gridSize/2+snakeShakeOffset.x,snake[0].y+gridSize/2+snakeShakeOffset.y);for(let i=1;i<snake.length;i++)ctx.lineTo(snake[i].x+gridSize/2+snakeShakeOffset.x,snake[i].y+gridSize/2+snakeShakeOffset.y);ctx.stroke();
  ctx.strokeStyle=grad;ctx.lineWidth=gridSize;ctx.beginPath();ctx.moveTo(snake[0].x+gridSize/2+snakeShakeOffset.x,snake[0].y+gridSize/2+snakeShakeOffset.y);for(let i=1;i<snake.length;i++)ctx.lineTo(snake[i].x+gridSize/2+snakeShakeOffset.x,snake[i].y+gridSize/2+snakeShakeOffset.y);ctx.stroke();
  ctx.fillStyle="#009955";
  for(let i=1;i<snake.length;i++){const s=snake[i];let bE=0;if(isSwallowing){const dB=Math.abs(i-swallowBulgePosition);if(dB<2)bE=Math.max(0,6*(1-dB/2))}let pE=0;if(isPulsing)pE=Math.sin(growthPulse)*3;const tE=bE+pE;if(i%2===0){ ctx.fillStyle="#007744"; ctx.beginPath();ctx.arc(s.x+gridSize/2+snakeShakeOffset.x,s.y+gridSize/2+snakeShakeOffset.y,gridSize/6+2+tE,0,Math.PI*2);ctx.fill(); ctx.fillStyle="#009955"; ctx.beginPath();ctx.arc(s.x+gridSize/2+snakeShakeOffset.x,s.y+gridSize/2+snakeShakeOffset.y,gridSize/6+tE,0,Math.PI*2);ctx.fill() }}
  const h=snake[0];let wO=0;if(mouthState==="eating")wO=Math.sin(headWobblePhase)*3;
  ctx.fillStyle="#007744"; ctx.beginPath();const cX=h.x+gridSize/2+snakeShakeOffset.x,cY=h.y+gridSize/2+snakeShakeOffset.y+wO,bR=gridSize/1.5+2;if(mouthState==="closed"||jawOpenAmount<=0){ctx.arc(cX,cY,bR,0,Math.PI*2)}else{ctx.save();ctx.translate(cX,cY);ctx.beginPath();ctx.arc(0,0,bR,0,Math.PI*2);ctx.fill();ctx.rotate(jawRotation*jawOpenAmount);const jH=bR*.7*jawOpenAmount,jW=bR*(1+.3*jawOpenAmount);ctx.beginPath();ctx.ellipse(0,jH/2,jW,jH,0,0,Math.PI);ctx.fill();ctx.restore()}ctx.fill();
  ctx.fillStyle="#00cc66"; ctx.beginPath();const mR=gridSize/1.5;if(mouthState==="closed"||jawOpenAmount<=0){ctx.arc(cX,cY,mR,0,Math.PI*2)}else{ctx.save();ctx.translate(cX,cY);ctx.beginPath();ctx.arc(0,0,mR,0,Math.PI*2);ctx.fill();ctx.rotate(jawRotation*jawOpenAmount);const jH=mR*.7*jawOpenAmount,jW=mR*(1+.3*jawOpenAmount);ctx.beginPath();ctx.ellipse(0,jH/2,jW,jH,0,0,Math.PI);ctx.fill();if(tongueOut){const tL=mR*(.8+.2*Math.sin(tongueAnimationPhase)),tS=tL/3;ctx.fillStyle="#ff6666";ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(tL,-tS);ctx.lineTo(tL,tS);ctx.closePath();ctx.fill();ctx.fillStyle="#ff99aa";ctx.beginPath();ctx.arc(tL,-tS,3,0,Math.PI*2);ctx.arc(tL,tS,3,0,Math.PI*2);ctx.fill()}ctx.restore()}ctx.fill();
  let eOX=0,eOY=wO,pOX=0,pOY=0;switch(direction){case"right":eOX=gridSize/3-(gridSize/10)*mouthProgress;pOX=gridSize/8;break;case"left":eOX=-gridSize/3+(gridSize/10)*mouthProgress;pOX=-gridSize/8;break;case"up":eOY=-gridSize/3+(gridSize/10)*mouthProgress+wO;pOY=-gridSize/8;break;case"down":eOY=gridSize/3-(gridSize/10)*mouthProgress+wO;pOY=gridSize/8;break}
  const eS=gridSize/3;ctx.fillStyle="white";ctx.beginPath();ctx.arc(h.x+gridSize/3+eOX+snakeShakeOffset.x,h.y+gridSize/3+eOY+snakeShakeOffset.y,eS,0,Math.PI*2);ctx.arc(h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x,h.y+gridSize/3+eOY+snakeShakeOffset.y,eS,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(0,0,0,0.1)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(h.x+gridSize/3+eOX+snakeShakeOffset.x,h.y+gridSize/3+eOY+snakeShakeOffset.y,eS,0,Math.PI*2);ctx.arc(h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x,h.y+gridSize/3+eOY+snakeShakeOffset.y,eS,0,Math.PI*2);ctx.stroke();
  const pS=eS/1.5;ctx.fillStyle="#222";ctx.beginPath();if(isDead){ctx.moveTo(h.x+gridSize/3+eOX+snakeShakeOffset.x-pS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y-pS/2);ctx.lineTo(h.x+gridSize/3+eOX+snakeShakeOffset.x+pS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y+pS/2);ctx.moveTo(h.x+gridSize/3+eOX+snakeShakeOffset.x+pS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y-pS/2);ctx.lineTo(h.x+gridSize/3+eOX+snakeShakeOffset.x-pS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y+pS/2);ctx.moveTo(h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x-pS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y-pS/2);ctx.lineTo(h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x+pS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y+pS/2);ctx.moveTo(h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x+pS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y-pS/2);ctx.lineTo(h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x-pS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y+pS/2);ctx.stroke()}else{ctx.arc(h.x+gridSize/3+eOX+snakeShakeOffset.x+pOX,h.y+gridSize/3+eOY+snakeShakeOffset.y+pOY,pS,0,Math.PI*2);ctx.arc(h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x+pOX,h.y+gridSize/3+eOY+snakeShakeOffset.y+pOY,pS,0,Math.PI*2);ctx.fill();const hS=pS/2;ctx.fillStyle="white";ctx.beginPath();ctx.arc(h.x+gridSize/3+eOX+snakeShakeOffset.x+pOX+hS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y+pOY-hS/2,hS,0,Math.PI*2);ctx.arc(h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x+pOX+hS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y+pOY-hS/2,hS,0,Math.PI*2);ctx.fill()}
  ctx.strokeStyle="#007744";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(h.x+gridSize/3+eOX+snakeShakeOffset.x-eS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y-eS);ctx.quadraticCurveTo(h.x+gridSize/3+eOX+snakeShakeOffset.x,h.y+gridSize/3+eOY+snakeShakeOffset.y-eS-3,h.x+gridSize/3+eOX+snakeShakeOffset.x+eS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y-eS);ctx.moveTo(h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x-eS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y-eS);ctx.quadraticCurveTo(h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x,h.y+gridSize/3+eOY+snakeShakeOffset.y-eS-3,h.x+(2*gridSize)/3+eOX+snakeShakeOffset.x+eS/2,h.y+gridSize/3+eOY+snakeShakeOffset.y-eS);ctx.stroke();
  if (food && food.x >=0) { const fP=Math.sin(Date.now()*.005)*.2+.8,fG=ctx.createRadialGradient(food.x+gridSize/2,food.y+gridSize/2,0,food.x+gridSize/2,food.y+gridSize/2,gridSize*1.5*fP);fG.addColorStop(0,"rgba(255,255,100,.6)");fG.addColorStop(1,"rgba(255,255,100,0)");ctx.fillStyle=fG;ctx.beginPath();ctx.arc(food.x+gridSize/2,food.y+gridSize/2,gridSize*1.5*fP,0,Math.PI*2);ctx.fill(); ctx.fillStyle="#ff3333";ctx.beginPath();ctx.arc(food.x+gridSize/2,food.y+gridSize/2,gridSize/2,0,Math.PI*2);ctx.fill();ctx.fillStyle="#33ff33";ctx.beginPath();ctx.moveTo(food.x+gridSize/2,food.y+gridSize/4);ctx.lineTo(food.x+gridSize/1.5,food.y);ctx.lineTo(food.x+gridSize/3,food.y);ctx.closePath();ctx.fill(); }
  drawScoreAnimations();drawLightningEffect();
}

async function resetGame(isFullReset = true) {
  document.body.classList.remove("game-over-active", "adventure-complete-active", "level-complete-temp-active");
  if (gameOverScreen) { gameOverScreen.classList.remove("show"); setTimeout(() => { gameOverScreen.style.display = "none"; }, 500); }
  if (adventureCompleteScreen) { adventureCompleteScreen.classList.remove("show"); setTimeout(() => { adventureCompleteScreen.style.display = "none"; }, 500); }
  if (globalShakeInterval) { clearInterval(globalShakeInterval); globalShakeInterval = null; } isHurting = false; snakeShakeOffset = { x: 0, y: 0 };
  if (isFullReset) { lives = 3; currentQuestionIndexInLevel = 0; }
  updateLevelDisplay(); updateHeartsDisplay(); canvas.width = CANVAS_WIDTH; canvas.height = CANVAS_HEIGHT;
  const questionsLoadedSuccessfully = await loadCurrentLevelQuestions(currentLevelNumberFromMenu);
  if (!questionsLoadedSuccessfully) { return; }
  setInitialSnakePosition(); generateFood(); isDead = false; questionActive = false; mouthState = "closed"; mouthProgress = 0; scoreAnimations = []; isSwallowing = false; isPulsing = false; screenShake = { active: false }; lightningEffect = { active: false };
  if (canvas.style.transform !== "translate(0px, 0px)") { canvas.style.transform = "translate(0px, 0px)"; }
  resetQuestionUI(); clearInterval(countdownInterval); clearInterval(timerInterval);
  if (soundEnabled && bgMusic) { bgMusic.currentTime = 0; const playPromise = bgMusic.play(); if (playPromise !== undefined) { playPromise.catch(error => { addInteractionListenersForMusic(); }); } }
  gameRunning = false; startCountdown();
}

function handlePlayerInput(attemptedDirection) {
    if (!gameRunning || questionActive || isDead || !snake || snake.length === 0) { return; }
    if (soundEnabled && bgMusic && bgMusic.paused) { const playPromise = bgMusic.play(); if (playPromise !== undefined) { playPromise.catch(e => {}); }}
    if ((attemptedDirection === "right" && direction === "left") || (attemptedDirection === "left" && direction === "right") || (attemptedDirection === "up" && direction === "down") || (attemptedDirection === "down" && direction === "up")) { return; }
    nextDirection = attemptedDirection;
}

window.addEventListener("keydown", (e) => { if (questionActive || isDead) { return; } let newDir = null; if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") newDir = "right"; else if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") newDir = "left"; else if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") newDir = "up"; else if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") newDir = "down"; if (newDir) { e.preventDefault(); handlePlayerInput(newDir); }});

document.addEventListener("DOMContentLoaded", async () => {
  currentLevelNumberFromMenu = getLevelFromURL();
  if (choice1) choice1.addEventListener("click", () => { if (questionActive) checkAnswer(choice1Text.textContent); }); if (choice2) choice2.addEventListener("click", () => { if (questionActive) checkAnswer(choice2Text.textContent); }); if (choice3) choice3.addEventListener("click", () => { if (questionActive) checkAnswer(choice3Text.textContent); }); if (choice4) choice4.addEventListener("click", () => { if (questionActive) checkAnswer(choice4Text.textContent); });
  if (backToHubBtn) { backToHubBtn.addEventListener("click", () => { playSound(clickSound); goBackToMenu(); }); }
  if (backButton) backButton.addEventListener("click", () => { playSound(clickSound); goBackToMenu(); });
  if(touchUp) touchUp.addEventListener("touchstart",e=>{e.preventDefault();if(questionActive||isDead)return;handlePlayerInput("up")}); if(touchDown) touchDown.addEventListener("touchstart",e=>{e.preventDefault();if(questionActive||isDead)return;handlePlayerInput("down")}); if(touchLeft) touchLeft.addEventListener("touchstart",e=>{e.preventDefault();if(questionActive||isDead)return;handlePlayerInput("left")}); if(touchRight) touchRight.addEventListener("touchstart",e=>{e.preventDefault();if(questionActive||isDead)return;handlePlayerInput("right")});
  let resizeTimeout; window.addEventListener("resize", () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(() => { resizeCanvas(); }, 250); });
  let touchStartX=0,touchStartY=0; if(canvas){ canvas.addEventListener("touchstart",e=>{ touchStartX=e.touches[0].clientX;touchStartY=e.touches[0].clientY; if (soundEnabled && bgMusic && bgMusic.paused) { const playPromise = bgMusic.play(); if (playPromise !== undefined) { playPromise.catch(err => {}); }} },{passive:false}); canvas.addEventListener("touchmove",e=>e.preventDefault(),{passive:false}); canvas.addEventListener("touchend",e=>{ if(questionActive||isDead)return; const tEX=e.changedTouches[0].clientX,tEY=e.changedTouches[0].clientY; const dX=tEX-touchStartX,dY=tEY-touchStartY; const thresh=gridSize/1.5; let newDir = null; if(Math.abs(dX)>Math.abs(dY)){ if(dX>thresh) newDir = "right"; else if(dX<-thresh) newDir = "left"; } else{ if(dY>thresh) newDir = "down"; else if(dY<-thresh) newDir = "up"; } if (newDir) handlePlayerInput(newDir); },{passive:false}); }
  document.querySelectorAll(".choice,#restart-btn,#back-button,#next-level-btn,#sound-toggle,#back-to-hub-btn").forEach(b=>{ if(b) { b.addEventListener("mouseenter",()=>b.style.transform="scale(1.1)"); b.addEventListener("mouseleave",()=>b.style.transform="scale(1)"); b.addEventListener("mousedown",()=>b.style.transform="scale(.95)"); b.addEventListener("mouseup",()=>b.style.transform="scale(1.1)"); b.addEventListener("click",()=> { if (b !== restartBtn || (restartBtn.textContent !== "Restart" && restartBtn.textContent !== "Back to Levels")) playSound(clickSound); if (soundEnabled && bgMusic && bgMusic.paused) { const playPromise = bgMusic.play(); if (playPromise !== undefined) { playPromise.catch(e => {}); }}}); }});
  window.addEventListener("blur",()=>{if(soundEnabled){if(bgMusic)bgMusic.pause();if(tickingSound)tickingSound.pause()}}); window.addEventListener("focus",()=>{ if(soundEnabled && bgMusic && bgMusic.paused) { const playPromise = bgMusic.play(); if (playPromise !== undefined) { playPromise.catch(e => {}); }}});
  await resetGame(true);
});

function goBackToMenu() { window.location.href = "../../geometrysquarelevel.html"; }