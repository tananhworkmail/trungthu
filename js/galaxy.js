/* Procedural galaxy, drawn locally without image downloads or dependencies. */
class GalaxyOpening {
    constructor({ onComplete = () => {} } = {}) {
        this.onComplete = onComplete;
        this.screen = document.getElementById('opening-screen');
        this.canvas = document.getElementById('galaxy-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.pointer = { x: 0, y: 0 };
        this.offset = { x: 0, y: 0 };
        this.meteors = [];
        this.bursts = [];
        this.elapsed = 0;
        this.lastTime = 0;
        this.nextMeteor = 2;
        this.frame = null;
        this.destroyed = false;
        this.onResize = () => { this.resize(); this.render(0); };
        this.onPointer = (event) => {
            if (event.pointerType === 'touch') return;
            this.pointer.x = (event.clientX / this.width - .5) * 2;
            this.pointer.y = (event.clientY / this.height - .5) * 2;
        };
        this.onLeave = () => { this.pointer.x = 0; this.pointer.y = 0; };
        this.onVisibility = () => document.hidden ? this.stop() : this.start();
        this.onMotion = () => { this.stop(); this.render(0); this.start(); };
        this.tick = (time) => {
            this.frame = null;
            const dt = this.lastTime ? Math.min((time - this.lastTime) / 1000, .05) : 0;
            this.lastTime = time;
            this.elapsed += dt;
            this.render(dt);
            this.start();
        };
        this.resize();
        this.initConstellation();
        window.addEventListener('resize', this.onResize);
        this.screen.addEventListener('pointermove', this.onPointer, { passive: true });
        this.screen.addEventListener('pointerleave', this.onLeave);
        document.addEventListener('visibilitychange', this.onVisibility);
        this.motion.addEventListener('change', this.onMotion);
        this.render(0);
        this.start();
    }

    resize() {
        this.width = innerWidth;
        this.height = innerHeight;
        if (this.cosmos) this.cosmos.resize();
        else this.cosmos = new CosmicSky(this.canvas);
    }

    render(dt) {
        this.offset.x += (this.pointer.x - this.offset.x) * .035;
        this.offset.y += (this.pointer.y - this.offset.y) * .035;
        this.cosmos.render(dt, this.offset, this.motion.matches, this.warp || 0);
        const ctx = this.ctx;
        this.bursts = this.bursts.filter(p => p.life > 0);
        for (const p of this.bursts) {
            p.life -= dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            ctx.fillStyle = `rgba(237,239,255,${Math.max(0, p.life / p.duration)})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        }
    }

    sparkle(star, count = 16) {
        if (this.motion.matches) return;
        const rect = star.getBoundingClientRect();
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 12 + Math.random() * 65;
            const duration = .6 + Math.random() * .7;
            this.bursts.push({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2,
                vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                life: duration, duration, size: .5 + Math.random() * 1.5 });
        }
    }

    initConstellation() {
        const stage = document.getElementById('constellation-stage');
        const nodes = [...stage.querySelectorAll('.constellation-star')];
        // From the top notch, trace the right lobe, the tip, then the left lobe.
        const stars = [nodes[0], ...nodes.slice(1).reverse()];
        const svg = stage.querySelector('svg');
        const arrow = document.getElementById('cupid-arrow');
        const status = document.getElementById('constellation-status');
        let next = 0;
        let elapsed = 0;
        let last = performance.now();
        let completed = false;
        stage.dataset.phase = 'drawing';
        const point = star => [parseFloat(star.style.getPropertyValue('--x')), parseFloat(star.style.getPropertyValue('--y'))];
        const addLine = (from, to) => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            const [x1, y1] = point(from), [x2, y2] = point(to);
            for (const [key, value] of Object.entries({ x1, y1, x2, y2, pathLength: 1 })) line.setAttribute(key, value);
            svg.appendChild(line);
        };
        status.textContent = 'Có những vì sao, sinh ra là để tìm thấy nhau.';
        // This clock also runs with reduced motion; the backdrop RAF may be stopped.
        const step = () => {
            if (this.destroyed) return;
            const now = performance.now();
            if (!document.hidden) elapsed += Math.min(now - last, 100);
            last = now;
            const spacing = this.motion.matches ? 90 : 320;
            if (next < stars.length && elapsed >= 1200 + next * spacing) {
                stars[next].classList.add('active');
                if (next > 0) addLine(stars[next - 1], stars[next]);
                this.sparkle(stars[next], 8);
                next++;
                if (next === stars.length) {
                    addLine(stars[next - 1], stars[0]);
                    stage.classList.add('completed');
                    status.textContent = 'Và mọi vì sao đều dẫn anh về phía em.';
                    this.completedAt = elapsed;
                }
            }
            if (next === stars.length && elapsed - this.completedAt > 1150) {
                stage.dataset.phase = 'arrow';
                stage.classList.add('arrow-flying');
                const flight = Math.min(1, (elapsed - this.completedAt - 1150) / (this.motion.matches ? 220 : 1100));
                const x = 128 - flight * 150;
                const y = 46 + (x - 50) * .3;
                arrow.setAttribute('opacity', '1');
                arrow.setAttribute('transform', `translate(${x} ${y}) rotate(16.7)`);
                // The leading point has crossed the left edge: cut in this same tick.
                if (x <= 8) {
                    stage.dataset.phase = 'pierced';
                    this.screen.classList.add('heart-pierced');
                    this.warp = 1;
                    stars.forEach(star => this.sparkle(star, 16));
                    completed = true;
                    this.onComplete();
                }
            }
            if (!completed) this.autoTimer = setTimeout(step, 50);
        };
        step();
    }


    start() {
        if (!this.destroyed && !document.hidden && !this.motion.matches && this.frame === null) this.frame = requestAnimationFrame(this.tick);
    }
    stop() {
        cancelAnimationFrame(this.frame);
        this.frame = null;
        this.lastTime = 0;
    }
    destroy() {
        this.destroyed = true;
        this.stop();
        clearTimeout(this.autoTimer);
        window.removeEventListener('resize', this.onResize);
        this.screen.removeEventListener('pointermove', this.onPointer);
        this.screen.removeEventListener('pointerleave', this.onLeave);
        document.removeEventListener('visibilitychange', this.onVisibility);
        this.motion.removeEventListener('change', this.onMotion);
        this.cosmos.destroy();
    }
}

window.GalaxyOpening = GalaxyOpening;
