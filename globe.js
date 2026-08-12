(function () {
  const frame = document.getElementById("globeFrame");
  const tooltip = document.getElementById("globeTooltip");
  const loadingEl = document.getElementById("globeLoading");
  if (!frame || typeof THREE === "undefined") return;

  const LOCATIONS = [
    { name: "Santiago, Chile", lat: -33.45, lon: -70.65, type: "lived" },
    { name: "Antofagasta, Chile", lat: -23.65, lon: -70.40, type: "lived" },
    { name: "Tucson, Arizona", lat: 32.22, lon: -110.97, type: "lived" },
    { name: "Santa Clara, California", lat: 37.35, lon: -121.95, type: "lived" },
    { name: "New York, New York", lat: 40.71, lon: -74.01, type: "lived" },
    { name: "Canada", lat: 43.65, lon: -79.38, type: "visited" },
    { name: "Mexico", lat: 19.43, lon: -99.13, type: "visited" },
    { name: "Argentina", lat: -34.60, lon: -58.38, type: "visited" },
    { name: "Colombia", lat: 4.71, lon: -74.07, type: "visited" },
    { name: "Brazil", lat: -22.91, lon: -43.17, type: "visited" },
    { name: "Peru", lat: -12.05, lon: -77.04, type: "visited" },
    { name: "South Korea", lat: 37.57, lon: 126.98, type: "visited" }
  ];

  const COLOR_LIVED = 0xff8c1a;
  const COLOR_VISITED = 0x0e5c8a;
  const COLOR_WIRE = 0x22d3ee;
  const RADIUS = 1.6;

  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer, scene, camera, globeGroup, raycaster, mouse;
  let pinMeshes = [];
  let dragging = false;
  let lastX = 0, lastY = 0;
  let velX = 0, velY = 0;
  let autoRotate = true;
  let idleTimer = null;
  let started = false;
  let frameW = 0, frameH = 0;

  function latLonToVec3(lat, lon, r) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }

  function makeDotTexture(color) {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    const hex = "#" + color.toString(16).padStart(6, "0");
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.25, hex);
    grad.addColorStop(0.55, hex);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  function buildWireGlobe() {
    const group = new THREE.Group();

    // Solid inner sphere (glass/hologram fill)
    const solidGeo = new THREE.SphereGeometry(RADIUS * 0.985, 48, 32);
    const solidMat = new THREE.MeshBasicMaterial({
      color: 0x0a2540,
      transparent: true,
      opacity: 0.55
    });
    group.add(new THREE.Mesh(solidGeo, solidMat));

    // Continent landmask (cyan-tinted, matches theme rather than a photo-real earth)
    const landTex = new THREE.TextureLoader().load(
      "assets/globe-landmask.png",
      () => { if (renderer) renderer.render(scene, camera); }
    );
    const landGeo = new THREE.SphereGeometry(RADIUS * 0.998, 64, 40);
    const landMat = new THREE.MeshBasicMaterial({ map: landTex, transparent: true, opacity: 0.8 });
    group.add(new THREE.Mesh(landGeo, landMat));

    // Lat/long wireframe grid
    const lineMat = new THREE.LineBasicMaterial({ color: COLOR_WIRE, transparent: true, opacity: 0.35 });
    const lineMatEquator = new THREE.LineBasicMaterial({ color: COLOR_WIRE, transparent: true, opacity: 0.65 });

    for (let lat = -60; lat <= 60; lat += 20) {
      const pts = [];
      for (let lon = 0; lon <= 360; lon += 4) {
        pts.push(latLonToVec3(lat, lon - 180, RADIUS));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      group.add(new THREE.Line(geo, lat === 0 ? lineMatEquator : lineMat));
    }

    for (let lon = -180; lon < 180; lon += 20) {
      const pts = [];
      for (let lat = -90; lat <= 90; lat += 4) {
        pts.push(latLonToVec3(lat, lon, RADIUS));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      group.add(new THREE.Line(geo, lineMat));
    }

    // Outer glow rim
    const rimGeo = new THREE.SphereGeometry(RADIUS * 1.04, 32, 24);
    const rimMat = new THREE.MeshBasicMaterial({
      color: COLOR_WIRE,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide
    });
    group.add(new THREE.Mesh(rimGeo, rimMat));

    return group;
  }

  function buildPins() {
    const livedTex = makeDotTexture(COLOR_LIVED);
    const visitedTex = makeDotTexture(COLOR_VISITED);
    const pins = [];
    LOCATIONS.forEach(loc => {
      const pos = latLonToVec3(loc.lat, loc.lon, RADIUS * 1.015);
      const mat = new THREE.SpriteMaterial({
        map: loc.type === "lived" ? livedTex : visitedTex,
        transparent: true,
        depthTest: true
      });
      const sprite = new THREE.Sprite(mat);
      sprite.position.copy(pos);
      const scale = 0.16;
      sprite.scale.set(scale, scale, scale);
      sprite.userData = loc;
      pins.push(sprite);
    });
    return pins;
  }

  function init(retriesLeft) {
    if (started) return;
    if (retriesLeft === undefined) retriesLeft = 20;
    if (frame.clientWidth === 0 && retriesLeft > 0) {
      // Layout not settled yet (fonts/images still loading) — wait and retry.
      // Uses setTimeout rather than requestAnimationFrame: rAF is throttled
      // (or may never fire) in backgrounded/inactive tabs, which would stall
      // this retry forever and silently prevent the globe from ever appearing.
      setTimeout(() => init(retriesLeft - 1), 60);
      return;
    }
    started = true;
    if (loadingEl) loadingEl.remove();

    scene = new THREE.Scene();
    frameW = frame.clientWidth || 300;
    frameH = frame.clientHeight || frameW;

    camera = new THREE.PerspectiveCamera(42, frameW / frameH, 0.1, 100);
    camera.position.set(0, 0.15, 4.6);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(frameW, frameH);
    frame.appendChild(renderer.domElement);

    globeGroup = buildWireGlobe();
    globeGroup.rotation.y = -0.6;
    globeGroup.rotation.x = 0.15;
    scene.add(globeGroup);

    pinMeshes = buildPins();
    pinMeshes.forEach(p => globeGroup.add(p));

    raycaster = new THREE.Raycaster();
    raycaster.params.Sprite = { threshold: 0.08 };
    mouse = new THREE.Vector2();

    setupInteraction();
    window.addEventListener("resize", onResize);
    renderer.render(scene, camera);
    animate();
  }

  function onResize() {
    if (!renderer) return;
    frameW = frame.clientWidth;
    frameH = frame.clientHeight || frameW;
    camera.aspect = frameW / frameH;
    camera.updateProjectionMatrix();
    renderer.setSize(frameW, frameH);
    renderer.render(scene, camera);
  }

  function setupInteraction() {
    const dom = renderer.domElement;
    dom.style.touchAction = "none";
    dom.style.cursor = "grab";

    function pointerDown(e) {
      dragging = true;
      autoRotate = false;
      clearTimeout(idleTimer);
      lastX = e.clientX;
      lastY = e.clientY;
      velX = 0; velY = 0;
      dom.style.cursor = "grabbing";
      dom.setPointerCapture && dom.setPointerCapture(e.pointerId);
    }

    function pointerMove(e) {
      updateTooltip(e);
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      globeGroup.rotation.y += dx * 0.006;
      globeGroup.rotation.x += dy * 0.006;
      globeGroup.rotation.x = Math.max(-1.2, Math.min(1.2, globeGroup.rotation.x));
      velX = dx * 0.006;
      velY = dy * 0.006;
      renderer.render(scene, camera);
    }

    function pointerUp(e) {
      dragging = false;
      dom.style.cursor = "grab";
      idleTimer = setTimeout(() => { autoRotate = true; }, 1400);
    }

    dom.addEventListener("pointerdown", pointerDown);
    window.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerup", pointerUp);
    dom.addEventListener("pointerleave", () => { if (!dragging) hideTooltip(); });
  }

  function updateTooltip(e) {
    if (dragging) { hideTooltip(); return; }
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(pinMeshes);
    if (hits.length) {
      const loc = hits[0].object.userData;
      tooltip.textContent = loc.name;
      tooltip.style.left = (e.clientX - rect.left) + "px";
      tooltip.style.top = (e.clientY - rect.top) + "px";
      tooltip.classList.add("show");
      renderer.domElement.style.cursor = "pointer";
    } else {
      hideTooltip();
      if (!dragging) renderer.domElement.style.cursor = "grab";
    }
  }

  function hideTooltip() {
    tooltip.classList.remove("show");
  }

  function tick() {
    if (autoRotate && !reduceMotion) {
      globeGroup.rotation.y += 0.0018;
    } else if (!dragging && (Math.abs(velX) > 0.0001 || Math.abs(velY) > 0.0001)) {
      globeGroup.rotation.y += velX;
      globeGroup.rotation.x += velY;
      globeGroup.rotation.x = Math.max(-1.2, Math.min(1.2, globeGroup.rotation.x));
      velX *= 0.94;
      velY *= 0.94;
    }
    renderer.render(scene, camera);
  }

  // setInterval rather than requestAnimationFrame: rAF is throttled to
  // near-zero in backgrounded/inactive tabs (and doesn't fire at all in some
  // automated/embedded contexts), which would freeze the globe entirely.
  function animate() {
    setInterval(tick, 16);
  }

  function setupLazyInit() {
    if (!("IntersectionObserver" in window)) { init(); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          init();
          observer.disconnect();
        }
      });
    }, { threshold: 0.15 });
    observer.observe(frame);
    // Safety net: some environments don't reliably fire IntersectionObserver
    // (or the frame is already on-screen at load). Force init after a beat
    // regardless, so the globe never silently fails to appear.
    setTimeout(() => { if (!started) init(); }, 1200);
  }

  setupLazyInit();
})();
