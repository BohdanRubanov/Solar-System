import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

$(() => {
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight,
		0.1,
		2000,
	);
	camera.position.set(0, 0, 0);

	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	$("#main-cont").append(renderer.domElement);

	const $info = $("<div>", { id: "info-panel" });
	$("#main-cont").append($info);

	const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2();
	let hoveredPlanet = null;

	let mouseX = 0,
		mouseY = 0,
		targetZ = 150;
	$(window).on("mousemove", (e) => {
		const ex = e.clientX,
			ey = e.clientY;
		mouse.x = (ex / window.innerWidth) * 2 - 1;
		mouse.y = -(ey / window.innerHeight) * 2 + 1;
		mouseX = mouse.x;
		mouseY = mouse.y;
	});

	$(window).on("wheel", (e) => {
		const d = e.originalEvent.deltaY;
		targetZ += d * 0.1;
		targetZ = Math.max(0.1, Math.min(300, targetZ));
	});

	const stars = [];
	function addStars(count, space) {
		const positions = [];
		for (let i = 0; i < count; i++) {
			positions.push(
				(Math.random() - 0.5) * space,
				(Math.random() - 0.5) * space,
				(Math.random() - 0.5) * space,
			);
		}
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute(
			"position",
			new THREE.Float32BufferAttribute(positions, 3),
		);
		const material = new THREE.PointsMaterial({
			color: "rgb(18, 56, 226)",
			size: 0.5,
		});
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
			color: "rgb(210,210,30)",
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
				color: new THREE.Color("rgb(255,111,0)"),
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
				color: "rgb(218,196,28)",
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
				color: "rgb(218,196,28)",
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
				color: "rgb(218,47,28)",
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
				color: "rgb(218,145,28)",
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

	const sunVertexShader = `varying vec2 vUv; varying vec3 vPosition; varying vec3 vNormal; void main(){ vUv=uv; vPosition=position; vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
	const sunFragmentShader = `
    uniform float time; uniform vec3 baseColor; uniform vec3 hotColor; uniform float pulseSpeed; uniform float turbulence;
    varying vec2 vUv; varying vec3 vPosition; varying vec3 vNormal;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);float a=hash(i);float b=hash(i+vec2(1.0,0.0));float c=hash(i+vec2(0.0,1.0));float d=hash(i+vec2(1.0,1.0));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
    float fbm(vec2 p){float value=0.0;float amplitude=0.5;float frequency=1.0;for(int i=0;i<4;i++){value+=amplitude*noise(p*frequency);frequency*=2.0;amplitude*=0.5;}return value;}
    void main(){
      float pulse = sin(time*pulseSpeed)*0.3+0.7;
      vec2 uv=vUv*8.0;
      float turbulence1=fbm(uv+time*0.5);
      float turbulence2=fbm(uv*2.0-time*0.3);
      float turbulence3=fbm(uv*4.0+time*0.7);
      float surfaceTurbulence=(turbulence1+turbulence2*0.5+turbulence3*0.25)*turbulence;
      float hotspots=fbm(uv*16.0+time*2.0)*0.8;hotspots=pow(hotspots,3.0)*2.0;
      float centerGlow=1.0-length(vUv-0.5)*1.5;centerGlow=max(0.0,centerGlow);
      vec3 color=mix(baseColor,hotColor,surfaceTurbulence*0.5+hotspots*0.3);
      color*=pulse*(1.0+centerGlow*0.3+surfaceTurbulence*0.4+hotspots*0.6);
      float edgeGlow=pow(1.0-dot(vNormal,vec3(0.0,0.0,1.0)),2.0);
      color+=hotColor*edgeGlow*0.5;
      gl_FragColor=vec4(color,1.0);
    }
  `;
	const sunMaterial = new THREE.ShaderMaterial({
		uniforms: {
			time: { value: 0 },
			baseColor: { value: new THREE.Color(1.0, 0.7, 0.1) },
			hotColor: { value: new THREE.Color(1.0, 0.3, 0.0) },
			pulseSpeed: { value: 1.5 },
			turbulence: { value: 0.8 },
		},
		vertexShader: sunVertexShader,
		fragmentShader: sunFragmentShader,
		side: THREE.FrontSide,
	});
	const sun = new THREE.Mesh(new THREE.SphereGeometry(6, 64, 64), sunMaterial);
	scene.add(sun);

	const coronaGeometry = new THREE.SphereGeometry(6.8, 64, 64);
	const coronaMaterial = new THREE.ShaderMaterial({
		uniforms: {
			time: { value: 0 },
			baseColor: { value: new THREE.Color(1.0, 0.5, 0.0) },
			pulseSpeed: { value: 2.0 },
		},
		vertexShader: `varying vec2 vUv; varying vec3 vNormal; uniform float time; void main(){ vUv=uv; vNormal=normalize(normalMatrix*normal); float wave=sin(time*3.0+position.y*10.0)*0.1; vec3 newPosition=position+normal*wave*0.1; gl_Position=projectionMatrix*modelViewMatrix*vec4(newPosition,1.0); }`,
		fragmentShader: `uniform float time; uniform vec3 baseColor; uniform float pulseSpeed; varying vec2 vUv; varying vec3 vNormal; void main(){ float pulse=sin(time*pulseSpeed)*0.3+0.7; float intensity=0.2+pulse*0.3; float variation=sin(time*4.0+vUv.x*20.0)*0.5+0.5; variation*=sin(time*2.0+vUv.y*15.0)*0.3+0.7; float center=1.0-length(vUv-0.5)*1.8; center=max(0.0,center); vec3 color=baseColor*intensity*variation*(1.0+center*0.5); float alpha=0.3*intensity*variation*(1.0+center); gl_FragColor=vec4(color,alpha); }`,
		transparent: true,
		side: THREE.BackSide,
		blending: THREE.AdditiveBlending,
	});
	const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
	sun.add(corona);

	const solarWindParticles = [];
	function createSolarWind() {
		const particleCount = 200;
		const positions = [];
		const velocities = [];
		for (let i = 0; i < particleCount; i++) {
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.acos(2 * Math.random() - 1);
			const radius = 6.5 + Math.random() * 3.0;
			positions.push(
				radius * Math.sin(phi) * Math.cos(theta),
				radius * Math.sin(phi) * Math.sin(theta),
				radius * Math.cos(phi),
			);
			velocities.push(
				(Math.random() - 0.5) * 0.02,
				(Math.random() - 0.5) * 0.02,
				(Math.random() - 0.5) * 0.02,
			);
		}
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute(
			"position",
			new THREE.Float32BufferAttribute(positions, 3),
		);
		geometry.setAttribute(
			"velocity",
			new THREE.Float32BufferAttribute(velocities, 3),
		);
		const material = new THREE.PointsMaterial({
			color: new THREE.Color(1.0, 0.8, 0.2),
			size: 0.1,
			transparent: true,
			opacity: 0.6,
			blending: THREE.AdditiveBlending,
		});
		const particles = new THREE.Points(geometry, material);
		particles.userData = { originalPositions: [...positions] };
		scene.add(particles);
		solarWindParticles.push(particles);
	}
	createSolarWind();

	const sunGlowTexture = new THREE.TextureLoader().load(
		"https://threejs.org/examples/textures/lensflare/lensflare0.png",
	);
	const glowMaterial = new THREE.SpriteMaterial({
		map: sunGlowTexture,
		color: new THREE.Color("rgb(1.0,0.6,0.2)"),
		blending: THREE.AdditiveBlending,
		transparent: true,
	});
	const sunGlow = new THREE.Sprite(glowMaterial);
	sunGlow.scale.set(25, 25, 1);
	sun.add(sunGlow);

	const loader = new THREE.TextureLoader();

	const planetsData = [
		{
			name: "Mercury",
			size: 1,
			dist: 20,
			speed: 0.04,
			spin: 0.002,
			texture: "textures/2k_mercury.jpg",
			color: 0x8c7853,
			info: {
				type: "Terrestrial Planet",
				diameter: "4,879 km",
				mass: "3.3 × 10^23 kg",
				distanceFromSun: "57.9 million km",
				orbitalPeriod: "88 days",
				temperature: "-173°C to 427°C",
				moons: "0",
				description: "Mercury is the smallest and closest planet to the Sun.",
			},
		},
		{
			name: "Venus",
			size: 1.5,
			dist: 28,
			speed: 0.03,
			spin: 0.001,
			texture: "textures/2k_venus_atmosphere.jpg",
			color: 0xe39e54,
			info: {
				type: "Terrestrial Planet",
				diameter: "12,104 km",
				mass: "4.87 × 10^24 kg",
				distanceFromSun: "108.2 million km",
				orbitalPeriod: "225 days",
				temperature: "462°C",
				moons: "0",
				description:
					"Venus is the second planet from the Sun, known for its extreme greenhouse effect.",
			},
		},
		{
			name: "Earth",
			size: 2,
			dist: 38,
			speed: 0.02,
			spin: 0.02,
			texture: "textures/earth_atmos_2048.jpg",
			color: 0x6b93d6,
			info: {
				type: "Terrestrial Planet",
				diameter: "12,742 km",
				mass: "5.97 × 10^24 kg",
				distanceFromSun: "149.6 million km",
				orbitalPeriod: "365.25 days",
				temperature: "-88°C to 58°C",
				moons: "1 (Moon)",
				description:
					"Earth is the third planet from the Sun and the only known planet with life.",
			},
		},
		{
			name: "Mars",
			size: 1.5,
			dist: 48,
			speed: 0.018,
			spin: 0.018,
			texture: "textures/2k_mars.jpg",
			color: 0xcd5c5c,
			info: {
				type: "Terrestrial Planet",
				diameter: "6,779 km",
				mass: "6.42 × 10^23 kg",
				distanceFromSun: "227.9 million km",
				orbitalPeriod: "687 days",
				temperature: "-87°C to -5°C",
				moons: "2 (Phobos, Deimos)",
				description: "Mars is the fourth planet, known as the 'Red Planet'.",
			},
		},
		{
			name: "Jupiter",
			size: 4,
			dist: 70,
			speed: 0.01,
			spin: 0.03,
			texture: "textures/2k_jupiter.jpg",
			color: 0xd8ca9d,
			info: {
				type: "Gas Giant",
				diameter: "139,820 km",
				mass: "1.90 × 10^27 kg",
				distanceFromSun: "778.5 million km",
				orbitalPeriod: "11.9 years",
				temperature: "-108°C",
				moons: "79+",
				description:
					"Jupiter is the largest planet in the Solar System, a gas giant.",
			},
		},
		{
			name: "Saturn",
			size: 3.5,
			dist: 90,
			speed: 0.008,
			spin: 0.025,
			texture: "textures/2k_saturn.jpg",
			color: 0xe3d9b0,
			info: {
				type: "Gas Giant",
				diameter: "116,460 km",
				mass: "5.68 × 10^26 kg",
				distanceFromSun: "1.43 billion km",
				orbitalPeriod: "29.5 years",
				temperature: "-139°C",
				moons: "82+",
				description:
					"Saturn is the sixth planet, famous for its spectacular ring system.",
			},
		},
		{
			name: "Uranus",
			size: 2.5,
			dist: 115,
			speed: 0.006,
			spin: 0.015,
			texture: "textures/2k_uranus.jpg",
			color: 0x4fd0e7,
			info: {
				type: "Ice Giant",
				diameter: "50,724 km",
				mass: "8.68 × 10^25 kg",
				distanceFromSun: "2.87 billion km",
				orbitalPeriod: "84 years",
				temperature: "-197°C",
				moons: "27",
				description: "Uranus is the seventh planet, rotating on its side.",
			},
		},
		{
			name: "Neptune",
			size: 2.3,
			dist: 135,
			speed: 0.005,
			spin: 0.014,
			texture: "textures/2k_neptune.jpg",
			color: 0x4b70dd,
			info: {
				type: "Ice Giant",
				diameter: "49,244 km",
				mass: "1.02 × 10^26 kg",
				distanceFromSun: "4.5 billion km",
				orbitalPeriod: "165 years",
				temperature: "-201°C",
				moons: "14",
				description:
					"Neptune is the eighth and farthest known planet from the Sun.",
			},
		},
	];

	const planets = [];

	function createPlanetGlow(planet, size, color) {
		const glowGeometry = new THREE.SphereGeometry(size * 1.7, 64, 64);
		const glowMaterial = new THREE.ShaderMaterial({
			uniforms: {
				time: { value: 0 },
				glowColor: { value: new THREE.Color(color) },
				intensity: { value: 10 },
			},
			vertexShader: `varying vec3 vNormal; void main(){ vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
			fragmentShader: `uniform float time; uniform vec3 glowColor; uniform float intensity; varying vec3 vNormal; void main(){ float glow=dot(vNormal,vec3(0.0,0.0,1.0)); glow=pow(glow,2.0); float pulse=sin(time*2.0)*0.3+0.7; vec3 color=glowColor*intensity*glow*pulse; gl_FragColor=vec4(color,glow*0.8); }`,
			transparent: true,
			side: THREE.BackSide,
			blending: THREE.AdditiveBlending,
		});
		const glow = new THREE.Mesh(glowGeometry, glowMaterial);
		planet.add(glow);
		return glow;
	}

	function showPlanetInfo(planetData) {
		const info = planetData.info;
		const html = `
      <h3 class="planetName">${planetData.name}</h3>
      <div class="planetDescription">${info.description}</div>
      <div class="planetInfo">
        <div>Type: ${info.type}</div>
        <div>Diameter: ${info.diameter}</div>
        <div>Mass: ${info.mass}</div>
        <div>Distance from Sun: ${info.distanceFromSun}</div>
        <div>Orbital Period: ${info.orbitalPeriod}</div>
        <div>Temperature: ${info.temperature}</div>
        <div>Moons: ${info.moons}</div>
      </div>
    `;
		$info.html(html).fadeIn(200);
	}
	function hidePlanetInfo() {
		$info.fadeOut(150);
		hoveredPlanet = null;
	}

	if (typeof planetsData !== "undefined") {
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
				color: "rgba(88,88,88,0.42)",
			});
			const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
			scene.add(orbit);

			const planet = new THREE.Mesh(
				new THREE.SphereGeometry(planetData.size, 64, 64),
				new THREE.MeshBasicMaterial({ map: loader.load(planetData.texture) }),
			);
			planet.position.x = planetData.dist;
			planet.userData = {
				name: planetData.name,
				info: planetData.info,
				glow: null,
				isPlanet: true,
			};

			const glow = createPlanetGlow(planet, planetData.size, planetData.color);
			planet.userData.glow = glow;

			const system = new THREE.Object3D();
			system.add(planet);
			scene.add(system);

			planets.push({ system, mesh: planet, ...planetData, glow });
		});
	}

	let focusedPlanet = null;
	let orbitAngle = 0;
	const orbitRadius = 40;
	const orbitSpeed = 0.01;

	function focusOnPlanet(name) {
		const found = planets.find((p) => p.mesh.userData.name === name);
		if (!found) return;
		focusedPlanet = found.mesh;
		orbitAngle = 0;
		showPlanetInfo(found);
	}

	const $panel = $("#ui-panel");
	if (typeof planetsData !== "undefined") {
		planetsData.forEach((planet) => {
			const $btn = $("<button>")
				.text(planet.name)
				.on("click", () => focusOnPlanet(planet.name));
			$panel.append($btn);
		});
	}
	const $sunBtn = $("<button>")
		.text("Sun")
		.on("click", () => {
			focusedPlanet = null;
			hidePlanetInfo();
		});
	$panel.append($sunBtn);

	let time = 0;
	function animate() {
		requestAnimationFrame(animate);
		time += 0.01;

		raycaster.setFromCamera(mouse, camera);
		const planetMeshes = planets.map((p) => p.mesh);
		const intersects = raycaster.intersectObjects(planetMeshes);

		if (intersects.length > 0 && !focusedPlanet) {
			const planet = intersects[0].object;
			if (planet !== hoveredPlanet) {
				hoveredPlanet = planet;
				const planetData = planets.find((p) => p.mesh === planet);
				if (planetData) showPlanetInfo(planetData);
			}
		} else if (hoveredPlanet && !focusedPlanet) {
			hidePlanetInfo();
		}

		sunMaterial.uniforms.time.value = time;
		coronaMaterial.uniforms.time.value = time;

		solarWindParticles.forEach((particles) => {
			const positions = particles.geometry.attributes.position.array;
			const velocities = particles.geometry.attributes.velocity.array;
			const originalPositions = particles.userData.originalPositions;
			for (let i = 0; i < positions.length; i += 3) {
				positions[i] += velocities[i];
				positions[i + 1] += velocities[i + 1];
				positions[i + 2] += velocities[i + 2];
				const distance = Math.sqrt(
					positions[i] * positions[i] +
						positions[i + 1] * positions[i + 1] +
						positions[i + 2] * positions[i + 2],
				);
				if (distance > 15) {
					positions[i] = originalPositions[i];
					positions[i + 1] = originalPositions[i + 1];
					positions[i + 2] = originalPositions[i + 2];
				}
			}
			particles.geometry.attributes.position.needsUpdate = true;
		});

		planets.forEach((planet) => {
			if (planet.glow && planet.glow.material.uniforms) {
				planet.glow.material.uniforms.time.value = time;
			}
		});

		sun.rotation.y += 0.004;
		sun.rotation.x += 0.002;

		const glowPulse = 0.8 + Math.sin(time * 1.5) * 0.2;
		sunGlow.material.opacity = glowPulse * 0.7;
		sunGlow.scale.set(25 * glowPulse, 25 * glowPulse, 1);

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
		sunParts.forEach((p) => {
			p.visible = isInsideSun;
		});

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

	$(window).on("resize", () => {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	});
});
