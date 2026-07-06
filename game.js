/* ================== עיר האנרגיה — לוגיקת המשחק ================== */
"use strict";

/* ---------- נתוני מבנים ---------- */
const TILES = {
  house:    { name: "שכונת בתים",        cat: "מגורים",  icon: "s-house",    cost: 100, homes: 40,  fx: { sat: 1, eco: 1, eng: -1 } },
  apts:     { name: "בנייני מגורים",      cat: "מגורים",  icon: "s-apts",     cost: 150, homes: 120, fx: { eco: 1, env: -1, eng: -2 } },
  luxury:   { name: "מגדלי יוקרה",        cat: "מגורים",  icon: "s-luxury",   cost: 320, unlock: 10, homes: 80, fx: { sat: 2, eco: 2, eng: -3 } },
  office:   { name: "מגדל משרדים",        cat: "תעסוקה",  icon: "s-office",   cost: 180, jobs: 80,  fx: { eco: 2, eng: -2 } },
  factory:  { name: "מפעל",               cat: "תעסוקה",  icon: "s-factory",  cost: 200, jobs: 100, fx: { sat: -1, eco: 3, env: -2, eng: -2 } },
  mall:     { name: "מרכז מסחרי",         cat: "תעסוקה",  icon: "s-mall",     cost: 160, jobs: 60,  fx: { sat: 1, eco: 1, env: -1, eng: -2 } },
  hospital: { name: "בית חולים",          cat: "תעסוקה",  icon: "s-hospital", cost: 260, jobs: 80,  fx: { sat: 2, eng: -2 } },
  port:     { name: "נמל",                cat: "תעסוקה",  icon: "s-port",     cost: 340, unlock: 10, jobs: 120, fx: { eco: 4, env: -2, eng: -2 } },
  hitech:   { name: "קריית היי־טק",       cat: "תעסוקה",  icon: "s-hitech",   cost: 380, unlock: 15, jobs: 150, fx: { eco: 5, eng: -4 } },
  airport:  { name: "שדה תעופה",          cat: "תעסוקה",  icon: "s-airport",  cost: 420, unlock: 15, jobs: 150, fx: { eco: 4, env: -3, eng: -3 } },
  park:     { name: "פארק",               cat: "פנאי",    icon: "s-park",     cost: 60,  fx: { sat: 1, env: 2 } },
  forest:   { name: "חורשה",              cat: "פנאי",    icon: "s-forest",   cost: 80,  fx: { env: 3 } },
  sport:    { name: "מגרש ספורט",         cat: "פנאי",    icon: "s-sport",    cost: 100, jobs: 10, fx: { sat: 2, env: 1 } },
  lake:     { name: "אגם",                cat: "פנאי",    icon: "s-lake",     cost: 150, fx: { sat: 1, env: 2 } },
  luna:     { name: "לונה פארק",          cat: "פנאי",    icon: "s-luna",     cost: 280, unlock: 10, jobs: 30, fx: { sat: 4, env: -1, eng: -2 } },
  coal:     { name: "תחנת כוח פחמית",     cat: "אנרגיה",  icon: "s-coal",     cost: 120, jobs: 30, fx: { eco: 1, env: -3, eng: 6 } },
  gas:      { name: "תחנת כוח בגז",       cat: "אנרגיה",  icon: "s-gas",      cost: 200, jobs: 25, fx: { eco: 1, env: -1, eng: 5 } },
  solar:    { name: "שדה סולארי",         cat: "אנרגיה",  icon: "s-solar",    cost: 220, unlock: 5,  jobs: 10, fx: { eng: 2 } },
  wind:     { name: "טורבינות רוח",       cat: "אנרגיה",  icon: "s-wind",     cost: 280, unlock: 10, jobs: 10, fx: { eng: 3 } },
  nuclear:  { name: "תחנת כוח גרעינית",   cat: "אנרגיה",  icon: "s-nuclear",  cost: 550, unlock: 20, jobs: 40, fx: { sat: -1, eco: 1, eng: 8 } },
};
const CATS = [
  { name: "מגורים", icon: "s-house" },
  { name: "תעסוקה", icon: "s-office" },
  { name: "פנאי",   icon: "s-park" },
  { name: "אנרגיה", icon: "s-solar" },
];
const GREEN = ["solar", "wind", "nuclear"];
const POLLUTERS = ["factory", "coal", "gas", "port", "airport"];
const GREENERY = ["park", "forest", "lake", "sport"];
const EXPANSION_YEARS = [10, 20];

/* ---------- החלטות שנתיות (33 — בלי חזרות לאורך המשחק) ---------- */
const DECISIONS = [
  { emoji: "🚗", title: "איסור חניה במרכז העיר", desc: "הצעה להפוך את מרכז העיר לאזור ללא מכוניות. אוויר נקי יותר — אבל הנהגים יכעסו.",
    opts: [{ label: "לאשר", fx: { sat: -4, env: 6 } }, { label: "לדחות", fx: {} }] },
  { emoji: "🛍️", title: "מס על שקיות פלסטיק", desc: "מס קטן על שקיות חד־פעמיות יכניס כסף לקופת העיר וישפר את איכות הסביבה.",
    opts: [{ label: "להטיל את המס", money: 40, fx: { sat: -3, env: 3 } }, { label: "לוותר", fx: {} }] },
  { emoji: "🏠", title: "סבסוד בידוד לבתים", desc: "העירייה תסבסד בידוד קירות וחלונות — הבתים יבזבזו פחות חשמל, שנה אחרי שנה.",
    opts: [{ label: "לסבסד", money: -60, fx: { sat: 2 }, perYear: { eng: 1 } }, { label: "אין תקציב", fx: {} }] },
  { emoji: "🎪", title: "פסטיבל קיץ עירוני", desc: "שלושה ימים של הופעות ודוכנים בפארק המרכזי. התושבים ישמחו, אבל זה עולה כסף ומלכלך.",
    opts: [{ label: "לקיים!", money: -50, fx: { sat: 6, env: -2 } }, { label: "לוותר השנה", fx: { sat: -1 } }] },
  { emoji: "🚲", title: "יום ללא רכב", desc: "פעם בשבוע כל העיר הולכת ברגל או רוכבת על אופניים.",
    opts: [{ label: "להכריז", fx: { env: 6, sat: -2, eco: -2 } }, { label: "לא מתאים לנו", fx: {} }] },
  { emoji: "💡", title: "תאורת רחוב חסכונית", desc: "החלפת כל פנסי הרחוב בנורות לד יקרה עכשיו — אך חוסכת אנרגיה כל שנה.",
    opts: [{ label: "להחליף", money: -40, perYear: { eng: 1 }, fx: {} }, { label: "להשאיר", fx: {} }] },
  { emoji: "🏭", title: "מס תעשייה ירוק", desc: "מס חדש על מפעלים מזהמים יכניס כסף — אבל יפגע בעסקים.",
    opts: [{ label: "להטיל", money: 60, fx: { eco: -4, env: 2 } }, { label: "לוותר", fx: {} }] },
  { emoji: "🌳", title: "שתילת עצים ברחובות", desc: "אלף עצים חדשים לאורך הכבישים — צל, אוויר נקי ויופי.",
    opts: [{ label: "לשתול", money: -30, fx: { env: 5, sat: 3 } }, { label: "לא עכשיו", fx: {} }] },
  { emoji: "🏛️", title: "הנחה בארנונה", desc: "התושבים מבקשים הנחה במסים. זה ישמח אותם אבל יעלה לקופת העיר.",
    opts: [{ label: "לתת הנחה", money: -50, fx: { sat: 4 } }, { label: "לסרב", fx: { sat: -2 } }] },
  { emoji: "💻", title: "חברת היי־טק רוצה להגיע", desc: "חברת טכנולוגיה גדולה מציעה לפתוח סניף בעיר. עבודה לרבים — אבל צריכת החשמל תזנק לתמיד.",
    opts: [{ label: "לקבל בברכה", fx: { eco: 4 }, jobs: 120, perYear: { eng: -1 } }, { label: "לסרב", fx: {} }] },
  { emoji: "🎓", title: "חינוך לחיסכון באנרגיה", desc: "שיעורים בבתי הספר על חיסכון בחשמל. ילדים חכמים = עיר חסכונית לאורך שנים.",
    opts: [{ label: "להפעיל", money: -30, fx: { sat: 1 }, perYear: { eng: 1 } }, { label: "לוותר", fx: {} }] },
  { emoji: "🚌", title: "קו אוטובוס חשמלי חדש", desc: "אוטובוסים חשמליים שיחליפו חלק מהנסיעות ברכב פרטי.",
    opts: [{ label: "להשיק", money: -45, fx: { env: 4, sat: 4 } }, { label: "יקר מדי", fx: {} }] },
  { emoji: "♻️", title: "מפעל מיחזור אזורי", desc: "הקמת מרכז מיחזור שיטפל בפסולת של כל האזור — וגם ירוויח ממנה ויעסיק עובדים.",
    opts: [{ label: "להקים", money: -60, fx: { env: 5, eco: 2 }, jobs: 30 }, { label: "לדחות", fx: {} }] },
  { emoji: "🎡", title: "לונה פארק נודד", desc: "לונה פארק מבקש לחנות בעיר לחודש תמורת דמי שכירות.",
    opts: [{ label: "לארח", money: 30, fx: { sat: 4, env: -1 } }, { label: "לסרב", fx: { sat: -1 } }] },
  { emoji: "⛲", title: "השבתת המזרקה בכיכר", desc: "המזרקה הגדולה צורכת הרבה חשמל ומים. אפשר לכבות אותה.",
    opts: [{ label: "לכבות", fx: { eng: 3, sat: -3 } }, { label: "להשאיר דולקת", fx: {} }] },
  { emoji: "🌱", title: "גגות ירוקים", desc: "חובת גינה על כל גג שטוח חדש — בידוד טבעי ואוויר נקי.",
    opts: [{ label: "לחייב", money: -50, fx: { env: 5, eng: 2 } }, { label: "המלצה בלבד", fx: { env: 1 } }] },
  { emoji: "🥕", title: "שוק איכרים שבועי", desc: "חקלאים מהאזור ימכרו תוצרת טרייה בכיכר העיר בכל יום שישי.",
    opts: [{ label: "לפתוח", money: -20, fx: { sat: 3, eco: 2, env: 1 } }, { label: "אין מקום", fx: {} }] },
  { emoji: "🚴", title: "אופניים שיתופיים", desc: "תחנות השכרת אופניים בכל שכונה — פחות מכוניות בכבישים, כל שנה מחדש.",
    opts: [{ label: "להציב", money: -35, fx: { sat: 2 }, perYear: { env: 1 } }, { label: "לוותר", fx: {} }] },
  { emoji: "🎆", title: "איסור זיקוקים", desc: "הזיקוקים מפחידים חיות ומזהמים את האוויר. אפשר לעבור למופע רחפנים שקט.",
    opts: [{ label: "לאסור", fx: { env: 2, sat: -2 } }, { label: "להשאיר", fx: {} }] },
  { emoji: "🍫", title: "מפעל שוקולד", desc: "יזם רוצה לפתוח מפעל שוקולד קטן. ריח מתוק ומקומות עבודה — אבל עוד משאית ועוד ארובה.",
    opts: [{ label: "לאשר", fx: { eco: 2, sat: 2, env: -2 }, jobs: 60 }, { label: "לסרב", fx: {} }] },
  { emoji: "🎨", title: "אמנות רחוב", desc: "אמנים מקומיים יציירו ציורי קיר ענקיים על בניינים אפורים.",
    opts: [{ label: "לממן", money: -25, fx: { sat: 4 } }, { label: "לא עכשיו", fx: {} }] },
  { emoji: "📚", title: "ספריות רחוב", desc: "ארונות ספרים חינמיים בכל פינה — לוקחים ספר, מחזירים ספר.",
    opts: [{ label: "להציב", money: -15, fx: { sat: 2 } }, { label: "לוותר", fx: {} }] },
  { emoji: "❄️", title: "הגבלת מזגנים בקיץ", desc: "כיוון כל המזגנים הציבוריים ל־24 מעלות יחסוך חשמל כל שנה — אבל יהיה חם.",
    opts: [{ label: "להגביל", fx: { sat: -4 }, perYear: { eng: 1 } }, { label: "לוותר", fx: {} }] },
  { emoji: "☀️", title: "פאנלים על גגות ציבוריים", desc: "התקנת פאנלים סולאריים על בתי הספר והספרייה העירונית — ייצור חשמל מתמשך.",
    opts: [{ label: "להתקין", money: -70, fx: { env: 1 }, perYear: { eng: 1 } }, { label: "יקר מדי", fx: {} }] },
  { emoji: "🏃", title: "מרתון עירוני", desc: "אלפי רצים מכל הארץ יגיעו — פרסום נהדר לעיר ומלונות מלאים.",
    opts: [{ label: "לארגן", money: -30, fx: { sat: 4, eco: 3 } }, { label: "לוותר", fx: {} }] },
  { emoji: "🧳", title: "מס תיירות", desc: "מס קטן על לינת תיירים ימלא את הקופה — אבל אולי ירתיע מבקרים.",
    opts: [{ label: "להטיל", money: 50, fx: { eco: -2 } }, { label: "לוותר", fx: {} }] },
  { emoji: "🌌", title: "כיבוי אורות בלילה", desc: "כיבוי תאורת בניינים ציבוריים אחרי חצות — חיסכון קבוע וגם שמיים זרועי כוכבים.",
    opts: [{ label: "לכבות", fx: { sat: -1 }, perYear: { eng: 1 } }, { label: "להשאיר", fx: {} }] },
  { emoji: "📡", title: "חיישני זיהום חכמים", desc: "רשת חיישנים שתאתר מוקדי זיהום בזמן אמת ותכוון את הטיפול בהם.",
    opts: [{ label: "לפרוס", money: -40, fx: { env: 3 } }, { label: "לוותר", fx: {} }] },
  { emoji: "🏖️", title: "יום ניקיון חופים", desc: "מבצע התנדבות גדול לניקוי החוף והמזח — כל בתי הספר משתתפים.",
    opts: [{ label: "לארגן", money: -10, fx: { env: 4, sat: 1 } }, { label: "אין זמן", fx: {} }] },
  { emoji: "💧", title: "מערכת מים חכמה", desc: "צנרת חדשה עם חיישני דליפות תחסוך מים ואנרגיית שאיבה לאורך שנים.",
    opts: [{ label: "לשדרג", money: -55, fx: { env: 2 }, perYear: { eng: 1 } }, { label: "לדחות", fx: {} }] },
  { emoji: "🐝", title: "כוורות עירוניות", desc: "הצבת כוורות דבורים על גגות — האבקה לגינות ודבש מקומי.",
    opts: [{ label: "להציב", money: -15, fx: { env: 2, sat: 1 } }, { label: "מפחיד!", fx: {} }] },
  { emoji: "🎮", title: "מרכז נוער חדש", desc: "מועדון עם משחקים, חוגים ואולם הופעות — שיהיה לנוער לאן ללכת בערב.",
    opts: [{ label: "להקים", money: -45, fx: { sat: 4, eng: -1 }, jobs: 20 }, { label: "אין תקציב", fx: {} }] },
  { emoji: "🚉", title: "רכבת קלה אזורית", desc: "הצטרפות לפרויקט רכבת אזורי — נסיעה מהירה לערים השכנות בלי פקקים, לתמיד.",
    opts: [{ label: "להצטרף", money: -80, fx: { sat: 3 }, jobs: 40, perYear: { env: 1 } }, { label: "לוותר", fx: {} }] },
];

/* ---------- קבועים ---------- */
const TW = 150, TH = 75, TILE_DIV_H = 180;
const YEARS_TOTAL = 30;
const GRANT = 250;

const METER_META = {
  sat: { emoji: v => (v >= 0 ? "😊" : "😠"), label: "שביעות רצון" },
  eco: { emoji: () => "💲", label: "כלכלה" },
  env: { emoji: () => "🌿", label: "איכות הסביבה" },
  eng: { emoji: () => "⚡", label: "אנרגיה" },
};

/* ---------- מצב ---------- */
const S = {
  size: 3,
  grid: [],          // מפתח מבנה או null לכל משבצת
  meters: { sat: 50, eco: 50, env: 70, eng: 50 },
  money: 0,
  pop: 0,            // תושבים
  bonusJobs: 0,      // משרות מהחלטות מועצה
  policies: [],      // השפעות מתמשכות מהחלטות (fx לכל שנה)
  year: 0,
  phase: "start",    // start | build | idle | sim | end
  tool: null,        // מפתח מבנה, "bulldoze" או null
  shopCat: null,     // קטגוריה פתוחה בחנות
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
    parts.push({ txt: `${v > 0 ? "+" : ""}${v} ${METER_META[k].emoji(v)}`, good: v > 0 });
  }
  return parts;
}
const fxHtml = (fx, money) =>
  fxParts(fx, money).map(p => `<b class="${p.good ? "plus" : "minus"}">${p.txt}</b>`).join(" ") || "ללא השפעה";

// תצוגת השפעות של אפשרות החלטה — כולל השפעות מתמשכות ומשרות
function optFxHtml(opt) {
  const parts = fxParts(opt.fx, opt.money);
  for (const [k, v] of Object.entries(opt.perYear || {})) {
    if (!v) continue;
    parts.push({ txt: `${v > 0 ? "+" : ""}${v} ${METER_META[k].emoji(v)} בכל שנה`, good: v > 0 });
  }
  if (opt.jobs) parts.push({ txt: `+${opt.jobs} 💼 משרות`, good: true });
  return parts.map(p => `<b class="${p.good ? "plus" : "minus"}">${p.txt}</b>`).join(" ") || "ללא השפעה";
}

/* ---------- צלילים (Web Audio, ללא קבצים) ---------- */
let audioCtx = null;
let muted = false;

function sfx(kind) {
  if (muted) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
    const t0 = audioCtx.currentTime;
    const beep = (freq, start, dur, wave = "sine", vol = 0.14, slideTo = 0) => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = wave;
      o.frequency.setValueAtTime(freq, t0 + start);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + start + dur);
      g.gain.setValueAtTime(vol, t0 + start);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + start + dur);
      o.connect(g).connect(audioCtx.destination);
      o.start(t0 + start);
      o.stop(t0 + start + dur + 0.02);
    };
    switch (kind) {
      case "select":   beep(520, 0, 0.07, "sine", 0.1); break;
      case "place":    beep(300, 0, 0.1, "triangle", 0.18); beep(470, 0.06, 0.14, "triangle", 0.16); break;
      case "demolish": beep(230, 0, 0.28, "sawtooth", 0.1, 85); break;
      case "coin":     beep(880, 0, 0.08, "square", 0.06); beep(1318, 0.07, 0.13, "square", 0.06); break;
      case "decision": beep(392, 0, 0.1, "sine", 0.12); beep(523, 0.11, 0.16, "sine", 0.12); break;
      case "year":     beep(523, 0, 0.09, "triangle", 0.1); beep(659, 0.09, 0.09, "triangle", 0.1); beep(784, 0.18, 0.16, "triangle", 0.1); break;
      case "unlock":   beep(523, 0, 0.1, "triangle", 0.12); beep(784, 0.1, 0.1, "triangle", 0.12); beep(1046, 0.2, 0.22, "triangle", 0.12); break;
      case "error":    beep(190, 0, 0.14, "square", 0.08); break;
      case "win":      [523, 659, 784, 1046].forEach((f, i) => beep(f, i * 0.14, i === 3 ? 0.5 : 0.14, "triangle", 0.13)); break;
      case "lose":     beep(330, 0, 0.3, "sawtooth", 0.1, 165); beep(165, 0.3, 0.55, "sawtooth", 0.1, 82); break;
    }
  } catch (e) { /* אין תמיכה בשמע — ממשיכים בשקט */ }
}

function toast(msg, cls = "") {
  const el = document.createElement("div");
  el.className = "toast " + cls;
  el.textContent = msg;
  $("#toasts").appendChild(el);
  setTimeout(() => el.remove(), 3400);
}

/* ---------- לוח ---------- */
function tileGroundSVG() {
  return `<svg class="ground" viewBox="0 0 100 50">
    <polygon class="g-top" points="50,1 99,25 50,49 1,25" fill="#9ed46f" stroke="#7bb84e" stroke-width="1.5"/>
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

  // חצי־אי — צמוד למשבצות למעלה, לשון יבשה עם גבעות נמשכת שמאלה, מזח וכביש גישה
  const gTop = TILE_DIV_H - 75;                    // ראש מעוין הקרקע העליון
  const icx = boardW / 2, icy = gTop + (n * TH) / 2;
  const irx = boardW / 2, iry = (n * TH) / 2;
  //            0=ימין 2=ימין-מטה 4=מטה 6=שמאל-מטה 8=שמאל 10=שמאל-מעלה 12=מעלה 14=ימין-מעלה
  const margins = [90, 72, 84, 104, 92, 120, 170, 300, 430, 280, 120, 34, 26, 30, 44, 64];
  const K = margins.length;
  const coastPt = (k, frac) => {                   // נקודה במרחק frac מרוחב החוף מעבר למעוין
    const a = (k / K) * Math.PI * 2;
    const c = Math.cos(a), s = Math.sin(a);
    const rd = 1 / (Math.abs(c) / irx + Math.abs(s) / iry);
    const r = rd + margins[k] * frac;
    return [icx + c * r, icy + s * r];
  };
  const pathFor = frac => {
    const p = [...Array(K).keys()].map(k => coastPt(k, frac));
    let d = `M ${(p[0][0] + p[K - 1][0]) / 2},${(p[0][1] + p[K - 1][1]) / 2}`;
    for (let k = 0; k < K; k++) {
      const cur = p[k], nx = p[(k + 1) % K];
      d += ` Q ${cur[0]},${cur[1]} ${(cur[0] + nx[0]) / 2},${(cur[1] + nx[1]) / 2}`;
    }
    return d + " Z";
  };
  const treeAt = (k, sc, frac = 0.4) => {
    const [x, y] = coastPt(k, frac);
    return `<g transform="translate(${x},${y}) scale(${sc})">
      <rect x="-1.5" y="-2" width="3" height="9" fill="#7a5230"/>
      <circle cx="0" cy="-7" r="8" fill="#3e9440"/><circle cx="-5" cy="-3" r="5" fill="#4ca64c"/></g>`;
  };
  const bushAt = (k, sc, frac = 0.55) => {
    const [x, y] = coastPt(k, frac);
    return `<g transform="translate(${x},${y}) scale(${sc})"><circle r="5" fill="#5cbf5a"/><circle cx="5" cy="2" r="3.5" fill="#6fd06d"/></g>`;
  };
  const [px, py] = coastPt(4, 0.9);                // תחתית — שם המזח
  const [hx, hy] = coastPt(8, 0.5);                // אמצע הלשון — שם הגבעות
  const roadEndY = gTop + n * TH + 4;              // הפינה הקדמית של הרשת
  const roadD = `M ${icx},${roadEndY} Q ${icx + 12},${(roadEndY + py) / 2} ${px},${py - 4}`;
  const padL = 540, pad = 175;
  const island = document.createElement("div");
  island.className = "island";
  island.style.cssText = `position:absolute;left:${-padL}px;top:${gTop - pad}px;width:${boardW + padL + pad}px;height:${n * TH + 2 * pad}px;z-index:0;pointer-events:none;`;
  island.innerHTML = `<svg width="100%" height="100%" viewBox="${-padL} ${gTop - pad} ${boardW + padL + pad} ${n * TH + 2 * pad}">
    <path d="${pathFor(1.16)}" fill="rgba(255,255,255,.17)"/>
    <path d="${pathFor(1)}" fill="#eed985" stroke="rgba(255,255,255,.6)" stroke-width="4"/>
    <path d="${pathFor(0.86)}" fill="#8ac263"/>
    <path d="${roadD}" fill="none" stroke="#c9b06b" stroke-width="17" stroke-linecap="round"/>
    <path d="${roadD}" fill="none" stroke="#fff" stroke-width="2.5" stroke-dasharray="9 13" opacity=".75"/>
    <g transform="translate(${hx},${hy})">
      <path d="M-160,10 Q-100,-100 -30,10 Z" fill="#5f9a43"/>
      <path d="M-75,10 Q-8,-145 70,10 Z" fill="#548c3b"/>
      <path d="M-26,-68 q24,-32 52,0 l-8,10 q-20,-24 -38,0 Z" fill="#69a84c" opacity=".9"/>
      <path d="M35,10 Q95,-85 155,10 Z" fill="#69a84c"/>
      <g fill="#3e9440">
        <circle cx="-120" cy="-6" r="7"/><circle cx="-48" cy="2" r="6"/>
        <circle cx="110" cy="-4" r="7"/><circle cx="12" cy="4" r="5"/>
      </g>
    </g>
    ${treeAt(1, 0.9)}${treeAt(3, 0.75)}${treeAt(5, 0.85)}${treeAt(6, 0.9, 0.3)}${treeAt(9, 0.9, 0.55)}${treeAt(15, 0.7)}
    ${bushAt(0, 1)}${bushAt(2, 0.9)}${bushAt(7, 1.2, 0.35)}${bushAt(9, 1, 0.3)}${bushAt(10, 0.9)}
    <g transform="translate(${px},${py}) rotate(16)">
      <rect x="-7" y="-6" width="14" height="66" rx="3" fill="#b98a52" stroke="#8a6a3e" stroke-width="1.5"/>
      <g stroke="#8a6a3e" stroke-width="2">
        <line x1="-7" y1="8" x2="7" y2="8"/><line x1="-7" y1="20" x2="7" y2="20"/>
        <line x1="-7" y1="32" x2="7" y2="32"/><line x1="-7" y1="44" x2="7" y2="44"/>
      </g>
    </g>
    <g transform="translate(${px + 40},${py + 42})">
      <ellipse rx="17" ry="6" fill="#c9553e"/><ellipse cy="-2" rx="12" ry="3" fill="#e8eef4"/>
    </g>
    <g transform="translate(${icx + irx + 108},${gTop + 30})">
      <ellipse rx="27" ry="12" fill="#eed985"/><ellipse rx="16" ry="7" fill="#86c161"/>
      <rect x="2" y="-8" width="2.5" height="7" fill="#7a5230"/><circle cx="3" cy="-11" r="5.5" fill="#3e9440"/>
    </g>
  </svg>`;
  board.appendChild(island);

  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const i = y * n + x;
      const el = document.createElement("div");
      el.className = "tile";
      el.dataset.i = i;
      el.style.left = ((x - y + (n - 1)) * TW / 2) + "px";
      el.style.top = ((x + y) * TH / 2) + "px";
      el.style.zIndex = x + y + 1;
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

function tileEl(i) { return $("#board").querySelectorAll(".tile")[i]; }

// הרחבת העיר — שורה ועמודה חדשות, המבנים הקיימים נשארים במקומם
function expandBoard() {
  const old = S.grid, oldN = S.size;
  S.size++;
  buildBoard();
  for (let y = 0; y < oldN; y++)
    for (let x = 0; x < oldN; x++)
      S.grid[y * S.size + x] = old[y * oldN + x];
  S.grid.forEach((k, i) => { if (k) renderTile(i); });
}

// דיור ותעסוקה בעיר
function cityStats() {
  let housing = 0, jobs = S.bonusJobs;
  for (const k of S.grid) {
    if (!k) continue;
    housing += TILES[k].homes || 0;
    jobs += TILES[k].jobs || 0;
  }
  return { housing, jobs };
}

function updatePop() {
  const { housing, jobs } = cityStats();
  $("#pop-val").textContent = S.pop.toLocaleString("he-IL");
  $("#house-val").textContent = housing.toLocaleString("he-IL");
  $("#jobs-val").textContent = jobs.toLocaleString("he-IL");
}

function renderTile(i) {
  const el = tileEl(i);
  const key = S.grid[i];
  el.querySelector("svg.bld")?.remove();
  el.title = "";
  el.classList.remove("pop");
  el.classList.toggle("hasb", !!key);
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

function refundFor(key) {
  // בשלבי הבנייה אפשר להחליף בחופשיות — החזר מלא
  return TILES[key].cost;
}

function onTileClick(i) {
  hideTileInfo();
  const key = S.grid[i];

  if (S.phase === "build") {
    if (S.tool === "bulldoze") {
      if (!key) return;
      const refund = refundFor(key);
      S.grid[i] = null;
      S.money += refund;
      renderTile(i);
      sfx("demolish");
      toast(`🚜 נהרס — קיבלתם החזר של ${refund} 💰`);
      updateWallet();
      updatePop();
      renderShop();
      return;
    }
    if (S.tool) {
      if (key) { showTileInfo(i); return; }
      const t = TILES[S.tool];
      if (t.cost > S.money) { sfx("error"); toast("אין מספיק כסף! 💰"); return; }
      S.money -= t.cost;
      S.grid[i] = S.tool;
      renderTile(i);
      tileEl(i).classList.add("pop");
      sfx("place");
      updateWallet();
      updatePop();
      renderShop();
      return;
    }
    if (key) showTileInfo(i);
    else toast("בחרו קודם מבנה מרשימת הבנייה 🔨");
    return;
  }

  if (key) showTileInfo(i);
}

/* ---------- כרטיס מידע על מבנה ---------- */
function showTileInfo(i) {
  const key = S.grid[i];
  if (!key) return;
  const t = TILES[key];
  const panel = $("#tile-info");
  const rows = Object.entries(t.fx).filter(([, v]) => v).map(([k, v]) =>
    `<li><span>${METER_META[k].emoji(v)} ${METER_META[k].label}</span><b class="${v > 0 ? "plus" : "minus"}">${v > 0 ? "+" : ""}${v}</b></li>`
  ).join("")
    + (t.homes ? `<li><span>👥 מקומות מגורים</span><b class="plus">+${t.homes}</b></li>` : "")
    + (t.jobs ? `<li><span>💼 מקומות עבודה</span><b class="plus">+${t.jobs}</b></li>` : "");
  panel.innerHTML = `
    <div class="ti-head"><svg viewBox="0 0 100 100"><use href="#${t.icon}"/></svg><span>${t.name}</span><button class="ti-close">✕</button></div>
    <div class="ti-sub">השפעה על העיר בכל שנה:</div>
    <ul class="ti-fx">${rows}</ul>
    ${S.phase === "build" ? `<div class="ti-cost">🚜 הריסה תחזיר ${refundFor(key)} 💰</div>` : ""}`;
  panel.classList.remove("hidden");
  panel.querySelector(".ti-close").addEventListener("click", hideTileInfo);

  const r = tileEl(i).getBoundingClientRect();
  const pw = 240;
  const x = clamp(r.left + r.width / 2 - pw / 2, 8, window.innerWidth - pw - 8);
  let y = r.top - panel.offsetHeight - 6;
  if (y < 62) y = r.bottom - 30;
  panel.style.left = x + "px";
  panel.style.top = y + "px";
}

function hideTileInfo() {
  $("#tile-info").classList.add("hidden");
}

document.addEventListener("click", e => {
  if (!e.target.closest("#tile-info") && !e.target.closest(".tile")) hideTileInfo();
});

/* ---------- חנות ---------- */
// צ'יפ מדד בכרטיס מבנה — סדר קבוע כדי שקל להשוות בין מבנים
function chipHtml(emoji, v, suffix = "") {
  if (!v) return `<span class="chip zero">${emoji} —</span>`;
  return `<span class="chip ${v > 0 ? "pos" : "neg"}">${emoji} ${v > 0 ? "+" : ""}${v}${suffix}</span>`;
}

function renderShop() {
  const box = $("#shop-items");
  box.innerHTML = "";
  if (!S.shopCat) S.shopCat = CATS[0].name;

  const flex = document.createElement("div");
  flex.className = "shop-flex";

  // טור קטגוריות — עמודה אחת קבועה
  const catCol = document.createElement("div");
  catCol.className = "cat-col";
  for (const cat of CATS) {
    const items = Object.entries(TILES).filter(([, t]) => t.cat === cat.name);
    const openCount = items.filter(([, t]) => !(t.unlock && S.year < t.unlock)).length;
    const el = document.createElement("div");
    el.className = "cat-card" + (S.shopCat === cat.name ? " active" : "");
    el.innerHTML = `
      <svg viewBox="0 0 100 100"><use href="#${cat.icon}"/></svg>
      <div class="cc-name">${cat.name}</div>
      <div class="cc-count">${openCount}/${items.length} מבנים</div>`;
    el.addEventListener("click", () => {
      if (S.shopCat === cat.name) return;
      S.shopCat = cat.name;
      S.tool = null;
      sfx("select");
      renderShop();
      updateTileCursors();
    });
    catCol.appendChild(el);
  }
  flex.appendChild(catCol);

  // טור המבנים — נפתח בצד, גולל בעצמו
  const itemCol = document.createElement("div");
  itemCol.className = "item-col";
  const scrollBtn = (dir, edge) => {
    const b = document.createElement("button");
    b.className = "col-nav-btn " + edge;
    b.innerHTML = `<span class="chev chev-${edge}"></span>`;
    b.addEventListener("click", () => itemCol.scrollBy({ top: dir * 200, behavior: "smooth" }));
    return b;
  };
  itemCol.appendChild(scrollBtn(-1, "up"));
  for (const [key, t] of Object.entries(TILES)) {
    if (t.cat !== S.shopCat) continue;
    const locked = t.unlock && S.year < t.unlock;
    const poor = !locked && t.cost > S.money;
    const el = document.createElement("div");
    el.className = "shop-sq" + (locked ? " locked" : "") + (poor ? " poor" : "") + (S.tool === key ? " selected" : "");
    el.innerHTML = `
      <div class="sq-ribbon">${t.cost} 💰</div>
      <svg viewBox="0 0 100 100"><use href="#${t.icon}"/></svg>
      <div class="sq-name">${t.name}</div>
      <div class="sq-chips">
        ${chipHtml("😊", t.fx.sat)}${chipHtml("💲", t.fx.eco)}${chipHtml("🌿", t.fx.env)}
        ${chipHtml("⚡", t.fx.eng)}${chipHtml("🏠", t.homes)}${chipHtml("💼", t.jobs)}
      </div>
      ${locked ? `<span class="si-lock">🔒 שנה ${t.unlock}</span>` : ""}`;
    if (!locked && !poor) el.addEventListener("click", () => { S.tool = S.tool === key ? null : key; sfx("select"); renderShop(); updateTileCursors(); });
    itemCol.appendChild(el);
  }
  itemCol.appendChild(scrollBtn(1, "down"));
  flex.appendChild(itemCol);

  box.appendChild(flex);
  $("#btn-bulldoze").classList.toggle("selected", S.tool === "bulldoze");
}

function enterBuild(first) {
  hideTileInfo();
  S.phase = "build";
  S.tool = null;
  S.shopCat = null;
  $("#shop").classList.remove("hidden");
  $("#shop-title").textContent = first ? "🔨 בניית העיר" : `🔨 שנת שיפוצים! (שנה ${S.year})`;
  $("#btn-next-year").classList.add("hidden");
  renderShop();
  updateTileCursors();
  fitBoard();
}

function exitBuild() {
  hideTileInfo();
  S.phase = "idle";
  S.tool = null;
  $("#shop").classList.add("hidden");
  updateTileCursors();
  fitBoard();
  if (S.year === 0) {
    // התושבים הראשונים עוברים לגור בעיר
    S.pop = Math.round(cityStats().housing * 0.5);
    updatePop();
    toast(`👥 ${S.pop} התושבים הראשונים הגיעו לעיר!`);
  }
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
    const danger = v <= 25;
    const warn = v <= 45;
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
  if (S.meters.env <= 0) return "🏭 הזיהום השתלט על העיר והאוויר הפך בלתי נשים...";
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
  el.innerHTML = `${METER_META[key].emoji(val)}<small class="${val > 0 ? "plus" : "minus"}">${val > 0 ? "+" : ""}${val}</small>`;
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
  // שקיעה הדרגתית לאורך 30 השנים
  $("#daylight").style.opacity = (S.year / YEARS_TOTAL) * 0.75;
}

/* ---------- החלטה שנתית ---------- */
function nextDecision() {
  if (!S.decisionPool.length) S.decisionPool = shuffle([...DECISIONS.keys()]);
  return DECISIONS[S.decisionPool.pop()];
}

function showDecision(dec) {
  return new Promise(resolve => {
    $("#dec-year").textContent = S.year + 1;
    $("#dec-illu").textContent = dec.emoji || "📜";
    $("#dec-title").textContent = dec.title;
    $("#dec-desc").textContent = dec.desc;
    const box = $("#dec-options");
    box.innerHTML = "";
    const btns = [];
    const choose = opt => {
      sfx("select");
      $("#overlay").classList.add("hidden");
      $("#modal-decision").classList.add("hidden");
      resolve(opt);
    };
    dec.opts.forEach((opt, oi) => {
      const b = document.createElement("button");
      b.className = "dec-opt";
      b.innerHTML = `<div class="do-title">${opt.label}</div><div class="do-fx">${optFxHtml(opt)}</div>`;
      b.addEventListener("click", () => choose(opt));
      box.appendChild(b);
      btns.push(b);
    });

    // גרירת האיור ימינה/שמאלה בוחרת בכרטיס המתאים
    const illu = $("#dec-illu");
    let startX = null, dx = 0;
    illu.style.transform = "";
    illu.onpointerdown = e => { startX = e.clientX; try { illu.setPointerCapture(e.pointerId); } catch (err) {} };
    illu.onpointermove = e => {
      if (startX === null) return;
      dx = e.clientX - startX;
      illu.style.transform = `translateX(${dx}px) rotate(${dx / 14}deg)`;
      btns[0]?.classList.toggle("lean", dx > 30);   // בכיוון RTL הכרטיס הראשון מוצג מימין
      btns[1]?.classList.toggle("lean", dx < -30);
    };
    illu.onpointerup = () => {
      if (startX === null) return;
      const picked = dx > 70 ? 0 : dx < -70 ? 1 : -1;
      startX = null;
      illu.style.transform = "";
      btns.forEach(b => b.classList.remove("lean"));
      if (picked >= 0 && dec.opts[picked]) choose(dec.opts[picked]);
      dx = 0;
    };

    sfx("decision");
    $("#overlay").classList.remove("hidden");
    $("#modal-decision").classList.remove("hidden");
  });
}

/* ---------- מהלך שנה ---------- */
async function nextYear() {
  if (S.busy) return;
  S.busy = true;
  hideTileInfo();
  $("#btn-next-year").classList.add("hidden");

  // החלטת מועצה
  const opt = await showDecision(nextDecision());
  if (opt.jobs) S.bonusJobs += opt.jobs;
  if (opt.perYear) S.policies.push(opt.perYear);
  if (Object.keys(opt.fx || {}).length || opt.money || opt.jobs) {
    applyFx(opt.fx, opt.money || 0);
    updatePop();
    await sleep(500);
  }

  // קידום שנה
  S.year++;
  updateTimeline();
  sfx("year");
  S.phase = "sim";

  // השפעות המבנים — אייקונים מרחפים
  const totals = { sat: 0, eco: 0, env: 0, eng: 0 };
  const built = S.grid.map((k, i) => k ? i : -1).filter(i => i >= 0);
  for (const i of built) {
    const t = TILES[S.grid[i]];
    for (const [k, v] of Object.entries(t.fx)) {
      if (!v) continue;
      totals[k] += v;
      flyIcon(tileEl(i), k, v);
    }
    await sleep(150);
  }

  // השפעות שכנות: בית ליד מבנה מזהם סובל, ליד ירוק נהנה
  const nn = S.size;
  for (const i of built) {
    if (!TILES[S.grid[i]].homes) continue;
    const x = i % nn, y = Math.floor(i / nn);
    const neigh = [[1, 0], [-1, 0], [0, 1], [0, -1]]
      .map(([dx, dy]) => (x + dx >= 0 && x + dx < nn && y + dy >= 0 && y + dy < nn) ? S.grid[(y + dy) * nn + (x + dx)] : null);
    const bad = Math.min(2, neigh.filter(k => POLLUTERS.includes(k)).length);
    const good = neigh.some(k => GREENERY.includes(k)) ? 1 : 0;
    const d = good - bad;
    if (d) {
      totals.sat += d;
      flyIcon(tileEl(i), "sat", d);
      await sleep(150);
    }
  }
  await sleep(1000);

  // מדיניות מתמשכת מהחלטות עבר
  for (const p of S.policies)
    for (const [k, v] of Object.entries(p)) totals[k] += v;

  // בלאי שנתי — התושבים מתרגלים לטוב והתשתיות מתיישנות
  totals.sat -= 1;
  totals.eco -= 1;

  // עדכון מדדים
  for (const [k, v] of Object.entries(totals)) S.meters[k] = clamp(S.meters[k] + v, 0, 100);
  updateMeters(Object.keys(totals));

  // אוכלוסייה: גדלה לפי דיור פנוי, מקומות עבודה ושביעות רצון
  const { housing, jobs } = cityStats();
  const target = Math.min(housing, Math.round(jobs * 1.3));
  const growth = Math.round((target - S.pop) * 0.3 * (S.meters.sat / 100 + 0.3));
  S.pop = Math.max(0, S.pop + growth);
  if (S.meters.sat <= 25) S.pop = Math.round(S.pop * 0.95);
  updatePop();
  if (growth > 5) toast(`👥 ${growth} תושבים חדשים הצטרפו לעיר!`);
  if (S.pop > jobs + 20) {
    S.meters.sat = clamp(S.meters.sat - 2, 0, 100);
    updateMeters(["sat"]);
    toast("😟 אבטלה בעיר — חסרים מקומות עבודה!");
  }

  // הכנסה שנתית — בסיס + כלכלה + ארנונת תושבים
  const income = 15 + Math.floor(S.meters.eco / 5) + Math.floor(S.pop / 40);
  S.money += income;
  updateWallet();
  sfx("coin");
  toast(`📅 שנה ${S.year}: הכנסה שנתית +${income} 💰`);

  // קריסה?
  const reason = crashReason();
  if (reason) { await sleep(900); return endGame(false, reason); }

  // סוף המשחק?
  if (S.year >= YEARS_TOTAL) { await sleep(900); return endGame(true); }

  // שנת בנייה (כל 5 שנים)
  if (S.year % 5 === 0) {
    let grant = GRANT;
    // הרחבת העיר בשנים 10 ו־20
    if (EXPANSION_YEARS.includes(S.year) && S.size < 6) {
      const newTiles = (S.size + 1) ** 2 - S.size ** 2;
      grant += newTiles * 110;
      expandBoard();
      sfx("unlock");
      toast(`🏗️ העיר מתרחבת! נוספו ${newTiles} משבצות חדשות`, "unlock");
    }
    S.money += grant;
    updateWallet();
    await sleep(400);
    sfx("coin");
    toast(`🏛️ מענק ממשלתי: +${grant} 💰`, "unlock");
    let unlocked = false;
    for (const [key, t] of Object.entries(TILES)) {
      if (t.unlock === S.year) { unlocked = true; toast(`🔓 נפתח מבנה חדש: ${t.name}!`, "unlock"); }
    }
    if (unlocked) sfx("unlock");
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
  sfx(won ? "win" : "lose");
  const green = S.grid.filter(k => GREEN.includes(k)).length;
  const score = Math.round(
    S.meters.sat + S.meters.eco + S.meters.eng + S.meters.env +
    Math.floor(S.money / 10) + green * 15 + Math.floor(S.pop / 20)
  );
  const stars = !won ? "💔" : score >= 380 ? "⭐⭐⭐" : score >= 290 ? "⭐⭐" : "⭐";

  $("#end-title").textContent = won ? "🎉 כל הכבוד! העיר שרדה 30 שנה!" : "💥 העיר קרסה!";
  $("#end-desc").textContent = won
    ? "ניהלתם את עיר האנרגיה בחוכמה לאורך שלושה עשורים."
    : `${reason} (שנה ${S.year})`;

  $("#end-stats").innerHTML = `
    <div class="end-stat">😊 שביעות רצון<div class="es-val">${Math.round(S.meters.sat)}</div></div>
    <div class="end-stat">📈 כלכלה<div class="es-val">${Math.round(S.meters.eco)}</div></div>
    <div class="end-stat">🌿 איכות הסביבה<div class="es-val">${Math.round(S.meters.env)}</div></div>
    <div class="end-stat">⚡ אנרגיה<div class="es-val">${Math.round(S.meters.eng)}</div></div>
    <div class="end-stat">👥 תושבים<div class="es-val">${S.pop.toLocaleString("he-IL")}</div></div>
    <div class="end-stat">💰 קופת העיר<div class="es-val">${S.money}</div></div>
    <div class="end-stat">🌱 מבני אנרגיה נקייה<div class="es-val">${green}</div></div>`;

  $("#end-score").innerHTML = `ניקוד סופי: ${score}<span class="stars">${stars}</span>`;

  $("#overlay").classList.remove("hidden");
  $("#modal-end").classList.remove("hidden");
}

/* ---------- אתחול ---------- */
function startGame(size) {
  S.size = size;
  S.money = size === 3 ? 1500 : 2600;
  S.meters = { sat: 50, eco: 50, env: 70, eng: 50 };
  S.pop = 0;
  S.bonusJobs = 0;
  S.policies = [];
  S.year = 0;
  S.decisionPool = shuffle([...DECISIONS.keys()]);
  buildBoard();
  buildTimeline();
  updateMeters();
  updateWallet();
  updatePop();
  $("#overlay").classList.add("hidden");
  $("#modal-start").classList.add("hidden");
  toast("🔨 מלאו את כל המשבצות במבנים, ואז לחצו על ✅ סיום בנייה");
  enterBuild(true);
}

document.querySelectorAll(".size-btns button").forEach(b =>
  b.addEventListener("click", () => startGame(+b.dataset.size)));

$("#btn-done-build").addEventListener("click", () => {
  const empty = S.grid.filter(k => !k).length;
  if (empty) { sfx("error"); toast(`יש למלא את כל המשבצות! נשארו ${empty} פנויות 🔨`); return; }
  if (!S.grid.some(k => TILES[k]?.fx.eng > 0)) { sfx("error"); toast("⚡ אין לעיר מקור אנרגיה! בנו תחנת כוח"); return; }
  sfx("place");
  exitBuild();
});

$("#btn-sound").addEventListener("click", () => {
  muted = !muted;
  $("#btn-sound").textContent = muted ? "🔇" : "🔊";
  if (!muted) sfx("select");
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
