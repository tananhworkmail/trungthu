/**
 * SKY LANTERNS & CELESTIAL CANVAS ENGINE
 * Giả lập bầu trời sao, sao băng, đom đóm và hàng ngàn ngọn thiên đăng lung linh.
 */

class SkyLanternEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.lanterns = [];
        this.stars = [];
        this.fireflies = [];
        this.shootingStars = [];
        
        this.width = 0;
        this.height = 0;
        this.pixelRatio = window.devicePixelRatio || 1;
        
        this.mouse = { x: null, y: null };
        this.isRunning = false;
        
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        // Hỗ trợ tối ưu cho màn hình cảm ứng điện thoại
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouse.x = e.touches[0].clientX;
                this.mouse.y = e.touches[0].clientY;
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        // Tạo các vì sao nền
        this.createStars(180);
        
        // Tạo đom đóm lấp lánh
        this.createFireflies(45);
        
        // Tạo đèn lồng ban đầu
        const initialLanterns = window.innerWidth < 768 ? 16 : 28;
        for (let i = 0; i < initialLanterns; i++) {
            this.addLantern(true);
        }
        
        this.isRunning = true;
        this.animate();
        
        // Thỉnh thoảng xuất hiện sao băng
        setInterval(() => {
            if (Math.random() < 0.6 && this.isRunning) {
                this.addShootingStar();
            }
        }, 3500);

        // Bổ sung đèn lồng theo chu kỳ
        setInterval(() => {
            if (this.lanterns.length < (window.innerWidth < 768 ? 20 : 35)) {
                this.addLantern(false);
            }
        }, 2200);
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * this.pixelRatio;
        this.canvas.height = this.height * this.pixelRatio;
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
    }

    createStars(count) {
        this.stars = [];
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height * 0.75,
                radius: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.03 + 0.008,
                color: Math.random() > 0.8 ? '#ffecd2' : (Math.random() > 0.5 ? '#e0f7fa' : '#ffffff')
            });
        }
    }

    createFireflies(count) {
        this.fireflies = [];
        for (let i = 0; i < count; i++) {
            this.fireflies.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 1.8 + 1,
                vx: (Math.random() - 0.5) * 0.7,
                vy: (Math.random() - 0.5) * 0.7,
                alpha: Math.random() * 0.7 + 0.3,
                pulse: Math.random() * Math.PI,
                pulseSpeed: Math.random() * 0.04 + 0.02
            });
        }
    }

    addLantern(randomY = false, customX = null, customY = null, customWish = null) {
        // Chiều sâu (depth: 0.3 -> 1.0)
        const depth = Math.random() * 0.7 + 0.3;
        const width = (20 + Math.random() * 18) * depth;
        const height = width * 1.35;
        
        const x = customX !== null ? customX : Math.random() * (this.width + 100) - 50;
        const y = customY !== null ? customY : (randomY ? Math.random() * this.height : this.height + height + 50);
        
        // Tốc độ bay
        const speed = (0.35 + Math.random() * 0.55) * depth;
        const swaySpeed = 0.01 + Math.random() * 0.015;
        const swayAmplitude = (15 + Math.random() * 25) * depth;
        
        // Màu sắc đèn lồng (Tông màu vàng rực rỡ và ấm áp mà Mĩ Diên yêu thích)
        const hueTypes = [
            { main: 'rgba(255, 215, 0,',  inner: 'rgba(255, 255, 190,', glow: 'rgba(255, 225, 60,' },  // Vàng hoàng kim lấp lánh
            { main: 'rgba(255, 230, 80,', inner: 'rgba(255, 250, 210,', glow: 'rgba(255, 220, 50,' },  // Vàng bơ dễ thương
            { main: 'rgba(255, 195, 40,', inner: 'rgba(255, 245, 170,', glow: 'rgba(255, 185, 30,' },  // Vàng mật ong ngọt ngào
            { main: 'rgba(255, 175, 50,', inner: 'rgba(255, 235, 160,', glow: 'rgba(255, 160, 40,' }   // Vàng cam ấm áp
        ];
        const colors = hueTypes[Math.floor(Math.random() * hueTypes.length)];

        this.lanterns.push({
            x: x,
            baseX: x,
            y: y,
            width: width,
            height: height,
            depth: depth,
            speed: speed,
            swayAngle: Math.random() * Math.PI * 2,
            swaySpeed: swaySpeed,
            swayAmplitude: swayAmplitude,
            tilt: 0,
            colors: colors,
            flicker: Math.random() * Math.PI,
            wish: customWish,
            glowIntensity: 1.0,
            tailLength: height * 0.45
        });
    }

    addShootingStar() {
        const startX = Math.random() * this.width * 0.8;
        const startY = Math.random() * this.height * 0.3;
        const angle = (Math.PI / 4) + (Math.random() - 0.5) * 0.2;
        const length = 100 + Math.random() * 120;
        const speed = 7 + Math.random() * 5;

        this.shootingStars.push({
            x: startX,
            y: startY,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            length: length,
            life: 1.0,
            decay: 0.015 + Math.random() * 0.01
        });
    }

    spawnCustomWish(wishText, startX = null, startY = null) {
        const x = startX || this.width / 2 + (Math.random() - 0.5) * 120;
        const y = startY || this.height - 40;
        this.addLantern(false, x, y, wishText);
    }

    animate() {
        if (!this.isRunning) return;
        
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 1. Vẽ sao trời lấp lánh
        this.renderStars();
        
        // 2. Vẽ sao băng
        this.renderShootingStars();
        
        // 3. Vẽ đom đóm
        this.renderFireflies();

        // 4. Vẽ đèn lồng lơ lửng
        this.renderLanterns();

        requestAnimationFrame(() => this.animate());
    }

    renderStars() {
        const ctx = this.ctx;
        for (let star of this.stars) {
            star.alpha += Math.sin(Date.now() * star.twinkleSpeed) * 0.015;
            star.alpha = Math.max(0.2, Math.min(1.0, star.alpha));
            
            ctx.fillStyle = star.color;
            ctx.globalAlpha = star.alpha;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
    }

    renderShootingStars() {
        const ctx = this.ctx;
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const s = this.shootingStars[i];
            s.x += s.dx;
            s.y += s.dy;
            s.life -= s.decay;

            if (s.life <= 0 || s.x > this.width || s.y > this.height) {
                this.shootingStars.splice(i, 1);
                continue;
            }

            const tailX = s.x - (s.dx / 10) * s.length;
            const tailY = s.y - (s.dy / 10) * s.length;

            const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
            grad.addColorStop(0, `rgba(255, 255, 255, ${s.life})`);
            grad.addColorStop(0.3, `rgba(255, 220, 150, ${s.life * 0.7})`);
            grad.addColorStop(1, 'rgba(255, 200, 100, 0)');

            ctx.strokeStyle = grad;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(tailX, tailY);
            ctx.stroke();

            // Đầu sao băng phát sáng
            ctx.fillStyle = `rgba(255, 255, 255, ${s.life})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderFireflies() {
        const ctx = this.ctx;
        for (let f of this.fireflies) {
            f.x += f.vx;
            f.y += f.vy;
            f.pulse += f.pulseSpeed;

            if (f.x < 0) f.x = this.width;
            if (f.x > this.width) f.x = 0;
            if (f.y < 0) f.y = this.height;
            if (f.y > this.height) f.y = 0;

            const currentAlpha = Math.max(0.1, (Math.sin(f.pulse) * 0.5 + 0.5) * f.alpha);
            
            // Hào quang đom đóm
            const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius * 4);
            glow.addColorStop(0, `rgba(255, 240, 130, ${currentAlpha})`);
            glow.addColorStop(0.5, `rgba(255, 200, 70, ${currentAlpha * 0.4})`);
            glow.addColorStop(1, 'rgba(255, 180, 50, 0)');

            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.radius * 4, 0, Math.PI * 2);
            ctx.fill();

            // Nhân đom đóm
            ctx.fillStyle = `rgba(255, 255, 230, ${currentAlpha * 1.2})`;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.radius * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    renderLanterns() {
        const ctx = this.ctx;
        
        // Sắp xếp theo chiều sâu để đèn ở xa vẽ trước
        this.lanterns.sort((a, b) => a.depth - b.depth);

        for (let i = this.lanterns.length - 1; i >= 0; i--) {
            const l = this.lanterns[i];
            
            // Cập nhật vị trí
            l.y -= l.speed;
            l.swayAngle += l.swaySpeed;
            l.x = l.baseX + Math.sin(l.swayAngle) * l.swayAmplitude;
            l.tilt = Math.cos(l.swayAngle) * 0.08;
            l.flicker += 0.08;

            // Xóa đèn khi bay khuất khỏi màn hình trên cùng
            if (l.y < -l.height - 80) {
                this.lanterns.splice(i, 1);
                continue;
            }

            // Tương tác nhẹ với con trỏ chuột
            if (this.mouse.x !== null) {
                const distMouse = Math.hypot(this.mouse.x - l.x, this.mouse.y - l.y);
                if (distMouse < 100) {
                    const angle = Math.atan2(l.y - this.mouse.y, l.x - this.mouse.x);
                    l.x += Math.cos(angle) * 1.5;
                    l.y += Math.sin(angle) * 0.8;
                }
            }

            ctx.save();
            ctx.translate(l.x, l.y);
            ctx.rotate(l.tilt);

            const flickerVal = Math.sin(l.flicker) * 0.1 + 0.9;
            const alpha = Math.min(1.0, l.depth * 1.1) * flickerVal;

            // 1. Quầng sáng rực rỡ xung quanh đèn
            const outerGlow = ctx.createRadialGradient(0, 0, l.width * 0.2, 0, 0, l.width * 2.2);
            outerGlow.addColorStop(0, `${l.colors.glow}${0.55 * alpha})`);
            outerGlow.addColorStop(0.5, `${l.colors.glow}${0.18 * alpha})`);
            outerGlow.addColorStop(1, 'rgba(255, 150, 40, 0)');
            
            ctx.fillStyle = outerGlow;
            ctx.beginPath();
            ctx.arc(0, 0, l.width * 2.2, 0, Math.PI * 2);
            ctx.fill();

            // 2. Thân lồng đèn (hình bầu dục thuôn cổ điển)
            const w = l.width;
            const h = l.height;
            
            ctx.beginPath();
            ctx.moveTo(-w * 0.35, -h * 0.5);
            ctx.bezierCurveTo(-w * 0.65, -h * 0.2, -w * 0.65, h * 0.25, -w * 0.35, h * 0.5);
            ctx.lineTo(w * 0.35, h * 0.5);
            ctx.bezierCurveTo(w * 0.65, h * 0.25, w * 0.65, -h * 0.2, w * 0.35, -h * 0.5);
            ctx.closePath();

            // Gradient thân lồng đèn
            const bodyGrad = ctx.createLinearGradient(0, -h * 0.5, 0, h * 0.5);
            bodyGrad.addColorStop(0, `${l.colors.main}${0.85 * alpha})`);
            bodyGrad.addColorStop(0.5, `${l.colors.inner}${0.95 * alpha})`);
            bodyGrad.addColorStop(1, `${l.colors.main}${0.85 * alpha})`);
            
            ctx.fillStyle = bodyGrad;
            ctx.shadowColor = '#ffbb33';
            ctx.shadowBlur = 15 * l.depth;
            ctx.fill();
            ctx.shadowBlur = 0;

            // 3. Khung nẹp tre & vân đèn
            ctx.strokeStyle = `rgba(180, 80, 20, ${0.45 * alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Đường gân giữa của đèn
            ctx.beginPath();
            ctx.moveTo(0, -h * 0.5);
            ctx.lineTo(0, h * 0.5);
            ctx.stroke();

            // 4. Ngọn lửa tim đèn ấm áp ở đáy
            const flameGlow = ctx.createRadialGradient(0, h * 0.32, 1, 0, h * 0.32, w * 0.45);
            flameGlow.addColorStop(0, `rgba(255, 255, 230, ${0.98 * alpha})`);
            flameGlow.addColorStop(0.5, `rgba(255, 200, 70, ${0.75 * alpha})`);
            flameGlow.addColorStop(1, 'rgba(255, 140, 20, 0)');
            
            ctx.fillStyle = flameGlow;
            ctx.beginPath();
            ctx.arc(0, h * 0.32, w * 0.45, 0, Math.PI * 2);
            ctx.fill();

            // 5. Tua rua đuôi đèn hoa đăng đung đưa
            if (l.depth > 0.45) {
                const tasselSway = Math.sin(l.swayAngle * 1.5) * (w * 0.2);
                ctx.strokeStyle = `rgba(230, 80, 40, ${0.75 * alpha})`;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(0, h * 0.5);
                ctx.quadraticCurveTo(tasselSway * 0.5, h * 0.5 + l.tailLength * 0.5, tasselSway, h * 0.5 + l.tailLength);
                ctx.stroke();

                // Hạt ngọc cuối đuôi đèn
                ctx.fillStyle = `rgba(255, 215, 0, ${0.9 * alpha})`;
                ctx.beginPath();
                ctx.arc(tasselSway, h * 0.5 + l.tailLength, 2 * l.depth, 0, Math.PI * 2);
                ctx.fill();
            }

            // 6. Hiển thị chữ điều ước nếu có
            if (l.wish && l.depth > 0.55) {
                ctx.fillStyle = `rgba(255, 250, 220, ${alpha * 0.95})`;
                ctx.font = `600 ${Math.max(11, 13 * l.depth)}px 'Quicksand', sans-serif`;
                ctx.textAlign = 'center';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                ctx.shadowBlur = 4;
                ctx.fillText(l.wish, 0, -h * 0.6);
                ctx.shadowBlur = 0;
            }

            ctx.restore();
        }
    }
}

// Khởi tạo toàn cục
window.SkyLanternEngine = SkyLanternEngine;
