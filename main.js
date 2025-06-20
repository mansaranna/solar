import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/controls/OrbitControls.js';

// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 100, 250);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("#solarCanvas"), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Space Background
const textureLoader = new THREE.TextureLoader();
textureLoader.load('textures/stars.jpg', texture => {
  scene.background = texture;
});

// Light Source
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Orbit line helper
function createOrbit(radius) {
  const curve = new THREE.EllipseCurve(0, 0, radius, radius);
  const points = curve.getPoints(100);
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, 0, p.y)));
  const material = new THREE.LineBasicMaterial({ color: 0xffffff });
  return new THREE.Line(geometry, material);
}

// Planet config data
const planetData = [
  { name: "Sun", model: "models/sun.glb", size: 10, orbit: 0, orbitSpeed: 0 },
  { name: "Mercury", model: "models/mercury.glb", size: 0.38, orbit: 20, orbitSpeed: 0.04 },
  { name: "Venus", model: "models/venus.glb", size: 0.95, orbit: 30, orbitSpeed: 0.015 },
  { name: "Earth", model: "models/earth.glb", size: 1, orbit: 40, orbitSpeed: 0.01 },
  { name: "Mars", model: "models/mars.glb", size: 0.53, orbit: 50, orbitSpeed: 0.008 },
  { name: "Jupiter", model: "models/jupiter.glb", size: 11.2, orbit: 70, orbitSpeed: 0.002 },
  { name: "Saturn", model: "models/saturn.glb", size: 9.45, orbit: 90, orbitSpeed: 0.0018 },
  { name: "Uranus", model: "models/uranus.glb", size: 4, orbit: 110, orbitSpeed: 0.0012 },
  { name: "Neptune", model: "models/neptune.glb", size: 3.88, orbit: 130, orbitSpeed: 0.0009 }
];

const loader = new GLTFLoader();
const planets = [];

planetData.forEach(data => {
  loader.load(data.model, gltf => {
    const planet = gltf.scene;
    planet.scale.set(data.size, data.size, data.size);

    if (data.orbit > 0) {
      const pivot = new THREE.Object3D();
      scene.add(pivot);
      pivot.add(planet);
      planet.position.x = data.orbit;
      scene.add(createOrbit(data.orbit));
      planets.push({ mesh: planet, pivot: pivot, orbitSpeed: data.orbitSpeed });
    } else {
      planet.position.set(0, 0, 0);
      planets.push({ mesh: planet, pivot: null, orbitSpeed: 0 });
    }

    scene.add(planet);
  });
});

function animate() {
  requestAnimationFrame(animate);

  planets.forEach(p => {
    p.mesh.rotation.y += 0.01;
    if (p.pivot) p.pivot.rotation.y += p.orbitSpeed;
  });

  controls.update();
  renderer.render(scene, camera);
}
animate();

// Responsive
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
