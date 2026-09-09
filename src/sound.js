let a, m, id;
const I = _ => { if (!a) { a = new (window.AudioContext || window.webkitAudioContext)(); m = a.createGain(); m.gain.value = .35; m.connect(a.destination) } a.state == 'suspended' && a.resume() };

const T = (f, t, d, ty, v) => {
  const o = a.createOscillator(), g = a.createGain();
  o.type = ty; o.frequency.value = f;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(v, t + .05);
  g.gain.exponentialRampToValueAtTime(1e-3, t + d);
  o.connect(g); g.connect(m); o.start(t); o.stop(t + d);
};

export function sfx(n) {
  I(); const t = a.currentTime;
  const s = { chop:[100,70], water:[400,500], pick:[400,600], throw:[200], sleep:[150], success:[392,523,659,784] };
  (s[n]||[220]).forEach((f,i) => T(f, t + i*.15, n=='success'? .5 : .3, n=='success'?'sine':i?'sine':'triangle', .15));
}



export function playSong(p) {
  I(); clearTimeout(id);
  let s = 0;
  const tick = () => {
    let delay = 800;
    if (p === 'day') {
      // G Major pattern then C Major pattern, each for 4 measures (16 notes)
      const g = [392, 196, 247, 147], c = [330, 196, 262, 165];
      T((s % 32 < 16 ? g : c)[s % 4], a.currentTime, 0.8, 'triangle', 0.06);
      // Rhythm: pluck, pluck, (pause), pluck-pluck
      delay = [200, 400, 100, 100][s % 4];
    } else {
      const chords = { dawn:[392,523,659,784], night:[196,261,330,392] };
      const notes = chords[p] || [220,330,440,554];
      T(notes[s % 4], a.currentTime, 1.2, 'sine', .08);
      T(notes[(s + 1) % 4] * 2, a.currentTime + .2, .6, 'triangle', .04);
      delay = 800;
    }
    id = setTimeout(tick, delay);
    s++;
  };
  tick();
}