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
            zhStatus: "公开构建",
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
            url.searchParams.set("theme", "light");
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
        nodes.modelCode.textContent = room.code;
        nodes.modelTitle.textContent = en ? room.en : room.zh;
        nodes.modelLabel.setAttribute(
            "aria-label",
            `${room.code} · ${en ? room.en : room.zh}`
        );
        const compact = window.matchMedia("(max-width: 760px)").matches || new URLSearchParams(location.search).get("mobile") === "1";
        nodes.stageLabel.textContent = compact
            ? (en ? "Drag to rotate · pinch to zoom" : "拖动旋转 · 双指缩放")
            : (en ? "Drag to rotate · scroll to zoom · double-click to reset" : "拖动旋转 · 滚轮缩放 · 双击复位");
        nodes.canvas.setAttribute("aria-label", en ? "3D room model" : "3D 房间模型");
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
        const compact = window.matchMedia("(max-width: 760px)").matches || new URLSearchParams(location.search).get("mobile") === "1";
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const devicePixelRatio = window.devicePixelRatio || 1;
        const deviceMemory = Number(navigator.deviceMemory || 4);
        const processorCount = Number(navigator.hardwareConcurrency || 4);
        const constrainedDevice = deviceMemory <= 4 || processorCount <= 4;
        let qualityTier = constrainedDevice ? "balanced" : (compact ? "balanced" : "high");
        if (reducedMotion && constrainedDevice) qualityTier = "low";
        const renderScaleFor = (tier) => {
            const limits = compact
                ? { high: [1.35, 1.65], balanced: [1.2, 1.5], low: [1, 1.2] }
                : { high: [1.5, 2.5], balanced: [1.35, 2], low: [1, 1.35] };
            const [minimum, maximum] = limits[tier];
            return Math.min(Math.max(devicePixelRatio, minimum), maximum);
        };
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(colors.bg);
        scene.fog = new THREE.Fog(colors.bg, 25, 48);

        const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 90);
        const isTower = room.id === "data";
        camera.position.set(isTower ? 15 : 12.8, isTower ? 11.5 : 8.8, isTower ? 21 : 16.2);
        const defaultCameraPosition = camera.position.clone();
        const defaultLookTarget = new THREE.Vector3(0, isTower ? 6.2 : 3.6, 0);
        const cameraLookTarget = defaultLookTarget.clone();
        camera.lookAt(defaultLookTarget);

        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: qualityTier !== "low",
            alpha: true,
            precision: "highp",
            powerPreference: "high-performance"
        });
        renderer.setPixelRatio(renderScaleFor(qualityTier));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = themeName() === "paper" ? 1.08 : 1.18;
        renderer.shadowMap.enabled = qualityTier !== "low" && window.innerWidth > 760;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const roughnessCanvas = document.createElement("canvas");
        roughnessCanvas.width = 256;
        roughnessCanvas.height = 256;
        const roughnessContext = roughnessCanvas.getContext("2d");
        const roughnessPixels = roughnessContext.createImageData(256, 256);
        for (let i = 0; i < roughnessPixels.data.length; i += 4) {
            const pixel = i / 4;
            const x = pixel % 256;
            const y = Math.floor(pixel / 256);
            const grain = ((x * 17 + y * 31 + (x * y) % 23) % 29) - 14;
            const value = 205 + grain;
            roughnessPixels.data[i] = value;
            roughnessPixels.data[i + 1] = value;
            roughnessPixels.data[i + 2] = value;
            roughnessPixels.data[i + 3] = 255;
        }
        roughnessContext.putImageData(roughnessPixels, 0, 0);
        const roughnessTexture = new THREE.CanvasTexture(roughnessCanvas);
        roughnessTexture.wrapS = THREE.RepeatWrapping;
        roughnessTexture.wrapT = THREE.RepeatWrapping;
        roughnessTexture.repeat.set(5, 5);
        roughnessTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

        const materials = [];
        function makeMaterial(slot, options = {}) {
            const settings = {
                color: colors[slot],
                roughness: options.roughness ?? 0.8,
                metalness: options.metalness ?? 0.04,
                flatShading: options.flatShading ?? false,
                roughnessMap: options.microSurface ? roughnessTexture : null
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
            ground: makeMaterial("ground", { roughness: 0.96, microSurface: true }),
            body: makeMaterial("body", { roughness: 0.58, metalness: 0.12, microSurface: true }),
            alt: makeMaterial("alt", { roughness: 0.68, metalness: 0.08, microSurface: true }),
            roof: makeMaterial("roof", { roughness: 0.46, metalness: 0.24, microSurface: true }),
            accent: makeMaterial("accent", { roughness: 0.3, metalness: 0.38 }),
            soft: makeMaterial("soft", { roughness: 0.62, metalness: 0.12 }),
            cool: makeMaterial("cool", { roughness: 0.28, metalness: 0.3 }),
            glass: makeMaterial("glass", { roughness: 0.12, metalness: 0.1, transparent: true, opacity: 0.42 }),
            warm: makeMaterial("warm", { roughness: 0.42, metalness: 0.2 }),
            red: makeMaterial("red", { roughness: 0.38, metalness: 0.18 }),
            plant: makeMaterial("plant", { roughness: 0.86 }),
            paper: makeMaterial("paper", { roughness: 0.9, microSurface: true }),
            skin: makeMaterial("skin", { roughness: 0.82 }),
            light: makeBasic("accent")
        };
        const world = new THREE.Group();
        world.rotation.y = -0.43;
        scene.add(world);
        let rotationTargetY = -0.43;
        let rotationTargetX = 0;
        let rotationVelocityY = 0;
        let rotationVelocityX = 0;
        let zoomTarget = 1;
        let zoomCurrent = 1;
        const animated = [];
        const outlines = [];
        const pageTurnMaterials = [];

        function add(parent, geometry, material, x = 0, y = 0, z = 0) {
            const item = new THREE.Mesh(geometry, material);
            item.position.set(x, y, z);
            item.castShadow = renderer.shadowMap.enabled;
            item.receiveShadow = true;
            parent.add(item);
            return item;
        }
        const roundedGeometryCache = new Map();
        function roundedBoxGeometry(width, height, depth) {
            const radius = Math.min(0.09, width * 0.12, height * 0.12, depth * 0.12);
            const key = [width, height, depth, radius].map((value) => value.toFixed(3)).join(":");
            if (roundedGeometryCache.has(key)) return roundedGeometryCache.get(key);
            const halfWidth = width / 2;
            const halfHeight = height / 2;
            const shape = new THREE.Shape();
            shape.moveTo(-halfWidth + radius, -halfHeight);
            shape.lineTo(halfWidth - radius, -halfHeight);
            shape.quadraticCurveTo(halfWidth, -halfHeight, halfWidth, -halfHeight + radius);
            shape.lineTo(halfWidth, halfHeight - radius);
            shape.quadraticCurveTo(halfWidth, halfHeight, halfWidth - radius, halfHeight);
            shape.lineTo(-halfWidth + radius, halfHeight);
            shape.quadraticCurveTo(-halfWidth, halfHeight, -halfWidth, halfHeight - radius);
            shape.lineTo(-halfWidth, -halfHeight + radius);
            shape.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + radius, -halfHeight);
            const geometry = new THREE.ExtrudeGeometry(shape, {
                depth,
                bevelEnabled: true,
                bevelSegments: qualityTier === "high" ? 2 : 1,
                steps: 1,
                bevelSize: radius * 0.45,
                bevelThickness: radius * 0.45,
                curveSegments: qualityTier === "high" ? 4 : 2
            });
            geometry.translate(0, 0, -depth / 2);
            geometry.computeVertexNormals();
            roundedGeometryCache.set(key, geometry);
            return geometry;
        }
        function box(parent, w, h, d, material, x = 0, y = h / 2, z = 0, outlined = false) {
            const shouldBevel = qualityTier !== "low"
                && Math.min(w, h, d) > 0.12
                && (outlined || (!compact && Math.max(w, h, d) > 1.15));
            const geometry = shouldBevel
                ? roundedBoxGeometry(w, h, d)
                : new THREE.BoxGeometry(w, h, d);
            const item = add(parent, geometry, material, x, y, z);
            if (outlined) outline(item);
            return item;
        }
        function cylinder(parent, rt, rb, h, sides, material, x, y, z) {
            const minimumSegments = qualityTier === "high" ? 16 : (qualityTier === "balanced" ? 10 : 8);
            const radialSegments = Math.max(sides, minimumSegments);
            return add(parent, new THREE.CylinderGeometry(rt, rb, h, radialSegments), material, x, y, z);
        }
        const taperedGeometryCache = new Map();
        function taperedMass(parent, width, height, depth, material, x, y, z, topScale = 0.86, sides = 10, outlined = true) {
            const key = [height, topScale, sides].join(":");
            let geometry = taperedGeometryCache.get(key);
            if (!geometry) {
                geometry = new THREE.CylinderGeometry(0.5 * topScale, 0.5, height, sides, 1, false);
                geometry.rotateY(Math.PI / sides);
                taperedGeometryCache.set(key, geometry);
            }
            const item = add(parent, geometry, material, x, y, z);
            item.scale.set(width, 1, depth);
            if (outlined) outline(item);
            return item;
        }
        function tubePath(parent, points, radius, material, closed = false) {
            const curve = new THREE.CatmullRomCurve3(
                points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
                closed,
                "centripetal"
            );
            const geometry = new THREE.TubeGeometry(
                curve,
                qualityTier === "high" ? 36 : 24,
                radius,
                qualityTier === "high" ? 10 : 7,
                closed
            );
            const pipe = add(parent, geometry, material);
            pipe.userData.pathCurve = curve;
            return pipe;
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
            const body = cylinder(person, 0.13, 0.18, bodyHeight, 10, options.color || mats.cool, 0, bodyHeight / 2, 0);
            body.castShadow = false;
            const head = add(person, new THREE.SphereGeometry(0.14, compact ? 10 : 16, compact ? 8 : 12), mats.skin, 0, bodyHeight + 0.13, 0);
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
            const lowerCrown = add(parent, new THREE.DodecahedronGeometry(0.52 * scale, compact ? 0 : 1), mats.plant, x, 1.75 * scale, z);
            lowerCrown.scale.set(1.15, 0.9, 1);
            lowerCrown.rotation.y = x * 0.2;
            const upperCrown = add(parent, new THREE.DodecahedronGeometry(0.36 * scale, 0), mats.plant, x + 0.08 * scale, 2.18 * scale, z);
            upperCrown.scale.set(1, 1.12, 0.95);
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
        const base = box(world, 13.2, 0.5, 10.4, mats.roof, 0, 0.25, 0, true);
        base.receiveShadow = true;
        box(world, 12.5, 0.12, 9.7, mats.ground, 0, 0.56, 0);
        const contactCanvas = document.createElement("canvas");
        contactCanvas.width = 256;
        contactCanvas.height = 256;
        const contactContext = contactCanvas.getContext("2d");
        const contactGradient = contactContext.createRadialGradient(128, 128, 18, 128, 128, 124);
        contactGradient.addColorStop(0, "rgba(0, 0, 0, 0.42)");
        contactGradient.addColorStop(0.55, "rgba(0, 0, 0, 0.2)");
        contactGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        contactContext.fillStyle = contactGradient;
        contactContext.fillRect(0, 0, 256, 256);
        const contactTexture = new THREE.CanvasTexture(contactCanvas);
        const contactMaterial = new THREE.MeshBasicMaterial({
            map: contactTexture,
            transparent: true,
            opacity: themeName() === "paper" ? 0.32 : 0.52,
            depthWrite: false
        });
        const contactShadow = add(world, new THREE.PlaneGeometry(10.2, 7.6), contactMaterial, 0, 0.635, -0.25);
        contactShadow.rotation.x = -Math.PI / 2;
        contactShadow.renderOrder = 1;
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
            taperedMass(building, 4.4, 6.5, 4.2, mats.body, -0.6, 3.82, -0.3, 0.88, 10);
            taperedMass(building, 3.6, 2.8, 3.5, mats.alt, -0.6, 8.45, -0.3, 0.84, 10);
            taperedMass(building, 2.7, 1.8, 2.7, mats.body, -0.6, 10.75, -0.3, 0.78, 10);
            box(building, 4.9, 0.28, 4.65, mats.accent, -0.6, 7.02, -0.3);
            box(building, 4.05, 0.24, 3.95, mats.soft, -0.6, 9.92, -0.3);
            box(building, 0.46, 5.6, 4.32, mats.soft, -0.6, 3.75, 1.82);
            addWindows(building, 4.4, 6.4, 4.2, 4, 5);
            for (let fin = -2; fin <= 2; fin++) {
                const height = 3.7 + (2 - Math.abs(fin)) * 0.5;
                box(building, 0.09, height, 0.18, fin % 2 ? mats.cool : mats.accent, -0.6 + fin * 0.72, 3.55, 1.96);
            }
            tubePath(building, [
                [-2.25, 1.25, 2.06],
                [-2.45, 3.2, 2.08],
                [-2.2, 5.3, 2.04],
                [-1.72, 6.62, 1.94]
            ], 0.055, mats.cool);
            box(building, 2.7, 2.35, 2.5, mats.alt, 3.15, 1.76, -0.5, true);
            addBarrelRoof(2.55, 2.35, 2.92, 0.38, mats.roof, 3.15, -0.5);
            for (let rack = 0; rack < 3; rack++) {
                const x = 2.35 + rack * 0.78;
                box(building, 0.56, 1.62, 1.7, mats.roof, x, 1.55, 0.05, true);
                for (let led = 0; led < 5; led++) box(building, 0.08, 0.06, 0.03, led % 2 ? mats.cool : mats.accent, x - 0.16, 1.05 + led * 0.25, 0.92);
            }
            [4.55, 5.05].forEach((x, index) => {
                cylinder(building, 0.27, 0.31, 1.38, 16, index ? mats.soft : mats.cool, x, 1.36, -0.9);
                const band = add(building, new THREE.TorusGeometry(0.3, 0.045, 8, 18), mats.accent, x, 1.42, -0.9);
                band.rotation.x = Math.PI / 2;
                cylinder(building, 0.06, 0.08, 0.48, 10, mats.roof, x, 2.27, -0.9);
            });
            tubePath(building, [
                [1.55, 3.75, -1.2],
                [2.0, 3.2, -1.45],
                [3.75, 2.75, -1.45],
                [4.55, 2.2, -0.9]
            ], 0.09, mats.accent);
            box(building, 2.5, 0.14, 0.72, mats.cool, 2.9, 0.85, 1.55);
            addPerson(building, 2.5, 1.8, { rotation: Math.PI, color: mats.accent });
            addPerson(building, 3.35, 1.72, { rotation: Math.PI, color: mats.cool });
            const dataCore = new THREE.Group();
            dataCore.position.set(-0.6, 12.05, -0.3);
            const core = add(dataCore, new THREE.IcosahedronGeometry(0.42, qualityTier === "high" ? 1 : 0), mats.cool);
            core.castShadow = false;
            [0.58, 0.78].forEach((radius, index) => {
                const orbit = add(dataCore, new THREE.TorusGeometry(radius, 0.035, 8, 28), index ? mats.soft : mats.accent);
                orbit.rotation.set(Math.PI / 2 + index * 0.5, index * 0.65, 0);
            });
            building.add(dataCore);
            animated.push({ object: dataCore, type: "spin" });
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
            taperedMass(building, 2.1, 2.4, 4.8, mats.roof, -4.35, 1.8, -0.4, 0.82, 12);
            const dome = add(building, new THREE.SphereGeometry(1.55, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), mats.glass, 1.35, 5.45, -0.4);
            outline(dome);
            const domeRing = add(building, new THREE.TorusGeometry(1.48, 0.09, 10, 32), mats.accent, 1.35, 5.48, -0.4);
            domeRing.rotation.x = Math.PI / 2;
            box(building, 1.85, 0.35, 1.85, mats.cool, 1.35, 5.42, -0.4);
            addWindows(building, 7.4, 4.6, 4.4, 6, 3);
            for (let i = -1; i <= 1; i++) {
                const panel = box(building, 1.3, 0.09, 0.85, mats.cool, i * 1.45 - 1.2, 5.55, -1.45);
                panel.rotation.x = -0.26;
            }
            [-4.72, -3.98].forEach((x, index) => {
                cylinder(building, 0.28, 0.32, 1.25, 18, index ? mats.glass : mats.cool, x, 1.55, 1.45);
                const band = add(building, new THREE.TorusGeometry(0.3, 0.04, 8, 20), mats.accent, x, 1.58, 1.45);
                band.rotation.x = Math.PI / 2;
                add(building, new THREE.SphereGeometry(0.27, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), mats.glass, x, 2.18, 1.45);
            });
            const bubbleCount = compact ? 3 : 5;
            const bubbles = new THREE.InstancedMesh(
                new THREE.SphereGeometry(0.065, 8, 6),
                mats.light,
                bubbleCount
            );
            bubbles.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            bubbles.frustumCulled = false;
            bubbles.visible = !reducedMotion;
            building.add(bubbles);
            animated.push({
                object: bubbles,
                type: "bubbles",
                count: bubbleCount,
                dummy: new THREE.Object3D()
            });
            tubePath(building, [
                [-4.72, 2.28, 1.42],
                [-4.75, 3.7, 1.2],
                [-2.9, 4.9, 0.45],
                [-0.15, 5.22, -0.05]
            ], 0.07, mats.cool);
            box(building, 4.8, 0.14, 1.05, mats.paper, 0.2, 1.08, 2.35);
            for (let station = -1; station <= 1; station++) {
                cylinder(building, 0.17, 0.17, 0.55, 12, station === 0 ? mats.red : mats.cool, station * 1.15, 1.43, 2.35);
            }
            const microscope = new THREE.Group();
            microscope.position.set(2.25, 1.22, 2.35);
            cylinder(microscope, 0.19, 0.24, 0.08, 16, mats.roof, 0, 0, 0);
            const arm = cylinder(microscope, 0.055, 0.075, 0.72, 12, mats.soft, 0, 0.36, 0);
            arm.rotation.z = -0.32;
            const optic = cylinder(microscope, 0.09, 0.12, 0.38, 14, mats.cool, 0.14, 0.67, 0);
            optic.rotation.z = Math.PI / 2 - 0.32;
            building.add(microscope);
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
                const skylight = box(building, 1.02, 0.06, 2.2, mats.glass, i * 1.42 - 0.2, 5.72 + (i + 2) * 0.08, -0.15);
                skylight.rotation.z = -0.08;
            }
            for (let i = -1; i <= 1; i++) cylinder(building, 0.2, 0.27, 2.1 + (i + 1) * 0.2, 8, mats.soft, i * 1.45 - 1.1, 6.75, -1.45);
            tubePath(building, [
                [-2.55, 4.55, -1.6],
                [-2.75, 5.8, -1.7],
                [-2.2, 7.45, -1.65],
                [-1.45, 8.1, -1.45]
            ], 0.12, mats.roof);
            const smokeCount = compact ? 4 : 7;
            const smoke = new THREE.InstancedMesh(
                new THREE.DodecahedronGeometry(0.3, 0),
                mats.soft,
                smokeCount
            );
            smoke.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
            smoke.frustumCulled = false;
            smoke.castShadow = false;
            smoke.visible = !reducedMotion;
            building.add(smoke);
            animated.push({
                object: smoke,
                type: "smoke",
                count: smokeCount,
                dummy: new THREE.Object3D()
            });
            box(building, 5.1, 0.16, 1.1, mats.accent, -0.4, 1.05, 2.45);
            box(building, 0.18, 5.6, 0.18, mats.accent, 4.35, 3.35, -0.5);
            box(building, 4.1, 0.18, 0.18, mats.accent, 2.4, 6.05, -0.5);
            const hook = cylinder(building, 0.08, 0.08, 2.8, 8, mats.cool, 0.55, 4.6, -0.5);
            const cargo = box(building, 1.3, 0.8, 1.15, mats.warm, 0.55, 2.9, -0.5, true);
            const hookCurve = add(building, new THREE.TorusGeometry(0.24, 0.065, 8, 18, Math.PI * 1.45), mats.cool, 0.55, 3.18, -0.5);
            hookCurve.rotation.z = -0.72;
            animated.push({ object: hook, type: "crane", cargo, hookCurve });
            const gear = new THREE.Group();
            gear.position.set(-2.95, 2.45, 1.92);
            add(gear, new THREE.TorusGeometry(0.9, 0.18, 10, 28), mats.accent);
            for (let spoke = 0; spoke < 8; spoke++) {
                const bar = box(gear, 1.48, 0.1, 0.12, mats.soft, 0, 0, 0);
                bar.rotation.z = spoke * Math.PI / 4;
            }
            cylinder(gear, 0.2, 0.2, 0.18, 18, mats.roof, 0, 0, 0).rotation.x = Math.PI / 2;
            building.add(gear);
            animated.push({ object: gear, type: "gear" });
            for (let i = 0; i < 4; i++) cylinder(building, 0.23, 0.23, 0.32, 12, mats.roof, -2.6 + i * 0.65, 0.92, 2.9);
            [-1.5, -0.9, -0.3].forEach((x, index) => {
                const tool = box(building, 0.08, 0.65 - index * 0.08, 0.08, index === 1 ? mats.cool : mats.warm, x, 1.48, 2.9);
                tool.rotation.z = -0.28 + index * 0.24;
            });
            addPerson(building, -2.35, 2.2, { rotation: Math.PI, color: mats.warm });
            addPerson(building, 2.25, 2.5, { rotation: Math.PI, color: mats.accent });
        }
        function buildLibrary() {
            box(building, 7.5, 5.4, 4.5, mats.body, 0, 3.32, -0.6, true);
            box(building, 8.5, 0.34, 1.45, mats.roof, 0, 0.82, 2.18, true);
            box(building, 8.0, 0.28, 4.95, mats.accent, 0, 6.16, -0.6);
            const bookSpineY = 6.52;
            const bookOpenAngle = THREE.MathUtils.degToRad(25);
            const pageCurve = THREE.MathUtils.degToRad(-15);
            const pageSegments = 4;
            const pageSegmentWidth = 3.65 / pageSegments;
            const bookGroup = new THREE.Group();
            const leftPages = new THREE.Group();
            const rightPages = new THREE.Group();
            bookGroup.position.set(0, bookSpineY, -0.5);
            bookGroup.rotation.x = THREE.MathUtils.degToRad(25);
            leftPages.rotation.z = -bookOpenAngle;
            rightPages.rotation.z = bookOpenAngle;
            bookGroup.add(leftPages, rightPages);
            building.add(bookGroup);

            function addCurvedPage(side, direction) {
                let hinge = side;
                const curveStep = pageCurve / (pageSegments - 1);
                for (let index = 0; index < pageSegments; index++) {
                    const segment = new THREE.Group();
                    if (index > 0) {
                        segment.position.x = direction * pageSegmentWidth;
                        segment.rotation.z = direction * curveStep;
                    }
                    hinge.add(segment);
                    box(
                        segment,
                        pageSegmentWidth + 0.035,
                        0.24,
                        2.5,
                        mats.paper,
                        direction * pageSegmentWidth / 2,
                        0,
                        0
                    );
                    [-0.055, 0.045].forEach((layerOffset) => {
                        box(
                            segment,
                            pageSegmentWidth,
                            0.018,
                            2.42,
                            mats.soft,
                            direction * pageSegmentWidth / 2,
                            layerOffset,
                            0
                        );
                    });
                    hinge = segment;
                }
            }
            addCurvedPage(leftPages, -1);
            addCurvedPage(rightPages, 1);
            const pageGeometry = new THREE.PlaneGeometry(3.55, 2.38, compact ? 16 : 24, compact ? 5 : 8);
            pageGeometry.translate(1.775, 0, 0);
            const pageMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    progress: { value: 0.06 },
                    opacity: { value: 0 },
                    pageColor: { value: new THREE.Color(colors.paper) },
                    inkColor: { value: new THREE.Color(colors.line) }
                },
                vertexShader: `
                    uniform float progress;
                    varying vec2 vPageUv;
                    varying float vCurl;
                    void main() {
                        vPageUv = uv;
                        float eased = smoothstep(0.0, 1.0, progress);
                        float along = clamp(position.x / 3.55, 0.0, 1.0);
                        float curl = sin(along * 3.14159265) * sin(eased * 3.14159265);
                        float startAngle = 0.69813170;
                        float endAngle = 2.44346095;
                        float angle = mix(startAngle, endAngle, eased) + curl * 0.52;
                        vec3 turned = position;
                        turned.x = cos(angle) * position.x;
                        turned.z = sin(angle) * position.x + curl * 0.28;
                        turned.y += sin(along * 6.2831853 + eased * 2.2) * curl * 0.055;
                        vCurl = curl;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(turned, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform vec3 pageColor;
                    uniform vec3 inkColor;
                    uniform float opacity;
                    varying vec2 vPageUv;
                    varying float vCurl;
                    void main() {
                        float edge = smoothstep(0.0, 0.035, vPageUv.x)
                            * smoothstep(0.0, 0.035, 1.0 - vPageUv.x)
                            * smoothstep(0.0, 0.035, vPageUv.y)
                            * smoothstep(0.0, 0.035, 1.0 - vPageUv.y);
                        float rule = smoothstep(0.47, 0.5, abs(fract(vPageUv.y * 12.0) - 0.5));
                        vec3 color = mix(pageColor, inkColor, vCurl * 0.12 + rule * 0.025);
                        gl_FragColor = vec4(color, opacity * edge);
                    }
                `,
                side: THREE.DoubleSide,
                transparent: true,
                depthWrite: false,
                toneMapped: true
            });
            const turningPage = new THREE.Mesh(pageGeometry, pageMaterial);
            turningPage.position.set(0, 0.14, 0);
            turningPage.rotation.x = -Math.PI / 2;
            turningPage.renderOrder = 4;
            turningPage.castShadow = false;
            bookGroup.add(turningPage);
            pageTurnMaterials.push(pageMaterial);
            animated.push({
                object: turningPage,
                material: pageMaterial,
                type: "pageTurnVisual",
                phase: 0.08
            });
            [-2.72, 0, 2.72].forEach((x, index) => {
                const arch = add(building, new THREE.TorusGeometry(0.63, 0.1, 10, 28, Math.PI), index === 1 ? mats.accent : mats.soft, x, 4.25, 1.92);
                box(building, 1.08, 1.42, 0.08, mats.glass, x, 3.55, 1.94);
                [-0.48, 0.48].forEach((offset) => {
                    box(building, 0.11, 1.55, 0.12, mats.roof, x + offset, 3.45, 1.96);
                });
                arch.castShadow = false;
            });
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
                cylinder(building, 0.035, 0.045, 0.42, 10, mats.roof, table * 2.05 + 0.45, 1.27, 2.82);
                const shade = add(building, new THREE.ConeGeometry(0.18, 0.2, 14, 1, true), mats.light, table * 2.05 + 0.45, 1.52, 2.82);
                shade.rotation.z = 0.12;
                animated.push({ object: reader, type: "reader", phase: table });
                animated.push({ object: openBook, type: "page", phase: table });
            }
            [-3.58, 3.58].forEach((x, sideIndex) => {
                for (let book = 0; book < 5; book++) {
                    const displayBook = addBook(
                        building,
                        x + (book - 2) * 0.13,
                        1.05 + Math.abs(book - 2) * 0.035,
                        2.45,
                        [mats.accent, mats.cool, mats.warm][(book + sideIndex) % 3],
                        (book - 2) * 0.045
                    );
                    displayBook.rotation.y = sideIndex ? -0.1 : 0.1;
                }
            });
            addBench(building, -4.5, 2.75, -0.22);
            addTree(building, 4.85, 2.4, 0.85);
            addTree(building, -5.1, -1.8, 0.75);
        }
        function buildApartment() {
            box(building, 5.3, 7.3, 4.3, mats.body, -0.3, 4.22, -0.65, true);
            addWindows(building, 5.3, 7.1, 4.3, 4, 5);
            for (let floor = 1; floor <= 4; floor++) {
                const balconyY = 1.25 + floor * 1.28;
                box(building, 5.8, 0.13, 0.78, mats.roof, -0.3, balconyY, 1.78);
                for (let rail = -2; rail <= 2; rail++) box(building, 0.055, 0.46, 0.055, mats.soft, -0.3 + rail * 1.05, balconyY + 0.27, 2.12);
                [-1.92, 1.32].forEach((x, index) => {
                    box(building, 1.05, 0.2, 0.28, floor % 2 ? mats.warm : mats.cool, x, balconyY + 0.18, 2.13);
                    const plant = add(building, new THREE.DodecahedronGeometry(0.18, 0), mats.plant, x + (index ? -0.16 : 0.16), balconyY + 0.45, 2.13);
                    animated.push({ object: plant, type: "plant", phase: floor + index });
                });
                if (floor % 2 === 0) {
                    addBarrelRoof(1.45, 0.7, balconyY + 0.92, 0.22, mats.accent, -0.3, 1.92);
                }
                const balconyLight = box(building, 0.18, 0.22, 0.06, mats.light, 2.02, balconyY + 0.56, 1.63);
                animated.push({
                    object: balconyLight,
                    type: "homeLight",
                    phase: floor * 0.9
                });
            }
            const resident = addPerson(building, 1.15, 2.02, { rotation: Math.PI, color: mats.cool });
            resident.position.y = 3.18;
            const wavingArm = cylinder(resident, 0.045, 0.06, 0.5, 10, mats.skin, 0.18, 0.52, 0);
            wavingArm.rotation.z = -0.55;
            animated.push({ object: wavingArm, type: "waveArm", phase: 0.5 });
            box(building, 2.4, 0.035, 0.035, mats.soft, -0.35, 5.55, 2.22);
            [-0.85, -0.15, 0.6].forEach((x, index) => {
                const cloth = box(building, 0.5, 0.62 - index * 0.08, 0.035, [mats.paper, mats.accent, mats.cool][index], x, 5.22, 2.22);
                cloth.rotation.z = (index - 1) * 0.035;
                animated.push({
                    object: cloth,
                    type: "laundry",
                    phase: index * 0.9,
                    baseRotation: cloth.rotation.z
                });
            });
            box(building, 3.7, 0.28, 3.1, mats.roof, -0.3, 8.05, -0.65);
            for (let i = -1; i <= 1; i++) {
                box(building, 0.85, 0.3, 0.5, mats.cool, -0.3 + i * 1.2, 8.28, 0.15);
                const roofPlant = add(building, new THREE.SphereGeometry(0.34, 12, 8), mats.plant, -0.3 + i * 1.2, 8.68, 0.15);
                animated.push({ object: roofPlant, type: "plant", phase: i });
            }
            [-1.62, 1.02].forEach((x) => {
                cylinder(building, 0.055, 0.075, 1.18, 10, mats.roof, x, 8.72, -1.55);
                cylinder(building, 0.055, 0.075, 1.18, 10, mats.roof, x, 8.72, 0.25);
            });
            for (let slat = -2; slat <= 2; slat++) {
                box(building, 3.0, 0.08, 0.1, mats.soft, -0.3, 9.32, -1.45 + slat * 0.4);
            }
            box(building, 2.2, 0.14, 0.85, mats.paper, 3.55, 0.95, 2.1);
            addPerson(building, 3.35, 2.25, { seated: true, rotation: Math.PI, color: mats.warm });
            addTree(building, -4.7, 2.2, 0.9);
            addBench(building, -4.2, 3.2, 0.2);
        }
        function buildArchive() {
            box(building, 7.6, 4.6, 4.8, mats.alt, 0, 2.86, -0.6, true);
            const ribGeometry = new THREE.CylinderGeometry(0.82, 0.82, 0.14, qualityTier === "high" ? 24 : 16, 1, true, 0, Math.PI);
            ribGeometry.rotateZ(Math.PI / 2);
            for (let rib = -4; rib <= 4; rib++) {
                const archRib = add(building, ribGeometry, mats.roof, rib * 0.82, 5.13, -0.6);
                archRib.scale.z = 3.05;
            }
            const vaultWheel = new THREE.Group();
            vaultWheel.position.set(0, 2.55, 1.92);
            add(vaultWheel, new THREE.TorusGeometry(1.08, 0.2, 12, 40), mats.accent);
            const door = cylinder(vaultWheel, 0.86, 0.86, 0.18, 24, mats.roof, 0, 0, 0);
            door.rotation.x = Math.PI / 2;
            for (let spoke = 0; spoke < 6; spoke++) {
                const bar = box(vaultWheel, 1.15, 0.08, 0.08, mats.accent, 0, 0, 0.13);
                bar.rotation.z = spoke * Math.PI / 3;
            }
            for (let bolt = 0; bolt < 10; bolt++) {
                const angle = bolt * Math.PI * 0.2;
                add(vaultWheel, new THREE.SphereGeometry(0.07, 10, 8), mats.cool, Math.cos(angle) * 0.94, Math.sin(angle) * 0.94, 0.16);
            }
            building.add(vaultWheel);
            animated.push({ object: vaultWheel, type: "vault" });
            for (let side = -1; side <= 1; side += 2) {
                for (let shelf = 0; shelf < 4; shelf++) {
                    box(building, 1.9, 0.12, 0.5, mats.roof, side * 2.45, 1.0 + shelf * 0.78, 2.25);
                    for (let file = 0; file < 6; file++) box(building, 0.22, 0.48, 0.34, file % 2 ? mats.paper : mats.soft, side * 2.45 - 0.7 + file * 0.28, 1.28 + shelf * 0.78, 2.25);
                }
            }
            for (let row = 0; row < 3; row++) {
                for (let column = 0; column < 4; column++) {
                    box(building, 0.48, 0.36, 0.18, (row + column) % 3 ? mats.roof : mats.accent, 2.45 + column * 0.54, 1.05 + row * 0.42, 2.38);
                    box(building, 0.16, 0.035, 0.03, mats.paper, 2.45 + column * 0.54, 1.05 + row * 0.42, 2.49);
                }
            }
            const archiveTube = tubePath(building, [
                [-3.25, 4.8, -1.5],
                [-3.45, 3.65, -1.7],
                [-3.6, 2.0, 0.2],
                [-3.75, 1.25, 2.25]
            ], 0.08, mats.cool);
            for (let packetIndex = 0; packetIndex < (compact ? 2 : 3); packetIndex++) {
                const filePacket = box(building, 0.28, 0.18, 0.2, packetIndex % 2 ? mats.paper : mats.accent);
                filePacket.position.copy(archiveTube.userData.pathCurve.getPointAt(packetIndex / (compact ? 2 : 3)));
                animated.push({
                    object: filePacket,
                    type: "archivePacket",
                    phase: packetIndex / (compact ? 2 : 3),
                    curve: archiveTube.userData.pathCurve
                });
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
            [2.3, 3.0].forEach((y, index) => {
                const speaker = cylinder(building, 0.31 - index * 0.05, 0.37 - index * 0.05, 0.16, 20, index ? mats.cool : mats.roof, 4.65, y, 1.14);
                speaker.rotation.x = Math.PI / 2;
                const speakerRing = add(building, new THREE.TorusGeometry(0.36 - index * 0.05, 0.055, 8, 22), mats.accent, 4.65, y, 1.24);
                speakerRing.castShadow = false;
            });
            for (let panel = -2; panel <= 2; panel++) {
                const acousticPanel = box(building, 0.52, 1.2 + Math.abs(panel) * 0.12, 0.12, panel % 2 ? mats.soft : mats.roof, -0.45 + panel * 0.72, 3.15, 1.6, true);
                acousticPanel.rotation.z = panel * 0.018;
            }
            addPerson(building, 3.1, 1.85, { seated: true, rotation: Math.PI, color: mats.red });
            const microphone = new THREE.Group();
            microphone.position.set(2.4, 1.08, 1.62);
            cylinder(microphone, 0.045, 0.06, 0.82, 10, mats.roof, 0, 0.4, 0);
            const micHead = add(microphone, new THREE.CapsuleGeometry(0.11, 0.24, 4, 10), mats.cool, 0, 0.92, 0);
            micHead.rotation.z = -0.18;
            box(microphone, 0.55, 0.06, 0.36, mats.roof, 0, 0.02, 0);
            building.add(microphone);
            tubePath(building, [
                [2.4, 1.08, 1.62],
                [2.65, 0.84, 1.72],
                [3.2, 0.76, 1.65],
                [3.75, 0.86, 1.55]
            ], 0.025, mats.cool);
            for (let wave = -3; wave <= 3; wave++) {
                const waveHeight = 0.18 + (3 - Math.abs(wave)) * 0.12;
                const waveBar = box(building, 0.08, waveHeight, 0.05, wave % 2 ? mats.cool : mats.accent, -0.45 + wave * 0.18, 4.62, 1.68);
                animated.push({
                    object: waveBar,
                    type: "equalizer",
                    phase: wave * 0.72,
                    baseY: waveBar.position.y,
                    height: waveHeight
                });
            }
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
            animated.push({ object: record, type: "record" });
        }
        function buildDarkroom() {
            box(building, 6.5, 4.2, 4.5, mats.body, 0, 2.65, -0.6, true);
            const lens = cylinder(building, 1.15, 1.15, 0.42, 24, mats.cool, 0, 2.85, 1.82);
            lens.rotation.x = Math.PI / 2;
            const innerLens = cylinder(building, 0.7, 0.7, 0.46, 24, mats.alt, 0, 2.85, 2.02);
            innerLens.rotation.x = Math.PI / 2;
            const lensHood = cylinder(building, 0.78, 1.05, 0.38, 24, mats.roof, 0, 2.85, 2.32);
            lensHood.rotation.x = Math.PI / 2;
            [0.78, 1.12].forEach((radius, index) => {
                const focusRing = add(building, new THREE.TorusGeometry(radius, 0.07, 10, 28), index ? mats.accent : mats.cool, 0, 2.85, 2.18 + index * 0.18);
                focusRing.castShadow = false;
            });
            box(building, 7.0, 0.42, 0.55, mats.red, 0, 5.02, 1.75);
            const skylight = box(building, 2.5, 0.15, 1.65, mats.glass, 1.2, 4.92, -0.8, true);
            skylight.rotation.z = 0.13;
            for (let frame = -2; frame <= 2; frame++) {
                box(building, 0.92, 0.72, 0.07, mats.paper, frame * 1.15, 1.55 + (frame % 2) * 0.25, 2.18, true);
                box(building, 0.68, 0.48, 0.08, frame % 2 ? mats.cool : mats.red, frame * 1.15, 1.55 + (frame % 2) * 0.25, 2.23);
            }
            box(building, 4.5, 0.06, 0.06, mats.roof, 0, 4.1, 2.35);
            box(building, 4.1, 0.48, 0.06, mats.roof, 0, 4.35, 2.32);
            for (let perforation = -7; perforation <= 7; perforation++) {
                [-0.16, 0.16].forEach((offset) => {
                    box(building, 0.12, 0.07, 0.03, mats.light, perforation * 0.25, 4.35 + offset, 2.36);
                });
            }
            for (let print = -2; print <= 2; print++) {
                const photo = box(building, 0.55, 0.72, 0.035, mats.paper, print * 0.78, 3.65 + Math.abs(print % 2) * 0.16, 2.35);
                photo.rotation.z = print * 0.025;
                animated.push({ object: photo, type: "hanging", phase: print, baseRotation: photo.rotation.z });
            }
            [-1.55, 0, 1.55].forEach((x, index) => {
                box(building, 1.25, 0.1, 0.88, mats.roof, x, 0.88, 2.75, true);
                box(building, 1.05, 0.035, 0.7, index === 1 ? mats.red : mats.glass, x, 0.95, 2.75);
            });
            [-2.35, 2.35].forEach((x, index) => {
                cylinder(building, 0.11, 0.14, 0.58, 14, index ? mats.cool : mats.red, x, 1.2, 2.75);
                cylinder(building, 0.06, 0.08, 0.18, 12, mats.paper, x, 1.58, 2.75);
            });
            const developLight = new THREE.PointLight(colors.red, 1.6, 9);
            developLight.position.set(0, 3.7, 2.8);
            building.add(developLight);
            animated.push({ object: developLight, type: "develop" });
            addPerson(building, -2.75, 2.75, { rotation: Math.PI, color: mats.red });
            const photographer = addPerson(building, 4.45, 2.25, { rotation: -Math.PI / 2, color: mats.cool });
            const adult = addPerson(building, 1.72, 2.35, { rotation: Math.PI / 2, color: mats.warm });
            const child = addPerson(building, 2.18, 2.42, { rotation: Math.PI / 2, color: mats.accent });
            child.scale.setScalar(0.72);
            animated.push({ object: photographer, type: "pose", phase: 0.3 });
            animated.push({ object: adult, type: "pose", phase: 1.1 });
            animated.push({ object: child, type: "pose", phase: 1.8 });
            const tripod = new THREE.Group();
            tripod.position.set(3.8, 0.65, 2.2);
            [-0.3, 0, 0.3].forEach((offset) => {
                const leg = box(tripod, 0.05, 1.3, 0.05, mats.roof, offset, 0.55, 0);
                leg.rotation.z = offset;
            });
            box(tripod, 0.58, 0.42, 0.42, mats.alt, 0, 1.25, 0, true);
            const cameraLens = cylinder(tripod, 0.16, 0.2, 0.28, 16, mats.cool, 0, 1.25, 0.32);
            cameraLens.rotation.x = Math.PI / 2;
            const flash = add(tripod, new THREE.IcosahedronGeometry(0.18, 0), mats.light, 0, 1.48, 0.42);
            const flashRing = add(tripod, new THREE.TorusGeometry(0.24, 0.035, 8, 20), mats.light, 0, 1.48, 0.44);
            flash.scale.setScalar(0.01);
            flashRing.scale.setScalar(0.01);
            animated.push({ object: flash, ring: flashRing, type: "flash", phase: 0.4 });
            building.add(tripod);
        }

        function addStoryEntrance() {
            const entrances = {
                data: [-0.6, 2.18],
                lab: [0, 2.28],
                workshop: [-0.2, 2.42],
                library: [0, 2.42],
                apartment: [-0.3, 2.22],
                archive: [-2.75, 2.48],
                radio: [-0.45, 2.28],
                darkroom: [-2.25, 2.28]
            };
            const [x, frontZ] = entrances[room.id] || [0, 2.3];
            box(building, 1.05, 1.72, 0.16, mats.roof, x, 1.52, frontZ, true);
            box(building, 0.68, 1.34, 0.08, mats.glass, x, 1.48, frontZ + 0.1);
            box(building, 1.58, 0.16, 0.82, mats.accent, x, 2.5, frontZ + 0.18, true);
            box(building, 1.62, 0.12, 0.72, mats.soft, x, 0.73, frontZ + 0.48);
            box(building, 1.34, 0.1, 0.56, mats.ground, x, 0.82, frontZ + 0.82);
            [-0.57, 0.57].forEach((offset) => {
                box(building, 0.13, 0.18, 0.08, mats.light, x + offset, 1.92, frontZ + 0.15);
            });
        }

        function addBarrelRoof(width, depth, y, radius, material, x = 0, z = -0.6) {
            const geometry = new THREE.CylinderGeometry(radius, radius, width, qualityTier === "high" ? 24 : 16, 1, false, 0, Math.PI);
            geometry.rotateZ(Math.PI / 2);
            const roof = add(building, geometry, material, x, y, z);
            roof.scale.z = depth / (radius * 2);
            roof.castShadow = renderer.shadowMap.enabled;
            return roof;
        }

        function addDomeRoof(radius, y, material, x = 0, z = -0.6) {
            const dome = add(
                building,
                new THREE.SphereGeometry(radius, qualityTier === "high" ? 24 : 16, qualityTier === "high" ? 12 : 8, 0, Math.PI * 2, 0, Math.PI / 2),
                material,
                x,
                y,
                z
            );
            dome.scale.y = 0.7;
            return dome;
        }

        function addArchitecturalFinish() {
            addStoryEntrance();
            if (room.id === "apartment") addDomeRoof(1.42, 8.22, mats.roof, -0.3, -0.65);
            if (room.id === "archive") addBarrelRoof(6.9, 4.6, 5.15, 0.76, mats.body);
            if (room.id === "radio") addDomeRoof(1.3, 5.92, mats.body, -0.45, -0.65);
        }

        const builders = {
            data: buildDataTower, lab: buildLab, workshop: buildWorkshop, library: buildLibrary,
            apartment: buildApartment, archive: buildArchive, radio: buildRadio, darkroom: buildDarkroom
        };
        (builders[room.id] || buildDataTower)();
        addArchitecturalFinish();
        function addMiniatureFinish() {
            for (let step = -2; step <= 2; step++) {
                box(world, 0.82, 0.035, 0.9, step % 2 ? mats.alt : mats.ground, step * 0.86, 0.68, 3.72);
            }
            [-3.35, 3.35].forEach((x) => {
                cylinder(world, 0.065, 0.085, 0.62, 12, mats.roof, x, 0.98, 3.55);
                box(world, 0.12, 0.06, 0.12, mats.light, x, 1.31, 3.55);
            });
            for (let slot = -2; slot <= 2; slot++) {
                box(world, 0.42, 0.025, 0.055, mats.roof, slot * 0.53, 0.67, 4.35);
            }
            const roofLevels = {
                lab: 5.52, workshop: 5.82, library: 6.4, apartment: 8.32,
                archive: 5.42, radio: 5.98, darkroom: 5.32
            };
            const roofLevel = roofLevels[room.id];
            if (roofLevel) {
                [-0.65, 0.65].forEach((x, index) => {
                    box(building, 0.72, 0.32, 0.58, index ? mats.roof : mats.soft, x, roofLevel, -0.75, true);
                    for (let vent = -1; vent <= 1; vent++) {
                        box(building, 0.48, 0.025, 0.035, mats.cool, x, roofLevel + 0.03 + vent * 0.08, -0.44);
                    }
                });
            }
        }
        addMiniatureFinish();
        const inspectControls = document.createElement("div");
        inspectControls.className = "room-inspect-controls";
        inspectControls.innerHTML = `
            <span class="room-quality-badge"></span>
            <button type="button" data-room-zoom-out>−</button>
            <button type="button" data-room-reset>↺</button>
            <button type="button" data-room-zoom-in>+</button>`;
        stage.append(inspectControls);
        const qualityBadge = inspectControls.querySelector(".room-quality-badge");

        function updateInspectionCopy() {
            const english = isEnglish();
            inspectControls.querySelector("[data-room-zoom-out]").setAttribute("aria-label", english ? "Zoom out" : "缩小模型");
            inspectControls.querySelector("[data-room-reset]").setAttribute("aria-label", english ? "Reset model view" : "复位模型视角");
            inspectControls.querySelector("[data-room-zoom-in]").setAttribute("aria-label", english ? "Zoom in" : "放大模型");
            qualityBadge.textContent = `${english ? "AUTO" : "自动"} · ${qualityTier.toUpperCase()}`;
        }
        window.addEventListener("site-language-change", updateInspectionCopy);
        updateInspectionCopy();

        const ambient = new THREE.HemisphereLight(0xdbe7ff, 0x141821, themeName() === "paper" ? 2.15 : 1.35);
        const sun = new THREE.DirectionalLight(themeName() === "paper" ? 0xfff7e4 : 0xfff3ba, 3.8);
        sun.position.set(12, 20, 14);
        sun.castShadow = renderer.shadowMap.enabled;
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.camera.left = -10;
        sun.shadow.camera.right = 10;
        sun.shadow.camera.top = 14;
        sun.shadow.camera.bottom = -5;
        sun.shadow.bias = -0.0002;
        sun.shadow.normalBias = 0.025;
        sun.shadow.radius = 3;
        scene.add(ambient, sun);
        const fill = new THREE.PointLight(colors.cool, 1.65, 34);
        fill.position.set(-7, 7, 8);
        scene.add(fill);
        const rim = new THREE.DirectionalLight(colors.cool, themeName() === "paper" ? 0.45 : 1.3);
        rim.position.set(-10, 12, -14);
        scene.add(rim);

        function applyTheme() {
            colors = palettes[themeName()];
            scene.background.setHex(colors.bg);
            scene.fog.color.setHex(colors.bg);
            materials.forEach((mat) => mat.color.setHex(colors[mat.userData.slot]));
            outlines.forEach((mat) => {
                mat.color.setHex(colors.line);
                mat.opacity = themeName() === "paper" ? 0.58 : 0.38;
            });
            pageTurnMaterials.forEach((mat) => {
                mat.uniforms.pageColor.value.setHex(colors.paper);
                mat.uniforms.inkColor.value.setHex(colors.line);
            });
            ambient.intensity = themeName() === "paper" ? 2.15 : 1.35;
            sun.color.setHex(themeName() === "paper" ? 0xfff7e4 : 0xfff3ba);
            fill.color.setHex(colors.cool);
            rim.color.setHex(colors.cool);
            rim.intensity = themeName() === "paper" ? 0.45 : 1.3;
            contactMaterial.opacity = themeName() === "paper" ? 0.32 : 0.52;
            renderer.toneMappingExposure = themeName() === "paper" ? 1.08 : 1.18;
        }
        window.addEventListener("site-theme-change", applyTheme);

        const activePointers = new Map();
        let dragging = false;
        let dragPointerId = null;
        let lastPointerX = 0;
        let lastPointerY = 0;
        let pinchStartDistance = 0;
        let pinchStartZoom = 1;

        function clamp(value, minimum, maximum) {
            return Math.min(maximum, Math.max(minimum, value));
        }
        function pointerDistance() {
            const pointers = [...activePointers.values()];
            if (pointers.length < 2) return 0;
            return Math.hypot(pointers[0].x - pointers[1].x, pointers[0].y - pointers[1].y);
        }
        function resetInspection() {
            rotationTargetY = -0.43;
            rotationTargetX = 0;
            rotationVelocityY = 0;
            rotationVelocityX = 0;
            zoomTarget = 1;
        }
        function adjustZoom(delta) {
            zoomTarget = clamp(zoomTarget + delta, 0.58, 1.45);
        }

        stage.addEventListener("pointerdown", (event) => {
            if (event.target.closest("button, a")) return;
            activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
            stage.setPointerCapture?.(event.pointerId);
            if (activePointers.size === 1) {
                dragging = true;
                dragPointerId = event.pointerId;
                lastPointerX = event.clientX;
                lastPointerY = event.clientY;
                stage.classList.add("dragging");
            } else if (activePointers.size === 2) {
                dragging = false;
                pinchStartDistance = pointerDistance();
                pinchStartZoom = zoomTarget;
            }
        });
        stage.addEventListener("pointermove", (event) => {
            if (!activePointers.has(event.pointerId)) return;
            activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
            if (activePointers.size >= 2) {
                const distance = pointerDistance();
                if (pinchStartDistance > 0 && distance > 0) {
                    zoomTarget = clamp(pinchStartZoom * (pinchStartDistance / distance), 0.58, 1.45);
                }
                return;
            }
            if (!dragging || event.pointerId !== dragPointerId) return;
            const deltaX = event.clientX - lastPointerX;
            const deltaY = event.clientY - lastPointerY;
            lastPointerX = event.clientX;
            lastPointerY = event.clientY;
            rotationTargetY += deltaX * 0.008;
            rotationTargetX = clamp(rotationTargetX + deltaY * 0.0055, -0.38, 0.32);
            rotationVelocityY = deltaX * 0.00075;
            rotationVelocityX = deltaY * 0.00045;
        });
        const finishPointer = (event) => {
            activePointers.delete(event.pointerId);
            if (event.pointerId === dragPointerId) {
                dragging = false;
                dragPointerId = null;
                stage.classList.remove("dragging");
            }
            if (activePointers.size === 1) {
                const [pointerId, pointer] = activePointers.entries().next().value;
                dragging = true;
                dragPointerId = pointerId;
                lastPointerX = pointer.x;
                lastPointerY = pointer.y;
                stage.classList.add("dragging");
            }
        };
        stage.addEventListener("pointerup", finishPointer);
        stage.addEventListener("pointercancel", finishPointer);
        stage.addEventListener("wheel", (event) => {
            if (event.target.closest("button, a")) return;
            event.preventDefault();
            adjustZoom(event.deltaY * 0.00075);
        }, { passive: false });
        stage.addEventListener("dblclick", (event) => {
            if (!event.target.closest("button, a")) resetInspection();
        });
        inspectControls.querySelector("[data-room-zoom-out]").addEventListener("click", () => adjustZoom(0.12));
        inspectControls.querySelector("[data-room-zoom-in]").addEventListener("click", () => adjustZoom(-0.12));
        inspectControls.querySelector("[data-room-reset]").addEventListener("click", resetInspection);

        const resize = () => {
            const rect = stage.getBoundingClientRect();
            renderer.setSize(rect.width, rect.height, false);
            camera.aspect = rect.width / rect.height;
            camera.fov = compact ? (isTower ? 45 : 41) : 33;
            camera.updateProjectionMatrix();
        };
        resize();
        window.addEventListener("resize", resize);
        stage.classList.add("room-3d-ready");
        stage.dataset.quality = qualityTier;

        function applyQualityTier(nextTier) {
            if (nextTier === qualityTier) return;
            qualityTier = nextTier;
            renderer.setPixelRatio(renderScaleFor(qualityTier));
            renderer.shadowMap.enabled = qualityTier !== "low" && window.innerWidth > 760;
            stage.dataset.quality = qualityTier;
            updateInspectionCopy();
            resize();
        }

        const cameraOffset = defaultCameraPosition.clone().sub(defaultLookTarget);
        let sampleStartedAt = performance.now();
        let sampledFrames = 0;
        let lowFrameSamples = 0;
        const animate = (time) => {
            if (!document.documentElement.contains(canvas)) return;
            const t = time * 0.001;
            if (!dragging && activePointers.size < 2) {
                rotationTargetY += rotationVelocityY;
                rotationTargetX = clamp(rotationTargetX + rotationVelocityX, -0.38, 0.32);
                rotationVelocityY *= 0.92;
                rotationVelocityX *= 0.9;
            }
            world.rotation.y += (rotationTargetY - world.rotation.y) * (reducedMotion ? 0.16 : 0.075);
            world.rotation.x += (rotationTargetX - world.rotation.x) * (reducedMotion ? 0.16 : 0.075);
            zoomCurrent += (zoomTarget - zoomCurrent) * (reducedMotion ? 0.18 : 0.08);

            cameraLookTarget.lerp(defaultLookTarget, reducedMotion ? 0.18 : 0.075);
            camera.position.copy(cameraOffset).multiplyScalar(zoomCurrent).add(cameraLookTarget);
            camera.lookAt(cameraLookTarget);
            if (!reducedMotion) {
                animated.forEach((item) => {
                    if (item.type === "pulse") {
                        const pulse = 1 + Math.sin(t * 2.2 + item.phase) * 0.14;
                        item.object.scale.setScalar(pulse);
                    } else if (item.type === "packet") {
                        item.baseX ??= item.object.position.x;
                        item.baseY ??= item.object.position.y;
                        item.baseZ ??= item.object.position.z;
                        item.object.position.x = item.baseX + Math.cos(t * 1.35 + item.phase) * 0.32;
                        item.object.position.y = item.baseY + Math.sin(t * 1.7 + item.phase) * 0.3;
                        item.object.position.z = item.baseZ + Math.sin(t * 1.1 + item.phase) * 0.14;
                        item.object.rotation.y += 0.024;
                    } else if (item.type === "bubbles") {
                        for (let index = 0; index < item.count; index++) {
                            const progress = (t * 0.22 + index / item.count) % 1;
                            const tankX = index % 2 ? -3.98 : -4.72;
                            item.dummy.position.set(
                                tankX + Math.sin(t * 1.4 + index) * 0.08,
                                1.05 + progress * 1.05,
                                1.45 + Math.cos(t + index) * 0.045
                            );
                            item.dummy.rotation.set(0, 0, 0);
                            item.dummy.scale.setScalar(0.55 + Math.sin(progress * Math.PI) * 0.6);
                            item.dummy.updateMatrix();
                            item.object.setMatrixAt(index, item.dummy.matrix);
                        }
                        item.object.instanceMatrix.needsUpdate = true;
                    } else if (item.type === "smoke") {
                        for (let index = 0; index < item.count; index++) {
                            const progress = (t * 0.1 + index / item.count) % 1;
                            const drift = progress * 0.75;
                            item.dummy.position.set(
                                -1.45 + Math.sin(index * 1.7 + t * 0.35) * drift,
                                8.22 + progress * 2.6,
                                -1.45 + Math.cos(index * 1.3 + t * 0.28) * drift * 0.55
                            );
                            item.dummy.rotation.set(progress * 1.7, index, progress * 0.8);
                            const smokeScale = 0.2 + Math.sin(progress * Math.PI) * 1.25;
                            item.dummy.scale.setScalar(smokeScale);
                            item.dummy.updateMatrix();
                            item.object.setMatrixAt(index, item.dummy.matrix);
                        }
                        item.object.instanceMatrix.needsUpdate = true;
                    } else if (item.type === "spin") {
                        item.object.rotation.y += 0.008;
                    } else if (item.type === "reader") {
                        item.object.rotation.z = Math.sin(t * 0.8 + item.phase) * 0.018;
                    } else if (item.type === "page") {
                        item.object.rotation.x = Math.sin(t * 1.15 + item.phase) * 0.035;
                    } else if (item.type === "pageTurnVisual") {
                        const pageProgress = (t * 0.16 + item.phase) % 1;
                        const fadeIn = Math.min(1, pageProgress / 0.08);
                        const fadeOut = Math.min(1, (1 - pageProgress) / 0.12);
                        item.material.uniforms.progress.value = pageProgress;
                        item.material.uniforms.opacity.value = Math.min(fadeIn, fadeOut) * 0.96;
                    } else if (item.type === "crane") {
                        const lift = Math.sin(t * 0.7) * 0.34;
                        item.object.position.y = 4.6 + lift;
                        item.cargo.position.y = 2.9 + lift;
                        item.hookCurve.position.y = 3.18 + lift;
                    } else if (item.type === "gear") {
                        item.object.rotation.z += 0.006;
                    } else if (item.type === "equalizer") {
                        const level = 0.58 + (Math.sin(t * 3.2 + item.phase) + 1) * 0.36;
                        item.object.scale.y = level;
                        item.object.position.y = item.baseY + (level - 1) * item.height * 0.5;
                    } else if (item.type === "plant") {
                        item.object.rotation.z = Math.sin(t * 0.7 + item.phase) * 0.055;
                    } else if (item.type === "homeLight") {
                        const lightPulse = 0.82 + (Math.sin(t * 1.35 + item.phase) + 1) * 0.22;
                        item.object.scale.setScalar(lightPulse);
                    } else if (item.type === "waveArm") {
                        item.object.rotation.z = -0.55 + Math.sin(t * 1.7 + item.phase) * 0.48;
                    } else if (item.type === "laundry") {
                        item.object.rotation.z = item.baseRotation + Math.sin(t * 1.25 + item.phase) * 0.13;
                        item.object.rotation.y = Math.sin(t * 0.9 + item.phase) * 0.08;
                    } else if (item.type === "vault") {
                        item.object.rotation.z = Math.sin(t * 0.38) * 0.34;
                    } else if (item.type === "archivePacket") {
                        const progress = (t * 0.11 + item.phase) % 1;
                        item.object.position.copy(item.curve.getPointAt(progress));
                        item.object.rotation.x += 0.018;
                        item.object.rotation.y += 0.026;
                    } else if (item.type === "record") {
                        item.object.rotation.y += 0.025;
                    } else if (item.type === "hanging") {
                        item.object.rotation.z = item.baseRotation + Math.sin(t * 0.72 + item.phase) * 0.035;
                    } else if (item.type === "pose") {
                        item.object.rotation.z = Math.sin(t * 0.9 + item.phase) * 0.018;
                    } else if (item.type === "flash") {
                        const cycle = (t + item.phase) % 2.4;
                        const burst = cycle < 0.18 ? Math.sin(cycle / 0.18 * Math.PI) : 0;
                        item.object.scale.setScalar(0.01 + burst * 1.8);
                        item.ring.scale.setScalar(0.01 + burst * 2.45);
                        item.ring.rotation.z += burst * 0.08;
                    } else if (item.type === "develop") {
                        item.object.intensity = 1.35 + Math.sin(t * 1.1) * 0.35;
                    }
                });
            }

            if (!document.hidden) {
                sampledFrames += 1;
                const sampleDuration = time - sampleStartedAt;
                if (sampleDuration >= 2500) {
                    const frameRate = sampledFrames * 1000 / sampleDuration;
                    lowFrameSamples = frameRate < 42 ? lowFrameSamples + 1 : 0;
                    if (lowFrameSamples >= 2 && qualityTier !== "low") {
                        applyQualityTier(qualityTier === "high" ? "balanced" : "low");
                        lowFrameSamples = 0;
                    }
                    sampledFrames = 0;
                    sampleStartedAt = time;
                }
            } else {
                sampledFrames = 0;
                sampleStartedAt = time;
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
        const params = new URLSearchParams(location.search);
        const fromCity = params.get("from") === "city";
        const recruiterEntry = room.id === "data" && params.get("entry") === "recruiter";

        document.body.classList.add("room-page");
        if (fromCity) document.body.classList.add("room-arriving");
        document.body.dataset.room = room.id;
        if (recruiterEntry) {
            document.body.classList.add("recruiter-entry");
            main.id = "main-content";
            return;
        }
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
                <div class="room-model-label" data-room-model-label>
                    <span data-room-model-code></span>
                    <strong data-room-model-title></strong>
                </div>
                <canvas class="room-canvas" data-room-canvas aria-label="3D 房间模型"></canvas>
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
            modelLabel: arrival.querySelector("[data-room-model-label]"),
            modelCode: arrival.querySelector("[data-room-model-code]"),
            modelTitle: arrival.querySelector("[data-room-model-title]"),
            stageLabel: arrival.querySelector(".room-stage-label"),
            canvas: arrival.querySelector("[data-room-canvas]"),
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
