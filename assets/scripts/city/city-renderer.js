export class CityRenderer {
    constructor(THREE, options) {
        this.THREE = THREE;
        this.viewport = options.viewport;
        this.compact = Boolean(options.compact);
        this.disposed = false;
        this.quality = "high";
        this.renderCalls = 0;
        this.triangles = 0;
        this.sampledFrames = 0;
        this.sampledDuration = 0;
        this.slowFrameSamples = 0;

        this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 120);
        this.homePosition = new THREE.Vector3(28, 25, 31);
        this.introPosition = new THREE.Vector3(34, 33, 38);
        this.lookTarget = new THREE.Vector3(0, 2.4, 0);

        this.renderer = new THREE.WebGLRenderer({
            canvas: options.canvas,
            antialias: true,
            alpha: true,
            precision: "highp",
            powerPreference: "high-performance"
        });
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.shadowMap.enabled = innerWidth > 760;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        const deviceScale = devicePixelRatio || 1;
        this.maximumScale = this.compact
            ? Math.min(Math.max(deviceScale, 1.15), 1.35)
            : Math.min(Math.max(deviceScale, 1.35), 2);
        this.minimumScale = this.compact ? 1 : 1.25;
        this.activeScale = this.maximumScale;
        this.renderer.setPixelRatio(this.activeScale);

        this.resizeObserver = new ResizeObserver(() => this.resize());
        this.resizeObserver.observe(this.viewport);
        this.resize();
    }

    getCapabilities() {
        return {
            shadowsEnabled: this.renderer.shadowMap.enabled,
            maxAnisotropy: this.renderer.capabilities.getMaxAnisotropy(),
            maxTextureSize: this.renderer.capabilities.maxTextureSize
        };
    }

    resetCamera(intro = false) {
        this.camera.position.copy(intro ? this.introPosition : this.homePosition);
        this.lookTarget.set(0, 2.4, 0);
        this.camera.lookAt(this.lookTarget);
    }

    resize() {
        if (this.disposed) return;
        const width = this.viewport.clientWidth;
        const height = this.viewport.clientHeight;
        if (!width || !height) return;
        const wasAtHome = this.camera.position.distanceToSquared(this.homePosition) < 0.01;
        const wasAtIntro = this.camera.position.distanceToSquared(this.introPosition) < 0.01;
        this.renderer.setSize(width, height, false);
        this.camera.aspect = width / height;
        this.homePosition.set(
            width < 700 ? 32 : 28,
            width < 700 ? 28 : 25,
            width < 700 ? 35 : 31
        );
        this.introPosition.copy(this.homePosition).multiplyScalar(1.16);
        this.introPosition.y += width < 700 ? 3.5 : 4.5;
        if (wasAtHome) this.camera.position.copy(this.homePosition);
        else if (wasAtIntro) this.camera.position.copy(this.introPosition);
        this.camera.updateProjectionMatrix();
        if (wasAtHome || wasAtIntro) this.camera.lookAt(this.lookTarget);
    }

    setTheme(themeState) {
        if (this.disposed) return;
        this.renderer.toneMappingExposure = themeState.exposure;
        this.renderer.setClearColor(themeState.background, 0);
    }

    setQuality(quality) {
        if (this.disposed) return;
        const normalized = ["high", "balanced", "low"].includes(quality)
            ? quality
            : "high";
        this.quality = normalized;
        const offset = normalized === "high" ? 0 : normalized === "balanced" ? 0.25 : 0.5;
        this.activeScale = Math.max(this.minimumScale, this.maximumScale - offset);
        this.renderer.setPixelRatio(this.activeScale);
        this.resize();
    }

    getDecorationStride() {
        return this.quality === "low" ? 3 : this.quality === "balanced" ? 2 : 1;
    }

    render(scene, delta = 0) {
        if (this.disposed) return;
        this.renderer.render(scene, this.camera);
        this.renderCalls += 1;
        this.triangles = this.renderer.info.render.triangles;

        this.sampledFrames += 1;
        this.sampledDuration += delta;
        if (this.sampledDuration < 2.5) return;

        const frameRate = this.sampledFrames / this.sampledDuration;
        this.slowFrameSamples = frameRate < 38 ? this.slowFrameSamples + 1 : 0;
        if (this.slowFrameSamples >= 2) {
            if (this.quality === "high") this.setQuality("balanced");
            else if (this.quality === "balanced") this.setQuality("low");
            this.slowFrameSamples = 0;
        }
        this.viewport.dataset.fps = String(Math.round(frameRate));
        this.viewport.dataset.renderCalls = String(this.renderCalls);
        this.viewport.dataset.triangles = String(this.triangles);
        this.viewport.dataset.renderQuality = this.quality;
        this.sampledFrames = 0;
        this.sampledDuration = 0;
    }

    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this.resizeObserver.disconnect();
        this.renderer.setAnimationLoop(null);
        this.renderer.renderLists.dispose();
        this.renderer.dispose();
        this.renderer.forceContextLoss();
    }
}
