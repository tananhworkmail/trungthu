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
        this.gyro = { x: 0, y: 0 };
        this.gyroTarget = { x: 0, y: 0 };
        this.touchActive = false;
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
        this.initDeviceOrientation();
        window.addEventListener('resize', () => this.resize());
        this.ready = Promise.allSettled([...this.root.querySelectorAll('.scene-art img')].map(img => img.decode()));
        this.worldReady = import('./journey3d.js').then(({ MoonlightJourney }) => {
            this.journey = new MoonlightJourney(this.root, this.scenes, () => {
                this.journey = null;
                if (this.root.classList.contains('details-open')) this.index = 4;
                this.root.classList.remove('details-open');
                this.go(this.index);
            });
            if (this.started) { this.journey.arrive(this.index); this.updateControls(); this.draw(); }
        }).catch(error => {
            this.root.dataset.renderer = 'fallback';
            console.warn('3D unavailable; keeping the accessible scene presentation.', error);
        });
        document.getElementById('film-previous').addEventListener('click', () => this.go(this.index - 1, true));
        document.getElementById('film-next').addEventListener('click', () => this.go(this.index + 1, true));
        document.getElementById('film-replay').addEventListener('click', () => {
            if (this.root.classList.contains('details-open')) this.hideDetails();
            this.playing = true;
            this.go(0, true);
        });
        this.pauseButton.addEventListener('click', () => this.toggle());
        document.getElementById('open-finale-btn').addEventListener('click', () => this.showDetails());
        document.getElementById('close-finale-btn').addEventListener('click', () => this.hideDetails());
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
            if (!this.journey?.spatial && this.playing && !this.journey?.hop && !this.touchActive) {
                this.elapsed += dt;
                if (this.elapsed >= this.duration && this.index < this.scenes.length - 1) this.go(this.index + 1);
            }
            if (!this.touchActive) {
                this.pointer.x *= 0.94;
                this.pointer.y *= 0.94;
            }
            this.draw(this.playing || this.journey?.hop ? dt : 0, dt);
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
        if (userInitiated) index = (index + this.scenes.length) % this.scenes.length;
        if (index < 0 || index >= this.scenes.length) return;
        const focusedScene = document.activeElement.closest('.film-scene');
        this.index = index;
        this.elapsed = 0;
        if (userInitiated && this.root.classList.contains('details-open')) this.hideDetails();
        if (userInitiated && this.journey) this.journey.travelTo(index);
        else this.journey?.arrive(index);
        this.scenes.forEach((scene, i) => {
            const wasActive = scene.classList.contains('is-active');
            scene.classList.toggle('is-leaving', wasActive && i !== index);
            scene.classList.toggle('is-active', i === index);
            scene.inert = i !== index;
            scene.setAttribute('aria-hidden', String(i !== index));
        });
        const final = index === this.scenes.length - 1;
        if (final && !this.journey?.spatial) this.playing = false;
        this.root.classList.toggle('at-finale', final);
        document.getElementById('film-previous').disabled = false;
        document.getElementById('film-next').disabled = false;
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
        if (this.index === this.scenes.length - 1 && !this.journey?.spatial) { this.playing = true; this.go(0, true); }
        else this.playing = !this.playing;
        this.lastTime = 0;
        this.updateControls();
        this.draw();
        this.requestFrame();
    }

    updateControls() {
        this.pauseButton.textContent = this.journey?.spatial ? (this.playing ? 'Ⅱ Dừng ngắm' : '↻ Xoay tiếp') : this.playing ? 'Ⅱ' : '▷';
        const label = this.journey?.spatial ? (this.playing ? 'Dừng ngắm không gian' : 'Tiếp tục xoay quanh ngân hà') : this.index === this.scenes.length - 1 ? 'Xem lại từ đầu' : this.playing ? 'Tạm dừng' : 'Tiếp tục';
        this.pauseButton.setAttribute('aria-label', label);
        this.pauseButton.title = label;
        this.root.classList.toggle('is-paused', !this.playing);
    }

    showDetails() {
        if (!this.journey?.spatial) { this.go(4, true); return; }
        this.resumeAfterDetails = this.playing;
        this.playing = false;
        this.journey.baseAngle = this.journey.angle;
        this.journey.hop = null;
        this.journey.releaseDrag();
        this.root.classList.add('details-open');
        this.scenes[4].inert = false;
        this.scenes[4].setAttribute('aria-hidden', 'false');
        this.updateControls();
        document.getElementById('open-letter-btn').focus({ preventScroll: true });
    }

    hideDetails() {
        this.root.classList.remove('details-open');
        this.scenes[4].inert = true;
        this.scenes[4].setAttribute('aria-hidden', 'true');
        this.playing = this.resumeAfterDetails ?? true;
        this.lastTime = 0;
        this.updateControls();
        document.getElementById('open-finale-btn').focus({ preventScroll: true });
        this.requestFrame();
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

    draw(dt = 0, ambientDt = dt) {
        if (this.index < 0) return;
        // The cached sky updates at 30 fps on phones; the 3D camera keeps its own cadence.
        this.skyElapsed += ambientDt;
        if (!this.mobile || !this.journey || !ambientDt || this.skyElapsed >= 33) {
            this.universe.render(this.skyElapsed / 1000, this.pan, this.motion.matches);
            this.skyElapsed = 0;
        }
        const progress = Math.min(1, this.elapsed / this.duration);
        this.gyro.x += (this.gyroTarget.x - this.gyro.x) * 0.08;
        this.gyro.y += (this.gyroTarget.y - this.gyro.y) * 0.08;
        const targetPanX = this.pointer.x + this.gyro.x * 0.75;
        const targetPanY = this.pointer.y + this.gyro.y * 0.75;
        this.pan.x += (targetPanX - this.pan.x) * 0.08;
        this.pan.y += (targetPanY - this.pan.y) * 0.08;
        if (this.journey) {
            // All places use the same camera; progress moves that camera through space.
            this.journey.render(this.index, progress, this.pan, dt, this.motion.matches, ambientDt);
            if (this.journey.spatial) {
                this.index = ((Math.round(this.journey.angle / (Math.PI * 2 / 5)) % 5) + 5) % 5;
                this.scenes.slice(0, 4).forEach((scene, i) => scene.setAttribute('aria-hidden', String(i !== this.index)));
                return;
            }
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
        if (this.started && !document.hidden && !this.obscured && !this.typing && this.frame === null) {
            this.frame = requestAnimationFrame(this.tick);
        }
    }

    initTouchNavigation() {
        let gesture = null;
        const reset = () => {
            const id = gesture?.id;
            gesture = null;
            this.touchActive = false;
            if (id !== undefined && this.root.hasPointerCapture(id)) this.root.releasePointerCapture(id);
        };
        this.root.addEventListener('pointerdown', event => {
            if (event.pointerType !== 'touch' || !event.isPrimary || !this.started || this.root.classList.contains('details-open') ||
                event.target.closest('button, input, textarea, a, nav, .letter-modal, .finale-copy')) return;
            gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, startTime: performance.now() };
            this.root.setPointerCapture(event.pointerId);
            this.touchActive = true;
            this.elapsed = 0;
            this.journey?.beginDrag();
        }, { passive: true });
        this.root.addEventListener('pointermove', event => {
            if (!gesture || event.pointerId !== gesture.id) return;
            const dx = event.clientX - gesture.x;
            const dy = event.clientY - gesture.y;
            this.journey?.setDrag(dx / this.root.clientWidth, dy / this.root.clientHeight);
            this.pointer = {
                x: Math.max(-0.9, Math.min(0.9, dx / 150)),
                y: Math.max(-0.7, Math.min(0.7, dy / 180))
            };
        }, { passive: true });
        this.root.addEventListener('pointerup', event => {
            if (!gesture || event.pointerId !== gesture.id) return;
            const dx = event.clientX - gesture.x;
            const dy = event.clientY - gesture.y;
            const dt = performance.now() - gesture.startTime;
            if (this.journey?.spatial) {
                // Commit the final finger position even if release happens between frames.
                this.journey.setDrag(dx / this.root.clientWidth, dy / this.root.clientHeight);
                this.draw();
                this.journey.releaseDrag(dx / Math.max(100, dt), dy / Math.max(100, dt));
                this.root.classList.add('has-swiped');
                reset();
                return;
            }
            const isFlick = dt < 320 && Math.abs(dx) > 38;
            const isSwipe = Math.abs(dx) > 60;
            if ((isFlick || isSwipe) && Math.abs(dx) > Math.abs(dy) * 1.15) {
                this.go(this.index + (dx < 0 ? 1 : -1), true);
                this.root.classList.add('has-swiped');
            } else this.go(this.index, true);
            reset();
        }, { passive: true });
        const cancelGesture = event => {
            if (!gesture || event.pointerId !== gesture.id) return;
            if (gesture && this.journey?.spatial) this.journey.releaseDrag();
            else if (gesture) this.go(this.index, true);
            reset();
        };
        this.root.addEventListener('pointercancel', cancelGesture, { passive: true });
        this.root.addEventListener('lostpointercapture', cancelGesture, { passive: true });
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

    initDeviceOrientation() {
        let calibrated = false;
        let baseBeta = 50;
        const onOrientation = (e) => {
            if (e.gamma === null || e.beta === null) return;
            if (!calibrated && Math.abs(e.beta) > 10) {
                baseBeta = Math.max(25, Math.min(75, e.beta));
                calibrated = true;
            }
            const gamma = Math.max(-40, Math.min(40, e.gamma));
            const betaDiff = Math.max(-35, Math.min(35, e.beta - baseBeta));
            this.gyroTarget = {
                x: gamma / 28,
                y: betaDiff / 24
            };
        };

        this.requestGyroPermission = async () => {
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                try {
                    const res = await DeviceOrientationEvent.requestPermission();
                    if (res === 'granted') {
                        window.addEventListener('deviceorientation', onOrientation, { passive: true });
                    }
                } catch (e) { /* ignore */ }
            } else if (window.DeviceOrientationEvent) {
                window.addEventListener('deviceorientation', onOrientation, { passive: true });
            }
        };

        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function') {
            window.addEventListener('deviceorientation', onOrientation, { passive: true });
        }
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
