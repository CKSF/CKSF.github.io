import { CITY_DISTRICTS } from "./city-data.js?v=20260904-release";

export class CityModel {
    constructor(THREE, options = {}) {
    const districts = options.districts || CITY_DISTRICTS;
    const state = {
        compact: Boolean(options.compact),
        theme: options.theme === "paper" ? "paper" : "signature"
    };
    const shadowsEnabled = Boolean(options.shadowsEnabled);
    const maxAnisotropy = options.maxAnisotropy || 1;
    const maxTextureSize = options.maxTextureSize || 2048;
    const canvasFactory = options.canvasFactory;
    if (typeof canvasFactory !== "function") {
        throw new TypeError("CityModel requires a canvasFactory");
    }

    const scene = new THREE.Scene();
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

    function createBakedSurface(kind, repeatX, repeatY) {
        const canvas = canvasFactory();
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext("2d");
        context.fillStyle = "#f2f1ed";
        context.fillRect(0, 0, 512, 512);

        if (kind === "facade") {
            context.strokeStyle = "rgba(92, 99, 108, 0.24)";
            context.lineWidth = 3;
            for (let x = 0; x <= 512; x += 128) {
                context.beginPath();
                context.moveTo(x, 0);
                context.lineTo(x, 512);
                context.stroke();
            }
            for (let y = 0; y <= 512; y += 86) {
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(512, y);
                context.stroke();
            }
            context.fillStyle = "rgba(48, 54, 62, 0.12)";
            for (let row = 0; row < 6; row++) {
                for (let column = 0; column < 4; column++) {
                    const offset = ((row * 7 + column * 11) % 9) - 4;
                    context.fillRect(column * 128 + 14, row * 86 + 66 + offset, 100, 5);
                }
            }
        } else if (kind === "roof") {
            context.strokeStyle = "rgba(70, 75, 82, 0.2)";
            context.lineWidth = 2;
            for (let line = 0; line <= 512; line += 64) {
                context.strokeRect(line, 0, 64, 512);
                context.strokeRect(0, line, 512, 64);
            }
            context.fillStyle = "rgba(48, 52, 58, 0.22)";
            for (let y = 24; y < 512; y += 64) {
                for (let x = 24; x < 512; x += 64) {
                    context.beginPath();
                    context.arc(x, y, 3, 0, Math.PI * 2);
                    context.fill();
                }
            }
        } else if (kind === "window") {
            context.fillStyle = "#d9d8d2";
            context.fillRect(0, 0, 512, 512);
            for (let row = 0; row < 8; row++) {
                const shade = 185 + (row % 3) * 18;
                context.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
                context.fillRect(0, row * 64 + 5, 512, 50);
                context.fillStyle = "rgba(42, 46, 52, 0.3)";
                context.fillRect(0, row * 64 + 54, 512, 4);
            }
            context.fillStyle = "rgba(255, 255, 255, 0.24)";
            context.fillRect(46, 0, 18, 512);
            context.fillRect(320, 0, 8, 512);
        } else {
            const image = context.getImageData(0, 0, 512, 512);
            for (let i = 0; i < image.data.length; i += 4) {
                const pixel = i / 4;
                const x = pixel % 512;
                const y = Math.floor(pixel / 512);
                const noise = ((x * 19 + y * 37 + (x * y) % 31) % 25) - 12;
                const value = 224 + noise;
                image.data[i] = value;
                image.data[i + 1] = value;
                image.data[i + 2] = value;
                image.data[i + 3] = 255;
            }
            context.putImageData(image, 0, 0);
            context.strokeStyle = "rgba(80, 84, 90, 0.18)";
            context.lineWidth = 2;
            for (let seam = 0; seam < 512; seam += 128) {
                context.beginPath();
                context.moveTo(0, seam);
                context.lineTo(512, seam + 18);
                context.stroke();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(repeatX, repeatY);
        texture.anisotropy = Math.min(8, maxAnisotropy);
        return texture;
    }

    const bakedSurfaces = {
        facade: createBakedSurface("facade", 2, 3),
        roof: createBakedSurface("roof", 3, 3),
        ground: createBakedSurface("ground", 8, 8),
        window: createBakedSurface("window", 1, 1)
    };

    const dynamicMaterials = [];
    const makeMaterial = (slot, options = {}) => {
        const material = new THREE.MeshStandardMaterial({
            color: palette[state.theme][slot],
            roughness: options.roughness ?? 0.82,
            metalness: options.metalness ?? 0.04,
            flatShading: options.flatShading ?? false,
            transparent: options.transparent ?? false,
            opacity: options.opacity ?? 1,
            map: options.map || null,
            bumpMap: options.bumpMap || null,
            bumpScale: options.bumpScale ?? 0
        });
        material.userData.paletteSlot = slot;
        dynamicMaterials.push(material);
        return material;
    };

    const matGround = makeMaterial("ground", { roughness: 0.98, map: bakedSurfaces.ground, bumpMap: bakedSurfaces.ground, bumpScale: 0.018 });
    const matGroundTop = makeMaterial("groundTop", { roughness: 0.9, map: bakedSurfaces.ground, bumpMap: bakedSurfaces.ground, bumpScale: 0.012 });
    const matBuilding = makeMaterial("building", { roughness: 0.58, metalness: 0.14, map: bakedSurfaces.facade, bumpMap: bakedSurfaces.facade, bumpScale: 0.025 });
    const matBuildingAlt = makeMaterial("buildingAlt", { roughness: 0.66, metalness: 0.1, map: bakedSurfaces.facade, bumpMap: bakedSurfaces.facade, bumpScale: 0.02 });
    const matRoof = makeMaterial("roof", { roughness: 0.46, metalness: 0.28, map: bakedSurfaces.roof, bumpMap: bakedSurfaces.roof, bumpScale: 0.018 });
    const matRoad = makeMaterial("road", { roughness: 0.94, map: bakedSurfaces.ground, bumpMap: bakedSurfaces.ground, bumpScale: 0.012 });
    const matAccent = makeMaterial("accent", { roughness: 0.3, metalness: 0.42 });
    const matAccentSoft = makeMaterial("accentSoft", { roughness: 0.52, metalness: 0.2 });
    const matCool = makeMaterial("cool", { roughness: 0.28, metalness: 0.24 });
    const matPlant = makeMaterial("plant", { roughness: 0.84 });
    const matWindow = new THREE.MeshStandardMaterial({
        color: palette[state.theme].window,
        emissive: palette[state.theme].window,
        emissiveIntensity: state.theme === "paper" ? 0.18 : 2.8,
        map: bakedSurfaces.window,
        emissiveMap: bakedSurfaces.window,
        roughness: 0.24,
        metalness: 0.12
    });
    matWindow.userData.paletteSlot = "window";
    matWindow.userData.emissivePaletteSlot = "window";
    dynamicMaterials.push(matWindow);

    const cyberEdgeMaterial = new THREE.MeshBasicMaterial({
        color: 0x36e7ff,
        transparent: true,
        opacity: 0.86,
        toneMapped: false
    });
    const cyberSignalMaterial = new THREE.MeshBasicMaterial({
        color: 0xff3fa4,
        transparent: true,
        opacity: 0.82,
        toneMapped: false
    });
    const cyberPanelMaterial = new THREE.MeshStandardMaterial({
        color: 0x111722,
        emissive: 0x102b36,
        emissiveIntensity: 1.35,
        roughness: 0.24,
        metalness: 0.7
    });
    const paperTrimMaterial = new THREE.MeshStandardMaterial({
        color: 0xeee7da,
        roughness: 0.92,
        metalness: 0.02
    });
    const paperWarmMaterial = new THREE.MeshStandardMaterial({
        color: 0xa94738,
        roughness: 0.84,
        metalness: 0.02
    });

    function applyStylizedSurface(material, strength = 0.08) {
        material.onBeforeCompile = (shader) => {
            shader.uniforms.stylizedStrength = { value: strength };
            shader.vertexShader = `
                varying vec3 vStylizedWorldPosition;
                varying vec3 vStylizedWorldNormal;
            ` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                "#include <project_vertex>",
                `
                    vStylizedWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;
                    vStylizedWorldNormal = normalize(mat3(modelMatrix) * objectNormal);
                    #include <project_vertex>
                `
            );
            shader.fragmentShader = `
                uniform float stylizedStrength;
                varying vec3 vStylizedWorldPosition;
                varying vec3 vStylizedWorldNormal;
            ` + shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace(
                "#include <tonemapping_fragment>",
                `
                    float heightShade = smoothstep(0.0, 12.0, vStylizedWorldPosition.y);
                    float upwardShade = max(dot(normalize(vStylizedWorldNormal), vec3(0.0, 1.0, 0.0)), 0.0);
                    outgoingLight *= mix(1.0 - stylizedStrength, 1.0 + stylizedStrength * 0.8, heightShade);
                    outgoingLight += upwardShade * stylizedStrength * 0.18;
                    #include <tonemapping_fragment>
                `
            );
        };
        material.customProgramCacheKey = () => `stylized-surface-v1-${strength}`;
        material.needsUpdate = true;
    }
    applyStylizedSurface(matBuilding, 0.1);
    applyStylizedSurface(matBuildingAlt, 0.085);
    applyStylizedSurface(matRoof, 0.07);
    applyStylizedSurface(matAccentSoft, 0.06);
    applyStylizedSurface(matPlant, 0.12);

    scene.fog = new THREE.FogExp2(palette[state.theme].fog, state.theme === "paper" ? 0.008 : 0.014);

    const ambient = new THREE.HemisphereLight(0xdbe7ff, 0x141821, state.theme === "paper" ? 2.4 : 1.6);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(state.theme === "paper" ? 0xfff7e4 : 0xfff3ba, 3.2);
    sun.position.set(15, 30, 18);
    sun.castShadow = shadowsEnabled;
    const shadowMapSize = Math.min(state.compact ? 1024 : 2048, maxTextureSize);
    sun.shadow.mapSize.set(shadowMapSize, shadowMapSize);
    sun.shadow.camera.left = -24;
    sun.shadow.camera.right = 24;
    sun.shadow.camera.top = 24;
    sun.shadow.camera.bottom = -24;
    sun.shadow.bias = -0.00018;
    sun.shadow.normalBias = 0.025;
    sun.shadow.radius = 4;
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
        mesh.castShadow = shadowsEnabled;
        mesh.receiveShadow = true;
        return mesh;
    }

    const softGeometryCache = new Map();
    function softBlockGeometry(width, height, depth, requestedRadius = 0.18) {
        const radius = Math.min(requestedRadius, width * 0.12, height * 0.12, depth * 0.12);
        const key = [width, height, depth, radius].map((value) => value.toFixed(3)).join(":");
        if (softGeometryCache.has(key)) return softGeometryCache.get(key);
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
            steps: 1,
            bevelEnabled: true,
            bevelSegments: 1,
            bevelSize: radius * 0.42,
            bevelThickness: radius * 0.42,
            curveSegments: 2
        });
        geometry.translate(0, 0, -depth / 2);
        geometry.computeVertexNormals();
        softGeometryCache.set(key, geometry);
        return geometry;
    }

    function softBlock(width, height, depth, material, x = 0, y = height / 2, z = 0, radius = 0.18) {
        const mesh = new THREE.Mesh(softBlockGeometry(width, height, depth, radius), material);
        mesh.position.set(x, y, z);
        mesh.castShadow = shadowsEnabled;
        mesh.receiveShadow = true;
        return mesh;
    }

    const taperedGeometryCache = new Map();
    function taperedBlock(width, height, depth, material, x, y, z, topScale = 0.86, sides = 8) {
        const key = [height, topScale, sides].join(":");
        let geometry = taperedGeometryCache.get(key);
        if (!geometry) {
            geometry = new THREE.CylinderGeometry(0.5 * topScale, 0.5, height, sides, 1, false);
            geometry.rotateY(Math.PI / sides);
            taperedGeometryCache.set(key, geometry);
        }
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.scale.set(width, 1, depth);
        mesh.castShadow = shadowsEnabled;
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
            edges.rotation.set(0, 0, 0);
            edges.scale.set(1, 1, 1);
            mesh.add(edges);
        } else {
            parent.add(edges);
        }
        return mesh;
    }

    function detailBox(group, width, height, depth, material, x, y, z, outlined = false) {
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
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.105, 0.15, bodyHeight, 10),
            options.material || matCool
        );
        body.position.y = bodyHeight / 2;
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

    const portalOffsets = {
        tower: -1.15,
        lab: -1.85,
        workshop: 1.35,
        library: 0,
        apartment: -1,
        archive: 0,
        radio: 0.65,
        photo: -1.15
    };
    function addStoryEntrance(group, district) {
        const x = portalOffsets[district.style] || 0;
        const front = district.depth / 2 + 0.16;
        const doorMaterial = district.style === "library" || district.style === "apartment"
            ? matAccentSoft
            : matBuildingAlt;
        const door = softBlock(0.92, 1.45, 0.18, doorMaterial, x, 1.28, front, 0.2);
        const canopy = softBlock(1.48, 0.18, 0.82, matAccent, x, 2.05, front + 0.18, 0.12);
        const step = softBlock(1.55, 0.14, 0.72, matRoof, x, 0.69, front + 0.38, 0.1);
        canopy.rotation.x = -0.1;
        door.userData.decorative = true;
        canopy.userData.decorative = true;
        step.userData.decorative = true;
        group.add(door, canopy, step);
    }

    const barrelRoofGeometry = new THREE.CylinderGeometry(1, 1, 1, 24, 1, false, 0, Math.PI);
    function addBarrelRoof(group, width, depth, y, radius, material) {
        const roof = new THREE.Mesh(barrelRoofGeometry, material);
        roof.position.set(0, y, 0);
        roof.rotation.x = Math.PI / 2;
        roof.scale.set(width / 2, depth, radius);
        roof.castShadow = shadowsEnabled;
        roof.userData.decorative = true;
        group.add(roof);
        return roof;
    }

    const domeRoofGeometry = new THREE.SphereGeometry(1, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    function addDomeRoof(group, width, depth, y, height, material) {
        const roof = new THREE.Mesh(domeRoofGeometry, material);
        roof.position.set(0, y, 0);
        roof.scale.set(width / 2, height, depth / 2);
        roof.castShadow = shadowsEnabled;
        roof.userData.decorative = true;
        group.add(roof);
        return roof;
    }

    const themeDetailBoxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const districtThemeLayers = [];

    function addInstancedDetails(parent, transforms, material, castShadow = false) {
        if (!transforms.length) return null;
        const mesh = new THREE.InstancedMesh(themeDetailBoxGeometry, material, transforms.length);
        const dummy = new THREE.Object3D();
        transforms.forEach((transform, index) => {
            dummy.position.set(transform.x, transform.y, transform.z);
            dummy.rotation.set(transform.rx || 0, transform.ry || 0, transform.rz || 0);
            dummy.scale.set(transform.sx, transform.sy, transform.sz);
            dummy.updateMatrix();
            mesh.setMatrixAt(index, dummy.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
        mesh.castShadow = castShadow && shadowsEnabled;
        mesh.receiveShadow = castShadow;
        mesh.userData.decorative = true;
        parent.add(mesh);
        return mesh;
    }

    function addThemeDetail(parent, geometry, material, x, y, z, rotation = {}) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.rotation.set(rotation.x || 0, rotation.y || 0, rotation.z || 0);
        mesh.castShadow = material !== cyberEdgeMaterial && material !== cyberSignalMaterial
            && shadowsEnabled;
        mesh.userData.decorative = true;
        parent.add(mesh);
        return mesh;
    }

    function addThemedArchitecture(group, district) {
        const cyber = new THREE.Group();
        const paper = new THREE.Group();
        cyber.name = `${district.id}-cyber-architecture`;
        paper.name = `${district.id}-paper-architecture`;
        cyber.visible = state.theme !== "paper";
        paper.visible = state.theme === "paper";
        group.add(cyber, paper);

        const width = district.width;
        const height = district.height;
        const depth = district.depth;
        const front = depth / 2 + 0.34;
        const roofY = height + 0.72;
        const entranceX = portalOffsets[district.style] || 0;
        const cyberBars = [];
        const paperBars = [];

        [-1, 1].forEach((side) => {
            cyberBars.push({
                x: side * (width / 2 + 0.08),
                y: height * 0.5 + 0.62,
                z: front,
                sx: 0.075,
                sy: Math.max(2.4, height * 0.78),
                sz: 0.075
            });
        });
        for (let band = 1; band <= 3; band++) {
            cyberBars.push({
                x: 0,
                y: 0.72 + band * height / 4,
                z: front + 0.015,
                sx: width * 0.78,
                sy: 0.052,
                sz: 0.06
            });
        }
        cyberBars.push(
            { x: entranceX - 0.58, y: 1.42, z: front + 0.12, sx: 0.045, sy: 1.62, sz: 0.045 },
            { x: entranceX + 0.58, y: 1.42, z: front + 0.12, sx: 0.045, sy: 1.62, sz: 0.045 },
            { x: entranceX, y: 2.2, z: front + 0.12, sx: 1.2, sy: 0.05, sz: 0.045 }
        );
        addInstancedDetails(cyber, cyberBars, cyberEdgeMaterial);

        const cyberPanel = addThemeDetail(
            cyber,
            themeDetailBoxGeometry,
            cyberPanelMaterial,
            entranceX + (entranceX > 0 ? -1.15 : 1.15),
            2.55,
            front + 0.08
        );
        cyberPanel.scale.set(0.72, 0.42, 0.075);
        const panelCore = addThemeDetail(
            cyber,
            themeDetailBoxGeometry,
            district.style === "photo" || district.style === "workshop"
                ? cyberSignalMaterial
                : cyberEdgeMaterial,
            cyberPanel.position.x,
            2.55,
            front + 0.17
        );
        panelCore.scale.set(0.46, 0.065, 0.028);

        const cyberCrown = new THREE.Group();
        cyberCrown.position.set(
            district.style === "lab" ? width * 0.22 : 0,
            roofY,
            district.style === "photo" ? -depth * 0.12 : 0
        );
        cyberCrown.userData.decorative = true;
        cyber.add(cyberCrown);
        if (district.style === "tower" || district.style === "radio") {
            const mast = addThemeDetail(
                cyberCrown,
                new THREE.CylinderGeometry(0.045, 0.075, 1.35, 8),
                cyberEdgeMaterial,
                0,
                0.55,
                0
            );
            mast.castShadow = false;
            [0.38, 0.62].forEach((radius, index) => {
                const signal = addThemeDetail(
                    cyberCrown,
                    new THREE.TorusGeometry(radius, 0.035, 5, 16, Math.PI),
                    index ? cyberSignalMaterial : cyberEdgeMaterial,
                    0,
                    1.1 + index * 0.12,
                    0,
                    { x: Math.PI / 2 }
                );
                signal.userData.themeSpin = index ? -1 : 1;
            });
        } else if (district.style === "lab" || district.style === "photo") {
            const core = addThemeDetail(
                cyberCrown,
                new THREE.IcosahedronGeometry(0.3, 0),
                cyberSignalMaterial,
                0,
                0.42,
                0
            );
            core.userData.themeSpin = 1;
            const orbit = addThemeDetail(
                cyberCrown,
                new THREE.TorusGeometry(0.54, 0.035, 6, 18),
                cyberEdgeMaterial,
                0,
                0.42,
                0,
                { x: Math.PI / 2.8, z: 0.35 }
            );
            orbit.userData.themeSpin = -1;
        } else if (district.style === "workshop" || district.style === "archive") {
            [-0.42, 0.42].forEach((x, index) => {
                const stack = addThemeDetail(
                    cyberCrown,
                    new THREE.CylinderGeometry(0.13, 0.19, 0.92 + index * 0.18, 8),
                    index ? cyberSignalMaterial : cyberEdgeMaterial,
                    x,
                    0.46,
                    0
                );
                stack.userData.themePulse = index * 0.8;
            });
        } else {
            addInstancedDetails(cyberCrown, [
                { x: -0.72, y: 0.45, z: -0.42, sx: 0.06, sy: 0.9, sz: 0.06 },
                { x: 0.72, y: 0.45, z: -0.42, sx: 0.06, sy: 0.9, sz: 0.06 },
                { x: -0.72, y: 0.45, z: 0.42, sx: 0.06, sy: 0.9, sz: 0.06 },
                { x: 0.72, y: 0.45, z: 0.42, sx: 0.06, sy: 0.9, sz: 0.06 },
                { x: 0, y: 0.9, z: -0.42, sx: 1.5, sy: 0.06, sz: 0.06 },
                { x: 0, y: 0.9, z: 0.42, sx: 1.5, sy: 0.06, sz: 0.06 }
            ], cyberEdgeMaterial);
        }

        for (let level = 1; level <= 3; level++) {
            paperBars.push({
                x: 0,
                y: 0.7 + level * height / 4,
                z: front - 0.01,
                sx: width + 0.34,
                sy: 0.11,
                sz: 0.16
            });
        }
        [-0.34, 0.34].forEach((offset) => {
            paperBars.push({
                x: entranceX + offset,
                y: 1.43,
                z: front + 0.06,
                sx: 0.085,
                sy: 1.55,
                sz: 0.12
            });
        });
        paperBars.push(
            { x: entranceX, y: 2.18, z: front + 0.28, sx: 1.45, sy: 0.16, sz: 0.78, rz: -0.08 },
            { x: -width * 0.34, y: roofY + 0.45, z: 0, sx: 0.08, sy: 0.9, sz: depth * 0.45 },
            { x: width * 0.34, y: roofY + 0.45, z: 0, sx: 0.08, sy: 0.9, sz: depth * 0.45 },
            { x: 0, y: roofY + 0.9, z: -depth * 0.22, sx: width * 0.72, sy: 0.08, sz: 0.08 },
            { x: 0, y: roofY + 0.9, z: depth * 0.22, sx: width * 0.72, sy: 0.08, sz: 0.08 }
        );
        addInstancedDetails(paper, paperBars, paperTrimMaterial, true);

        const awningFace = addThemeDetail(
            paper,
            themeDetailBoxGeometry,
            paperWarmMaterial,
            entranceX,
            2.14,
            front + 0.37,
            { z: -0.08 }
        );
        awningFace.scale.set(1.05, 0.055, 0.62);

        if (["lab", "library", "apartment", "photo"].includes(district.style)) {
            addPlanter(paper, -width * 0.28, roofY + 0.18, depth * 0.18, 0.72);
            addPlanter(paper, width * 0.28, roofY + 0.18, depth * 0.18, 0.72);
        } else {
            [-0.42, 0.42].forEach((x, index) => {
                addThemeDetail(
                    paper,
                    new THREE.CylinderGeometry(0.13, 0.18, 0.72 + index * 0.16, 8),
                    index ? paperWarmMaterial : paperTrimMaterial,
                    x,
                    roofY + 0.36,
                    -depth * 0.12
                );
            });
        }

        districtThemeLayers.push({ cyber, paper, crown: cyberCrown });
    }

    const semanticIdentityAnimated = [];
    const identityRingGeometry = new THREE.TorusGeometry(0.72, 0.085, 6, 18);
    const identitySphereGeometry = new THREE.IcosahedronGeometry(0.34, 1);
    const identityDiskGeometry = new THREE.CylinderGeometry(0.42, 0.42, 0.14, 14);

    function addSemanticIdentity(group, district) {
        const identity = new THREE.Group();
        identity.name = `${district.id}-semantic-identity`;
        identity.userData.decorative = true;
        group.add(identity);

        if (district.style === "lab") {
            identity.position.set(-1.25, district.height + 1.72, 0.15);
            const nucleus = addThemeDetail(identity, identitySphereGeometry, matAccent, 0, 0, 0);
            nucleus.scale.setScalar(1.08);
            [
                { x: 0.15, y: 0, z: 0.55 },
                { x: Math.PI / 2, y: 0.45, z: 0 },
                { x: 0.65, y: -0.42, z: Math.PI / 2 }
            ].forEach((rotation, index) => {
                const orbit = addThemeDetail(
                    identity,
                    identityRingGeometry,
                    index === 1 ? matAccent : matCool,
                    0,
                    0,
                    0,
                    rotation
                );
                orbit.scale.setScalar(1 + index * 0.08);
                semanticIdentityAnimated.push({ object: orbit, speed: index % 2 ? -0.34 : 0.28 });
            });
        } else if (district.style === "workshop") {
            identity.position.set(0.8, district.height + 1.42, 0.45);
            identity.rotation.x = -0.3;
            const gear = addThemeDetail(identity, identityRingGeometry, matAccent, 0, 0, 0);
            gear.scale.setScalar(1.2);
            const spokes = [];
            for (let spoke = 0; spoke < 8; spoke++) {
                spokes.push({
                    x: 0,
                    y: 0,
                    z: 0,
                    sx: 1.32,
                    sy: 0.085,
                    sz: 0.08,
                    rz: spoke * Math.PI / 4
                });
            }
            addInstancedDetails(identity, spokes, matRoof, true);
            const hub = addThemeDetail(identity, identityDiskGeometry, matCool, 0, 0, 0.08, { x: Math.PI / 2 });
            hub.scale.setScalar(0.52);
            semanticIdentityAnimated.push({ object: gear, speed: 0.16 });
        } else if (district.style === "archive") {
            identity.position.set(0, district.height + 1.28, 0);
            const cabinet = addThemeDetail(identity, themeDetailBoxGeometry, matBuildingAlt, 0, 0, 0);
            cabinet.scale.set(2.05, 1.45, 1.32);
            const drawerBars = [];
            [-0.42, 0, 0.42].forEach((y) => {
                drawerBars.push(
                    { x: 0, y, z: 0.69, sx: 1.62, sy: 0.065, sz: 0.055 },
                    { x: 0, y, z: -0.69, sx: 1.62, sy: 0.065, sz: 0.055 }
                );
            });
            drawerBars.push(
                { x: 0, y: 0.88, z: -0.18, sx: 0.82, sy: 0.28, sz: 0.42 },
                { x: 0, y: 0.12, z: 0.73, sx: 0.48, sy: 0.09, sz: 0.04 }
            );
            addInstancedDetails(identity, drawerBars, matAccent, true);
            const vaultMark = addThemeDetail(identity, identityRingGeometry, matCool, 0, 0.05, 0.76);
            vaultMark.scale.setScalar(0.48);
        } else if (district.style === "photo") {
            identity.position.set(0.2, district.height + 1.48, 0.25);
            identity.rotation.x = -0.42;
            [-0.72, 0.72].forEach((x, index) => {
                const reel = addThemeDetail(identity, identityRingGeometry, index ? matAccent : matCool, x, 0, 0);
                reel.scale.setScalar(0.72);
                const hub = addThemeDetail(identity, identityDiskGeometry, matRoof, x, 0, 0.06, { x: Math.PI / 2 });
                hub.scale.setScalar(0.4);
                semanticIdentityAnimated.push({ object: reel, speed: index ? -0.2 : 0.2 });
            });
            addInstancedDetails(identity, [
                { x: 0, y: -0.54, z: 0, sx: 1.45, sy: 0.08, sz: 0.08 },
                { x: 0, y: 0.54, z: 0, sx: 1.45, sy: 0.08, sz: 0.08 }
            ], matAccentSoft, true);
        }
    }

    const roads = [
        softBlock(32, 0.06, 2.1, matRoad, 0, 0.21, 0, 0.78),
        softBlock(2.1, 0.06, 32, matRoad, 0, 0.22, 0, 0.78),
        softBlock(25, 0.06, 1.2, matRoad, -2, 0.23, 9.8, 0.48)
    ];
    roads.forEach((road) => world.add(road));

    const walkingPaths = [
        [
            [-12.5, -5.8], [-9.2, -3.8], [-6.5, -2.4], [-3.2, -1.6]
        ],
        [
            [2.2, 2.4], [4.8, 3.2], [6.8, 5.4], [7.1, 8.2]
        ],
        [
            [-10.4, 10.7], [-7.5, 9.6], [-5.2, 8.3], [-2.8, 7.9]
        ]
    ];
    walkingPaths.forEach((points) => {
        const curve = new THREE.CatmullRomCurve3(
            points.map(([x, z]) => new THREE.Vector3(x, 0.31, z))
        );
        const path = new THREE.Mesh(
            new THREE.TubeGeometry(curve, 28, 0.28, 8, false),
            matGroundTop
        );
        path.scale.y = 0.18;
        path.receiveShadow = true;
        paperLayer.add(path);
    });

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
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.11, 0.16, 0.58, 10),
            citizenColors[index % citizenColors.length]
        );
        body.position.y = 0.45;
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), matGroundTop);
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
        const transforms = [];
        const addWindow = (x, y, z, rotationY = 0) => {
            transforms.push({ x, y, z, rotationY });
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
        const windows = new THREE.InstancedMesh(windowGeometry, matWindow, transforms.length);
        windows.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        windows.userData.decorative = true;
        const dummy = new THREE.Object3D();
        transforms.forEach((transform, index) => {
            dummy.position.set(transform.x, transform.y, transform.z);
            dummy.rotation.set(0, transform.rotationY, 0);
            dummy.scale.setScalar(1);
            dummy.updateMatrix();
            windows.setMatrixAt(index, dummy.matrix);
        });
        windows.instanceMatrix.needsUpdate = true;
        windows.computeBoundingSphere();
        group.add(windows);
        group.userData.windowInstances = { mesh: windows, transforms };
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
        const landscapedPatch = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.54, 0.16, 28),
            matGroundTop
        );
        landscapedPatch.position.set(platformX, 0.12, 0.55);
        landscapedPatch.scale.set(
            district.width + platformWidth + 0.8,
            1,
            district.depth + platformDepth + 0.8
        );
        landscapedPatch.receiveShadow = true;
        group.add(landscapedPatch);
        const podium = softBlock(
            district.width + platformWidth,
            0.55,
            district.depth + platformDepth,
            matRoof,
            platformX,
            0.275,
            0.55,
            0.16
        );
        addOutline(podium);
        group.add(podium);

        let main;
        if (district.style === "tower") {
            main = taperedBlock(district.width, 6.2, district.depth, matBuilding, 0, 3.65, 0, 0.9, 8);
            group.add(main);
            const middleTower = taperedBlock(3.45, 2.8, 3.45, matBuildingAlt, 0, 8.15, 0, 0.86, 8);
            const upperTower = taperedBlock(2.55, 1.8, 2.55, matBuilding, 0, 10.45, 0, 0.78, 8);
            addOutline(middleTower);
            addOutline(upperTower);
            group.add(middleTower, upperTower);
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
            main = softBlock(district.width, district.height, district.depth, matBuildingAlt, 0, district.height / 2 + 0.55, 0, 0.34);
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
            main = softBlock(district.width, district.height, district.depth, matBuildingAlt, 0, district.height / 2 + 0.55, 0, 0.18);
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
            main = softBlock(district.width, district.height, district.depth, matBuilding, 0, district.height / 2 + 0.55, 0, 0.3);
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
            main = softBlock(district.width, district.height, district.depth, matBuildingAlt, 0, district.height / 2 + 0.55, 0, 0.28);
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
            main = softBlock(district.width, district.height, district.depth, matBuilding, 0, district.height / 2 + 0.55, 0, 0.32);
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
            main = softBlock(district.width, district.height, district.depth, matBuildingAlt, 0, district.height / 2 + 0.55, 0, 0.22);
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
            main = softBlock(district.width, district.height, district.depth, matBuilding, 0, district.height / 2 + 0.55, 0, 0.26);
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

        addStoryEntrance(group, district);
        const entryAnchor = new THREE.Object3D();
        entryAnchor.position.set(
            portalOffsets[district.style] || 0,
            1.42,
            district.depth / 2 + 0.82
        );
        entryAnchor.userData.decorative = true;
        group.userData.entryAnchor = entryAnchor;
        group.add(entryAnchor);
        if (district.style === "apartment") {
            addDomeRoof(group, district.width * 0.82, district.depth * 0.78, district.height + 0.78, 0.72, matRoof);
        } else if (district.style === "archive") {
            addBarrelRoof(group, district.width * 0.88, district.depth * 0.92, district.height + 0.55, 0.72, matRoof);
        } else if (district.style === "radio") {
            addDomeRoof(group, district.width * 0.9, district.depth * 0.86, district.height + 0.58, 0.62, matAccentSoft);
        }
        addThemedArchitecture(group, district);
        addSemanticIdentity(group, district);

        addOutline(main);
        addWindows(group, district, district.width, district.height, district.depth);

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

    const contactShadowCanvas = canvasFactory();
    contactShadowCanvas.width = 256;
    contactShadowCanvas.height = 256;
    const contactShadowContext = contactShadowCanvas.getContext("2d");
    const contactShadowGradient = contactShadowContext.createRadialGradient(128, 128, 18, 128, 128, 126);
    contactShadowGradient.addColorStop(0, "rgba(0, 0, 0, 0.72)");
    contactShadowGradient.addColorStop(0.58, "rgba(0, 0, 0, 0.28)");
    contactShadowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    contactShadowContext.fillStyle = contactShadowGradient;
    contactShadowContext.fillRect(0, 0, 256, 256);
    const contactShadowTexture = new THREE.CanvasTexture(contactShadowCanvas);
    const contactShadowMaterial = new THREE.MeshBasicMaterial({
        map: contactShadowTexture,
        transparent: true,
        opacity: state.theme === "paper" ? 0.2 : 0.4,
        depthWrite: false,
        toneMapped: false
    });
    const districtContactShadows = new THREE.InstancedMesh(
        new THREE.PlaneGeometry(1, 1),
        contactShadowMaterial,
        districts.length
    );
    const shadowDummy = new THREE.Object3D();
    districts.forEach((district, index) => {
        shadowDummy.position.set(district.x, 0.315, district.z + 0.4);
        shadowDummy.rotation.set(-Math.PI / 2, 0, 0);
        shadowDummy.scale.set(district.width + 3, district.depth + 2.6, 1);
        shadowDummy.updateMatrix();
        districtContactShadows.setMatrixAt(index, shadowDummy.matrix);
    });
    districtContactShadows.instanceMatrix.needsUpdate = true;
    districtContactShadows.renderOrder = 2;
    world.add(districtContactShadows);

    function addInstancedAsset(geometry, material, transforms, parent = world) {
        const instances = new THREE.InstancedMesh(geometry, material, transforms.length);
        const dummy = new THREE.Object3D();
        transforms.forEach(({ position, scale = [1, 1, 1], rotation = 0 }, index) => {
            dummy.position.set(...position);
            dummy.rotation.set(0, rotation, 0);
            dummy.scale.set(...scale);
            dummy.updateMatrix();
            instances.setMatrixAt(index, dummy.matrix);
        });
        instances.instanceMatrix.needsUpdate = true;
        instances.castShadow = shadowsEnabled;
        instances.receiveShadow = true;
        instances.userData.decorative = true;
        parent.add(instances);
        return instances;
    }

    const crateTransforms = [
        [3.1, -7.7, 0.1, 0.72], [4.0, -7.55, -0.22, 0.8], [7.6, -4.4, 0.18, 0.68],
        [7.15, -3.65, -0.12, 0.76], [-6.2, -5.15, 0.1, 0.7], [-5.65, -5.6, -0.2, 0.64],
        [-10.9, -1.5, 0.2, 0.72], [-11.2, -2.2, -0.12, 0.62], [-6.7, 6.8, 0.18, 0.68],
        [10.8, 4.3, -0.1, 0.72]
    ].map(([x, z, rotation, scale]) => ({
        position: [x, 0.54, z],
        scale: [scale, scale * 0.72, scale],
        rotation
    }));
    addInstancedAsset(new THREE.BoxGeometry(0.8, 0.8, 0.8), matAccentSoft, crateTransforms);

    const barrelTransforms = [
        [3.55, -7.1], [4.35, -6.95], [7.75, -5.2], [7.8, -6],
        [-7.4, -6.1], [-9.8, 3.1], [-7.4, 7], [11.2, 0.4]
    ].map(([x, z], index) => ({
        position: [x, 0.64, z],
        scale: [0.42, 0.68 + (index % 2) * 0.08, 0.42],
        rotation: index * 0.31
    }));
    addInstancedAsset(new THREE.CylinderGeometry(0.5, 0.56, 1, 12), matRoof, barrelTransforms);

    const stoneTransforms = Array.from({ length: state.compact ? 10 : 20 }, (_, index) => {
        const angle = index * 2.399;
        const radius = 11.8 + (index % 4) * 0.85;
        const scale = 0.22 + (index % 3) * 0.07;
        return {
            position: [Math.cos(angle) * radius, 0.36, Math.sin(angle) * radius * 0.92],
            scale: [scale * 1.3, scale, scale],
            rotation: angle
        };
    });
    addInstancedAsset(new THREE.DodecahedronGeometry(1, 0), matAccentSoft, stoneTransforms, paperLayer);

    const bollardTransforms = [
        [-2.8, -1.7], [-2.8, 1.7], [2.8, -1.7], [2.8, 1.7],
        [-1.7, -3.7], [1.7, -3.7], [-1.7, 3.7], [1.7, 3.7],
        [6.4, 8.2], [8.2, 7.2], [-8.2, 8.8], [-10.2, 8.8]
    ].map(([x, z]) => ({
        position: [x, 0.62, z],
        scale: [0.13, 0.72, 0.13]
    }));
    addInstancedAsset(new THREE.CylinderGeometry(0.5, 0.62, 1, 10), matAccent, bollardTransforms, paperLayer);

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
    const fillerBudget = state.compact ? 16 : 30;
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
    fillerMesh.castShadow = shadowsEnabled;
    fillerMesh.receiveShadow = true;
    world.add(fillerMesh);

    const treeTrunkMaterial = makeMaterial("line");
    const plantedTrees = [
        [-6, 2.7], [-5, 4.1], [6.8, 2.7], [7.8, -1.7], [-12.5, -8.5],
        [11.5, -8.4], [12.7, 8.5], [-6.5, 11.4], [2.6, 11.5], [-13.8, 2.2],
        [-10.8, 5.6], [10.8, -2.7], [5.9, 12.6], [-3.6, -12.8]
    ];
    const perimeterTrees = Array.from({ length: state.compact ? 14 : 28 }, (_, index) => {
        const angle = index / (state.compact ? 14 : 28) * Math.PI * 2 + 0.13;
        const radius = 14.4 + (index % 3) * 0.6;
        return [Math.cos(angle) * radius, Math.sin(angle) * radius * 0.92];
    });
    const treePositions = [...plantedTrees, ...perimeterTrees].filter(([x, z]) => (
        !reserved.some((item) => Math.hypot(x - item.x, z - item.z) < item.radius * 0.78)
    ));
    const trunkTransforms = treePositions.map(([x, z], index) => ({
        position: [x, 0.83, z],
        scale: [0.16 + (index % 3) * 0.025, 1.05 + (index % 4) * 0.12, 0.16 + (index % 3) * 0.025],
        rotation: index * 0.41
    }));
    const lowerCrownTransforms = treePositions.map(([x, z], index) => ({
        position: [x, 1.72 + (index % 4) * 0.08, z],
        scale: [0.62 + (index % 3) * 0.08, 0.72 + (index % 2) * 0.1, 0.6 + ((index + 1) % 3) * 0.07],
        rotation: index * 0.73
    }));
    const upperCrownTransforms = treePositions.map(([x, z], index) => ({
        position: [x + ((index % 3) - 1) * 0.11, 2.18 + (index % 4) * 0.08, z],
        scale: [0.42 + (index % 2) * 0.06, 0.52, 0.4 + ((index + 1) % 2) * 0.06],
        rotation: index * 0.51
    }));
    addInstancedAsset(new THREE.CylinderGeometry(0.5, 0.68, 1, 8), treeTrunkMaterial, trunkTransforms, paperLayer);
    addInstancedAsset(new THREE.DodecahedronGeometry(1, 1), matPlant, lowerCrownTransforms, paperLayer);
    addInstancedAsset(new THREE.DodecahedronGeometry(1, 0), matPlant, upperCrownTransforms, paperLayer);

    const shrubPositions = [
        [-5.2, 2.6], [-4.7, 3.1], [6.2, 2.4], [7.2, 2.3],
        [9.8, 4.9], [10.5, 4.4], [3.2, 10.2], [4.1, 10.6],
        [-4.8, 10.1], [-5.6, 9.8], [-11.8, 6.9], [-12.5, 6.2],
        [-6.2, -7.8], [-5.4, -8.3], [8.5, -7.5], [9.2, -6.9]
    ];
    const shrubTransforms = shrubPositions.map(([x, z], index) => ({
        position: [x, 0.54, z],
        scale: [0.34 + (index % 3) * 0.06, 0.28 + (index % 2) * 0.06, 0.34],
        rotation: index * 0.62
    }));
    addInstancedAsset(new THREE.IcosahedronGeometry(1, 1), matPlant, shrubTransforms, paperLayer);

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

    function createCozyVehicle(material, scale = 1) {
        const vehicle = new THREE.Group();
        const body = softBlock(0.88 * scale, 0.3 * scale, 0.48 * scale, material, 0, 0, 0, 0.12);
        const cabin = softBlock(0.42 * scale, 0.25 * scale, 0.4 * scale, matCool, 0.08 * scale, 0.22 * scale, 0, 0.1);
        const bumper = softBlock(0.16 * scale, 0.16 * scale, 0.5 * scale, matRoof, -0.48 * scale, -0.03, 0, 0.05);
        body.userData.decorative = true;
        cabin.userData.decorative = true;
        bumper.userData.decorative = true;
        vehicle.add(body, cabin, bumper);
        return vehicle;
    }

    const carMaterial = makeMaterial("accent");
    const car = createCozyVehicle(carMaterial);
    car.position.set(-15, 0.53, 0);
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

    const focusTextureCanvas = canvasFactory();
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
        const vehicle = createCozyVehicle(paperCarColors[index % paperCarColors.length], 0.86 + (index % 3) * 0.06);
        vehicle.position.y = 0.51;
        vehicle.rotation.y = rotation;
        vehicle.userData.axis = axis;
        vehicle.userData.lane = lane;
        vehicle.userData.offset = offset;
        vehicle.userData.routeStart = axis === "x" && lane > 8 ? -14.5 : -15;
        vehicle.userData.routeEnd = axis === "x" && lane > 8 ? 10.5 : 15;
        vehicle.userData.direction = index % 2 ? -1 : 1;
        vehicle.userData.speed = 0.055 + (index % 3) * 0.008;
        paperLayer.add(vehicle);
        paperVehicles.push(vehicle);
    });
    const parkedCamper = createCozyVehicle(matAccentSoft, 1.35);
    parkedCamper.position.set(7.2, 0.58, 11.4);
    parkedCamper.rotation.y = -0.34;
    const camperRoof = softBlock(0.9, 0.22, 0.58, matGroundTop, 0.08, 0.38, 0, 0.12);
    camperRoof.userData.decorative = true;
    parkedCamper.add(camperRoof);
    paperLayer.add(parkedCamper);
    car.userData.axis = "x";
    car.userData.lane = 0.58;
    car.userData.offset = 0.9;
    car.userData.routeStart = -15;
    car.userData.routeEnd = 15;
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
    const focusAimPosition = new THREE.Vector3();
    const focusLightPosition = new THREE.Vector3();
    const focusAuraPosition = new THREE.Vector3();
    const focusAuraScale = new THREE.Vector3(0.1, 0.1, 1);
    const windowAnimationDummy = new THREE.Object3D();
    let hoveredGroup = null;
    let targetRotation = world.rotation.y;
    let focusStrength = 0;
    let elapsed = 0;
    let disposed = false;

    this.scene = scene;
    this.world = world;

    this.getDistrictCount = () => districtGroups.length;

    this.getDistrictGroup = (index) => {
        const count = districtGroups.length;
        return count ? districtGroups[(index + count) % count] : null;
    };

    this.getDistrict = (group) => group?.userData.district || null;

    this.getRotation = () => world.rotation.y;

    this.setRotation = (rotation, immediate = false) => {
        targetRotation = rotation;
        if (immediate) world.rotation.y = rotation;
    };

    this.rotationForDistrict = (district) => -Math.atan2(district.x, district.z) + 0.25;

    this.pick = (pointer, camera) => {
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(interactiveMeshes, false)[0];
        return hit?.object.userData.districtGroup || null;
    };

    this.setHovered = (group) => {
        hoveredGroup = group || null;
    };

    this.getHovered = () => hoveredGroup;

    this.getEntryData = (group, target = new THREE.Vector3()) => {
        if (!group?.userData.entryAnchor) return null;
        world.updateMatrixWorld(true);
        group.userData.entryAnchor.getWorldPosition(target);
        return {
            district: group.userData.district,
            group,
            position: target
        };
    };

    this.applyTheme = (theme) => {
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
        scene.fog.density = paperMode ? 0.008 : 0.014;
        ambient.intensity = paperMode ? 1.9 : 0.9;
        sun.intensity = paperMode ? 3.6 : 3;
        sun.color.setHex(paperMode ? 0xfff7e4 : 0x9fb9ff);
        fill.color.setHex(colors.cool);
        fill.intensity = paperMode ? 0.82 : 4.2;
        rim.color.setHex(paperMode ? 0x8c806f : colors.cool);
        rim.intensity = paperMode ? 0.65 : 2.2;
        matWindow.emissiveIntensity = paperMode ? 0.16 : 2.8;
        contactShadowMaterial.opacity = paperMode ? 0.2 : 0.4;
        cyberLayer.visible = !paperMode;
        paperLayer.visible = paperMode;
        districtThemeLayers.forEach((layers) => {
            layers.cyber.visible = !paperMode;
            layers.paper.visible = paperMode;
        });
        if (paperMode) hoveredGroup = null;
        return {
            background: colors.background,
            exposure: paperMode ? 1.08 : 1.16,
            world: paperMode ? "paper" : "cyber",
            population: paperMode
                ? paperCommuters.length + paperPlazaPeople.length
                : cyberCitizens.length
        };
    };

    this.update = (delta, options = {}) => {
        if (disposed) return;
        elapsed += delta;
        world.rotation.y += (targetRotation - world.rotation.y) * 0.055;

        districtGroups.forEach((group) => {
            const targetHover = group === hoveredGroup ? 1 : 0;
            group.userData.hover += (targetHover - group.userData.hover) * 0.12;
            group.position.y = group.userData.baseY + group.userData.hover * 0.34;
        });

        const focusedDistrict = state.theme === "signature"
            ? hoveredGroup?.userData.district
            : null;
        focusStrength += ((focusedDistrict ? 1 : 0) - focusStrength)
            * (1 - Math.exp(-delta * (focusedDistrict ? 4.2 : 2.2)));
        if (focusedDistrict) {
            const focusHeight = Math.max(3.2, focusedDistrict.height * 0.56);
            focusAimPosition.set(focusedDistrict.x, focusHeight, focusedDistrict.z);
            focusLightPosition.set(
                focusedDistrict.x + 2.8,
                focusedDistrict.height + 11,
                focusedDistrict.z + 3.6
            );
            focusAuraPosition.copy(focusAimPosition);
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

        if (options.updateDecorations === false) return;

        const identityMotion = state.theme === "paper" ? 0.22 : 1;
        semanticIdentityAnimated.forEach(({ object, speed }) => {
            object.rotation.z += delta * speed * identityMotion;
        });

        districtGroups.forEach((group, index) => {
            const windowInstances = group.userData.windowInstances;
            windowInstances?.transforms.forEach((transform, windowIndex) => {
                const pulse = state.theme === "paper"
                    ? 0.92 + Math.sin(elapsed * 0.45 + index * 0.2) * 0.035
                    : 0.66 + Math.sin(elapsed * 2.8 + index + windowIndex * 0.47) * 0.28;
                windowAnimationDummy.position.set(transform.x, transform.y, transform.z);
                windowAnimationDummy.rotation.set(0, transform.rotationY, 0);
                windowAnimationDummy.scale.setScalar(pulse + group.userData.hover * 0.25);
                windowAnimationDummy.updateMatrix();
                windowInstances.mesh.setMatrixAt(windowIndex, windowAnimationDummy.matrix);
            });
            if (windowInstances) windowInstances.mesh.instanceMatrix.needsUpdate = true;
            (group.userData.signalRings || []).forEach((ring, ringIndex) => {
                const scale = state.theme === "paper"
                    ? 0.94
                    : 0.86 + Math.sin(elapsed * 2.6 + ringIndex) * 0.12;
                ring.scale.setScalar(scale);
            });
        });

        if (state.theme === "signature") {
            cyberEdgeMaterial.opacity = 0.78 + Math.sin(elapsed * 2.1) * 0.12;
            cyberSignalMaterial.opacity = 0.72 + Math.sin(elapsed * 2.8 + 0.8) * 0.18;
            districtThemeLayers.forEach((layers, layerIndex) => {
                layers.crown.traverse((object) => {
                    if (object.userData.themeSpin) {
                        object.rotation.y += delta * object.userData.themeSpin * 0.85;
                        object.rotation.z += delta * object.userData.themeSpin * 0.24;
                    }
                    if (object.userData.themePulse !== undefined) {
                        const pulse = 0.92
                            + Math.sin(elapsed * 2.4 + object.userData.themePulse + layerIndex) * 0.1;
                        object.scale.setScalar(pulse);
                    }
                });
            });
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
                    if (child.geometry?.type === "TorusGeometry") {
                        child.rotation.z += delta * (7 + index);
                    }
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
                burst.flash.scale.setScalar(visible ? Math.sin(progress * Math.PI) * 1.8 : 0);
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
                person.userData.visor.scale.x =
                    0.82 + Math.sin(elapsed * 3.4 + index * 0.7) * 0.18;
            });
        } else {
            paperVehicles.forEach((vehicle) => {
                const progress = (elapsed * vehicle.userData.speed + vehicle.userData.offset) % 1;
                const travel = vehicle.userData.direction > 0 ? progress : 1 - progress;
                const routeStart = vehicle.userData.routeStart ?? -15;
                const routeEnd = vehicle.userData.routeEnd ?? 15;
                const position = routeStart + travel * (routeEnd - routeStart);
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
        }
    };

    this.dispose = () => {
        if (disposed) return;
        disposed = true;
        const geometries = new Set();
        const materials = new Set();
        const textures = new Set();
        scene.traverse((object) => {
            if (object.geometry) geometries.add(object.geometry);
            const objectMaterials = Array.isArray(object.material)
                ? object.material
                : [object.material];
            objectMaterials.filter(Boolean).forEach((material) => {
                materials.add(material);
                Object.values(material).forEach((value) => {
                    if (value?.isTexture) textures.add(value);
                });
            });
        });
        Object.values(bakedSurfaces).forEach((texture) => textures.add(texture));
        textures.add(contactShadowTexture);
        textures.add(focusTexture);
        textures.forEach((texture) => texture.dispose());
        materials.forEach((material) => material.dispose());
        geometries.forEach((geometry) => geometry.dispose());
        scene.clear();
        softGeometryCache.clear();
        taperedGeometryCache.clear();
    };

    this.applyTheme(state.theme);
    }
}
