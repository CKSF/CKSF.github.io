const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEF<>/\\|+*=$#%".split("");
const FONT_SIZE = 15;
const SINGLETON_KEY = "__matrixBackgroundRuntime";

function debugState() {
    const root = window.__siteRuntimeDebug ||= {};
    return root.background ||= {
        activeInstances: 0,
        rafActive: false
    };
}

function createMatrixBackground(canvas) {
    if (!canvas) return null;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return null;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let columns = 0;
    let drops = [];
    let speeds = [];
    let leaders = [];
    let frameId = null;
    let started = false;
    let manuallyPaused = false;
    let disposed = false;
    const debug = debugState();
    debug.activeInstances += 1;

    function resize() {
        if (disposed) return;
        const width = window.innerWidth;
        const height = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        columns = Math.floor(width / FONT_SIZE);
        drops = new Array(columns).fill(0).map(() => Math.random() * -50);
        speeds = new Array(columns).fill(0).map(() => 0.12 + Math.random() * 0.28);
        leaders = new Array(columns).fill(0).map(randomGlyph);
    }

    function randomGlyph() {
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    }

    function darkroomCoversPage() {
        return document.documentElement.classList.contains("darkroom-entry-pending")
            || document.body?.classList.contains("darkroom-experience-page")
            || document.body?.classList.contains("darkroom-city-arrival");
    }

    function canAnimate() {
        return started
            && !manuallyPaused
            && !disposed
            && !document.hidden
            && !reducedMotion.matches
            && document.documentElement.dataset.siteTheme !== "paper"
            && !darkroomCoversPage();
    }

    function stopLoop() {
        if (frameId === null) return;
        cancelAnimationFrame(frameId);
        frameId = null;
        debug.rafActive = false;
    }

    function draw() {
        frameId = null;
        if (!canAnimate()) return;

        context.fillStyle = "rgba(5, 7, 13, 0.08)";
        context.fillRect(0, 0, window.innerWidth, window.innerHeight);
        context.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`;
        context.textBaseline = "top";

        for (let index = 0; index < columns; index += 1) {
            const x = index * FONT_SIZE;
            const y = drops[index] * FONT_SIZE;
            if (Math.random() < 0.02) leaders[index] = randomGlyph();

            context.fillStyle = Math.random() < 0.03
                ? "rgba(36, 224, 255, 0.9)"
                : "rgba(255, 255, 220, 1)";
            context.fillText(leaders[index], x, y);
            context.fillStyle = "rgba(252, 233, 79, 0.85)";
            for (let trail = 1; trail <= 3; trail += 1) {
                context.fillText(randomGlyph(), x, y - trail * FONT_SIZE);
            }
            context.fillStyle = "rgba(180, 160, 40, 0.75)";
            for (let trail = 4; trail <= 8; trail += 1) {
                context.fillText(randomGlyph(), x, y - trail * FONT_SIZE);
            }

            drops[index] += speeds[index];
            if (y > window.innerHeight && Math.random() > 0.985) {
                drops[index] = Math.random() * -20;
                speeds[index] = 0.12 + Math.random() * 0.28;
            }
        }

        frameId = requestAnimationFrame(draw);
        debug.rafActive = true;
    }

    function sync() {
        stopLoop();
        if (canAnimate()) {
            frameId = requestAnimationFrame(draw);
            debug.rafActive = true;
        }
    }

    function start() {
        if (disposed) return;
        started = true;
        manuallyPaused = false;
        resize();
        sync();
    }

    function pause() {
        manuallyPaused = true;
        stopLoop();
    }

    function resume() {
        if (disposed) return;
        started = true;
        manuallyPaused = false;
        sync();
    }

    function handlePageHide(event) {
        stopLoop();
        if (!event.persisted) dispose();
    }

    function handlePageShow() {
        sync();
    }

    function handleResize() {
        resize();
        sync();
    }

    function dispose() {
        if (disposed) return;
        disposed = true;
        started = false;
        stopLoop();
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("site-theme-change", sync);
        window.removeEventListener("pagehide", handlePageHide);
        window.removeEventListener("pageshow", handlePageShow);
        document.removeEventListener("visibilitychange", sync);
        reducedMotion.removeEventListener("change", sync);
        classObserver.disconnect();
        if (window[SINGLETON_KEY] === api) delete window[SINGLETON_KEY];
        debug.activeInstances = Math.max(0, debug.activeInstances - 1);
        debug.rafActive = false;
    }

    const classObserver = new MutationObserver(sync);
    const api = { start, pause, resume, dispose };

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("site-theme-change", sync);
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", sync);
    reducedMotion.addEventListener("change", sync);
    classObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-site-theme"] });
    if (document.body) {
        classObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    }

    return api;
}

function mountMatrixBackground() {
    const existing = window[SINGLETON_KEY];
    if (existing) {
        existing.resume();
        return existing;
    }

    const runtime = createMatrixBackground(document.getElementById("matrixRain"));
    if (!runtime) return null;
    window[SINGLETON_KEY] = runtime;
    runtime.start();
    return runtime;
}

mountMatrixBackground();

export { createMatrixBackground, mountMatrixBackground };
