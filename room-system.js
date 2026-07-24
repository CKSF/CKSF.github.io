(function () {
    "use strict";

    const THREE_URLS = [
        "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js",
        "https://unpkg.com/three@0.180.0/build/three.module.js"
    ];

    const rooms = [
        {
            id: "data",
            code: "01 / DATA",
            route: "hire.html",
            zh: "数据控制室",
            en: "Data Control Room",
            zhOutline: "职业档案",
            enOutline: "Career",
            zhDescription: "这里存放 Agent 工程、数据平台、Skills / MCP 与上下文治理。继续向下，进入完整职业档案。",
            enDescription: "Agent engineering, data platforms, Skills / MCP, and context governance live here. Continue down for the full career portfolio.",
            zhStatus: "系统运行中",
            enStatus: "Systems online"
        },
        {
            id: "lab",
            code: "02 / LAB",
            route: "work.html#publications",
            zh: "研究实验室",
            en: "Research Laboratory",
            zhOutline: "论文与模型",
            enOutline: "Papers",
            zhDescription: "从临床问题、数据和指标出发，再决定模型。SeizureFormer 与 EpiDHGNN 的研究档案在楼下。",
            enDescription: "Start with the clinical problem, data, and metrics — then choose the model. SeizureFormer and EpiDHGNN are archived below.",
            zhStatus: "PSB 2026",
            enStatus: "PSB 2026"
        },
        {
            id: "workshop",
            code: "03 / BUILD",
            route: "work.html#projects",
            zh: "工程工坊",
            en: "Engineering Workshop",
            zhOutline: "项目现场",
            enOutline: "Projects",
            zhDescription: "这里不陈列概念 Demo，只保留真正做过、调过、被使用过的系统和产品。",
            enDescription: "No concept demos here — only systems and products that were built, tuned, and actually used.",
            zhStatus: "Build in public",
            enStatus: "Build in public"
        },
        {
            id: "library",
            code: "04 / WRITE",
            route: "blog.html",
            zh: "城市图书馆",
            en: "City Library",
            zhOutline: "写作空间",
            enOutline: "Writing",
            zhDescription: "技术、产品、心理学，以及尚未想完的问题。文章是思考过程，不是结论仓库。",
            enDescription: "Technology, product, psychology, and questions still in progress. Essays are a thinking process, not a warehouse of conclusions.",
            zhStatus: "持续生长",
            enStatus: "Growing"
        },
        {
            id: "apartment",
            code: "05 / NOW",
            route: "now.html",
            zh: "私人公寓",
            en: "Private Apartment",
            zhOutline: "现在",
            enOutline: "Now",
            zhDescription: "离开履历后的日常空间：当前工作、正在学习的东西，以及暂时没有答案的问题。",
            enDescription: "The space beyond the résumé: current work, what I am learning, and questions that do not have answers yet.",
            zhStatus: "2026 · 07",
            enStatus: "2026 · 07"
        },
        {
            id: "archive",
            code: "06 / READ",
            route: "reading.html",
            zh: "地下档案馆",
            en: "Underground Archive",
            zhOutline: "阅读记录",
            enOutline: "Reading",
            zhDescription: "不是为了显得读过很多。这里只保存真正改变过判断方式的书，以及当时留下的注释。",
            enDescription: "Not a shelf designed to look impressive. Only books that changed how I judge, with the notes they left behind.",
            zhStatus: "精选存档",
            enStatus: "Curated"
        },
        {
            id: "radio",
            code: "07 / AUDIO",
            route: "listening.html",
            zh: "城市电台",
            en: "City Radio",
            zhOutline: "声音频道",
            enOutline: "On Air",
            zhDescription: "写代码、开车、练鼓时的声音环境。这里没有自动播放，只有主动调频。",
            enDescription: "The sound environment for coding, driving, and drum practice. Nothing autoplays — tune in deliberately.",
            zhStatus: "信号清晰",
            enStatus: "Signal clear"
        },
        {
            id: "darkroom",
            code: "08 / IMAGE",
            route: "photos.html",
            zh: "城市暗房",
            en: "City Darkroom",
            zhOutline: "视觉笔记",
            enOutline: "Images",
            zhDescription: "城市、剪影与桌面考古。照片只有在筛选和编辑完成后，才会离开暗房。",
            enDescription: "Cities, silhouettes, and desktop archaeology. Photographs leave the darkroom only when the edit is ready.",
            zhStatus: "显影中",
            enStatus: "Developing"
        }
    ];

    function currentRoom() {
        const requested = new URLSearchParams(location.search).get("room");
        if (requested) {
            const match = rooms.find((room) => room.id === requested);
            if (match) return match;
        }
        const path = location.pathname.split("/").pop();
        if (path === "hire.html") return rooms[0];
        if (path === "work.html") return location.hash === "#projects" ? rooms[2] : rooms[1];
        if (path === "blog.html") return rooms[3];
        if (path === "now.html") return rooms[4];
        if (path === "reading.html") return rooms[5];
        if (path === "listening.html") return rooms[6];
        if (path === "photos.html") return rooms[7];
        return null;
    }

    function isEnglish() {
        return document.documentElement.lang.startsWith("en");
    }

    function themedHref(href, roomId) {
        const url = new URL(href, location.href);
        if (roomId) {
            url.searchParams.set("room", roomId);
            url.searchParams.set("from", "room");
        }
        if (document.documentElement.dataset.siteTheme === "paper") {
            url.searchParams.set("theme", "paper");
        } else {
            url.searchParams.delete("theme");
        }
        return `${url.pathname.split("/").pop()}${url.search}${url.hash}`;
    }

    function renderCopy(room, nodes) {
        const en = isEnglish();
        nodes.label.textContent = room.code;
        nodes.title.textContent = en ? room.en : room.zh;
        nodes.outline.textContent = en ? room.enOutline : room.zhOutline;
        nodes.description.textContent = en ? room.enDescription : room.zhDescription;
        nodes.status.textContent = en ? room.enStatus : room.zhStatus;
        nodes.enterText.textContent = en ? "Enter records" : "进入档案";
        nodes.backText.textContent = en ? "Back to city" : "返回城市";
        nodes.prevText.textContent = en ? rooms[nodes.prevIndex].en : rooms[nodes.prevIndex].zh;
        nodes.nextText.textContent = en ? rooms[nodes.nextIndex].en : rooms[nodes.nextIndex].zh;
        nodes.current.textContent = `${room.code} · ${en ? room.en : room.zh}`;
        nodes.statusLabel.textContent = en ? "Room status" : "房间状态";
        nodes.floorLabel.textContent = en ? "City floor" : "城市楼层";
        nodes.stageLabel.textContent = en ? "Move cursor · inspect room" : "移动鼠标 · 查看房间";
        nodes.rail.setAttribute("aria-label", en ? "Room tour" : "房间导览");
    }

    async function initRoomScene(stage, room) {
        const canvas = stage.querySelector("[data-room-canvas]");
        if (!canvas) return;

        let THREE;
        for (const url of THREE_URLS) {
            try {
                THREE = await import(url);
                break;
            } catch (error) {}
        }
        if (!THREE) return;

        const palettes = {
            signature: {
                bg: 0x07090d, ground: 0x111720, body: 0x252b35, alt: 0x171c24,
                roof: 0x323945, line: 0x697486, accent: 0xf6dd47, soft: 0x8d812f,
                cool: 0x68d8e8, glass: 0x1c5660, warm: 0xff9b4a, red: 0xff5148,
                plant: 0x6d8c57, paper: 0xf2ead8, skin: 0xd5a67c
            },
            paper: {
                bg: 0xf4f1e9, ground: 0xe5dfd2, body: 0xd2cabb, alt: 0xe8e2d7,
                roof: 0xbab09e, line: 0x655e53, accent: 0x9b2f21, soft: 0xbb7b6e,
                cool: 0x215d68, glass: 0x76a2a7, warm: 0xa4512e, red: 0x9b2f21,
                plant: 0x708447, paper: 0xfffcf3, skin: 0xb9825d
            }
        };
        const themeName = () => document.documentElement.dataset.siteTheme === "paper" ? "paper" : "signature";
        let colors = palettes[themeName()];
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(colors.bg);
        scene.fog = new THREE.Fog(colors.bg, 22, 42);

        const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 90);
        const isTower = room.id === "data";
        camera.position.set(isTower ? 15 : 12.8, isTower ? 11.5 : 8.8, isTower ? 21 : 16.2);
        camera.lookAt(0, isTower ? 6.2 : 3.6, 0);

        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: window.devicePixelRatio <= 1.5,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.shadowMap.enabled = window.innerWidth > 760;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const materials = [];
        function makeMaterial(slot, options = {}) {
            const settings = {
                color: colors[slot],
                roughness: options.roughness ?? 0.8,
                metalness: options.metalness ?? 0.04,
                flatShading: options.flatShading ?? true
            };
            if (options.transparent) {
                settings.transparent = true;
                settings.opacity = options.opacity ?? 0.55;
                settings.depthWrite = false;
            }
            const mat = new THREE.MeshStandardMaterial(settings);
            mat.userData.slot = slot;
            materials.push(mat);
            return mat;
        }
        function makeBasic(slot) {
            const mat = new THREE.MeshBasicMaterial({ color: colors[slot] });
            mat.userData.slot = slot;
            materials.push(mat);
            return mat;
        }

        const mats = {
            ground: makeMaterial("ground"), body: makeMaterial("body"), alt: makeMaterial("alt"),
            roof: makeMaterial("roof"), accent: makeMaterial("accent", { metalness: 0.12 }),
            soft: makeMaterial("soft"), cool: makeMaterial("cool"), glass: makeMaterial("glass", { transparent: true, opacity: 0.38 }),
            warm: makeMaterial("warm"), red: makeMaterial("red"), plant: makeMaterial("plant"),
            paper: makeMaterial("paper"), skin: makeMaterial("skin"), light: makeBasic("accent")
        };
        const world = new THREE.Group();
        world.rotation.y = -0.43;
        scene.add(world);
        const animated = [];
        const outlines = [];

        function add(parent, geometry, material, x = 0, y = 0, z = 0) {
            const item = new THREE.Mesh(geometry, material);
            item.position.set(x, y, z);
            item.castShadow = renderer.shadowMap.enabled;
            item.receiveShadow = true;
            parent.add(item);
            return item;
        }
        function box(parent, w, h, d, material, x = 0, y = h / 2, z = 0, outlined = false) {
            const item = add(parent, new THREE.BoxGeometry(w, h, d), material, x, y, z);
            if (outlined) outline(item);
            return item;
        }
        function cylinder(parent, rt, rb, h, sides, material, x, y, z) {
            return add(parent, new THREE.CylinderGeometry(rt, rb, h, sides), material, x, y, z);
        }
        function outline(item) {
            const lineMaterial = new THREE.LineBasicMaterial({
                color: colors.line, transparent: true, opacity: themeName() === "paper" ? 0.58 : 0.38
            });
            const edges = new THREE.LineSegments(new THREE.EdgesGeometry(item.geometry, 25), lineMaterial);
            item.add(edges);
            outlines.push(lineMaterial);
            return item;
        }
        function addPerson(parent, x, z, options = {}) {
            const person = new THREE.Group();
            person.position.set(x, 0.58, z);
            person.rotation.y = options.rotation ?? 0;
            const bodyHeight = options.seated ? 0.42 : 0.62;
            box(person, 0.24, bodyHeight, 0.2, options.color || mats.cool, 0, bodyHeight / 2, 0);
            const head = add(person, new THREE.SphereGeometry(0.14, 8, 6), mats.skin, 0, bodyHeight + 0.13, 0);
            head.castShadow = false;
            if (options.seated) {
                box(person, 0.18, 0.18, 0.42, mats.roof, 0, 0.08, 0.16);
                person.rotation.x = -0.08;
            }
            parent.add(person);
            return person;
        }
        function addBook(parent, x, y, z, color = mats.accent, rotation = 0) {
            const book = box(parent, 0.12, 0.48, 0.32, color, x, y, z);
            book.rotation.z = rotation;
            return book;
        }
        function addTree(parent, x, z, scale = 1) {
            cylinder(parent, 0.08, 0.11, 1.15 * scale, 7, mats.roof, x, 1.05 * scale, z);
            const crown = add(parent, new THREE.ConeGeometry(0.52 * scale, 1.3 * scale, 7), mats.plant, x, 1.95 * scale, z);
            crown.rotation.y = x * 0.2;
        }
        function addBench(parent, x, z, rotation = 0) {
            const bench = new THREE.Group();
            bench.position.set(x, 0.54, z);
            bench.rotation.y = rotation;
            box(bench, 1.35, 0.12, 0.42, mats.roof, 0, 0, 0);
            box(bench, 1.35, 0.48, 0.1, mats.soft, 0, 0.3, -0.2);
            box(bench, 0.1, 0.48, 0.1, mats.roof, -0.5, -0.25, 0);
            box(bench, 0.1, 0.48, 0.1, mats.roof, 0.5, -0.25, 0);
            parent.add(bench);
            return bench;
        }
        function addLamp(parent, x, z) {
            cylinder(parent, 0.045, 0.07, 1.8, 7, mats.roof, x, 1.38, z);
            box(parent, 0.36, 0.1, 0.18, mats.light, x + 0.13, 2.28, z);
        }
        function addWindows(parent, width, height, depth, columns = 4, rows = 4) {
            for (let row = 0; row < rows; row++) {
                for (let column = 0; column < columns; column++) {
                    if ((row + column) % 4 === 1) continue;
                    const x = -width / 2 + 0.58 + column * ((width - 1.16) / Math.max(1, columns - 1));
                    const y = 1.15 + row * ((height - 1.8) / Math.max(1, rows - 1));
                    box(parent, 0.34, 0.36, 0.055, mats.light, x, y, depth / 2 + 0.03);
                }
            }
        }
        function addSign(parent) {
            const signCanvas = document.createElement("canvas");
            signCanvas.width = 1024;
            signCanvas.height = 220;
            const texture = new THREE.CanvasTexture(signCanvas);
            texture.colorSpace = THREE.SRGBColorSpace;
            const signMaterial = new THREE.SpriteMaterial({
                map: texture, transparent: true, depthTest: false, depthWrite: false
            });
            const sign = new THREE.Sprite(signMaterial);
            sign.scale.set(6.4, 1.38, 1);
            sign.position.set(0.35, 1.48, 5.15);
            sign.renderOrder = 1000;
            parent.add(sign);
            box(parent, 0.08, 1.15, 0.08, mats.accent, -2.2, 0.87, 5.08);
            box(parent, 0.08, 1.15, 0.08, mats.accent, 2.9, 0.87, 5.08);
            const draw = () => {
                colors = palettes[themeName()];
                const context = signCanvas.getContext("2d");
                const title = isEnglish() ? room.en : room.zh;
                context.clearRect(0, 0, signCanvas.width, signCanvas.height);
                context.fillStyle = `#${colors.bg.toString(16).padStart(6, "0")}`;
                context.fillRect(8, 8, 1008, 204);
                context.strokeStyle = `#${colors.accent.toString(16).padStart(6, "0")}`;
                context.lineWidth = 8;
                context.strokeRect(8, 8, 1008, 204);
                context.fillStyle = `#${colors.accent.toString(16).padStart(6, "0")}`;
                context.font = "700 36px 'JetBrains Mono', monospace";
                context.fillText(room.code, 42, 72);
                context.fillStyle = themeName() === "paper" ? "#211d18" : "#f6f7f2";
                context.font = "700 58px system-ui, sans-serif";
                context.fillText(title, 42, 154);
                context.fillStyle = `#${colors.cool.toString(16).padStart(6, "0")}`;
                context.fillRect(830, 55, 130, 12);
                context.fillRect(880, 88, 80, 12);
                texture.needsUpdate = true;
            };
            draw();
            window.addEventListener("site-language-change", draw);
            return draw;
        }

        const base = box(world, 13.2, 0.5, 10.4, mats.roof, 0, 0.25, 0, true);
        base.receiveShadow = true;
        box(world, 12.5, 0.12, 9.7, mats.ground, 0, 0.56, 0);
        for (let i = -5; i <= 5; i++) {
            box(world, 0.035, 0.02, 9.5, mats.soft, i * 1.05, 0.64, 0);
        }
        box(world, 4.6, 0.04, 2.2, mats.alt, 0.8, 0.65, 3.65);
        addLamp(world, -5.2, 3.4);
        addLamp(world, 5.15, 2.7);

        const building = new THREE.Group();
        building.position.z = -0.55;
        world.add(building);

        function buildDataTower() {
            box(building, 4.4, 6.5, 4.2, mats.body, -0.6, 3.82, -0.3, true);
            box(building, 3.6, 2.8, 3.5, mats.alt, -0.6, 8.45, -0.3, true);
            box(building, 2.7, 1.8, 2.7, mats.body, -0.6, 10.75, -0.3, true);
            box(building, 4.9, 0.28, 4.65, mats.accent, -0.6, 7.02, -0.3);
            box(building, 4.05, 0.24, 3.95, mats.soft, -0.6, 9.92, -0.3);
            box(building, 0.46, 5.6, 4.32, mats.soft, -0.6, 3.75, 1.82);
            addWindows(building, 4.4, 6.4, 4.2, 4, 5);
            box(building, 2.7, 2.35, 2.5, mats.alt, 3.15, 1.76, -0.5, true);
            for (let rack = 0; rack < 3; rack++) {
                const x = 2.35 + rack * 0.78;
                box(building, 0.56, 1.62, 1.7, mats.roof, x, 1.55, 0.05, true);
                for (let led = 0; led < 5; led++) box(building, 0.08, 0.06, 0.03, led % 2 ? mats.cool : mats.accent, x - 0.16, 1.05 + led * 0.25, 0.92);
            }
            box(building, 2.5, 0.14, 0.72, mats.cool, 2.9, 0.85, 1.55);
            addPerson(building, 2.5, 1.8, { rotation: Math.PI, color: mats.accent });
            addPerson(building, 3.35, 1.72, { rotation: Math.PI, color: mats.cool });
            box(building, 0.16, 3.2, 0.16, mats.accent, -0.6, 13.25, -0.3);
            [0.78, 1.2, 1.65].forEach((radius, index) => {
                const ring = add(building, new THREE.TorusGeometry(radius, 0.055, 6, 28, Math.PI), mats.accent, -0.6, 13.55 + index * 0.16, -0.3);
                ring.rotation.x = Math.PI / 2;
                animated.push({ object: ring, type: "pulse", phase: index });
            });
            for (let i = 0; i < 5; i++) {
                const packet = box(building, 0.18, 0.18, 0.18, mats.cool, -2.4 + i * 0.9, 7.35 + i * 0.32, 2.2);
                animated.push({ object: packet, type: "packet", phase: i * 0.6 });
            }
        }
        function buildLab() {
            box(building, 7.4, 4.8, 4.4, mats.alt, 0, 3.0, -0.4, true);
            box(building, 2.1, 2.4, 4.8, mats.roof, -4.35, 1.8, -0.4, true);
            const dome = add(building, new THREE.SphereGeometry(1.55, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mats.glass, 1.35, 5.45, -0.4);
            outline(dome);
            box(building, 1.85, 0.35, 1.85, mats.cool, 1.35, 5.42, -0.4);
            addWindows(building, 7.4, 4.6, 4.4, 6, 3);
            for (let i = -1; i <= 1; i++) {
                const panel = box(building, 1.3, 0.09, 0.85, mats.cool, i * 1.45 - 1.2, 5.55, -1.45);
                panel.rotation.x = -0.26;
            }
            box(building, 4.8, 0.14, 1.05, mats.paper, 0.2, 1.08, 2.35);
            for (let station = -1; station <= 1; station++) {
                cylinder(building, 0.17, 0.17, 0.55, 12, station === 0 ? mats.red : mats.cool, station * 1.15, 1.43, 2.35);
            }
            addPerson(building, -1.4, 2.85, { rotation: Math.PI, color: mats.paper });
            addPerson(building, 1.25, 2.8, { rotation: Math.PI, color: mats.cool });
            const molecule = new THREE.Group();
            molecule.position.set(4.55, 2.1, 1.1);
            [[0, 0, 0], [0.55, 0.45, 0], [-0.5, 0.5, 0.15], [0.2, 0.95, -0.15]].forEach(([x, y, z], i) => {
                add(molecule, new THREE.SphereGeometry(0.2, 10, 8), i === 0 ? mats.accent : mats.cool, x, y, z);
            });
            building.add(molecule);
            animated.push({ object: molecule, type: "spin" });
        }
        function buildWorkshop() {
            box(building, 7.6, 4.5, 4.7, mats.alt, -0.2, 2.82, -0.5, true);
            for (let i = -2; i <= 2; i++) {
                const tooth = box(building, 1.38, 1.05 + (i + 2) * 0.18, 4.78, i % 2 ? mats.roof : mats.body, i * 1.42 - 0.2, 5.25, -0.5, true);
                tooth.rotation.z = -0.08;
            }
            for (let i = -1; i <= 1; i++) cylinder(building, 0.2, 0.27, 2.1 + (i + 1) * 0.2, 8, mats.soft, i * 1.45 - 1.1, 6.75, -1.45);
            box(building, 5.1, 0.16, 1.1, mats.accent, -0.4, 1.05, 2.45);
            box(building, 0.18, 5.6, 0.18, mats.accent, 4.35, 3.35, -0.5);
            box(building, 4.1, 0.18, 0.18, mats.accent, 2.4, 6.05, -0.5);
            const hook = cylinder(building, 0.08, 0.08, 2.8, 8, mats.cool, 0.55, 4.6, -0.5);
            const cargo = box(building, 1.3, 0.8, 1.15, mats.warm, 0.55, 2.9, -0.5, true);
            animated.push({ object: hook, type: "crane", cargo });
            for (let i = 0; i < 4; i++) cylinder(building, 0.23, 0.23, 0.32, 12, mats.roof, -2.6 + i * 0.65, 0.92, 2.9);
            addPerson(building, -2.35, 2.2, { rotation: Math.PI, color: mats.warm });
            addPerson(building, 2.25, 2.5, { rotation: Math.PI, color: mats.accent });
        }
        function buildLibrary() {
            box(building, 7.5, 5.4, 4.5, mats.body, 0, 3.32, -0.6, true);
            box(building, 8.5, 0.34, 1.45, mats.roof, 0, 0.82, 2.18, true);
            box(building, 8.0, 0.28, 4.95, mats.accent, 0, 6.16, -0.6);
            const leftPage = box(building, 3.65, 0.2, 2.5, mats.paper, -1.78, 6.72, -0.5, true);
            const rightPage = box(building, 3.65, 0.2, 2.5, mats.paper, 1.78, 6.72, -0.5, true);
            leftPage.rotation.z = -0.13;
            rightPage.rotation.z = 0.13;
            for (let bay = -3; bay <= 3; bay++) {
                box(building, 0.22, 4.65, 0.32, mats.soft, bay * 1.02, 3.15, 1.72);
                for (let shelf = 0; shelf < 4; shelf++) box(building, 0.85, 0.08, 0.42, mats.roof, bay * 1.02, 1.35 + shelf * 1.02, 1.8);
                for (let book = 0; book < 5; book++) {
                    const bookMat = [mats.accent, mats.cool, mats.warm, mats.paper][(book + bay + 4) % 4];
                    addBook(building, bay * 1.02 - 0.28 + book * 0.13, 1.62 + ((book + bay + 9) % 4) * 1.02, 2.04, bookMat, (book - 2) * 0.025);
                }
            }
            const atrium = box(building, 3.2, 3.3, 0.12, mats.glass, 0, 2.55, 2.28, true);
            atrium.castShadow = false;
            for (let table = -1; table <= 1; table++) {
                box(building, 1.4, 0.12, 0.7, mats.paper, table * 2.05, 0.94, 3.0);
                const reader = addPerson(building, table * 2.05, 3.2, { seated: true, rotation: Math.PI, color: table === 0 ? mats.accent : mats.cool });
                const openBook = box(building, 0.48, 0.04, 0.34, mats.paper, table * 2.05, 1.08, 2.92);
                openBook.rotation.y = table * 0.08;
                animated.push({ object: reader, type: "reader", phase: table });
            }
            addBench(building, -4.5, 2.75, -0.22);
            addTree(building, 4.85, 2.4, 0.85);
            addTree(building, -5.1, -1.8, 0.75);
        }
        function buildApartment() {
            box(building, 5.3, 7.3, 4.3, mats.body, -0.3, 4.22, -0.65, true);
            addWindows(building, 5.3, 7.1, 4.3, 4, 5);
            for (let floor = 1; floor <= 4; floor++) {
                box(building, 5.8, 0.13, 0.78, mats.roof, -0.3, 1.25 + floor * 1.28, 1.78);
                for (let rail = -2; rail <= 2; rail++) box(building, 0.055, 0.46, 0.055, mats.soft, -0.3 + rail * 1.05, 1.52 + floor * 1.28, 2.12);
            }
            box(building, 3.7, 0.28, 3.1, mats.roof, -0.3, 8.05, -0.65);
            for (let i = -1; i <= 1; i++) {
                box(building, 0.85, 0.3, 0.5, mats.cool, -0.3 + i * 1.2, 8.28, 0.15);
                add(building, new THREE.SphereGeometry(0.34, 8, 6), mats.plant, -0.3 + i * 1.2, 8.68, 0.15);
            }
            box(building, 2.2, 0.14, 0.85, mats.paper, 3.55, 0.95, 2.1);
            addPerson(building, 3.35, 2.25, { seated: true, rotation: Math.PI, color: mats.warm });
            addTree(building, -4.7, 2.2, 0.9);
            addBench(building, -4.2, 3.2, 0.2);
        }
        function buildArchive() {
            box(building, 7.6, 4.6, 4.8, mats.alt, 0, 2.86, -0.6, true);
            for (let rib = -4; rib <= 4; rib++) box(building, 0.17, 4.9, 5.1, mats.roof, rib * 0.82, 2.95, -0.6);
            add(building, new THREE.TorusGeometry(1.08, 0.2, 10, 32), mats.accent, 0, 2.55, 1.86);
            const door = cylinder(building, 0.86, 0.86, 0.18, 24, mats.roof, 0, 2.55, 1.91);
            door.rotation.x = Math.PI / 2;
            for (let spoke = 0; spoke < 6; spoke++) {
                const bar = box(building, 1.15, 0.08, 0.08, mats.accent, 0, 2.55, 2.05);
                bar.rotation.z = spoke * Math.PI / 3;
            }
            for (let side = -1; side <= 1; side += 2) {
                for (let shelf = 0; shelf < 4; shelf++) {
                    box(building, 1.9, 0.12, 0.5, mats.roof, side * 2.45, 1.0 + shelf * 0.78, 2.25);
                    for (let file = 0; file < 6; file++) box(building, 0.22, 0.48, 0.34, file % 2 ? mats.paper : mats.soft, side * 2.45 - 0.7 + file * 0.28, 1.28 + shelf * 0.78, 2.25);
                }
            }
            addPerson(building, 2.45, 3.0, { rotation: Math.PI, color: mats.paper });
            box(building, 1.6, 0.12, 0.7, mats.paper, -3.9, 0.96, 2.55);
            addPerson(building, -3.9, 2.75, { seated: true, rotation: Math.PI, color: mats.cool });
        }
        function buildRadio() {
            box(building, 5.4, 5.6, 4.4, mats.alt, -0.45, 3.36, -0.65, true);
            addWindows(building, 5.4, 5.4, 4.4, 4, 4);
            box(building, 3.8, 2.4, 2.4, mats.body, 3.45, 1.78, -0.25, true);
            box(building, 3.2, 1.45, 0.12, mats.glass, 3.45, 1.95, 1.02, true);
            box(building, 2.5, 0.14, 0.72, mats.accent, 3.45, 0.95, 1.55);
            addPerson(building, 3.1, 1.85, { seated: true, rotation: Math.PI, color: mats.red });
            box(building, 0.15, 3.4, 0.15, mats.accent, -0.45, 8.0, -0.65);
            [0.8, 1.3, 1.85].forEach((radius, index) => {
                const signal = add(building, new THREE.TorusGeometry(radius, 0.06, 6, 30, Math.PI), mats.accent, -0.45, 8.45 + index * 0.18, -0.65);
                signal.rotation.x = Math.PI / 2;
                animated.push({ object: signal, type: "pulse", phase: index });
            });
            const dish = add(building, new THREE.SphereGeometry(1.25, 18, 10, 0, Math.PI * 2, 0, Math.PI / 3), mats.cool, -1.65, 6.85, -0.3);
            dish.scale.y = 0.28;
            dish.rotation.z = -0.58;
            cylinder(building, 0.05, 0.08, 1.3, 8, mats.roof, -1.65, 6.25, -0.3);
            const record = cylinder(building, 0.78, 0.78, 0.08, 24, mats.roof, -3.9, 0.9, 2.4);
            record.rotation.x = Math.PI / 2;
            cylinder(building, 0.12, 0.12, 0.09, 16, mats.accent, -3.9, 0.9, 2.46).rotation.x = Math.PI / 2;
        }
        function buildDarkroom() {
            box(building, 6.5, 4.2, 4.5, mats.body, 0, 2.65, -0.6, true);
            const lens = cylinder(building, 1.15, 1.15, 0.42, 24, mats.cool, 0, 2.85, 1.82);
            lens.rotation.x = Math.PI / 2;
            const innerLens = cylinder(building, 0.7, 0.7, 0.46, 24, mats.alt, 0, 2.85, 2.02);
            innerLens.rotation.x = Math.PI / 2;
            box(building, 7.0, 0.42, 0.55, mats.red, 0, 5.02, 1.75);
            const skylight = box(building, 2.5, 0.15, 1.65, mats.glass, 1.2, 4.92, -0.8, true);
            skylight.rotation.z = 0.13;
            for (let frame = -2; frame <= 2; frame++) {
                box(building, 0.92, 0.72, 0.07, mats.paper, frame * 1.15, 1.55 + (frame % 2) * 0.25, 2.18, true);
                box(building, 0.68, 0.48, 0.08, frame % 2 ? mats.cool : mats.red, frame * 1.15, 1.55 + (frame % 2) * 0.25, 2.23);
            }
            box(building, 4.5, 0.06, 0.06, mats.roof, 0, 4.1, 2.35);
            for (let print = -2; print <= 2; print++) {
                const photo = box(building, 0.55, 0.72, 0.035, mats.paper, print * 0.78, 3.65 + Math.abs(print % 2) * 0.16, 2.35);
                photo.rotation.z = print * 0.025;
            }
            addPerson(building, -2.75, 2.75, { rotation: Math.PI, color: mats.red });
            const tripod = new THREE.Group();
            tripod.position.set(3.8, 0.65, 2.2);
            [-0.3, 0, 0.3].forEach((offset) => {
                const leg = box(tripod, 0.05, 1.3, 0.05, mats.roof, offset, 0.55, 0);
                leg.rotation.z = offset;
            });
            box(tripod, 0.58, 0.42, 0.42, mats.alt, 0, 1.25, 0, true);
            building.add(tripod);
        }

        const builders = {
            data: buildDataTower, lab: buildLab, workshop: buildWorkshop, library: buildLibrary,
            apartment: buildApartment, archive: buildArchive, radio: buildRadio, darkroom: buildDarkroom
        };
        (builders[room.id] || buildDataTower)();
        const redrawSign = addSign(world);

        const ambient = new THREE.HemisphereLight(0xdbe7ff, 0x141821, themeName() === "paper" ? 2.35 : 1.65);
        const sun = new THREE.DirectionalLight(themeName() === "paper" ? 0xfff7e4 : 0xfff3ba, 3.4);
        sun.position.set(12, 20, 14);
        sun.castShadow = renderer.shadowMap.enabled;
        sun.shadow.mapSize.set(1024, 1024);
        scene.add(ambient, sun);
        const fill = new THREE.PointLight(colors.cool, 1.25, 34);
        fill.position.set(-7, 7, 8);
        scene.add(fill);

        function applyTheme() {
            colors = palettes[themeName()];
            scene.background.setHex(colors.bg);
            scene.fog.color.setHex(colors.bg);
            materials.forEach((mat) => mat.color.setHex(colors[mat.userData.slot]));
            outlines.forEach((mat) => {
                mat.color.setHex(colors.line);
                mat.opacity = themeName() === "paper" ? 0.58 : 0.38;
            });
            ambient.intensity = themeName() === "paper" ? 2.35 : 1.65;
            sun.color.setHex(themeName() === "paper" ? 0xfff7e4 : 0xfff3ba);
            fill.color.setHex(colors.cool);
            redrawSign();
        }
        window.addEventListener("site-theme-change", applyTheme);

        let pointerX = 0;
        let pointerY = 0;
        stage.addEventListener("pointermove", (event) => {
            const rect = stage.getBoundingClientRect();
            pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.18;
            pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.09;
        });
        stage.addEventListener("pointerleave", () => {
            pointerX = 0;
            pointerY = 0;
        });

        const resize = () => {
            const rect = stage.getBoundingClientRect();
            renderer.setSize(rect.width, rect.height, false);
            camera.aspect = rect.width / rect.height;
            camera.updateProjectionMatrix();
        };
        resize();
        window.addEventListener("resize", resize);
        stage.classList.add("room-3d-ready");

        const animate = (time) => {
            if (!document.documentElement.contains(canvas)) return;
            const t = time * 0.001;
            world.rotation.y += ((-0.43 + pointerX) - world.rotation.y) * 0.035;
            world.rotation.x += ((pointerY * -0.35) - world.rotation.x) * 0.035;
            if (!reducedMotion) {
                animated.forEach((item) => {
                    if (item.type === "pulse") {
                        const pulse = 1 + Math.sin(t * 2.2 + item.phase) * 0.08;
                        item.object.scale.setScalar(pulse);
                    } else if (item.type === "packet") {
                        item.object.position.y += Math.sin(t * 2 + item.phase) * 0.002;
                        item.object.rotation.y += 0.012;
                    } else if (item.type === "spin") {
                        item.object.rotation.y += 0.008;
                    } else if (item.type === "reader") {
                        item.object.rotation.z = Math.sin(t * 0.8 + item.phase) * 0.018;
                    } else if (item.type === "crane") {
                        const lift = Math.sin(t * 0.7) * 0.34;
                        item.object.position.y = 4.6 + lift;
                        item.cargo.position.y = 2.9 + lift;
                    }
                });
            }
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    function initRoom() {
        const room = currentRoom();
        const main = document.querySelector("main.page");
        if (!room || !main || document.querySelector(".room-arrival")) return;

        const index = rooms.findIndex((item) => item.id === room.id);
        const prevIndex = (index - 1 + rooms.length) % rooms.length;
        const nextIndex = (index + 1) % rooms.length;
        const fromCity = new URLSearchParams(location.search).get("from") === "city";

        document.body.classList.add("room-page");
        if (fromCity) document.body.classList.add("room-arriving");
        document.body.dataset.room = room.id;
        main.id = "room-records";

        const arrival = document.createElement("section");
        arrival.className = "room-arrival";
        arrival.dataset.roomCode = room.code.split("/")[1].trim();
        arrival.setAttribute("aria-labelledby", "room-arrival-title");
        arrival.innerHTML = `
            <div class="room-copy">
                <span class="room-floor-label"></span>
                <h1 id="room-arrival-title"><strong></strong><span></span></h1>
                <p></p>
                <div class="room-copy-actions">
                    <button class="room-action primary" type="button" data-room-enter>
                        <span data-room-enter-text></span><span aria-hidden="true">↓</span>
                    </button>
                    <a class="room-action" href="${themedHref("index.html?view=city")}">
                        <span data-room-back-text></span><span aria-hidden="true">↗</span>
                    </a>
                </div>
                <div class="room-copy-meta">
                    <span><b data-room-status></b><span data-room-status-label></span></span>
                    <span><b>${String(index + 1).padStart(2, "0")} / ${String(rooms.length).padStart(2, "0")}</b><span data-room-floor-label></span></span>
                </div>
            </div>
            <div class="room-stage" data-room-stage>
                <canvas class="room-canvas" data-room-canvas aria-label="3D room model"></canvas>
                <div class="room-shell" data-room-shell aria-hidden="true">
                    <div class="room-plane room-floor"></div>
                    <div class="room-plane room-wall-a"></div>
                    <div class="room-plane room-wall-b"></div>
                        <div class="room-structure">
                            <div class="room-structure-base"></div>
                            <div class="room-structure-core"></div>
                            <div class="room-structure-spine"></div>
                            <div class="room-structure-signal"></div>
                        </div>
                    <div class="room-object room-prop-a accent"></div>
                    <div class="room-object room-prop-b"></div>
                    <div class="room-object room-prop-c secondary"></div>
                    <div class="room-pulse"></div>
                </div>
                <span class="room-stage-label"></span>
            </div>`;

        const rail = document.createElement("nav");
        rail.className = "room-rail";
        rail.setAttribute("aria-label", isEnglish() ? "Room tour" : "房间导览");
        rail.innerHTML = `
            <a href="${themedHref(rooms[prevIndex].route, rooms[prevIndex].id)}">← <span data-room-prev></span></a>
            <span class="room-rail-current"></span>
            <a href="${themedHref(rooms[nextIndex].route, rooms[nextIndex].id)}"><span data-room-next></span> →</a>`;

        main.before(arrival, rail);

        const nodes = {
            label: arrival.querySelector(".room-floor-label"),
            title: arrival.querySelector("h1 strong"),
            outline: arrival.querySelector("h1 span"),
            description: arrival.querySelector(".room-copy > p"),
            status: arrival.querySelector("[data-room-status]"),
            enterText: arrival.querySelector("[data-room-enter-text]"),
            backText: arrival.querySelector("[data-room-back-text]"),
            prevText: rail.querySelector("[data-room-prev]"),
            nextText: rail.querySelector("[data-room-next]"),
            current: rail.querySelector(".room-rail-current"),
            statusLabel: arrival.querySelector("[data-room-status-label]"),
            floorLabel: arrival.querySelector("[data-room-floor-label]"),
            stageLabel: arrival.querySelector(".room-stage-label"),
            rail,
            prevIndex,
            nextIndex
        };
        renderCopy(room, nodes);

        arrival.querySelector("[data-room-enter]").addEventListener("click", () => {
            main.scrollIntoView({ behavior: "smooth", block: "start" });
        });

        const stage = arrival.querySelector("[data-room-stage]");
        const shell = arrival.querySelector("[data-room-shell]");
        initRoomScene(stage, room);
        stage.addEventListener("pointermove", (event) => {
            const rect = stage.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            shell.style.setProperty("--room-tilt-x", `${y * -4}deg`);
            shell.style.setProperty("--room-tilt-y", `${x * 5}deg`);
        });
        stage.addEventListener("pointerleave", () => {
            shell.style.setProperty("--room-tilt-x", "0deg");
            shell.style.setProperty("--room-tilt-y", "0deg");
        });

        const languageObserver = new MutationObserver(() => renderCopy(room, nodes));
        languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

        window.addEventListener("site-theme-change", () => {
            [...arrival.querySelectorAll("a[href]"), ...rail.querySelectorAll("a[href]")].forEach((link) => {
                const targetRoom = link.closest(".room-rail")
                    ? (link === rail.firstElementChild ? rooms[prevIndex].id : rooms[nextIndex].id)
                    : null;
                const base = link.closest(".room-rail")
                    ? (link === rail.firstElementChild ? rooms[prevIndex].route : rooms[nextIndex].route)
                    : "index.html?view=city";
                link.href = themedHref(base, targetRoom);
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initRoom, { once: true });
    } else {
        initRoom();
    }
})();
