// importing necessary libraries and modules
import * as THREE from "https://cdn.skypack.dev/three@0.129.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls, skybox;
let planet_sun, planet_mercury, planet_venus, planet_earth, planet_mars, planet_jupiter, planet_saturn, planet_uranus, planet_neptune;
let raycaster, mouse;
let isPaused = false;
let loadingManager;
let saturn_ring;
let simulationTime = 0;
let lastFrameTime = null;

// Planet information
const planetInfo = {
    sun: {
        name: "Sun",
        description: "The Sun is the star at the center of the Solar System. It is a nearly perfect sphere of hot plasma.",
        diameter: "1,392,700 km",
        distance: "0 AU"
    },
    mercury: {
        name: "Mercury",
        description: "Mercury is the smallest and innermost planet in the Solar System. Its orbital period around the Sun is 87.97 days.",
        diameter: "4,879 km",
        distance: "0.39 AU"
    },
    venus: {
        name: "Venus",
        description: "Venus is the second planet from the Sun and is Earth's closest planetary neighbor.",
        diameter: "12,104 km",
        distance: "0.72 AU"
    },
    earth: {
        name: "Earth",
        description: "Earth is the third planet from the Sun and the only astronomical object known to harbor life.",
        diameter: "12,742 km",
        distance: "1 AU"
    },
    mars: {
        name: "Mars",
        description: "Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System.",
        diameter: "6,779 km",
        distance: "1.52 AU"
    },
    jupiter: {
        name: "Jupiter",
        description: "Jupiter is the fifth planet from the Sun and the largest in the Solar System.",
        diameter: "139,820 km",
        distance: "5.20 AU"
    },
    saturn: {
        name: "Saturn",
        description: "Saturn is the sixth planet from the Sun and the second-largest in the Solar System, after Jupiter.",
        diameter: "116,460 km",
        distance: "9.58 AU"
    },
    uranus: {
        name: "Uranus",
        description: "Uranus is the seventh planet from the Sun. Its name is a reference to the Greek god of the sky.",
        diameter: "50,724 km",
        distance: "19.18 AU"
    },
    neptune: {
        name: "Neptune",
        description: "Neptune is the eighth and farthest-known Solar planet from the Sun.",
        diameter: "49,244 km",
        distance: "30.07 AU"
    }
};

// Setting distances from the Sun for each planet's orbit
let mercury_orbit_radius = 50
let venus_orbit_radius = 60
let earth_orbit_radius = 70
let mars_orbit_radius = 80
let jupiter_orbit_radius = 100
let saturn_orbit_radius = 120
let uranus_orbit_radius = 140
let neptune_orbit_radius = 160

// Setting up the default speeds for each planet's revolution around the Sun
const revolutionSpeeds = {
    mercury: 2,
    venus: 1.5,
    earth: 1,
    mars: 0.8,
    jupiter: 0.7,
    saturn: 0.6,
    uranus: 0.5,
    neptune: 0.4
};

function createLoadingManager() {
    loadingManager = new THREE.LoadingManager();
    loadingManager.onLoad = function() {
        document.getElementById('loading-screen').style.display = 'none';
    };
    return loadingManager;
}

// Making the Space as a cube with images on each side with the help of THREE.js
function createMaterialArray() {
    const skyboxImagepaths = ['../img/skybox/space_ft.png', '../img/skybox/space_bk.png', '../img/skybox/space_up.png', '../img/skybox/space_dn.png', '../img/skybox/space_rt.png', '../img/skybox/space_lf.png'];
    const materialArray = skyboxImagepaths.map((image) => {
        let texture = new THREE.TextureLoader(loadingManager).load(image);
        return new THREE.MeshBasicMaterial({ map: texture, side: THREE.BackSide });
    });
    return materialArray;
}

// Function to set the skybox using the created material array
function setSkyBox() {
    const materialArray = createMaterialArray();
    let skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
    skybox = new THREE.Mesh(skyboxGeo, materialArray);
    scene.add(skybox);
}

// Function to load planet textures and create meshes
function loadPlanetTexture(texture, radius, widthSegments, heightSegments, meshType) {
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const loader = new THREE.TextureLoader(loadingManager);
    const planetTexture = loader.load(texture);
    const material = meshType == 'standard' ? new THREE.MeshStandardMaterial({ map: planetTexture }) : new THREE.MeshBasicMaterial({ map: planetTexture });
    const planet = new THREE.Mesh(geometry, material);
    return planet;
}

// Function to create a ring for each planet's orbit
function createRing(innerRadius) {
    let outerRadius = innerRadius - 0.1;
    let thetaSegments = 100;
    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments);
    const material = new THREE.MeshBasicMaterial({ 
        color: '#ffffff', 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    mesh.rotation.x = Math.PI / 2;
    return mesh;
}

// Function to set up speed controls for each planet
function setupSpeedControls() {
    const speedMap = [
        { id: 'mercury' },
        { id: 'venus' },
        { id: 'earth' },
        { id: 'mars' },
        { id: 'jupiter' },
        { id: 'saturn' },
        { id: 'uranus' },
        { id: 'neptune' },
    ];
    speedMap.forEach(({ id }) => {
        const slider = document.getElementById(`speed-${id}`);
        const valSpan = document.getElementById(`val-${id}`);
        if (slider && valSpan) {
            slider.addEventListener('input', (e) => {
                revolutionSpeeds[id] = parseFloat(e.target.value);
                valSpan.textContent = e.target.value;
            });
        }
    });
}

// Function to initialize the scene, camera, renderer, and controls
function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        85,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    createLoadingManager();
    setSkyBox();

    // Load planets
    planet_earth = loadPlanetTexture("../img/earth_hd.jpg", 4, 100, 100, 'standard');
    planet_sun = loadPlanetTexture("../img/sun_hd.jpg", 20, 100, 100, 'basic');
    planet_mercury = loadPlanetTexture("../img/mercury_hd.jpg", 2, 100, 100, 'standard');
    planet_venus = loadPlanetTexture("../img/venus_hd.jpg", 3, 100, 100, 'standard');
    planet_mars = loadPlanetTexture("../img/mars_hd.jpg", 3.5, 100, 100, 'standard');
    planet_jupiter = loadPlanetTexture("../img/jupiter_hd.jpg", 10, 100, 100, 'standard');
    planet_saturn = loadPlanetTexture("../img/saturn_hd.jpg", 8, 100, 100, 'standard');
    planet_uranus = loadPlanetTexture("../img/uranus_hd.jpg", 6, 100, 100, 'standard');
    planet_neptune = loadPlanetTexture("../img/neptune_hd.jpg", 5, 100, 100, 'standard');

    // Add planets to scene
    scene.add(planet_earth);
    scene.add(planet_sun);
    scene.add(planet_mercury);
    scene.add(planet_venus);
    scene.add(planet_mars);
    scene.add(planet_jupiter);
    scene.add(planet_saturn);
    scene.add(planet_uranus);
    scene.add(planet_neptune);

    // Add sun light
    const sunLight = new THREE.PointLight(0xffffff, 1, 0);
    sunLight.position.copy(planet_sun.position);
    scene.add(sunLight);

    // Create orbit rings
    createRing(mercury_orbit_radius);
    createRing(venus_orbit_radius);
    createRing(earth_orbit_radius);
    createRing(mars_orbit_radius);
    createRing(jupiter_orbit_radius);
    createRing(saturn_orbit_radius);
    createRing(uranus_orbit_radius);
    createRing(neptune_orbit_radius);

    // Add Saturn's ring
    const ringGeometry = new THREE.RingGeometry(9.5, 14, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xd2b48c,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
    });
    saturn_ring = new THREE.Mesh(ringGeometry, ringMaterial);
    saturn_ring.rotation.x = Math.PI / 2;
    planet_saturn.add(saturn_ring);

    // Setup renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.domElement.id = "c";

    // Setup controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 12;
    controls.maxDistance = 300;

    // Setup raycaster for planet selection
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Setup event listeners
    window.addEventListener('click', onMouseClick);
    document.getElementById('zoom-in').addEventListener('click', () => {
        camera.position.multiplyScalar(0.9);
    });
    document.getElementById('zoom-out').addEventListener('click', () => {
        camera.position.multiplyScalar(1.1);
    });
    document.getElementById('pause').addEventListener('click', () => {
        isPaused = !isPaused;
        document.getElementById('pause').textContent = isPaused ? '▶' : '⏸';
    });
    document.getElementById('reset').addEventListener('click', () => {
        camera.position.set(0, 0, 100);
        controls.reset();
    });
    document.getElementById('theme-toggle').addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
    });

    camera.position.z = 100;
    setupSpeedControls();
}

// Function to handle mouse click events for planet selection
function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const planets = [
        { mesh: planet_sun, name: 'sun' },
        { mesh: planet_mercury, name: 'mercury' },
        { mesh: planet_venus, name: 'venus' },
        { mesh: planet_earth, name: 'earth' },
        { mesh: planet_mars, name: 'mars' },
        { mesh: planet_jupiter, name: 'jupiter' },
        { mesh: planet_saturn, name: 'saturn' },
        { mesh: planet_uranus, name: 'uranus' },
        { mesh: planet_neptune, name: 'neptune' }
    ];

    const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

    if (intersects.length > 0) {
        const selectedPlanet = planets.find(p => p.mesh === intersects[0].object);
        updatePlanetInfo(selectedPlanet.name);
    }
}

// Function to update the planet information displayed in the info panel
function updatePlanetInfo(planetName) {
    const info = planetInfo[planetName];
    document.getElementById('selected-planet').textContent = info.name;
    document.getElementById('planet-description').innerHTML = `
        <p>${info.description}</p>
        <p><strong>Diameter:</strong> ${info.diameter}</p>
        <p><strong>Distance from Sun:</strong> ${info.distance}</p>
    `;
}

// Function to revolve planets around the Sun based on simulation time
function planetRevolver(time, speed, planet, orbitRadius, planetName) {
    if (!isPaused) {
        let orbitSpeedMultiplier = 0.001;
        const planetAngle = time * orbitSpeedMultiplier * speed;
        planet.position.x = planet_sun.position.x + orbitRadius * Math.cos(planetAngle);
        planet.position.z = planet_sun.position.z + orbitRadius * Math.sin(planetAngle);
    }
}

// Animation loop
function animate(now) {
    requestAnimationFrame(animate);
    if (lastFrameTime === null) lastFrameTime = now;
    const delta = now - lastFrameTime;
    if (!isPaused) {
        simulationTime += delta;
    }
    lastFrameTime = now;

    // Rotate the planets 
    const rotationSpeed = 0.008;
    planet_earth.rotation.y += rotationSpeed;
    planet_sun.rotation.y += rotationSpeed;
    planet_mercury.rotation.y += rotationSpeed;
    planet_venus.rotation.y += rotationSpeed;
    planet_mars.rotation.y += rotationSpeed;
    planet_jupiter.rotation.y += rotationSpeed;
    planet_saturn.rotation.y += rotationSpeed;
    planet_uranus.rotation.y += rotationSpeed;
    planet_neptune.rotation.y += rotationSpeed;

    // Revolve planets around the sun (use simulationTime)
    planetRevolver(simulationTime, revolutionSpeeds.mercury, planet_mercury, mercury_orbit_radius, 'mercury');
    planetRevolver(simulationTime, revolutionSpeeds.venus, planet_venus, venus_orbit_radius, 'venus');
    planetRevolver(simulationTime, revolutionSpeeds.earth, planet_earth, earth_orbit_radius, 'earth');
    planetRevolver(simulationTime, revolutionSpeeds.mars, planet_mars, mars_orbit_radius, 'mars');
    planetRevolver(simulationTime, revolutionSpeeds.jupiter, planet_jupiter, jupiter_orbit_radius, 'jupiter');
    planetRevolver(simulationTime, revolutionSpeeds.saturn, planet_saturn, saturn_orbit_radius, 'saturn');
    planetRevolver(simulationTime, revolutionSpeeds.uranus, planet_uranus, uranus_orbit_radius, 'uranus');
    planetRevolver(simulationTime, revolutionSpeeds.neptune, planet_neptune, neptune_orbit_radius, 'neptune');

    controls.update();
    renderer.render(scene, camera);
}

// Function to handle window resize events
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize, false);

// Function to create a label for each planet
function createPlanetLabel(planet, name) {
    const label = document.createElement('div');
    label.className = 'planet-label-3d';
    label.textContent = name;
    document.body.appendChild(label);
    return label;
}

init();
animate(0);