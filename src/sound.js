let a, m, id, I = _ => { a || (a = new AudioContext, m = a.createGain(), m.gain.value = .35, m.connect(a.destination)); a.resume() },
  T = (f, t, d, y, v, o, g) => {
    o = a.createOscillator(); g = a.createGain();
    o.type = y; o.frequency.value = f;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + .05);
    g.gain.exponentialRampToValueAtTime(1e-3, t + d);
    o.connect(g); g.connect(m); o.start(t); o.stop(t + d);
  };

export function sfx(n) {
  I(); let t = a.currentTime,
    s = { chop: [100, 70], water: [400, 500], pick: [400, 600], throw: [200], sleep: [150], success: [392, 523, 659, 784] }[n] || [220];
  s.forEach((f, i) => T(f, t + i * .15, n[0] == 's' ? .5 : .3, n[0] == 's' ? 'sine' : i ? 'sine' : 'triangle', .15));
}

export function playSong(p) {
  I(); clearTimeout(id);
  let s = 0, tick = () => {
    let t = a.currentTime, d = 800, u = s % 32, i = s % 64 < 32;
    if (p == 'day') {
      T((i ? [392, 196, 247, 147] : [330, 196, 262, 165])[s % 4], t, .8, 'triangle', .06);
      d = [200, 400, 100, 100][s % 4];
    }
    else if (p == 'dawn') {
      s % 2 ? [131, 165, 196, 262].forEach((f, j) => T(f, t + j * .02, 4, 'sine', .04))
        : ([174, 220, 261, 349].forEach((f, j) => T(f, t + j * .02, 4, 'sine', .04)),
          [0.8, 1.6, 2.4, 3.2].forEach(o => { T(784, t + o, 2, 'sine', .005); T(392, t + o, 2, 'sine', .008) }));
      d = 4000;
    }
    else if (p == 'dusk') {
      T([[131, 196, 262, 330], [110, 220, 262, 330], [174, 174, 261, 349], [131, 196, 262, 330]][s / 6 % 4 | 0][[0, 1, 2, 3, 1, 2][s % 6]], t, 1.5, 'sine', .08);
      d = 250;
    }
    else if (p == 'night') {
      !u && (i ? [73, 110, 146, 185, 247] : [110, 165, 207, 247]).forEach((f, j) => T(f, t + j * 0.04, 8, 'sine', .03));
      i ? (u == 12 && T(987, t, 4, 'sine', .012), u == 16 && T(932, t, 2, 'sine', .008), u == 18 && T(880, t, 2, 'sine', .008), u == 20 && T(830, t, 2, 'sine', .008))
        : (u == 12 && T(739, t, 4, 'sine', .012), u == 16 && T(659, t, 6, 'sine', .01));
      d = 202;
    }
    
    id = setTimeout(tick, d);
    s++;
  };
  tick();
}