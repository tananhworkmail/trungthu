/**
 * MAIN INTERACTION SCRIPT
 * Quản lý logic tương tác: Màn chào, thư tình gõ chữ, đếm ngày yêu, âm nhạc và bộ sưu tập ảnh.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. ÁP DỤNG THÔNG TIN TỪ CONFIG.JS
    applyConfiguration();

    // 2. KHỞI TẠO CÁC ENGINE CANVAS ĐỒ HỌA
    const lanternEngine = new SkyLanternEngine('sky-canvas');
    const fireworkEngine = new FireworkEngine('firework-canvas');

    // 3. QUẢN LÝ ÂM NHẠC & SYNTHESIZER
    const audioController = new RomanticAudioPlayer(CONFIG.audioSrc);

    // 4. MÀN CHÀO MỞ ĐẦU (CURTAIN OPENING)
    const openingScreen = document.getElementById('opening-screen');
    const startLanternBtn = document.getElementById('start-lantern-btn');
    const mainContent = document.getElementById('main-content');

    startLanternBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Kích hoạt pháo hoa trái tim bùng nổ tại nút
        const rect = startLanternBtn.getBoundingClientRect();
        fireworkEngine.createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 60, true);
        
        // Bắt đầu nhạc
        audioController.play();

        // Ẩn màn hình mở đầu với hiệu ứng mờ dần lung linh
        openingScreen.classList.add('fade-out');
        mainContent.classList.remove('hidden');
        mainContent.classList.add('visible');

        setTimeout(() => {
            openingScreen.style.display = 'none';
        }, 1200);

        // Bắn thêm chùm pháo hoa chúc mừng trên cao
        setTimeout(() => {
            fireworkEngine.createBurst(window.innerWidth * 0.5, window.innerHeight * 0.28, 50, false);
        }, 700);
    });

    // 5. HIỆU ỨNG CHẠM VÀO VẦNG TRĂNG ĐỂ NỞ HOA LẤP LÁNH (CỰC KỲ DỄ THƯƠNG TRÊN MOBILE)
    const moonContainer = document.querySelector('.moon-container');
    if (moonContainer) {
        const triggerMoonBurst = (e) => {
            const rect = moonContainer.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            fireworkEngine.createBurst(x, y, 65, true);
        };
        moonContainer.addEventListener('click', triggerMoonBurst);
    }

    // HIỆU ỨNG CLICK/CHẠM VÀO BẤT KỲ ĐÂU TRÊN BẦU TRỜI ĐỂ TẠO PHÁO HOA/ĐOM ĐÓM
    document.addEventListener('click', (e) => {
        // Tránh click vào các input, button hoặc modal
        if (e.target.closest('button') || e.target.closest('input') || e.target.closest('.interactive-card') || e.target.closest('.moon-container')) {
            return;
        }
        const isHeart = Math.random() < 0.5;
        fireworkEngine.createBurst(e.clientX, e.clientY, 35, isHeart);
    });

    // 6. ĐỒNG HỒ ĐẾM NGÀY YÊU NHAU (LOVE COUNTER)
    initLoveCounter();

    // 7. BỨC THƯ TÌNH DƯỚI TRĂNG (TYPEWRITER LOVE LETTER)
    initLoveLetter();

    // 8. HỘP THẢ THIÊN ĐĂNG ƯỚC NGUYỆN (WISH BOX)
    initWishBox(lanternEngine, fireworkEngine);

    // 9. NÚT ĐIỀU KHIỂN ÂM NHẠC (MUSIC TOGGLE)
    initMusicToggle(audioController);

    // 10. TẠO GALLERY KỶ NIỆM (MEMORIES)
    renderMemoriesGallery();

    // 11. BẬT HIỆU ỨNG TILT 3D CHO CÁC THẺ KÍNH (GLASS CARDS)
    init3DTilt();
});

/**
 * Điền các chuỗi ký tự và tiêu đề từ config.js vào giao diện
 */
function applyConfiguration() {
    // Tên bạn gái & bạn trai
    document.querySelectorAll('.recipient-name').forEach(el => el.textContent = CONFIG.recipientName);
    document.querySelectorAll('.sender-name').forEach(el => el.textContent = CONFIG.senderName);
    
    // Màn mở đầu
    const welcomeTitleEl = document.getElementById('welcome-title');
    if (welcomeTitleEl) welcomeTitleEl.textContent = CONFIG.welcomeTitle;
    
    const welcomeSubtitleEl = document.getElementById('welcome-subtitle');
    if (welcomeSubtitleEl) welcomeSubtitleEl.textContent = CONFIG.welcomeSubtitle;
    
    const lanternPromptEl = document.getElementById('lantern-prompt');
    if (lanternPromptEl) lanternPromptEl.textContent = CONFIG.lanternPrompt;

    // Header chính
    const headerBadgeEl = document.getElementById('header-badge');
    if (headerBadgeEl) headerBadgeEl.textContent = CONFIG.headerBadge;

    const mainHeadlineEl = document.getElementById('main-headline');
    if (mainHeadlineEl) mainHeadlineEl.textContent = CONFIG.mainHeadline;

    const subHeadlineEl = document.getElementById('sub-headline');
    if (subHeadlineEl) subHeadlineEl.textContent = CONFIG.subHeadline;

    // Tiêu đề thư
    const letterTitleEl = document.getElementById('letter-title');
    if (letterTitleEl) letterTitleEl.textContent = CONFIG.letterTitle;
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

    // Phân tích ngày YYYY-MM-DD an toàn cho mọi trình duyệt Mobile (iOS Safari & Chrome)
    const [year, month, day] = CONFIG.anniversaryDate.split('-').map(Number);
    const startDate = new Date(year, month - 1, day, 0, 0, 0);

    if (startDateTextEl) {
        const formattedDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
        startDateTextEl.textContent = formattedDate;
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
        letterModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        startTypewriter();
    });

    closeLetterBtn.addEventListener('click', closeModal);
    letterModal.addEventListener('click', (e) => {
        if (e.target === letterModal) closeModal();
    });

    function closeModal() {
        letterModal.classList.remove('active');
        document.body.style.overflow = '';
        if (typeTimeout) clearTimeout(typeTimeout);
        isTyping = false;
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
    });

    wishInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            sendWishBtn.click();
        }
    });
}

/**
 * Hiển thị danh sách ảnh kỷ niệm với hiệu ứng trăng sao
 */
function renderMemoriesGallery() {
    const galleryGrid = document.getElementById('memories-grid');
    if (!galleryGrid) return;

    galleryGrid.innerHTML = '';

    CONFIG.memories.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card glass-panel';
        card.innerHTML = `
            <div class="memory-img-wrapper">
                <img src="${item.image}" alt="${item.title}" loading="lazy">
                <div class="memory-overlay">
                    <span class="memory-zoom-icon">🔍</span>
                </div>
            </div>
            <div class="memory-info">
                <h4 class="memory-title">${item.title}</h4>
                <p class="memory-desc">${item.desc}</p>
            </div>
        `;

        // Bấm để phóng to ảnh
        card.addEventListener('click', () => {
            openImageLightbox(item.image, item.title, item.desc);
        });

        galleryGrid.appendChild(card);
    });
}

/**
 * Lightbox phóng to ảnh kỷ niệm
 */
function openImageLightbox(src, title, desc) {
    let lightbox = document.getElementById('image-lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'image-lightbox';
        lightbox.className = 'lightbox-modal';
        lightbox.innerHTML = `
            <div class="lightbox-content glass-panel">
                <button class="lightbox-close">&times;</button>
                <img class="lightbox-img" src="" alt="">
                <h3 class="lightbox-title"></h3>
                <p class="lightbox-desc"></p>
            </div>
        `;
        document.body.appendChild(lightbox);

        lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
            lightbox.classList.remove('active');
        });
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) lightbox.classList.remove('active');
        });
    }

    lightbox.querySelector('.lightbox-img').src = src;
    lightbox.querySelector('.lightbox-title').textContent = title;
    lightbox.querySelector('.lightbox-desc').textContent = desc;
    lightbox.classList.add('active');
}

/**
 * Quản lý nút phát / dừng âm nhạc
 */
function initMusicToggle(audioController) {
    const musicBtn = document.getElementById('music-toggle-btn');
    if (!musicBtn) return;

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
        if (isPlaying) {
            musicBtn.classList.add('playing');
        } else {
            musicBtn.classList.remove('playing');
        }
    };
}

/**
 * Hiệu ứng nghiêng 3D (3D Parallax Tilt) khi hover qua các khung kính
 */
function init3DTilt() {
    if (window.innerWidth < 768) return; // Bỏ qua trên mobile để tối ưu pin

    const cards = document.querySelectorAll('.tilt-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -7;
            const rotateY = ((x - centerX) / centerX) * 7;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
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
