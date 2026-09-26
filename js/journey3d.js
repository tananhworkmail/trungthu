import * as THREE from './vendor/three/three.module.min.js';

const TAU = Math.PI * 2, STEP = TAU / 5;
const ORBIT_SPEED = TAU / 45; // One continuous revolution in 45 seconds.
const DRAG_ROTATION = TAU * .6; // 216 degrees across the screen; repeated swipes have no limit.
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const ease = t => t * t * t * (t * (t * 6 - 15) + 10);
const wrap = angle => Math.atan2(Math.sin(angle), Math.cos(angle));

// Five memories on one closed wheel. All artwork stays in the world during rotation.
export class MoonlightJourney {
    constructor(root, elements, onFailure) {
        Object.assign(this, { root, elements, onFailure, time: 0, entry: 0, angle: -.16, baseAngle: -.16, drag: 0, hop: null, failed: false, radius: 7.2, spatial: true, momentum: 0, dragging: false, pitch: 0, basePitch: 0, pitchDrag: 0, pitchMomentum: 0 });
        this.pitchRotation = new THREE.Quaternion();
        this.pitchAxis = V(1, 0, 0);
        this.cameraOffset = V(0, 0, 0);
        this.mobile = matchMedia('(pointer: coarse)').matches || innerWidth < 700;
        this.pixelRatio = Math.min(devicePixelRatio || 1, 2);
        // Keep small world-space lettering legible when adapting to a slower phone.
        this.minimumPixelRatio = Math.min(devicePixelRatio || 1, 1.5);
        this.frameSample = { count: 0, total: 0 };
        this.stations = elements.map((_, i) => this.ringPoint(i * STEP));
        this.world = new THREE.Scene();
        this.world.fog = new THREE.FogExp2(0x070b23, .009);
        this.wheel = new THREE.Group();
        this.world.add(this.wheel);
        this.camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, .15, 180);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'default' });
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setPixelRatio(this.pixelRatio);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.domElement.id = 'journey-webgl';
        this.renderer.domElement.setAttribute('aria-hidden', 'true');
        this.renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); this.fail(); });
        this.labelLayer = document.createElement('div');
        this.labelLayer.className = 'journey-labels spatial-labels';
        this.photos = [];
        this.places = [];
        this.words = [];
        this.textures = [];
        this.world.add(new THREE.HemisphereLight(0xfff4cd, 0x3b2c35, 2.3));
        const light = new THREE.DirectionalLight(0xffe7b6, 3);
        light.position.set(-8, 10, 12);
        this.world.add(light);
        this.glowTexture = this.makeGlow();
        this.buildStars();
        this.buildWheel();
        this.buildMoon();
        this.buildLanterns();
        elements.slice(0, 4).forEach(element => this.labelLayer.appendChild(element));
        root.append(this.renderer.domElement, this.labelLayer);
        root.classList.add('has-3d-world', 'has-orbit-world', 'has-spatial-world');
        root.dataset.renderer = 'webgl';
        root.dataset.worldPlaces = String(elements.length);
        this.resize();
        document.fonts.ready.then(() => {
            if (!this.failed) this.words.forEach((word, i) => this.paintWords(word.material.map, i));
        });
    }

    makeGlow() {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(.12, '#fff9');
        gradient.addColorStop(.4, '#fff2');
        gradient.addColorStop(1, '#fff0');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        const texture = new THREE.CanvasTexture(canvas);
        this.textures.push(texture);
        return texture;
    }

    buildStars() {
        const count = this.mobile ? 1500 : 3200;
        const positions = new Float32Array(count * 3), colors = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions.set([(Math.random() - .5) * 90, (Math.random() - .5) * 65, 15 - Math.random() * 85], i * 3);
            const color = new THREE.Color([0xffed9a, 0xffffff, 0xffd65e][i % 3]);
            colors.set([color.r, color.g, color.b], i * 3);
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.stars = new THREE.Points(geometry, new THREE.PointsMaterial({ size: .13, map: this.glowTexture, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        this.world.add(this.stars);
    }

    ringPoint(angle, radius = this.radius, y = -.6) { return V(Math.sin(angle) * radius, y + .7 * Math.sin(angle * 2), Math.cos(angle) * radius); }

    buildWheel() {
        const loader = new THREE.TextureLoader(), cache = new Map();
        this.stations.forEach((station, i) => {
            const place = new THREE.Group();
            place.position.copy(station);
            place.rotation.y = i * STEP;
            this.places.push(place);
            this.wheel.add(place);
            const source = this.elements[i].querySelector('.scene-art img').getAttribute('src');
            const texture = cache.get(source) || loader.load(source);
            texture.colorSpace = THREE.SRGBColorSpace;
            if (!cache.has(source)) this.textures.push(texture);
            cache.set(source, texture);
            const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: true, alphaTest: .08 });
            material.onBeforeCompile = shader => {
                shader.fragmentShader = shader.fragmentShader.replace('#include <alphamap_fragment>', `#include <alphamap_fragment>
                    vec2 edge = abs(vMapUv - .5) * 2.;
                    diffuseColor.a *= 1. - smoothstep(.65, 1., max(edge.x, edge.y));`);
            };
            const geometry = new THREE.PlaneGeometry(6.6, 6.6, 28, 12);
            const vertices = geometry.attributes.position;
            for (let j = 0; j < vertices.count; j++) {
                const x = vertices.getX(j), y = vertices.getY(j);
                vertices.setZ(j, -(x*x + y*y*.3) * .035);
            }
            const photo = new THREE.Mesh(geometry, material);
            photo.position.set(0, 1.8, 0);
            photo.scale.setScalar(.86);
            this.photos.push(photo);
            place.add(photo);
            const canvas = document.createElement('canvas');
            canvas.width = 2048; canvas.height = 1024;
            const wordsTexture = new THREE.CanvasTexture(canvas);
            wordsTexture.colorSpace = THREE.SRGBColorSpace;
            wordsTexture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
            this.textures.push(wordsTexture);
            this.paintWords(wordsTexture, i);
            const words = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.2), new THREE.MeshBasicMaterial({ map: wordsTexture, transparent: true, depthWrite: false, alphaTest: .015 }));
            words.position.set(0, -2.75, .55);
            place.add(words);
            this.words.push(words);
            // Solid, lit forms establish depth behind and underneath the illustration.
            const island = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 16), new THREE.MeshStandardMaterial({ color: 0x20234c, metalness: .55, roughness: .4, emissive: 0x161438 }));
            island.position.y = -4.1;
            island.scale.set(3.1, .35, 2.15);
            place.add(island);
            const rim = new THREE.Mesh(new THREE.TorusGeometry(2.9, .035, 6, 80), new THREE.MeshBasicMaterial({ color: 0xffd997 }));
            rim.rotation.x = Math.PI / 2;
            rim.scale.y = .72;
            rim.position.y = -3.9;
            place.add(rim);
            const arch = new THREE.Mesh(new THREE.TorusGeometry(3.3, .025, 6, 96, Math.PI * 1.65), new THREE.MeshStandardMaterial({ color: 0xffdfac, emissive: 0xd59244, emissiveIntensity: .5, metalness: .4, roughness: .4 }));
            arch.position.set(0, 1.1, -.6);
            arch.rotation.z = -.32 * Math.PI;
            place.add(arch);
            // The back of each gateway is a spatial heart constellation, not a mirrored image.
            const heartPoints = Array.from({ length: 80 }, (_, n) => {
                const t = n / 80 * TAU;
                return V(1.8 * Math.pow(Math.sin(t), 3), 1.7 + .12 * (13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t)), -.8 + .12 * Math.sin(2*t));
            });
            const heart = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(heartPoints, true), 100, .018, 5, true), new THREE.MeshBasicMaterial({ color: 0xffe9bd }));
            place.add(heart);
            const anchor = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTexture, color: 0xffdfa0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
            anchor.position.copy(station).add(V(0, -4, 0));
            anchor.scale.setScalar(.8);
            this.wheel.add(anchor);
        });
        // Closed curves connect the last memory back to the first.
        this.rings = [];
        for (let band = 0; band < 3; band++) {
            const points = Array.from({ length: 100 }, (_, i) => this.ringPoint(i / 100 * TAU, this.radius + band * .28, -4.6 + band * .10));
            const curve = new THREE.CatmullRomCurve3(points, true);
            const ring = new THREE.Mesh(new THREE.TubeGeometry(curve, 180, band ? .012 : .025, 5, true), new THREE.MeshBasicMaterial({ color: band === 1 ? 0xfff4bf : 0xffd65e, transparent: true, opacity: band ? .42 : .95, blending: THREE.AdditiveBlending, depthWrite: false }));
            this.rings.push(ring);
            this.wheel.add(ring);
        }
        const dust = new Float32Array(700 * 3);
        for (let i = 0; i < 700; i++) {
            const p = this.ringPoint(Math.random() * TAU, this.radius + (Math.random() - .5) * 1.2, -4.6 + (Math.random() - .5) * .55);
            dust.set([p.x, p.y, p.z], i * 3);
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(dust, 3));
        this.dust = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xffe1b0, map: this.glowTexture, size: .12, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
        this.wheel.add(this.dust);
        this.comets = Array.from({ length: 3 }, (_, i) => {
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTexture, color: i ? 0xffdf70 : 0xfff7d4, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
            sprite.scale.setScalar(.7);
            this.wheel.add(sprite);
            return sprite;
        });
        const trailGeometry = new THREE.BufferGeometry();
        trailGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(108 * 3), 3));
        const trailColors = new Float32Array(108 * 3);
        for (let i = 0; i < 108; i++) {
            const fade = Math.pow(1 - (i % 36) / 36, 2);
            trailColors.set([fade, fade * .78, fade * .45], i * 3);
        }
        trailGeometry.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
        this.cometTrails = new THREE.Points(trailGeometry, new THREE.PointsMaterial({ map: this.glowTexture, size: .24, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
        this.cometTrails.frustumCulled = false;
        this.wheel.add(this.cometTrails);
    }

    paintWords(texture, index) {
        const ctx = texture.image.getContext('2d');
        ctx.setTransform(2, 0, 0, 2, 0, 0);
        ctx.clearRect(0, 0, 1024, 512);
        // A feathered shadow behind the whole caption separates letters from stars.
        // There is no blurred glow on the glyphs themselves.
        ctx.save();
        ctx.translate(512, 256);
        ctx.scale(1, .5);
        const shade = ctx.createRadialGradient(0, 0, 80, 0, 0, 512);
        shade.addColorStop(0, '#080916e0');
        shade.addColorStop(.65, '#080916b0');
        shade.addColorStop(1, '#08091600');
        ctx.fillStyle = shade;
        ctx.fillRect(-512, -512, 1024, 1024);
        ctx.restore();
        const copy = this.elements[index].querySelector('.scene-copy');
        ctx.textAlign = 'center';
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#080916';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        const drawLine = (line, y, width = 980) => {
            ctx.strokeText(line, 512, y, width);
            ctx.fillText(line, 512, y, width);
        };
        ctx.fillStyle = '#fff1ad';
        ctx.font = '700 32px Quicksand, sans-serif';
        drawLine(copy.querySelector('.scene-eyebrow').textContent.replace(/^\d+\s*·\s*/, ''), 45, 960);
        ctx.fillStyle = '#fffdf3';
        ctx.font = '700 80px "Playfair Display", Georgia, serif';
        const lines = copy.querySelector('h2').innerHTML.split(/<br\s*\/?\s*>/i).map(line => line.replace(/<[^>]+>/g, ''));
        lines.forEach((line, i) => drawLine(line.trim(), 145 + i * 94));
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 49px Quicksand, sans-serif';
        copy.querySelector('p').innerHTML.split(/<br\s*\/?\s*>/i).forEach((line, i) => drawLine(line.replace(/<[^>]+>/g, '').trim(), 339 + i * 66));
        texture.needsUpdate = true;
    }

    buildMoon() {
        const geometry = new THREE.SphereGeometry(1.12, 36, 28);
        const vertices = geometry.attributes.position, colors = new Float32Array(vertices.count * 3);
        for (let i = 0; i < vertices.count; i++) {
            const p = V(vertices.getX(i), vertices.getY(i), vertices.getZ(i)).normalize();
            const shade = .79 + .13 * Math.sin(p.x * 17) * Math.cos(p.y * 13) * Math.sin(p.z * 11);
            colors.set([shade, shade * .92, shade * .56], i * 3);
        }
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.moon = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, emissive: 0xffd34f, emissiveIntensity: .85, roughness: .95 }));
        this.moon.position.set(0, 6, 0);
        this.world.add(this.moon);
        this.moonHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.glowTexture, color: 0xffdf70, opacity: .72, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
        this.moonHalo.position.copy(this.moon.position).add(V(0, 0, -.5));
        this.moonHalo.scale.setScalar(11);
        this.world.add(this.moonHalo);
    }

    buildLanterns() {
        const count = this.mobile ? 30 : 50;
        const profile = [[.65,-1.2],[.85,-.8],[1,0],[.85,.8],[.65,1.2]].map(([r,y]) => new THREE.Vector2(r,y));
        this.lanternBodies = new THREE.InstancedMesh(new THREE.LatheGeometry(profile, 12), new THREE.MeshStandardMaterial({ color: 0xffce8c, emissive: 0xff942f, emissiveIntensity: .8, roughness: .8 }), count);
        this.lanternCaps = new THREE.InstancedMesh(new THREE.TorusGeometry(.65, .08, 5, 12), new THREE.MeshStandardMaterial({ color: 0x926031 }), count * 2);
        this.lanterns = Array.from({ length: count }, (_, i) => ({ angle: i * 2.399, radius: 6 + Math.random() * 7, y: -4 + Math.random() * 12, size: .10 + Math.random() * .13 }));
        this.dummy = new THREE.Object3D();
        this.capDummy = new THREE.Object3D();
        this.capMatrix = new THREE.Matrix4();
        this.world.add(this.lanternBodies, this.lanternCaps);
    }

    travelTo(index) {
        const destination = this.angle + wrap(index * STEP - this.angle);
        this.baseAngle = destination;
        this.hop = { from: this.angle, to: destination, fromPitch: this.pitch, toPitch: this.pitch + wrap(-this.pitch), elapsed: 0, duration: 1700 + Math.abs(destination - this.angle) * 350 };
        this.basePitch = this.hop.toPitch;
        this.pitchDrag = this.pitchMomentum = 0;
        this.drag = 0;
    }
    setDrag(fraction, vertical = 0) {
        this.drag = -fraction * DRAG_ROTATION;
        // Accumulate an unrestricted angle, including past the poles and full revolutions.
        this.pitchDrag = -vertical * DRAG_ROTATION * this.height / this.width;
    }
    beginDrag() { this.baseAngle = this.angle; this.basePitch = this.pitch; this.hop = null; this.drag = this.pitchDrag = 0; this.dragging = true; this.momentum = this.pitchMomentum = 0; }
    releaseDrag(velocity = 0, verticalVelocity = 0) {
        this.baseAngle = this.angle; this.basePitch = this.pitch;
        this.drag = this.pitchDrag = 0; this.dragging = false;
        this.momentum = Math.max(-1.4, Math.min(1.4, -velocity * 2.8));
        this.pitchMomentum = Math.max(-1.4, Math.min(1.4, -verticalVelocity * 2.8));
    }
    // At an automatic chapter boundary the wheel has already reached the next place.
    arrive(index) { this.baseAngle += wrap(index * STEP - this.baseAngle); }

    resize() {
        this.width = this.root.clientWidth || innerWidth;
        this.height = this.root.clientHeight || innerHeight;
        this.portrait = this.width < 700;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.distance = this.portrait ? Math.max(12.8, 6.4 / (2 * Math.tan(THREE.MathUtils.degToRad(29)) * this.camera.aspect * .86)) : 15;
        this.renderer.setSize(this.width, this.height);
    }

    render(index, progress, pointer, dt, reduced, ambientDt = dt) {
        if (this.failed) return;
        if (this.mobile && dt > 0 && !reduced && this.pixelRatio > this.minimumPixelRatio) {
            this.frameSample.count++;
            this.frameSample.total += dt;
            if (this.frameSample.count >= 90) {
                if (this.frameSample.total / this.frameSample.count > 28) {
                    this.pixelRatio = Math.max(this.minimumPixelRatio, this.pixelRatio - .25);
                    this.renderer.setPixelRatio(this.pixelRatio);
                }
                this.frameSample = { count: 0, total: 0 };
            }
        }
        if (!reduced) { this.time += ambientDt / 1000; this.entry = Math.min(1, this.entry + dt / 2300); }
        else this.entry = 1;
        // Time drives one continuous orbit, independent of chapter/slide timers.
        if (!this.dragging && !this.hop && !reduced) {
            this.baseAngle += dt / 1000 * (ORBIT_SPEED + this.momentum);
            this.momentum *= Math.exp(-dt / 850);
            this.basePitch += dt / 1000 * this.pitchMomentum;
            this.pitchMomentum *= Math.exp(-dt / 850);
        }
        let angle = this.baseAngle + this.drag;
        let pitch = this.basePitch + this.pitchDrag;
        if (this.hop && !reduced) {
            this.hop.elapsed += dt;
            const t = Math.min(1, this.hop.elapsed / this.hop.duration);
            angle = THREE.MathUtils.lerp(this.hop.from, this.hop.to, ease(t));
            pitch = THREE.MathUtils.lerp(this.hop.fromPitch, this.hop.toPitch, ease(t));
            if (t === 1) this.hop = null;
        } else if (reduced) { this.hop = null; angle = this.baseAngle + this.drag; }
        this.angle = angle;
        this.pitch = pitch;
        this.wheel.rotation.y = 0;
        const distance = this.distance + (1 - ease(this.entry)) * 5;
        const pan = reduced ? { x: 0, y: 0 } : pointer;
        const focus = this.ringPoint(angle, this.radius, -.7);
        this.pitchAxis.set(Math.cos(angle), 0, -Math.sin(angle));
        this.pitchRotation.setFromAxisAngle(this.pitchAxis, pitch);
        this.cameraOffset.set(Math.sin(angle) * distance + pan.x * .4, 4.8 + Math.sin(angle * 2) * 1.2 - focus.y - pan.y * .5, Math.cos(angle) * distance);
        this.cameraOffset.applyQuaternion(this.pitchRotation);
        this.camera.position.copy(focus).add(this.cameraOffset);
        // Rotate up along with the camera: no singularity or sudden flip at 90°/270°.
        this.camera.up.set(0, 1, 0).applyQuaternion(this.pitchRotation);
        this.camera.lookAt(focus);
        this.camera.clearViewOffset();
        this.camera.updateMatrixWorld();
        this.moon.rotation.y = this.time * .035;
        this.moonHalo.material.opacity = .72 + Math.sin(this.time * .6) * .06;
        this.stars.rotation.y = this.time * .014;
        this.stars.rotation.z = Math.sin(this.time * .12) * .025;
        this.stars.material.opacity = .82 + Math.sin(this.time * 1.3) * .15;
        this.dust.rotation.y = this.time * .045;
        this.comets.forEach((comet, i) => comet.position.copy(this.ringPoint(this.time * .34 + i * TAU / 3, this.radius + i * .14, -4.55)));
        const trail = this.cometTrails.geometry.attributes.position;
        for (let i = 0; i < 108; i++) {
            const comet = Math.floor(i / 36);
            const p = this.ringPoint(this.time * .34 + comet * TAU / 3 - (i % 36) * .018, this.radius + comet * .14, -4.55);
            trail.setXYZ(i, p.x, p.y, p.z);
        }
        trail.needsUpdate = true;
        this.lanterns.forEach((lantern, i) => {
            const a = lantern.angle + this.time * .025;
            this.dummy.position.set(Math.sin(a) * lantern.radius, lantern.y + Math.sin(this.time * .4 + i) * .4, Math.cos(a) * lantern.radius);
            this.dummy.rotation.set(.08, a, Math.sin(this.time * .5 + i) * .1);
            this.dummy.scale.setScalar(lantern.size);
            this.dummy.updateMatrix();
            this.lanternBodies.setMatrixAt(i, this.dummy.matrix);
            for (let cap = 0; cap < 2; cap++) {
                this.capDummy.position.set(0, cap ? 1.2 : -1.2, 0);
                this.capDummy.rotation.set(Math.PI / 2, 0, 0);
                this.capDummy.updateMatrix();
                this.capMatrix.multiplyMatrices(this.dummy.matrix, this.capDummy.matrix);
                this.lanternCaps.setMatrixAt(i * 2 + cap, this.capMatrix);
            }
        });
        this.lanternBodies.instanceMatrix.needsUpdate = true;
        this.lanternCaps.instanceMatrix.needsUpdate = true;
        this.root.classList.toggle('is-traveling', !!this.hop || this.dragging);
        this.elements[4].inert = !this.root.classList.contains('details-open');
        this.root.dataset.orbitAngle = angle.toFixed(4);
        this.root.dataset.orbitPitch = pitch.toFixed(4);
        this.renderer.render(this.world, this.camera);
    }

    fail() {
        if (this.failed) return;
        this.failed = true;
        const stage = this.root.querySelector('.film-stage');
        this.elements.forEach(element => {
            stage.appendChild(element);
            ['transform', 'display', 'position', 'opacity', 'visibility'].forEach(name => element.style[name] = '');
        });
        this.root.classList.remove('has-3d-world', 'has-orbit-world', 'has-spatial-world', 'is-traveling');
        this.root.dataset.renderer = 'fallback';
        this.renderer.domElement.remove();
        this.labelLayer.remove();
        this.world.traverse(object => {
            object.geometry?.dispose();
            if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(material => material.dispose());
        });
        this.textures.forEach(texture => texture.dispose());
        this.renderer.dispose();
        this.onFailure();
    }
}
