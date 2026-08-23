let actx, master, musicTimer = null;
const A = () => {
  if (!actx) {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    master = actx.createGain();
    master.gain.value = 0.45;
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
}
export function playSong(p) {
  A();
  if (musicTimer) clearInterval(musicTimer);
  const S = {
    dawn: [131, 165, 196, 262],
    day: [262, 294, 330, 392, 330],
    dusk: [196, 175, 147, 131],
    night: [131, 98, 110, 98]
  };
  const T = { dawn: 'triangle', day: 'square', dusk: 'square', night: 'sine' };
  const seq = S[p] || S.day, ty = T[p] || 'square';
  let i = 0;
  musicTimer = setInterval(() => {
    if (!actx) return;
    tone(seq[i % seq.length], actx.currentTime, 0.25, ty, 0.12);
    if (i % 2) tone(seq[(i + 2) % seq.length] / 2, actx.currentTime, 0.2, ty, 0.08);
    i++;
  }, 350);
}