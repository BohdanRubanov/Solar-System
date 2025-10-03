import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

// создаём сцену
const scene = new THREE.Scene();
// создаём камеру растянутую на весь экран с большим радиусом
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	2000,
);
// ставим камеру в центре
camera.position.set(0, 0, 0);
// создаем рендерер со сглаживанием
const renderer = new THREE.WebGLRenderer({ antialias: true });
// размеры как у окна
renderer.setSize(window.innerWidth, window.innerHeight);
// для хорошего качества
renderer.setPixelRatio(window.devicePixelRatio);
// добавляем в хтмл
document.getElementById("main-cont").appendChild(renderer.domElement);

// звёзды
const stars = [];
// создаем функцию в которой указывем колличество звезд и сколько места они займут
function addStars(count, space) {
	const positions = [];
	for (let i = 0; i < count; i++) {
		// задаем рандомную позицию в зависимости от места
		positions.push(
			(Math.random() - 0.5) * space,
			(Math.random() - 0.5) * space,
			(Math.random() - 0.5) * space,
		);
	}
	// создаем геометрию для звезды и задаем ей позицию
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute(
		"position",
		new THREE.Float32BufferAttribute(positions, 3),
	);
	const material = new THREE.PointsMaterial({
		color: "rgb(0,0,255)",
		size: 0.5,
	});
	// создание звезд
	const points = new THREE.Points(geometry, material);
	stars.push(points);
	scene.add(points);
}
addStars(100000, 1000);

const sunParts = [];

function createParts() {
	const positions = [];

	const sizes = [];

	for (let i = 0; i < 800; i++) {
		const radius = Math.random() * 5;
		positions.push(
			radius * Math.random() * 10,
			radius * Math.random() * 10,
			radius * Math.random() * 10,
		);

		sizes.push(Math.random() * 0.5);
	}

	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute(
		"position",
		new THREE.Float32BufferAttribute(positions, 3),
	);

	geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

	const material = new THREE.PointsMaterial({
		size: 0.2,
		color: "rgb(210, 210, 30)",
		opacity: 0.8,
	});

	const particles = new THREE.Points(geometry, material);
	particles.visible = false;
	scene.add(particles);
	sunParts.push(particles);
	return particles;
}

const parts = createParts();

function createSunCore() {
	const core = new THREE.Mesh(
		new THREE.SphereGeometry(1.6, 32, 32),
		new THREE.MeshBasicMaterial({
			color: new THREE.Color("rgb(255, 111, 0)"),
			opacity: 0.4,
		}),
	);

	core.visible = false;
	scene.add(core);
	sunParts.push(core);
	return core;
}

const sunCore = createSunCore();

function createInsideSun() {
	const shapes = [];

	for (let count = 0; count < 6; count++) {
		const geometry = new THREE.DodecahedronGeometry(0.5 + count * 0.2, 0);
		const material = new THREE.MeshBasicMaterial({
			color: "rgb(218, 196, 28)",
			opacity: 0.5,
		});
		const shape = new THREE.Mesh(geometry, material);
		shape.visible = false;
		scene.add(shape);
		shapes.push(shape);
		sunParts.push(shape);
	}

	for (let count = 0; count < 4; count++) {
		const geometry = new THREE.OctahedronGeometry(0.6 + count * 0.3, 0);
		const material = new THREE.MeshBasicMaterial({
			color: "rgb(218, 196, 28)",
			opacity: 0.6,
		});
		const shape = new THREE.Mesh(geometry, material);
		shape.visible = false;
		scene.add(shape);
		shapes.push(shape);
		sunParts.push(shape);
	}

	for (let count = 0; count < 5; count++) {
		const geometry = new THREE.TorusGeometry(2 + count * 0.8, 0.08, 16, 100);
		const material = new THREE.MeshBasicMaterial({
			color: "rgb(218, 47, 28)",
			opacity: 0.7,
		});
		const shape = new THREE.Mesh(geometry, material);
		shape.rotation.x += Math.random();
		shape.rotation.y += Math.random();
		shape.rotation.z += Math.random();
		shape.visible = false;
		scene.add(shape);
		shapes.push(shape);
		sunParts.push(shape);
	}

	return shapes;
}

const insideSun = createInsideSun();

function createRings() {
	const rings = [];
	for (let count = 0; count < 5; count++) {
		const geometry = new THREE.TorusGeometry(1 + count * 0.8, 0.05, 16, 100);
		const material = new THREE.MeshBasicMaterial({
			color: "rgb(218, 145, 28)",
			opacity: 0.6,
		});
		const ring = new THREE.Mesh(geometry, material);
		ring.rotation.x = Math.random();
		ring.rotation.y = Math.random();
		ring.visible = false;
		scene.add(ring);
		rings.push(ring);
		sunParts.push(ring);
	}
	return rings;
}

createRings();

const sun = new THREE.Mesh(
	new THREE.SphereGeometry(6, 64, 64),
	new THREE.MeshStandardMaterial({
		emissive: new THREE.Color("rgb(255,255,0)"),
		color: new THREE.Color("rgb(255,170,0)"),
		transparent: true,
	}),
);
scene.add(sun);

const sunTexture = new THREE.TextureLoader().load(
	"https://threejs.org/examples/textures/lensflare/lensflare0.png",
);
const spriteMat = new THREE.SpriteMaterial({
	map: sunTexture,
	color: new THREE.Color("rgb(255,140,0)"),
	blending: THREE.AdditiveBlending,
});
const sprite = new THREE.Sprite(spriteMat);
sprite.scale.set(30, 30, 20);
sun.add(sprite);

const loader = new THREE.TextureLoader();
const planetsData = [
	{
		name: "Mercury",
		size: 1,
		dist: 20,
		speed: 0.04,
		spin: 0.002,
		texture: "textures/2k_mercury.jpg",
	},
	{
		name: "Venus",
		size: 1.5,
		dist: 28,
		speed: 0.03,
		spin: 0.001,
		texture: "textures/2k_venus_atmosphere.jpg",
	},
	{
		name: "Earth",
		size: 2,
		dist: 38,
		speed: 0.02,
		spin: 0.02,
		texture: "textures/earth_atmos_2048.jpg",
	},
	{
		name: "Mars",
		size: 1.5,
		dist: 48,
		speed: 0.018,
		spin: 0.018,
		texture: "textures/2k_mars.jpg",
	},
	{
		name: "Jupiter",
		size: 4,
		dist: 70,
		speed: 0.01,
		spin: 0.03,
		texture: "textures/2k_jupiter.jpg",
	},
	{
		name: "Saturn",
		size: 3.5,
		dist: 90,
		speed: 0.008,
		spin: 0.025,
		texture: "textures/2k_saturn.jpg",
	},
	{
		name: "Uranus",
		size: 2.5,
		dist: 115,
		speed: 0.006,
		spin: 0.015,
		texture: "textures/2k_uranus.jpg",
	},
	{
		name: "Neptune",
		size: 2.3,
		dist: 135,
		speed: 0.005,
		spin: 0.014,
		texture: "textures/2k_neptune.jpg",
	},
];

const planets = [];
planetsData.forEach((planetData) => {
	const points = [];
	for (let count = 0; count <= 128; count++) {
		const a = (count / 128) * Math.PI * 2;
		points.push(
			Math.cos(a) * planetData.dist,
			0,
			Math.sin(a) * planetData.dist,
		);
	}
	const orbitGeometry = new THREE.BufferGeometry();
	orbitGeometry.setAttribute(
		"position",
		new THREE.Float32BufferAttribute(points, 3),
	);
	const orbitMaterial = new THREE.LineBasicMaterial({
		color: "rgba(88, 88, 88, 0.42)",
	});
	const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
	scene.add(orbit);


	const planet = new THREE.Mesh(
		new THREE.SphereGeometry(planetData.size, 64, 64),
		new THREE.MeshBasicMaterial({ map: loader.load(planetData.texture) }),
	);
	planet.position.x = planetData.dist;
	planet.userData.name = planetData.name;

	const system = new THREE.Object3D();
	system.add(planet);
	scene.add(system);

	planets.push({ system, mesh: planet, ...planetData });
});

let mouseX = 0,
	mouseY = 0,
	targetZ = 150;
window.addEventListener("mousemove", (e) => {
	mouseX = (e.clientX / window.innerWidth) * 2;
	mouseY = -(e.clientY / window.innerHeight) * 2;
});
window.addEventListener("wheel", (e) => {
	targetZ += e.deltaY * 0.1;
	targetZ = Math.max(0.1, Math.min(300, targetZ));
});

let focusedPlanet = null;
let orbitAngle = 0;
const orbitRadius = 40;
const orbitSpeed = 0.01;

function focusOnPlanet(name) {
	const found = planets.find((planet) => planet.mesh.userData.name === name);
	focusedPlanet = found.mesh;
	orbitAngle = 0;
}

const panel = document.getElementById("ui-panel");
planetsData.forEach((planet) => {
	const btn = document.createElement("button");
	btn.textContent = planet.name;

	btn.onclick = () => focusOnPlanet(planet.name);
	panel.appendChild(btn);
});
const sunBtn = document.createElement("button");
sunBtn.textContent = "Sun";

sunBtn.onclick = () => {
	focusedPlanet = null;
};
panel.appendChild(sunBtn);

let time = 0;
function animate() {
	requestAnimationFrame(animate);
	time += 0.01;

	sun.rotation.y += 0.01;
	sun.rotation.x += 0.01;

	planets.forEach((planet) => {
		planet.system.rotation.y += planet.speed;
		planet.mesh.rotation.y += planet.spin;
	});

	stars.forEach((star) => {
		const pos = star.geometry.attributes.position;
		for (let i = 0; i < pos.count; i++) {
			let z = pos.getZ(i) + 0.5;
			if (z > 500) z = -500;
			pos.setZ(i, z);
		}
		pos.needsUpdate = true;
	});

	const partsPosition = parts.geometry.attributes.position;
	for (let count = 0; count < partsPosition.count; count++) {
		const x = partsPosition.getX(count);
		const y = partsPosition.getY(count);
		const z = partsPosition.getZ(count);

		
		const pulse = Math.sin(count * 0.01) * 0.02;

		partsPosition.setX(count, x + pulse);
		partsPosition.setY(count, y + Math.sin(count * 0.1) * 0.05);
		partsPosition.setZ(count, z + pulse);
	}
	partsPosition.needsUpdate = true;

	const corePulse = 1 + Math.sin(time * 2) * 0.15;
	sunCore.scale.set(corePulse * 0.9, corePulse * 0.9, corePulse * 0.9);
	sunCore.rotation.y += 0.005;
	sunCore.rotation.x += 0.003;

	insideSun.forEach((shape) => {
		shape.rotation.x += 0.01;
		shape.rotation.y += 0.015;
		shape.rotation.z += 0.008;
	});


	const isInsideSun = targetZ < 1;

	sunParts.forEach((particle) => {
		particle.visible = isInsideSun;
	});

	if (isInsideSun) {
		sun.material.opacity = 0;
		sprite.material.opacity = 0;
	} else {
		sun.material.opacity = 1;
		sprite.material.opacity = 1;
	}

	planets.forEach((planet) => {
		planet.mesh.visible = !isInsideSun;
		planet.system.children.forEach((child) => {
			if (child !== planet.mesh) child.visible = !isInsideSun;
		});
	});

	if (focusedPlanet) {
		orbitAngle += orbitSpeed;
		const planetPos = new THREE.Vector3();
		focusedPlanet.getWorldPosition(planetPos);
		camera.position.x = planetPos.x + Math.cos(orbitAngle) * orbitRadius;
		camera.position.z = planetPos.z + Math.sin(orbitAngle) * orbitRadius;
		camera.position.y = planetPos.y + 15;
		camera.lookAt(planetPos);
	} else {
		const targetX = mouseX * 30;
		const targetY = 50 + mouseY * 30;

		if (targetZ < 10) {
			const inside = 1 - targetZ / 10;
			camera.position.x +=
				(targetX * (1 - inside) - camera.position.x) * 0.05;
			camera.position.y +=
				(targetY * (1 - inside) - camera.position.y) * 0.05;
			camera.position.z += (targetZ - camera.position.z) * 0.05;
		} else {
			camera.position.x += (targetX - camera.position.x) * 0.05;
			camera.position.y += (targetY - camera.position.y) * 0.05;
			camera.position.z += (targetZ - camera.position.z) * 0.05;
		}

		camera.lookAt(0, 0, 0);
	}

	renderer.render(scene, camera);
}

animate();
