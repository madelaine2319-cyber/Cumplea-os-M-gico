/* =========================================================
   CARTA FINAL — texto real del proyecto
========================================================= */
const LETTER_PARAGRAPHS = [
  { text: 'Pastelito:', cls: 'letter-open' },
  { text: 'Con luces, con estrellas, con una torta y unas velitas que apagaste una por una. Y ahora que llegaste hasta aquí, quería dejarte algo que no pudiera apagarse con un soplido.' },
  { text: 'Hoy es tu cumpleaños, y aunque podría simplemente decirte “feliz cumpleaños” y desearte un día bonito, siento que contigo nunca me alcanza lo simple.' },
  { text: 'Porque hoy no solo celebro que cumplas un año más. Celebro que existas. Que estés aquí, con tu forma tan tuya de ser, con todo lo que te hace ser tú, incluso esas pequeñas cosas que quizás ni siquiera sabes que alguien puede llegar a querer tanto.' },
  { text: 'Me gusta pensar que antes de que yo pudiera conocerte, ya existía toda una vida llena de momentos que nunca vi. Días buenos, días difíciles, versiones de ti que no conocí. Y qué extraño y bonito es que, entre todos esos años, haya terminado coincidiendo contigo en este pedacito de la vida.' },
  { text: 'No sé si alguna vez te he dicho cuánto significa para mí poder quererte.' },
  { text: 'A veces el amor no se parece a las cosas que uno imagina. No siempre es perfecto, ni tranquilo, ni fácil de explicar. A veces es simplemente mirar a alguien y sentir que, de alguna manera, su existencia ya forma parte de la tuya.' },
  { text: 'Y eso me pasa contigo.' },
  { text: 'Por eso quise hacerte algo que fuera un poquito más que un saludo de cumpleaños. Algo que pudieras recorrer, tocar, mirar y finalmente llegar hasta aquí. Porque quería que, aunque fuera por unos minutos, sintieras lo especial que eres para mí.' },
  { text: 'Ojalá este nuevo año de tu vida te encuentre siendo cada vez más tú. Que tengas motivos para reírte hasta que te duela la cara, momentos que quieras recordar para siempre y días en los que puedas mirar alrededor y sentir que estás exactamente donde quieres estar.' },
  { text: 'Y si alguna vez dudas de cuánto puedes significar para alguien, quiero que recuerdes esto:' },
  { text: 'yo te miro y veo muchísimo más de lo que probablemente imaginas.' },
  { text: 'Te amo, Pastelito.', cls: 'letter-close' },
  { text: 'Y qué bonito que existas.', cls: 'letter-close' }
];

const NUM_CANDLES = 5;

/* =========================================================
   UTILIDADES
========================================================= */
const $ = (sel) => document.querySelector(sel);
const rand = (min, max) => Math.random() * (max - min) + min;

/* =========================================================
   SISTEMA DE PARTÍCULAS (canvas de fondo)
========================================================= */
const canvas = $('#bg-canvas');
const ctx = canvas.getContext('2d');
let W, H, DPR;

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize);
resize();

let stars = [];
let floaters = [];
let bursts = [];

function initStars() {
  stars = [];
  const count = Math.floor((W * H) / 7500);
  for (let i = 0; i < count; i++) {
    const sizeClass = Math.random();
    stars.push({
      x: rand(0, W),
      y: rand(0, H * 0.9),
      r: sizeClass < 0.7 ? rand(0.4, 1.1) : sizeClass < 0.92 ? rand(1.1, 1.8) : rand(1.8, 2.6),
      baseAlpha: rand(0.25, 0.95),
      phase: rand(0, Math.PI * 2),
      speed: rand(0.5, 1.7),
      twinkle: Math.random() < 0.4
    });
  }
  floaters = [];
  const fcount = Math.floor((W * H) / 58000);
  for (let i = 0; i < fcount; i++) floaters.push(makeFloater());
}
function makeFloater() {
  return {
    x: rand(0, W),
    y: rand(H * 0.2, H),
    r: rand(1, 2.6),
    vy: -rand(4, 11) / 60,
    vx: rand(-3, 3) / 60,
    alpha: rand(0.12, 0.5),
    hue: Math.random() < 0.5 ? '243,218,158' : '236,224,194'
  };
}

function addSparkBurst(x, y, opts = {}) {
  const n = opts.count || 14;
  const colors = opts.colors || ['255,177,92', '243,218,158', '236,224,194'];
  for (let i = 0; i < n; i++) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(opts.minSpeed || 0.8, opts.maxSpeed || 2.6);
    bursts.push({
      type: 'spark',
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (opts.lift || 0.4),
      life: 0,
      maxLife: rand(40, 75),
      r: rand(1, 2.6),
      color: colors[Math.floor(Math.random() * colors.length)],
      gravity: opts.gravity ?? 0.02
    });
  }
}

function addConfettiBurst(x, y, count = 26) {
  const colors = ['201,162,75', '243,218,158', '242,232,210', '28,68,51'];
  for (let i = 0; i < count; i++) {
    const angle = rand(-Math.PI, 0);
    const speed = rand(2, 5.5);
    bursts.push({
      type: 'confetti',
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      life: 0,
      maxLife: rand(90, 150),
      size: rand(3, 6),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.2, 0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      gravity: 0.055
    });
  }
}

function drawStars(t) {
  for (const s of stars) {
    let a = s.baseAlpha;
    if (s.twinkle) a = s.baseAlpha * (0.45 + 0.55 * Math.sin((t / 900) * s.speed + s.phase));
    ctx.beginPath();
    ctx.fillStyle = `rgba(242,232,210,${a.toFixed(3)})`;
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    if (s.r > 1.6) {
      ctx.beginPath();
      ctx.fillStyle = `rgba(242,232,210,${(a * 0.25).toFixed(3)})`;
      ctx.arc(s.x, s.y, s.r * 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawFloaters() {
  for (const f of floaters) {
    f.x += f.vx;
    f.y += f.vy;
    if (f.y < -10) Object.assign(f, makeFloater(), { y: H + 10 });
    if (f.x < -10) f.x = W + 10;
    if (f.x > W + 10) f.x = -10;
    ctx.beginPath();
    ctx.fillStyle = `rgba(${f.hue},${f.alpha})`;
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBursts() {
  bursts = bursts.filter((p) => p.life < p.maxLife);
  for (const p of bursts) {
    p.life++;
    p.vy += p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    const progress = p.life / p.maxLife;
    const alpha = 1 - progress;

    if (p.type === 'spark') {
      ctx.beginPath();
      ctx.fillStyle = `rgba(${p.color},${alpha.toFixed(3)})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'confetti') {
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = `rgba(${p.color},${alpha.toFixed(3)})`;
      ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
      ctx.restore();
    }
  }
}

let celebrateTimer = null;
let sparkleInterval = null;

function loop(t) {
  ctx.clearRect(0, 0, W, H);
  drawStars(t);
  drawFloaters();
  drawBursts();
  requestAnimationFrame(loop);
}
initStars();
requestAnimationFrame(loop);

function startCelebration() {
  let done = 0;
  const total = 9;
  const fire = () => {
    addConfettiBurst(rand(W * 0.15, W * 0.85), rand(H * 0.15, H * 0.4), 30);
    addSparkBurst(rand(W * 0.15, W * 0.85), rand(H * 0.15, H * 0.5), {
      count: 20, minSpeed: 1, maxSpeed: 3, gravity: 0.01
    });
    done++;
    if (done < total) celebrateTimer = setTimeout(fire, 380);
  };
  fire();
}

/* =========================================================
   CONTROL DE ESCENAS
========================================================= */
const scenes = {
  intro: $('#scene-intro'),
  book: $('#scene-book'),
  night: $('#scene-night'),
  letter: $('#scene-letter')
};

function goTo(name) {
  Object.values(scenes).forEach((s) => s.classList.remove('active'));
  scenes[name].classList.add('active');
}

/* --- Escena 1: intro --- */
const line1 = $('.line-1');
const line2 = $('.line-2');
const btnStart = $('#btn-comenzar');

function playIntro() {
  goTo('intro');
  setTimeout(() => line1.classList.add('show'), 500);
  setTimeout(() => line2.classList.add('show'), 2700);
  setTimeout(() => btnStart.classList.add('show'), 4800);
}

btnStart.addEventListener('click', () => {
  goTo('book');
  playBook();
});

/* --- Escena 2: libro --- */
const book = $('#book');
const bookCover = $('#book-cover');
const storyText = $('#story-text');
const storyParas = Array.from(storyText.querySelectorAll('p'));
let bookSparkleInterval = null;

function playBook() {
  // abre la portada
  setTimeout(() => {
    book.classList.add('opened');
    bookCover.classList.add('opened');
  }, 500);

  // destellos suaves alrededor del libro mientras está abierto
  bookSparkleInterval = setInterval(() => {
    const rect = book.getBoundingClientRect();
    addSparkBurst(rect.left + rand(0, rect.width), rect.top + rand(0, rect.height), {
      count: 5, minSpeed: 0.3, maxSpeed: 0.9, lift: 0.5, gravity: -0.004
    });
  }, 900);

  // aparece el texto de la historia, línea por línea
  setTimeout(() => {
    storyText.classList.add('show');
    storyParas.forEach((p, i) => {
      setTimeout(() => p.classList.add('show'), i * 750);
    });
  }, 2700);

  // el texto se desvanece
  setTimeout(() => {
    storyText.classList.remove('show');
  }, 8600);

  // transición a la escena nocturna
  setTimeout(() => {
    clearInterval(bookSparkleInterval);
    goTo('night');
    playNightEntrance();
  }, 9900);
}

/* --- Escena 3: noche / personaje / pastel --- */
const character = $('#character');
const sceneMessage = $('#scene-message');
const hintText = $('#hint-text');
const cakeWrap = $('#cake-wrap');
const candlesEl = $('#candles');
const btnContinue = $('#btn-continue');
const sceneNight = $('#scene-night');
const sparkleAnchor = $('#char-sparkle-anchor');

let candlesLeft = NUM_CANDLES;

function buildCandles() {
  candlesEl.innerHTML = '';
  candlesLeft = NUM_CANDLES;
  for (let i = 0; i < NUM_CANDLES; i++) {
    const c = document.createElement('div');
    c.className = 'candle';
    c.innerHTML = `
      <div class="flame-wrap">
        <div class="flame-glow"></div>
        <div class="flame"></div>
      </div>
      <div class="candle-stick"></div>
    `;
    c.addEventListener('click', () => extinguish(c));
    candlesEl.appendChild(c);
  }
}

function extinguish(candleEl) {
  if (candleEl.classList.contains('out')) return;
  candleEl.classList.add('out');
  candlesLeft--;

  const rect = candleEl.querySelector('.flame').getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top;

  spawnSmoke(x, y);
  addSparkBurst(x, y, { count: 10, minSpeed: 0.5, maxSpeed: 1.6, lift: 0.5, gravity: 0.01 });

  if (candlesLeft <= 0) {
    hintText.classList.remove('show');
    setTimeout(() => {
      startCelebration();
      setTimeout(() => {
        btnContinue.classList.add('show');
      }, 2400);
    }, 500);
  }
}

function spawnSmoke(x, y) {
  for (let i = 0; i < 3; i++) {
    const s = document.createElement('div');
    s.className = 'smoke';
    s.style.left = x + 'px';
    s.style.top = (y - i * 4) + 'px';
    s.style.setProperty('--sx', rand(-14, 14) + 'px');
    s.style.animationDelay = (i * 0.08) + 's';
    document.body.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  }
}

function playNightEntrance() {
  character.classList.remove('walk-in', 'settled');
  character.style.left = '-40vw';
  character.style.opacity = '0';
  sceneMessage.classList.remove('show');
  btnContinue.classList.remove('show');
  hintText.classList.remove('show');
  cakeWrap.classList.remove('show');
  buildCandles();

  requestAnimationFrame(() => {
    character.classList.add('walk-in');
  });

  // destellos suaves alrededor del personaje mientras camina
  sparkleInterval = setInterval(() => {
    const rect = character.getBoundingClientRect();
    addSparkBurst(rect.left + rect.width * rand(0.2, 0.8), rect.top + rect.height * rand(0.3, 0.7), {
      count: 3, minSpeed: 0.2, maxSpeed: 0.6, lift: 0.3, gravity: -0.006
    });
  }, 260);

  // llega al centro y se hace a un lado con delicadeza
  setTimeout(() => {
    character.classList.remove('walk-in');
    character.classList.add('settled');
    clearInterval(sparkleInterval);
  }, 2900);

  // mensaje y torta aparecen juntos
  setTimeout(() => {
    sceneMessage.classList.add('show');
    cakeWrap.classList.add('show');
    hintText.classList.add('show');
  }, 3500);
}

/* --- continuar a la carta --- */
btnContinue.addEventListener('click', () => {
  if (celebrateTimer) clearTimeout(celebrateTimer);
  goTo('letter');
});

/* --- Escena 4: carta --- */
const cardWrap = $('#card-wrap');
const letterPage = $('#letter-page');
const letterBody = $('#letter-body');

letterBody.innerHTML = LETTER_PARAGRAPHS
  .map((p) => `<p class="${p.cls || ''}">${p.text}</p>`)
  .join('');

$('#btn-abrir-carta').addEventListener('click', () => {
  cardWrap.classList.add('hide');
  setTimeout(() => letterPage.classList.add('show'), 300);
});

/* =========================================================
   INICIO
========================================================= */
playIntro();
