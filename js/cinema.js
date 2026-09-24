/* A continuous, layered 3D sequence. All timing uses visible, unpaused time. */
class MoonlightCinema {
    constructor() {
        this.root = document.getElementById('main-content');
        this.scenes = [...this.root.querySelectorAll('.film-scene')];
        this.motion = matchMedia('(prefers-reduced-motion: reduce)');
        this.mobile = matchMedia('(pointer: coarse)').matches || innerWidth < 700;
        this.skyElapsed = 0;
        this.index = -1;
        this.elapsed = 0;
        this.duration = 12500;
        this.playing = false;
        this.started = false;
        this.lastTime = 0;
        this.frame = null;
        this.pointer = { x: 0, y: 0 };
        this.pan = { x: 0, y: 0 };
        this.pauseButton = document.getElementById('film-pause');
        this.dots = [...document.querySelectorAll('.film-chapter')];
        this.canvas = document.getElementById('film-dust');
        this.ctx = this.canvas.getContext('2d');
        this.universe = new CosmicSky(document.getElementById('film-universe'));
        this.particles = Array.from({ length: innerWidth < 600 ? 85 : 160 }, () => ({
            x: Math.random() * 2 - 1, y: Math.random() * 2 - 1,
            z: .2 + Math.random() * 1.8, size: .5 + Math.random(), phase: Math.random() * 6.28
        }));
        this.resize();
        this.initCelestialButtons();
        this.initTouchNavigation();
        window.addEventListener('resize', () => this.resize());
        this.ready = Promise.allSettled([...this.root.querySelectorAll('.scene-art img')].map(img => img.decode()));
        this.worldReady = import('./journey3d.js').then(({ MoonlightJourney }) => {
            this.journey = new MoonlightJourney(this.root, this.scenes, () => {
                this.journey = null;
                this.draw();
            });
            if (this.started) this.draw();
        }).catch(error => {
            this.root.dataset.renderer = 'fallback';
            console.warn('3D unavailable; keeping the accessible scene presentation.', error);
        });
        document.getElementById('film-previous').addEventListener('click', () => this.go(this.index - 1, true));
        document.getElementById('film-next').addEventListener('click', () => this.go(this.index + 1, true));
        document.getElementById('film-replay').addEventListener('click', () => { this.playing = true; this.go(0, true); });
        this.pauseButton.addEventListener('click', () => this.toggle());
        this.dots.forEach((dot, i) => dot.addEventListener('click', () => this.go(i, true)));
        this.root.addEventListener('pointermove', event => {
            if (event.pointerType !== 'mouse') return;
            this.pointer = { x: event.clientX / innerWidth - .5, y: event.clientY / innerHeight - .5 };
        }, { passive: true });
        this.root.addEventListener('pointerleave', () => { this.pointer = { x: 0, y: 0 }; });
        const letter = document.getElementById('letter-modal');
        new MutationObserver(() => {
            this.obscured = letter.classList.contains('active');
            this.lastTime = 0;
            if (!this.obscured) this.requestFrame();
        }).observe(letter, { attributes: true, attributeFilter: ['class'] });
        document.addEventListener('visibilitychange', () => {
            this.lastTime = 0;
            if (document.hidden) { cancelAnimationFrame(this.frame); this.frame = null; }
            else this.requestFrame();
        });
        this.motion.addEventListener('change', () => { this.draw(); this.requestFrame(); });
        document.addEventListener('keydown', event => {
            if (!this.started || event.target.closest('input, textarea, button, a, [role="dialog"]')) return;
            if (event.code === 'Space') { event.preventDefault(); this.toggle(); }
            if (event.key === 'ArrowRight') this.go(this.index + 1, true);
            if (event.key === 'ArrowLeft') this.go(this.index - 1, true);
        });
        this.tick = time => {
            this.frame = null;
            const dt = this.lastTime ? Math.min(time - this.lastTime, 100) : 0;
            this.lastTime = time;
            if (this.playing && !this.journey?.hop) {
                this.elapsed += dt;
                if (this.elapsed >= this.duration && this.index < this.scenes.length - 1) this.go(this.index + 1);
            }
            this.draw(this.playing || this.index === 4 || this.journey?.hop ? dt : 0);
            this.requestFrame();
        };
    }

    start() {
        if (this.started) return;
        this.started = true;
        // The galaxy is already rendered. Image downloads never delay the arrow's cut.
        this.root.classList.remove('hidden');
        this.root.classList.add('visible');
        this.playing = true;
        this.go(0);
        this.requestFrame();
    }

    go(index, userInitiated = false) {
        if (index < 0 || index >= this.scenes.length) return;
        const focusedScene = document.activeElement.closest('.film-scene');
        this.index = index;
        this.elapsed = 0;
        if (userInitiated && this.journey) this.journey.travelTo(index);
        this.scenes.forEach((scene, i) => {
            const wasActive = scene.classList.contains('is-active');
            scene.classList.toggle('is-leaving', wasActive && i !== index);
            scene.classList.toggle('is-active', i === index);
            scene.inert = i !== index;
            scene.setAttribute('aria-hidden', String(i !== index));
        });
        const final = index === this.scenes.length - 1;
        if (final) this.playing = false;
        this.root.classList.toggle('at-finale', final);
        document.getElementById('film-previous').disabled = index === 0;
        document.getElementById('film-next').disabled = final;
        this.dots.forEach((dot, i) => {
            dot.setAttribute('aria-current', i === index ? 'step' : 'false');
            dot.style.setProperty('--fill', i < index || final ? '100%' : '0%');
        });
        document.getElementById('film-scene-label').textContent = `${String(index + 1).padStart(2, '0')} / 05 · ${this.scenes[index].dataset.title}`;
        this.updateControls();
        // Automatic cuts never steal focus; manual navigation restores it if needed.
        if (userInitiated && focusedScene) this.pauseButton.focus({ preventScroll: true });
        this.draw();
        this.requestFrame();
    }

    toggle() {
        if (this.index === this.scenes.length - 1) { this.playing = true; this.go(0, true); }
        else this.playing = !this.playing;
        this.lastTime = 0;
        this.updateControls();
        this.draw();
        this.requestFrame();
    }

    updateControls() {
        this.pauseButton.textContent = this.playing ? 'Ⅱ' : '▷';
        const label = this.index === this.scenes.length - 1 ? 'Xem lại từ đầu' : this.playing ? 'Tạm dừng' : 'Tiếp tục';
        this.pauseButton.setAttribute('aria-label', label);
        this.pauseButton.title = label;
        this.root.classList.toggle('is-paused', !this.playing);
    }

    resize() {
        const ratio = Math.min(devicePixelRatio || 1, 1.5);
        this.canvas.width = innerWidth * ratio;
        this.canvas.height = innerHeight * ratio;
        this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        if (this.universe.w !== innerWidth || this.universe.h !== innerHeight) this.universe.resize();
        this.journey?.resize();
        if (this.index >= 0) this.draw();
    }

    draw(dt = 0) {
        if (this.index < 0) return;
        // The cached sky updates at 30 fps on phones; the 3D camera keeps its own cadence.
        this.skyElapsed += dt;
        if (!this.mobile || !this.journey || !dt || this.skyElapsed >= 33) {
            this.universe.render(this.skyElapsed / 1000, this.pan, this.motion.matches);
            this.skyElapsed = 0;
        }
        const progress = Math.min(1, this.elapsed / this.duration);
        if (this.playing) {
            this.pan.x += (this.pointer.x - this.pan.x) * .035;
            this.pan.y += (this.pointer.y - this.pan.y) * .035;
        }
        if (this.journey) {
            // All places use the same camera; progress moves that camera through space.
            this.journey.render(this.index, progress, this.pan, dt, this.motion.matches);
            this.dots[this.index].style.setProperty('--fill', `${this.index === 4 ? 100 : progress * 100}%`);
            return;
        }
        const camera = this.scenes[this.index].querySelector('.scene-camera');
        if (!this.motion.matches) {
            const direction = this.index % 2 ? -1 : 1;
            camera.style.transform = `translate3d(${this.pan.x * -18 + (progress - .5) * direction * 16}px, ${this.pan.y * -10}px, ${progress * 75}px) rotateY(${this.pan.x * 1.5 + (progress - .5) * direction * 1.2}deg)`;
        } else camera.style.transform = 'none';
        this.dots[this.index].style.setProperty('--fill', `${this.index === 4 ? 100 : progress * 100}%`);
        const ctx = this.ctx, w = innerWidth, h = innerHeight;
        ctx.clearRect(0, 0, w, h);
        for (const p of this.particles) {
            if (!this.motion.matches) p.z -= dt * .000035;
            if (p.z < .18) p.z = 2;
            const x = w / 2 + p.x * w * .6 / p.z;
            const y = h / 2 + p.y * h * .6 / p.z;
            const alpha = Math.min(.65, (2 - p.z) * .38);
            ctx.fillStyle = `rgba(255,231,182,${alpha})`;
            ctx.beginPath(); ctx.arc(x, y, Math.min(3.5, p.size / p.z), 0, Math.PI * 2); ctx.fill();
            if (p.size > 1.25) {
                const size = Math.min(6, 3 / p.z);
                ctx.strokeStyle = `rgba(243,226,255,${alpha * .55})`;
                ctx.lineWidth = .6;
                ctx.beginPath(); ctx.moveTo(x - size, y); ctx.lineTo(x + size, y); ctx.moveTo(x, y - size); ctx.lineTo(x, y + size); ctx.stroke();
            }
        }
    }

    requestFrame() {
        const ambientFinale = this.index === 4 && !this.motion.matches;
        if (this.started && (this.playing || ambientFinale || this.journey?.hop) && !document.hidden && !this.obscured && !this.typing && this.frame === null) this.frame = requestAnimationFrame(this.tick);
    }

    initTouchNavigation() {
        let gesture = null;
        const reset = () => { gesture = null; this.pointer = { x: 0, y: 0 }; };
        this.root.addEventListener('pointerdown', event => {
            if (event.pointerType !== 'touch' || !event.isPrimary || !this.started || this.index === 4 ||
                event.target.closest('button, input, textarea, a, nav')) return;
            gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
        }, { passive: true });
        this.root.addEventListener('pointermove', event => {
            if (!gesture || event.pointerId !== gesture.id) return;
            this.pointer = {
                x: Math.max(-.5, Math.min(.5, (event.clientX - gesture.x) / 180)),
                y: Math.max(-.3, Math.min(.3, (event.clientY - gesture.y) / 220))
            };
        }, { passive: true });
        this.root.addEventListener('pointerup', event => {
            if (!gesture || event.pointerId !== gesture.id) return;
            const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
            if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.35) {
                this.go(this.index + (dx < 0 ? 1 : -1), true);
                this.root.classList.add('has-swiped');
            }
            reset();
        }, { passive: true });
        this.root.addEventListener('pointercancel', reset, { passive: true });
        const viewport = window.visualViewport;
        const fitKeyboard = () => {
            if (this.keyboardBlurTimer) return;
            const typing = this.mobile && document.activeElement.id === 'wish-input';
            const keyboard = typing && viewport && innerHeight - viewport.height > 140;
            this.root.classList.toggle('is-keyboard-open', !!keyboard);
            if (keyboard) {
                this.root.style.setProperty('--keyboard-height', `${viewport.height}px`);
                this.root.style.setProperty('--keyboard-top', `${viewport.offsetTop}px`);
            }
        };
        viewport?.addEventListener('resize', fitKeyboard);
        viewport?.addEventListener('scroll', fitKeyboard);
        document.getElementById('wish-input').addEventListener('focus', () => {
            clearTimeout(this.keyboardBlurTimer);
            this.keyboardBlurTimer = null;
            this.typing = true;
            fitKeyboard();
        });
        document.getElementById('wish-input').addEventListener('blur', () => {
            this.typing = false;
            this.lastTime = 0;
            // Keep the send button still until the browser dispatches the touch click.
            this.keyboardBlurTimer = setTimeout(() => {
                this.keyboardBlurTimer = null;
                fitKeyboard();
            }, 250);
            this.requestFrame();
        });
    }

    initCelestialButtons() {
        for (const button of this.root.querySelectorAll('.celestial-button')) {
            const bloom = event => {
                if (this.motion.matches || (button.id === 'send-wish-btn' && !document.getElementById('wish-input').value.trim())) return;
                const rect = button.getBoundingClientRect();
                const x = event.detail === 0 && event.type === 'click' ? rect.left + rect.width / 2 : event.clientX;
                const y = event.detail === 0 && event.type === 'click' ? rect.top + rect.height / 2 : event.clientY;
                const ripple = document.createElement('i');
                ripple.className = 'button-ripple';
                ripple.setAttribute('aria-hidden', 'true');
                ripple.style.left = `${(x - rect.left) / rect.width * 100}%`;
                ripple.style.top = `${(y - rect.top) / rect.height * 100}%`;
                button.appendChild(ripple);
                ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
                // A bounded burst works on touch, mouse and keyboard activation.
                for (let i = 0; i < 14; i++) {
                    const spark = document.createElement('i');
                    spark.className = 'wish-spark';
                    spark.setAttribute('aria-hidden', 'true');
                    spark.style.left = `${x}px`; spark.style.top = `${y}px`;
                    document.body.appendChild(spark);
                    const angle = Math.PI * 2 * i / 14;
                    const distance = 25 + Math.random() * 60;
                    const animation = spark.animate([
                        { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
                        { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance - 18}px) scale(0)`, opacity: 0 }
                    ], { duration: 550 + Math.random() * 350, easing: 'cubic-bezier(.15,.65,.3,1)' });
                    animation.finished.then(() => spark.remove(), () => spark.remove());
                }
            };
            button.addEventListener('pointerdown', bloom);
            button.addEventListener('click', event => { if (event.detail === 0) bloom(event); });
        }
    }
}
window.MoonlightCinema = MoonlightCinema;
