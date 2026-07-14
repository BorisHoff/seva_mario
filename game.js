/**
 * «Сева на льду: Хоккейные Приключения»
 * Игровой движок на HTML5 Canvas
 */

// --- БЕЗОПАСНЫЙ ВСПОМОГАТЕЛЬНЫЙ МЕТОД ОТРИСОВКИ СКРУГЛЕННЫХ ПРЯМОУГОЛЬНИКОВ ---
function drawRoundRect(c, x, y, w, h, r) {
  try {
    if (typeof c.roundRect === 'function') {
      c.roundRect(x, y, w, h, r);
      return;
    }
  } catch (e) {
    // В случае сбоя встроенной функции используем ручную отрисовку
  }
  
  if (typeof r === 'undefined') r = 0;
  if (typeof r === 'number') {
    r = [r, r, r, r];
  } else if (Array.isArray(r)) {
    if (r.length === 1) r = [r[0], r[0], r[0], r[0]];
    else if (r.length === 2) r = [r[0], r[1], r[0], r[1]];
    else if (r.length === 3) r = [r[0], r[1], r[2], r[1]];
  } else {
    r = [0, 0, 0, 0];
  }
  const rTL = r[0];
  const rTR = r[1];
  const rBR = r[2];
  const rBL = r[3];
  
  c.beginPath();
  c.moveTo(x + rTL, y);
  c.lineTo(x + w - rTR, y);
  c.arcTo(x + w, y, x + w, y + rTR, rTR);
  c.lineTo(x + w, y + h - rBR);
  c.arcTo(x + w, y + h, x + w - rBR, y + h, rBR);
  c.lineTo(x + rBL, y + h);
  c.arcTo(x, y + h, x, y + h - rBL, rBL);
  c.lineTo(x, y + rTL);
  c.arcTo(x, y, x + rTL, y, rTL);
  c.closePath();
}

// --- ЗВУКОВОЙ ДВИЖОК (Web Audio API) ---
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicInterval = null;
  }

  init() {
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn("Не удалось инициализировать AudioContext:", e);
      this.ctx = null;
    }
  }

  toggleMute() {
    try {
      this.muted = !this.muted;
      if (this.muted) {
        this.stopMusic();
      } else {
        this.startMusic();
      }
      return this.muted;
    } catch (e) {
      console.warn("toggleMute error:", e);
      return this.muted;
    }
  }

  playSoftNote(freq, dur, type = 'triangle') {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(type === 'sawtooth' ? 550 : 850, now);

      gainNode.gain.setValueAtTime(0.0, now);
      // Приглушаем Sawtooth, чтобы не резало уши
      const maxVolume = type === 'sawtooth' ? 0.0035 : type === 'sine' ? 0.015 : 0.011;
      gainNode.gain.linearRampToValueAtTime(maxVolume, now + 0.04); 
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + dur);
    } catch (e) {
      console.warn("playSoftNote error:", e);
    }
  }

  startMusic() {
    try {
      if (this.muted) return;
      this.init();
      this.stopMusic();

      let step = 0;
      
      // Семь весёлых, энергичных и быстрых мелодий для каждого уровня
      const levelChords = [
        // Уровень 1: Череповец (Быстрый весёлый мажор - Triangle)
        [
          [261.63, 329.63, 392.00, 523.25], // C4, E4, G4, C5 (C Major)
          [349.23, 440.00, 523.25, 698.46], // F4, A4, C5, F5 (F Major)
          [392.00, 493.88, 587.33, 783.99], // G4, B4, D5, G5 (G Major)
          [261.63, 329.63, 392.00, 523.25]
        ],
        // Уровень 2: Ярославль (Яркий бодрый мажор - Sine)
        [
          [293.66, 369.99, 440.00, 587.33], // D4, F#4, A4, D5 (D Major)
          [392.00, 493.88, 587.33, 783.99], // G4, B4, D5, G5 (G Major)
          [440.00, 554.37, 659.25, 880.00], // A4, C#5, E5, A5 (A Major)
          [293.66, 369.99, 440.00, 587.33]
        ],
        // Уровень 3: Минск (Бодрая и задорная - Triangle)
        [
          [349.23, 440.00, 523.25, 698.46], // F Major
          [261.63, 329.63, 392.00, 523.25], // C Major
          [349.23, 440.00, 523.25, 698.46], // F Major
          [392.00, 493.88, 587.33, 783.99]  // G Major
        ],
        // Уровень 4: Санкт-Петербург (Танцевальная неоновая - Sine)
        [
          [261.63, 329.63, 392.00, 493.88], // Cmaj7
          [293.66, 349.23, 440.00, 523.25], // Dm7
          [329.63, 392.00, 493.88, 587.33], // Em7
          [349.23, 440.00, 523.25, 659.25]  // Fmaj7
        ],
        // Уровень 5: Казань (Энергичный плясовой лад - Triangle)
        [
          [220.00, 277.18, 329.63, 440.00], // A Major
          [293.66, 369.99, 440.00, 587.33], // D Major
          [220.00, 277.18, 329.63, 440.00], 
          [246.94, 311.13, 369.99, 493.88]  // B Major
        ],
        // Уровень 6: Москва (Торжественный маршевый мажор - Sawtooth)
        [
          [261.63, 329.63, 392.00, 523.25], // C Major
          [329.63, 392.00, 523.25, 659.25], // E Major
          [349.23, 440.00, 523.25, 698.46], // F Major
          [392.00, 493.88, 587.33, 783.99]  // G Major
        ],
        // Уровень 7: Пекин (Китайский задорный танец - Sawtooth)
        [
          [293.66, 329.63, 392.00, 440.00], // D4, E4, G4, A4
          [392.00, 440.00, 523.25, 587.33], // G4, A4, C5, D5
          [440.00, 523.25, 587.33, 659.25], // A4, C5, D5, E5
          [293.66, 329.63, 392.00, 440.00]
        ]
      ];

      // Ускоренный темп (270мс вместо 450мс) для создания веселой и бодрой атмосферы
      this.musicInterval = setInterval(() => {
        try {
          if (this.muted || (gameState !== 'GAMEPLAY' && gameState !== 'VICTORY_DANCE')) return;
          if (!this.ctx) return;

          const chords = levelChords[currentLevelIndex] || levelChords[0];
          const chordIdx = Math.floor(step / 8) % chords.length;
          const noteIdx = step % 4;
          const freq = chords[chordIdx][noteIdx];
          
          let waveType = 'triangle';
          if (currentLevelIndex === 1 || currentLevelIndex === 3) waveType = 'sine';
          if (currentLevelIndex === 5 || currentLevelIndex === 6) waveType = 'sawtooth';
          
          this.playSoftNote(freq, 0.28, waveType);
          step++;
        } catch (innerErr) {
          console.warn("Music step error:", innerErr);
        }
      }, 270);
    } catch (e) {
      console.warn("startMusic error:", e);
    }
  }

  stopMusic() {
    try {
      if (this.musicInterval) {
        clearInterval(this.musicInterval);
        this.musicInterval = null;
      }
    } catch (e) {
      console.warn("stopMusic error:", e);
    }
  }

  playJump() {
    if (this.muted || !this.ctx) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch (e) {
      console.warn("playJump error:", e);
    }
  }

  playPuck() {
    if (this.muted || !this.ctx) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); 
      osc.frequency.setValueAtTime(659.25, now + 0.08); 
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn("playPuck error:", e);
    }
  }

  playShoot() {
    if (this.muted || !this.ctx) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.09);
    } catch (e) {
      console.warn("playShoot error:", e);
    }
  }

  playSquish() {
    if (this.muted || !this.ctx) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.1;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(10, now + 0.1);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
      noise.stop(now + 0.1);
    } catch (e) {
      console.warn("playSquish error:", e);
    }
  }

  playHurt() {
    if (this.muted || !this.ctx) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn("playHurt error:", e);
    }
  }

  playDeflect() {
    if (this.muted || !this.ctx) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(250, now + 0.12);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.12);
    } catch (e) {
      console.warn("playDeflect error:", e);
    }
  }

  playCup() {
    if (this.muted || !this.ctx) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; 
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.08, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } catch (e) {
      console.warn("playCup error:", e);
    }
  }

  playCrowdCheer() {
    if (this.muted || !this.ctx) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 3.0; 
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.Q.setValueAtTime(1.5, now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.3); 
      gain.gain.linearRampToValueAtTime(0.22, now + 1.8); 
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0); 
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
      noise.stop(now + 3.0);

      for (let j = 0; j < 4; j++) {
        const startTime = now + 0.1 + j * 0.35;
        const whistle = this.ctx.createOscillator();
        const wGain = this.ctx.createGain();
        whistle.type = 'sine';
        whistle.frequency.setValueAtTime(1100 + Math.random() * 400, startTime);
        whistle.frequency.exponentialRampToValueAtTime(1800 + Math.random() * 600, startTime + 0.4);
        wGain.gain.setValueAtTime(0.001, startTime);
        wGain.gain.linearRampToValueAtTime(0.04, startTime + 0.05);
        wGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
        whistle.connect(wGain);
        wGain.connect(this.ctx.destination);
        whistle.start(startTime);
        whistle.stop(startTime + 0.4);
      }
    } catch (e) {
      console.warn("playCrowdCheer error:", e);
    }
  }

  playGameOver() {
    if (this.muted || !this.ctx) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      const notes = [392.00, 349.23, 311.13, 246.94];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);
        gain.gain.setValueAtTime(0.12, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.4);
      });
    } catch (e) {
      console.warn("playGameOver error:", e);
    }
  }
}

const audio = new AudioEngine();

// --- ИГРОВЫЕ КОНСТАНТЫ И НАСТРОЙКИ ---
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;
const GRAVITY = 0.5;
const ICE_FRICTION = 0.96;
const NORMAL_FRICTION = 0.85;

// Конфигурация уровней
const LEVELS = [
  {
    city: "Череповец",
    arena: "Ледовый дворец",
    bgColor: "#fcd116",
    bgKey: "bgCherepovets",
    bgFilter: null,
    length: 5500,
    enemyType: "ska", 
    enemySpeed: 1.6,
    finishX: 5300,
    platformColor: "#1d2331",
    iceColor: "#86d6ff",
    spawnGoalies: false
  },
  {
    city: "Ярославль",
    arena: "Арена-2000",
    bgColor: "#ff3b30",
    bgKey: "bgYaroslavl", // Отдельный фон
    bgFilter: null,
    length: 7000,
    enemyType: "loko", 
    enemySpeed: 1.9,
    finishX: 6800,
    platformColor: "#15243a",
    iceColor: "#7be5ff",
    spawnGoalies: true
  },
  {
    city: "Минск",
    arena: "Минск-Арена",
    bgColor: "#007aff",
    bgKey: "bgMinsk",
    bgFilter: null,
    length: 8500,
    enemyType: "dynminsk", 
    enemySpeed: 2.2,
    finishX: 8300,
    platformColor: "#1c2230",
    iceColor: "#6fe0ff",
    spawnGoalies: true
  },
  {
    city: "Санкт-Петербург",
    arena: "СКА Арена",
    bgColor: "#00e5ff",
    bgKey: "bgSpb",
    bgFilter: null,
    length: 10000,
    enemyType: "ska", 
    enemySpeed: 2.4,
    finishX: 9800,
    platformColor: "#121b2d",
    iceColor: "#73e1ff",
    spawnGoalies: true
  },
  {
    city: "Казань",
    arena: "Татнефть Арена",
    bgColor: "#34c759",
    bgKey: "bgSpb",
    bgFilter: "hue-rotate(120deg) saturate(1.4)",
    length: 11500,
    enemyType: "akbars", 
    enemySpeed: 2.6,
    finishX: 11300,
    platformColor: "#122a1b",
    iceColor: "#6ae2d0",
    spawnGoalies: true
  },
  {
    city: "Москва",
    arena: "ЦСКА Арена",
    bgColor: "#ff3366",
    bgKey: "bgMoscow",
    bgFilter: null,
    length: 13000,
    enemyType: "spartak", 
    enemySpeed: 2.8,
    finishX: 12800,
    platformColor: "#221115",
    iceColor: "#6ee5ff",
    spawnGoalies: true
  },
  {
    city: "Пекин",
    arena: "Шоуганг Арена",
    bgColor: "#ffcc00",
    bgKey: "bgMoscow",
    bgFilter: "hue-rotate(-45deg) saturate(1.8)",
    length: 15000,
    enemyType: "kunlun", 
    enemySpeed: 3.1,
    finishX: 14800,
    platformColor: "#2a1b0c",
    iceColor: "#61e0ff",
    spawnGoalies: true
  }
];

// --- ГРУППА ИЗОБРАЖЕНИЙ (АССЕТЫ) ---
const rawAssets = {
  bgCherepovets: "assets/background_cherepovets.jpg",
  bgYaroslavl: "assets/background_yaroslavl.jpg", 
  bgMinsk: "assets/background_minsk.jpg", // Загружаем картинку Минск-Арены
  bgSpb: "assets/background_spb.jpg",
  bgMoscow: "assets/background_moscow.jpg",
  player: "assets/seva_player.jpg",
  enemySka: "assets/enemy_ska.jpg",
  enemyCska: "assets/enemy_cska.jpg",
  enemySpartak: "assets/enemy_spartak.jpg",
  enemyGoalie: "assets/enemy_goalie.jpg",
  enemyLoko: "assets/enemy_loko.jpg",
  enemyDynminsk: "assets/enemy_dynminsk.jpg",
  enemyAkbars: "assets/enemy_akbars.jpg",
  enemyKunlun: "assets/enemy_kunlun.jpg",
  puck: "assets/hockey_puck.jpg",
  logoSeverstal: "assets/logo_severstal.jpg"
};

const images = {};
let assetsLoaded = false;

// Утилита хромакея
function makeTransparent(img) {
  try {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (w === 0 || h === 0) return img;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return img;

    tempCtx.drawImage(img, 0, 0);
    const imgData = tempCtx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0; 
      }
    }
    tempCtx.putImageData(imgData, 0, 0);
    return tempCanvas;
  } catch (e) {
    console.error("makeTransparent error: ", e);
    return img;
  }
}

// Загрузка ассетов
function loadAssets(callback) {
  let loadedCount = 0;
  const keysList = Object.keys(rawAssets);
  const total = keysList.length;
  
  keysList.forEach(key => {
    const img = new Image();
    img.src = rawAssets[key];
    img.onload = () => {
      if (key.startsWith('bg')) {
        images[key] = img;
      } else {
        images[key] = makeTransparent(img);
      }
      loadedCount++;
      if (loadedCount === total) {
        assetsLoaded = true;
        callback();
      }
    };
    img.onerror = () => {
      const placeholder = document.createElement('canvas');
      placeholder.width = 64;
      placeholder.height = 64;
      images[key] = placeholder;
      loadedCount++;
      if (loadedCount === total) {
        assetsLoaded = true;
        callback();
      }
    };
  });
}

// --- СОСТОЯНИЕ ИГРЫ ---
let currentLevelIndex = 0;
let gameState = 'START_SCREEN'; 
let score = 0;
let levelScore = 0;
let totalPucksCollected = 0; 
let levelPucksCollected = 0; 
let levelCupsCollected = 0; 

let lastTime = 0;
let keys = {};
let gameLoopId = null;

// Игрок Сева (80x80)
const player = {
  x: 100,
  y: 300,
  vx: 0,
  vy: 0,
  width: 80,
  height: 80,
  speed: 0.6,
  maxVx: 7,
  jumpForce: 13.5,
  onGround: false,
  facingRight: true,
  lives: 3,
  invincibleTimer: 0,
  superTimer: 0, 
  isDead: false,
  deathTimer: 0,
  
  // Танец
  danceAngle: 0,
  danceScaleX: 1,
  danceScaleY: 1
};

let platforms = [];
let pucks = [];
let cups = []; 
let logos = []; 
let enemies = [];
let projectiles = []; 
let particles = [];
let popups = []; 
let cameraX = 0;
let finishGoal = { x: 3000, y: 360, width: 90, height: 100 };

// Танец победы
let victoryDanceTimer = 0;

let centerNotificationText = "";
let centerNotificationTimer = 0;

function showCenterNotification(text) {
  centerNotificationText = text;
  centerNotificationTimer = 2.5;
}

// Инициализация Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- УПРАВЛЕНИЕ ---
window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
    e.preventDefault();
  }
  
  if ((e.code === 'KeyF' || e.code === 'Enter' || e.code === 'KeyJ') && gameState === 'GAMEPLAY' && !player.isDead) {
    shootPuck();
  }

  if (e.code === 'Escape' && gameState === 'GAMEPLAY') {
    pauseGame();
  }
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// Сенсорное управление
const touchControls = document.getElementById('touch-controls');
const btnLeft = document.getElementById('touch-left');
const btnRight = document.getElementById('touch-right');
const btnJump = document.getElementById('touch-jump');
const btnShoot = document.getElementById('touch-shoot');

let isTouchDevice = false;
window.addEventListener('touchstart', function() {
  if (!isTouchDevice) {
    isTouchDevice = true;
    touchControls.style.display = 'flex';
  }
});

if (btnLeft) {
  btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); keys['ArrowLeft'] = true; });
  btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); keys['ArrowLeft'] = false; });
}
if (btnRight) {
  btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); keys['ArrowRight'] = true; });
  btnRight.addEventListener('touchend', (e) => { e.preventDefault(); keys['ArrowRight'] = false; });
}
if (btnJump) {
  btnJump.addEventListener('touchstart', (e) => { e.preventDefault(); keys['Space'] = true; });
  btnJump.addEventListener('touchend', (e) => { e.preventDefault(); keys['Space'] = false; });
}
if (btnShoot) {
  btnShoot.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState === 'GAMEPLAY' && !player.isDead) {
      shootPuck();
    }
  });
}

// Бросок шайбы
function shootPuck() {
  if (levelPucksCollected > 0) {
    levelPucksCollected--;
    updateHUD();
    audio.playShoot();
    
    projectiles.push({
      x: player.facingRight ? player.x + player.width : player.x - 14,
      y: player.y + player.height / 2 + 10,
      vx: player.facingRight ? 13 : -13,
      vy: 0,
      width: 14,
      height: 8,
      active: true,
      deflected: false
    });
    
    spawnSparkles(player.x + (player.facingRight ? player.width + 10 : -10), player.y + player.height - 10, 5, '#ffffff');
  } else {
    showCenterNotification("НЕТ ШАЙБ ДЛЯ БРОСКА!");
  }
}

// --- ГЕНЕРАЦИЯ УРОВНЯ ---
function buildLevel(levelIdx) {
  const lvl = LEVELS[levelIdx];
  platforms = [];
  pucks = [];
  cups = [];
  logos = [];
  enemies = [];
  projectiles = [];
  particles = [];
  popups = [];
  cameraX = 0;
  victoryDanceTimer = 0;
  
  levelPucksCollected = 5; 
  levelCupsCollected = 0;
  levelScore = 0;
  centerNotificationTimer = 0;

  player.x = 100;
  player.y = 460 - player.height;
  player.vx = 0;
  player.vy = 0;
  player.isDead = false;
  player.deathTimer = 0;
  player.superTimer = 0;
  player.invincibleTimer = 0;
  player.danceAngle = 0;
  player.danceScaleX = 1;
  player.danceScaleY = 1;

  finishGoal.x = lvl.finishX;
  finishGoal.y = 460 - 100;

  // 1. Пол
  let curX = 0;
  while (curX < lvl.length + 500) {
    if (curX > 450 && curX < lvl.finishX - 250 && Math.random() < 0.20) {
      const gapWidth = 110 + Math.random() * 70;
      curX += gapWidth;
    } else {
      const segmentWidth = 400 + Math.random() * 400;
      platforms.push({
        x: curX,
        y: 460,
        width: segmentWidth,
        height: 80,
        type: 'ice'
      });
      curX += segmentWidth;
    }
  }

  // 2. Платформы
  for (let x = 350; x < lvl.finishX - 350; x += 320 + Math.random() * 200) {
    const isHigh = Math.random() > 0.45;
    const y = isHigh ? 230 : 340; 
    const width = 140 + Math.random() * 140;
    
    platforms.push({
      x: x,
      y: y,
      width: width,
      height: 30,
      type: 'platform'
    });

    const pucksOnPlatform = Math.floor(width / 50);
    for (let p = 0; p < pucksOnPlatform; p++) {
      pucks.push({
        x: x + 25 + p * 50,
        y: y - 24,
        width: 16,
        height: 16,
        collected: false
      });
    }

    if (width > 160 && Math.random() < 0.7) {
      enemies.push({
        x: x + width / 2 - 25,
        y: y - 60,
        vx: (Math.random() > 0.5 ? 1 : -1) * lvl.enemySpeed,
        width: 50,
        height: 60,
        minX: x + 5,
        maxX: x + width - 55,
        alive: true,
        squishTimer: 0,
        type: lvl.enemyType,
        hp: 1,
        hurtTimer: 0
      });
    }
  }

  // 3. Враги на полу
  platforms.forEach(plat => {
    if (plat.type === 'ice' && plat.width > 400 && plat.x > 300 && plat.x < lvl.finishX - 200) {
      const enemiesCount = Math.floor(plat.width / 500) + 1;
      for (let e = 0; e < enemiesCount; e++) {
        const offset = 120 + e * 350 + Math.random() * 80;
        if (plat.x + offset < plat.x + plat.width - 70) {
          enemies.push({
            x: plat.x + offset,
            y: plat.y - 60,
            vx: (Math.random() > 0.5 ? 1 : -1) * lvl.enemySpeed,
            width: 50,
            height: 60,
            minX: plat.x + 15,
            maxX: plat.x + plat.width - 65,
            alive: true,
            squishTimer: 0,
            type: lvl.enemyType,
            hp: 1,
            hurtTimer: 0
          });
        }
      }
    }
  });

  // 4. Обычные вратари на уровне (только со 2-го уровня!)
  if (lvl.spawnGoalies) {
    const goaliesCount = Math.floor(lvl.length / 3200);
    for (let g = 1; g <= goaliesCount; g++) {
      const targetX = g * 3000 + (Math.random() - 0.5) * 400;
      const plat = platforms.find(p => p.type === 'platform' && Math.abs(p.x - targetX) < 500);
      if (plat) {
        enemies.push({
          x: plat.x + plat.width / 2 - 36,
          y: plat.y - 72,
          vx: 0,
          width: 72,
          height: 72,
          minX: plat.x,
          maxX: plat.x,
          alive: true,
          squishTimer: 0,
          type: "goalie",
          hp: 2,
          hurtTimer: 0
        });
      } else {
        enemies.push({
          x: targetX,
          y: 460 - 72,
          vx: 0,
          width: 72,
          height: 72,
          minX: targetX,
          maxX: targetX,
          alive: true,
          squishTimer: 0,
          type: "goalie",
          hp: 2,
          hurtTimer: 0
        });
      }
    }
  }

  // 5. СУПЕРВРАТАРЬ НА ВОРОТАХ (6 HP, ОГРОМНЫЙ 110x110 И ЗЛОЙ)
  enemies.push({
    x: lvl.finishX - 240,
    y: 460 - 110,
    vx: -1.3, // Скользит туда-сюда, защищая ворота и атакуя Севу
    width: 110,
    height: 110,
    minX: lvl.finishX - 350,
    maxX: lvl.finishX - 130,
    alive: true,
    squishTimer: 0,
    type: "super_goalie",
    hp: 6, // 6 хп!
    maxHp: 6,
    hurtTimer: 0
  });

  // 6. Шайбы на льду
  platforms.forEach(plat => {
    if (plat.type === 'ice') {
      const step = 250 + Math.random() * 150;
      for (let sx = plat.x + 150; sx < plat.x + plat.width - 150; sx += step) {
        if (!pucks.some(p => Math.abs(p.x - sx) < 80)) {
          pucks.push({
            x: sx,
            y: plat.y - 24 - (Math.random() > 0.7 ? 85 : 0),
            width: 16,
            height: 16,
            collected: false
          });
        }
      }
    }
  });

  // 7. Ровно 3 Кубка Гагарина
  const cupInterval = lvl.finishX / 4;
  for (let c = 1; c <= 3; c++) {
    const targetX = c * cupInterval + (Math.random() - 0.5) * 150;
    const cupPlat = platforms.find(p => p.type === 'platform' && Math.abs(p.x - targetX) < 400);
    if (cupPlat) {
      cups.push({
        x: cupPlat.x + cupPlat.width / 2 - 18,
        y: cupPlat.y - 50,
        width: 36,
        height: 45,
        collected: false
      });
    } else {
      cups.push({
        x: targetX,
        y: 460 - 50,
        width: 36,
        height: 45,
        collected: false
      });
    }
  }

  // 8. Ровно ОДИН значок Юнити Северсталь
  const logoX = lvl.finishX / 2 + (Math.random() - 0.5) * 400;
  const logoPlat = platforms.find(p => p.type === 'platform' && Math.abs(p.x - logoX) < 300) || platforms[Math.floor(platforms.length / 2)];
  
  logos.push({
    x: logoPlat.x + logoPlat.width / 2 - 20,
    y: logoPlat.y - 55,
    width: 40,
    height: 40,
    collected: false
  });
}

// --- ЧАСТИЦЫ ---
function spawnIceParticles(x, y, count) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 3 - 1,
      color: 'rgba(255, 255, 255, 0.8)',
      size: 2 + Math.random() * 4,
      life: 1.0,
      decay: 0.03 + Math.random() * 0.04,
      type: 'ice'
    });
  }
}

function spawnSparkles(x, y, count, color = '#fcd116') {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6 - 2,
      color: color,
      size: 3 + Math.random() * 4,
      life: 1.0,
      decay: 0.02 + Math.random() * 0.02,
      type: 'sparkle'
    });
  }
}

function spawnVictoryConfetti() {
  for (let i = 0; i < 8; i++) {
    const colors = ['#fcd116', '#ffffff', '#ff3366', '#00e5ff', '#00e676'];
    particles.push({
      x: cameraX + Math.random() * CANVAS_WIDTH,
      y: 0,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      life: 2.0,
      decay: 0.01,
      type: 'confetti'
    });
  }
}

function checkAABB(r1, r2) {
  return r1.x < r2.x + r2.width &&
         r1.x + r1.width > r2.x &&
         r1.y < r2.y + r2.height &&
         r1.y + r1.height > r2.y;
}

// --- ОБНОВЛЕНИЕ ---
function update(dt) {
  if (gameState !== 'GAMEPLAY' && gameState !== 'VICTORY_DANCE') return;

  if (gameState === 'VICTORY_DANCE') {
    victoryDanceTimer -= dt;
    
    player.danceAngle = Math.sin(Date.now() / 65) * 0.45;
    player.y = finishGoal.y + finishGoal.height - player.height + Math.abs(Math.sin(Date.now() / 90)) * -30;
    player.danceScaleX = Math.sin(Date.now() / 110) > 0 ? 1.25 : -1.25;
    player.danceScaleY = 1.0 + Math.sin(Date.now() / 70) * 0.15;

    if (Math.random() < 0.3) {
      spawnSparkles(player.x + Math.random()*player.width, player.y + Math.random()*player.height, 4, `hsl(${Math.floor(Date.now()/5)%360}, 100%, 65%)`);
    }
    if (Math.random() < 0.15) {
      spawnVictoryConfetti();
    }

    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.life -= p.decay;
      if (p.type === 'ice' || p.type === 'confetti') p.vy += 0.12;
    });
    particles = particles.filter(p => p.life > 0);

    if (victoryDanceTimer <= 0) {
      triggerVictory();
    }
    return;
  }

  popups.forEach(pop => {
    pop.y -= 1.2;
    pop.timer -= dt;
  });
  popups = popups.filter(pop => pop.timer > 0);

  if (centerNotificationTimer > 0) {
    centerNotificationTimer -= dt;
  }

  if (player.invincibleTimer > 0) player.invincibleTimer -= dt;
  if (player.superTimer > 0) {
    player.superTimer -= dt;
    if (Math.random() < 0.4) {
      const colors = ['#ff3366', '#007aff', '#ffffff']; 
      spawnSparkles(player.x + player.width/2, player.y + player.height/2, 2, colors[Math.floor(Math.random()*colors.length)]);
    }
  }

  // Движение игрока
  if (!player.isDead) {
    const moveLeft = keys['KeyA'] || keys['ArrowLeft'];
    const moveRight = keys['KeyD'] || keys['ArrowRight'];

    if (moveLeft) {
      player.vx -= player.speed;
      player.facingRight = false;
    } else if (moveRight) {
      player.vx += player.speed;
      player.facingRight = true;
    }

    let currentFriction = ICE_FRICTION;
    const currentPlatform = getStandingPlatform();
    if (currentPlatform && currentPlatform.type === 'platform') {
      currentFriction = NORMAL_FRICTION;
    }
    player.vx *= currentFriction;

    if (player.vx > player.maxVx) player.vx = player.maxVx;
    if (player.vx < -player.maxVx) player.vx = -player.maxVx;

    const jumpPressed = keys['KeyW'] || keys['Space'] || keys['ArrowUp'];
    if (jumpPressed && player.onGround) {
      player.vy = -player.jumpForce;
      player.onGround = false;
      audio.playJump();
      spawnIceParticles(player.x + player.width / 2, player.y + player.height, 5);
    }

    player.vy += GRAVITY;
    player.y += player.vy;
    player.onGround = false;

    platforms.forEach(plat => {
      if (checkAABB(player, plat)) {
        if (player.vy > 0 && player.y + player.height - player.vy <= plat.y + 8) {
          player.y = plat.y - player.height;
          player.vy = 0;
          player.onGround = true;
        } else if (player.vy < 0 && player.y - player.vy >= plat.y + plat.height - 8) {
          player.y = plat.y + plat.height;
          player.vy = 0.5;
        }
      }
    });

    player.x += player.vx;

    if (player.x < 0) {
      player.x = 0;
      player.vx = 0;
    }
    
    platforms.forEach(plat => {
      if (checkAABB(player, plat)) {
        if (player.y + player.height > plat.y + 4 && player.y < plat.y + plat.height - 4) {
          if (player.vx > 0) {
            player.x = plat.x - player.width;
            player.vx = 0;
          } else if (player.vx < 0) {
            player.x = plat.x + plat.width;
            player.vx = 0;
          }
        }
      }
    });

    if (player.y > CANVAS_HEIGHT + 100) {
      hurtPlayer(true);
    }
  } else {
    player.vy += 0.4;
    player.y += player.vy;
    player.deathTimer -= dt;
    
    if (player.deathTimer <= 0) {
      respawnPlayer();
    }
  }

  // Камера
  const targetCamX = player.x - CANVAS_WIDTH / 3;
  cameraX += (targetCamX - cameraX) * 0.1;
  const maxCameraX = LEVELS[currentLevelIndex].length - CANVAS_WIDTH;
  if (cameraX < 0) cameraX = 0;
  if (cameraX > maxCameraX) cameraX = maxCameraX;

  // Движение летящих шайб
  projectiles.forEach(p => {
    if (p.deflected) {
      p.vy += 0.3; 
      p.x += p.vx;
      p.y += p.vy;
      if (p.y > CANVAS_HEIGHT + 10) p.active = false;
      return;
    }

    if (p.owner === 'boss') {
      p.x += p.vx;
      platforms.forEach(plat => {
        if (checkAABB(p, plat)) {
          p.active = false;
          spawnSparkles(p.x + 8, p.y + 4, 4, '#ff3366');
        }
      });
      if (checkAABB(p, player) && !player.isDead) {
        p.active = false;
        hurtPlayer(false);
        spawnSparkles(p.x + 8, p.y + 4, 15, '#ff3366');
      }
    } else {
      p.x += p.vx;
      platforms.forEach(plat => {
        if (checkAABB(p, plat)) {
          p.active = false;
          spawnSparkles(p.x + 8, p.y + 4, 4, '#ffffff');
        }
      });
    }

    if (p.owner !== 'boss') {
      enemies.forEach(enemy => {
        if (enemy.alive && checkAABB(p, enemy)) {
          const isGoalieBoss = (enemy.type === 'goalie' || enemy.type === 'super_goalie');
          if (isGoalieBoss && enemy.hp > 1) {
            enemy.hp--;
            enemy.hurtTimer = 0.5;
            
            p.deflected = true;
            p.vx = -p.vx * 0.35; 
            p.vy = -6 - Math.random() * 3; 
            
            audio.playDeflect();
            spawnSparkles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 10, '#ffcc00');
            popups.push({
              x: enemy.x + enemy.width/2,
              y: enemy.y - 15,
              text: enemy.type === 'super_goalie' ? `ХИТ БОССА! (${enemy.hp}/6)` : "СЕЙВ!",
              color: "#ff3366",
              timer: 1.0
            });
          } else {
            p.active = false;
            enemy.alive = false;
            enemy.squishTimer = 0.8;
            
            const isBoss = enemy.type === 'super_goalie';
            levelScore += isBoss ? 2000 : 300;
            score += isBoss ? 2000 : 300;
            
            audio.playSquish();
            spawnSparkles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, isBoss ? 35 : 12, '#ff3366');
            updateHUD();
            
            if (isBoss) {
              showCenterNotification("СУПЕРВРАТАРЬ СБИТ! ПУТЬ СВОБОДЕН!");
            }
          }
        }
      });
    }

    if (p.x < cameraX || p.x > cameraX + CANVAS_WIDTH) {
      p.active = false;
    }
  });
  projectiles = projectiles.filter(p => p.active);

  // Сбор шайб
  pucks.forEach(p => {
    if (!p.collected && checkAABB(player, p) && !player.isDead) {
      p.collected = true;
      levelPucksCollected++;
      totalPucksCollected++;
      levelScore += 50;
      score += 50;
      audio.playPuck();
      spawnSparkles(p.x + 8, p.y + 8, 4, '#fcd116');
      updateHUD();
    }
  });

  // Сбор Кубков
  cups.forEach(cup => {
    if (!cup.collected && checkAABB(player, cup) && !player.isDead) {
      cup.collected = true;
      levelCupsCollected++;
      levelScore += 1000;
      score += 1000;
      audio.playCup();
      spawnSparkles(cup.x + 18, cup.y + 22, 20, '#00e5ff');
      showCenterNotification(`КУБОК ГАГАРИНА СОБРАН! (${levelCupsCollected} / 3)`);
      updateHUD();
    }
  });

  // Сбор Значка Юнити
  logos.forEach(logo => {
    if (!logo.collected && checkAABB(player, logo) && !player.isDead) {
      logo.collected = true;
      player.superTimer = 10.0; 
      levelScore += 1000;
      score += 1000;
      audio.playCup();
      spawnSparkles(logo.x + 20, logo.y + 20, 25, '#ff3366');
      showCenterNotification("НЕУЯЗВИМОСТЬ: 10 СЕКУНД (ЮНИТИ)!");
      updateHUD();
    }
  });

  // Враги
  enemies.forEach(enemy => {
    if (!enemy.alive) {
      if (enemy.squishTimer > 0) enemy.squishTimer -= dt;
      return;
    }

    if (enemy.hurtTimer > 0) enemy.hurtTimer -= dt;

    enemy.x += enemy.vx;
    if (enemy.x <= enemy.minX) {
      enemy.x = enemy.minX;
      enemy.vx = -enemy.vx;
    } else if (enemy.x >= enemy.maxX) {
      enemy.x = enemy.maxX;
      enemy.vx = -enemy.vx;
    }

    // Логика стрельбы босса (супервратаря)
    if (enemy.type === 'super_goalie') {
      if (typeof enemy.shootTimer === 'undefined') {
        enemy.shootTimer = 1.2;
      }
      enemy.shootTimer -= dt;
      if (enemy.shootTimer <= 0) {
        enemy.shootTimer = 1.5 + Math.random() * 0.8; 
        const dist = player.x - enemy.x;
        if (dist < 0 && dist > -600 && !player.isDead) {
          audio.playShoot();
          projectiles.push({
            x: enemy.x - 20,
            y: enemy.y + enemy.height / 2 + 10,
            vx: -8, 
            vy: 0,
            width: 14,
            height: 8,
            active: true,
            deflected: false,
            owner: 'boss' 
          });
          spawnSparkles(enemy.x - 10, enemy.y + enemy.height / 2 + 10, 4, '#ff3366');
        }
      }
    }

    if (checkAABB(player, enemy) && !player.isDead) {
      const isJumpingOnTop = player.vy > 0 && (player.y + player.height - player.vy) <= (enemy.y + 25);
      
      if (isJumpingOnTop) {
        const isGoalieBoss = (enemy.type === 'goalie' || enemy.type === 'super_goalie');
        if (isGoalieBoss && enemy.hp > 1) {
          enemy.hp--;
          enemy.hurtTimer = 0.5;
          player.vy = -player.jumpForce * 0.8;
          player.onGround = false;
          audio.playDeflect();
          spawnSparkles(enemy.x + enemy.width/2, enemy.y + 15, 10, '#ffcc00');
          popups.push({
            x: enemy.x + enemy.width/2,
            y: enemy.y - 15,
            text: enemy.type === 'super_goalie' ? `БОСС ХИТ! (${enemy.hp}/6)` : "ОТБИТО!",
            color: "#ff3366",
            timer: 1.0
          });
        } else {
          enemy.alive = false;
          enemy.squishTimer = 1.0;
          player.vy = -player.jumpForce * 0.75;
          player.onGround = false;
          
          const isBoss = enemy.type === 'super_goalie';
          levelScore += isBoss ? 2000 : 300;
          score += isBoss ? 2000 : 300;
          
          audio.playSquish();
          spawnSparkles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, isBoss ? 30 : 10, '#ffffff');
          updateHUD();
          
          if (isBoss) {
            showCenterNotification("СУПЕРВРАТАРЬ СБИТ! ПУТЬ СВОБОДЕН!");
          }
        }
      } else {
        if (player.superTimer > 0) {
          enemy.alive = false;
          enemy.squishTimer = 0.5;
          
          const isBoss = enemy.type === 'super_goalie';
          levelScore += isBoss ? 2000 : 300;
          score += isBoss ? 2000 : 300;
          
          audio.playSquish();
          spawnSparkles(enemy.x + enemy.width/2, enemy.y + 20, isBoss ? 30 : 15, '#fcd116');
          updateHUD();
          
          if (isBoss) {
            showCenterNotification("СУПЕРВРАТАРЬ СБИТ! ПУТЬ СВОБОДЕН!");
          }
        } else {
          hurtPlayer(false);
        }
      }
    }
  });

  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;
    if (p.type === 'ice' || p.type === 'confetti') {
      p.vy += 0.12;
    }
  });
  particles = particles.filter(p => p.life > 0);

  if (!player.isDead && checkAABB(player, finishGoal)) {
    const bossAlive = enemies.some(e => e.type === 'super_goalie' && e.alive);
    if (levelCupsCollected === 3 && !bossAlive) {
      gameState = 'VICTORY_DANCE';
      victoryDanceTimer = 3.0; 
      audio.stopMusic();
      audio.playCrowdCheer(); 
      player.vx = 0;
      player.vy = 0;
      player.x = finishGoal.x + finishGoal.width / 2 - player.width / 2;
    } else {
      if (bossAlive) {
        showCenterNotification("ПОБЕДИТЕ СУПЕРВРАТАРЯ!");
      } else {
        showCenterNotification(`СОБЕРИТЕ ВСЕ КУБКИ ГАГАРИНА! (Осталось: ${3 - levelCupsCollected})`);
      }
      player.x = finishGoal.x - player.width - 5;
      player.vx = -3.5;
    }
  }
}

function getStandingPlatform() {
  return platforms.find(plat => 
    player.x + player.width > plat.x && 
    player.x < plat.x + plat.width && 
    Math.abs(player.y + player.height - plat.y) < 2
  );
}

function hurtPlayer(instantDeath) {
  if (player.invincibleTimer > 0 && !instantDeath) return;

  if (instantDeath) {
    player.lives = 0;
  } else {
    player.lives--;
    player.invincibleTimer = 2.0;
    audio.playHurt();
    spawnSparkles(player.x + player.width/2, player.y + player.height/2, 12, '#ff3366');
  }

  updateHUD();

  if (player.lives <= 0) {
    player.isDead = true;
    player.vy = -10;
    player.deathTimer = 2.0;
    audio.playGameOver();
  }
}

function respawnPlayer() {
  score = Math.max(0, score - levelScore); 
  if (player.lives <= 0) {
    triggerGameOver();
  } else {
    const tempLives = player.lives;
    buildLevel(currentLevelIndex);
    player.lives = tempLives;
    player.invincibleTimer = 3.0;
    updateHUD();
  }
}

// --- ОТРИСОВКА ОРИЕНТИРОВ (ДОСТОПРИМЕЧАТЕЛЬНОСТЕЙ) ГОРОДОВ ---
function drawProceduralLandmarks(c, levelIdx) {
  try {
    c.save();
    const stepX = 1400;
    const count = 10;
    
    for (let i = 0; i < count; i++) {
      const baseX = 250 + i * stepX;
      
      if (levelIdx === 0) {
        // Череповец: Силуэты металлургического завода Северсталь
        c.fillStyle = 'rgba(29, 35, 49, 0.20)';
        c.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        c.lineWidth = 1;
        
        c.fillRect(baseX, 260, 180, 200);
        c.fillRect(baseX + 130, 290, 120, 170);
        
        c.fillRect(baseX + 30, 120, 12, 140);
        c.fillRect(baseX + 70, 100, 15, 160);
        
        c.fillStyle = 'rgba(255, 255, 255, 0.07)';
        c.beginPath();
        c.arc(baseX + 36, 100, 15, 0, 2*Math.PI);
        c.arc(baseX + 45, 80, 20, 0, 2*Math.PI);
        c.arc(baseX + 60, 60, 28, 0, 2*Math.PI);
        c.fill();
      }
      
      else if (levelIdx === 2) {
        // Минск: Тракторы МТЗ, Беловежские Зубры и Мешки Картошки!
        c.fillStyle = 'rgba(29, 39, 58, 0.28)';
        c.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        c.lineWidth = 1.5;

        // 1. Силуэт Зубра (Bison)
        const bx = baseX - 50;
        const by = 350;
        
        c.beginPath();
        c.arc(bx + 40, by, 35, 0, 2*Math.PI); 
        c.arc(bx, by - 12, 45, 0, 2*Math.PI); 
        c.arc(bx - 35, by - 5, 22, 0, 2*Math.PI); 
        c.fill();
        
        c.fillRect(bx + 15, by, 12, 110);
        c.fillRect(bx + 50, by, 12, 110);
        c.fillRect(bx - 20, by, 12, 110);
        c.fillRect(bx - 32, by, 12, 110);
        
        c.beginPath();
        c.arc(bx - 42, by - 22, 12, Math.PI * 1.2, Math.PI * 1.8);
        c.stroke();

        // 2. Силуэт Трактора МТЗ «Беларус»
        const tx = baseX + 180;
        const ty = 340;
        
        c.fillStyle = 'rgba(20, 28, 40, 0.32)';
        c.beginPath();
        c.arc(tx + 75, ty + 75, 42, 0, 2*Math.PI); 
        c.arc(tx - 5, ty + 92, 25, 0, 2*Math.PI); 
        c.fill();
        
        c.fillStyle = 'rgba(33, 44, 61, 0.28)';
        c.fillRect(tx + 30, ty, 65, 60); 
        c.fillRect(tx - 25, ty + 40, 60, 45); 
        c.fillRect(tx - 15, ty - 10, 6, 50); 
        
        c.fillStyle = 'rgba(255, 255, 255, 0.12)';
        c.fillRect(tx + 40, ty + 10, 45, 30);

        // 3. Мешок картошки
        const px = baseX + 380;
        const py = 410;
        c.fillStyle = 'rgba(150, 100, 60, 0.28)'; 
        c.beginPath();
        c.arc(px, py, 26, 0, 2*Math.PI);
        c.arc(px, py - 18, 18, 0, 2*Math.PI);
        c.fill();
        
        c.strokeStyle = 'rgba(255,255,255,0.2)';
        c.beginPath();
        c.arc(px, py - 20, 6, 0, 2*Math.PI);
        c.stroke();

        // Россыпь картошин на льду
        c.fillStyle = 'rgba(120, 80, 50, 0.3)';
        c.beginPath();
        c.arc(px - 32, py + 18, 6, 0, 2*Math.PI);
        c.arc(px - 44, py + 20, 5, 0, 2*Math.PI);
        c.arc(px - 38, py + 22, 6, 0, 2*Math.PI);
        c.fill();
      }
      
      else if (levelIdx === 4) {
        // Казань: Мечеть Кул-Шариф и башня Сююмбике
        c.fillStyle = 'rgba(255, 255, 255, 0.22)';
        c.strokeStyle = 'rgba(0, 229, 255, 0.15)';
        c.lineWidth = 1;
        
        c.fillRect(baseX, 290, 160, 170);
        
        c.fillStyle = 'rgba(0, 150, 136, 0.3)';
        c.beginPath();
        c.arc(baseX + 80, 290, 50, Math.PI, 2 * Math.PI);
        c.fill();
        
        c.fillStyle = 'rgba(255, 255, 255, 0.28)';
        c.fillRect(baseX - 20, 140, 12, 320);
        c.fillRect(baseX + 168, 140, 12, 320);
        
        c.fillStyle = 'rgba(0, 150, 136, 0.40)';
        c.beginPath();
        c.moveTo(baseX - 20, 140);
        c.lineTo(baseX - 14, 100);
        c.lineTo(baseX - 8, 140);
        c.closePath();
        c.fill();
        
        c.beginPath();
        c.moveTo(baseX + 168, 140);
        c.lineTo(baseX + 174, 100);
        c.lineTo(baseX + 180, 140);
        c.closePath();
        c.fill();
        
        // Башня Сююмбике
        c.fillStyle = 'rgba(163, 53, 53, 0.20)';
        c.fillRect(baseX + 280, 240, 50, 220);
        c.fillRect(baseX + 285, 170, 40, 70);
        c.fillRect(baseX + 290, 120, 30, 50);
        c.beginPath();
        c.moveTo(baseX + 290, 120);
        c.lineTo(baseX + 305, 50);
        c.lineTo(baseX + 320, 120);
        c.closePath();
        c.fill();
      }
      
      else if (levelIdx === 6) {
        // Пекин: Храм Неба и Великая Китайская стена
        const hx = baseX + 150;
        const hy = 230;
        
        c.fillStyle = 'rgba(229, 57, 53, 0.20)';
        c.fillRect(hx - 60, hy + 80, 120, 150);
        
        c.fillStyle = 'rgba(21, 101, 192, 0.30)';
        c.beginPath();
        c.moveTo(hx - 80, hy + 80);
        c.lineTo(hx, hy + 40);
        c.lineTo(hx + 80, hy + 80);
        c.closePath();
        c.fill();
        
        c.beginPath();
        c.moveTo(hx - 60, hy + 40);
        c.lineTo(hx, hy + 10);
        c.lineTo(hx + 60, hy + 40);
        c.closePath();
        c.fill();
        
        c.beginPath();
        c.moveTo(hx - 40, hy + 10);
        c.lineTo(hx, hy - 15);
        c.lineTo(hx + 40, hy + 10);
        c.closePath();
        c.fill();
        
        c.fillStyle = 'rgba(120, 110, 90, 0.12)';
        c.beginPath();
        c.moveTo(baseX - 400, 460);
        c.quadraticCurveTo(baseX - 200, 300, baseX, 360);
        c.quadraticCurveTo(baseX + 200, 420, baseX + 400, 320);
        c.lineTo(baseX + 400, 460);
        c.closePath();
        c.fill();
        
        c.fillStyle = 'rgba(100, 90, 80, 0.20)';
        c.fillRect(baseX - 20, 320, 40, 50);
        c.fillRect(baseX - 25, 300, 50, 20);
      }
    }
    c.restore();
  } catch (pe) {
    console.warn("drawProceduralLandmarks error:", pe);
  }
}

// --- ОТРИСОВКА ---
function draw() {
  try {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const lvl = LEVELS[currentLevelIndex];

    // 1. Отрисовка параллакс-фона
    let bgKey = "bgCherepovets";
    if (currentLevelIndex === 1) bgKey = "bgYaroslavl";
    if (currentLevelIndex === 2) bgKey = "bgMinsk";
    if (currentLevelIndex === 3 || currentLevelIndex === 4) bgKey = "bgSpb";
    if (currentLevelIndex === 5 || currentLevelIndex === 6) bgKey = "bgMoscow";
    
    const bgImg = images[bgKey];
    if (bgImg) {
      const bgOffset = -(cameraX * 0.15) % CANVAS_WIDTH;
      
      ctx.save();
      try {
        if (lvl.bgFilter && 'filter' in ctx) {
          ctx.filter = lvl.bgFilter;
        }
      } catch (fe) {}
      
      ctx.drawImage(bgImg, bgOffset, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      if (bgOffset < 0) {
        ctx.drawImage(bgImg, bgOffset + CANVAS_WIDTH, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
      
      try {
        ctx.filter = 'none';
      } catch (re) {}
      ctx.restore();
      
      // 1.2. Отрисовка достопримечательностей с 25% параллаксом
      ctx.save();
      ctx.translate(-cameraX * 0.25, 0); 
      drawProceduralLandmarks(ctx, currentLevelIndex);
      ctx.restore();
      
      // Светлый слой
      ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      grad.addColorStop(0, '#e8f7ff');
      grad.addColorStop(1, '#b0e3ff');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    ctx.save();
    ctx.translate(-cameraX, 0);

    // 2. Ворота
    drawGoal(finishGoal.x, finishGoal.y, finishGoal.width, finishGoal.height);

    // 3. Платформы и Лед
    platforms.forEach(plat => {
      if (plat.type === 'ice') {
        ctx.fillStyle = lvl.iceColor;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        
        ctx.strokeStyle = 'rgba(255, 50, 50, 0.4)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(plat.x, plat.y + 4);
        ctx.lineTo(plat.x + plat.width, plat.y + 4);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.5;
        for (let cx = plat.x + 30; cx < plat.x + plat.width; cx += 120) {
          ctx.beginPath();
          ctx.arc(cx, plat.y + 15, 10, 0.2 * Math.PI, 0.8 * Math.PI);
          ctx.stroke();
        }
      } else {
        const gradPlat = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
        gradPlat.addColorStop(0, '#a8e6ff');
        gradPlat.addColorStop(1, '#1b639e');
        
        ctx.fillStyle = gradPlat;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        drawRoundRect(ctx, plat.x, plat.y, plat.width, plat.height, 8);
        ctx.fill();
        ctx.stroke();
      }
    });

    // 4. Обычные шайбы
    pucks.forEach(p => {
      if (p.collected) return;
      
      ctx.shadowColor = 'rgba(252, 209, 22, 0.95)';
      ctx.shadowBlur = 10;
      
      if (images.puck) {
        ctx.drawImage(images.puck, p.x, p.y, p.width, p.height);
      } else {
        ctx.fillStyle = '#111111';
        ctx.strokeStyle = '#fcd116';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(p.x + p.width/2, p.y + p.height/2, p.width/2, p.height/3, 0, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();
      }
      ctx.shadowBlur = 0; 
    });

    // 5. Летящие шайбы
    projectiles.forEach(p => {
      ctx.save();
      ctx.translate(p.x + p.width/2, p.y + p.height/2);
      ctx.rotate((Date.now() / 45) % (2*Math.PI));
      
      if (p.owner === 'boss') {
        ctx.shadowColor = 'rgba(255, 30, 80, 0.95)';
      } else {
        ctx.shadowColor = p.deflected ? 'rgba(255, 51, 102, 0.8)' : 'rgba(0, 229, 255, 0.9)';
      }
      ctx.shadowBlur = 8;
      
      if (images.puck) {
        if (p.owner === 'boss') {
          ctx.save();
          try {
            if ('filter' in ctx) ctx.filter = 'hue-rotate(-120deg) saturate(1.8)';
          } catch(e){}
          ctx.drawImage(images.puck, -p.width/2, -p.height/2, p.width, p.height);
          ctx.restore();
        } else {
          ctx.drawImage(images.puck, -p.width/2, -p.height/2, p.width, p.height);
        }
      } else {
        ctx.fillStyle = p.owner === 'boss' ? '#ff1744' : '#111111';
        ctx.strokeStyle = p.owner === 'boss' ? '#ffffff' : p.deflected ? '#ff3366' : '#00e5ff';
        ctx.lineWidth = 1;
        ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);
      }
      ctx.restore();
    });

    // 6. Кубки
    cups.forEach(c => {
      if (c.collected) return;
      
      const pulseRadius = 32 + Math.sin(Date.now() / 150) * 8;
      const radialGrad = ctx.createRadialGradient(
        c.x + c.width/2, c.y + c.height/2, 2,
        c.x + c.width/2, c.y + c.height/2, pulseRadius
      );
      radialGrad.addColorStop(0, 'rgba(0, 229, 255, 0.5)');
      radialGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = radialGrad;
      ctx.beginPath();
      ctx.arc(c.x + c.width/2, c.y + c.height/2, pulseRadius, 0, 2*Math.PI);
      ctx.fill();

      ctx.font = `${c.height}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏆', c.x + c.width/2, c.y + c.height/2);
    });

    // 7. Значок «Северсталь» (Юнити)
    logos.forEach(logo => {
      if (logo.collected) return;
      
      const pulse = 24 + Math.sin(Date.now() / 100) * 5;
      const radGrad = ctx.createRadialGradient(
        logo.x + logo.width/2, logo.y + logo.height/2, 2,
        logo.x + logo.width/2, logo.y + logo.height/2, pulse
      );
      radGrad.addColorStop(0, 'rgba(255, 51, 102, 0.4)'); 
      radGrad.addColorStop(1, 'rgba(255, 51, 102, 0)');
      
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(logo.x + logo.width/2, logo.y + logo.height/2, pulse, 0, 2*Math.PI);
      ctx.fill();

      if (images.logoSeverstal) {
        ctx.drawImage(images.logoSeverstal, logo.x, logo.y, logo.width, logo.height);
      } else {
        ctx.fillStyle = '#ff3366';
        ctx.strokeStyle = '#007aff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(logo.x + logo.width/2, logo.y + logo.height/2, logo.width/2, 0, 2*Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    });

    // 8. Враги
    enemies.forEach(enemy => {
      if (!enemy.alive && enemy.squishTimer <= 0) return;

      ctx.save();
      ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

      if (!enemy.alive) {
        ctx.scale(1.2, 0.15);
      } else {
        if (enemy.vx > 0) ctx.scale(-1, 1);
        if (enemy.hurtTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
          ctx.globalAlpha = 0.4;
        }
      }

      // Подсветка супервратаря (Аура босса)
      if (enemy.alive && enemy.type === 'super_goalie') {
        ctx.shadowColor = 'rgba(255, 30, 80, 0.95)';
        ctx.shadowBlur = 22;
      }

      let enemyImg = images[`enemy${enemy.type.charAt(0).toUpperCase() + enemy.type.slice(1)}`];
      if (enemy.type === 'goalie' || enemy.type === 'super_goalie') {
        enemyImg = images.enemyGoalie;
      }

      if (enemyImg) {
        ctx.drawImage(enemyImg, -enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
      } else {
        ctx.fillStyle = enemy.type === 'super_goalie' ? '#700' : enemy.type === 'goalie' ? '#111' : '#ff3b30';
        ctx.fillRect(-enemy.width/2, -enemy.height/2, enemy.width, enemy.height);
      }

      // Полоска здоровья БОССА
      if (enemy.alive && enemy.type === 'super_goalie') {
        ctx.shadowBlur = 0; // Сбрасываем тень для полоски здоровья
        const barW = 80;
        const barH = 8;
        const barX = -barW / 2;
        const barY = -enemy.height / 2 - 15;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#ff1744';
        ctx.fillRect(barX, barY, barW * (enemy.hp / enemy.maxHp), barH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(barX, barY, barW, barH);
      }

      ctx.restore();
    });

    // 9. Сева
    if (!player.isDead || player.deathTimer > 0) {
      ctx.save();
      ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
      
      if (player.invincibleTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
        ctx.globalAlpha = 0.3;
      }

      if (player.superTimer > 0) {
        ctx.shadowColor = `hsl(${Math.floor(Date.now() / 2.5) % 360}, 100%, 60%)`;
        ctx.shadowBlur = 25;
      }

      let renderScaleX = 1;
      let renderScaleY = 1;
      let renderAngle = 0;
      let bobY = 0;

      if (gameState === 'VICTORY_DANCE') {
        renderAngle = player.danceAngle;
        renderScaleX = player.danceScaleX;
        renderScaleY = player.danceScaleY;
      } else {
        if (!player.facingRight) {
          ctx.scale(-1, 1);
        }

        if (!player.isDead && player.onGround && Math.abs(player.vx) > 0.5) {
          const cycle = Date.now() * 0.018 * (Math.abs(player.vx) / player.maxVx + 0.3);
          renderAngle = Math.sin(cycle) * 0.09;
          bobY = Math.abs(Math.sin(cycle)) * 4.5 - 2;
          renderScaleX = 1.05 + Math.sin(cycle) * 0.09;
          renderScaleY = 0.95 - Math.sin(cycle) * 0.04;
          
          if (Math.abs(Math.sin(cycle)) > 0.8 && Math.random() < 0.45) {
            const sprayX = player.x + (player.facingRight ? 0 : player.width);
            const sprayY = player.y + player.height - 2;
            spawnIceParticles(sprayX, sprayY, 2);
          }
        }
      }

      ctx.rotate(renderAngle);
      ctx.scale(renderScaleX, renderScaleY);

      if (images.player) {
        ctx.drawImage(images.player, -player.width / 2, -player.height / 2 + bobY, player.width, player.height);
      } else {
        ctx.fillStyle = '#fcd116';
        ctx.fillRect(-player.width/2, -player.height/2 + bobY, player.width, player.height);
      }
      ctx.restore();
    }

    // 10. Частицы
    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      if (p.type === 'confetti') {
        ctx.fillRect(p.x, p.y, p.size, p.size);
      } else {
        ctx.arc(p.x, p.y, p.size, 0, 2*Math.PI);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;
    });

    // 11. Поп-апы
    popups.forEach(pop => {
      ctx.fillStyle = pop.color;
      ctx.font = 'bold 15px Montserrat';
      ctx.textAlign = 'center';
      ctx.fillText(pop.text, pop.x, pop.y);
    });

    ctx.restore(); 

    // 12. Центровое уведомление
    if (centerNotificationTimer > 0) {
      ctx.save();
      ctx.fillStyle = 'rgba(11, 15, 25, 0.85)';
      ctx.strokeStyle = '#fcd116';
      ctx.lineWidth = 2.5;
      
      const textMetrics = ctx.measureText(centerNotificationText);
      const boxW = Math.max(380, textMetrics.width + 50);
      const boxH = 50;
      const boxX = (CANVAS_WIDTH - boxW) / 2;
      const boxY = 120;
      
      ctx.beginPath();
      drawRoundRect(ctx, boxX, boxY, boxW, boxH, 10);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic bold 15px Montserrat';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(centerNotificationText, CANVAS_WIDTH / 2, boxY + boxH / 2);
      ctx.restore();
    }
  } catch (renderError) {
    console.error("Canvas rendering crash caught safely:", renderError);
  }
}

// Ворота
function drawGoal(x, y, w, h) {
  const bossAlive = enemies.some(e => e.type === 'super_goalie' && e.alive);
  const allCollected = levelCupsCollected === 3 && !bossAlive;

  ctx.fillStyle = allCollected ? 'rgba(52, 199, 89, 0.4)' : 'rgba(255, 59, 48, 0.2)';
  ctx.strokeStyle = allCollected ? '#34c759' : '#ff3b30'; 
  ctx.lineWidth = 4;
  
  ctx.beginPath();
  drawRoundRect(ctx, x, y, w, h, [15, 15, 0, 0]);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = x + 10; i < x + w; i += 12) {
    ctx.moveTo(i, y);
    ctx.lineTo(i - 10, y + h);
  }
  for (let j = y + 10; j < y + h; j += 12) {
    ctx.moveTo(x, j);
    ctx.lineTo(x + w, j);
  }
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (allCollected) {
    ctx.fillText('🥅', x + w/2, y + h/2);
  } else {
    ctx.fillText('🔒', x + w/2, y + h/2);
  }

  const isBeaconOn = (gameState === 'VICTORY' || gameState === 'VICTORY_DANCE' || allCollected) && Math.floor(Date.now() / 150) % 2 === 0;
  ctx.fillStyle = allCollected ? (isBeaconOn ? '#34c759' : '#1e7b34') : '#ff3b30';
  ctx.beginPath();
  ctx.arc(x + w/2, y - 8, 8, 0, 2*Math.PI);
  ctx.fill();
  
  if (isBeaconOn) {
    ctx.shadowColor = allCollected ? '#34c759' : '#ff3b30';
    ctx.shadowBlur = 15;
    ctx.fillStyle = allCollected ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 59, 48, 0.3)';
    ctx.beginPath();
    ctx.arc(x + w/2, y - 8, 25, 0, 2*Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// --- ИГРОВОЙ ЦИКЛ ---
function gameLoop(timestamp) {
  try {
    if (!lastTime) lastTime = timestamp;
    let dt = (timestamp - lastTime) / 1000;
    if (dt > 0.1) dt = 0.1;
    lastTime = timestamp;

    update(dt);
    draw();

    gameLoopId = requestAnimationFrame(gameLoop);
  } catch (loopError) {
    console.error("Game loop iteration crashed safely:", loopError);
    gameLoopId = requestAnimationFrame(gameLoop);
  }
}

// --- HUD ---
function updateHUD() {
  try {
    const livesContainer = document.getElementById('hud-lives');
    if (livesContainer) {
      livesContainer.innerHTML = '';
      for (let i = 0; i < 3; i++) {
        const heart = document.createElement('span');
        heart.className = `hud-heart ${i >= player.lives ? 'empty' : ''}`;
        heart.textContent = '❤️';
        livesContainer.appendChild(heart);
      }
    }

    const hudPucks = document.getElementById('hud-pucks');
    if (hudPucks) hudPucks.textContent = levelPucksCollected;

    const hudCups = document.getElementById('hud-cups');
    if (hudCups) hudCups.textContent = `${levelCupsCollected} / 3`;
    
    const hudScore = document.getElementById('hud-score');
    if (hudScore) {
      const formattedScore = String(score).padStart(6, '0');
      hudScore.textContent = formattedScore;
    }

    const hudLevelName = document.getElementById('hud-level-name');
    const lvl = LEVELS[currentLevelIndex];
    if (hudLevelName && lvl) {
      hudLevelName.innerHTML = `<b>${lvl.city}</b> | ${lvl.arena}`;
    }
  } catch (e) {
    console.warn("updateHUD error:", e);
  }
}

function showScreen(screenId) {
  try {
    const screens = ['start-screen', 'level-select-screen', 'help-screen', 'pause-screen', 'game-over-screen', 'victory-screen'];
    screens.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (id === screenId) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    });

    const hud = document.getElementById('hud');
    if (hud) {
      if (screenId === 'pause-screen' || screenId === '') {
        hud.classList.remove('hidden');
      } else {
        hud.classList.add('hidden');
      }
    }
  } catch (e) {
    console.warn("showScreen error:", e);
  }
}

// --- СОБЫТИЯ ---

function startGame(levelIdx = 0) {
  try {
    audio.init();
    currentLevelIndex = levelIdx;
    score = 0;
    player.lives = 3;
    
    buildLevel(currentLevelIndex);
    updateHUD();
    
    gameState = 'GAMEPLAY';
    showScreen('');
    
    lastTime = 0;
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    gameLoopId = requestAnimationFrame(gameLoop);

    audio.startMusic();
  } catch (e) {
    console.error("startGame crash caught safely:", e);
  }
}

function pauseGame() {
  try {
    if (gameState !== 'GAMEPLAY') return;
    gameState = 'PAUSED';
    audio.stopMusic(); 
    showScreen('pause-screen');
  } catch (e) {
    console.warn("pauseGame error:", e);
  }
}

function resumeGame() {
  try {
    if (gameState !== 'PAUSED') return;
    gameState = 'GAMEPLAY';
    showScreen('');
    lastTime = performance.now();
    audio.startMusic(); 
  } catch (e) {
    console.warn("resumeGame error:", e);
  }
}

function triggerGameOver() {
  try {
    gameState = 'GAME_OVER';
    audio.stopMusic();
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    const goScore = document.getElementById('go-score');
    if (goScore) goScore.textContent = score;
    showScreen('game-over-screen');
  } catch (e) {
    console.warn("triggerGameOver error:", e);
  }
}

function triggerVictory() {
  try {
    gameState = 'VICTORY';
    audio.stopMusic();
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    
    const vicCups = document.getElementById('vic-cups');
    if (vicCups) vicCups.textContent = `${levelCupsCollected} / 3`;

    const vicScore = document.getElementById('vic-score');
    if (vicScore) vicScore.textContent = score;

    const btnNext = document.getElementById('btn-next-level');
    const msg = document.getElementById('victory-message');
    
    if (currentLevelIndex < LEVELS.length - 1) {
      if (btnNext) btnNext.style.display = 'inline-block';
      
      const nextLvlCard = document.getElementById(`card-lvl-${currentLevelIndex + 2}`);
      if (nextLvlCard) nextLvlCard.classList.remove('locked');

      if (msg) msg.textContent = `Матч выигран! Все 3 кубка Гагарина собраны в городе ${LEVELS[currentLevelIndex].city}!`;
    } else {
      if (btnNext) btnNext.style.display = 'none';
      if (msg) msg.textContent = "ПОЗДРАВЛЯЕМ! Вы прошли всю игру, победили всех соперников и защитили Кубок!";
    }

    showScreen('victory-screen');
  } catch (e) {
    console.warn("triggerVictory error:", e);
  }
}

// --- ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ (С ЗАЩИТОЙ ОТ БЛОКИРОВКИ) ---
function initGameApp() {
  try {
    const loadingOverlay = document.getElementById('loading-overlay');
    
    loadAssets(() => {
      if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
      }
      
      const bindClick = (id, handler) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', handler);
      };

      bindClick('btn-start', () => {
        startGame(0);
      });
      
      bindClick('btn-level-select', () => {
        showScreen('level-select-screen');
      });

      bindClick('btn-help', () => {
        showScreen('help-screen');
      });
      
      bindClick('btn-help-back', () => {
        showScreen('start-screen');
      });

      bindClick('btn-level-back', () => {
        showScreen('start-screen');
      });

      document.querySelectorAll('.level-card').forEach(card => {
        card.addEventListener('click', () => {
          if (card.classList.contains('locked')) return;
          const lvlIdx = parseInt(card.getAttribute('data-level'));
          startGame(lvlIdx);
        });
      });

      bindClick('hud-pause', pauseGame);
      bindClick('btn-resume', resumeGame);
      bindClick('btn-restart', () => {
        startGame(currentLevelIndex);
      });
      bindClick('btn-quit', () => {
        if (gameLoopId) cancelAnimationFrame(gameLoopId);
        gameState = 'START_SCREEN';
        audio.stopMusic();
        showScreen('start-screen');
      });

      const btnSound = document.getElementById('hud-sound');
      if (btnSound) {
        btnSound.addEventListener('click', () => {
          const isMuted = audio.toggleMute();
          btnSound.textContent = isMuted ? '🔇' : '🔊';
        });
      }

      bindClick('btn-retry', () => {
        startGame(currentLevelIndex);
      });
      bindClick('btn-go-menu', () => {
        gameState = 'START_SCREEN';
        audio.stopMusic();
        showScreen('start-screen');
      });

      bindClick('btn-next-level', () => {
        if (currentLevelIndex < LEVELS.length - 1) {
          startGame(currentLevelIndex + 1);
        }
      });
      bindClick('btn-vic-menu', () => {
        gameState = 'START_SCREEN';
        audio.stopMusic();
        showScreen('start-screen');
      });
    });
  } catch (initError) {
    console.error("Game initialization crashed safely:", initError);
  }
}

// Запуск инициализации с защитой от race-condition событий загрузки
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initGameApp();
} else {
  window.addEventListener('load', initGameApp);
}
