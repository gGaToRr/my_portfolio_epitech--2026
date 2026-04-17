import React, { useEffect, useRef, useCallback, useState } from 'react';

const STEPS = 500;

const NetworkAnimation = () => {
  const stageRef = useRef(null);
  const svgRef = useRef(null);
  const animationRef = useRef(null);
  const statsRef = useRef({ packets: 0, mb: 0 });
  const [stats, setStats] = useState({ packets: 0, mb: 0, uptime: 0 });
  const startTimeRef = useRef(Date.now());

  const draw = useCallback(() => {
    const stage = stageRef.current;
    const svg = svgRef.current;
    if (!stage || !svg) return;

    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const NS = 'http://www.w3.org/2000/svg';

    function mk(tag, attrs, parent) {
      const el = document.createElementNS(NS, tag);
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
      if (parent) parent.appendChild(el);
      return el;
    }

    function labelEl(content, attrs, parent) {
      const el = mk('text', attrs, parent);
      el.textContent = content;
      return el;
    }

    function precomputeBezier(x0, y0, cp1x, cp1y, cp2x, cp2y, x1, y1) {
      const points = new Float32Array(STEPS * 2);
      for (let i = 0; i < STEPS; i++) {
        const t = i / STEPS;
        const u = 1 - t;
        points[i * 2]     = u * u * u * x0 + 3 * u * u * t * cp1x + 3 * u * t * t * cp2x + t * t * t * x1;
        points[i * 2 + 1] = u * u * u * y0 + 3 * u * u * t * cp1y + 3 * u * t * t * cp2y + t * t * t * y1;
      }
      return points;
    }

    const W = stage.clientWidth;
    const H = Math.max(100, W * 0.18);
    stage.style.height = H + 'px';
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    const SX = W * 0.1;
    const SY = H / 2;
    const CX = W * 0.9;
    const N = 4;
    const mid = (CX - SX) * 0.4;
    const scale = Math.min(W / 600, 1.4);

    const DEVICES = [
      { lbl: 'Laptop',  stroke: '#60a5fa', fill: 'rgba(59,130,246,0.2)',  dot: '#60a5fa' },
      { lbl: 'Laptop',  stroke: '#4ade80', fill: 'rgba(34,197,94,0.2)',   dot: '#4ade80' },
      { lbl: 'Laptop',  stroke: '#a78bfa', fill: 'rgba(139,92,246,0.2)',  dot: '#a78bfa' },
      { lbl: 'Laptop',  stroke: '#f87171', fill: 'rgba(239,68,68,0.2)',   dot: '#f87171' },
    ];

    const cys = Array.from({ length: N }, (_, i) => H / 2 + (i - (N - 1) / 2) * (H * 0.22));
    const clients = cys.map((y, i) => ({ x: CX, y, ...DEVICES[i] }));

    svg.innerHTML = '';

    const startX = SX + 24 * scale;
    const endOffset = 22 * scale;
    const curves = clients.map(n => precomputeBezier(
      startX, SY,
      startX + mid, SY,
      CX - endOffset - mid, n.y,
      CX - endOffset, n.y
    ));

    clients.forEach(n => {
      const d = `M${startX} ${SY} C${startX + mid} ${SY} ${CX - endOffset - mid} ${n.y} ${CX - endOffset} ${n.y}`;
      mk('path', { d, fill: 'none', stroke: n.stroke, 'stroke-width': 3 * scale, opacity: '0.1' }, svg);
      mk('path', { d, fill: 'none', stroke: n.stroke, 'stroke-width': 1.5 * scale, opacity: '0.35' }, svg);
    });

    const drawServer = (x, y) => {
      const g = mk('g', {}, svg);
      const sw = 40 * scale, sh = 56 * scale, sx = x - sw / 2, sy = y - sh / 2;
      mk('rect', { x: sx, y: sy, width: sw, height: sh, rx: 4 * scale, fill: 'rgba(59,130,246,0.15)', stroke: '#60a5fa', 'stroke-width': 2 * scale }, g);
      for (let i = 0; i < 4; i++) {
        const ry = sy + 5 * scale + i * 12 * scale;
        mk('rect', { x: sx + 4 * scale, y: ry, width: sw - 8 * scale, height: 8 * scale, rx: 1.5, fill: 'rgba(96,165,250,0.1)', stroke: '#60a5fa', 'stroke-width': 0.8 * scale }, g);
        mk('circle', { cx: sx + 9 * scale, cy: ry + 4 * scale, r: 2 * scale, fill: '#60a5fa' }, g);
        mk('circle', { cx: sx + 15 * scale, cy: ry + 4 * scale, r: 1.2 * scale, fill: '#60a5fa', opacity: '0.5' }, g);
      }
      labelEl('Server', { x, y: sy + sh + 18 * scale, 'text-anchor': 'middle', fill: '#ffffff', 'font-size': 13 * scale, 'font-family': 'sans-serif', 'font-weight': '700' }, g);
    };

    const drawClient = (n) => {
      const g = mk('g', {}, svg);
      const sw = 32 * scale, sh = 22 * scale, sx = n.x - sw / 2, sy = n.y - sh / 2;
      mk('rect', { x: sx, y: sy, width: sw, height: sh, rx: 3 * scale, fill: n.fill, stroke: n.stroke, 'stroke-width': 1.5 * scale }, g);
      mk('rect', { x: sx + 3 * scale, y: sy + 3 * scale, width: sw - 6 * scale, height: sh - 8 * scale, rx: 1, fill: n.stroke, opacity: '0.15' }, g);
      mk('rect', { x: sx - 3 * scale, y: sy + sh, width: sw + 6 * scale, height: 4 * scale, rx: 1.5, fill: 'none', stroke: n.stroke, 'stroke-width': 1.2 * scale }, g);
      labelEl(n.lbl, { x: n.x + 26 * scale, y: n.y + 5, fill: '#ffffff', 'font-size': 11 * scale, 'font-family': 'sans-serif', 'font-weight': '600' }, g);
    };

    const ring = mk('circle', { cx: SX, cy: SY, r: 28 * scale, fill: 'none', stroke: '#60a5fa', 'stroke-width': 1.5 * scale, opacity: '0' }, svg);

    drawServer(SX, SY);
    clients.forEach(drawClient);

    const packetLayer = mk('g', {}, svg);
    const packets = [];
    clients.forEach((n, ni) => {
      for (let i = 0; i < 3; i++) {
        const glowEl = mk('circle', { r: 10 * scale, fill: n.dot, opacity: '0' }, packetLayer);
        const coreEl = mk('circle', { r: 4 * scale, fill: n.dot, opacity: '0' }, packetLayer);
        packets.push({
          curveIndex: ni,
          prog: (i / 3 + ni * 0.1) % 1,
          spd: 0.0015 + Math.random() * 0.002,
          glowEl, coreEl,
        });
      }
    });

    let pulse = 0;
    let frameCount = 0;

    const tick = () => {
      for (let i = 0; i < packets.length; i++) {
        const p = packets[i];
        const prevProg = p.prog;
        p.prog += p.spd;
        if (p.prog >= 1) {
          p.prog -= 1;
          // Un packet a terminé son trajet = 1 packet livré
          statsRef.current.packets += 1;
          statsRef.current.mb += 0.03 + Math.random() * 0.05;
        }

        const idx = ((p.prog * STEPS) | 0) * 2;
        const curve = curves[p.curveIndex];
        const px = curve[idx];
        const py = curve[idx + 1];

        const op = p.prog < 0.1 ? p.prog * 10 : p.prog > 0.9 ? (1 - p.prog) * 10 : 1;

        p.glowEl.setAttribute('cx', px);
        p.glowEl.setAttribute('cy', py);
        p.glowEl.setAttribute('opacity', op * 0.15);
        p.coreEl.setAttribute('cx', px);
        p.coreEl.setAttribute('cy', py);
        p.coreEl.setAttribute('opacity', op * 0.9);
      }

      pulse += 0.004;
      if (pulse > 1) pulse -= 1;
      ring.setAttribute('r', (28 + pulse * 45) * scale);
      ring.setAttribute('opacity', (1 - pulse) * 0.4);

      // Mettre à jour les stats affichées toutes les 30 frames (~0.5s)
      frameCount++;
      if (frameCount % 30 === 0) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setStats({
          packets: statsRef.current.packets,
          mb: statsRef.current.mb,
          uptime: elapsed,
        });
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    tick();
  }, []);

  useEffect(() => {
    draw();

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(draw, 100);
    };

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [draw]);

  const formatUptime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div>
      <div ref={stageRef} style={{ width: '100%', position: 'relative', overflow: 'hidden', background: 'transparent', margin: '10px 0', transform: 'translateZ(0)' }}>
        <svg ref={svgRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'translateZ(0)' }}></svg>
      </div>
      <div className="animation-stats">
        <div className="stat-item">
          <span className="stat-value">{stats.packets.toLocaleString()}</span>
          <span className="stat-label">Packets sent</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.mb.toFixed(1)} MB</span>
          <span className="stat-label">Data transferred</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{formatUptime(stats.uptime)}</span>
          <span className="stat-label">Uptime</span>
        </div>
      </div>
    </div>
  );
};

export default NetworkAnimation;
