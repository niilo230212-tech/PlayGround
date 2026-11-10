import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

const mount = document.querySelector('#game');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x899a9b);
scene.fog = new THREE.Fog(0x899a9b, 180, 1250);
const camera = new THREE.PerspectiveCamera(56, innerWidth / innerHeight, 0.1, 1800);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
mount.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdce9ee, 0x384239, 2.2));
const sun = new THREE.DirectionalLight(0xffe6c6, 2.8);
sun.position.set(-80, 120, 160);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -32; sun.shadow.camera.right = 32;
sun.shadow.camera.top = 48; sun.shadow.camera.bottom = -24;
scene.add(sun);
const material = (color, roughness = .8, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const mats = {
  road: material(0x303738, .95), shoulder: material(0x8c8b7d), stripe: material(0xe5e2d5),
  grass: material(0x53644d), ocean: material(0x42636a, .32, .2), rail: material(0x858d89, .45, .55),
  tree: [material(0x263e36), material(0x324a3b), material(0x405344)], trunk: material(0x554535),
  dark: material(0x111618), metal: material(0xa6adab, .32, .8), glass: new THREE.MeshPhysicalMaterial({ color: 0x172b32, metalness: .4, roughness: .16, clearcoat: .8 }),
  paint: new THREE.MeshPhysicalMaterial({ color: 0xa51d1c, metalness: .68, roughness: .22, clearcoat: 1 }), rubber: material(0x111313, .84)
};
function box(parent, x, y, z, sx, sy, sz, mat) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function roadCenter(z) { return Math.sin(z * .0019) * 13 + Math.sin(z * .0062) * 2.1 + Math.sin(z * .0007) * 7; }

// Coastal setting: ocean, distant headlands, roadside forest and winding asphalt.
const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 9000), mats.grass);
ground.rotation.x = -Math.PI / 2; ground.position.set(0, -.32, 3500); ground.receiveShadow = true; scene.add(ground);
const sea = new THREE.Mesh(new THREE.PlaneGeometry(1800, 9000), mats.ocean);
sea.rotation.x = -Math.PI / 2; sea.position.set(-980, -.22, 3500); scene.add(sea);
for (let row = 0; row < 3; row++) {
  const shape = new THREE.Shape(); shape.moveTo(-1500, -40);
  for (let i = 0; i <= 42; i++) {
    const x = -1500 + i * 80;
    shape.lineTo(x, 24 + Math.sin(i * .62 + row) * 19 + Math.cos(i * .21) * 24);
  }
  shape.lineTo(1900, -40); shape.lineTo(-1500, -40);
  const hill = new THREE.Mesh(new THREE.ShapeGeometry(shape), material([0x647773, 0x718078, 0x7d8177][row]));
  hill.position.set(0, 0, -330 + row * 80); scene.add(hill);
}
const sunBall = new THREE.Mesh(new THREE.SphereGeometry(23, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffe2b1 }));
sunBall.position.set(-170, 100, -260); scene.add(sunBall);
for (let i = 0; i < 290; i++) {
  const z = -240 + i * 22, c = roadCenter(z + 11), group = new THREE.Group();
  group.position.set(c, 0, z); scene.add(group);
  const asphalt = new THREE.Mesh(new THREE.BoxGeometry(13, .25, 22.25), mats.road);
  asphalt.position.y = -.04; asphalt.receiveShadow = true; group.add(asphalt);
  for (const side of [-1, 1]) {
    const edge = new THREE.Mesh(new THREE.BoxGeometry(.24, .035, 22), mats.stripe);
    edge.position.set(side * 6.13, .105, 0); group.add(edge);
    const shoulder = new THREE.Mesh(new THREE.BoxGeometry(1.6, .18, 22), mats.shoulder);
    shoulder.position.set(side * 7.3, -.08, 0); group.add(shoulder);
  }
  if (i % 2 === 0) { const dash = new THREE.Mesh(new THREE.BoxGeometry(.14, .04, 8), mats.stripe); dash.position.set(0, .115, 0); group.add(dash); }
}
for (let i = 0; i < 160; i++) {
  const z = -180 + i * 40, c = roadCenter(z);
  for (const side of [-1, 1]) {
    if (side < 0 && i % 6 === 0) continue;
    const post = box(scene, c + side * 8.5, .52, z, .13, 1.04, .16, mats.rail);
    post.position.x = c + side * 8.5;
    box(scene, c + side * 8.5, .86, z, .16, .18, 39, mats.rail);
  }
}
for (let i = 0; i < 205; i++) {
  const z = -150 + i * 29 + (Math.random() - .5) * 12, c = roadCenter(z);
  for (const side of [-1, 1]) {
    if (side < 0 && i % 3 === 0) continue;
    const x = c + side * (13 + Math.random() * 18), scale = .7 + Math.random() * .75;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.13, .23, 2.4, 7), mats.trunk);
    trunk.position.set(x, 1.1 * scale, z); trunk.scale.setScalar(scale); trunk.castShadow = true; scene.add(trunk);
    for (let j = 0; j < 3; j++) {
      const crown = new THREE.Mesh(new THREE.ConeGeometry(1.45 - j * .2, 2.6, 8), mats.tree[(i + j) % mats.tree.length]);
      crown.position.set(x, (2.1 + j * 1.12) * scale, z); crown.scale.setScalar(scale); crown.castShadow = true; scene.add(crown);
    }
  }
}
for (let i = 0; i < 32; i++) {
  const z = -100 + i * 185, c = roadCenter(z);
  for (const side of [-1, 1]) {
    if (side < 0 && i % 2) continue;
    box(scene, c + side * 9.2, 3.2, z, .13, 6.4, .13, mats.rail);
    box(scene, c + side * 9.2 - side * .75, 6.35, z, 1.5, .12, .13, mats.rail);
  }
}

// Player GT coupe, with sculpted body, glasshouse, alloy wheels and lights.
const player = new THREE.Group(); scene.add(player);
const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, .53, 4), mats.paint);
body.position.y = .52; body.castShadow = true; player.add(body);
const hood = new THREE.Mesh(new THREE.BoxGeometry(1.7, .23, 1.45), mats.paint); hood.position.set(0, .81, 1.13); player.add(hood);
const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.34, .58, 1.83), mats.glass); cabin.position.set(0, 1.13, -.15); cabin.castShadow = true; player.add(cabin);
const roof = box(player, 0, 1.44, -.18, 1.15, .12, 1.12, mats.paint);
box(player, 0, .35, 2.03, 1.35, .18, .08, mats.dark);
box(player, 0, .52, 2.08, .5, .1, .05, mats.metal);
box(player, 0, 1.03, -1.78, 1.72, .12, .16, mats.paint);
const wheels = [];
for (const side of [-1, 1]) for (const z of [-1.28, 1.28]) {
  const wheel = new THREE.Group(); wheel.position.set(side * .94, .42, z); player.add(wheel);
  const tire = new THREE.Mesh(new THREE.CylinderGeometry(.39, .39, .27, 20), mats.rubber); tire.rotation.z = Math.PI / 2; tire.castShadow = true; wheel.add(tire);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .29, 14), mats.metal); rim.rotation.z = Math.PI / 2; wheel.add(rim); wheels.push(wheel);
}
for (const side of [-1, 1]) {
  const head = new THREE.Mesh(new THREE.BoxGeometry(.48, .12, .07), new THREE.MeshBasicMaterial({ color: 0xe9f7ff }));
  head.position.set(side * .61, .68, 2.03); player.add(head);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(.46, .13, .07), new THREE.MeshBasicMaterial({ color: 0xff3128 }));
  tail.position.set(side * .62, .68, -2.03); player.add(tail);
}

// Civilian traffic, arranged in three lanes ahead and recycled as it passes.
const traffic = [];
const trafficColors = [0xd4d1c6, 0x263e48, 0x9c692d, 0x50625a, 0x282b30].map(c => material(c, .34, .48));
function makeTraffic(z, lane, index) {
  const car = new THREE.Group(), paint = trafficColors[index % trafficColors.length];
  box(car, 0, .49, 0, 1.75, .55, 4, paint);
  box(car, 0, .88, -.2, 1.42, .53, 1.8, mats.glass);
  for (const side of [-1, 1]) {
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(.4, .12, .06), new THREE.MeshBasicMaterial({ color: 0xff352a }));
    lamp.position.set(side * .58, .64, -2.02); car.add(lamp);
    for (const wz of [-1.2, 1.2]) {
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .22, 12), mats.rubber);
      tire.rotation.z = Math.PI / 2; tire.position.set(side * .9, .37, wz); car.add(tire);
    }
  }
  car.userData = { z, lane, passed: false, speed: 20 + Math.random() * 14 };
  car.position.set(roadCenter(z) + lane, 0, z); scene.add(car); traffic.push(car);
}
for (let i = 0; i < 13; i++) makeTraffic(90 + i * 125, [-3.35, 0, 3.35][Math.floor(Math.random() * 3)], i);

const ui = {
  screen: document.querySelector('#screen'), start: document.querySelector('#start'), title: document.querySelector('#title'),
  desc: document.querySelector('#desc'), hud: document.querySelector('#hud'), speed: document.querySelector('#speed'),
  gear: document.querySelector('#gear'), dist: document.querySelector('#distance'), timer: document.querySelector('#timer'),
  throttle: document.querySelector('#throttle'), pause: document.querySelector('#pause'), note: document.querySelector('#note'), flash: document.querySelector('#flash')
};
let started = false, paused = false, dead = false, elapsed = 0, runDistance = 0, speed = 0, steer = 0, lateral = 0, noteTime = 0;
const keys = {};
addEventListener('keydown', e => {
  keys[e.code] = true;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
  if (e.code === 'KeyR' && dead) resetGame();
}, { passive: false });
addEventListener('keyup', e => { keys[e.code] = false; });
function bindHold(id, key) {
  const el = document.querySelector(id);
  el.addEventListener('pointerdown', e => { e.preventDefault(); keys[key] = true; el.setPointerCapture(e.pointerId); });
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) el.addEventListener(name, () => { keys[key] = false; });
}
bindHold('#left', 'ArrowLeft'); bindHold('#right', 'ArrowRight'); bindHold('#gas', 'ArrowUp');
ui.start.addEventListener('click', () => {
  if (dead) { resetGame(); return; }
  if (paused) { togglePause(); return; }
  started = true; ui.screen.classList.add('hidden'); ui.hud.classList.add('active'); ui.pause.classList.add('on'); speed = 8;
});
ui.pause.addEventListener('click', togglePause);
function togglePause() {
  if (!started || dead) return;
  paused = !paused;
  if (paused) {
    ui.title.innerHTML = 'TAKE A<span>BREATHER.</span>'; ui.desc.textContent = 'The road will wait. Catch your breath, then get back out there.';
    ui.start.innerHTML = '<span>RESUME DRIVE</span><span class="arrow">↗</span>'; ui.screen.classList.remove('hidden');
  } else ui.screen.classList.add('hidden');
}
function resetGame() {
  started = false; paused = false; dead = false; elapsed = 0; runDistance = 0; speed = 0; lateral = 0; steer = 0;
  player.position.set(roadCenter(0), 0, 0);
  traffic.forEach((car, i) => { car.userData.z = 100 + i * 125; car.userData.lane = [-3.35, 0, 3.35][i % 3]; car.userData.passed = false; car.position.set(roadCenter(car.userData.z) + car.userData.lane, 0, car.userData.z); });
  ui.title.innerHTML = 'NIGHT<span>RUN.</span>'; ui.desc.textContent = 'The coast is yours. Carve through the mountain bends, thread the traffic and keep your line clean. How far can you make it?';
  ui.start.innerHTML = '<span>START YOUR ENGINE</span><span class="arrow">↗</span>'; ui.screen.classList.remove('hidden'); ui.hud.classList.remove('active'); ui.pause.classList.remove('on');
}
function crash() {
  dead = true; started = false; speed = 0;
  ui.title.innerHTML = 'RUN<span>OVER.</span>'; ui.desc.textContent = `You covered ${(runDistance / 1000).toFixed(2)} km in ${formatTime(elapsed)}. Every clean pass counts. Think you can go farther?`;
  ui.start.innerHTML = '<span>DRIVE AGAIN</span><span class="arrow">↗</span>'; ui.screen.classList.remove('hidden'); ui.pause.classList.remove('on');
  ui.flash.classList.add('hit'); setTimeout(() => ui.flash.classList.remove('hit'), 180);
}
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60), secs = (seconds % 60).toFixed(1).padStart(4, '0');
  return `${String(mins).padStart(2, '0')}:${secs}`;
}
function updateTraffic() {
  for (const car of traffic) {
    const data = car.userData, gap = data.z - runDistance;
    car.position.x = roadCenter(data.z) + data.lane;
    if (gap < 4.1 && gap > -2.5 && Math.abs(car.position.x - player.position.x) < 1.85) { crash(); return; }
    if (gap < -4 && !data.passed) {
      data.passed = true;
      if (Math.abs(car.position.x - player.position.x) > 2.15) { runDistance += 250; ui.note.classList.add('show'); noteTime = 2.2; }
    }
    if (gap < -50) {
      data.z = runDistance + 500 + Math.random() * 420;
      data.lane = [-3.35, 0, 3.35][Math.floor(Math.random() * 3)]; data.passed = false;
    }
  }
}
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), .04);
  if (started && !paused) {
    elapsed += dt;
    const accelerating = keys.ArrowUp || keys.KeyW, braking = keys.Space || keys.ArrowDown || keys.KeyS;
    const target = accelerating ? 76 : braking ? Math.max(0, speed - 1.6) : 34;
    speed = THREE.MathUtils.damp(speed, target, accelerating ? 1.8 : braking ? 8 : .35, dt);
    const direction = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0);
    steer = THREE.MathUtils.damp(steer, direction, 5, dt);
    lateral += steer * speed * .105 * dt; lateral *= Math.pow(.996, dt * 60);
    runDistance += speed * (1000 / 3600) * dt;
    player.position.x = roadCenter(runDistance) + lateral; player.position.z = runDistance;
    player.rotation.y = -steer * .11; player.rotation.z = -steer * .035;
    wheels.forEach(wheel => { wheel.rotation.x += speed * dt * .03; });
    updateTraffic();
    if (Math.abs(lateral) > 9.7) speed = Math.max(speed - 20 * dt, 12);
    ui.speed.textContent = String(Math.round(speed * 1.35)).padStart(3, '0');
    ui.gear.textContent = String(Math.min(6, Math.max(1, Math.floor(speed / 13) + 1)));
    ui.dist.textContent = (runDistance / 1000).toFixed(2) + ' KM'; ui.timer.textContent = formatTime(elapsed);
    ui.throttle.style.width = `${Math.min(100, speed / 76 * 100)}%`;
    if (noteTime > 0) { noteTime -= dt; if (noteTime <= 0) ui.note.classList.remove('show'); }
  }
  const z = player.position.z, camX = roadCenter(z) + lateral * .54 - steer * .38;
  camera.position.lerp(new THREE.Vector3(camX, 4.1, z - 10.5), 1 - Math.exp(-dt * 2.7));
  camera.lookAt(new THREE.Vector3(roadCenter(z + 28) + lateral * .16, 1.05, z + 28));
  camera.fov = THREE.MathUtils.damp(camera.fov, 54 + speed * .075, 2, dt); camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}
animate();
addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
