/* Shared galaxy atmosphere: cached nebulae, depth stars, constellations and meteors. */
class CosmicSky {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.time = 0;
        this.meteors = [];
        this.nextMeteor = .8;
        this.resize();
    }

    resize() {
        this.w = innerWidth;
        this.h = innerHeight;
        const ratio = Math.min(devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches || innerWidth < 700 ? 1 : 1.5);
        this.canvas.width = Math.round(this.w * ratio);
        this.canvas.height = Math.round(this.h * ratio);
        this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        this.nebula = document.createElement('canvas');
        this.nebula.width = this.canvas.width;
        this.nebula.height = this.canvas.height;
        const ctx = this.nebula.getContext('2d');
        ctx.scale(ratio, ratio);
        const w = this.w, h = this.h, span = Math.hypot(w, h);
        let seed = 22082026;
        const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
        const gaussian = () => Math.sqrt(-2 * Math.log(Math.max(.00001, random()))) * Math.cos(random() * Math.PI * 2);
        const project = (x, y) => ({ x: w * .48 + x * .87 + y * .49, y: h * .5 - x * .49 + y * .87 });
        ctx.fillStyle = '#090b1b'; ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'screen';
        const colors = ['255,205,76', '205,151,66', '103,112,174', '255,226,132', '245,184,60'];
        for (let i = 0; i < 100; i++) {
            const x = (random() - .5) * span * 1.65;
            const point = project(x, gaussian() * span * .065);
            const radius = span * (.05 + random() * .15);
            const glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
            glow.addColorStop(0, `rgba(${colors[i % colors.length]},${.12 + random() * .14})`);
            glow.addColorStop(.45, `rgba(${colors[i % colors.length]},.045)`);
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
        }
        ctx.globalCompositeOperation = 'source-over';
        const count = Math.min(10500, Math.floor(w * h / 105) + 2300);
        for (let i = 0; i < count; i++) {
            const x = (random() - .5) * span * 1.6;
            const p = i % 3 === 0 ? { x: random() * w, y: random() * h } : project(x, gaussian() * span * (.035 + Math.abs(x / span) * .06));
            ctx.globalAlpha = .25 + random() * .7;
            ctx.fillStyle = ['#fff9dc', '#ffe286', '#ffffff', '#ffcf52'][i % 4];
            const r = .2 + random() * .85;
            ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        // Distant constellations sit well outside the central heart and captions.
        for (const [ox, oy, scale] of [[.08,.25,.12],[.78,.72,.14],[.74,.15,.1]]) {
            const points = [[0,.3],[.25,0],[.6,.18],[1,0],[.8,.7],[.35,1]];
            ctx.strokeStyle = 'rgba(255,242,198,.29)'; ctx.lineWidth = .65;
            ctx.beginPath();
            points.forEach(([x,y], i) => {
                const px = (ox + x * scale) * w, py = (oy + y * scale) * h;
                if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
            });
            ctx.stroke();
            for (const [x,y] of points) {
                ctx.fillStyle = '#fff3b9'; ctx.beginPath(); ctx.arc((ox + x * scale) * w, (oy + y * scale) * h, 1.5, 0, Math.PI * 2); ctx.fill();
            }
        }
        this.stars = Array.from({ length: w < 600 ? 125 : 230 }, () => ({
            x: random() * w, y: random() * h, r: .6 + random() * 1.5,
            phase: random() * 6.28, speed: .6 + random(), depth: .4 + random()
        }));
        this.travelers = Array.from({ length: w < 600 ? 65 : 120 }, () => ({
            x: random() * 2 - 1, y: random() * 2 - 1, z: .25 + random() * 2, r: .35 + random() * .5
        }));
    }

    render(dt = 0, pointer = { x: 0, y: 0 }, reduced = false, warp = 0) {
        this.time += reduced ? 0 : dt;
        const ctx = this.ctx, w = this.w, h = this.h;
        const drift = reduced ? 0 : Math.sin(this.time * .16) * 18;
        const dx = reduced ? 0 : pointer.x * 12;
        const dy = reduced ? 0 : pointer.y * 9;
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(reduced ? 0 : Math.sin(this.time * .1) * .035);
        const swell = reduced ? 1.1 : 1.12 + Math.sin(this.time * .23) * .025;
        ctx.scale(swell, swell);
        ctx.drawImage(this.nebula, -w / 2 - 24 + dx + drift, -h / 2 - 24 + dy, w + 48, h + 48);
        ctx.restore();
        for (const s of this.stars) {
            const alpha = .52 + Math.sin(this.time * s.speed + s.phase) * .35;
            const x = s.x + dx * s.depth, y = s.y + dy * s.depth;
            ctx.fillStyle = `rgba(255,247,216,${alpha})`;
            ctx.beginPath(); ctx.arc(x, y, s.r, 0, Math.PI * 2); ctx.fill();
            if (s.r > 1.6) {
                const size = s.r * (3 + alpha * 2);
                ctx.strokeStyle = `rgba(255,223,122,${alpha * .72})`; ctx.lineWidth = .8;
                ctx.beginPath(); ctx.moveTo(x - size, y); ctx.lineTo(x + size, y); ctx.moveTo(x, y - size); ctx.lineTo(x, y + size); ctx.stroke();
                ctx.fillStyle = `rgba(255,209,79,${alpha * .10})`;
                ctx.beginPath(); ctx.arc(x, y, size * 1.4, 0, Math.PI * 2); ctx.fill();
            }
        }
        for (const p of this.travelers) {
            if (!reduced) p.z -= dt * (.085 + warp * .65);
            if (p.z < .2) p.z = 2.2;
            const x = w / 2 + p.x * w * .55 / p.z, y = h / 2 + p.y * h * .55 / p.z;
            ctx.fillStyle = `rgba(255,239,182,${Math.min(.8, (2.3 - p.z) * .42)})`;
            ctx.beginPath(); ctx.arc(x, y, Math.min(2.5, p.r / p.z), 0, Math.PI * 2); ctx.fill();
            if (warp > 0 && !reduced) {
                ctx.strokeStyle = `rgba(255,236,163,${warp * .5})`;
                ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (x - w / 2) * warp * .2, y + (y - h / 2) * warp * .2); ctx.stroke();
            }
        }
        if (!reduced && this.time > this.nextMeteor) {
            this.meteors.push({ x: Math.random() * w * .95, y: Math.random() * h * .65, age: 0, speed: 240 + Math.random() * 180 });
            this.nextMeteor = this.time + 1.1 + Math.random() * 1.5;
        }
        this.meteors = this.meteors.filter(m => m.age < 1.6);
        for (const m of this.meteors) {
            m.age += reduced ? 0 : dt;
            const x = m.x - m.age * m.speed, y = m.y + m.age * m.speed * .38;
            const alpha = Math.max(0, Math.sin(m.age / 1.6 * Math.PI));
            const glow = ctx.createLinearGradient(x, y, x + 160, y - 61);
            glow.addColorStop(0, `rgba(255,253,231,${alpha})`);
            glow.addColorStop(.15, `rgba(255,207,83,${alpha * .75})`);
            glow.addColorStop(1, 'transparent');
            ctx.strokeStyle = glow; ctx.lineWidth = 1.4;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 160, y - 61); ctx.stroke();
        }
    }

    destroy() { this.nebula.width = this.nebula.height = 0; this.canvas.width = this.canvas.height = 0; }
}
window.CosmicSky = CosmicSky;
