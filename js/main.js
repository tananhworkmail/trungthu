/**
 * MAIN INTERACTION SCRIPT
 * Quản lý logic tương tác: Màn chào, thư tình gõ chữ, đếm ngày yêu, âm nhạc và bộ sưu tập ảnh.
 */

document.addEventListener('DOMContentLoaded', () => {
    applyConfiguration();
    const audioController = new RomanticAudioPlayer(CONFIG.audioSrc);
    // Request playback before the scene engines and textures start loading.
    initBackgroundMusic(audioController);
    const film = new MoonlightCinema();
    const opening = document.getElementById('opening-screen');
    let entering = false;
    const enterFilm = () => {
        if (entering) return;
        entering = true;
        film.requestGyroPermission?.();
        document.getElementById('skip-opening-btn').disabled = true;
        film.start();
        opening.classList.add('fade-out');
        setTimeout(() => {
            opening.hidden = true;
            opening.style.display = 'none';
            galaxyOpening.destroy();
            if (opening.contains(document.activeElement)) document.getElementById('film-pause').focus({ preventScroll: true });
        }, 900);
    };
    const galaxyOpening = new GalaxyOpening({ onComplete: enterFilm });
    document.getElementById('skip-opening-btn').addEventListener('click', () => {
        film.requestGyroPermission?.();
        enterFilm();
    });
    // Create the decorative engines only when a wish is actually released.
    let lanternEngine, fireworkEngine;
    initWishBox({ spawnCustomWish(...args) {
        lanternEngine ||= new SkyLanternEngine('sky-canvas');
        lanternEngine.spawnCustomWish(...args);
    } }, { createBurst(...args) {
        fireworkEngine ||= new FireworkEngine('firework-canvas');
        fireworkEngine.createBurst(...args);
    } });
    initLoveCounter();
    initLoveLetter();
});

/**
 * Điền các chuỗi ký tự và tiêu đề từ config.js vào giao diện
 */
function applyConfiguration() {
    // Header chính (dùng innerHTML để hiển thị hiệu ứng gradient cho tên Mĩ Diên)
    const mainHeadlineEl = document.getElementById('main-headline');
    if (mainHeadlineEl) mainHeadlineEl.innerHTML = CONFIG.mainHeadline;

    // Tên bạn gái & bạn trai
    document.querySelectorAll('.recipient-name').forEach(el => el.textContent = CONFIG.recipientName);
    document.querySelectorAll('.sender-name').forEach(el => el.textContent = CONFIG.senderName);
    
    // Màn mở đầu
    const welcomeTitleEl = document.getElementById('welcome-title');
    if (welcomeTitleEl) welcomeTitleEl.innerHTML = CONFIG.welcomeTitle;
    
    const welcomeSubtitleEl = document.getElementById('welcome-subtitle');
    if (welcomeSubtitleEl) welcomeSubtitleEl.innerHTML = CONFIG.welcomeSubtitle;
    
    const lanternPromptEl = document.getElementById('lantern-prompt');
    if (lanternPromptEl) lanternPromptEl.innerHTML = CONFIG.lanternPrompt;

    const headerBadgeEl = document.getElementById('header-badge');
    if (headerBadgeEl) headerBadgeEl.innerHTML = CONFIG.headerBadge;

    const subHeadlineEl = document.getElementById('sub-headline');
    if (subHeadlineEl) subHeadlineEl.innerHTML = CONFIG.subHeadline;

    // Tiêu đề thư
    const letterTitleEl = document.getElementById('letter-title');
    if (letterTitleEl) letterTitleEl.innerHTML = CONFIG.letterTitle;
}

/**
 * Đếm thời gian yêu nhau chính xác từng giây
 */
function initLoveCounter() {
    const daysEl = document.getElementById('counter-days');
    const hoursEl = document.getElementById('counter-hours');
    const minutesEl = document.getElementById('counter-minutes');
    const secondsEl = document.getElementById('counter-seconds');

    if (!daysEl) return;

    // ISO timestamp with an explicit offset keeps the instant identical worldwide.
    const startTime = CONFIG.anniversaryTime;
    const startTimestamp = `${CONFIG.anniversaryDate}T${startTime}:00${CONFIG.anniversaryUtcOffset}`;
    const startDate = new Date(startTimestamp);

    function update() {
        const now = new Date();
        const diffMs = now - startDate;

        if (diffMs < 0) {
            daysEl.textContent = "0";
            hoursEl.textContent = "00";
            minutesEl.textContent = "00";
            secondsEl.textContent = "00";
            return;
        }

        const totalSec = Math.floor(diffMs / 1000);
        const days = Math.floor(totalSec / (3600 * 24));
        const hours = Math.floor((totalSec % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSec % 3600) / 60);
        const seconds = totalSec % 60;

        daysEl.textContent = days.toLocaleString('vi-VN');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
}

/**
 * Mở lá thư ánh trăng; giữ toàn bộ nội dung sẵn sàng để đọc và cuộn.
 */
function initLoveLetter() {
    const openLetterBtn = document.getElementById('open-letter-btn');
    const letterModal = document.getElementById('letter-modal');
    const closeLetterBtn = document.getElementById('close-letter-btn');
    const letterBody = document.getElementById('letter-body');

    if (!openLetterBtn || !letterModal) return;

    openLetterBtn.addEventListener('click', () => {
        renderLetter();
        letterModal.querySelector('.letter-scroll').scrollTop = 0;
        letterModal.inert = false;
        letterModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        closeLetterBtn.focus();
    });

    closeLetterBtn.addEventListener('click', closeModal);
    letterModal.addEventListener('click', (e) => {
        if (e.target === letterModal) closeModal();
    });
    letterModal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'Tab') {
            const focusable = [...letterModal.querySelectorAll('button, [tabindex="0"]')];
            const first = focusable[0], last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    });

    function closeModal() {
        letterModal.classList.remove('active');
        letterModal.inert = true;
        document.body.style.overflow = '';
        openLetterBtn.focus({ preventScroll: true });
    }

    function renderLetter() {
        letterBody.replaceChildren();
        CONFIG.letterContent.forEach((text, index) => {
            const paragraph = document.createElement('p');
            paragraph.className = 'letter-paragraph';
            paragraph.textContent = text;
            paragraph.style.setProperty('--reveal-delay', `${.55 + index * .12}s`);
            letterBody.appendChild(paragraph);
        });
        const signature = document.createElement('div');
        signature.className = 'letter-signature';
        signature.append('Mãi yêu em,', document.createElement('br'));
        const name = document.createElement('span');
        name.className = 'signature-name';
        name.textContent = CONFIG.senderName;
        signature.appendChild(name);
        letterBody.appendChild(signature);
    }
}

/**
 * Quản lý Hộp Thả Đèn Trời Nguyện Ước
 */
function initWishBox(lanternEngine, fireworkEngine) {
    const wishInput = document.getElementById('wish-input');
    const sendWishBtn = document.getElementById('send-wish-btn');
    const presetPills = document.querySelectorAll('.wish-preset-pill');
    const wishFeedback = document.getElementById('wish-feedback');
    let saving = false;
    let feedbackTimer;

    if (!sendWishBtn) return;

    // Chọn gợi ý điều ước nhanh
    presetPills.forEach(pill => {
        pill.addEventListener('click', () => {
            wishInput.value = pill.textContent.replace(/^[\s✨💖🌸🌙💕]+/, '').trim();
            wishInput.focus();
        });
    });

    sendWishBtn.addEventListener('click', async () => {
        if (saving) return;
        const text = wishInput.value.trim();
        if (!text) {
            wishInput.focus();
            return;
        }

        saving = true;
        clearTimeout(feedbackTimer);
        sendWishBtn.disabled = true;
        sendWishBtn.setAttribute('aria-busy', 'true');
        wishInput.readOnly = true;
        wishInput.blur();
        const buttonLabel = sendWishBtn.querySelector('.wish-send-label');
        buttonLabel.textContent = 'Đang thả…';
        wishFeedback.dataset.state = 'saving';
        wishFeedback.textContent = 'Đang gửi gắm điều ước của em…';
        wishFeedback.classList.add('show');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        let saved = false;
        try {
            const response = await fetch('api/wish.php', {
                method: 'POST',
                credentials: 'same-origin',
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Wish-Token': document.querySelector('meta[name="wish-token"]')?.content || ''
                },
                body: JSON.stringify({
                    wish: text,
                    author: CONFIG.recipientName
                })
            });
            const result = await response.json();
            if (!response.ok || result.success !== true || result.storage !== 'mysql') {
                wishFeedback.textContent = typeof result.message === 'string' ? result.message : 'Chưa lưu được điều ước. Em thử thả đèn lại nhé.';
                return;
            }
            saved = true;
        } catch (error) {
            wishFeedback.textContent = 'Chưa nhận được xác nhận lưu điều ước. Nội dung vẫn còn đây, em thử lại nhé.';
        } finally {
            clearTimeout(timeout);
            saving = false;
            sendWishBtn.disabled = false;
            sendWishBtn.removeAttribute('aria-busy');
            wishInput.readOnly = false;
            buttonLabel.textContent = 'Thả đèn';
            wishFeedback.dataset.state = saved ? 'saved' : 'error';
        }
        if (!saved) return;

        // Release the lantern only after MySQL confirms the INSERT succeeded.
        wishFeedback.textContent = `🏮 Đèn trời đã mang điều ước: "${text}" bay lên ngân hà. Mong điều em ước sớm thành hiện thực 💛`;
        wishInput.value = '';
        const startX = window.innerWidth / 2 + (Math.random() - .5) * 160;
        lanternEngine.spawnCustomWish(text, startX, window.innerHeight - 20);
        fireworkEngine.createBurst(startX, window.innerHeight * .65, 45, true);
        feedbackTimer = setTimeout(() => wishFeedback.classList.remove('show'), 6500);
    });

    wishInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendWishBtn.click();
        }
    });
}

/**
 * Khởi động nhạc nền tự động và thử lại sau tương tác nếu autoplay bị chặn.
 */
function initBackgroundMusic(audioController) {
    const start = () => audioController.play().catch(() => {});
    audioController.onPlayStateChange = playing => {
        document.body.dataset.music = playing ? 'playing' : 'waiting';
    };
    document.body.dataset.music = 'waiting';
    start();
    // Any ordinary interaction can unlock audio when Chrome blocks autoplay.
    ['pointerup', 'touchend', 'keydown', 'click'].forEach(type => {
        document.addEventListener(type, start, { passive: true });
    });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
}

/**
 * CLASS QUẢN LÝ ÂM THANH KÉP (HTML5 Audio + Web Audio Synth Fallback)
 * Nếu file mp3 không tìm thấy hoặc chưa tải, tự động tấu giai điệu Music Box piano lãng mạn.
 */
class RomanticAudioPlayer {
    constructor(src) {
        this.src = src;
        this.audio = new Audio();
        this.audio.autoplay = true;
        this.audio.preload = 'auto';
        this.audio.loop = true;
        this.audio.volume = .55;
        this.audio.src = src;
        
        this.isPlaying = false;
        this.isSynth = false;
        this.audioCtx = null;
        this.synthTimer = null;
        this.onPlayStateChange = null;
        this.wantsPlayback = false;

        // Lắng nghe lỗi nạp file âm thanh để chuyển sang synth
        this.audio.addEventListener('error', () => {
            this.isSynth = true;
            if (this.wantsPlayback) this.playSynthMelody().catch(() => {});
        });
    }

    async play() {
        this.wantsPlayback = true;
        if (this.isSynth) return this.playSynthMelody();
        if (this.isPlaying && !this.audio.paused) return true;
        try {
            await this.audio.play();
            this.isPlaying = true;
            this.onPlayStateChange?.(true);
            return true;
        } catch (error) {
            // A permissions block is not a missing track; retry on the next touch.
            if (error.name === 'NotAllowedError') return false;
            this.isSynth = true;
            return this.playSynthMelody();
        }
    }

    pause() {
        this.wantsPlayback = false;
        this.isPlaying = false;
        if (this.onPlayStateChange) this.onPlayStateChange(false);

        if (!this.isSynth) {
            this.audio.pause();
        } else {
            if (this.synthTimer) clearTimeout(this.synthTimer);
            this.synthTimer = null;
            if (this.audioCtx && this.audioCtx.state === 'running') {
                this.audioCtx.suspend();
            }
        }
    }

    async playSynthMelody() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        }
        if (this.audioCtx.state !== 'running') await this.audioCtx.resume();
        if (!this.wantsPlayback || this.audioCtx.state !== 'running') return false;
        this.isPlaying = true;
        this.onPlayStateChange?.(true);
        if (this.synthTimer !== null) return true;

        // Giai điệu huyền thoại "Ánh trăng nói hộ lòng tôi" (The Moon Represents My Heart)
        // [Tần số Hz, Độ dài tính theo giây]
        const notes = [
            { f: 392.00, d: 0.6 }, // G4: Ni
            { f: 523.25, d: 0.8 }, // C5: wen
            { f: 659.25, d: 0.8 }, // E5: wo
            { f: 783.99, d: 1.2 }, // G5: ai
            { f: 1046.50, d: 1.2 }, // C6: ni
            { f: 880.00, d: 0.8 }, // A5: you
            { f: 783.99, d: 0.8 }, // G5: duo
            { f: 659.25, d: 1.4 }, // E5: shen

            { f: 392.00, d: 0.6 }, // G4: wo
            { f: 440.00, d: 0.8 }, // A4: ai
            { f: 523.25, d: 0.8 }, // C5: ni
            { f: 587.33, d: 0.8 }, // D5: you
            { f: 659.25, d: 1.0 }, // E5: ji
            { f: 587.33, d: 1.0 }, // D5: fen
            { f: 523.25, d: 1.6 }, // C5

            { f: 523.25, d: 0.8 }, // wo
            { f: 659.25, d: 0.8 }, // de
            { f: 783.99, d: 1.0 }, // qing
            { f: 880.00, d: 1.2 }, // ye
            { f: 783.99, d: 0.8 }, // zhen
            { f: 659.25, d: 1.4 },

            { f: 523.25, d: 0.8 },
            { f: 587.33, d: 0.8 },
            { f: 659.25, d: 1.0 },
            { f: 587.33, d: 1.2 },
            { f: 523.25, d: 1.8 }
        ];

        let index = 0;
        const playNext = () => {
            if (!this.isPlaying) return;
            
            const n = notes[index];
            this.playMusicBoxChime(n.f, n.d);
            
            index = (index + 1) % notes.length;
            this.synthTimer = setTimeout(playNext, n.d * 750);
        };

        playNext();
        return true;
    }

    playMusicBoxChime(freq, duration) {
        if (!this.audioCtx) return;
        const now = this.audioCtx.currentTime;

        // Âm sắc Music Box / Chuông gió thủy tinh ấm áp
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        // Thêm họa âm bậc 2 để tạo tiếng chuông ngân
        const oscHarmonic = this.audioCtx.createOscillator();
        const gainHarmonic = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        oscHarmonic.type = 'triangle';
        oscHarmonic.frequency.setValueAtTime(freq * 2, now);

        // Đường bao âm lượng (Attack nhanh, Decay dài êm đềm)
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 1.5);

        gainHarmonic.gain.setValueAtTime(0, now);
        gainHarmonic.gain.linearRampToValueAtTime(0.05, now + 0.02);
        gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, now + duration * 1.2);

        osc.connect(gain);
        oscHarmonic.connect(gainHarmonic);
        gain.connect(this.audioCtx.destination);
        gainHarmonic.connect(this.audioCtx.destination);

        osc.start(now);
        oscHarmonic.start(now);
        osc.stop(now + duration * 1.5);
        oscHarmonic.stop(now + duration * 1.5);
    }
}
