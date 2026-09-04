import { districtHref } from "./city-data.js?v=20260904-release";

export class CityController {
    constructor(THREE, options) {
        this.THREE = THREE;
        this.model = options.model;
        this.renderer = options.renderer;
        this.viewport = options.viewport;
        this.canvas = options.canvas;
        this.loader = options.loader;
        this.tooltip = options.tooltip;
        this.compact = Boolean(options.compact);
        this.reducedMotion = Boolean(options.reducedMotion);
        this.onDebug = options.onDebug || (() => {});
        this.onDestroyRequest = options.onDestroyRequest || (() => {});

        this.abortController = new AbortController();
        this.listenerCount = 0;
        this.rafId = 0;
        this.running = false;
        this.started = false;
        this.disposed = false;
        this.mode = document.body.dataset.homeMode === "index" ? "index" : "city";
        this.language = document.documentElement.lang.startsWith("en") ? "en" : "zh";
        this.touring = false;
        this.resumeTourOnResume = false;
        this.tourIndex = 0;
        this.tourTimer = 0;
        this.navigationTimer = 0;
        this.transitionTimer = 0;
        this.frame = 0;
        this.lastTime = 0;
        this.introProgress = this.reducedMotion ? 1 : 0;
        this.buildingEntry = null;
        this.contextLost = false;
        this.hoveredGroup = null;
        this.pointer = new THREE.Vector2(10, 10);
        this.pointerMoved = false;
        this.dragging = false;
        this.activePointerId = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.rotationStart = 0;
        this.lastTouchNavigation = 0;
        this.entryWorldPosition = new THREE.Vector3();
        this.entryApproachDirection = new THREE.Vector3();
        this.entryDestination = new THREE.Vector3();
        this.entryProjectedPosition = new THREE.Vector3();

        this.tourButton = document.querySelector("[data-city-tour]");
        this.tourPrev = document.querySelector("[data-city-tour-prev]");
        this.tourNext = document.querySelector("[data-city-tour-next]");
        this.tourProgress = document.querySelector("[data-city-tour-progress]");
    }

    addListener(target, type, listener, options = {}) {
        const listenerOptions = { ...options, signal: this.abortController.signal };
        target?.addEventListener(type, listener, listenerOptions);
        if (target) this.listenerCount += 1;
    }

    start() {
        if (this.disposed || this.started) return;
        this.started = true;
        this.bindEvents();
        this.applyTheme(document.documentElement.dataset.siteTheme);
        this.renderer.resetCamera(this.introProgress < 1);
        this.renderer.render(this.model.scene, 0);
        this.loader?.classList.add("hidden");
        if (this.mode === "city" && !document.hidden) this.resume();
        this.publishDebug();
    }

    pause() {
        this.resumeTourOnResume = this.touring;
        clearInterval(this.tourTimer);
        this.tourTimer = 0;
        this.running = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.rafId = 0;
        this.lastTime = 0;
        this.publishDebug();
    }

    resume() {
        if (this.disposed
            || this.contextLost
            || this.running
            || this.mode !== "city"
            || document.hidden) return;
        this.running = true;
        this.lastTime = performance.now();
        this.rafId = requestAnimationFrame((time) => this.tick(time));
        if (this.resumeTourOnResume) {
            this.resumeTourOnResume = false;
            this.scheduleTour();
        }
        this.publishDebug();
    }

    tick(time) {
        if (!this.running || this.disposed) return;
        this.rafId = 0;
        const delta = Math.min(Math.max((time - this.lastTime) / 1000, 0), 0.05);
        this.lastTime = time;
        this.frame += 1;

        this.updatePointer();
        this.updateCamera(delta, time);
        const stride = this.renderer.getDecorationStride();
        this.model.update(delta, {
            updateDecorations: this.frame % stride === 0
        });
        this.renderer.render(this.model.scene, delta);
        this.publishDebug();

        if (this.running) {
            this.rafId = requestAnimationFrame((nextTime) => this.tick(nextTime));
        }
    }

    bindEvents() {
        this.addListener(this.viewport, "pointerdown", (event) => this.onPointerDown(event));
        this.addListener(this.viewport, "pointermove", (event) => this.onPointerMove(event));
        this.addListener(this.viewport, "pointerup", (event) => this.onPointerUp(event));
        this.addListener(this.viewport, "pointercancel", (event) => this.onPointerCancel(event));
        this.addListener(this.viewport, "pointerleave", () => this.onPointerLeave());
        this.addListener(this.viewport, "click", (event) => this.onClick(event));
        this.addListener(this.canvas, "webglcontextlost", (event) => {
            event.preventDefault();
            this.contextLost = true;
            this.pause();
            this.viewport.classList.add("failed", "context-lost");
            this.publishDebug();
        });
        this.addListener(this.canvas, "webglcontextrestored", () => {
            if (this.disposed || !this.contextLost) return;
            this.contextLost = false;
            this.viewport.classList.remove("failed", "context-lost");
            this.renderer.resize();
            this.applyTheme(document.documentElement.dataset.siteTheme);
            this.renderer.render(this.model.scene, 0);
            this.resume();
            this.publishDebug();
        });
        this.addListener(this.tourButton, "click", () => this.toggleTour());
        this.addListener(this.tourPrev, "click", () => this.moveTour(-1));
        this.addListener(this.tourNext, "click", () => this.moveTour(1));
        this.addListener(window, "keydown", (event) => this.onKeyDown(event));
        this.addListener(window, "home-mode-change", (event) => this.setMode(event.detail.mode));
        this.addListener(window, "site-theme-change", (event) => this.applyTheme(event.detail.theme));
        this.addListener(window, "site-language-change", () => {
            this.language = document.documentElement.lang.startsWith("en") ? "en" : "zh";
            this.updateTooltip(this.hoveredGroup);
            this.syncTourLabel();
        });
        this.addListener(document, "visibilitychange", () => {
            if (document.hidden) this.pause();
            else this.resume();
        });
        this.addListener(window, "pagehide", (event) => {
            if (event.persisted) this.pause();
            else this.onDestroyRequest();
        });
        this.addListener(window, "pageshow", (event) => {
            if (event.persisted) this.resume();
        });
    }

    pointerPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        this.pointerMoved = true;
    }

    eventHitsInterface(event) {
        return Boolean(event.target.closest?.(".city-overlay-top, .city-controls-panel"));
    }

    onPointerDown(event) {
        if (!event.isPrimary || this.eventHitsInterface(event) || this.buildingEntry) return;
        this.stopTour();
        this.introProgress = 1;
        this.renderer.resetCamera(false);
        this.model.world.scale.setScalar(1);
        this.dragging = true;
        this.activePointerId = event.pointerId;
        this.dragStartX = event.clientX;
        this.dragStartY = event.clientY;
        this.rotationStart = this.model.getRotation();
        this.pointerPosition(event);
        this.viewport.setPointerCapture?.(event.pointerId);
    }

    onPointerMove(event) {
        this.pointerPosition(event);
        if (this.dragging && event.pointerId === this.activePointerId) {
            this.model.setRotation(
                this.rotationStart + (event.clientX - this.dragStartX) * 0.006
            );
        }
        this.tooltip.style.left = `${Math.min(event.clientX, innerWidth - 300)}px`;
        this.tooltip.style.top = `${Math.min(event.clientY, innerHeight - 150)}px`;
    }

    onPointerUp(event) {
        if (event.pointerId !== this.activePointerId) return;
        const travel = Math.hypot(
            event.clientX - this.dragStartX,
            event.clientY - this.dragStartY
        );
        const isTouch = event.pointerType !== "mouse";
        this.dragging = false;
        this.activePointerId = null;
        this.viewport.releasePointerCapture?.(event.pointerId);
        if (isTouch && travel <= 18 && !this.eventHitsInterface(event)) {
            const selectedGroup = this.model.pick(this.pointer, this.renderer.camera);
            if (selectedGroup) {
                this.lastTouchNavigation = performance.now();
                this.enterDistrict(selectedGroup);
            }
        }
    }

    onPointerCancel(event) {
        if (event.pointerId !== this.activePointerId) return;
        this.dragging = false;
        this.activePointerId = null;
        this.viewport.releasePointerCapture?.(event.pointerId);
    }

    onPointerLeave() {
        this.dragging = false;
        this.activePointerId = null;
        this.pointer.set(10, 10);
        this.pointerMoved = true;
        if (!this.touring) this.tooltip.classList.remove("visible");
    }

    onClick(event) {
        if (this.eventHitsInterface(event)
            || performance.now() - this.lastTouchNavigation < 600) return;
        const threshold = event.pointerType && event.pointerType !== "mouse" ? 18 : 8;
        if (Math.hypot(
            event.clientX - this.dragStartX,
            event.clientY - this.dragStartY
        ) > threshold) return;
        this.pointerPosition(event);
        this.enterDistrict(this.model.pick(this.pointer, this.renderer.camera));
    }

    onKeyDown(event) {
        if (event.target instanceof HTMLInputElement
            || event.target instanceof HTMLTextAreaElement
            || this.mode !== "city") return;
        if (event.key === "ArrowLeft" && this.touring) this.moveTour(-1);
        if (event.key === "ArrowRight" && this.touring) this.moveTour(1);
        if (event.key === "Enter" && this.hoveredGroup) this.enterDistrict(this.hoveredGroup);
        if (event.key === "Escape") this.stopTour();
    }

    updatePointer() {
        if (!this.pointerMoved || this.dragging || this.touring || this.buildingEntry) return;
        const nextGroup = this.model.pick(this.pointer, this.renderer.camera);
        if (nextGroup !== this.hoveredGroup) {
            this.hoveredGroup = nextGroup;
            this.model.setHovered(nextGroup);
            this.viewport.dataset.focusedDistrict =
                this.model.getDistrict(nextGroup)?.id || "";
            this.updateTooltip(nextGroup);
            this.canvas.style.cursor = nextGroup ? "pointer" : "grab";
        }
        this.pointerMoved = false;
    }

    updateTooltip(group) {
        if (!group) {
            this.tooltip.classList.remove("visible");
            return;
        }
        const district = this.model.getDistrict(group);
        this.tooltip.querySelector(".city-tooltip-num").textContent =
            `${district.number} · ${district.code}`;
        this.tooltip.querySelector("strong").textContent =
            this.language === "en" ? district.en : district.zh;
        this.tooltip.querySelector(".city-tooltip-intro").textContent =
            this.language === "en" ? district.enIntro : district.zhIntro;
        this.tooltip.classList.add("visible");
    }

    focusDistrict(index) {
        const group = this.model.getDistrictGroup(index);
        if (!group) return;
        const district = this.model.getDistrict(group);
        this.model.setRotation(this.model.rotationForDistrict(district));
        group.userData.tourPulse = performance.now();
        this.hoveredGroup = group;
        this.model.setHovered(group);
        this.viewport.dataset.focusedDistrict = district.id;
        this.pointer.set(10, 10);
        this.pointerMoved = false;
        this.updateTooltip(group);
        if (this.tourProgress) {
            this.tourProgress.textContent =
                `${String(index + 1).padStart(2, "0")} / ${String(this.model.getDistrictCount()).padStart(2, "0")}`;
        }
    }

    scheduleTour() {
        clearInterval(this.tourTimer);
        this.tourTimer = 0;
        if (!this.touring || !this.running || this.compact) return;
        this.tourTimer = setInterval(() => {
            this.tourIndex = (this.tourIndex + 1) % this.model.getDistrictCount();
            this.focusDistrict(this.tourIndex);
        }, 2400);
    }

    moveTour(direction) {
        if (!this.touring) return;
        const count = this.model.getDistrictCount();
        this.tourIndex = (this.tourIndex + direction + count) % count;
        this.focusDistrict(this.tourIndex);
        this.scheduleTour();
    }

    toggleTour() {
        if (this.touring) {
            this.stopTour();
            return;
        }
        this.touring = true;
        if (this.mode !== "city") {
            window.dispatchEvent(new CustomEvent("city-request-mode", {
                detail: { mode: "city" }
            }));
        }
        this.tourIndex = 0;
        this.viewport.classList.add("touring");
        this.tooltip.classList.add("tour-mode");
        this.syncTourLabel();
        this.focusDistrict(this.tourIndex);
        this.scheduleTour();
    }

    stopTour() {
        this.touring = false;
        this.resumeTourOnResume = false;
        clearInterval(this.tourTimer);
        this.tourTimer = 0;
        this.viewport.classList.remove("touring");
        this.tooltip.classList.remove("tour-mode");
        this.syncTourLabel();
    }

    syncTourLabel() {
        const label = this.tourButton?.querySelector("span:first-child");
        if (!label) return;
        label.textContent = this.touring
            ? (this.language === "en" ? "Stop tour" : "停止导览")
            : (this.language === "en" ? "Start city tour" : "开始城市导览");
    }

    setMode(mode) {
        this.mode = mode === "index" ? "index" : "city";
        if (this.mode === "index") {
            this.stopTour();
            this.pause();
        } else {
            this.renderer.resize();
            this.resume();
        }
    }

    applyTheme(theme) {
        const themeState = this.model.applyTheme(theme);
        this.renderer.setTheme(themeState);
        document.body.dataset.cityWorld = themeState.world;
        this.viewport.dataset.population = String(themeState.population);
        if (themeState.world === "paper") {
            this.viewport.dataset.focusedDistrict = "";
            this.hoveredGroup = null;
        }
    }

    enterDistrict(group) {
        if (!group || this.buildingEntry || this.viewport.classList.contains("departing")) return;
        this.stopTour();
        this.introProgress = 1;
        this.hoveredGroup = group;
        this.model.setHovered(group);
        this.updateTooltip(group);

        const district = this.model.getDistrict(group);
        let entryRotation = this.model.rotationForDistrict(district);
        const currentRotation = this.model.getRotation();
        while (entryRotation - currentRotation > Math.PI) entryRotation -= Math.PI * 2;
        while (entryRotation - currentRotation < -Math.PI) entryRotation += Math.PI * 2;

        this.buildingEntry = {
            group,
            district,
            startedAt: performance.now(),
            duration: this.reducedMotion ? 360 : 1550,
            startRotation: currentRotation,
            targetRotation: entryRotation,
            startCamera: this.renderer.camera.position.clone(),
            startLook: this.renderer.lookTarget.clone(),
            navigated: false
        };

        const rect = this.viewport.getBoundingClientRect();
        this.viewport.dataset.selectedDistrict = district.id;
        this.viewport.style.left = "0";
        this.viewport.style.top = "0";
        this.viewport.style.width = "100vw";
        this.viewport.style.height = "100svh";
        this.viewport.style.clipPath = `inset(${rect.top}px ${Math.max(0, innerWidth - rect.right)}px ${Math.max(0, innerHeight - rect.bottom)}px ${rect.left}px)`;
        this.viewport.style.setProperty("--entry-x", "50%");
        this.viewport.style.setProperty("--entry-y", "50%");
        this.viewport.style.setProperty("--entry-hole", "62%");
        this.viewport.style.setProperty("--entry-shade", "0");
        this.viewport.classList.add("entering-building");
        document.body.classList.add("city-entering-building");
        this.viewport.getBoundingClientRect();
        this.transitionTimer = setTimeout(() => {
            if (!this.disposed) this.viewport.style.clipPath = "inset(0)";
        }, 0);
    }

    restoreAfterNavigation() {
        clearTimeout(this.navigationTimer);
        clearTimeout(this.transitionTimer);
        this.navigationTimer = 0;
        this.transitionTimer = 0;
        this.buildingEntry = null;
        this.viewport.classList.remove("entering-building");
        delete this.viewport.dataset.selectedDistrict;
        ["left", "top", "width", "height", "clip-path", "--entry-x", "--entry-y", "--entry-hole", "--entry-shade"]
            .forEach((property) => this.viewport.style.removeProperty(property));
        document.body.classList.remove("city-entering-building");
        this.renderer.resetCamera(false);
        this.model.world.scale.setScalar(1);
        this.renderer.render(this.model.scene, 0);
    }

    updateCamera(delta, time) {
        const camera = this.renderer.camera;
        if (this.introProgress < 1) {
            this.introProgress = Math.min(1, this.introProgress + delta / 1.8);
            const eased = 1 - Math.pow(1 - this.introProgress, 3);
            camera.position.lerpVectors(
                this.renderer.introPosition,
                this.renderer.homePosition,
                eased
            );
            this.renderer.lookTarget.y = 2.4 + (1 - eased) * 0.9;
            camera.lookAt(this.renderer.lookTarget);
            this.model.world.scale.setScalar(0.94 + eased * 0.06);
        } else if (this.renderer.lookTarget.y !== 2.4 && !this.buildingEntry) {
            this.renderer.lookTarget.y = 2.4;
            camera.lookAt(this.renderer.lookTarget);
            this.model.world.scale.setScalar(1);
        }

        if (!this.buildingEntry) return;
        const entry = this.buildingEntry;
        const rawProgress = Math.min(1, (time - entry.startedAt) / entry.duration);
        const rotationProgress = Math.min(1, rawProgress / 0.58);
        const rotationEase = 1 - Math.pow(1 - rotationProgress, 3);
        const approachProgress = Math.max(0, Math.min(1, (rawProgress - 0.12) / 0.88));
        const approachEase = approachProgress < 0.5
            ? 4 * approachProgress * approachProgress * approachProgress
            : 1 - Math.pow(-2 * approachProgress + 2, 3) / 2;

        this.model.setRotation(
            this.THREE.MathUtils.lerp(
                entry.startRotation,
                entry.targetRotation,
                rotationEase
            ),
            true
        );
        const entryData = this.model.getEntryData(entry.group, this.entryWorldPosition);
        this.entryApproachDirection.copy(entry.startCamera)
            .sub(entryData.position)
            .normalize();
        this.entryDestination.copy(entryData.position)
            .addScaledVector(this.entryApproachDirection, this.compact ? 2.7 : 2.25);
        this.entryDestination.y += this.compact ? 0.25 : 0.12;
        camera.position.lerpVectors(entry.startCamera, this.entryDestination, approachEase);
        this.renderer.lookTarget.lerpVectors(
            entry.startLook,
            entryData.position,
            Math.min(1, approachEase * 1.18)
        );
        camera.lookAt(this.renderer.lookTarget);
        camera.updateMatrixWorld();

        this.entryProjectedPosition.copy(entryData.position).project(camera);
        this.viewport.style.setProperty(
            "--entry-x",
            `${(this.entryProjectedPosition.x * 0.5 + 0.5) * 100}%`
        );
        this.viewport.style.setProperty(
            "--entry-y",
            `${(-this.entryProjectedPosition.y * 0.5 + 0.5) * 100}%`
        );
        const closeProgress = Math.max(0, Math.min(1, (rawProgress - 0.64) / 0.36));
        const closeEase = closeProgress * closeProgress * (3 - 2 * closeProgress);
        this.viewport.style.setProperty(
            "--entry-hole",
            `${Math.max(0.7, 62 * (1 - closeEase))}%`
        );
        this.viewport.style.setProperty("--entry-shade", String(closeEase));

        if (rawProgress >= 0.92 && !entry.navigated) {
            entry.navigated = true;
            try {
                sessionStorage.setItem("city-building-entry", JSON.stringify({
                    id: entry.district.id,
                    at: Date.now()
                }));
            } catch (error) {}
            this.navigationTimer = setTimeout(() => {
                location.href = this.themedDistrictHref(entry.district);
            }, this.reducedMotion ? 20 : 130);
        }
    }

    themedDistrictHref(district) {
        const params = { entry: "approach" };
        const href = districtHref(district, location.href, params);
        const url = new URL(href, location.href);
        if (document.documentElement.dataset.siteTheme === "paper") {
            url.searchParams.set("theme", "light");
        }
        return `${url.pathname.split("/").pop()}${url.search}${url.hash}`;
    }

    publishDebug() {
        this.onDebug({
            rafActive: this.running,
            listenerCount: this.listenerCount,
            tourTimerActive: Boolean(this.tourTimer),
            contextLost: this.contextLost,
            renderCalls: this.renderer.renderCalls,
            triangles: this.renderer.triangles,
            quality: this.renderer.quality
        });
    }

    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this.pause();
        this.stopTour();
        clearTimeout(this.navigationTimer);
        clearTimeout(this.transitionTimer);
        this.navigationTimer = 0;
        this.transitionTimer = 0;
        this.abortController.abort();
        this.listenerCount = 0;
        this.viewport.classList.remove("touring", "entering-building");
        document.body.classList.remove("city-entering-building");
        this.publishDebug();
    }
}
