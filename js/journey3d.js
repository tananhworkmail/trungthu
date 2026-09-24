import * as THREE from './vendor/three/three.module.min.js';
import { CSS3DObject, CSS3DRenderer } from './vendor/three/CSS3DRenderer.js';

const smooth = t => t * t * (3 - 2 * t);
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// One persistent world. Chapters are places in it, never separate rendered slides.
export class MoonlightJourney {
    constructor(root, elements, onFailure) {
        this.root = root;
        this.elements = elements;
        this.onFailure = onFailure;
        this.time = 0;
        this.hop = null;
        this.failed = false;
        this.mobile = matchMedia('(pointer: coarse)').matches || innerWidth < 700;
        this.pixelRatio = Math.min(devicePixelRatio || 1, this.mobile ? 1.25 : 1.5);
        this.frameSample = { count: 0, total: 0 };
        this.position = V(0, 0, 16);
        this.target = V(0, 0, 0);
        this.stations = [V(-3,0,0), V(4,1,-28), V(-4,-1,-56), V(3,1,-84), V(0,0,-112)];
        if (this.mobile) this.stations.forEach((station, i) => station.x = [0, .7, -.7, .5, 0][i]);
        this.world = new THREE.Scene();
        this.world.fog = new THREE.FogExp2(0x070b23, .008);
        this.labels = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, .15, 240);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !this.mobile, powerPreference: 'default' });
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setPixelRatio(this.pixelRatio);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.domElement.id = 'journey-webgl';
        this.renderer.domElement.setAttribute('aria-hidden', 'true');
        this.renderer.domElement.addEventListener('webglcontextlost', event => {
            event.preventDefault();
            this.fail();
        });
        this.css = new CSS3DRenderer();
        this.css.domElement.className = 'journey-labels';
        if (this.mobile) this.css.domElement.classList.add('mobile-labels');
        this.cssObjects = [];
        this.photos = [];
        this.moons = [];
        this.orbits = [];
        this.textures = [];
        this.world.add(new THREE.HemisphereLight(0xc5d8ff, 0x302246, 2));
        const sun = new THREE.DirectionalLight(0xffdeb1, 3.5);
        sun.position.set(-12, 14, 8);
        this.world.add(sun);
        this.buildStars();
        this.buildLandmarks();
        this.buildLanterns();
        // Move only the four narrative captions into the same camera's CSS 3D space.
        // The final letter/wish controls stay in a stable screen-space layer.
        elements.slice(0, 4).forEach((element, i) => {
            const object = new CSS3DObject(element);
            this.labels.add(object);
            this.cssObjects.push(object);
        });
        root.append(this.renderer.domElement, this.css.domElement);
        root.classList.add('has-3d-world');
        root.dataset.renderer = 'webgl';
        this.resize();
    }

    buildStars() {
        const count = this.mobile ? 1400 : 4800;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions.set([(Math.random() - .5) * 110, (Math.random() - .5) * 65, 25 - Math.random() * 175], i * 3);
            const color = new THREE.Color([0xdceaff, 0xffdfb5, 0xc1aaff][i % 3]);
            colors.set([color.r, color.g, color.b], i * 3);
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.starMaterial = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: { uTime: { value: 0 }, uRatio: { value: this.pixelRatio } },
            vertexShader: `attribute vec3 color; varying vec3 vColor; varying float vGlow; uniform float uTime; uniform float uRatio;
                void main(){vColor=color;vGlow=.65+.3*sin(uTime*.8+position.x*3.);
                vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;
                gl_PointSize=clamp(38./max(1.,-p.z),1.2,7.)*uRatio;}`,
            fragmentShader: `varying vec3 vColor; varying float vGlow;
                void main(){float d=length(gl_PointCoord-.5);float a=(1.-smoothstep(.06,.5,d))*vGlow;
                gl_FragColor=vec4(vColor,a);}`
        });
        this.world.add(new THREE.Points(geometry, this.starMaterial));
    }

    buildLandmarks() {
        const loader = new THREE.TextureLoader();
        const imageCache = new Map();
        const curvePoints = [];
        this.stations.forEach((station, i) => {
            const group = new THREE.Group();
            group.position.copy(station);
            this.world.add(group);
            const source = this.elements[i].querySelector('.scene-art img').getAttribute('src');
            const texture = imageCache.get(source) || loader.load(source, () => { texture.needsUpdate = true; }, undefined, () => {
                // Preserve the caption and space scenery if an individual picture fails.
                group.userData.imageMissing = true;
            });
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = Math.min(this.mobile ? 1 : 4, this.renderer.capabilities.getMaxAnisotropy());
            if (!imageCache.has(source)) this.textures.push(texture);
            imageCache.set(source, texture);
            const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide });
            material.onBeforeCompile = shader => {
                shader.fragmentShader = shader.fragmentShader.replace('#include <alphamap_fragment>', `#include <alphamap_fragment>
                    vec2 edge=abs(vMapUv-.5)*2.;
                    float feather=1.-smoothstep(.72,1.,max(edge.x,edge.y));
                    diffuseColor.a*=feather;`);
            };
            // A gently curved image surface visibly changes silhouette as we orbit it.
            const geometry = new THREE.PlaneGeometry(8, 8, 40, 1);
            const vertices = geometry.attributes.position;
            for (let j = 0; j < vertices.count; j++) {
                const x = vertices.getX(j);
                vertices.setZ(j, -x * x * .035);
            }
            geometry.computeVertexNormals();
            const photo = new THREE.Mesh(geometry, material);
            photo.position.set(2, .4, 0);
            photo.rotation.y = -.08;
            group.add(photo);
            this.photos.push(photo);
            const moonGeometry = new THREE.SphereGeometry(1.65, this.mobile ? 32 : 64, this.mobile ? 24 : 48);
            const moonVertices = moonGeometry.attributes.position;
            const moonColors = new Float32Array(moonVertices.count * 3);
            const craters = Array.from({ length: 20 }, (_, j) => {
                const z = 1 - 2 * (j + .5) / 20, theta = j * 2.399;
                return { center: V(Math.sqrt(1-z*z)*Math.cos(theta), Math.sqrt(1-z*z)*Math.sin(theta), z), radius: .10 + j % 4 * .045 };
            });
            for (let j = 0; j < moonVertices.count; j++) {
                const normal = V(moonVertices.getX(j), moonVertices.getY(j), moonVertices.getZ(j)).normalize();
                let depression = 0;
                for (const crater of craters) {
                    const d = normal.distanceTo(crater.center) / crater.radius;
                    depression += .055 * Math.exp(-d*d*3) - .012 * Math.exp(-Math.pow((d-.9)*7,2));
                }
                const radius = 1.65 - depression;
                moonVertices.setXYZ(j, normal.x*radius, normal.y*radius, normal.z*radius);
                const shade = Math.max(.62, .94 - depression * 4 + Math.sin(normal.x*37)*Math.cos(normal.y*29)*.025);
                moonColors.set([shade, shade*.86, shade*.62], j*3);
            }
            moonGeometry.setAttribute('color', new THREE.BufferAttribute(moonColors,3));
            moonGeometry.computeVertexNormals();
            const moonMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, emissive: 0xb27b32, emissiveIntensity: .16, roughness: .96 });
            const moon = new THREE.Mesh(moonGeometry, moonMaterial);
            moon.position.set(-4.7, 3.4, -3);
            group.add(moon);
            this.moons.push(moon);
            const orbit = new THREE.Group();
            orbit.position.set(0, -.2, -1.5);
            for (let j = 0; j < 2; j++) {
                const ring = new THREE.Mesh(new THREE.TorusGeometry(6 + j * .65, .006, 6, 128), new THREE.MeshBasicMaterial({ color: j ? 0x9d95ec : 0xe2c59c, transparent: true, opacity: .6 }));
                ring.rotation.set(.6 + j * .8, .5, j * .7);
                orbit.add(ring);
            }
            group.add(orbit);
            this.orbits.push(orbit);
            curvePoints.push(station.clone().add(V(0,-4.5,0)));
        });
        const path = new THREE.CatmullRomCurve3(curvePoints);
        this.world.add(new THREE.Mesh(new THREE.TubeGeometry(path, 220, .022, 6, false), new THREE.MeshBasicMaterial({ color: 0xd7b5ff, transparent: true, opacity: .55 })));
        // Sparkles along the route establish the distance between the five places.
        const route = path.getPoints(260);
        const geometry = new THREE.BufferGeometry().setFromPoints(route);
        this.world.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xffe7bd, size: .10, transparent: true, opacity: .75 })));
    }

    buildLanterns() {
        const count = this.mobile ? 30 : 74;
        const profile = [[.65,-1.2],[.82,-1],[.97,-.55],[1,0],[.95,.6],[.8,1],[.65,1.2]].map(([r,y]) => new THREE.Vector2(r,y));
        const bodyGeometry = new THREE.LatheGeometry(profile, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffcb79, emissive: 0xff8d29, emissiveIntensity: .65, roughness: .8 });
        this.lanternBodies = new THREE.InstancedMesh(bodyGeometry, bodyMaterial, count);
        this.lanternCaps = new THREE.InstancedMesh(new THREE.TorusGeometry(1, .10, 6, 16), new THREE.MeshStandardMaterial({ color: 0x805127, roughness: .7 }), count * 2);
        this.lanterns = [];
        for (let i = 0; i < count; i++) {
            const station = this.stations[i % 5];
            const angle = i * 2.399;
            const radius = this.mobile ? 2.6 + Math.random() * 4 : 4.5 + Math.random() * 8;
            this.lanterns.push({ x: station.x + Math.cos(angle) * radius, y: Math.sin(angle) * 5, z: station.z + 10 - Math.random() * 26, size: .13 + Math.random() * .23, phase: Math.random() * Math.PI * 2 });
        }
        this.dummy = new THREE.Object3D();
        this.capDummy = new THREE.Object3D();
        this.capMatrix = new THREE.Matrix4();
        this.world.add(this.lanternBodies, this.lanternCaps);
    }

    view(index, phase) {
        const s = this.stations[index];
        const portrait = this.portrait;
        const arc = portrait ? .42 : 1.5;
        return {
            position: s.clone().add(V((phase - .5) * arc * 2, .7 + Math.sin(phase * Math.PI) * .4, (portrait ? this.portraitDistance : 13.5) - phase * (portrait ? .8 : 1.6))),
            target: s.clone().add(V(portrait ? 0 : .3, portrait ? .3 : .4, 0))
        };
    }

    pose(index, progress) {
        if (index === 4) return this.view(4, .25);
        if (progress < .57) return this.view(index, progress / .57);
        const t = smooth((progress - .57) / .43);
        const from = this.view(index, 1), to = this.view(index + 1, index === 3 ? .25 : 0);
        const curve = new THREE.CubicBezierCurve3(from.position,
            from.position.clone().add(V(this.portrait ? 1.8 : 8, 3, -9)),
            to.position.clone().add(V(this.portrait ? -1.5 : -7, 2, 9)), to.position);
        return { position: curve.getPoint(t), target: from.target.lerp(to.target, t), roll: Math.sin(t * Math.PI * 2) * (this.portrait ? .025 : .07) };
    }

    travelTo(index) {
        this.hop = { from: this.position.clone(), target: this.target.clone(), index, elapsed: 0 };
    }

    resize() {
        const width = this.root.clientWidth || innerWidth;
        const height = this.root.clientHeight || innerHeight;
        this.width = width;
        this.height = height;
        this.portrait = width < 700;
        this.camera.aspect = width / height;
        const field = 2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
        // Fit the couple to a narrow phone, including unusually tall displays.
        this.portraitDistance = Math.max(15.8, 7.2 / (field * this.camera.aspect * .86));
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.css.setSize(width, height);
        this.photos.forEach((photo, i) => {
            photo.position.set(this.portrait ? 0 : 2, this.portrait ? .3 + .15 * field * this.portraitDistance : .4, 0);
            photo.scale.setScalar(this.portrait ? .86 : 1);
            photo.material.opacity = i === 4 ? .5 : 1;
        });
        this.cssObjects.forEach((label, i) => {
            const depth = this.portraitDistance - 3;
            label.position.copy(this.stations[i]).add(this.portrait ? V(0, .3 - .20 * field * depth, 3) : V(-4.4,.2,3));
            label.scale.setScalar(this.portrait ? .86 * this.camera.aspect * field * depth / 310 : .0118);
            label.rotation.y = this.portrait ? 0 : .06;
        });
        this.moons.forEach(moon => {
            moon.position.set(this.portrait ? -2.4 : -4.7, this.portrait ? .3 + .29 * field * this.portraitDistance : 3.4, -3);
            moon.scale.setScalar(this.portrait ? .68 : 1);
        });
    }

    render(index, progress, pointer, dt, reduced) {
        if (this.failed) return;
        // Lower fill cost on slower phones without changing the camera path or captions.
        if (this.mobile && dt > 0 && !reduced && this.pixelRatio > .85) {
            this.frameSample.count++;
            this.frameSample.total += dt;
            if (this.frameSample.count >= 90) {
                if (this.frameSample.total / this.frameSample.count > 28) {
                    this.pixelRatio = this.pixelRatio > 1 ? 1 : .85;
                    this.renderer.setPixelRatio(this.pixelRatio);
                    this.starMaterial.uniforms.uRatio.value = this.pixelRatio;
                }
                this.frameSample = { count: 0, total: 0 };
            }
        }
        if (!reduced) this.time += dt / 1000;
        let pose = reduced ? this.view(index, .25) : this.pose(index, progress);
        if (this.hop && !reduced) {
            this.hop.elapsed += dt;
            const t = smooth(Math.min(1, this.hop.elapsed / 2400));
            const destination = this.view(this.hop.index, this.hop.index === 4 ? .25 : 0);
            const curve = new THREE.CubicBezierCurve3(this.hop.from,
                this.hop.from.clone().add(V(this.portrait ? 1.5 : 6,4,-6)), destination.position.clone().add(V(this.portrait ? -1.5 : -5,2,6)), destination.position);
            pose = { position: curve.getPoint(t), target: this.hop.target.clone().lerp(destination.target, t) };
            if (t === 1) this.hop = null;
        } else if (reduced) this.hop = null;
        this.position.copy(pose.position);
        this.target.copy(pose.target);
        this.camera.position.copy(this.position);
        if (!reduced) this.camera.position.add(V(pointer.x * (this.portrait ? .7 : 1.8), -pointer.y * .7, 0));
        this.camera.lookAt(this.target);
        if (pose.roll) this.camera.rotateZ(pose.roll);
        this.camera.updateMatrixWorld();
        this.starMaterial.uniforms.uTime.value = this.time;
        this.orbits.forEach((orbit, i) => { orbit.rotation.y = Math.sin(this.time * .06 + i) * .25; });
        this.lanterns.forEach((lantern, i) => {
            const y = lantern.y + Math.sin(this.time * .4 + lantern.phase) * .65;
            this.dummy.position.set(lantern.x + Math.sin(this.time * .25 + lantern.phase) * .3, y, lantern.z);
            this.dummy.rotation.set(.1, this.time * .08 + lantern.phase, Math.sin(this.time * .4 + lantern.phase) * .13);
            this.dummy.scale.setScalar(lantern.size);
            this.dummy.updateMatrix(); this.lanternBodies.setMatrixAt(i, this.dummy.matrix);
            for (let cap = 0; cap < 2; cap++) {
                this.capDummy.position.set(0, (cap ? 1 : -1) * 1.2, 0);
                this.capDummy.rotation.set(Math.PI / 2,0,0);
                this.capDummy.scale.setScalar(.65);
                this.capDummy.updateMatrix();
                this.capMatrix.multiplyMatrices(this.dummy.matrix, this.capDummy.matrix);
                this.lanternCaps.setMatrixAt(i * 2 + cap, this.capMatrix);
            }
        });
        this.lanternBodies.instanceMatrix.needsUpdate = true;
        this.lanternCaps.instanceMatrix.needsUpdate = true;
        this.cssObjects.forEach((label, i) => {
            const distance = this.camera.position.distanceTo(this.stations[i]);
            const point = this.stations[i].clone().project(this.camera);
            label.visible = distance < Math.max(23, this.portraitDistance + 4) && point.z < 1 && point.z > -1 && (reduced ? i === index : true);
            label.element.inert = i !== index || !!this.hop;
            label.element.setAttribute('aria-hidden', String(i !== index));
        });
        this.root.classList.toggle('is-traveling', !!this.hop || (index < 4 && progress > .57));
        this.elements[4].inert = index !== 4 || !!this.hop;
        this.root.dataset.cameraZ = this.position.z.toFixed(2);
        this.root.dataset.worldPlaces = String(this.stations.length);
        this.renderer.render(this.world, this.camera);
        if (this.mobile) this.renderMobileLabels();
        else this.css.render(this.labels, this.camera);
    }

    renderMobileLabels() {
        // Project the same world positions into pixels. This avoids nested CSS 3D
        // flattening on mobile WebKit while retaining the camera's depth and motion.
        const focal = this.height / (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)));
        this.cssObjects.forEach(label => {
            const element = label.element;
            if (element.parentElement !== this.css.domElement) this.css.domElement.appendChild(element);
            const local = label.position.clone().applyMatrix4(this.camera.matrixWorldInverse);
            const visible = label.visible && local.z < -.5;
            element.style.display = visible ? '' : 'none';
            if (!visible) return;
            const point = label.position.clone().project(this.camera);
            const scale = focal * label.scale.x / -local.z;
            element.style.transform = `translate(${(point.x + 1) * this.width / 2}px, ${(1 - point.y) * this.height / 2}px) translate(-50%, -50%) scale(${scale})`;
            element.style.opacity = String(Math.min(1, Math.max(0, (-local.z - 2) / 4)));
        });
    }

    fail() {
        if (this.failed) return;
        this.failed = true;
        const stage = this.root.querySelector('.film-stage');
        this.elements.forEach(element => {
            stage.appendChild(element);
            element.style.transform = '';
            element.style.display = '';
            element.style.position = '';
            element.style.opacity = '';
        });
        this.root.classList.remove('has-3d-world', 'is-traveling');
        this.root.dataset.renderer = 'fallback';
        this.renderer.domElement.remove();
        this.css.domElement.remove();
        this.world.traverse(object => {
            object.geometry?.dispose();
            if (object.material) (Array.isArray(object.material) ? object.material : [object.material]).forEach(m => m.dispose());
        });
        this.textures.forEach(texture => texture.dispose());
        this.renderer.dispose();
        this.onFailure();
    }
}
