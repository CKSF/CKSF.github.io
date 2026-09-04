import { CITY_DISTRICTS, districtHref } from "./assets/scripts/city/city-data.js?v=20260904-release";

const state = {
    mode: "city",
    language: document.documentElement.lang.startsWith("en") ? "en" : "zh",
    compact: matchMedia("(max-width: 760px)").matches
        || new URLSearchParams(location.search).get("mobile") === "1"
};

const lifecycle = new AbortController();
const timers = new Set();
let cityApp = null;
let cityRuntimePromise = null;
let cityRuntimeAttempt = 0;
let languageObserver = null;
let shellDisposed = false;

function cityDebugState() {
    const runtimeDebug = window.__siteRuntimeDebug ||= {};
    return runtimeDebug.city ||= {
        activeInstances: 0,
        rafActive: false,
        listenerCount: 0,
        rendererDisposed: true,
        renderCalls: 0,
        triangles: 0,
        quality: "unloaded",
        shellListenerCount: 0,
        shellDisposed: false
    };
}

function listen(target, type, listener, options = {}) {
    if (!target) return;
    target.addEventListener(type, listener, {
        ...options,
        signal: lifecycle.signal
    });
    cityDebugState().shellListenerCount += 1;
}

function disposeCityShell() {
    if (shellDisposed) return;
    shellDisposed = true;
    lifecycle.abort();
    languageObserver?.disconnect();
    languageObserver = null;
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
    cityApp?.destroy();
    cityApp = null;
    cityRuntimePromise = null;
    const debug = cityDebugState();
    debug.shellListenerCount = 0;
    debug.shellDisposed = true;
}

function renderDistrictLinks() {
    const fallback = document.querySelector("[data-city-fallback-list]");
    const index = document.querySelector("[data-city-index-list]");
    if (fallback) {
        fallback.innerHTML = CITY_DISTRICTS.map((district) => `
            <a href="${districtHref(district, location.href)}" data-city-district="${district.id}">
                <small data-copy-zh="${district.number} · ${district.zh}" data-copy-en="${district.number} · ${district.en}">${district.number} · ${district.zh}</small>
                <span data-copy-zh="${district.fallback.zh}" data-copy-en="${district.fallback.en}">${district.fallback.zh}</span>
            </a>
        `).join("");
    }
    if (index) {
        index.innerHTML = CITY_DISTRICTS.map((district) => `
            <a class="district-card" href="${districtHref(district, location.href)}" data-code="${district.number}" data-city-district="${district.id}">
                <span class="district-card-num" data-copy-zh="${district.number} · ${district.zh}" data-copy-en="${district.number} · ${district.en}">${district.number} · ${district.zh}</span>
                <h2 data-copy-zh="${district.index.zhTitle}" data-copy-en="${district.index.enTitle}">${district.index.zhTitle}</h2>
                <p data-copy-zh="${district.index.zhDescription}" data-copy-en="${district.index.enDescription}">${district.index.zhDescription}</p>
                <span class="district-card-arrow" data-copy-zh="${district.index.zhAction}" data-copy-en="${district.index.enAction}">${district.index.zhAction}</span>
            </a>
        `).join("");
    }
}

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
    document.querySelector("[data-recruiter-prompt-close]")?.setAttribute(
        "aria-label",
        english ? "Close recruiter prompt" : "关闭招聘入口"
    );
    document.querySelector(".city-status")?.setAttribute(
        "aria-label",
        english ? "Current status" : "当前状态"
    );
    document.querySelector(".city-tour-nav")?.setAttribute(
        "aria-label",
        english ? "Tour navigation" : "导览切换"
    );
    document.querySelector("[data-city-tour-prev]")?.setAttribute(
        "aria-label",
        english ? "Previous building" : "上一栋建筑"
    );
    document.querySelector("[data-city-tour-next]")?.setAttribute(
        "aria-label",
        english ? "Next building" : "下一栋建筑"
    );
}

async function ensureCityRuntime() {
    if (cityApp) return cityApp;
    if (cityRuntimePromise) return cityRuntimePromise;

    const viewport = document.querySelector("[data-city-viewport]");
    const canvas = document.querySelector("[data-city-canvas]");
    if (!viewport || !canvas) return null;
    if (!window.WebGLRenderingContext
        || matchMedia("(prefers-reduced-motion: reduce)").matches) {
        viewport.classList.add("failed");
        cityDebugState().quality = "fallback";
        return null;
    }

    viewport.classList.remove("failed");
    const retryAttempt = cityRuntimeAttempt++;
    const retryQuery = retryAttempt ? `&retry=${retryAttempt}` : "";
    cityRuntimePromise = import(`./assets/scripts/city/city-runtime.js?v=20260904-release${retryQuery}`)
        .then(({ createCityApp }) => createCityApp({
            viewport,
            canvas,
            loader: document.querySelector("[data-city-loader]"),
            tooltip: document.querySelector("[data-city-tooltip]"),
            compact: state.compact,
            reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
            retryAttempt
        }))
        .then((app) => {
            cityApp = app;
            app.start();
            return app;
        })
        .catch((error) => {
            console.error("City runtime failed to start", error);
            cityApp?.destroy();
            cityApp = null;
            cityRuntimePromise = null;
            viewport.classList.add("failed");
            cityDebugState().quality = "fallback";
            return null;
        });
    return cityRuntimePromise;
}

function setHomeMode(mode) {
    state.mode = mode === "index" ? "index" : "city";
    document.body.dataset.homeMode = state.mode;
    document.querySelectorAll("[data-home-mode]").forEach((button) => {
        button.classList.toggle("active", button.dataset.homeMode === state.mode);
    });
    try {
        localStorage.setItem("home-mode", state.mode);
    } catch (error) {}

    const url = new URL(location.href);
    if (state.mode === "index") url.searchParams.set("view", "index");
    else url.searchParams.delete("view");
    history.replaceState(null, "", url);
    window.dispatchEvent(new CustomEvent("home-mode-change", {
        detail: { mode: state.mode }
    }));
    if (state.mode === "city") ensureCityRuntime();
}

function configureCompactCopy(controlsPanel) {
    if (!state.compact || !controlsPanel) return;
    const rows = controlsPanel.querySelectorAll("dl div");
    if (rows[0]) {
        rows[0].innerHTML =
            '<dt data-copy-zh="滑动" data-copy-en="Swipe">滑动</dt><dd data-copy-zh="旋转城市" data-copy-en="Rotate city">旋转城市</dd>';
    }
    if (rows[1]) {
        rows[1].innerHTML =
            '<dt data-copy-zh="点按" data-copy-en="Tap">点按</dt><dd data-copy-zh="进入建筑" data-copy-en="Enter building">进入建筑</dd>';
    }
    if (rows[2]) {
        rows[2].innerHTML =
            '<dt data-copy-zh="索引" data-copy-en="INDEX">索引</dt><dd data-copy-zh="打开快速索引" data-copy-en="Open fast navigation">打开快速索引</dd>';
    }
    rows[3]?.remove();
    rows[4]?.remove();
    const hint = document.querySelector(".city-hint");
    if (hint) {
        hint.dataset.copyZh = "<span>滑动</span>旋转 · <span>点按</span>进入";
        hint.dataset.copyEn = "<span>Swipe</span> rotate · <span>Tap</span> enter";
    }
    const indexIntro = document.querySelector(".index-header p");
    if (indexIntro) {
        indexIntro.dataset.copyZh =
            "手机端默认使用快速索引，信息更集中、点击路径更短。也可以随时进入完整 3D 城市。";
        indexIntro.dataset.copyEn =
            "Mobile opens with the fast index for shorter paths. The full 3D city remains one tap away.";
    }
    const cityButtonLabel =
        document.querySelector(".index-toolbar [data-home-mode='city'] span:first-child");
    if (cityButtonLabel) {
        cityButtonLabel.dataset.copyZh = "进入 3D 城市";
        cityButtonLabel.dataset.copyEn = "Open 3D city";
    }
}

function bindRecruiterPrompt() {
    const prompt = document.querySelector("[data-recruiter-prompt]");
    if (!prompt) return;
    const storageKey = "recruiter-prompt-dismissed-v1";
    const dismiss = () => {
        if (prompt.classList.contains("dismissed")) return;
        try {
            localStorage.setItem(storageKey, "1");
        } catch (error) {}
        prompt.classList.remove("visible");
        prompt.classList.add("dismissed");
        const timer = setTimeout(() => {
            timers.delete(timer);
            prompt.hidden = true;
            prompt.setAttribute("aria-hidden", "true");
        }, 240);
        timers.add(timer);
    };
    let dismissed = false;
    try {
        dismissed = localStorage.getItem(storageKey) === "1";
    } catch (error) {}
    if (dismissed) return;
    prompt.hidden = false;
    prompt.removeAttribute("aria-hidden");
    const timer = setTimeout(() => {
        timers.delete(timer);
        prompt.classList.add("visible");
    }, 0);
    timers.add(timer);
    listen(document, "click", dismiss, { capture: true, once: true });
    listen(prompt.querySelector("[data-recruiter-prompt-close]"), "click", dismiss);
}

function bindPageControls() {
    document.body.dataset.mobileExperience = state.compact ? "compact" : "desktop";
    bindRecruiterPrompt();

    document.querySelectorAll("[data-home-mode]").forEach((button) => {
        listen(button, "click", () => setHomeMode(button.dataset.homeMode));
    });

    const controlsPanel = document.querySelector("[data-city-controls-panel]");
    const setControlsOpen = (open) => {
        controlsPanel?.classList.toggle("open", open);
        controlsPanel?.setAttribute("aria-hidden", String(!open));
    };
    listen(document.querySelector("[data-city-help]"), "click", () => {
        setControlsOpen(!controlsPanel?.classList.contains("open"));
    });
    listen(
        document.querySelector("[data-city-help-close]"),
        "click",
        () => setControlsOpen(false)
    );
    configureCompactCopy(controlsPanel);

    listen(window, "keydown", (event) => {
        if (event.target instanceof HTMLInputElement
            || event.target instanceof HTMLTextAreaElement) return;
        if (event.key === "Escape") setControlsOpen(false);
        if (event.key.toLowerCase() === "i") {
            setHomeMode(state.mode === "city" ? "index" : "city");
        }
    });
    listen(window, "city-request-mode", (event) => setHomeMode(event.detail.mode));
    listen(window, "site-language-change", applyCopy);
    languageObserver = new MutationObserver(applyCopy);
    languageObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["lang"]
    });

    const requestedMode = new URLSearchParams(location.search).get("view");
    let savedMode = null;
    try {
        savedMode = localStorage.getItem("home-mode");
    } catch (error) {}
    const mobileDefault = state.compact && !requestedMode && !savedMode;
    setHomeMode(
        requestedMode === "index"
        || (!requestedMode && savedMode === "index")
        || mobileDefault
            ? "index"
            : "city"
    );
    applyCopy();
}

cityDebugState();
renderDistrictLinks();
bindPageControls();
listen(window, "pagehide", (event) => {
    if (event.persisted) {
        cityApp?.pause();
        return;
    }
    disposeCityShell();
});
listen(window, "pageshow", (event) => {
    if (!event.persisted || state.mode !== "city") return;
    cityApp?.restoreAfterNavigation();
    cityApp?.resume();
});
