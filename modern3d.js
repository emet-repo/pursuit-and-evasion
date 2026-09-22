import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.162.0/examples/jsm/controls/OrbitControls.js';

const MAX_RANGE = 200;
const CAPTURE_RANGE = 10;
const canvas = document.getElementById('threeCanvas');
const toggle = document.getElementById('modernToggle');
const reset = document.getElementById('modernReset');
const randomize = document.getElementById('modernRandomize');
const status = document.getElementById('modernStatus');
const rangeLabel = document.getElementById('modernRange');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#071525');
scene.fog = new THREE.Fog('#071525', 280, 850);

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 1200);
camera.position.set(0, 80, 180);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

scene.add(new THREE.HemisphereLight('#d9f0ff', '#08111f', 2.2));
const keyLight = new THREE.DirectionalLight('#ffffff', 3.2);
keyLight.position.set(80, 120, 90);
keyLight.castShadow = true;
scene.add(keyLight);

const grid = new THREE.GridHelper(520, 52, '#244665', '#122c45');
grid.position.y = -35;
scene.add(grid);

const axisMaterial = new THREE.LineBasicMaterial({ color: '#456985', transparent: true, opacity: 0.5 });
const axisGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(-260, -34.9, 0), new THREE.Vector3(260, -34.9, 0),
  new THREE.Vector3(0, -34.9, -260), new THREE.Vector3(0, -34.9, 260)
]);
scene.add(new THREE.LineSegments(axisGeometry, axisMaterial));

function createRocket() {
  const group = new THREE.Group();
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: '#3b82f6', metalness: 0.7, roughness: 0.24 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.85, 8, 24), bodyMaterial);
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  group.add(body);

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(1.5, 3.4, 24),
    new THREE.MeshStandardMaterial({ color: '#dbeafe', metalness: 0.65, roughness: 0.18 })
  );
  nose.rotation.x = -Math.PI / 2;
  nose.position.z = -5.7;
  nose.castShadow = true;
  group.add(nose);

  const window = new THREE.Mesh(
    new THREE.SphereGeometry(0.56, 20, 12),
    new THREE.MeshStandardMaterial({ color: '#e0f2fe', emissive: '#38bdf8', emissiveIntensity: 0.7 })
  );
  window.position.set(0, 1.18, -2.1);
  window.scale.set(1, 0.55, 1.35);
  group.add(window);

  const finMaterial = new THREE.MeshStandardMaterial({ color: '#1d4ed8', metalness: 0.45, roughness: 0.32 });
  for (const y of [-1.65, 1.65]) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.1, 2.7), finMaterial);
    fin.position.set(0, y, 2.1);
    fin.castShadow = true;
    group.add(fin);
  }
  const tailFin = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.3, 2.5), finMaterial);
  tailFin.position.set(0, 0, 2.2);
  tailFin.castShadow = true;
  group.add(tailFin);

  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 0.75, 0.8, 20),
    new THREE.MeshStandardMaterial({ color: '#111827', metalness: 0.8, roughness: 0.25 })
  );
  nozzle.rotation.x = Math.PI / 2;
  nozzle.position.z = 4.25;
  group.add(nozzle);
  return group;
}

function createPlane() {
  const group = new THREE.Group();
  const fuselage = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.82, 6.8, 10, 20),
    new THREE.MeshStandardMaterial({ color: '#34d399', metalness: 0.4, roughness: 0.28 })
  );
  fuselage.rotation.x = Math.PI / 2;
  fuselage.castShadow = true;
  group.add(fuselage);

  const wingMaterial = new THREE.MeshStandardMaterial({ color: '#059669', metalness: 0.3, roughness: 0.35 });
  const wing = new THREE.Mesh(new THREE.BoxGeometry(11, 0.28, 1.8), wingMaterial);
  wing.position.z = 0.8;
  wing.castShadow = true;
  group.add(wing);

  const tail = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.22, 1.35), wingMaterial);
  tail.position.set(0, 0.75, 2.8);
  tail.castShadow = true;
  group.add(tail);

  const verticalTail = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.8, 1.6), wingMaterial);
  verticalTail.position.set(0, 1.05, 2.65);
  verticalTail.castShadow = true;
  group.add(verticalTail);

  const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(0.95, 20, 12),
    new THREE.MeshStandardMaterial({ color: '#d1fae5', emissive: '#10b981', emissiveIntensity: 0.3, metalness: 0.25, roughness: 0.18 })
  );
  cockpit.position.set(0, 0.72, -1.45);
  cockpit.scale.set(0.82, 0.48, 1.35);
  group.add(cockpit);
  return group;
}

const rocket = createRocket();
const plane = createPlane();
rocket.scale.setScalar(0.62);
plane.scale.setScalar(0.62);
scene.add(rocket, plane);

const captureRing = new THREE.Mesh(
  new THREE.RingGeometry(8.8, 9.2, 64),
  new THREE.MeshBasicMaterial({ color: '#fbbf24', transparent: true, opacity: 0.8, side: THREE.DoubleSide })
);
captureRing.rotation.x = -Math.PI / 2;
captureRing.visible = false;
scene.add(captureRing);

const trailMaterialRocket = new THREE.LineBasicMaterial({ color: '#60a5fa', transparent: true, opacity: 0.8 });
const trailMaterialPlane = new THREE.LineBasicMaterial({ color: '#6ee7b7', transparent: true, opacity: 0.8 });
const rocketTrail = new THREE.Line(new THREE.BufferGeometry(), trailMaterialRocket);
const planeTrail = new THREE.Line(new THREE.BufferGeometry(), trailMaterialPlane);
scene.add(rocketTrail, planeTrail);

const state = {
  running: false,
  frame: 0,
  rocket: new THREE.Vector3(-82, 0, 0),
  plane: new THREE.Vector3(82, 18, -12),
  rocketVelocity: new THREE.Vector3(1.35, 0, 0),
  planeVelocity: new THREE.Vector3(0.95, 0.22, 0.25),
  rocketTrail: [],
  planeTrail: []
};

function range() {
  return state.rocket.distanceTo(state.plane);
}

function orientToVelocity(object, velocity) {
  const direction = velocity.clone().normalize();
  object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, -1), direction);
}

function resetModern() {
  state.running = false;
  state.frame = 0;
  state.rocket.set(-82, 0, 0);
  state.plane.set(82, 18, -12);
  state.rocketVelocity.set(1.35, 0, 0);
  state.planeVelocity.set(0.95, 0.22, 0.25);
  state.rocketTrail = [];
  state.planeTrail = [];
  captureRing.visible = false;
  rocket.position.copy(state.rocket);
  plane.position.copy(state.plane);
  camera.position.set(0, 80, 180);
  controls.target.set(0, 0, 0);
  status.textContent = 'Ready';
  toggle.textContent = 'Start 3D run';
  updateView();
}

function randomizeModern() {
  state.running = false;
  state.frame = 0;
  const separation = 140 + Math.random() * 50;
  const halfSeparation = separation / 2;
  state.rocket.set(-halfSeparation, -8 + Math.random() * 16, -10 + Math.random() * 20);
  state.plane.set(halfSeparation, 8 + Math.random() * 20, -10 + Math.random() * 20);
  state.rocketVelocity.set(1.25, 0, 0);
  state.planeVelocity.set(0.92, 0.18, 0.25);
  state.rocketTrail = [];
  state.planeTrail = [];
  captureRing.visible = false;
  camera.position.set(0, 80, 180);
  controls.target.set(0, 0, 0);
  status.textContent = `Range ${range().toFixed(0)}`;
  toggle.textContent = 'Start 3D run';
  updateView();
}

function step() {
  const time = state.frame;
  const separation = range();
  const pursuit = state.plane.clone().sub(state.rocket).normalize();
  const rocketNormal = new THREE.Vector3(-pursuit.z, 0, pursuit.x).normalize();
  const rocketLift = new THREE.Vector3(0, 1, 0);
  const rocketAim = pursuit
    .add(rocketNormal.multiplyScalar(Math.sin(time * 0.018) * 0.16))
    .add(rocketLift.multiplyScalar(Math.cos(time * 0.023) * 0.1))
    .normalize();
  const rocketSpeed = THREE.MathUtils.lerp(1.15, 1.55, Math.min(separation / MAX_RANGE, 1));
  state.rocketVelocity.lerp(rocketAim.multiplyScalar(rocketSpeed), 0.028);
  state.rocket.add(state.rocketVelocity);

  const escape = state.plane.clone().sub(state.rocket).normalize();
  const evaderWeave = new THREE.Vector3(
    Math.sin(time * 0.041) * 0.58,
    Math.cos(time * 0.027) * 0.42 + Math.sin(time * 0.013) * 0.22,
    Math.sin(time * 0.033 + 1.4) * 0.52
  );
  const evaderTurn = escape
    .add(evaderWeave)
    .add(new THREE.Vector3(Math.cos(time * 0.019) * 0.16, 0, Math.sin(time * 0.022) * 0.16))
    .normalize();
  const planeSpeed = THREE.MathUtils.clamp(0.92 + Math.sin(time * 0.011) * 0.08, 0.78, 1.05);
  state.planeVelocity.lerp(evaderTurn.multiplyScalar(planeSpeed), 0.035);
  state.plane.add(state.planeVelocity);

  state.rocketTrail.push(state.rocket.clone());
  state.planeTrail.push(state.plane.clone());
  if (state.rocketTrail.length > 360) state.rocketTrail.shift();
  if (state.planeTrail.length > 360) state.planeTrail.shift();
  state.frame += 1;
}

function updateLine(line, points) {
  line.geometry.dispose();
  line.geometry = new THREE.BufferGeometry().setFromPoints(points);
}

function updateView() {
  rocket.position.copy(state.rocket);
  plane.position.copy(state.plane);
  orientToVelocity(rocket, state.rocketVelocity);
  orientToVelocity(plane, state.planeVelocity);
  updateLine(rocketTrail, state.rocketTrail);
  updateLine(planeTrail, state.planeTrail);

  const midpoint = state.rocket.clone().add(state.plane).multiplyScalar(0.5);
  const distance = range();
  const viewDistance = Math.max(150, distance * 1.35);
  const desiredCamera = midpoint.clone().add(new THREE.Vector3(0, viewDistance * 0.45, viewDistance));
  camera.position.lerp(desiredCamera, 0.035);
  controls.target.lerp(midpoint, 0.08);

  const separation = range();
  rangeLabel.textContent = `Range ${Math.min(separation, MAX_RANGE).toFixed(1)} / ${MAX_RANGE}`;
  if (separation < CAPTURE_RANGE) {
    captureRing.visible = true;
    captureRing.position.copy(state.rocket);
    status.textContent = 'Captured';
    state.running = false;
    toggle.textContent = 'Start 3D run';
  } else if (state.running) {
    status.textContent = 'Pursuit active';
  }
}

function resize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (!width || !height) return;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

toggle.addEventListener('click', () => {
  if (range() < CAPTURE_RANGE) resetModern();
  state.running = !state.running;
  toggle.textContent = state.running ? 'Pause 3D run' : 'Start 3D run';
  status.textContent = state.running ? 'Pursuit active' : 'Paused';
});
reset.addEventListener('click', resetModern);
randomize.addEventListener('click', randomizeModern);
window.addEventListener('resize', resize);

function animate() {
  requestAnimationFrame(animate);
  if (state.running) step();
  updateView();
  controls.update();
  renderer.render(scene, camera);
}

resetModern();
resize();
animate();
