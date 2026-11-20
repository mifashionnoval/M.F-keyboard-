const box = document.getElementById("typingBox");
const rowsEl = document.getElementById("keyRows");
const stickerTray = document.getElementById("stickerTray");
const themeSelect = document.getElementById("themeSelect");
let mode = "letters";
let shifted = false;
let stickersOpen = false;

const naijaStickers = [
  ["😂", "I DON CAST!"],
  ["😭", "WETIN BE THIS?"],
  ["😎", "NO SHAKING"],
  ["🫡", "I DEY COME"],
  ["💸", "ALERT DON ENTER"],
  ["🤦", "OMO!"],
  ["🥹", "ABEG NA"],
  ["🔥", "E CHOKE!"],
  ["🙆", "HA! GOD ABeg"],
  ["😅", "NA CRUISE"],
  ["🦅", "WE MOVE!"],
  ["❤️", "YOU TOO MUCH"]
];

const layouts = {
  letters: ["qwertyuiop", "asdfghjkl", "zxcvbnm"],
  numbers: ["1234567890", "@#$%&*-+/"],
  symbols: ["[]{}<>=", "!?;:'\"~`\\|"]
};
const emojis = ["😀","😂","🥰","😍","😊","😭","😘","😎","🤔","👍","🙏","❤️","🔥","🎉","💯","✨","🌍"];
const naijaStickers = [
  ["😂", "Omo!"],
  ["😭", "I don tire"],
  ["😎", "No wahala"],
  ["🤣", "Abeg oo!"],
  ["🔥", "E choke!"],
  ["🙏", "God when?"],
  ["😅", "Wahala be like…"],
  ["🙌", "Las las, we go dey"],
  ["🤨", "Who send you?"],
  ["👏", "You try sha!"],
  ["💀", "I don laugh tire"],
  ["😩", "Na so?"]
];

function makeKey(char, extra = "") {
  const button = document.createElement("button");
  button.className = "key " + extra;
  button.type = "button";
  button.textContent = char;
  button.addEventListener("click", () => insertText(char));
  return button;
}
function renderStickers() {
  const grid = document.getElementById("stickerGrid");
  grid.innerHTML = "";
  naijaStickers.forEach(([emoji, phrase]) => {
    const sticker = document.createElement("button");
    sticker.type = "button";
    sticker.className = "sticker";
    sticker.innerHTML = `<span class="sticker-emoji">${emoji}</span><span>${phrase}</span>`;
    sticker.addEventListener("click", () => {
      // Insert a sticker label into the demo typing area.
      insertText(`${emoji} ${phrase} `);
    });
    grid.appendChild(sticker);
  });
}
function renderKeys() {
  rowsEl.innerHTML = "";
  stickerTray.hidden = mode !== "stickers";
  if (mode === "stickers") {
    stickerTray.innerHTML = "";
    naijaStickers.forEach(([emoji, caption]) => {
      const sticker = document.createElement("button");
      sticker.type = "button";
      sticker.className = "sticker-chip";
      sticker.innerHTML = `<span>${emoji}</span>${caption}`;
      sticker.addEventListener("click", () => insertText(`${emoji} ${caption} `));
      stickerTray.appendChild(sticker);
    });
    return;
  }
  if (mode === "emoji") {
    const row = document.createElement("div"); row.className = "key-row";
    emojis.forEach(e => row.appendChild(makeKey(e)));
    rowsEl.appendChild(row);
    return;
  }
  layouts[mode].forEach((line, index) => {
    const row = document.createElement("div"); row.className = "key-row";
    if (index === 1 && mode === "letters") row.style.padding = "0 4%";
    [...line].forEach(char => row.appendChild(makeKey(shifted ? char.toUpperCase() : char)));
    rowsEl.appendChild(row);
  });
}
function insertText(text) {
  const start = box.selectionStart ?? box.value.length;
  const end = box.selectionEnd ?? box.value.length;
  box.setRangeText(text, start, end, "end");
  box.focus();
  playFeedback();
}
function playFeedback() {
  if (document.getElementById("vibrationToggle").checked && navigator.vibrate) navigator.vibrate(12);
  if (document.getElementById("soundToggle").checked) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx(), osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.frequency.value = 520; gain.gain.value = 0.025;
        osc.connect(gain); gain.connect(ctx.destination); osc.start();
        osc.stop(ctx.currentTime + 0.025);
        osc.onended = () => ctx.close();
      }
    } catch (_) {}
  }
}
function backspace() {
  const start = box.selectionStart, end = box.selectionEnd;
  if (start !== end) box.setRangeText("", start, end, "end");
  else if (start > 0) box.setRangeText("", start - 1, end, "end");
  box.focus(); playFeedback();
}
function runAction(action) {
  const stickerPanel = document.getElementById("stickerPanel");
  if (action === "stickers") {
    stickersOpen = !stickersOpen;
    stickerPanel.hidden = !stickersOpen;
    if (stickersOpen) {
      mode = "letters";
      renderStickers();
    }
    return;
  }
  if (stickersOpen) {
    stickersOpen = false;
    stickerPanel.hidden = true;
  }
  switch (action) {
    case "emoji": mode = "emoji"; break;
    case "stickers": mode = "stickers"; break;
    case "numbers": mode = "numbers"; break;
    case "symbols": mode = "symbols"; break;
    case "letters": mode = "letters"; break;
    case "backspace": backspace(); return;
    case "space": insertText(" "); return;
    case "comma": insertText(","); return;
    case "period": insertText("."); return;
    case "enter": insertText("\n"); return;
    case "shift": shifted = !shifted; renderKeys(); return;
  }
  renderKeys();
}
document.querySelectorAll("[data-action]").forEach(button => {
  button.addEventListener("click", () => runAction(button.dataset.action));
});
themeSelect.addEventListener("change", () => {
  document.body.dataset.theme = themeSelect.value;
  try { localStorage.setItem("keyglow-theme", themeSelect.value); } catch (_) {}
});
document.getElementById("clearBtn").addEventListener("click", () => { box.value = ""; box.focus(); });
document.getElementById("copyBtn").addEventListener("click", async () => {
  if (!box.value) return;
  try {
    await navigator.clipboard.writeText(box.value);
    document.getElementById("copyBtn").textContent = "Copied!";
    setTimeout(() => document.getElementById("copyBtn").textContent = "Copy text", 1200);
  } catch (_) {
    box.select();
    document.execCommand("copy");
  }
});
function updateConnection() {
  const el = document.getElementById("connectionStatus");
  const online = navigator.onLine;
  el.textContent = online ? "● Online" : "● Offline";
  el.style.color = online ? "#9be4b0" : "#ffd18a";
  el.style.background = online ? "#17332b" : "#3a2b19";
}
window.addEventListener("online", updateConnection);
window.addEventListener("offline", updateConnection);
try {
  const saved = localStorage.getItem("keyglow-theme");
  if (saved && ["midnight","ocean","purple","forest","light"].includes(saved)) {
    themeSelect.value = saved;
    document.body.dataset.theme = saved;
  }
} catch (_) {}
updateConnection();
renderKeys();
