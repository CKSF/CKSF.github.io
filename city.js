const THREE_URLS = [
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js",
    "https://unpkg.com/three@0.180.0/build/three.module.js"
];

const districts = [
    {
        id: "data",
        number: "01",
        code: "DATA",
        zh: "数据塔",
        en: "Data Tower",
        zhIntro: "Agent 与数据系统的控制中枢，记录我如何把复杂工作流做成真正可用的产品。",
        enIntro: "The control center for agent and data systems, showing how complex workflows become usable products.",
        href: "hire.html",
        x: -8.5,
        z: -3.5,
        height: 10.5,
        width: 4.2,
        depth: 4.2,
        style: "tower"
    },
    {
        id: "lab",
        number: "02",
        code: "LAB",
        zh: "研究实验室",
        en: "Research Lab",
        zhIntro: "从真实临床问题出发，在这里把数据、模型和研究判断连成一条完整路径。",
        enIntro: "Research starts with real clinical questions, then connects data, models, and evidence into one path.",
        href: "work.html#publications",
        x: -2,
        z: -7.5,
        height: 5.2,
        width: 6.2,
        depth: 4.2,
        style: "lab"
    },
    {
        id: "workshop",
        number: "03",
        code: "BUILD",
        zh: "工程工坊",
        en: "Workshop",
        zhIntro: "把想法落成可以运行的产品，保留工程取舍、系统细节与真实交付过程。",
        enIntro: "Ideas become working products here, with the engineering choices and delivery process left visible.",
        href: "work.html#projects",
        x: 5.2,
        z: -5.4,
        height: 4.5,
        width: 5.4,
        depth: 4.8,
        style: "workshop"
    },
    {
        id: "library",
        number: "04",
        code: "WRITE",
        zh: "图书馆",
        en: "Library",
        zhIntro: "写下技术、产品与人的交叉思考，让长期形成的判断有迹可循。",
        enIntro: "A place for writing across technology, products, and people, preserving how longer-term judgments form.",
        href: "blog.html",
        x: 9,
        z: 1.8,
        height: 6.2,
        width: 4.8,
        depth: 5.5,
        style: "library"
    },
    {
        id: "apartment",
        number: "05",
        code: "NOW",
        zh: "公寓",
        en: "Apartment",
        zhIntro: "一间关于当下的房间，记录正在推进的事情和仍然没有答案的问题。",
        enIntro: "A room about the present, recording what is moving forward and which questions remain open.",
        href: "now.html",
        x: 4.2,
        z: 7.2,
        height: 7.4,
        width: 4,
        depth: 4,
        style: "apartment"
    },
    {
        id: "archive",
        number: "06",
        code: "READ",
        zh: "档案馆",
        en: "Archive",
        zhIntro: "保存读过的书与形成的判断，更关心它们后来如何改变行动。",
        enIntro: "An archive of books and the judgments they shaped, with attention to how they later changed action.",
        href: "reading.html",
        x: -2.4,
        z: 7.8,
        height: 4.2,
        width: 5.4,
        depth: 4,
        style: "archive"
    },
    {
        id: "radio",
        number: "07",
        code: "AUDIO",
        zh: "电台",
        en: "Radio Station",
        zhIntro: "工作与生活之间的声音空间，收藏音乐、播客以及让我保持节奏的内容。",
        enIntro: "A listening space between work and life, collecting the music, podcasts, and rhythms that keep me moving.",
        href: "listening.html",
        x: -8.8,
        z: 5.2,
        height: 5.6,
        width: 3.8,
        depth: 3.8,
        style: "radio"
    },
    {
        id: "darkroom",
        number: "08",
        code: "IMAGE",
        zh: "暗房",
        en: "Photo Booth",
        zhIntro: "用城市、光影与日常片段，保留那些很难只靠文字表达的观察。",
        enIntro: "Cities, light, and everyday fragments preserve observations that words alone cannot quite hold.",
        href: "photos.html",
        x: -10.8,
        z: 11,
        height: 3.5,
        width: 4.2,
        depth: 3.4,
        style: "photo"
    }
];

const state = {
    mode: "city",
    language: document.documentElement.lang.startsWith("en") ? "en" : "zh",
    theme: document.documentElement.dataset.siteTheme || "signature",
    compact: window.matchMedia("(max-width: 760px)").matches || new URLSearchParams(location.search).get("mobile") === "1",
    touring: false,
    tourTimer: null
};

function applyCopy() {
    state.language = document.documentElement.lang.startsWith("en") ? "en" : "zh";
    const english = state.language === "en";
    document.querySelectorAll("[data-copy-zh]").forEach((node) => {
        const value = node.dataset[english ? "copyEn" : "copyZh"];
        if (value != null) node.innerHTML = value;
    });
    document.querySelector(".city-mode-switch")?.setAttribute(
        "aria-label",
        english ? "Homepage mode" : "首页模式"
    );
    document.querySelector("[data-city-help]")?.setAttribute(
        "aria-label",
        english ? "City controls" : "城市操作"
    );
    document.querySelector("[data-city-controls-panel]")?.setAttribute(
        "aria-label",
        english ? "City controls" : "城市操作"
    );
    document.querySelector("[data-city-help-close]")?.setAttribute(
        "aria-label",
        english ? "Close controls" : "关闭操作说明"
    );
    document.querySelector("[data-city-tour-prev]")?.setAttribute(
        "aria-label",
        english ? "Previous building" : "上一栋建筑"
    );
    document.querySelector("[data-city-tour-next]")?.setAttribute(
        "aria-label",
        english ? "Next building" : "下一栋建筑"
    );
    const tourButtonLabel = document.querySelector("[data-city-tour] span:first-child");
    if (tourButtonLabel) {
        tourButtonLabel.textContent = state.touring
            ? (english ? "Stop tour" : "停止导览")
            : (english ? "Start city tour" : "开始城市导览");
    }
    window.dispatchEvent(new CustomEvent("site-language-change"));
}

function setHomeMode(mode) {
    state.mode = mode === "index" ? "index" : "city";
    document.body.dataset.homeMode = state.mode;
    document.querySelectorAll("[data-home-mode]").forEach((button) => {
        button.classList.toggle("active", button.dataset.homeMode === state.mode);
    });
    try { localStorage.setItem("home-mode", state.mode); } catch (error) {}
    const url = new URL(location.href);
    if (state.mode === "index") url.searchParams.set("view", "index");
    else url.searchParams.delete("view");
    history.replaceState(null, "", url);
    window.dispatchEvent(new CustomEvent("home-mode-change", {
        detail: { mode: state.mode }
    }));
    if (state.mode === "city") {
        requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    }
}

function themedHref(href, params = {}) {
    const url = new URL(href, location.href);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    if (document.documentElement.dataset.siteTheme === "paper") url.searchParams.set("theme", "light");
    else url.searchParams.delete("theme");
    return `${url.pathname.split("/").pop()}${url.search}${url.hash}`;
}

function bindPageControls() {
    document.body.dataset.mobileExperience = state.compact ? "compact" : "desktop";
    document.querySelectorAll("[data-home-mode]").forEach((button) => {
        button.addEventListener("click", () => setHomeMode(button.dataset.homeMode));
    });

    const requestedMode = new URLSearchParams(location.search).get("view");
    const savedMode = (() => {
        try { return localStorage.getItem("home-mode"); } catch (error) { return null; }
    })();
    const mobileDefault = state.compact && !requestedMode && !savedMode;
    setHomeMode(requestedMode === "index" || (!requestedMode && savedMode === "index") || mobileDefault ? "index" : "city");

    const controlsPanel = document.querySelector("[data-city-controls-panel]");
    const setControlsOpen = (open) => {
        controlsPanel?.classList.toggle("open", open);
        controlsPanel?.setAttribute("aria-hidden", String(!open));
    };
    document.querySelector("[data-city-help]")?.addEventListener("click", () => {
        setControlsOpen(!controlsPanel?.classList.contains("open"));
    });
    document.querySelector("[data-city-help-close]")?.addEventListener("click", () => setControlsOpen(false));
    if (state.compact && controlsPanel) {
        const rows = controlsPanel.querySelectorAll("dl div");
        if (rows[0]) rows[0].innerHTML = '<dt data-copy-zh="滑动" data-copy-en="Swipe">滑动</dt><dd data-copy-zh="旋转城市" data-copy-en="Rotate city">旋转城市</dd>';
        if (rows[1]) rows[1].innerHTML = '<dt data-copy-zh="点按" data-copy-en="Tap">点按</dt><dd data-copy-zh="进入建筑" data-copy-en="Enter building">进入建筑</dd>';
        if (rows[2]) rows[2].innerHTML = '<dt>INDEX</dt><dd data-copy-zh="打开快速索引" data-copy-en="Open fast navigation">打开快速索引</dd>';
        rows[3]?.remove();
        rows[4]?.remove();
        const hint = document.querySelector(".city-hint");
        if (hint) {
            hint.dataset.copyZh = "<span>滑动</span>旋转 · <span>点按</span>进入";
            hint.dataset.copyEn = "<span>Swipe</span> rotate · <span>Tap</span> enter";
        }
        const indexIntro = document.querySelector(".index-header p");
        if (indexIntro) {
            indexIntro.dataset.copyZh = "手机端默认使用快速索引，信息更集中、点击路径更短。也可以随时进入完整 3D 城市。";
            indexIntro.dataset.copyEn = "Mobile opens with the fast index for shorter paths. The full 3D city remains one tap away.";
        }
        const cityButtonLabel = document.querySelector(".index-toolbar [data-home-mode='city'] span:first-child");
        if (cityButtonLabel) {
            cityButtonLabel.dataset.copyZh = "进入 3D 城市";
            cityButtonLabel.dataset.copyEn = "Open 3D city";
        }
    }

    window.addEventListener("keydown", (event) => {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
        if (event.key === "Escape") setControlsOpen(false);
        if (event.key.toLowerCase() === "i") setHomeMode(state.mode === "city" ? "index" : "city");
    });

    const observer = new MutationObserver(() => applyCopy());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    applyCopy();
}

bindPageControls();

async function bootCity() {
    const viewport = document.querySelector("[data-city-viewport]");
    const canvas = document.querySelector("[data-city-canvas]");
    const loader = document.querySelector("[data-city-loader]");
    const tooltip = document.querySelector("[data-city-tooltip]");
    if (!viewport || !canvas) return;

    if (!window.WebGLRenderingContext || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        viewport.classList.add("failed");
        return;
    }

    let THREE = null;
    for (const url of THREE_URLS) {
        try {
            THREE = await import(url);
            break;
        } catch (error) {}
    }
    if (!THREE) {
        viewport.classList.add("failed");
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 120);
    camera.position.set(28, 25, 31);
    camera.lookAt(0, 2.4, 0);

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: !state.compact,
            alpha: true,
            powerPreference: "high-performance"
        });
    } catch (error) {
        viewport.classList.add("failed");
        return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, state.compact ? 1.25 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = state.theme === "paper" ? 1.08 : 1.16;
    renderer.shadowMap.enabled = window.innerWidth > 760;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const world = new THREE.Group();
    world.rotation.y = -0.38;
    scene.add(world);
    const cyberLayer = new THREE.Group();
    cyberLayer.name = "signature-cyber-layer";
    const paperLayer = new THREE.Group();
    paperLayer.name = "paper-life-layer";
    world.add(cyberLayer, paperLayer);

    const palette = {
        signature: {
            background: 0x07090d,
            ground: 0x0e1219,
            groundTop: 0x151a22,
            building: 0x252b35,
            buildingAlt: 0x171c24,
            roof: 0x323945,
            line: 0x596171,
            road: 0x090b10,
            accent: 0xf6dd47,
            accentSoft: 0x8d812f,
            cool: 0x68d8e8,
            plant: 0x6d8c57,
            window: 0xf6dd47,
            fog: 0x07090d
        },
        paper: {
            background: 0xf4f1e9,
            ground: 0xe5dfd2,
            groundTop: 0xfaf7ef,
            building: 0xd2cabb,
            buildingAlt: 0xe8e2d7,
            roof: 0xbab09e,
            line: 0x6d6559,
            road: 0xc6bdad,
            accent: 0x9b2f21,
            accentSoft: 0xbb7b6e,
            cool: 0x215d68,
            plant: 0x708447,
            window: 0x9b2f21,
            fog: 0xf4f1e9
        }
    };

    const dynamicMaterials = [];
    const makeMaterial = (slot, options = {}) => {
        const material = new THREE.MeshStandardMaterial({
            color: palette[state.theme][slot],
            roughness: options.roughness ?? 0.82,
            metalness: options.metalness ?? 0.04,
            flatShading: options.flatShading ?? false,
            transparent: options.transparent ?? false,
            opacity: options.opacity ?? 1
        });
        material.userData.paletteSlot = slot;
        dynamicMaterials.push(material);
        return material;
    };

    const matGround = makeMaterial("ground", { roughness: 0.98 });
    const matGroundTop = makeMaterial("groundTop", { roughness: 0.9 });
    const matBuilding = makeMaterial("building", { roughness: 0.58, metalness: 0.14 });
    const matBuildingAlt = makeMaterial("buildingAlt", { roughness: 0.66, metalness: 0.1 });
    const matRoof = makeMaterial("roof", { roughness: 0.46, metalness: 0.28 });
    const matRoad = makeMaterial("road", { roughness: 0.94 });
    const matAccent = makeMaterial("accent", { roughness: 0.3, metalness: 0.42 });
    const matAccentSoft = makeMaterial("accentSoft", { roughness: 0.52, metalness: 0.2 });
    const matCool = makeMaterial("cool", { roughness: 0.28, metalness: 0.24 });
    const matPlant = makeMaterial("plant", { roughness: 0.84 });
    const matWindow = new THREE.MeshStandardMaterial({
        color: palette[state.theme].window,
        emissive: palette[state.theme].window,
        emissiveIntensity: state.theme === "paper" ? 0.18 : 2.8,
        roughness: 0.24,
        metalness: 0.12
    });
    matWindow.userData.paletteSlot = "window";
    matWindow.userData.emissivePaletteSlot = "window";
    dynamicMaterials.push(matWindow);
    const signboards = [];

    function signText(district) {
        const label = state.language === "en" ? district.en : district.zh;
        const icons = {
            tower: "▥",
            lab: "◌",
            workshop: "▦",
            library: "≡",
            apartment: "⌂",
            archive: "[]",
            radio: ")))",
            photo: "●"
        };
        return `${icons[district.style] || "·"}  ${district.code}  //  ${label}`;
    }

    function drawSign(signboard) {
        const { canvas, texture, district } = signboard;
        const context = canvas.getContext("2d");
        const colors = palette[state.theme];
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = `#${colors.background.toString(16).padStart(6, "0")}`;
        context.globalAlpha = state.theme === "paper" ? 0.94 : 0.92;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalAlpha = 1;
        context.strokeStyle = `#${colors.accent.toString(16).padStart(6, "0")}`;
        context.lineWidth = 4;
        context.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
        context.fillStyle = `#${colors.accent.toString(16).padStart(6, "0")}`;
        context.font = "600 27px 'JetBrains Mono', monospace";
        context.textBaseline = "middle";
        context.fillText(signText(district), 24, canvas.height / 2);
        texture.needsUpdate = true;
    }

    function addSignboard(group, district, width = 3.4) {
        const canvas = document.createElement("canvas");
        canvas.width = 768;
        canvas.height = 128;
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });
        const sign = new THREE.Sprite(material);
        sign.scale.set(width, width * 0.17, 1);
        sign.position.set(0, 1.05, district.depth / 2 + 0.95);
        sign.renderOrder = 1000;
        sign.userData.decorative = true;
        group.add(sign);
        const leftPost = detailBox(group, 0.055, 0.72, 0.055, matAccent, -width * 0.38, 0.62, district.depth / 2 + 0.9, false);
        const rightPost = detailBox(group, 0.055, 0.72, 0.055, matAccent, width * 0.38, 0.62, district.depth / 2 + 0.9, false);
        leftPost.userData.decorative = true;
        rightPost.userData.decorative = true;
        const signboard = { canvas, texture, material, district, sign };
        signboards.push(signboard);
        drawSign(signboard);
        return sign;
    }

    scene.fog = new THREE.FogExp2(palette[state.theme].fog, 0.018);

    const ambient = new THREE.HemisphereLight(0xdbe7ff, 0x141821, state.theme === "paper" ? 2.4 : 1.6);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(state.theme === "paper" ? 0xfff7e4 : 0xfff3ba, 3.2);
    sun.position.set(15, 30, 18);
    sun.castShadow = renderer.shadowMap.enabled;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -24;
    sun.shadow.camera.right = 24;
    sun.shadow.camera.top = 24;
    sun.shadow.camera.bottom = -24;
    sun.shadow.bias = -0.00018;
    sun.shadow.normalBias = 0.025;
    sun.shadow.radius = 3;
    scene.add(sun);

    const fill = new THREE.PointLight(palette[state.theme].cool, 1.6, 42);
    fill.position.set(-14, 11, -8);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(palette[state.theme].cool, state.theme === "paper" ? 0.65 : 2.2);
    rim.position.set(-18, 16, -20);
    scene.add(rim);

    const groundBase = new THREE.Mesh(new THREE.BoxGeometry(36, 1.5, 36), matGround);
    groundBase.position.y = -0.8;
    groundBase.receiveShadow = true;
    world.add(groundBase);

    const groundTop = new THREE.Mesh(new THREE.BoxGeometry(34, 0.24, 34), matGroundTop);
    groundTop.position.y = 0.05;
    groundTop.receiveShadow = true;
    world.add(groundTop);

    function box(width, height, depth, material, x = 0, y = height / 2, z = 0) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
        mesh.position.set(x, y, z);
        mesh.castShadow = renderer.shadowMap.enabled;
        mesh.receiveShadow = true;
        return mesh;
    }

    const outlineMaterial = new THREE.LineBasicMaterial({
        color: palette[state.theme].line,
        transparent: true,
        opacity: state.theme === "paper" ? 0.22 : 0.08
    });
    outlineMaterial.userData.paletteSlot = "line";
    dynamicMaterials.push(outlineMaterial);

    function addOutline(mesh, parent = mesh) {
        const edges = new THREE.LineSegments(
            new THREE.EdgesGeometry(mesh.geometry, 24),
            outlineMaterial
        );
        edges.position.copy(mesh.position);
        edges.rotation.copy(mesh.rotation);
        edges.scale.copy(mesh.scale);
        edges.userData.decorative = true;
        if (parent === mesh) {
            edges.position.set(0, 0, 0);
            mesh.add(edges);
        } else {
            parent.add(edges);
        }
        return mesh;
    }

    function detailBox(group, width, height, depth, material, x, y, z, outlined = true) {
        const mesh = box(width, height, depth, material, x, y, z);
        if (outlined) addOutline(mesh);
        group.add(mesh);
        return mesh;
    }

    function addRoofUnits(group, baseHeight, count, spread, material = matRoof, centerX = 0, centerZ = 0) {
        for (let index = 0; index < count; index++) {
            const offset = (index - (count - 1) / 2) * spread;
            detailBox(group, 0.72, 0.52, 0.9, material, centerX + offset, baseHeight + 0.26, centerZ);
            const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.42, 16), matAccentSoft);
            vent.position.set(centerX + offset, baseHeight + 0.72, centerZ);
            addOutline(vent);
            group.add(vent);
        }
    }

    function addBalconies(group, width, height, depth, floors) {
        for (let floor = 1; floor <= floors; floor++) {
            const y = 0.8 + floor * (height / (floors + 1));
            const slab = detailBox(group, width + 0.46, 0.12, 0.62, matRoof, 0, y, depth / 2 + 0.24);
            slab.castShadow = false;
            for (let column = -2; column <= 2; column++) {
                detailBox(group, 0.055, 0.42, 0.055, matAccentSoft, column * width / 5, y + 0.24, depth / 2 + 0.52, false);
            }
        }
    }

    function addSolarArray(group, y, z) {
        for (let index = -1; index <= 1; index++) {
            const panel = detailBox(group, 1.15, 0.08, 0.78, matCool, index * 1.25, y, z);
            panel.rotation.x = -0.24;
        }
    }

    function addMiniPerson(group, x, z, options = {}) {
        const person = new THREE.Group();
        person.position.set(x, options.y ?? 0.55, z);
        person.rotation.y = options.rotation ?? 0;
        const bodyHeight = options.seated ? 0.34 : 0.52;
        const body = box(0.18, bodyHeight, 0.16, options.material || matCool, 0, bodyHeight / 2, 0);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 12), matGroundTop);
        head.position.y = bodyHeight + 0.1;
        head.userData.decorative = true;
        body.userData.decorative = true;
        person.add(body, head);
        if (options.seated) {
            const chair = box(0.16, 0.16, 0.32, matRoof, 0, 0.06, 0.12);
            chair.userData.decorative = true;
            person.add(chair);
        }
        person.userData.decorative = true;
        group.add(person);
        return person;
    }

    function addBookSpines(group, centerX, y, z, count = 5, scale = 1) {
        const materials = [matAccent, matCool, matAccentSoft, matGroundTop];
        for (let index = 0; index < count; index++) {
            const spine = detailBox(
                group,
                0.11 * scale,
                (0.35 + (index % 3) * 0.06) * scale,
                0.24 * scale,
                materials[index % materials.length],
                centerX + (index - (count - 1) / 2) * 0.13 * scale,
                y,
                z,
                false
            );
            spine.rotation.z = (index - 2) * 0.015;
            spine.userData.decorative = true;
        }
    }

    function addPlanter(group, x, y, z, scale = 1) {
        detailBox(group, 0.62 * scale, 0.24 * scale, 0.42 * scale, matCool, x, y, z);
        const crown = new THREE.Mesh(new THREE.SphereGeometry(0.25 * scale, 16, 12), matPlant);
        crown.position.set(x, y + 0.28 * scale, z);
        crown.userData.decorative = true;
        group.add(crown);
    }

    const roads = [
        box(32, 0.06, 2.1, matRoad, 0, 0.21, 0),
        box(2.1, 0.06, 32, matRoad, 0, 0.22, 0),
        box(25, 0.06, 1.2, matRoad, -2, 0.23, 9.8)
    ];
    roads.forEach((road) => world.add(road));

    const roadLineMaterial = new THREE.MeshBasicMaterial({ color: palette[state.theme].line });
    roadLineMaterial.userData.paletteSlot = "line";
    dynamicMaterials.push(roadLineMaterial);
    for (let x = -15; x <= 15; x += 2.4) {
        world.add(box(1.15, 0.02, 0.07, roadLineMaterial, x, 0.27, 0));
    }
    for (let z = -15; z <= 15; z += 2.4) {
        world.add(box(0.07, 0.02, 1.15, roadLineMaterial, 0, 0.28, z));
    }

    /* Street layer: crosswalks, lamps, benches and small inhabitants. */
    for (let index = -3; index <= 3; index++) {
        paperLayer.add(box(0.22, 0.025, 1.35, matGroundTop, index * 0.48, 0.3, -1.9));
        paperLayer.add(box(1.35, 0.025, 0.22, matGroundTop, 1.9, 0.3, index * 0.48));
    }

    function addStreetLight(x, z, rotation = 0) {
        const group = new THREE.Group();
        group.position.set(x, 0.28, z);
        group.rotation.y = rotation;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 2.2, 12), matRoof);
        pole.position.y = 1.1;
        const arm = box(0.62, 0.07, 0.07, matRoof, 0.25, 2.16, 0);
        const lamp = box(0.24, 0.14, 0.18, matWindow, 0.54, 2.08, 0);
        lamp.castShadow = false;
        group.add(pole, arm, lamp);
        paperLayer.add(group);
    }

    [
        [-4.3, -1.55, 0], [4.3, -1.55, Math.PI],
        [-4.3, 1.55, 0], [4.3, 1.55, Math.PI],
        [-1.55, -5.6, Math.PI / 2], [1.55, -5.6, -Math.PI / 2],
        [-1.55, 5.6, Math.PI / 2], [1.55, 5.6, -Math.PI / 2],
        [-10.5, 8.8, 0], [7.5, 8.8, Math.PI]
    ].forEach(([x, z, rotation]) => addStreetLight(x, z, rotation));

    function addBench(x, z, rotation = 0) {
        const group = new THREE.Group();
        group.position.set(x, 0.3, z);
        group.rotation.y = rotation;
        detailBox(group, 1.35, 0.12, 0.42, matRoof, 0, 0.55, 0);
        detailBox(group, 1.35, 0.5, 0.1, matAccentSoft, 0, 0.85, -0.18);
        detailBox(group, 0.1, 0.5, 0.1, matRoof, -0.5, 0.25, 0, false);
        detailBox(group, 0.1, 0.5, 0.1, matRoof, 0.5, 0.25, 0, false);
        paperLayer.add(group);
    }
    addBench(6.7, 3.5, -0.35);
    addBench(-5.4, 7.2, 0.45);
    addBench(-6.5, -8.2, -0.6);

    const citizenColors = [matAccent, matCool, matAccentSoft, matRoof];
    const citizens = [];
    [
        [-3.2, -0.8], [2.6, 0.9], [0.9, 4.2], [-7.2, 1.1],
        [7.4, -1], [-1.1, -10.4], [10.3, 7.7], [-7.6, 9.2]
    ].forEach(([x, z], index) => {
        const person = new THREE.Group();
        person.position.set(x, 0.3, z);
        const body = box(0.2, 0.58, 0.18, citizenColors[index % citizenColors.length], 0, 0.45, 0);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), matGroundTop);
        head.position.y = 0.84;
        person.add(body, head);
        person.userData.walkPhase = index * 0.7;
        citizens.push(person);
        paperLayer.add(person);
    });

    const plaza = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.1, 32), matRoof);
    plaza.position.set(8.5, 0.29, 9.5);
    plaza.receiveShadow = true;
    paperLayer.add(plaza);
    const sculpture = new THREE.Mesh(new THREE.TorusKnotGeometry(0.55, 0.13, 48, 6, 2, 3), matAccent);
    sculpture.position.set(8.5, 1.05, 9.5);
    sculpture.scale.set(1, 1.4, 1);
    sculpture.castShadow = renderer.shadowMap.enabled;
    paperLayer.add(sculpture);

    const interactiveMeshes = [];
    const districtGroups = [];
    const interactionMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false
    });
    interactionMaterial.colorWrite = false;

    function addWindows(group, district, width, height, depth) {
        const rows = Math.max(2, Math.floor(height / 1.5));
        const columns = Math.max(2, Math.floor(width / 1.15));
        const windowGeometry = new THREE.BoxGeometry(0.34, 0.32, 0.045);
        const frontWindows = [];
        const addWindow = (x, y, z, rotationY = 0) => {
            const windowMesh = new THREE.Mesh(windowGeometry, matWindow);
            windowMesh.position.set(x, y, z);
            windowMesh.rotation.y = rotationY;
            windowMesh.userData.baseScale = 1;
            windowMesh.userData.decorative = true;
            frontWindows.push(windowMesh);
            group.add(windowMesh);
        };
        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                if ((row + column + district.number.charCodeAt(1)) % 3 === 0) continue;
                const x = -width / 2 + 0.65 + column * ((width - 1.3) / Math.max(1, columns - 1));
                const y = 0.8 + row * ((height - 1.5) / Math.max(1, rows - 1));
                addWindow(x, y, depth / 2 + 0.026);
                if ((row + column) % 2 === 0) addWindow(x, y, -depth / 2 - 0.026);
            }
        }
        const sideRows = Math.max(2, Math.floor(height / 1.8));
        const sideColumns = Math.max(1, Math.floor(depth / 1.5));
        for (let row = 0; row < sideRows; row++) {
            for (let column = 0; column < sideColumns; column++) {
                const z = -depth / 2 + 0.72 + column * ((depth - 1.44) / Math.max(1, sideColumns - 1));
                const y = 0.9 + row * ((height - 1.8) / Math.max(1, sideRows - 1));
                addWindow(width / 2 + 0.026, y, z, Math.PI / 2);
                if ((row + column) % 2 === 1) addWindow(-width / 2 - 0.026, y, z, Math.PI / 2);
            }
        }
        group.userData.windows = frontWindows;
    }

    function addAntenna(group, height) {
        const mast = box(0.16, 3.2, 0.16, matAccent, 0, height + 1.6, 0);
        const signal1 = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.055, 5, 24, Math.PI), matAccent);
        signal1.rotation.x = Math.PI / 2;
        signal1.position.y = height + 2.2;
        const signal2 = signal1.clone();
        signal2.scale.setScalar(1.55);
        signal2.position.y = height + 2.3;
        group.add(mast, signal1, signal2);
        group.userData.signalRings = [signal1, signal2];
    }

    function buildDistrict(district) {
        const group = new THREE.Group();
        group.position.set(district.x, 0.24, district.z);
        group.userData.district = district;
        group.userData.baseY = 0.24;
        group.userData.hover = 0;

        const platformProfiles = {
            tower: [3.2, 2.2, 0.75],
            lab: [2.4, 2.1, -0.8],
            workshop: [1.3, 2.2, 0],
            library: [1.4, 2.5, 0],
            apartment: [1.6, 2.2, 0.35],
            archive: [1.2, 2.2, 0],
            radio: [2.6, 2.1, 0.9],
            photo: [1.5, 2.2, 0.4]
        };
        const [platformWidth, platformDepth, platformX] = platformProfiles[district.style] || [0.7, 0.7, 0];
        const podium = box(
            district.width + platformWidth,
            0.55,
            district.depth + platformDepth,
            matRoof,
            platformX,
            0.275,
            0.55
        );
        addOutline(podium);
        group.add(podium);

        let main;
        if (district.style === "tower") {
            main = box(district.width, 6.2, district.depth, matBuilding, 0, 3.65, 0);
            group.add(main);
            detailBox(group, 3.45, 2.8, 3.45, matBuildingAlt, 0, 8.15, 0);
            detailBox(group, 2.55, 1.8, 2.55, matBuilding, 0, 10.45, 0);
            detailBox(group, district.width + 0.55, 0.32, district.depth + 0.55, matAccent, 0, 6.85, 0);
            detailBox(group, 3.85, 0.26, 3.85, matAccentSoft, 0, 9.58, 0);
            const crown = detailBox(group, 2.9, 0.4, 2.9, matAccent, 0, 11.55, 0);
            crown.rotation.y = Math.PI / 4;
            const core = detailBox(group, 0.46, 5.4, district.depth + 0.14, matAccentSoft, 0, 3.7, 0, false);
            core.castShadow = false;
            detailBox(group, 2.35, 2.2, 2.5, matBuildingAlt, district.width / 2 + 1.3, 1.37, -0.5);
            for (let rack = 0; rack < 3; rack++) {
                const rackX = district.width / 2 + 0.65 + rack * 0.62;
                detailBox(group, 0.48, 1.48, 1.55, matRoof, rackX, 1.42, 0.02);
                for (let led = 0; led < 4; led++) {
                    detailBox(group, 0.055, 0.045, 0.03, led % 2 ? matCool : matAccent, rackX - 0.13, 1.05 + led * 0.26, 0.81, false);
                }
            }
            detailBox(group, 1.75, 0.12, 0.55, matCool, district.width / 2 + 1.25, 0.72, 1.18);
            addMiniPerson(group, district.width / 2 + 0.9, 1.42, { rotation: Math.PI, material: matAccent });
            addMiniPerson(group, district.width / 2 + 1.62, 1.38, { rotation: Math.PI, material: matCool });
            addRoofUnits(group, 2.38, 2, 0.8, matRoof, district.width / 2 + 1.25, -0.5);
            for (let packet = 0; packet < 4; packet++) {
                const node = detailBox(group, 0.14, 0.14, 0.14, matCool, -1.45 + packet * 0.92, 7.2 + packet * 0.28, district.depth / 2 + 0.28, false);
                node.userData.dataPacket = true;
            }
            addAntenna(group, district.height + 0.8);
        } else if (district.style === "lab") {
            main = box(district.width, district.height, district.depth, matBuildingAlt, 0, district.height / 2 + 0.55, 0);
            group.add(main);
            const dome = new THREE.Mesh(
                new THREE.SphereGeometry(1.35, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
                matCool
            );
            dome.position.set(1.2, district.height + 0.55, 0);
            addOutline(dome);
            group.add(dome);
            detailBox(group, 2.1, 2.2, district.depth + 0.4, matRoof, -district.width / 2 - 0.8, 1.65, 0);
            detailBox(group, 1.55, 0.42, 1.55, matCool, 1.2, district.height + 0.34, 0);
            addSolarArray(group, district.height + 0.72, -1.25);
            detailBox(group, 3.2, 0.22, 0.7, matAccentSoft, -1, district.height + 0.72, 1.15);
            detailBox(group, 3.8, 0.12, 0.82, matGroundTop, 0.15, 0.88, district.depth / 2 + 0.72);
            for (let station = -1; station <= 1; station++) {
                const vial = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.48, 16), station === 0 ? matAccent : matCool);
                vial.position.set(station * 0.9, 1.18, district.depth / 2 + 0.72);
                vial.userData.decorative = true;
                group.add(vial);
            }
            addMiniPerson(group, -1.25, district.depth / 2 + 1.15, { rotation: Math.PI, material: matGroundTop });
            addMiniPerson(group, 1.15, district.depth / 2 + 1.08, { rotation: Math.PI, material: matCool });
            const molecule = new THREE.Group();
            molecule.position.set(district.width / 2 + 0.55, 2.05, district.depth / 2 + 0.4);
            [[0, 0, 0], [0.42, 0.34, 0], [-0.38, 0.4, 0.1], [0.15, 0.76, -0.1]].forEach(([x, y, z], index) => {
                const atom = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), index === 0 ? matAccent : matCool);
                atom.position.set(x, y, z);
                atom.userData.decorative = true;
                molecule.add(atom);
            });
            molecule.userData.decorative = true;
            group.add(molecule);
        } else if (district.style === "workshop") {
            main = box(district.width, district.height, district.depth, matBuildingAlt, 0, district.height / 2 + 0.55, 0);
            group.add(main);
            for (let i = -2; i <= 2; i++) {
                const tooth = box(0.92, 0.72 + (i + 2) * 0.16, district.depth, i * 1.02, district.height + 0.45, 0);
                tooth.material = matRoof;
                addOutline(tooth);
                group.add(tooth);
            }
            for (let index = -1; index <= 1; index++) {
                const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 1.8 + index * 0.25, 16), matAccentSoft);
                chimney.position.set(index * 1.35, district.height + 1.3, -1.1);
                addOutline(chimney);
                group.add(chimney);
            }
            detailBox(group, 0.22, 5.5, 0.22, matAccent, district.width / 2 + 1, 2.75, 0);
            detailBox(group, 3.4, 0.2, 0.2, matAccent, district.width / 2 - 0.6, 5.35, 0);
            const craneCable = detailBox(group, 0.08, 2.25, 0.08, matCool, district.width / 2 - 1.7, 4.2, 0, false);
            const cargo = detailBox(group, 1.05, 0.68, 0.92, matAccentSoft, district.width / 2 - 1.7, 2.85, 0);
            craneCable.userData.craneCable = true;
            cargo.userData.craneCargo = true;
            detailBox(group, 3.8, 0.13, 0.85, matAccent, -0.35, 0.84, district.depth / 2 + 0.72);
            for (let part = 0; part < 4; part++) {
                const component = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.26, 16), matRoof);
                component.position.set(-1.55 + part * 0.62, 1.03, district.depth / 2 + 0.72);
                component.userData.decorative = true;
                group.add(component);
            }
            addMiniPerson(group, -1.7, district.depth / 2 + 1.12, { rotation: Math.PI, material: matAccentSoft });
            addMiniPerson(group, 1.45, district.depth / 2 + 1.02, { rotation: Math.PI, material: matAccent });
        } else if (district.style === "library") {
            main = box(district.width, district.height, district.depth, matBuilding, 0, district.height / 2 + 0.55, 0);
            group.add(main);
            for (let bay = -2; bay <= 2; bay++) {
                detailBox(group, 0.22, district.height - 0.9, 0.28, matAccentSoft, bay * 0.86, district.height / 2 + 0.3, district.depth / 2 + 0.2, false);
                for (let shelf = 0; shelf < 4; shelf++) {
                    detailBox(group, 0.72, 0.07, 0.34, matRoof, bay * 0.86, 1.25 + shelf * 1.16, district.depth / 2 + 0.27, false);
                    addBookSpines(group, bay * 0.86, 1.48 + shelf * 1.16, district.depth / 2 + 0.48, 5, 0.72);
                }
            }
            detailBox(group, district.width + 1.3, 0.35, 1.3, matRoof, 0, 0.35, district.depth / 2 + 0.6);
            detailBox(group, district.width + 0.7, 0.3, 0.75, matAccent, 0, district.height + 0.68, 0);
            const leftPage = detailBox(group, district.width * 0.52, 0.18, 2.2, matGroundTop, -district.width * 0.25, district.height + 1.05, -0.25);
            const rightPage = detailBox(group, district.width * 0.52, 0.18, 2.2, matGroundTop, district.width * 0.25, district.height + 1.05, -0.25);
            leftPage.rotation.z = -0.13;
            rightPage.rotation.z = 0.13;
            for (let table = -1; table <= 1; table++) {
                detailBox(group, 1.05, 0.1, 0.52, matGroundTop, table * 1.45, 0.84, district.depth / 2 + 1.08);
                addMiniPerson(group, table * 1.45, district.depth / 2 + 1.28, {
                    seated: true,
                    rotation: Math.PI,
                    material: table === 0 ? matAccent : matCool
                });
                const openBook = detailBox(group, 0.38, 0.035, 0.28, matGroundTop, table * 1.45, 0.96, district.depth / 2 + 1.02, false);
                openBook.rotation.y = table * 0.08;
            }
            addPlanter(group, district.width / 2 + 0.72, 0.78, district.depth / 2 + 0.85, 0.82);
        } else if (district.style === "radio") {
            main = box(district.width, district.height, district.depth, matBuildingAlt, 0, district.height / 2 + 0.55, 0);
            group.add(main);
            addAntenna(group, district.height + 0.55);
            const dish = new THREE.Mesh(
                new THREE.SphereGeometry(1.15, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3),
                matCool
            );
            dish.scale.y = 0.28;
            dish.rotation.z = -0.6;
            dish.position.set(-1, district.height + 1.05, 0.3);
            addOutline(dish);
            group.add(dish);
            addRoofUnits(group, district.height + 0.6, 2, 0.75, matAccentSoft);
            detailBox(group, 2.65, 1.9, 2.15, matBuilding, district.width / 2 + 1.25, 1.5, -0.15);
            detailBox(group, 2.2, 1.08, 0.1, matCool, district.width / 2 + 1.25, 1.64, 0.98);
            detailBox(group, 1.75, 0.11, 0.52, matAccent, district.width / 2 + 1.25, 0.8, 1.36);
            addMiniPerson(group, district.width / 2 + 1.05, 1.42, { seated: true, rotation: Math.PI, material: matAccentSoft });
            const record = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.07, 32), matRoof);
            record.rotation.x = Math.PI / 2;
            record.position.set(-district.width / 2 - 0.62, 0.82, district.depth / 2 + 0.6);
            record.userData.decorative = true;
            group.add(record);
            const recordCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 20), matAccent);
            recordCenter.rotation.x = Math.PI / 2;
            recordCenter.position.set(-district.width / 2 - 0.62, 0.82, district.depth / 2 + 0.65);
            recordCenter.userData.decorative = true;
            group.add(recordCenter);
        } else if (district.style === "photo") {
            main = box(district.width, district.height, district.depth, matBuilding, 0, district.height / 2 + 0.55, 0);
            group.add(main);
            const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.35, 32), matCool);
            lens.rotation.x = Math.PI / 2;
            lens.position.set(0, district.height / 2 + 0.6, district.depth / 2 + 0.25);
            addOutline(lens);
            group.add(lens);
            detailBox(group, district.width + 0.5, 0.46, 0.5, matAccent, 0, district.height + 0.65, district.depth / 2 + 0.1);
            const skylight = detailBox(group, 2.1, 0.15, 1.4, matCool, 0.7, district.height + 0.72, -0.45);
            skylight.rotation.z = 0.12;
            for (let frame = -2; frame <= 2; frame++) {
                detailBox(group, 0.64, 0.52, 0.055, matGroundTop, frame * 0.76, 1.12 + Math.abs(frame % 2) * 0.18, district.depth / 2 + 0.48);
                detailBox(group, 0.46, 0.34, 0.06, frame % 2 ? matCool : matAccentSoft, frame * 0.76, 1.12 + Math.abs(frame % 2) * 0.18, district.depth / 2 + 0.52, false);
            }
            detailBox(group, 3.2, 0.05, 0.05, matRoof, 0, 3.24, district.depth / 2 + 0.72, false);
            for (let print = -2; print <= 2; print++) {
                const photo = detailBox(group, 0.42, 0.55, 0.03, matGroundTop, print * 0.58, 2.86 + Math.abs(print % 2) * 0.12, district.depth / 2 + 0.72, false);
                photo.rotation.z = print * 0.025;
            }
            addMiniPerson(group, -district.width / 2 - 0.45, district.depth / 2 + 0.72, { rotation: Math.PI, material: matAccentSoft });
            const tripod = new THREE.Group();
            tripod.position.set(district.width / 2 + 0.65, 0.62, district.depth / 2 + 0.55);
            [-0.22, 0, 0.22].forEach((offset) => {
                const leg = box(0.045, 1.0, 0.045, matRoof, offset, 0.45, 0);
                leg.rotation.z = offset;
                leg.userData.decorative = true;
                tripod.add(leg);
            });
            const cameraBody = box(0.46, 0.34, 0.34, matBuildingAlt, 0, 1.0, 0);
            cameraBody.userData.decorative = true;
            tripod.add(cameraBody);
            tripod.userData.decorative = true;
            group.add(tripod);
        } else if (district.style === "archive") {
            main = box(district.width, district.height, district.depth, matBuildingAlt, 0, district.height / 2 + 0.55, 0);
            group.add(main);
            for (let index = -3; index <= 3; index++) {
                detailBox(group, 0.16, district.height + 0.25, district.depth + 0.25, matRoof, index * 0.72, district.height / 2 + 0.55, 0, false);
            }
            const vault = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.16, 8, 24), matAccent);
            vault.position.set(0, 1.8, district.depth / 2 + 0.2);
            group.add(vault);
            const vaultDoor = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.16, 32), matRoof);
            vaultDoor.rotation.x = Math.PI / 2;
            vaultDoor.position.set(0, 1.8, district.depth / 2 + 0.28);
            group.add(vaultDoor);
            for (let spoke = 0; spoke < 6; spoke++) {
                const bar = detailBox(group, 0.92, 0.06, 0.06, matAccent, 0, 1.8, district.depth / 2 + 0.39, false);
                bar.rotation.z = spoke * Math.PI / 3;
            }
            for (let side = -1; side <= 1; side += 2) {
                for (let shelf = 0; shelf < 3; shelf++) {
                    detailBox(group, 1.3, 0.09, 0.38, matRoof, side * 1.72, 0.98 + shelf * 0.7, district.depth / 2 + 0.62, false);
                    for (let file = 0; file < 5; file++) {
                        detailBox(group, 0.17, 0.4, 0.26, file % 2 ? matGroundTop : matAccentSoft, side * 1.72 - 0.47 + file * 0.23, 1.2 + shelf * 0.7, district.depth / 2 + 0.62, false);
                    }
                }
            }
            addMiniPerson(group, 1.75, district.depth / 2 + 0.98, { rotation: Math.PI, material: matGroundTop });
            addMiniPerson(group, -1.75, district.depth / 2 + 1.02, { seated: true, rotation: Math.PI, material: matCool });
            addRoofUnits(group, district.height + 0.55, 3, 0.72, matAccentSoft);
        } else if (district.style === "apartment") {
            main = box(district.width, district.height, district.depth, matBuilding, 0, district.height / 2 + 0.55, 0);
            group.add(main);
            addBalconies(group, district.width, district.height, district.depth, 4);
            detailBox(group, district.width + 0.35, 0.34, district.depth + 0.35, matAccentSoft, 0, district.height + 0.72, 0);
            detailBox(group, 1.5, 0.6, 1.1, matRoof, -0.75, district.height + 1.18, 0);
            for (let index = 0; index < 3; index++) {
                addPlanter(group, -1 + index, district.height + 1.02, 1.2, 0.9);
            }
            detailBox(group, 1.7, 0.11, 0.62, matGroundTop, district.width / 2 + 0.9, 0.82, district.depth / 2 + 0.72);
            addMiniPerson(group, district.width / 2 + 0.78, district.depth / 2 + 0.94, { seated: true, rotation: Math.PI, material: matAccentSoft });
            addPlanter(group, -district.width / 2 - 0.55, 0.76, district.depth / 2 + 0.72, 0.78);
        } else {
            main = box(district.width, district.height, district.depth, matBuilding, 0, district.height / 2 + 0.55, 0);
            group.add(main);
            detailBox(group, district.width + 0.4, 0.4, district.depth + 0.4, matAccentSoft, 0, district.height + 0.75, 0);
        }

        addOutline(main);
        addWindows(group, district, district.width, district.height, district.depth);
        addSignboard(group, district, district.style === "tower" ? 3.45 : 3.05);

        const interactionPadding = state.compact ? 2.4 : 1.1;
        const interactionHeight = district.height + (state.compact ? 4 : 2.2);
        const interactionTarget = new THREE.Mesh(
            new THREE.BoxGeometry(
                district.width + interactionPadding,
                interactionHeight,
                district.depth + interactionPadding
            ),
            interactionMaterial
        );
        interactionTarget.position.y = interactionHeight / 2 + 0.1;
        interactionTarget.userData.hitTarget = true;
        group.add(interactionTarget);

        group.traverse((object) => {
            if (!object.isMesh || object.userData.decorative) return;
            object.userData.district = district;
            object.userData.districtGroup = group;
            interactiveMeshes.push(object);
        });
        districtGroups.push(group);
        world.add(group);
        return group;
    }

    districts.forEach(buildDistrict);

    const fillerGeometry = new THREE.BoxGeometry(1, 1, 1);
    const filler = [];
    const reserved = districts.map((district) => ({ x: district.x, z: district.z, radius: Math.max(district.width, district.depth) * 0.75 + 1.2 }));
    const random = (() => {
        let seed = 1741;
        return () => {
            seed = (seed * 16807) % 2147483647;
            return (seed - 1) / 2147483646;
        };
    })();
    const fillerBudget = state.compact ? 24 : 46;
    for (let i = 0; i < fillerBudget; i++) {
        const x = -15 + random() * 30;
        const z = -15 + random() * 30;
        if (Math.abs(x) < 1.8 || Math.abs(z) < 1.8 || Math.abs(z - 9.8) < 1.4) continue;
        if (reserved.some((item) => Math.hypot(x - item.x, z - item.z) < item.radius)) continue;
        const width = 0.8 + random() * 1.2;
        const depth = 0.8 + random() * 1.2;
        const height = 0.8 + random() * 3.6;
        filler.push({ x, z, width, depth, height });
    }
    const fillerMesh = new THREE.InstancedMesh(fillerGeometry, matBuildingAlt, filler.length);
    const matrix = new THREE.Matrix4();
    filler.forEach((building, index) => {
        matrix.compose(
            new THREE.Vector3(building.x, building.height / 2 + 0.22, building.z),
            new THREE.Quaternion(),
            new THREE.Vector3(building.width, building.height, building.depth)
        );
        fillerMesh.setMatrixAt(index, matrix);
    });
    fillerMesh.castShadow = renderer.shadowMap.enabled;
    fillerMesh.receiveShadow = true;
    world.add(fillerMesh);

    const treeTrunkMaterial = makeMaterial("line");
    const treeTopMaterial = matPlant;
    const treePositions = [
        [-6, 2.7], [-5, 4.1], [6.8, 2.7], [7.8, -1.7], [-12.5, -8.5],
        [11.5, -8.4], [12.7, 8.5], [-6.5, 11.4], [2.6, 11.5], [-13.8, 2.2]
    ];
    treePositions.forEach(([x, z], index) => {
        const trunk = box(0.16, 0.8, 0.16, treeTrunkMaterial, x, 0.6, z);
        const top = new THREE.Mesh(new THREE.ConeGeometry(0.62 + (index % 3) * 0.08, 1.5, 12), treeTopMaterial);
        top.position.set(x, 1.65, z);
        top.castShadow = renderer.shadowMap.enabled;
        paperLayer.add(trunk, top);
    });

    const pipeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-8.5, 0.55, -3.5),
        new THREE.Vector3(-5.8, 0.65, -1.5),
        new THREE.Vector3(-2, 0.58, 0),
        new THREE.Vector3(2.5, 0.62, 0),
        new THREE.Vector3(5.2, 0.6, -5.4)
    ]);
    const pipe = new THREE.Mesh(new THREE.TubeGeometry(pipeCurve, 64, 0.07, 6, false), matAccentSoft);
    cyberLayer.add(pipe);
    const dataPackets = Array.from({ length: 5 }, (_, index) => {
        const packet = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.23, 0.23), matAccent);
        packet.userData.offset = index / 5;
        cyberLayer.add(packet);
        return packet;
    });

    const carMaterial = makeMaterial("accent");
    const car = box(0.75, 0.34, 0.42, carMaterial, -15, 0.53, 0);
    paperLayer.add(car);

    const neonCyan = new THREE.MeshBasicMaterial({ color: 0x21e6ff });
    const neonMagenta = new THREE.MeshBasicMaterial({ color: 0xff3fa4 });
    const neonYellow = new THREE.MeshBasicMaterial({ color: 0xffef5a });
    const neonOrange = new THREE.MeshBasicMaterial({ color: 0xff7b32 });
    const cyberGlass = new THREE.MeshBasicMaterial({
        color: 0x21e6ff,
        transparent: true,
        opacity: 0.24,
        depthWrite: false,
        side: THREE.DoubleSide
    });
    const cyberNeonMaterials = [neonCyan, neonMagenta, neonYellow];

    for (let x = -15; x <= 15; x += 1.8) {
        cyberLayer.add(box(1.1, 0.035, 0.06, x % 3.6 === 0 ? neonMagenta : neonCyan, x, 0.34, -1.02));
        cyberLayer.add(box(1.1, 0.035, 0.06, x % 3.6 === 0 ? neonCyan : neonYellow, x, 0.34, 1.02));
    }
    for (let z = -15; z <= 15; z += 1.8) {
        cyberLayer.add(box(0.06, 0.035, 1.1, z % 3.6 === 0 ? neonMagenta : neonCyan, -1.02, 0.35, z));
        cyberLayer.add(box(0.06, 0.035, 1.1, z % 3.6 === 0 ? neonCyan : neonYellow, 1.02, 0.35, z));
    }

    const airLaneCurves = [
        new THREE.CatmullRomCurve3([
            new THREE.Vector3(-16, 7.2, -9),
            new THREE.Vector3(-6, 8.3, -4),
            new THREE.Vector3(4, 7.4, 2),
            new THREE.Vector3(16, 9.1, 8)
        ]),
        new THREE.CatmullRomCurve3([
            new THREE.Vector3(14, 5.8, -13),
            new THREE.Vector3(6, 7.1, -4),
            new THREE.Vector3(-3, 6.5, 4),
            new THREE.Vector3(-15, 8.2, 12)
        ])
    ];
    airLaneCurves.forEach((curve, index) => {
        const laneMaterial = (index === 0 ? neonCyan : neonMagenta).clone();
        laneMaterial.transparent = true;
        laneMaterial.opacity = 0.52;
        const lane = new THREE.Mesh(
            new THREE.TubeGeometry(curve, 72, 0.025, 5, false),
            laneMaterial
        );
        cyberLayer.add(lane);
    });

    function createFlyer(index) {
        const flyer = new THREE.Group();
        const bodyMaterial = cyberNeonMaterials[index % cyberNeonMaterials.length];
        flyer.add(box(1.05, 0.24, 0.42, matBuildingAlt, 0, 0, 0));
        flyer.add(box(0.52, 0.18, 0.32, cyberGlass, 0.08, 0.18, 0));
        flyer.add(box(0.32, 0.055, 1.28, bodyMaterial, -0.08, 0.02, 0));
        flyer.add(box(0.2, 0.12, 0.1, neonYellow, -0.52, 0.02, -0.14));
        flyer.add(box(0.2, 0.12, 0.1, neonYellow, -0.52, 0.02, 0.14));
        const trailMaterial = bodyMaterial.clone();
        trailMaterial.transparent = true;
        trailMaterial.opacity = 0.64;
        const trail = box(1.6, 0.035, 0.035, trailMaterial, -1.28, 0, 0);
        flyer.add(trail);
        flyer.userData.offset = index / 7;
        flyer.userData.lane = index % airLaneCurves.length;
        flyer.userData.speed = 0.035 + (index % 3) * 0.008;
        cyberLayer.add(flyer);
        return flyer;
    }
    const flyingVehicles = Array.from({ length: state.compact ? 4 : 7 }, (_, index) => createFlyer(index));

    function createDrone(index) {
        const drone = new THREE.Group();
        const color = cyberNeonMaterials[(index + 1) % cyberNeonMaterials.length];
        drone.add(box(0.5, 0.16, 0.5, matRoof, 0, 0, 0));
        [-1, 1].forEach((x) => {
            [-1, 1].forEach((z) => {
                drone.add(box(0.42, 0.035, 0.055, color, x * 0.3, 0, z * 0.3));
                const rotor = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 5, 12), color);
                rotor.rotation.x = Math.PI / 2;
                rotor.position.set(x * 0.5, 0.02, z * 0.5);
                drone.add(rotor);
            });
        });
        drone.userData.radius = 6 + index * 1.8;
        drone.userData.speed = 0.22 + index * 0.035;
        drone.userData.phase = index * 1.4;
        cyberLayer.add(drone);
        return drone;
    }
    const cyberDrones = Array.from({ length: state.compact ? 2 : 4 }, (_, index) => createDrone(index));

    const holograms = [];
    [
        [-5.6, 3.2, 2.4], [6.2, 3.8, -1.8], [10.7, 2.9, 8.2], [-10.8, 3.5, -8.5]
    ].forEach(([x, height, z], index) => {
        const hologram = new THREE.Group();
        hologram.position.set(x, 0.32, z);
        const column = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, height, 16, 1, true), cyberGlass);
        column.position.y = height / 2;
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.035, 5, 20), cyberNeonMaterials[index % 3]);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = height * 0.72;
        hologram.add(column, ring);
        hologram.userData.phase = index;
        cyberLayer.add(hologram);
        holograms.push(hologram);
    });

    function createMicroBurst(origin, phase) {
        const burst = new THREE.Group();
        burst.position.copy(origin);
        const material = new THREE.MeshBasicMaterial({
            color: phase % 2 ? 0xff3fa4 : 0xff9b35,
            transparent: true,
            opacity: 1,
            depthWrite: false
        });
        const particles = [];
        for (let index = 0; index < 12; index++) {
            const particle = new THREE.Mesh(new THREE.TetrahedronGeometry(0.1 + (index % 3) * 0.035), material);
            const angle = index / 12 * Math.PI * 2;
            particle.userData.direction = new THREE.Vector3(
                Math.cos(angle) * (0.8 + (index % 4) * 0.12),
                0.4 + (index % 5) * 0.22,
                Math.sin(angle) * (0.8 + ((index + 2) % 4) * 0.12)
            );
            burst.add(particle);
            particles.push(particle);
        }
        const flash = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 1), phase % 2 ? neonOrange : neonYellow);
        burst.add(flash);
        cyberLayer.add(burst);
        return { burst, particles, flash, material, phase };
    }
    const burstOrigins = [
        new THREE.Vector3(6.6, 6.4, -5.2),
        new THREE.Vector3(-7.4, 8.1, -3.2),
        new THREE.Vector3(-0.8, 5.4, 0.8)
    ];
    const microBursts = burstOrigins
        .slice(0, state.compact ? 2 : 3)
        .map((origin, index) => createMicroBurst(origin, index));

    const cyanGlow = new THREE.PointLight(0x21e6ff, 3.2, 30);
    cyanGlow.position.set(-8, 9, -5);
    const magentaGlow = new THREE.PointLight(0xff3fa4, 2.6, 28);
    magentaGlow.position.set(8, 7, 5);
    cyberLayer.add(cyanGlow, magentaGlow);

    const focusTextureCanvas = document.createElement("canvas");
    focusTextureCanvas.width = 256;
    focusTextureCanvas.height = 256;
    const focusContext = focusTextureCanvas.getContext("2d");
    const focusGradient = focusContext.createRadialGradient(128, 128, 8, 128, 128, 128);
    focusGradient.addColorStop(0, "rgba(246, 221, 71, 0.7)");
    focusGradient.addColorStop(0.28, "rgba(104, 216, 232, 0.28)");
    focusGradient.addColorStop(0.68, "rgba(104, 216, 232, 0.08)");
    focusGradient.addColorStop(1, "rgba(104, 216, 232, 0)");
    focusContext.fillStyle = focusGradient;
    focusContext.fillRect(0, 0, 256, 256);
    const focusTexture = new THREE.CanvasTexture(focusTextureCanvas);
    focusTexture.colorSpace = THREE.SRGBColorSpace;
    const focusAuraMaterial = new THREE.SpriteMaterial({
        map: focusTexture,
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const focusAura = new THREE.Sprite(focusAuraMaterial);
    focusAura.scale.set(0.1, 0.1, 1);
    focusAura.renderOrder = 900;

    const focusTarget = new THREE.Object3D();
    const focusSpot = new THREE.SpotLight(0xf6e88a, 0, 38, 0.46, 0.94, 1.25);
    focusSpot.position.set(0, 18, 0);
    focusSpot.target = focusTarget;
    focusSpot.castShadow = false;
    const focusFill = new THREE.PointLight(0x68d8e8, 0, 14, 1.65);
    cyberLayer.add(focusSpot, focusTarget, focusFill, focusAura);

    function createCyberCitizen(index) {
        const person = new THREE.Group();
        const neon = cyberNeonMaterials[index % cyberNeonMaterials.length];
        const body = box(0.22, 0.62, 0.18, matBuildingAlt, 0, 0.48, 0);
        const coat = box(0.29, 0.34, 0.21, matRoof, 0, 0.36, 0);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), matGroundTop);
        head.position.y = 0.9;
        const visor = box(0.22, 0.055, 0.04, neon, 0, 0.92, 0.12);
        const leftLeg = box(0.07, 0.28, 0.08, matBuildingAlt, -0.065, 0.14, 0);
        const rightLeg = box(0.07, 0.28, 0.08, matBuildingAlt, 0.065, 0.14, 0);
        person.add(body, coat, head, visor, leftLeg, rightLeg);
        person.userData.visor = visor;
        person.userData.axis = index % 2 ? "z" : "x";
        person.userData.lane = index % 4 < 2 ? 1.52 : -1.52;
        person.userData.offset = index / (state.compact ? 7 : 12);
        person.userData.direction = index % 3 ? 1 : -1;
        person.userData.speed = 0.021 + (index % 4) * 0.003;
        cyberLayer.add(person);
        return person;
    }
    const cyberCitizens = Array.from(
        { length: state.compact ? 7 : 12 },
        (_, index) => createCyberCitizen(index)
    );

    const paperVehicles = [car];
    const paperCarColors = [matAccent, matCool, matAccentSoft, matRoof];
    [
        ["x", -0.58, 0.02, 0], ["x", 0.58, 0.36, Math.PI],
        ["x", -0.58, 0.68, 0], ["z", -0.58, 0.16, Math.PI / 2],
        ["z", 0.58, 0.48, -Math.PI / 2], ["z", -0.58, 0.82, Math.PI / 2],
        ["x", 9.45, 0.25, 0], ["x", 10.15, 0.74, Math.PI]
    ].forEach(([axis, lane, offset, rotation], index) => {
        const vehicle = box(0.72, 0.3, 0.4, paperCarColors[index % paperCarColors.length], 0, 0.51, 0);
        vehicle.rotation.y = rotation;
        vehicle.userData.axis = axis;
        vehicle.userData.lane = lane;
        vehicle.userData.offset = offset;
        vehicle.userData.direction = index % 2 ? -1 : 1;
        vehicle.userData.speed = 0.055 + (index % 3) * 0.008;
        paperLayer.add(vehicle);
        paperVehicles.push(vehicle);
    });
    car.userData.axis = "x";
    car.userData.lane = 0.58;
    car.userData.offset = 0.9;
    car.userData.direction = 1;
    car.userData.speed = 0.06;

    const paperCommuters = citizens.slice();
    citizens.forEach((person, index) => {
        person.userData.axis = index % 2 ? "z" : "x";
        person.userData.lane = index % 2 ? (index % 4 < 2 ? 1.55 : -1.55) : (index % 4 < 2 ? 1.55 : -1.55);
        person.userData.offset = index / citizens.length;
        person.userData.direction = index % 3 ? 1 : -1;
        person.userData.speed = 0.018 + (index % 4) * 0.003;
    });
    const commuterBudget = state.compact ? 6 : 10;
    for (let index = 0; index < commuterBudget; index++) {
        const axis = index % 2 ? "z" : "x";
        const lane = index % 4 < 2 ? 1.55 : -1.55;
        const commuter = addMiniPerson(paperLayer, 0, 0, {
            material: citizenColors[index % citizenColors.length]
        });
        commuter.userData.axis = axis;
        commuter.userData.lane = lane;
        commuter.userData.offset = index / commuterBudget;
        commuter.userData.direction = index % 3 ? 1 : -1;
        commuter.userData.speed = 0.017 + (index % 3) * 0.003;
        paperCommuters.push(commuter);
    }
    const paperPlazaPeople = [
        [7.45, 8.85, false, matAccent],
        [8.05, 8.7, false, matCool],
        [9.15, 9.0, true, matAccentSoft],
        [9.8, 9.2, true, matCool],
        [8.0, 10.35, false, matRoof],
        [8.55, 10.55, false, matAccent]
    ].map(([x, z, seated, material], index) => {
        const person = addMiniPerson(paperLayer, x, z, {
            seated,
            rotation: index % 2 ? Math.PI * 0.35 : -Math.PI * 0.35,
            material
        });
        person.userData.baseY = person.position.y;
        person.userData.socialPhase = index * 0.9;
        return person;
    });

    [
        [-11.8, -11.5, 4.2, 2.2], [8.8, -10.8, 4.8, 2.1],
        [7.8, 12.1, 5.2, 1.8], [-12.2, 8.2, 3.8, 2.4]
    ].forEach(([x, z, width, depth]) => {
        paperLayer.add(box(width, 0.06, depth, matPlant, x, 0.3, z));
        for (let tree = -1; tree <= 1; tree++) {
            const trunk = box(0.1, 0.72, 0.1, treeTrunkMaterial, x + tree * width * 0.26, 0.68, z);
            const crown = new THREE.Mesh(new THREE.ConeGeometry(0.46, 1.1, 12), matPlant);
            crown.position.set(x + tree * width * 0.26, 1.55, z);
            paperLayer.add(trunk, crown);
        }
    });

    [
        [-5.2, -1.45, 0], [5.2, 1.45, Math.PI],
        [-1.45, -6.4, Math.PI / 2], [1.45, 6.4, -Math.PI / 2]
    ].forEach(([x, z, rotation]) => {
        const stop = new THREE.Group();
        stop.position.set(x, 0.3, z);
        stop.rotation.y = rotation;
        stop.add(box(1.6, 0.1, 0.5, matRoof, 0, 0.12, 0));
        stop.add(box(1.6, 0.08, 0.6, matGroundTop, 0, 1.6, 0));
        stop.add(box(0.06, 1.5, 0.06, matRoof, -0.7, 0.82, 0));
        stop.add(box(0.06, 1.5, 0.06, matRoof, 0.7, 0.82, 0));
        paperLayer.add(stop);
    });

    function createBird(index) {
        const bird = new THREE.Group();
        const leftWing = box(0.42, 0.035, 0.08, matRoof, -0.18, 0, 0);
        const rightWing = box(0.42, 0.035, 0.08, matRoof, 0.18, 0, 0);
        leftWing.rotation.z = 0.24;
        rightWing.rotation.z = -0.24;
        bird.add(leftWing, rightWing);
        bird.userData.radius = 7 + (index % 4) * 1.6;
        bird.userData.altitude = 8.5 + (index % 3) * 0.9;
        bird.userData.phase = index * 0.72;
        bird.userData.speed = 0.075 + (index % 3) * 0.008;
        paperLayer.add(bird);
        return bird;
    }
    const paperBirds = Array.from({ length: state.compact ? 7 : 11 }, (_, index) => createBird(index));

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(10, 10);
    let hoveredGroup = null;
    let pointerMoved = false;
    let dragging = false;
    let activePointerId = null;
    let dragStartX = 0;
    let dragStartY = 0;
    let rotationStart = 0;
    let lastTouchNavigation = 0;
    let targetRotation = world.rotation.y;
    let elapsed = 0;
    let focusStrength = 0;
    const focusAimPosition = new THREE.Vector3();
    const focusLightPosition = new THREE.Vector3();
    const focusAuraPosition = new THREE.Vector3();
    const focusAuraScale = new THREE.Vector3(0.1, 0.1, 1);

    function pointerPosition(event) {
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        pointerMoved = true;
    }

    function districtAtEvent(event) {
        pointerPosition(event);
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(interactiveMeshes, false)[0];
        pointerMoved = false;
        return hit?.object.userData.districtGroup || null;
    }

    function eventHitsInterface(event) {
        return Boolean(event.target.closest?.(".city-overlay-top, .city-controls-panel"));
    }

    function enterDistrict(selectedGroup, delay = 320) {
        if (!selectedGroup || viewport.classList.contains("departing")) return;
        hoveredGroup = selectedGroup;
        updateTooltip(selectedGroup);
        const district = selectedGroup.userData.district;
        viewport.dataset.selectedDistrict = district.id;
        viewport.classList.add("departing");
        setTimeout(() => {
            location.href = themedHref(district.href, { from: "city", room: district.id });
        }, delay);
    }

    viewport.addEventListener("pointerdown", (event) => {
        if (!event.isPrimary || eventHitsInterface(event)) return;
        dragging = true;
        activePointerId = event.pointerId;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
        rotationStart = targetRotation;
        pointerPosition(event);
        viewport.setPointerCapture?.(event.pointerId);
    });
    viewport.addEventListener("pointermove", (event) => {
        pointerPosition(event);
        if (dragging && event.pointerId === activePointerId) {
            const delta = event.clientX - dragStartX;
            targetRotation = rotationStart + delta * 0.006;
        }
        tooltip.style.left = `${Math.min(event.clientX, innerWidth - 300)}px`;
        tooltip.style.top = `${Math.min(event.clientY, innerHeight - 150)}px`;
    });
    viewport.addEventListener("pointerup", (event) => {
        if (event.pointerId !== activePointerId) return;
        const travel = Math.hypot(event.clientX - dragStartX, event.clientY - dragStartY);
        const isTouch = event.pointerType !== "mouse";
        dragging = false;
        activePointerId = null;
        viewport.releasePointerCapture?.(event.pointerId);
        if (isTouch && travel <= 18 && !eventHitsInterface(event)) {
            const selectedGroup = districtAtEvent(event);
            if (selectedGroup) {
                lastTouchNavigation = performance.now();
                enterDistrict(selectedGroup, 240);
            }
        }
    });
    viewport.addEventListener("pointercancel", (event) => {
        if (event.pointerId !== activePointerId) return;
        dragging = false;
        activePointerId = null;
        viewport.releasePointerCapture?.(event.pointerId);
    });
    viewport.addEventListener("pointerleave", () => {
        dragging = false;
        activePointerId = null;
        pointer.set(10, 10);
        pointerMoved = true;
        if (!state.touring) tooltip.classList.remove("visible");
    });
    viewport.addEventListener("click", (event) => {
        if (eventHitsInterface(event) || performance.now() - lastTouchNavigation < 600) return;
        const threshold = event.pointerType && event.pointerType !== "mouse" ? 18 : 8;
        if (Math.hypot(event.clientX - dragStartX, event.clientY - dragStartY) > threshold) return;
        const selectedGroup = districtAtEvent(event);
        enterDistrict(selectedGroup);
    });

    function updateTooltip(group) {
        if (!group) {
            tooltip.classList.remove("visible");
            return;
        }
        const district = group.userData.district;
        tooltip.querySelector(".city-tooltip-num").textContent = `${district.number} · ${district.code}`;
        tooltip.querySelector("strong").textContent = state.language === "en" ? district.en : district.zh;
        tooltip.querySelector(".city-tooltip-intro").textContent =
            state.language === "en" ? district.enIntro : district.zhIntro;
        tooltip.classList.add("visible");
    }

    function focusDistrict(index) {
        const normalizedIndex = (index + districtGroups.length) % districtGroups.length;
        const group = districtGroups[normalizedIndex];
        if (!group) return;
        const district = group.userData.district;
        targetRotation = -Math.atan2(district.x, district.z) + 0.25;
        group.userData.tourPulse = performance.now();
        hoveredGroup = group;
        viewport.dataset.focusedDistrict = group.userData.district.id;
        pointer.set(10, 10);
        pointerMoved = false;
        updateTooltip(group);
        const progress = document.querySelector("[data-city-tour-progress]");
        if (progress) {
            progress.textContent = `${String(normalizedIndex + 1).padStart(2, "0")} / ${String(districtGroups.length).padStart(2, "0")}`;
        }
    }

    const tourButton = document.querySelector("[data-city-tour]");
    const tourPrev = document.querySelector("[data-city-tour-prev]");
    const tourNext = document.querySelector("[data-city-tour-next]");
    let tourIndex = 0;
    function scheduleTour() {
        clearInterval(state.tourTimer);
        state.tourTimer = null;
        if (!state.touring || state.compact) return;
        state.tourTimer = setInterval(() => {
            tourIndex = (tourIndex + 1) % districts.length;
            focusDistrict(tourIndex);
        }, 2400);
    }
    function moveTour(direction) {
        if (!state.touring) return;
        tourIndex = (tourIndex + direction + districts.length) % districts.length;
        focusDistrict(tourIndex);
        scheduleTour();
    }
    function stopTour() {
        state.touring = false;
        clearInterval(state.tourTimer);
        state.tourTimer = null;
        viewport.classList.remove("touring");
        tooltip.classList.remove("tour-mode");
        if (tourButton) {
            tourButton.querySelector("span:first-child").textContent =
                state.language === "en" ? "Start city tour" : "开始城市导览";
        }
    }
    function startTour() {
        if (state.touring) {
            stopTour();
            return;
        }
        state.touring = true;
        setHomeMode("city");
        if (tourButton) {
            tourButton.querySelector("span:first-child").textContent =
                state.language === "en" ? "Stop tour" : "停止导览";
        }
        tourIndex = 0;
        viewport.classList.add("touring");
        tooltip.classList.add("tour-mode");
        focusDistrict(tourIndex);
        scheduleTour();
    }
    tourButton?.addEventListener("click", startTour);
    tourPrev?.addEventListener("click", () => moveTour(-1));
    tourNext?.addEventListener("click", () => moveTour(1));
    window.addEventListener("site-language-change", () => {
        if (hoveredGroup) updateTooltip(hoveredGroup);
    });
    viewport.addEventListener("pointerdown", stopTour);
    window.addEventListener("home-mode-change", (event) => {
        if (event.detail.mode === "index") stopTour();
    });

    function updateTheme(theme) {
        state.theme = theme === "paper" ? "paper" : "signature";
        const colors = palette[state.theme];
        const paperMode = state.theme === "paper";
        dynamicMaterials.forEach((material) => {
            material.color.setHex(colors[material.userData.paletteSlot]);
            if (material.emissive && material.userData.emissivePaletteSlot) {
                material.emissive.setHex(colors[material.userData.emissivePaletteSlot]);
            }
        });
        roadLineMaterial.color.setHex(colors.line);
        outlineMaterial.opacity = paperMode ? 0.22 : 0.08;
        scene.fog.color.setHex(colors.fog);
        scene.fog.density = paperMode ? 0.01 : 0.018;
        ambient.intensity = paperMode ? 2.25 : 0.9;
        sun.intensity = paperMode ? 3.2 : 3;
        sun.color.setHex(paperMode ? 0xfff7e4 : 0x9fb9ff);
        fill.color.setHex(colors.cool);
        fill.intensity = paperMode ? 0.55 : 4.2;
        rim.color.setHex(paperMode ? 0x8c806f : colors.cool);
        rim.intensity = paperMode ? 0.65 : 2.2;
        matWindow.emissiveIntensity = paperMode ? 0.16 : 2.8;
        renderer.toneMappingExposure = paperMode ? 1.08 : 1.16;
        cyberLayer.visible = !paperMode;
        paperLayer.visible = paperMode;
        document.body.dataset.cityWorld = paperMode ? "paper" : "cyber";
        viewport.dataset.population = String(
            paperMode
                ? paperCommuters.length + paperPlazaPeople.length
                : cyberCitizens.length
        );
        if (paperMode) viewport.dataset.focusedDistrict = "";
        renderer.setClearColor(colors.background, 0);
        signboards.forEach(drawSign);
    }
    window.addEventListener("site-theme-change", (event) => updateTheme(event.detail.theme));
    window.addEventListener("site-language-change", () => signboards.forEach(drawSign));
    updateTheme(state.theme);

    function resize() {
        const width = viewport.clientWidth;
        const height = viewport.clientHeight;
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.position.set(
            width < 700 ? 32 : 28,
            width < 700 ? 28 : 25,
            width < 700 ? 35 : 31
        );
        camera.updateProjectionMatrix();
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(viewport);
    resize();

    const clock = new THREE.Clock();
    let running = true;
    document.addEventListener("visibilitychange", () => { running = !document.hidden; });

    function animate() {
        requestAnimationFrame(animate);
        if (!running || state.mode !== "city") return;
        const delta = Math.min(clock.getDelta(), 0.05);
        elapsed += delta;
        world.rotation.y += (targetRotation - world.rotation.y) * 0.055;

        if (state.theme === "signature") {
            dataPackets.forEach((packet) => {
                const progress = (elapsed * 0.12 + packet.userData.offset) % 1;
                packet.position.copy(pipeCurve.getPointAt(progress));
                packet.position.y += 0.08;
                packet.rotation.y += delta * 2;
            });
            flyingVehicles.forEach((flyer) => {
                const progress = (elapsed * flyer.userData.speed + flyer.userData.offset) % 1;
                const curve = airLaneCurves[flyer.userData.lane];
                flyer.position.copy(curve.getPointAt(progress));
                const tangent = curve.getTangentAt(Math.min(0.999, progress));
                flyer.rotation.y = -Math.atan2(tangent.z, tangent.x);
                flyer.position.y += Math.sin(elapsed * 2.4 + flyer.userData.offset * 10) * 0.08;
            });
            cyberDrones.forEach((drone) => {
                const angle = elapsed * drone.userData.speed + drone.userData.phase;
                drone.position.set(
                    Math.cos(angle) * drone.userData.radius,
                    6.2 + Math.sin(angle * 1.7) * 1.1,
                    Math.sin(angle) * drone.userData.radius
                );
                drone.rotation.y = -angle;
                drone.children.forEach((child, index) => {
                    if (child.geometry?.type === "TorusGeometry") child.rotation.z += delta * (7 + index);
                });
            });
            holograms.forEach((hologram) => {
                hologram.rotation.y += delta * 0.32;
                const pulse = 0.9 + Math.sin(elapsed * 2.6 + hologram.userData.phase) * 0.12;
                hologram.scale.set(pulse, 1, pulse);
            });
            microBursts.forEach((burst) => {
                const cycle = (elapsed * 0.34 + burst.phase * 0.29) % 1;
                const progress = Math.min(1, cycle / 0.72);
                const visible = cycle < 0.72;
                burst.burst.visible = visible;
                burst.material.opacity = visible ? (1 - progress) * 0.92 : 0;
                burst.particles.forEach((particle, index) => {
                    particle.position.copy(particle.userData.direction).multiplyScalar(progress * 1.65);
                    particle.position.y -= progress * progress * 0.9;
                    particle.rotation.x += delta * (3 + index * 0.2);
                    particle.scale.setScalar(Math.max(0.05, 1 - progress));
                });
                const flashScale = visible ? Math.sin(progress * Math.PI) * 1.8 : 0;
                burst.flash.scale.setScalar(flashScale);
            });
            cyanGlow.intensity = 2.7 + Math.sin(elapsed * 2.1) * 0.9;
            magentaGlow.intensity = 2.2 + Math.sin(elapsed * 1.7 + 1) * 0.8;
            cyberCitizens.forEach((person, index) => {
                const progress = (elapsed * person.userData.speed + person.userData.offset) % 1;
                const travel = person.userData.direction > 0 ? progress : 1 - progress;
                const position = -13.5 + travel * 27;
                if (person.userData.axis === "x") {
                    person.position.set(position, 0.3, person.userData.lane);
                    person.rotation.y = person.userData.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
                } else {
                    person.position.set(person.userData.lane, 0.3, position);
                    person.rotation.y = person.userData.direction > 0 ? 0 : Math.PI;
                }
                person.position.y += Math.abs(Math.sin(elapsed * 4.6 + index)) * 0.04;
                const visorPulse = 0.82 + Math.sin(elapsed * 3.4 + index * 0.7) * 0.18;
                person.userData.visor.scale.x = visorPulse;
            });
        } else {
            paperVehicles.forEach((vehicle) => {
                const progress = (elapsed * vehicle.userData.speed + vehicle.userData.offset) % 1;
                const travel = vehicle.userData.direction > 0 ? progress : 1 - progress;
                const position = -15 + travel * 30;
                if (vehicle.userData.axis === "x") {
                    vehicle.position.set(position, 0.51, vehicle.userData.lane);
                    vehicle.rotation.y = vehicle.userData.direction > 0 ? 0 : Math.PI;
                } else {
                    vehicle.position.set(vehicle.userData.lane, 0.51, position);
                    vehicle.rotation.y = vehicle.userData.direction > 0 ? -Math.PI / 2 : Math.PI / 2;
                }
            });
            paperCommuters.forEach((person, index) => {
                const progress = (elapsed * person.userData.speed + person.userData.offset) % 1;
                const travel = person.userData.direction > 0 ? progress : 1 - progress;
                const position = -13 + travel * 26;
                if (person.userData.axis === "x") {
                    person.position.x = position;
                    person.position.z = person.userData.lane;
                } else {
                    person.position.x = person.userData.lane;
                    person.position.z = position;
                }
                person.position.y = 0.3 + Math.abs(Math.sin(elapsed * 4 + index)) * 0.035;
            });
            paperPlazaPeople.forEach((person, index) => {
                person.position.y = person.userData.baseY
                    + Math.sin(elapsed * 1.2 + person.userData.socialPhase) * 0.018;
                person.rotation.y += Math.sin(elapsed * 0.7 + index) * delta * 0.025;
            });
            paperBirds.forEach((bird, index) => {
                const angle = elapsed * bird.userData.speed + bird.userData.phase;
                bird.position.set(
                    Math.cos(angle) * bird.userData.radius,
                    bird.userData.altitude + Math.sin(angle * 2) * 0.24,
                    Math.sin(angle) * bird.userData.radius
                );
                bird.rotation.y = -angle;
                const flap = Math.sin(elapsed * 5.2 + index) * 0.32;
                bird.children[0].rotation.z = 0.24 + flap;
                bird.children[1].rotation.z = -0.24 - flap;
            });
            sculpture.rotation.y += delta * 0.12;
        }

        districtGroups.forEach((group, index) => {
            const targetHover = group === hoveredGroup ? 1 : 0;
            group.userData.hover += (targetHover - group.userData.hover) * 0.12;
            group.position.y = group.userData.baseY + group.userData.hover * 0.34;
            const windows = group.userData.windows || [];
            windows.forEach((windowMesh, windowIndex) => {
                const pulse = state.theme === "paper"
                    ? 0.92 + Math.sin(elapsed * 0.45 + index * 0.2) * 0.035
                    : 0.66 + Math.sin(elapsed * 2.8 + index + windowIndex * 0.47) * 0.28;
                windowMesh.scale.setScalar(pulse + group.userData.hover * 0.25);
            });
            (group.userData.signalRings || []).forEach((ring, ringIndex) => {
                const scale = state.theme === "paper"
                    ? 0.94
                    : 0.86 + Math.sin(elapsed * 2.6 + ringIndex) * 0.12;
                ring.scale.setScalar(scale);
            });
        });

        if (pointerMoved && !dragging && !state.touring) {
            raycaster.setFromCamera(pointer, camera);
            const hit = raycaster.intersectObjects(interactiveMeshes, false)[0];
            const nextGroup = hit?.object.userData.districtGroup || null;
            if (nextGroup !== hoveredGroup) {
                hoveredGroup = nextGroup;
                viewport.dataset.focusedDistrict = hoveredGroup?.userData.district.id || "";
                updateTooltip(hoveredGroup);
                canvas.style.cursor = hoveredGroup ? "pointer" : "grab";
            }
            pointerMoved = false;
        }

        const focusedDistrict = state.theme === "signature"
            ? hoveredGroup?.userData.district
            : null;
        const focusTargetStrength = focusedDistrict ? 1 : 0;
        const focusRate = focusedDistrict ? 4.2 : 2.2;
        focusStrength += (focusTargetStrength - focusStrength) * (1 - Math.exp(-delta * focusRate));
        if (focusedDistrict) {
            const focusHeight = Math.max(3.2, focusedDistrict.height * 0.56);
            focusAimPosition.set(focusedDistrict.x, focusHeight, focusedDistrict.z);
            focusLightPosition.set(
                focusedDistrict.x + 2.8,
                focusedDistrict.height + 11,
                focusedDistrict.z + 3.6
            );
            focusAuraPosition.set(focusedDistrict.x, focusHeight, focusedDistrict.z);
            const auraWidth = Math.max(focusedDistrict.width, focusedDistrict.depth) * 2.8;
            focusAuraScale.set(auraWidth, Math.max(7, focusedDistrict.height * 1.55), 1);
            const follow = 1 - Math.exp(-delta * 5.2);
            focusTarget.position.lerp(focusAimPosition, follow);
            focusSpot.position.lerp(focusLightPosition, follow * 0.72);
            focusFill.position.lerp(focusAimPosition, follow);
            focusAura.position.lerp(focusAuraPosition, follow);
            focusAura.scale.lerp(focusAuraScale, follow * 0.74);
        }
        focusSpot.intensity = focusStrength * 1992;
        focusFill.intensity = focusStrength * 5.6;
        focusAuraMaterial.opacity = focusStrength
            * (0.3 + Math.sin(elapsed * 1.15) * 0.035);

        renderer.render(scene, camera);
    }

    animate();
    requestAnimationFrame(() => {
        renderer.render(scene, camera);
        loader?.classList.add("hidden");
    });
}

let cityBootStarted = false;
function ensureCityBooted() {
    if (cityBootStarted) return;
    cityBootStarted = true;
    bootCity();
}

if (state.mode === "city") {
    ensureCityBooted();
} else {
    window.addEventListener("home-mode-change", (event) => {
        if (event.detail.mode === "city") ensureCityBooted();
    });
}
