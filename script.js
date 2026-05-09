
let vMode = true;
const API_KEY = "AIzaSyCWAcnkgCyG6Ec0qqnmuKdkS3OTk_qwwc4";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
let history = [];

// --- THEME & VOICE CONTROLS ---
function toggleTheme() { document.body.classList.toggle('dark'); }
function toggleVoice() {
    vMode = !vMode;
    document.getElementById('v-toggle').innerText = vMode ? 'VOICE: ON' : 'VOICE: OFF';
}
function handleKey(e) { if (e.key === 'Enter') runAI(); }

// --- SCROLL REVEAL ---
const obs = new IntersectionObserver((es) => {
    es.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// --- RIPPLE & PROGRESS ---
function createRipple(e) {
    const r = document.createElement("div");
    r.className = "ripple";
    r.style.left = `${e.clientX}px`;
    r.style.top = `${e.clientY}px`;
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 600);
}

window.onscroll = () => {
    const s = document.documentElement.scrollTop,
          h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    document.getElementById("progress-bar").style.width = (s / h) * 100 + "%";
};

// --- WHITEDAVIL AI ENGINE ---
async function runAI() {
    const q = document.getElementById('ai-query').value.trim();
    const r = document.getElementById('ai-response');
    if (!q) return;

    r.style.display = "block";
    r.innerHTML = "> ACCESSING_WHITEDAVIL_CORE...";

    try {
        history.push({ role: "user", parts: [{ text: q }] });
        const res = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: history })
        });
        const d = await res.json();

        if (d.error) throw new Error(d.error.message);

        const ans = d.candidates[0].content.parts[0].text;
        history.push({ role: "model", parts: [{ text: ans }] });

        if (vMode) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(ans);
            u.pitch = 0.9;
            window.speechSynthesis.speak(u);
        }

        let i = 0; r.innerHTML = "> ";
        const type = () => {
            if (i < ans.length) {
                r.innerHTML += ans.charAt(i);
                i++;
                setTimeout(type, 10);
            }
        };
        type();
    } catch (e) {
        r.innerHTML = `> ERROR: ${e.message || "CONNECTION_FAILED"}`;
    }
}

// --- KINETIC DOT BACKGROUND ---
const bg = document.getElementById('bgCanvas'), bctx = bg.getContext('2d');
let dots = [];

function init() {
    bg.width = window.innerWidth;
    bg.height = window.innerHeight;
    dots = [];
    for (let x = 0; x < bg.width; x += 35) {
        for (let y = 0; y < bg.height; y += 35) {
            dots.push({ x, y });
        }
    }
}

let m = { x: -1000, y: -1000 };
window.onmousemove = e => { m.x = e.clientX; m.y = e.clientY; };

function anim() {
    bctx.clearRect(0, 0, bg.width, bg.height);
    dots.forEach(d => {
        let dist = Math.hypot(m.x - d.x, m.y - d.y);
        let dark = document.body.classList.contains('dark');
        bctx.fillStyle = dist < 150 ? (dark ? '#fff' : '#000') : (dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)');
        bctx.beginPath();
        bctx.arc(d.x, d.y, dist < 150 ? 3 : 1.2, 0, Math.PI * 2);
        bctx.fill();
    });
    requestAnimationFrame(anim);
}

init(); anim();
window.onresize = init;
setInterval(() => {
    document.getElementById('live-clock').innerText = new Date().toLocaleTimeString('en-GB', { hour12: false });
}, 1000);
