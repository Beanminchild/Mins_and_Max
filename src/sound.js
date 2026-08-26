let actx, master, musicTimer = null;
const A = () => {
  if (!actx) {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    master = actx.createGain();
    master.gain.value = 0.35;
    master.connect(actx.destination);
  }
  if (actx.state === 'suspended') actx.resume();
};
function tone(f, t, d, type = 'square', v = 0.2) {
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + d);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + d);
}
export function sfx(n) {
  A(); const t = actx.currentTime;
  if (n === 'chop') { tone(120, t, 0.1, 'square', 0.3); tone(80, t + 0.06, 0.12, 'square', 0.2); }
  else if (n === 'water') { tone(500, t, 0.08, 'sine', 0.2); tone(700, t + 0.06, 0.1, 'sine', 0.15); }
  else if (n === 'pick') { tone(600, t, 0.08, 'triangle', 0.2); tone(900, t + 0.07, 0.1, 'triangle', 0.15); }
  else if (n === 'throw') { tone(300, t, 0.12, 'sawtooth', 0.15); }
  else if (n === 'sleep') { tone(200, t, 0.5, 'sine', 0.2); }
  else if (n === 'success') {
    tone(523.25, t, 0.15, 'sine', 0.15);
    tone(659.25, t + 0.10, 0.15, 'sine', 0.15);
    tone(783.99, t + 0.20, 0.25, 'sine', 0.18);
    tone(1046.5, t + 0.32, 0.35, 'triangle', 0.12);
  }
}

const TRACKS = {
  dawn:  { n: [262, 330, 392, 330], t: 'triangle' },
  day:   { n: [262, 294, 349, 392, 440], t: 'triangle' },
  dusk:  { n: [294, 247, 196, 247], t: 'triangle' },
  night: { n: [262, 196, 131, 196], t: 'sine' }
};

export function playSong(p) {
  A();
  if (musicTimer) clearInterval(musicTimer);
  const tr = TRACKS[p] || TRACKS.day;
  let i = 0;
  musicTimer = setInterval(() => {
    if (!actx) return;
    const t = actx.currentTime;
    tone(tr.n[i % tr.n.length], t, 0.4, tr.t, 0.1);
    if (i % 2 === 0) tone(tr.n[(i / 2) % tr.n.length] / 2, t, 0.5, tr.t, 0.07);
    i++;
  }, 420);
}