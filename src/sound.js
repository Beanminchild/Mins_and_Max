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
    const t = a.currentTime;

    if (p === 'day') {
      const g = [392, 196, 247, 147], c = [330, 196, 262, 165];
      T((s % 32 < 16 ? g : c)[s % 4], t, 0.8, 'triangle', 0.06);
      delay = [200, 400, 100, 100][s % 4];
    } 
    else if (p === 'dawn') {
      if (s % 2 == 0) {
        [174, 220, 261, 349].forEach((f, i) => T(f, t + i * .02, 4, 'sine', 0.04));
        [0.8, 1.6, 2.4, 3.2].forEach(off => {
          T(784, t + off, 2, 'sine', 0.005); 
          T(392, t + off, 2, 'sine', 0.008); 
        });
      } else {
        [131, 165, 196, 262].forEach((f, i) => T(f, t + i * .02, 4, 'sine', 0.04));
      }
      delay = 4000;
    } 
    else if (p === 'evening' || p === 'dusk') {
      const chords = [[131, 196, 262, 330], [110, 220, 262, 330], [174, 174, 261, 349], [131, 196, 262, 330]];
      const ptn = [0, 1, 2, 3, 1, 2];
      T(chords[Math.floor(s / 6) % 4][ptn[s % 6]], t, 1.5, 'sine', 0.08);
      delay = 250; 
    } 
    else if (p === 'night') {
      // 74 BPM (810ms per beat). We use ~202ms ticks for 16th notes
      const isD6 = (s % 64 < 32);
      const sub = s % 32;

      if (sub === 0) {
        // Haunting low strum (D6 or Amaj7)
        const chord = isD6 ? [73, 110, 146, 185, 247] : [110, 165, 207, 247];
        chord.forEach((f, i) => T(f, t + i * 0.04, 8, 'sine', 0.03));
      }
      
      // Ethereal melodic ghost notes from your tab
      if (isD6) {
        if (sub === 12) T(987, t, 4, 'sine', 0.012);  // 7th fret B5
        if (sub === 16) T(932, t, 2, 'sine', 0.008);  // 6 (Bb5)
        if (sub === 18) T(880, t, 2, 'sine', 0.008);  // 5 (A5)
        if (sub === 20) T(830, t, 2, 'sine', 0.008);  // 4 (G#5)
      } else {
        if (sub === 12) T(739, t, 4, 'sine', 0.012);  // 2nd fret F#5
        if (sub === 16) T(659, t, 6, 'sine', 0.01);   // Open E5
      }
      delay = 202;
    }
    else {
      const notes = [220, 330, 440, 554];
      T(notes[s % 4], t, 1.2, 'sine', .08);
      id = setTimeout(tick, 800);
      return;
    }

    id = setTimeout(tick, delay);
    s++;
  };
  tick();
}