/* ================== עיר האנרגיה — לוגיקת המשחק ================== */
"use strict";

/* ---------- נתוני מבנים ---------- */
const TILES = {
  house:   { name: "שכונת בתים",        cat: "מגורים",  icon: "s-house",   cost: 100, fx: { sat: 2, eco: 1, eng: -1 } },
  apts:    { name: "בנייני מגורים",      cat: "מגורים",  icon: "s-apts",    cost: 150, fx: { sat: 1, eco: 2, pol: 1, eng: -2 } },
  office:  { name: "מגדל משרדים",        cat: "תעסוקה",  icon: "s-office",  cost: 180, fx: { eco: 3, eng: -2 } },
  factory: { name: "מפעל",               cat: "תעסוקה",  icon: "s-factory", cost: 200, fx: { sat: -1, eco: 4, pol: 2, eng: -2 } },
  mall:    { name: "מרכז מסחרי",         cat: "תעסוקה",  icon: "s-mall",    cost: 160, fx: { sat: 1, eco: 2, pol: 1, eng: -2 } },
  park:    { name: "פארק",               cat: "פנאי",    icon: "s-park",    cost: 60,  fx: { sat: 2, pol: -2 } },
  sport:   { name: "מגרש ספורט",         cat: "פנאי",    icon: "s-sport",   cost: 100, fx: { sat: 3, eng: -1 } },
  coal:    { name: "תחנת כוח פחמית",     cat: "אנרגיה",  icon: "s-coal",    cost: 120, fx: { eco: 1, pol: 3, eng: 5 } },
  gas:     { name: "תחנת כוח בגז",       cat: "אנרגיה",  icon: "s-gas",     cost: 180, fx: { eco: 1, pol: 2, eng: 4 } },
  solar:   { name: "שדה סולארי",         cat: "אנרגיה",  icon: "s-solar",   cost: 220, unlock: 5,  fx: { eng: 2 } },
  wind:    { name: "טורבינות רוח",       cat: "אנרגיה",  icon: "s-wind",    cost: 280, unlock: 10, fx: { eng: 3 } },
  nuclear: { name: "תחנת כוח גרעינית",   cat: "אנרגיה",  icon: "s-nuclear", cost: 550, unlock: 20, fx: { sat: -1, eco: 1, eng: 7 } },
};
const CATS = ["מגורים", "תעסוקה", "פנאי", "אנרגיה"];
const GREEN = ["solar", "wind", "nuclear"];

/* ---------- החלטות שנתיות ---------- */
const DECISIONS = [
  { title: "איסור חניה במרכז העיר", desc: "הצעה להפוך את מרכז העיר לאזור ללא מכוניות. פחות זיהום — אבל הנהגים יכעסו.",
    opts: [{ label: "לאשר", fx: { sat: -4, pol: -6 } }, { label: "לדחות", fx: {} }] },
  { title: "מס על שקיות פלסטיק", desc: "מס קטן על שקיות חד־פעמיות יכניס כסף לקופת העיר ויפחית זיהום.",
    opts: [{ label: "להטיל את המס", money: 40, fx: { sat: -3, pol: -3 } }, { label: "לוותר", fx: {} }] },
  { title: "סבסוד בידוד לבתים", desc: "העירייה תסבסד בידוד קירות וחלונות — הבתים יבזבזו פחות חשמל.",
    opts: [{ label: "לסבסד", money: -60, fx: { eng: 6, sat: 2 } }, { label: "אין תקציב", fx: {} }] },
  { title: "פסטיבל קיץ עירוני", desc: "שלושה ימים של הופעות ודוכנים בפארק המרכזי. התושבים ישמחו, אבל זה עולה כסף ומלכלך.",
    opts: [{ label: "לקיים!", money: -50, fx: { sat: 8, pol: 2 } }, { label: "לוותר השנה", fx: { sat: -1 } }] },
  { title: "יום ללא רכב", desc: "פעם בשבוע כל העיר הולכת ברגל או רוכבת על אופניים.",
    opts: [{ label: "להכריז", fx: { pol: -6, sat: -2, eco: -2 } }, { label: "לא מתאים לנו", fx: {} }] },
  { title: "תאורת רחוב חסכונית (LED)", desc: "החלפת כל פנסי הרחוב בנורות לד יקרה עכשיו — אך חוסכת המון אנרגיה.",
    opts: [{ label: "להחליף", money: -40, fx: { eng: 5 } }, { label: "להשאיר", fx: {} }] },
  { title: "מס תעשייה ירוק", desc: "מס חדש על מפעלים מזהמים יכניס כסף — אבל יפגע בעסקים.",
    opts: [{ label: "להטיל", money: 60, fx: { eco: -4, pol: -2 } }, { label: "לוותר", fx: {} }] },
  { title: "שתילת עצים ברחובות", desc: "אלף עצים חדשים לאורך הכבישים — צל, אוויר נקי ויופי.",
    opts: [{ label: "לשתול", money: -30, fx: { pol: -5, sat: 3 } }, { label: "לא עכשיו", fx: {} }] },
  { title: "הנחה בארנונה", desc: "התושבים מבקשים הנחה במסים. זה ישמח אותם אבל יעלה לקופת העיר.",
    opts: [{ label: "לתת הנחה", money: -50, fx: { sat: 6 } }, { label: "לסרב", fx: { sat: -2 } }] },
  { title: "חברת היי־טק רוצה להגיע", desc: "חברת טכנולוגיה גדולה מציעה לפתוח סניף בעיר. עבודה לכולם — אבל צריכת החשמל תזנק.",
    opts: [{ label: "לקבל בברכה", fx: { eco: 8, eng: -5, pol: 1 } }, { label: "לסרב", fx: {} }] },
  { title: "תוכנית חינוך לחיסכון באנרגיה", desc: "שיעורים בבתי הספר על חיסכון בחשמל. ילדים חכמים = עיר חסכונית.",
    opts: [{ label: "להפעיל", money: -30, fx: { eng: 4, sat: 1 } }, { label: "לוותר", fx: {} }] },
  { title: "קו אוטובוס חשמלי חדש", desc: "אוטובוסים חשמליים שיחליפו חלק מהנסיעות ברכב פרטי.",
    opts: [{ label: "להשיק", money: -45, fx: { pol: -4, sat: 4 } }, { label: "יקר מדי", fx: {} }] },
  { title: "מפעל מיחזור אזורי", desc: "הקמת מרכז מיחזור שיטפל בפסולת של כל האזור — וגם ירוויח ממנה.",
    opts: [{ label: "להקים", money: -60, fx: { pol: -7, eco: 3 } }, { label: "לדחות", fx: {} }] },
  { title: "לונה פארק נודד", desc: "לונה פארק מבקש לחנות בעיר לחודש תמורת דמי שכירות.",
    opts: [{ label: "לארח", money: 30, fx: { sat: 4, pol: 1 } }, { label: "לסרב", fx: { sat: -1 } }] },
  { title: "השבתת המזרקה בכיכר", desc: "המזרקה הגדולה צורכת הרבה חשמל ומים. אפשר לכבות אותה.",
    opts: [{ label: "לכבות", fx: { eng: 3, sat: -3 } }, { label: "להשאיר דולקת", fx: {} }] },
];

/* ---------- קבועים ---------- */
const TW = 150, TH = 75, TILE_DIV_H = 180;
const YEARS_TOTAL = 30;
const GRANT = 250;

const METER_META = {
  sat: { emoji: v => (v >= 0 ? "😊" : "😠"), label: "שביעות רצון" },
  eco: { emoji: () => "📈", label: "כלכלה" },
  pol: { emoji: v => (v >= 0 ? "☁️" : "🌿"), label: "זיהום" },
  eng: { emoji: () => "⚡", label: "אנרגיה" },
};

/* ---------- מצב ---------- */
const S = {
  size: 3,
  grid: [],          // מפתח מבנה או null לכל משבצת
  meters: { sat: 50, eco: 50, pol: 30, eng: 50 },
  money: 0,
  year: 0,
  phase: "start",    // start | build | idle | sim | end
  tool: null,        // מפתח מבנה, "bulldoze" או null
  decisionPool: [],
  busy: false,
};

/* ---------- עזרים ---------- */
const $ = sel => document.querySelector(sel);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function fxParts(fx, money) {
  const parts = [];
  if (money) parts.push({ txt: `${money > 0 ? "+" : ""}${money} 💰`, good: money > 0 });
  for (const [k, v] of Object.entries(fx || {})) {
    if (!v) continue;
    const good = k === "pol" ? v < 0 : v > 0;
    parts.push({ txt: `${v > 0 ? "+" : ""}${v} ${METER_META[k].emoji(v)}`, good });
  }
  return parts;
}
const fxHtml = (fx, money) =>
  fxParts(fx, money).map(p => `<b class="${p.good ? "plus" : "minus"}">${p.txt}</b>`).join(" ") || "ללא השפעה";

function toast(msg, cls = "") {
  const el = document.createElement("div");
  el.className = "toast " + cls;
  el.textContent = msg;
  $("#toasts").appendChild(el);
  setTimeout(() => el.remove(), 3400);
}

/* ---------- לוח ---------- */
function tileGroundSVG() {
  return `<svg class="ground" viewBox="0 0 100 62">
    <polygon class="g-left"  points="0,25 50,50 50,62 0,37" fill="#a9814f"/>
    <polygon class="g-right" points="50,50 100,25 100,37 50,62" fill="#8a6a3e"/>
    <polygon class="g-top"   points="50,1 99,25 50,49 1,25" fill="#9ed46f" stroke="#7bb84e" stroke-width="1.5"/>
  </svg>`;
}

function buildBoard() {
  const n = S.size;
  const board = $("#board");
  board.innerHTML = "";
  S.grid = Array(n * n).fill(null);

  const boardW = n * TW;
  const boardH = (n - 1) * TH + TILE_DIV_H;
  board.style.width = boardW + "px";
  board.style.height = boardH + "px";

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const i = y * n + x;
      const el = document.createElement("div");
      el.className = "tile";
      el.dataset.i = i;
      el.style.left = ((x - y + (n - 1)) * TW / 2) + "px";
      el.style.top = ((x + y) * TH / 2) + "px";
      el.style.zIndex = x + y;
      el.innerHTML = tileGroundSVG();
      el.addEventListener("click", () => onTileClick(i));
      board.appendChild(el);
    }
  }
  fitBoard();
}

function fitBoard() {
  const wrap = $("#board-wrap"), board = $("#board");
  if (!board.style.width) return;
  const bw = parseFloat(board.style.width), bh = parseFloat(board.style.height);
  const scale = Math.min((wrap.clientWidth - 40) / bw, (wrap.clientHeight - 40) / bh, 1.25);
  board.style.transform = `scale(${scale})`;
}
window.addEventListener("resize", fitBoard);

function tileEl(i) { return $("#board").children[i]; }

function renderTile(i) {
  const el = tileEl(i);
  const key = S.grid[i];
  el.querySelector("svg.bld")?.remove();
  el.title = "";
  el.classList.remove("pop");
  if (key) {
    const t = TILES[key];
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "bld");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.innerHTML = `<use href="#${t.icon}"/>`;
    el.appendChild(svg);
    el.title = `${t.name} — בכל שנה: ` + fxParts(t.fx).map(p => p.txt).join("  ");
  }
  updateTileCursors();
}

function updateTileCursors() {
  const build = S.phase === "build";
  document.querySelectorAll(".tile").forEach((el, i) => {
    el.classList.toggle("placeable", build && S.tool && S.tool !== "bulldoze" && !S.grid[i]);
    el.classList.toggle("demolish", build && S.tool === "bulldoze" && !!S.grid[i]);
  });
}

function onTileClick(i) {
  if (S.phase !== "build" || !S.tool) return;
  if (S.tool === "bulldoze") {
    const key = S.grid[i];
    if (!key) return;
    const refund = Math.floor(TILES[key].cost / 2);
    S.grid[i] = null;
    S.money += refund;
    renderTile(i);
    toast(`🚜 נהרס — קיבלתם החזר של ${refund} 💰`);
  } else {
    if (S.grid[i]) return;
    const t = TILES[S.tool];
    if (t.cost > S.money) { toast("אין מספיק כסף! 💰"); return; }
    S.money -= t.cost;
    S.grid[i] = S.tool;
    renderTile(i);
    tileEl(i).classList.add("pop");
  }
  updateWallet();
  renderShop();
}

/* ---------- חנות ---------- */
function renderShop() {
  const box = $("#shop-items");
  box.innerHTML = "";
  for (const cat of CATS) {
    const h = document.createElement("div");
    h.className = "shop-cat";
    h.textContent = cat;
    box.appendChild(h);
    for (const [key, t] of Object.entries(TILES)) {
      if (t.cat !== cat) continue;
      const locked = t.unlock && S.year < t.unlock;
      const poor = !locked && t.cost > S.money;
      const el = document.createElement("div");
      el.className = "shop-item" + (locked ? " locked" : "") + (poor ? " poor" : "") + (S.tool === key ? " selected" : "");
      el.innerHTML = `
        <svg viewBox="0 0 100 100"><use href="#${t.icon}"/></svg>
        <div class="si-info">
          <div class="si-name">${t.name}</div>
          <div class="si-cost">עלות: ${t.cost} 💰</div>
          <div class="si-fx">${fxHtml(t.fx)}</div>
        </div>
        ${locked ? `<span class="si-lock">🔒 שנה ${t.unlock}</span>` : ""}`;
      if (!locked && !poor) el.addEventListener("click", () => { S.tool = S.tool === key ? null : key; renderShop(); updateTileCursors(); });
      box.appendChild(el);
    }
  }
  $("#btn-bulldoze").classList.toggle("selected", S.tool === "bulldoze");
}

function enterBuild(first) {
  S.phase = "build";
  S.tool = null;
  $("#shop").classList.remove("hidden");
  $("#shop-title").textContent = first ? "🔨 בניית העיר" : `🔨 שנת שיפוצים! (שנה ${S.year})`;
  $("#btn-next-year").classList.add("hidden");
  renderShop();
  updateTileCursors();
  fitBoard();
}

function exitBuild() {
  S.phase = "idle";
  S.tool = null;
  $("#shop").classList.add("hidden");
  updateTileCursors();
  fitBoard();
  if (S.year < YEARS_TOTAL) $("#btn-next-year").classList.remove("hidden");
}

/* ---------- מדדים ----------- */
function updateWallet() {
  $("#money-val").textContent = S.money;
}

function updateMeters(pulseKeys = []) {
  for (const key of Object.keys(S.meters)) {
    const v = Math.round(S.meters[key]);
    const m = $("#m-" + key);
    m.querySelector(".m-val").textContent = v;
    const fill = m.querySelector(".m-fill");
    fill.style.width = v + "%";
    const danger = key === "pol" ? v >= 75 : v <= 25;
    const warn = key === "pol" ? v >= 55 : v <= 45;
    fill.classList.toggle("danger", danger);
    fill.classList.toggle("warn", !danger && warn);
    if (pulseKeys.includes(key)) {
      m.classList.remove("pulse");
      void m.offsetWidth;
      m.classList.add("pulse");
    }
  }
}

function applyFx(fx, money = 0) {
  for (const [k, v] of Object.entries(fx || {})) S.meters[k] = clamp(S.meters[k] + v, 0, 100);
  if (money) S.money = Math.max(0, S.money + money);
  updateMeters(Object.keys(fx || {}));
  updateWallet();
}

function crashReason() {
  if (S.meters.sat <= 0) return "😠 התושבים התייאשו ועזבו את העיר...";
  if (S.meters.eco <= 0) return "💸 קופת העיר התרוקנה והעיר פשטה רגל...";
  if (S.meters.eng <= 0) return "🔌 הפסקת חשמל כללית! העיר שקעה בחושך...";
  if (S.meters.pol >= 100) return "🏭 הזיהום הפך את העיר לבלתי ראויה למגורים...";
  return null;
}

/* ---------- אייקונים מרחפים ---------- */
function flyIcon(fromEl, key, val) {
  const meterEl = $("#m-" + key);
  const a = fromEl.getBoundingClientRect();
  const b = meterEl.getBoundingClientRect();
  const startX = a.left + a.width / 2, startY = a.top + a.height * 0.35;
  const el = document.createElement("div");
  el.className = "fly";
  const good = key === "pol" ? val < 0 : val > 0;
  el.innerHTML = `${METER_META[key].emoji(val)}<small class="${good ? "plus" : "minus"}">${val > 0 ? "+" : ""}${val}</small>`;
  el.style.left = startX + "px";
  el.style.top = startY + "px";
  document.body.appendChild(el);
  void el.offsetWidth;
  const dx = (b.left + b.width / 2) - startX;
  const dy = (b.top + b.height / 2) - startY;
  el.style.transform = `translate(${dx}px, ${dy}px) scale(.55)`;
  el.style.opacity = "0.15";
  setTimeout(() => {
    el.remove();
    meterEl.classList.remove("pulse");
    void meterEl.offsetWidth;
    meterEl.classList.add("pulse");
  }, 1080);
}

/* ---------- ציר שנים ---------- */
function buildTimeline() {
  const track = $("#tl-track");
  track.innerHTML = "";
  for (let y = 1; y <= YEARS_TOTAL; y++) {
    const d = document.createElement("div");
    d.className = "tl-dot" + (y % 5 === 0 ? " build5" : "");
    track.appendChild(d);
  }
  updateTimeline();
}

function updateTimeline() {
  [...$("#tl-track").children].forEach((d, idx) => {
    d.classList.toggle("done", idx < S.year);
    d.classList.toggle("current", idx === S.year);
  });
  $("#year-val").textContent = S.year;
}

/* ---------- החלטה שנתית ---------- */
function nextDecision() {
  if (!S.decisionPool.length) S.decisionPool = shuffle([...DECISIONS.keys()]);
  return DECISIONS[S.decisionPool.pop()];
}

function showDecision(dec) {
  return new Promise(resolve => {
    $("#dec-year").textContent = S.year + 1;
    $("#dec-title").textContent = dec.title;
    $("#dec-desc").textContent = dec.desc;
    const box = $("#dec-options");
    box.innerHTML = "";
    dec.opts.forEach(opt => {
      const b = document.createElement("button");
      b.className = "dec-opt";
      b.innerHTML = `<div class="do-title">${opt.label}</div><div class="do-fx">${fxHtml(opt.fx, opt.money)}</div>`;
      b.addEventListener("click", () => {
        $("#overlay").classList.add("hidden");
        $("#modal-decision").classList.add("hidden");
        resolve(opt);
      });
      box.appendChild(b);
    });
    $("#overlay").classList.remove("hidden");
    $("#modal-decision").classList.remove("hidden");
  });
}

/* ---------- מהלך שנה ---------- */
async function nextYear() {
  if (S.busy) return;
  S.busy = true;
  $("#btn-next-year").classList.add("hidden");

  // החלטת מועצה
  const opt = await showDecision(nextDecision());
  if (Object.keys(opt.fx || {}).length || opt.money) {
    applyFx(opt.fx, opt.money || 0);
    await sleep(500);
  }

  // קידום שנה
  S.year++;
  updateTimeline();
  S.phase = "sim";

  // השפעות המבנים — אייקונים מרחפים
  const totals = { sat: 0, eco: 0, pol: 0, eng: 0 };
  const built = S.grid.map((k, i) => k ? i : -1).filter(i => i >= 0);
  for (const i of built) {
    const t = TILES[S.grid[i]];
    for (const [k, v] of Object.entries(t.fx)) {
      if (!v) continue;
      totals[k] += v;
      flyIcon(tileEl(i), k, v);
    }
    await sleep(170);
  }
  await sleep(1000);

  // עדכון מדדים
  for (const [k, v] of Object.entries(totals)) S.meters[k] = clamp(S.meters[k] + v, 0, 100);
  updateMeters(Object.keys(totals));

  // הכנסה שנתית
  const income = 25 + Math.floor(S.meters.eco / 4);
  S.money += income;
  updateWallet();
  toast(`📅 שנה ${S.year}: הכנסה שנתית +${income} 💰`);

  // קריסה?
  const reason = crashReason();
  if (reason) { await sleep(900); return endGame(false, reason); }

  // סוף המשחק?
  if (S.year >= YEARS_TOTAL) { await sleep(900); return endGame(true); }

  // שנת בנייה (כל 5 שנים)
  if (S.year % 5 === 0) {
    S.money += GRANT;
    updateWallet();
    await sleep(400);
    toast(`🏛️ מענק ממשלתי: +${GRANT} 💰`, "unlock");
    for (const [key, t] of Object.entries(TILES)) {
      if (t.unlock === S.year) toast(`🔓 נפתח מבנה חדש: ${t.name}!`, "unlock");
    }
    S.busy = false;
    enterBuild(false);
    return;
  }

  S.phase = "idle";
  S.busy = false;
  $("#btn-next-year").classList.remove("hidden");
}

/* ---------- סוף משחק ---------- */
function endGame(won, reason) {
  S.phase = "end";
  const green = S.grid.filter(k => GREEN.includes(k)).length;
  const score = Math.round(
    S.meters.sat + S.meters.eco + S.meters.eng + (100 - S.meters.pol) +
    Math.floor(S.money / 10) + green * 15
  );
  const stars = !won ? "💔" : score >= 380 ? "⭐⭐⭐" : score >= 290 ? "⭐⭐" : "⭐";

  $("#end-title").textContent = won ? "🎉 כל הכבוד! העיר שרדה 30 שנה!" : "💥 העיר קרסה!";
  $("#end-desc").textContent = won
    ? "ניהלתם את עיר האנרגיה בחוכמה לאורך שלושה עשורים."
    : `${reason} (שנה ${S.year})`;

  $("#end-stats").innerHTML = `
    <div class="end-stat">😊 שביעות רצון<div class="es-val">${Math.round(S.meters.sat)}</div></div>
    <div class="end-stat">💰 כלכלה<div class="es-val">${Math.round(S.meters.eco)}</div></div>
    <div class="end-stat">🏭 זיהום<div class="es-val">${Math.round(S.meters.pol)}</div></div>
    <div class="end-stat">⚡ אנרגיה<div class="es-val">${Math.round(S.meters.eng)}</div></div>
    <div class="end-stat">💰 קופת העיר<div class="es-val">${S.money}</div></div>
    <div class="end-stat">🌱 מבני אנרגיה נקייה<div class="es-val">${green}</div></div>`;

  $("#end-score").innerHTML = `ניקוד סופי: ${score}<span class="stars">${stars}</span>`;

  $("#overlay").classList.remove("hidden");
  $("#modal-end").classList.remove("hidden");
}

/* ---------- אתחול ---------- */
function startGame(size) {
  S.size = size;
  S.money = size === 3 ? 600 : 800;
  S.meters = { sat: 50, eco: 50, pol: 30, eng: 50 };
  S.year = 0;
  S.decisionPool = shuffle([...DECISIONS.keys()]);
  buildBoard();
  buildTimeline();
  updateMeters();
  updateWallet();
  $("#overlay").classList.add("hidden");
  $("#modal-start").classList.add("hidden");
  toast("🔨 בנו את העיר הראשונה שלכם, ואז לחצו על ✅ סיום בנייה");
  enterBuild(true);
}

document.querySelectorAll(".size-btns button").forEach(b =>
  b.addEventListener("click", () => startGame(+b.dataset.size)));

$("#btn-done-build").addEventListener("click", () => {
  if (!S.grid.some(Boolean)) { toast("בנו לפחות מבנה אחד! 🔨"); return; }
  if (!S.grid.some(k => TILES[k]?.fx.eng > 0)) { toast("⚡ אין לעיר מקור אנרגיה! בנו תחנת כוח"); return; }
  exitBuild();
});

$("#btn-bulldoze").addEventListener("click", () => {
  S.tool = S.tool === "bulldoze" ? null : "bulldoze";
  renderShop();
  updateTileCursors();
});

$("#btn-next-year").addEventListener("click", nextYear);
$("#btn-restart").addEventListener("click", () => location.reload());

// מסך פתיחה
$("#overlay").classList.remove("hidden");
