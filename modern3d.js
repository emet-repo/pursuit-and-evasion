import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.162.0/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('threeCanvas');
const toggle = document.getElementById('modernToggle');
const reset = document.getElementById('modernReset');
const randomize = document.getElementById('modernRandomize');
const status = document.getElementById('modernStatus');
const rangeLabel = document.getElementById('modernRange');

const scene = new THREE.Scene();
scene.background = new THREE.Color('#071525');
scene.fog = new THREE.Fog('#071525', 120, 360);

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 500);
camera.position.set(0, 38, 88);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

scene.add(new THREE.HemisphereLight('#d9f0ff', '#08111f', 2.2));
const keyLight = new THREE.DirectionalLight('#ffffff', 3.2);
keyLight.position.set(20, 40, 25);
keyLight.castShadow = true;
scene.add(keyLight);

const grid = new THREE.GridHelper(220, 22, '#244665', '#122c45');
grid.position.y = -15;
scene.add(grid);

const axisMaterial = new THREE.LineBasicMaterial({ color: '#456985', transparent: true, opacity: 0.5 });
const axisGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(-110, -14.9, 0), new THREE.Vector3(110, -14.9, 0),
  new THREE.Vector3(0, -14.9, -110), new THREE.Vector3(0, -14.9, 110)
]);
scene.add(new THREE.LineSegments(axisGeometry, axisMaterial));

function createRocket() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.7, 7, 20),
    new THREE.MeshStandardMaterial({ color: '#3b82f6', metalness: 0.55, roughness: 0.28 })
  );
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  group.add(body);

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(1.4, 2.8, 20),
    new THREE.MeshStandardMaterial({ color: '#bfdbfe', metalness: 0.5, roughness: 0.2 })
  );
  nose.rotation.x = -Math.PI / 2;
  nose.position.z = -4.8;
  nose.castShadow = true;
  group.add(nose);

  const window = new THREE.Mesh(
    new THREE.SphereGeometry(0.52, 16, 10),
    new THREE.MeshStandardMaterial({ color: '#e0f2fe', emissive: '#38bdf8', emissiveIntensity: 0.7 })
  );
  window.position.set(0, 1.15, -1.8);
  group.add(window);

  const finMaterial = new THREE.MeshStandardMaterial({ color: '#1d4ed8', metalness: 0.35, roughness: 0.4 });
  for (const y of [-1.5, 1.5]) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.8, 2.1), finMaterial);
    fin.position.set(0, y, 1.9);
    group.add(fin);
  }
  return group;
}

function createPlane() {
  const group = new THREE.Group();
  const fuselage = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.75, 5.8, 8, 16),
    new THREE.MeshStandardMaterial({ color: '#34d399', metalness: 0.35, roughness: 0.32 })
  );
  fuselage.rotation.x = Math.PI / 2;
  fuselage.castShadow = true;
  group.add(fuselage);

  const wingMaterial = new THREE.MeshStandardMaterial({ color: '#059669', metalness: 0.25, roughness: 0.4 });
  const wing = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.22, 1.6), wingMaterial);
  wing.position.z = 0.7;
  wing.castShadow = true;
  group.add(wing);

  const tail = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.18, 1.15), wingMaterial);
  tail.position.set(0, 0.85, 2.4);
  group.add(tail);

  const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 16, 10),
    new THREE.MeshStandardMaterial({ color: '#d1fae5', emissive: '#10b981', emissiveIntensity: 0.3 })
  );
  cockpit.position.set(0, 0.65, -1.2);
  cockpit.scale.set(0.8, 0.45, 1.2);
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
  rocket: new THREE.Vector3(-32, 0, 0),
  plane: new THREE.Vector3(32, 10, -8),
  rocketVelocity: new THREE.Vector3(1.15, 0, 0),
  planeVelocity: new THREE.Vector3(0.7, 0.18, 0.2),
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
  state.rocket.set(-32, 0, 0);
  state.plane.set(32, 10, -8);
  state.rocketVelocity.set(1.15, 0, 0);
  state.planeVelocity.set(0.7, 0.18, 0.2);
  state.rocketTrail = [];
  state.planeTrail = [];
  captureRing.visible = false;
  rocket.position.copy(state.rocket);
  plane.position.copy(state.plane);
  camera.position.set(0, 38, 88);
  controls.target.set(0, 0, 0);
  status.textContent = 'Ready';
  toggle.textContent = 'Start 3D run';
  updateView();
}

function randomizeModern() {
  state.running = false;
  state.frame = 0;
  const separation = 28 + Math.random() * 22;
  state.rocket.set(
    -separation,
    -4 + Math.random() * 8,
    -8 + Math.random() * 16
  );
  state.plane.set(
    separation,
    -2 + Math.random() * 18,
    -16 + Math.random() * 32
  );
  state.rocketVelocity.set(1.05, 0, 0);
  state.planeVelocity.set(0.62, 0.14, 0.18);
  state.rocketTrail = [];
  state.planeTrail = [];
  captureRing.visible = false;
  camera.position.set(0, 38, 88);
  controls.target.set(0, 0, 0);
  status.textContent = 'Randomized';
  toggle.textContent = 'Start 3D run';
  updateView();
}

function step() {
  const time = state.frame;
  const pursuit = state.plane.clone().sub(state.rocket).normalize();
  const rocketNormal = new THREE.Vector3(-pursuit.z, 0, pursuit.x).normalize();
  const rocketLift = new THREE.Vector3(0, 1, 0);
  const rocketAim = pursuit
    .add(rocketNormal.multiplyScalar(Math.sin(time * 0.018) * 0.12))
    .add(rocketLift.multiplyScalar(Math.cos(time * 0.023) * 0.08))
    .normalize();
  state.rocketVelocity.lerp(rocketAim.multiplyScalar(1.15), 0.035);
  state.rocket.add(state.rocketVelocity);

  const escape = state.plane.clone().sub(state.rocket).normalize();
  const evaderWeave = new THREE.Vector3(
    Math.sin(time * 0.041) * 0.42,
    Math.cos(time * 0.027) * 0.3 + Math.sin(time * 0.013) * 0.16,
    Math.sin(time * 0.033 + 1.4) * 0.38
  );
  const evaderTurn = escape
    .add(evaderWeave)
    .add(new THREE.Vector3(Math.cos(time * 0.019) * 0.12, 0, Math.sin(time * 0.022) * 0.12))
    .normalize();
  state.planeVelocity.lerp(evaderTurn.multiplyScalar(0.78), 0.04);
  state.plane.add(state.planeVelocity);

  state.rocketTrail.push(state.rocket.clone());
  state.planeTrail.push(state.plane.clone());
  if (state.rocketTrail.length > 180) state.rocketTrail.shift();
  if (state.planeTrail.length > 180) state.planeTrail.shift();
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
  const viewDistance = Math.max(78, distance * 1.35);
  const desiredCamera = midpoint.clone().add(new THREE.Vector3(0, viewDistance * 0.45, viewDistance));
  camera.position.lerp(desiredCamera, 0.035);
  controls.target.lerp(midpoint, 0.08);

  const separation = range();
  rangeLabel.textContent = `Range ${separation.toFixed(1)}`;
  if (separation < 10) {
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
  if (range() < 10) resetModern();
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
