/* Hilal Görevi — fizik çekirdeği ve otopilot.
 * Dünya merkezli, Ay'ın yörünge düzleminde (2B) kısıtlı üç cisim problemi:
 * Dünya + Ay kütle çekimi (dolaylı terim dahil), roket denklemi, atmosfer sürüklemesi,
 * irtifaya bağlı itki. Birimler SI (m, s, kg). */
(function (root) {
  'use strict';

  const G0 = 9.80665;
  const MU_E = 3.986004418e14, R_E = 6371000, OMEGA_E = 7.2921159e-5;
  const MU_M = 4.9048695e12, R_M = 1737400;
  const D_EM = 384400000;
  const N_M = Math.sqrt((MU_E + MU_M) / (D_EM * D_EM * D_EM));
  const RHO0 = 1.225, H_ATM = 8500, ATM_TOP = 140000;
  const SOI_M = 66100000;
  const K_IND = MU_M / (D_EM * D_EM * D_EM);
  const KE_IN = MU_E / (R_E * R_E * R_E), KM_IN = MU_M / (R_M * R_M * R_M);

  const PARK_ALT = 200000;
  const LLO_ALT = 110000;
  const PDI_ALT = 15000;
  const PAD_H = 12;        // rampa kaidesi yüksekliği (m)
  const LM_OFFSET = 81.5;  // yığında iniş aracının taban yüksekliği (m)

  const STAGES = [
    { id: 'S1', name: '1. kademe', dry: 44000, prop: 735000, fVac: 15.23e6, ispVac: 320, ispSL: 290, minThr: 0.6, area: 38.5 },
    { id: 'S2', name: '2. kademe', dry: 10000, prop: 175000, fVac: 2.2e6, ispVac: 440, ispSL: 360, minThr: 0.6, area: 38.5 },
    { id: 'S3', name: '3. kademe', dry: 3000, prop: 24000, fVac: 250e3, ispVac: 450, ispSL: 380, minThr: 1, area: 20 },
    { id: 'LM', name: 'Ayça', dry: 4500, prop: 10500, fVac: 45e3, ispVac: 315, ispSL: 250, minThr: 0.1, area: 12 },
  ];
  const FAIRING = 2000;
  for (const s of STAGES) {
    s.ve = s.ispVac * G0;
    s.mdot = s.fVac / s.ve;
    s.fSL = s.fVac * s.ispSL / s.ispVac;
  }

  let MOON0 = 150 * Math.PI / 180;
  // Güneş yönü: fizik düzleminde (x, y) + düzlem dışı z (three.js'de +Y)
  const SUN = (() => { const v = { x: 0.643, y: 0.724, z: 0.25 }; const n = Math.hypot(v.x, v.y, v.z); return { x: v.x / n, y: v.y / n, z: v.z / n }; })();

  function moonAngle(t) { return MOON0 + N_M * t; }
  function moonState(t) {
    const a = MOON0 + N_M * t, c = Math.cos(a), s = Math.sin(a);
    return { x: D_EM * c, y: D_EM * s, vx: -D_EM * N_M * s, vy: D_EM * N_M * c, a };
  }

  // ---- kuvvetler -------------------------------------------------------------
  const G = { ax: 0, ay: 0 };
  function grav(t, x, y) {
    const a = MOON0 + N_M * t;
    const mx = D_EM * Math.cos(a), my = D_EM * Math.sin(a);
    const r2 = x * x + y * y, r = Math.sqrt(r2);
    const k = r > R_E ? MU_E / (r2 * r) : KE_IN;
    const dx = x - mx, dy = y - my, d2 = dx * dx + dy * dy, d = Math.sqrt(d2);
    const km = d > R_M ? MU_M / (d2 * d) : KM_IN;
    G.ax = -k * x - km * dx - K_IND * mx;
    G.ay = -k * y - km * dy - K_IND * my;
  }

  function soundSpeed(h) { return h < 11000 ? 340 - 0.0041 * h : 295; }
  function cdMach(M) { return 0.28 + 0.32 * Math.exp(-Math.pow((M - 1.15) / 0.45, 2)) + (M > 1.15 ? 0.06 : 0); }

  // Kontrol: { thr, dx, dy, st } — st: aktif kademe indeksi (-1 = motor yok)
  // Durum dizisi: [x, y, vx, vy, m, dv]  (dv: itkiyle kazanılan ideal hız)
  function deriv(t, s, ctl, area, out) {
    const x = s[0], y = s[1], vx = s[2], vy = s[3], m = s[4];
    grav(t, x, y);
    let ax = G.ax, ay = G.ay, dm = 0, ddv = 0;
    const r = Math.sqrt(x * x + y * y), h = r - R_E;
    let p = 0;
    if (h < ATM_TOP) {
      const rho = RHO0 * Math.exp(-h / H_ATM);
      p = rho / RHO0;
      const wx = vx + OMEGA_E * y, wy = vy - OMEGA_E * x;
      const w = Math.sqrt(wx * wx + wy * wy);
      if (w > 0.01) {
        const D = 0.5 * rho * w * cdMach(w / soundSpeed(h)) * area / m;
        ax -= D * wx; ay -= D * wy;
      }
    }
    if (ctl && ctl.thr > 0 && ctl.st >= 0) {
      const S = STAGES[ctl.st];
      const F = ctl.thr * (S.fVac - (S.fVac - S.fSL) * p);
      const a = F / m;
      ax += a * ctl.dx; ay += a * ctl.dy;
      dm = -ctl.thr * S.mdot; ddv = a;
    }
    out[0] = vx; out[1] = vy; out[2] = ax; out[3] = ay; out[4] = dm; out[5] = ddv;
  }

  const k1 = new Float64Array(6), k2 = new Float64Array(6), k3 = new Float64Array(6), k4 = new Float64Array(6), tmp = new Float64Array(6);
  function rk4(t, s, dt, ctl, area) {
    deriv(t, s, ctl, area, k1);
    for (let i = 0; i < 6; i++) tmp[i] = s[i] + 0.5 * dt * k1[i];
    deriv(t + 0.5 * dt, tmp, ctl, area, k2);
    for (let i = 0; i < 6; i++) tmp[i] = s[i] + 0.5 * dt * k2[i];
    deriv(t + 0.5 * dt, tmp, ctl, area, k3);
    for (let i = 0; i < 6; i++) tmp[i] = s[i] + dt * k3[i];
    deriv(t + dt, tmp, ctl, area, k4);
    for (let i = 0; i < 6; i++) s[i] += dt / 6 * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
  }

  // Serbest uçuş için uyarlamalı adım
  function coastDt(t, s) {
    const x = s[0], y = s[1], vx = s[2], vy = s[3];
    const rE = Math.sqrt(x * x + y * y), vE = Math.sqrt(vx * vx + vy * vy) + 1;
    const M = moonState(t);
    const dx = x - M.x, dy = y - M.y, dvx = vx - M.vx, dvy = vy - M.vy;
    const rM = Math.sqrt(dx * dx + dy * dy), vM = Math.sqrt(dvx * dvx + dvy * dvy) + 1;
    let dt = 0.004 * Math.min(rE / vE, rM / vM);
    if (rE - R_E < ATM_TOP) dt = Math.min(dt, 0.5);
    return Math.max(0.02, Math.min(dt, 1800));
  }

  // ---- iki cisim yörünge elemanları ------------------------------------------
  function elements(mu, rx, ry, vx, vy) {
    const r = Math.sqrt(rx * rx + ry * ry), v2 = vx * vx + vy * vy;
    const eps = v2 / 2 - mu / r;
    const hz = rx * vy - ry * vx;
    const e = Math.sqrt(Math.max(0, 1 + 2 * eps * hz * hz / (mu * mu)));
    const p = hz * hz / mu;
    const rp = p / (1 + e);
    const ra = e < 1 ? p / (1 - e) : Infinity;
    const a = eps < 0 ? -mu / (2 * eps) : Infinity;
    const T = eps < 0 ? 2 * Math.PI * Math.sqrt(a * a * a / mu) : Infinity;
    const ex = ((v2 - mu / r) * rx - (rx * vx + ry * vy) * vx) / mu;
    const ey = ((v2 - mu / r) * ry - (rx * vx + ry * vy) * vy) / mu;
    return { r, eps, hz, e, rp, ra, a, T, argp: Math.atan2(ey, ex), vr: (rx * vx + ry * vy) / r };
  }

  function rel(t, s) {
    const M = moonState(t);
    return { x: s[0] - M.x, y: s[1] - M.y, vx: s[2] - M.vx, vy: s[3] - M.vy };
  }

  // ---- tahmin: Ay'a en yakın geçiş ----------------------------------------------
  // İşaretli perilune: hz>0 → Ay etrafında saat yönü tersine geçiş
  function predictPerilune(t0, s0, maxT) {
    const s = Float64Array.from(s0);
    let t = t0, best = Infinity, bestT = t0, bestSign = 1, seenClose = false, prev = Infinity;
    let bestS = null;
    while (t - t0 < maxT) {
      const dt = coastDt(t, s);
      rk4(t, s, dt, null, 1);
      t += dt;
      const R = rel(t, s);
      const d = Math.sqrt(R.x * R.x + R.y * R.y);
      if (d < best) { best = d; bestT = t; bestSign = Math.sign(R.x * R.vy - R.y * R.vx) || 1; bestS = Float64Array.from(s); }
      if (d < 90e6) seenClose = true;
      if (seenClose && d > prev && d < 90e6) break;
      const rE = Math.sqrt(s[0] * s[0] + s[1] * s[1]);
      if (rE < R_E + 60000 && t - t0 > 3600) { break; }
      prev = d;
    }
    return { rmin: best, signed: bestSign * best, t: bestT, s: bestS };
  }

  // ---- ateşleme simülasyonu (canlı ve planlayıcı ortak) ---------------------
  // Aracın kütle modelini tutan küçük yapı
  function stackMassAbove(st, fairing) {
    let m = fairing ? FAIRING : 0;
    for (let j = st + 1; j < STAGES.length; j++) m += STAGES[j].dry + STAGES[j].prop;
    return m;
  }
  function propOf(v) { return v.s[4] - stackMassAbove(v.st, v.fairing) - STAGES[v.st].dry; }

  // TLI: prograd, dvTarget'a ulaşınca kesme; gerekirse kademe ayırma (2 s boşluk)
  function tliBurnStep(v, dvTarget, events) {
    // v: {t, s, st, fairing, sepUntil}
    const dt0 = 0.1;
    if (v.sepUntil && v.t < v.sepUntil) {
      const dt = Math.min(dt0, v.sepUntil - v.t);
      rk4(v.t, v.s, dt, null, 20); v.t += dt; return false;
    }
    const S = STAGES[v.st];
    const vv = Math.hypot(v.s[2], v.s[3]);
    const a = S.fVac / v.s[4];
    const rem = dvTarget - v.s[5];
    let dt = Math.min(dt0, rem / a + 1e-6);
    const pr = propOf(v);
    const tProp = pr / S.mdot;
    if (tProp < dt) dt = Math.max(tProp, 1e-6);
    const ce = Math.cos(v.err || 0), se = Math.sin(v.err || 0);
    const ux = v.s[2] / vv, uy = v.s[3] / vv;
    const ctl = { thr: 1, dx: ux * ce - uy * se, dy: ux * se + uy * ce, st: v.st };
    rk4(v.t, v.s, dt, ctl, 20); v.t += dt;
    if (v.s[5] >= dvTarget - 1e-4) return true;
    if (propOf(v) <= 1e-3) {
      if (v.st >= 2) return true; // Ay aracını TLI için kullanma
      v.s[4] -= STAGES[v.st].dry + Math.max(0, propOf(v));
      v.st++; v.sepUntil = v.t + 2;
      if (events) events.push({ t: v.t, k: 'stage' });
    }
    return false;
  }

  function planTLI(t0, s0, st, fairing, opts) {
    opts = opts || {};
    const el = elements(MU_E, s0[0], s0[1], s0[2], s0[3]);
    const P = el.T;
    const minWait = opts.minWait ?? 600;
    const target = R_M + LLO_ALT;
    const dvList = opts.dvList || [3150, 3120, 3180, 3100, 3210];
    const tStart = t0 + minWait, tEnd = t0 + minWait + 1.25 * P;
    const step = 20;
    // Kıyı fazı durumlarını ızgarada hazırla
    const grid = [];
    {
      const s = Float64Array.from(s0); let t = t0;
      let next = tStart;
      while (next <= tEnd) {
        while (t < next - 1e-9) { const dt = Math.min(coastDt(t, s), next - t); rk4(t, s, dt, null, 20); t += dt; }
        grid.push({ t, s: Float64Array.from(s) });
        next += step;
      }
    }
    function evalAt(tb, sb, dv) {
      const v = { t: tb, s: Float64Array.from(sb), st, fairing: false, sepUntil: 0 };
      if (fairing) { v.s[4] -= FAIRING; }
      v.s[5] = 0;
      let n = 0;
      while (!tliBurnStep(v, dv) && n++ < 20000);
      const pr = predictPerilune(v.t, v.s, 7 * 86400);
      return pr;
    }
    function stateAt(tb) {
      // en yakın önceki ızgaradan yay
      let i = Math.min(grid.length - 1, Math.max(0, Math.floor((tb - tStart) / step)));
      const s = Float64Array.from(grid[i].s); let t = grid[i].t;
      while (t < tb - 1e-9) { const dt = Math.min(coastDt(t, s), tb - t); rk4(t, s, dt, null, 20); t += dt; }
      return s;
    }
    for (const dv of dvList) {
      const vals = grid.map(g => evalAt(g.t, g.s, dv).signed);
      let bestSol = null;
      for (const sign of [1, -1]) {
        const tg = sign * target;
        for (let i = 0; i + 1 < grid.length; i++) {
          const f0 = vals[i] - tg, f1 = vals[i + 1] - tg;
          if (!(f0 * f1 <= 0)) continue;
          if (Math.abs(vals[i]) > 60e6 || Math.abs(vals[i + 1]) > 60e6) continue;
          let a = grid[i].t, b = grid[i + 1].t, fa = f0;
          let pr = null, tb = a;
          for (let it = 0; it < 30; it++) {
            tb = 0.5 * (a + b);
            pr = evalAt(tb, stateAt(tb), dv);
            const f = pr.signed - tg;
            if (Math.abs(f) < 200) break;
            if (f * fa <= 0) b = tb; else { a = tb; fa = f; }
          }
          if (pr && Math.abs(pr.signed - tg) < 5000) {
            const pref = opts.preferSign || 0;
            const better = !bestSol || (pref && sign === pref && bestSol.sign !== pref) || ((!pref || sign === bestSol.sign) && tb < bestSol.tb);
            if (better) bestSol = { tb, dv, peri: pr, sign };
          }
          break;
        }
      }
      if (bestSol) return bestSol;
    }
    return null;
  }

  // Rota düzeltmesi: anlık Δv (2B) — minimum normlu Newton
  function planMCC(t0, s0, targetSigned) {
    let dvx = 0, dvy = 0;
    const f = (ax, ay) => {
      const s = Float64Array.from(s0); s[2] += ax; s[3] += ay;
      return predictPerilune(t0, s, 6 * 86400).signed;
    };
    let pr = null;
    for (let it = 0; it < 8; it++) {
      const f0 = f(dvx, dvy);
      const err = f0 - targetSigned;
      if (Math.abs(err) < 300) break;
      const e = 0.05;
      const gx = (f(dvx + e, dvy) - f0) / e, gy = (f(dvx, dvy + e) - f0) / e;
      const g2 = gx * gx + gy * gy;
      if (!(g2 > 0)) break;
      let sx = -err * gx / g2, sy = -err * gy / g2;
      const sn = Math.hypot(sx, sy);
      if (sn > 60) { sx *= 60 / sn; sy *= 60 / sn; }
      dvx += sx; dvy += sy;
    }
    const s = Float64Array.from(s0); s[2] += dvx; s[3] += dvy;
    pr = predictPerilune(t0, s, 6 * 86400);
    return { dvx, dvy, dv: Math.hypot(dvx, dvy), peri: pr };
  }

  function wrapPi(a) { a = (a + Math.PI) % (2 * Math.PI); if (a < 0) a += 2 * Math.PI; return a - Math.PI; }

  // ---- Görev ---------------------------------------------------------------
  const PHASES = {
    PRELAUNCH: 'Geri sayım',
    ASCENT: 'Yükseliş',
    PARKING: 'Park yörüngesi',
    TLI: 'Ay’a transfer ateşlemesi',
    TLC: 'Ay yolculuğu',
    MCC: 'Rota düzeltme',
    LOI: 'Ay yörüngesine giriş',
    LLO: 'Ay yörüngesi',
    DOI: 'Alçalma ateşlemesi',
    DESCENT: 'İnişe hazırlık',
    PDI: 'Motorlu iniş',
    LANDED: 'Ay’da',
    FAILED: 'Görev kaybı',
  };

  class Mission {
    constructor(opts) {
      opts = opts || {};
      this.t = -12;
      this.phase = 'PRELAUNCH';
      this.st = 0;
      this.fairing = true;
      const m0 = stackMassAbove(-1, true);
      this.s = new Float64Array([R_E, 0, 0, 0, m0, 0]);
      this.ctl = { thr: 0, dx: 1, dy: 0, st: 0 };
      this.events = [];
      this.onEvent = opts.onEvent || null;
      this.sepUntil = 0;
      this.maxQ = 0; this.maxQlogged = false; this.q = 0;
      this.nextEvent = { t: 0, name: 'Kalkış' };
      this.jettisoned = []; // görselleştirme için ayrılan parçalar
      this.legs = false;
      this.dvPlan = 0; this.mcc = null; this.plan = null;
      this.pdiSub = 'BRAKE';
      this.touch = null;
      this.sunDir = SUN;
      // TLI yönelim hatası (gerçekçi saçılma): rota düzeltmelerini anlamlı kılar
      this.tliErr = (opts.tliErr != null ? opts.tliErr : (Math.random() - 0.5) * 0.01);
      this.acc = 0;
      this.maxG = 0;
      this.padPos();
    }

    log(msg, kind) {
      const e = { t: this.t, msg, kind: kind || 'info' };
      this.events.push(e);
      if (this.onEvent) this.onEvent(e);
    }

    padPos() {
      const a = OMEGA_E * this.t;
      const c = Math.cos(a), s = Math.sin(a);
      const rr = R_E + PAD_H; this.s[0] = rr * c; this.s[1] = rr * s;
      this.s[2] = -OMEGA_E * rr * s; this.s[3] = OMEGA_E * rr * c;
      this.ctl.dx = c; this.ctl.dy = s; this.ctl.thr = 0;
    }

    mass() { return this.s[4]; }
    prop() { return propOf(this); }
    area() { return STAGES[this.st].area; }

    jettison(kind, extra) {
      this.jettisoned.push(Object.assign({ kind, t: this.t, s: Float64Array.from(this.s) }, extra || {}));
    }

    dropStage() {
      const S = STAGES[this.st];
      const left = Math.max(0, this.prop());
      this.s[4] -= S.dry + left;
      this.jettison(S.id);
      this.st++;
      this.sepUntil = this.t + 2;
    }

    // Kalan ideal Δv (aktif kademe + üstündekiler)
    dvRemaining() {
      let m = this.s[4], dv = 0;
      for (let j = this.st; j < STAGES.length; j++) {
        const S = STAGES[j];
        const pr = j === this.st ? Math.max(0, this.prop()) : S.prop;
        const fair = (this.fairing && j <= 1) ? 0 : 0;
        dv += S.ve * Math.log(m / (m - pr)) + fair;
        m -= pr + S.dry;
        if (j === 1 && this.fairing) m -= FAIRING;
      }
      return dv;
    }

    earthEl() { return elements(MU_E, this.s[0], this.s[1], this.s[2], this.s[3]); }
    moonRel() { return rel(this.t, this.s); }
    moonEl() { const R = this.moonRel(); return elements(MU_M, R.x, R.y, R.vx, R.vy); }

    // ---------- bir fizik adımı -----------
    step(maxDt) {
      const ph = this.phase;
      const s = this.s;
      if (ph === 'PRELAUNCH') {
        const dt = Math.min(maxDt, 0.05, -this.t);
        this.t += dt; this.padPos();
        if (this.t >= -3) { this.ctl.thr = Math.min(1, (this.t + 3) / 2.5) * 0.9; this.ctl.st = 0; }
        if (this.t >= -1e-9) {
          this.t = 0; this.padPos();
          this.phase = 'ASCENT';
          this.log('Kalkış! Kenetler açıldı.', 'major');
          this.nextEvent = null;
        }
        return dt;
      }
      if (ph === 'LANDED' || ph === 'FAILED') {
        const dt = Math.min(maxDt, 0.1);
        this.t += dt;
        if (ph === 'LANDED') this.stickToMoon();
        return dt;
      }
      if (ph === 'ASCENT') return this.stepAscent(maxDt);
      if (ph === 'TLI') return this.stepTLI(maxDt);
      if (ph === 'MCC') return this.stepMCC(maxDt);
      if (ph === 'LOI') return this.stepLOI(maxDt);
      if (ph === 'DOI') return this.stepDOI(maxDt);
      if (ph === 'PDI') return this.stepPDI(maxDt);
      return this.stepCoast(maxDt);
    }

    stepCoast(maxDt) {
      let dt = coastDt(this.t, this.s);
      if (this.nextEvent && this.nextEvent.t > this.t) dt = Math.min(dt, this.nextEvent.t - this.t);
      dt = Math.max(1e-6, Math.min(dt, maxDt));
      this.ctl.thr = 0;
      rk4(this.t, this.s, dt, null, this.area());
      this.t += dt;
      this.afterCoast();
      return dt;
    }

    afterCoast() {
      const ph = this.phase;
      const ne = this.nextEvent;
      if (ph === 'PARKING') {
        if (ne && this.t >= ne.t - 1e-6) {
          this.phase = 'TLI'; this.s[5] = 0; this.sepUntil = 0;
          if (this.fairing) { this.fairing = false; this.s[4] -= FAIRING; }
          this.log('TLI ateşlemesi başladı — hedef Δv ' + this.plan.dv.toFixed(0) + ' m/s', 'burn');
          this.nextEvent = null;
        }
      } else if (ph === 'TLC') {
        if (ne && this.t >= ne.t - 1e-6) this.startTlcEvent(ne);
      } else if (ph === 'LLO') {
        if (ne && this.t >= ne.t - 1e-6) {
          this.phase = 'DOI';
          this.log('Alçalma yörüngesi ateşlemesi (DOI)', 'burn');
          this.nextEvent = null;
        }
      } else if (ph === 'DESCENT') {
        const R = this.moonRel();
        const r = Math.hypot(R.x, R.y), h = r - R_M;
        const vr = (R.x * R.vx + R.y * R.vy) / r;
        if (h < 25000 && vr > -4) {
          this.phase = 'PDI'; this.pdiSub = 'BRAKE';
          this.log('Motorlu iniş başladı (PDI) — irtifa ' + (h / 1000).toFixed(1) + ' km', 'major');
          this.nextEvent = null;
        }
      }
      this.checkCrash();
    }

    checkCrash() {
      const rE = Math.hypot(this.s[0], this.s[1]);
      if (rE < R_E && this.phase !== 'PRELAUNCH') { this.fail('Araç Dünya’ya düştü.'); }
      const R = this.moonRel();
      if (Math.hypot(R.x, R.y) < R_M && this.phase !== 'LANDED' && this.phase !== 'PDI') this.fail('Araç Ay yüzeyine çarptı.');
    }

    fail(msg) { if (this.phase !== 'FAILED') { this.phase = 'FAILED'; this.log(msg, 'fail'); this.nextEvent = null; } }

    // ---------- yükseliş -----------
    stepAscent(maxDt) {
      const s = this.s;
      const r = Math.hypot(s[0], s[1]), h = r - R_E;
      const dt = Math.min(maxDt, h < 80000 ? 0.05 : 0.1);
      const ux = s[0] / r, uy = s[1] / r, ex = -uy, ey = ux;
      const sx = s[2] + OMEGA_E * s[1], sy = s[3] - OMEGA_E * s[0];
      const vsN = Math.hypot(sx, sy);
      if (this.sepUntil > this.t) {
        this.ctl.thr = 0;
      } else {
        const S = STAGES[this.st];
        let dx = ux, dy = uy;
        if (this.st === 0) {
          if (vsN > 55) {
            if (this.kickT == null) this.kickT = this.t;
            const KICK = 5.2 * Math.PI / 180;
            const kick = Math.min(KICK, KICK * (this.t - this.kickT) / 8);
            const vsAng = Math.acos(Math.max(-1, Math.min(1, (sx * ux + sy * uy) / vsN)));
            const th = Math.max(kick, vsAng);
            dx = Math.cos(th) * ux + Math.sin(th) * ex; dy = Math.cos(th) * uy + Math.sin(th) * ey;
          }
        } else {
          const vz = s[2] * ux + s[3] * uy, vt = s[2] * ex + s[3] * ey;
          const gEff = MU_E / (r * r) - vt * vt / r;
          const aT = S.fVac / s[4];
          const vzDes = Math.max(-60, Math.min(300, (PARK_ALT - h) / 90));
          let az = gEff + 0.06 * (vzDes - vz);
          az = Math.max(-0.4 * aT, Math.min(0.9 * aT, az));
          const at = Math.sqrt(Math.max(0, aT * aT - az * az));
          dx = (az * ux + at * ex) / aT; dy = (az * uy + at * ey) / aT;
        }
        let F = S.fVac;
        let thr = 1;
        if (S.minThr < 1) thr = Math.max(S.minThr, Math.min(1, 4 * G0 * s[4] / F));
        this.ctl.thr = thr; this.ctl.dx = dx; this.ctl.dy = dy; this.ctl.st = this.st;
      }
      // tek adım, yakıt bitişini aşmadan
      let step = dt;
      if (this.ctl.thr > 0) {
        const tp = this.prop() / (this.ctl.thr * STAGES[this.st].mdot);
        if (tp < step) step = Math.max(tp, 1e-4);
      } else if (this.sepUntil > this.t) step = Math.min(step, this.sepUntil - this.t);
      rk4(this.t, s, step, this.ctl.thr > 0 ? this.ctl : null, this.area());
      this.t += step;
      this.trackQ();
      const hh = Math.hypot(s[0], s[1]) - R_E;
      if (this.fairing && hh > 110000) {
        this.fairing = false; s[4] -= FAIRING; this.jettison('FAIRING');
        this.log('Burun konisi atıldı', 'info');
      }
      if (this.ctl.thr > 0 && this.prop() <= 1e-3) {
        const nm = STAGES[this.st].name;
        this.dropStage();
        this.ctl.thr = 0;
        this.log(nm + ' tükendi ve ayrıldı', 'stage');
        if (this.st >= 3) this.fail('Yörüngeye ulaşılamadı.');
      }
      if (this.st >= 1) {
        const el = this.earthEl();
        if (el.rp - R_E > PARK_ALT - 12000) {
          this.ctl.thr = 0;
          this.phase = 'PARKING';
          this.log('Park yörüngesinde: ' + ((el.rp - R_E) / 1000).toFixed(0) + ' × ' + ((el.ra - R_E) / 1000).toFixed(0) + ' km', 'major');
          this.parkT = this.t;
          this.planTLI();
        }
      }
      if (hh < -1) this.fail('Araç yükselişte düştü.');
      return step;
    }

    trackQ() {
      const s = this.s; const r = Math.hypot(s[0], s[1]), h = r - R_E;
      if (h > ATM_TOP) { this.q = 0; return; }
      const wx = s[2] + OMEGA_E * s[1], wy = s[3] - OMEGA_E * s[0];
      this.q = 0.5 * RHO0 * Math.exp(-h / H_ATM) * (wx * wx + wy * wy);
      if (this.q > this.maxQ) this.maxQ = this.q;
      else if (!this.maxQlogged && this.maxQ > 5000 && this.q < this.maxQ * 0.97) {
        this.maxQlogged = true;
        this.log('Maks-Q geçildi: ' + (this.maxQ / 1000).toFixed(1) + ' kPa', 'info');
      }
    }

    planTLI() {
      const sol = planTLI(this.t, this.s, this.st, this.fairing, { preferSign: -1 });
      if (!sol) { this.fail('TLI çözümü bulunamadı.'); return; }
      this.plan = sol;
      this.nextEvent = { t: sol.tb, name: 'TLI ateşlemesi' };
      this.log('TLI planlandı: Δv ' + sol.dv.toFixed(0) + ' m/s, Ay’a varış ~' + ((sol.peri.t - sol.tb) / 3600).toFixed(1) + ' sa sonra', 'plan');
    }

    stepTLI(maxDt) {
      const v = { t: this.t, s: this.s, st: this.st, fairing: false, sepUntil: this.sepUntil, err: this.tliErr };
      const ev = [];
      const t0 = this.t;
      const done = tliBurnStep(v, this.plan.dv, ev);
      this.t = v.t; this.st = v.st; this.sepUntil = v.sepUntil;
      const S = STAGES[this.st];
      const vv = Math.hypot(this.s[2], this.s[3]);
      this.ctl = { thr: this.sepUntil > this.t ? 0 : 1, dx: this.s[2] / vv, dy: this.s[3] / vv, st: this.st };
      if (ev.length) { this.jettison(STAGES[this.st - 1].id); this.log(STAGES[this.st - 1].name + ' tükendi ve ayrıldı', 'stage'); }
      if (done) {
        this.ctl.thr = 0;
        this.log('TLI tamamlandı — hız ' + (vv / 1000).toFixed(2) + ' km/s', 'major');
        // Kademeleri at
        while (this.st < 3) {
          const Sx = STAGES[this.st];
          const left = Math.max(0, this.prop());
          this.s[4] -= Sx.dry + left;
          this.jettison(Sx.id);
          this.st++;
        }
        // referans noktasını iniş aracının ayak tabanına taşı (görsel yığın ofseti)
        { const vx = this.s[2] / vv, vy = this.s[3] / vv; this.s[0] += vx * LM_OFFSET; this.s[1] += vy * LM_OFFSET; this.lmSep = { dx: vx, dy: vy }; }
        this.log('Ayça iniş aracı roketten ayrıldı', 'stage');
        this.phase = 'TLC';
        this.tliEnd = this.t;
        this.nextEvent = { t: this.t + 3 * 3600, name: '1. rota düzeltme', kind: 'MCC1' };
      }
      return this.t - t0;
    }

    startTlcEvent(ne) {
      if (ne.kind === 'MCC1' || ne.kind === 'MCC2') {
        const tg = this.plan.sign * (R_M + LLO_ALT);
        const m = planMCC(this.t, this.s, tg);
        this.mcc = { dvx: m.dvx, dvy: m.dvy, dv: m.dv, done: 0, label: ne.kind === 'MCC1' ? '1.' : '2.' };
        this.predPeri = m.peri;
        if (m.dv < 0.3) {
          this.log(this.mcc.label + ' rota düzeltme gereksiz (Δv ' + m.dv.toFixed(2) + ' m/s)', 'plan');
          this.afterMCC();
        } else {
          this.phase = 'MCC'; this.s[5] = 0;
          this.log(this.mcc.label + ' rota düzeltme ateşlemesi: Δv ' + m.dv.toFixed(1) + ' m/s', 'burn');
          this.nextEvent = null;
        }
      } else if (ne.kind === 'LOI') {
        this.phase = 'LOI';
        this.log('Ay yörüngesine giriş ateşlemesi (LOI)', 'burn');
        this.nextEvent = null;
      }
    }

    afterMCC() {
      this.phase = 'TLC';
      const pr = predictPerilune(this.t, this.s, 6 * 86400);
      this.predPeri = pr;
      if (this.mcc.label === '1.') {
        this.nextEvent = { t: Math.max(this.t + 600, pr.t - 9 * 3600), name: '2. rota düzeltme', kind: 'MCC2' };
      } else {
        this.scheduleLOI(pr);
      }
    }

    scheduleLOI(pr) {
      const M = moonState(pr.t);
      const vx = pr.s[2] - M.vx, vy = pr.s[3] - M.vy;
      const vp = Math.hypot(vx, vy), rp = pr.rmin;
      const vc = Math.sqrt(MU_M / rp);
      const dv = vp - vc;
      const S = STAGES[3];
      const m0 = this.s[4];
      const tb = (m0 - m0 * Math.exp(-dv / S.ve)) / S.mdot;
      this.nextEvent = { t: pr.t - 0.5 * tb, name: 'Ay yörüngesine giriş', kind: 'LOI' };
      this.log('Ay’a en yakın geçiş: ' + ((rp - R_M) / 1000).toFixed(0) + ' km irtifa, LOI Δv ≈ ' + dv.toFixed(0) + ' m/s', 'plan');
    }

    stepMCC(maxDt) {
      const S = STAGES[3], m = this.mcc;
      const ux = m.dvx / m.dv, uy = m.dvy / m.dv;
      const thr = Math.max(0.1, Math.min(1, m.dv * this.s[4] / (S.fVac * 6)));
      const a = thr * S.fVac / this.s[4];
      const rem = m.dv - this.s[5];
      const dt = Math.min(maxDt, 0.1, rem / a + 1e-6);
      this.ctl = { thr, dx: ux, dy: uy, st: 3 };
      rk4(this.t, this.s, dt, this.ctl, 12); this.t += dt;
      if (this.s[5] >= m.dv - 1e-4) {
        this.ctl.thr = 0;
        this.log(m.label + ' rota düzeltme tamamlandı', 'info');
        this.afterMCC();
      }
      return dt;
    }

    stepLOI(maxDt) {
      const S = STAGES[3];
      const R = this.moonRel();
      const vr = Math.hypot(R.vx, R.vy);
      this.ctl = { thr: 1, dx: -R.vx / vr, dy: -R.vy / vr, st: 3 };
      const dt = Math.min(maxDt, 0.1);
      rk4(this.t, this.s, dt, this.ctl, 12); this.t += dt;
      const el = this.moonEl();
      const epsT = -MU_M / (2 * (R_M + LLO_ALT));
      if (el.eps <= epsT || this.prop() < 3500) {
        this.ctl.thr = 0;
        this.phase = 'LLO';
        this.loiEnd = this.t;
        this.log('Ay yörüngesinde: ' + ((el.rp - R_M) / 1000).toFixed(0) + ' × ' + ((el.ra - R_M) / 1000).toFixed(0) + ' km', 'major');
        this.scheduleDOI();
      }
      this.checkCrash();
      return dt;
    }

    // Güneş ~24° yükseklikte ve aracın arkasında olacak şekilde iniş yeri seç;
    // DOI zamanını, ateşleme sonrası periapsis + frenleme yayı hedefe denk gelecek şekilde ara
    scheduleDOI() {
      const sun = this.sunDir; // {x,y,z} fizik düzleminde (x,y), z düzlem dışı
      const el0 = this.moonEl();
      const sigma = Math.sign(el0.hz) || 1;
      const rho = Math.hypot(sun.x, sun.y);
      const beta = Math.atan2(sun.y, sun.x);
      const sinE = Math.min(0.95 * rho, Math.sin(24 * Math.PI / 180));
      const dA = Math.acos(sinE / rho);
      let site = beta + dA;
      if (sigma * Math.sin(beta - site) >= 0) site = beta - dA;
      const BRAKE_ARC = 0.168; // frenleme süresince katedilen açı (~9.6°, test uçuşlarından)
      const s = Float64Array.from(this.s); let t = this.t;
      const tMin = this.t + 1500, tMax = tMin + el0.T * 1.02;
      let best = null;
      for (let tc = tMin; tc <= tMax; tc += 15) {
        while (t < tc - 1e-9) { const dt = Math.min(coastDt(t, s), tc - t); rk4(t, s, dt, null, 12); t += dt; }
        const R = rel(t, s);
        let lo = 0, hi = 0.05;
        for (let i = 0; i < 40; i++) {
          const k = 0.5 * (lo + hi);
          const e = elements(MU_M, R.x, R.y, R.vx * (1 - k), R.vy * (1 - k));
          if (e.rp - R_M > PDI_ALT) lo = k; else hi = k;
        }
        const e = elements(MU_M, R.x, R.y, R.vx * (1 - hi), R.vy * (1 - hi));
        const land = e.argp + sigma * BRAKE_ARC;
        const err = Math.abs(wrapPi(land - site));
        if (!best || err < best.err) best = { t: tc, err };
      }
      this.siteAngle = site;
      this.nextEvent = { t: best.t, name: 'Alçalma ateşlemesi (DOI)', kind: 'DOI' };
    }

    stepDOI(maxDt) {
      const R = this.moonRel();
      const vr = Math.hypot(R.vx, R.vy);
      this.ctl = { thr: 0.3, dx: -R.vx / vr, dy: -R.vy / vr, st: 3 };
      const dt = Math.min(maxDt, 0.05);
      rk4(this.t, this.s, dt, this.ctl, 12); this.t += dt;
      const el = this.moonEl();
      if (el.rp - R_M <= PDI_ALT) {
        this.ctl.thr = 0;
        this.phase = 'DESCENT';
        this.legs = true;
        this.log('İniş yörüngesi: periapsis ' + ((el.rp - R_M) / 1000).toFixed(1) + ' km — iniş ayakları açıldı', 'info');
        const tp = el.T / 2;
        this.nextEvent = { t: this.t + tp * 0.97, name: 'Motorlu iniş (PDI)', kind: 'PDI' };
      }
      return dt;
    }

    stepPDI(maxDt) {
      const S = STAGES[3];
      const R = this.moonRel();
      const r = Math.hypot(R.x, R.y), h = r - R_M;
      const ux = R.x / r, uy = R.y / r, tx = -uy, ty = ux;
      const vsx = R.vx + N_M * R.y, vsy = R.vy - N_M * R.x;
      const vz = vsx * ux + vsy * uy, vh = vsx * tx + vsy * ty;
      const vti = R.vx * tx + R.vy * ty;
      const gEff = MU_M / (r * r) - vti * vti / r;
      const aMax = S.fVac / this.s[4];
      let az, ah;
      if (this.pdiSub === 'BRAKE' && Math.abs(vh) < 35) { this.pdiSub = 'APPROACH'; this.log('Yaklaşma evresi — irtifa ' + h.toFixed(0) + ' m', 'info'); }
      if (this.pdiSub === 'APPROACH' && h < 150) { this.pdiSub = 'TERMINAL'; this.log('Son alçalma — yüzeye 150 m', 'info'); }
      if (this.pdiSub === 'BRAKE') {
        const tBrake = Math.abs(vh) / (0.9 * aMax);
        const hGate = 700;
        let vzDes = -(h - hGate) / Math.max(tBrake, 5);
        vzDes = Math.max(-70, Math.min(3, vzDes));
        const lim = Math.min(Math.sqrt(2 * 0.35 * Math.max(0.2, aMax - MU_M / (r * r)) * Math.max(0, h - 200)), 0.02 * h + 8);
        vzDes = Math.max(vzDes, -lim);
        az = gEff + 0.2 * (vzDes - vz);
        az = Math.max(-0.5 * aMax, Math.min(0.95 * aMax, az));
        ah = -Math.sign(vh) * Math.sqrt(Math.max(0, aMax * aMax - az * az));
      } else {
        const gm = MU_M / (r * r);
        let vzDes = -Math.min(Math.sqrt(2 * 0.4 * Math.max(0.2, aMax - gm) * Math.max(0, h)), 0.07 * h + 0.9);
        az = gEff + 0.8 * (vzDes - vz);
        ah = -0.5 * vh;
        const ahMax = 0.5 * aMax;
        ah = Math.max(-ahMax, Math.min(ahMax, ah));
        az = Math.max(0, Math.min(Math.sqrt(aMax * aMax - ah * ah), az));
      }
      const a = Math.hypot(az, ah) || 1e-6;
      const thr = Math.max(S.minThr, Math.min(1, a / aMax));
      this.ctl = { thr, dx: (az * ux + ah * tx) / a, dy: (az * uy + ah * ty) / a, st: 3 };
      if (this.prop() <= 1) { this.ctl.thr = 0; }
      const dt = Math.min(maxDt, h < 300 ? 0.02 : 0.05);
      rk4(this.t, this.s, dt, this.ctl.thr > 0 ? this.ctl : null, 12); this.t += dt;
      const R2 = this.moonRel();
      const r2 = Math.hypot(R2.x, R2.y);
      if (r2 <= R_M) {
        const u2x = R2.x / r2, u2y = R2.y / r2;
        const sx = R2.vx + N_M * R2.y, sy = R2.vy - N_M * R2.x;
        const vzT = sx * u2x + sy * u2y, vhT = sx * -u2y + sy * u2x;
        this.touch = { vz: vzT, vh: vhT, t: this.t, prop: this.prop(), ang: Math.atan2(R2.y, R2.x) - (moonAngle(this.t) + Math.PI) };
        this.ctl.thr = 0;
        if (Math.abs(vzT) < 3 && Math.abs(vhT) < 1.5) {
          this.phase = 'LANDED';
          this.log('Temas! Ayça Ay’a indi — dikey ' + Math.abs(vzT).toFixed(2) + ' m/s', 'land');
        } else {
          this.phase = 'FAILED';
          this.log('Sert iniş: ' + Math.abs(vzT).toFixed(1) + ' m/s', 'fail');
        }
        this.landLocal = { ang: Math.atan2(R2.y, R2.x) - moonAngle(this.t) };
        this.stickToMoon();
      }
      return dt;
    }

    stickToMoon() {
      const M = moonState(this.t);
      const a = this.landLocal.ang + moonAngle(this.t);
      const c = Math.cos(a), s = Math.sin(a);
      this.s[0] = M.x + R_M * c; this.s[1] = M.y + R_M * s;
      this.s[2] = M.vx - N_M * R_M * s; this.s[3] = M.vy + N_M * R_M * c;
      this.ctl.dx = c; this.ctl.dy = s; this.ctl.thr = 0;
    }

    // Belirli bir simülasyon süresi ilerle (adım sınırlı)
    advance(simDt, maxSteps) {
      let done = 0, n = 0;
      while (done < simDt - 1e-9 && n < maxSteps) {
        const d = this.step(simDt - done);
        done += d; n++;
        if (this.phase === 'FAILED' && !this.failHandled) { this.failHandled = true; }
      }
      return done;
    }

    telemetry() {
      const s = this.s;
      const rE = Math.hypot(s[0], s[1]);
      const R = this.moonRel();
      const rM = Math.hypot(R.x, R.y);
      const nearMoon = rM < SOI_M;
      const out = { phase: this.phase, phaseName: PHASES[this.phase], t: this.t, mass: s[4], st: this.st };
      if (nearMoon) {
        out.body = 'Ay';
        out.alt = rM - R_M;
        const el = elements(MU_M, R.x, R.y, R.vx, R.vy);
        out.el = el;
        const sx = R.vx + N_M * R.y, sy = R.vy - N_M * R.x;
        out.vSurf = Math.hypot(sx, sy);
        out.v = Math.hypot(R.vx, R.vy);
        out.vz = (R.x * R.vx + R.y * R.vy) / rM;
        out.ap = el.ra - R_M; out.pe = el.rp - R_M;
      } else {
        out.body = 'Dünya';
        out.alt = rE - R_E;
        const el = elements(MU_E, s[0], s[1], s[2], s[3]);
        out.el = el;
        const sx = s[2] + OMEGA_E * s[1], sy = s[3] - OMEGA_E * s[0];
        out.vSurf = Math.hypot(sx, sy);
        out.v = Math.hypot(s[2], s[3]);
        out.vz = (s[0] * s[2] + s[1] * s[3]) / rE;
        out.ap = el.ra - R_E; out.pe = el.rp - R_E;
      }
      out.distE = rE - R_E; out.distM = rM - R_M;
      out.q = this.q;
      out.thr = this.ctl.thr;
      // ivme (itki + sürükleme; kütle çekimi hissedilmez)
      if (this.ctl.thr > 0 && this.ctl.st >= 0) {
        const S = STAGES[this.ctl.st];
        const p = rE - R_E < ATM_TOP ? Math.exp(-(rE - R_E) / H_ATM) : 0;
        out.accel = this.ctl.thr * (S.fVac - (S.fVac - S.fSL) * p) / s[4];
      } else out.accel = 0;
      out.dvLeft = this.dvRemaining();
      out.prop = this.prop();
      return out;
    }
  }

  const Core = {
    G0, MU_E, R_E, OMEGA_E, MU_M, R_M, D_EM, N_M, SOI_M, ATM_TOP, H_ATM, STAGES, FAIRING, PHASES,
    PARK_ALT, LLO_ALT, SUN, PAD_H, LM_OFFSET,
    moonState, moonAngle, elements, predictPerilune, coastDt, rk4, grav, G,
    setMoon0(a) { MOON0 = a; }, getMoon0() { return MOON0; },
    Mission, stackMassAbove,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Core;
  else root.Core = Core;
})(typeof window !== 'undefined' ? window : globalThis);
