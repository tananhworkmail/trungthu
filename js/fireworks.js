/**
 * FIREWORKS & SPARKLE BURST ENGINE
 * Hiệu ứng pháo hoa ánh sáng lấp lánh và chùm sao tình yêu bung nở khi click/chạm.
 */

class FireworkEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        
        this.particles = [];
        this.pixelRatio = Math.min(window.devicePixelRatio || 1, matchMedia('(pointer: coarse)').matches || innerWidth < 700 ? 1 : 1.5);
        this.frame = null;
        this.width = 0;
        this.height = 0;
        
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * this.pixelRatio;
        this.canvas.height = this.height * this.pixelRatio;
        this.ctx.scale(this.pixelRatio, this.pixelRatio);
    }

    createBurst(x, y, count = 45, isHeart = false) {
        // Tông màu vàng rực rỡ (màu yêu thích của Mĩ Diên) điểm xuyết hồng ngọt ngào
        const colors = [
            '#ffea00', '#ffd60a', '#ffe66d', '#ffdf78', 
            '#ffc300', '#ff9f1c', '#ff758c', '#ff8fa3', '#fff9db'
        ];

        for (let i = 0; i < count; i++) {
            let vx, vy;
            
            if (isHeart) {
                // Quỹ đạo hình trái tim toán học: x = 16 sin^3(t), y = 13 cos(t) - 5 cos(2t)...
                const t = (Math.PI * 2 / count) * i;
                const heartX = 16 * Math.pow(Math.sin(t), 3);
                const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                const speed = 0.18 + Math.random() * 0.05;
                vx = heartX * speed;
                vy = heartY * speed;
            } else {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 5 + 1.5;
                vx = Math.cos(angle) * speed;
                vy = Math.sin(angle) * speed;
            }

            this.particles.push({
                x: x,
                y: y,
                vx: vx,
                vy: vy,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 3 + 1.5,
                alpha: 1,
                decay: Math.random() * 0.02 + 0.012,
                gravity: 0.06,
                drag: 0.96,
                sparkle: Math.random() > 0.5
            });
        }
        if (this.frame === null) this.animate();
    }

    animate() {
        this.frame = null;
        this.ctx.clearRect(0, 0, this.width, this.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.vx *= p.drag;
            p.vy *= p.drag;
            p.vy += p.gravity;
            
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = p.alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.shadowColor = p.color;
            this.ctx.shadowBlur = 10;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Hiệu ứng tia sáng chéo ngôi sao lấp lánh
            if (p.sparkle && p.alpha > 0.4) {
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 0.8;
                this.ctx.beginPath();
                this.ctx.moveTo(p.x - p.size * 2, p.y);
                this.ctx.lineTo(p.x + p.size * 2, p.y);
                this.ctx.moveTo(p.x, p.y - p.size * 2);
                this.ctx.lineTo(p.x, p.y + p.size * 2);
                this.ctx.stroke();
            }

            this.ctx.restore();
        }

        if (this.particles.length) this.frame = requestAnimationFrame(() => this.animate());
    }
}

window.FireworkEngine = FireworkEngine;
