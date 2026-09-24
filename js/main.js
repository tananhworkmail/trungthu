/**
 * MAIN INTERACTION SCRIPT
 * Quản lý logic tương tác: Màn chào, thư tình gõ chữ, đếm ngày yêu, âm nhạc và bộ sưu tập ảnh.
 */

document.addEventListener('DOMContentLoaded', () => {
    applyConfiguration();
    const audioController = new RomanticAudioPlayer(CONFIG.audioSrc);
    const film = new MoonlightCinema();
    const opening = document.getElementById('opening-screen');
    let entering = false;
    const enterFilm = () => {
        if (entering) return;
        entering = true;
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
    document.getElementById('skip-opening-btn').addEventListener('click', enterFilm);
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
    initMusicToggle(audioController);
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
    const startDateTextEl = document.getElementById('start-date-text');

    if (!daysEl) return;

    // ISO timestamp with an explicit offset keeps the instant identical worldwide.
    const [year, month, day] = CONFIG.anniversaryDate.split('-').map(Number);
    const startTime = CONFIG.anniversaryTime;
    const startTimestamp = `${CONFIG.anniversaryDate}T${startTime}:00${CONFIG.anniversaryUtcOffset}`;
    const startDate = new Date(startTimestamp);

    if (startDateTextEl) {
        const formattedDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
        startDateTextEl.textContent = `${startTime} · ${formattedDate}`;
        startDateTextEl.setAttribute('datetime', startTimestamp);
        startDateTextEl.title = 'Giờ Việt Nam (UTC+7)';
    }

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
 * Quản lý Bức thư tình dưới ánh trăng với hiệu ứng Typewriter
 */
function initLoveLetter() {
    const openLetterBtn = document.getElementById('open-letter-btn');
    const letterModal = document.getElementById('letter-modal');
    const closeLetterBtn = document.getElementById('close-letter-btn');
    const letterBody = document.getElementById('letter-body');

    if (!openLetterBtn || !letterModal) return;

    let isTyping = false;
    let typeTimeout = null;

    openLetterBtn.addEventListener('click', () => {
        letterModal.inert = false;
        letterModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        startTypewriter();
        closeLetterBtn.focus();
    });

    closeLetterBtn.addEventListener('click', closeModal);
    letterModal.addEventListener('click', (e) => {
        if (e.target === letterModal) closeModal();
    });
    letterModal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'Tab') { e.preventDefault(); closeLetterBtn.focus(); }
    });

    function closeModal() {
        letterModal.classList.remove('active');
        letterModal.inert = true;
        document.body.style.overflow = '';
        if (typeTimeout) clearTimeout(typeTimeout);
        isTyping = false;
        openLetterBtn.focus({ preventScroll: true });
    }

    function startTypewriter() {
        letterBody.innerHTML = '';
        isTyping = true;
        
        let pIndex = 0;
        let charIndex = 0;
        const paragraphs = CONFIG.letterContent;

        function typeNext() {
            if (!isTyping) return;

            if (pIndex < paragraphs.length) {
                let currentP = letterBody.children[pIndex];
                if (!currentP) {
                    currentP = document.createElement('p');
                    currentP.className = 'letter-paragraph';
                    letterBody.appendChild(currentP);
                }

                const currentText = paragraphs[pIndex];
                if (charIndex < currentText.length) {
                    currentP.textContent += currentText.charAt(charIndex);
                    charIndex++;
                    typeTimeout = setTimeout(typeNext, 25);
                } else {
                    pIndex++;
                    charIndex = 0;
                    typeTimeout = setTimeout(typeNext, 280);
                }
            } else {
                // Thêm chữ ký tình yêu
                const signEl = document.createElement('div');
                signEl.className = 'letter-signature';
                signEl.innerHTML = `Mãi yêu em,<br><span class="signature-name">${CONFIG.senderName}</span>`;
                letterBody.appendChild(signEl);
                isTyping = false;
            }
        }

        typeNext();
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

    if (!sendWishBtn) return;

    // Chọn gợi ý điều ước nhanh
    presetPills.forEach(pill => {
        pill.addEventListener('click', () => {
            wishInput.value = pill.textContent.replace(/^[\s✨💖🌸🌙💕]+/, '').trim();
            wishInput.focus();
        });
    });

    sendWishBtn.addEventListener('click', () => {
        const text = wishInput.value.trim();
        if (!text) {
            wishInput.focus();
            return;
        }

        // Tạo đèn ước vút lên trời
        const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 160;
        const startY = window.innerHeight - 20;
        lanternEngine.spawnCustomWish(text, startX, startY);

        // Hiệu ứng pháo hoa chúc mừng điều ước
        fireworkEngine.createBurst(startX, window.innerHeight * 0.65, 45, true);

        // Hiển thị thông báo cảm xúc
        wishFeedback.textContent = `✨ Điều ước: "${text}" đã được gửi lên vầng trăng! Chúc điều ước sớm thành hiện thực ❤️`;
        wishFeedback.classList.add('show');
        
        // Gửi lên server PHP (InfinityFree) nếu có backend
        try {
            fetch('api/wish.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wish: text,
                    author: CONFIG.recipientName
                })
            }).catch(() => {
                // Môi trường offline hoặc mở file:// tĩnh, không ảnh hưởng trải nghiệm
            });
        } catch (err) {}

        // Lưu backup vào LocalStorage
        try {
            const localWishes = JSON.parse(localStorage.getItem('midautumn_wishes') || '[]');
            localWishes.unshift({ wish: text, time: new Date().toISOString() });
            localStorage.setItem('midautumn_wishes', JSON.stringify(localWishes.slice(0, 20)));
        } catch (e) {}

        setTimeout(() => {
            wishFeedback.classList.remove('show');
        }, 5000);

        wishInput.value = '';
        wishInput.blur();
    });

    wishInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendWishBtn.click();
        }
    });
}

/**
 * Quản lý nút phát / dừng âm nhạc
 */
function initMusicToggle(audioController) {
    const musicBtn = document.getElementById('music-toggle-btn');
    if (!musicBtn) return;
    musicBtn.setAttribute('aria-pressed', 'false');

    musicBtn.addEventListener('click', () => {
        if (audioController.isPlaying) {
            audioController.pause();
            musicBtn.classList.remove('playing');
        } else {
            audioController.play();
            musicBtn.classList.add('playing');
        }
    });

    // Khi nhạc bắt đầu phát
    audioController.onPlayStateChange = (isPlaying) => {
        document.getElementById('music-label').textContent = isPlaying ? 'Tắt nhạc' : 'Bật nhạc';
        musicBtn.setAttribute('aria-pressed', String(isPlaying));
        if (isPlaying) {
            musicBtn.classList.add('playing');
        } else {
            musicBtn.classList.remove('playing');
        }
    };
}

/**
 * CLASS QUẢN LÝ ÂM THANH KÉP (HTML5 Audio + Web Audio Synth Fallback)
 * Nếu file mp3 không tìm thấy hoặc chưa tải, tự động tấu giai điệu Music Box piano lãng mạn.
 */
class RomanticAudioPlayer {
    constructor(src) {
        this.src = src;
        this.audio = new Audio();
        this.audio.loop = true;
        this.audio.src = src;
        
        this.isPlaying = false;
        this.isSynth = false;
        this.audioCtx = null;
        this.synthTimer = null;
        this.onPlayStateChange = null;

        // Lắng nghe lỗi nạp file âm thanh để chuyển sang synth
        this.audio.addEventListener('error', () => {
            this.isSynth = true;
            if (this.isPlaying) {
                this.playSynthMelody();
            }
        });
    }

    play() {
        this.isPlaying = true;
        if (this.onPlayStateChange) this.onPlayStateChange(true);

        if (!this.isSynth) {
            const promise = this.audio.play();
            if (promise !== undefined) {
                promise.catch(() => {
                    // Trình duyệt chặn autoplay hoặc file không tồn tại
                    this.isSynth = true;
                    this.playSynthMelody();
                });
            }
        } else {
            this.playSynthMelody();
        }
    }

    pause() {
        this.isPlaying = false;
        if (this.onPlayStateChange) this.onPlayStateChange(false);

        if (!this.isSynth) {
            this.audio.pause();
        } else {
            if (this.synthTimer) clearTimeout(this.synthTimer);
            if (this.audioCtx && this.audioCtx.state === 'running') {
                this.audioCtx.suspend();
            }
        }
    }

    playSynthMelody() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();
        } else if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

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
