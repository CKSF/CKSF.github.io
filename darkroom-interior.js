(function () {
    "use strict";

    const content = {
        recent: {
            layout: "gallery",
            number: "01",
            metric: "02 · SELECTED",
            zhStats: [["底片卷", "RECENT"], ["已选", "02 帧"], ["状态", "CONTACT"]],
            enStats: [["ROLL", "RECENT"], ["SELECTED", "02"], ["STATE", "CONTACT"]],
            zhFlow: ["冲洗", "接触印样", "选片"],
            enFlow: ["DEVELOP", "CONTACT", "SELECT"],
            zh: {
                kicker: "CONTACT PRINTS",
                title: "近期照片",
                description: "雨、车窗与夜间列车组成这一卷仍带着水汽的观察。"
            },
            en: {
                kicker: "CONTACT PRINTS",
                title: "Recent photographs",
                description: "Rain, windows, and a midnight train form this roll of observations."
            },
            items: [
                {
                    src: "assets/darkroom/recent-hualien-rain.jpg",
                    zh: "花莲雨夜",
                    en: "Rainy night in Hualien",
                    meta: "OPEN STUDY · HUALIEN"
                },
                {
                    src: "assets/darkroom/recent-midnight-train.jpg",
                    zh: "午夜列车",
                    en: "Midnight train",
                    meta: "OPEN STUDY · IN TRANSIT"
                }
            ]
        },
        trays: {
            layout: "developing",
            number: "02",
            metric: "BATH · ACTIVE",
            zhStats: [["药液", "ACTIVE"], ["影像", "浮现中"], ["选择", "PENDING"]],
            enStats: [["BATH", "ACTIVE"], ["IMAGE", "EMERGING"], ["SELECT", "PENDING"]],
            zhFlow: ["曝光", "显影", "定影"],
            enFlow: ["EXPOSE", "DEVELOP", "FIX"],
            zh: {
                kicker: "IN PROCESS",
                title: "正在整理",
                description: "尚未完成选择的影像留在药液里，轮廓出现，但暂时没有结论。"
            },
            en: {
                kicker: "IN PROCESS",
                title: "In progress",
                description: "Unselected frames remain in the bath: an image is emerging, but no conclusion is ready."
            }
        },
        album: {
            layout: "album",
            number: "03",
            metric: "02 · ARCHIVED",
            zhStats: [["相册", "OLD"], ["页面", "02"], ["状态", "ARCHIVED"]],
            enStats: [["ALBUM", "OLD"], ["PAGES", "02"], ["STATE", "ARCHIVED"]],
            zhFlow: ["选片", "装裱", "归档"],
            enFlow: ["SELECT", "MOUNT", "ARCHIVE"],
            zh: {
                kicker: "OLD ALBUM",
                title: "历史相册",
                description: "按时间留下的两页旧影，保留观看方式发生变化之前的痕迹。"
            },
            en: {
                kicker: "OLD ALBUM",
                title: "Old album",
                description: "Two archived pages preserve traces from before the way of seeing changed."
            },
            items: [
                {
                    src: "assets/darkroom/archive-yokohama-print.jpg",
                    zh: "横滨夜雨",
                    en: "Night rain at Gankiro",
                    meta: "PUBLIC ARCHIVE · YOKOHAMA"
                },
                {
                    src: "assets/darkroom/archive-sellwood-darkroom.jpg",
                    zh: "1956 年的暗房",
                    en: "A darkroom in 1956",
                    meta: "PUBLIC ARCHIVE · PORTLAND"
                }
            ]
        },
        cabinet: {
            layout: "index",
            number: "04",
            metric: "89 · FRAMES",
            zhStats: [["地点", "04"], ["总数", "89 帧"], ["索引", "COMPLETE"]],
            enStats: [["PLACES", "04"], ["TOTAL", "89"], ["INDEX", "COMPLETE"]],
            zhFlow: ["扫描", "编号", "入柜"],
            enFlow: ["SCAN", "NUMBER", "FILE"],
            zh: {
                kicker: "NEGATIVE INDEX",
                title: "全部影像",
                description: "完整序列按地点和观看方式保存，墙上只留下最后选中的一帧。"
            },
            en: {
                kicker: "NEGATIVE INDEX",
                title: "All photographs",
                description: "Full sequences are filed by place and way of seeing; only the selected frame reaches the wall."
            },
            groups: [
                { code: "PHL", zh: "费城 · 雨与通勤", en: "Philadelphia · Rain and transit", count: "18" },
                { code: "NGB", zh: "宁波 · 家与旧街", en: "Ningbo · Home and old streets", count: "24" },
                { code: "ATL", zh: "亚特兰大 · 校园四年", en: "Atlanta · Four campus years", count: "31" },
                { code: "OBJ", zh: "物件 · 工作台", en: "Objects · Workbench", count: "16" }
            ]
        }
    };

    let mounted = null;
    let ownerMain = null;
    let lifecycle = null;
    const timers = new Set();
    const frames = new Set();

    function debugState() {
        const root = window.__siteRuntimeDebug ||= {};
        return root.darkroom ||= {
            activeInstances: 0,
            listenerCount: 0,
            timeoutCount: 0,
            animationFrameCount: 0
        };
    }

    function listen(target, type, listener, options = {}) {
        if (!target || !lifecycle) return;
        const debug = debugState();
        debug.listenerCount += 1;
        target.addEventListener(type, listener, {
            ...options,
            signal: lifecycle.signal
        });
    }

    function scheduleFrame(callback) {
        const debug = debugState();
        const frame = requestAnimationFrame(() => {
            frames.delete(frame);
            debug.animationFrameCount = Math.max(0, debug.animationFrameCount - 1);
            callback();
        });
        frames.add(frame);
        debug.animationFrameCount += 1;
        return frame;
    }

    function scheduleTimer(callback, delay) {
        const debug = debugState();
        const timer = window.setTimeout(() => {
            timers.delete(timer);
            debug.timeoutCount = Math.max(0, debug.timeoutCount - 1);
            callback();
        }, delay);
        timers.add(timer);
        debug.timeoutCount += 1;
        return timer;
    }

    function clearTimer(timer) {
        if (!timers.has(timer)) return;
        window.clearTimeout(timer);
        timers.delete(timer);
        const debug = debugState();
        debug.timeoutCount = Math.max(0, debug.timeoutCount - 1);
    }

    function isEnglish() {
        return document.documentElement.lang.startsWith("en");
    }

    function copyFor(item) {
        return item[isEnglish() ? "en" : "zh"];
    }

    function galleryMarkup(item) {
        return `
            <div class="darkroom-gallery ${item.layout === "album" ? "is-album" : ""}">
                ${item.items.map((photo, index) => `
                    <figure>
                        <div class="darkroom-photo">
                            <img src="${photo.src}" alt="${isEnglish() ? photo.en : photo.zh}">
                            <span>${String(index + 1).padStart(2, "0")}</span>
                        </div>
                        <figcaption>
                            <strong>${isEnglish() ? photo.en : photo.zh}</strong>
                            <small>${photo.meta}</small>
                        </figcaption>
                    </figure>
                `).join("")}
            </div>`;
    }

    function indexMarkup(item) {
        return `
            <div class="darkroom-file-index">
                ${item.groups.map((group) => `
                    <div>
                        <span>${group.code}</span>
                        <strong>${isEnglish() ? group.en : group.zh}</strong>
                        <small>${group.count} ${isEnglish() ? "frames" : "帧"}</small>
                    </div>
                `).join("")}
            </div>`;
    }

    function developingMarkup() {
        return `
            <div class="darkroom-developing" aria-hidden="true">
                <img src="assets/darkroom/recent-hualien-rain.jpg" alt="">
                <span></span>
            </div>
            <p class="darkroom-process-note">${isEnglish()
                ? "IMAGE EMERGING · SELECTION PENDING"
                : "影像浮现中 · 等待筛选"}</p>`;
    }

    function panelBody(item) {
        if (item.layout === "gallery" || item.layout === "album") return galleryMarkup(item);
        if (item.layout === "index") return indexMarkup(item);
        return developingMarkup();
    }

    function syncUrl(objectId) {
        const url = new URL(location.href);
        url.searchParams.set("space", "interior");
        if (objectId) url.searchParams.set("object", objectId);
        else url.searchParams.delete("object");
        history.replaceState(null, "", url);
    }

    function syncWorkbench(section, sectionId) {
        const item = content[sectionId];
        const bench = section.querySelector("[data-darkroom-bench]");
        if (!item || !bench) return;

        const english = isEnglish();
        const copy = copyFor(item);
        bench.dataset.layout = item.layout;
        bench.querySelector("[data-bench-status]").textContent =
            english ? "SAFELIGHT ON · IMAGE READY" : "安全灯已开启 · 影像就绪";
        bench.querySelector("[data-bench-code]").textContent = `${item.number} / ${copy.kicker}`;
        bench.querySelector("[data-bench-title]").textContent = copy.title;
        bench.querySelector("[data-bench-description]").textContent = copy.description;
        bench.querySelector("[data-bench-flow]").innerHTML =
            (english ? item.enFlow : item.zhFlow)
                .map((value, index) => `<span><b>${index + 1}</b>${value}</span>`)
                .join("");
        bench.querySelector("[data-bench-stats]").innerHTML =
            (english ? item.enStats : item.zhStats)
                .map(([label, value]) => `<span><small>${label}</small><strong>${value}</strong></span>`)
                .join("");
        bench.querySelector("[data-bench-metric]").textContent = item.metric;
        const open = bench.querySelector("[data-darkroom-open]");
        open.querySelector("span:first-child").textContent = english ? "OPEN IMAGE SET" : "打开影像";
        open.setAttribute("aria-label", english ? `Open ${copy.title}` : `打开${copy.title}`);
    }

    function openSection(section, sectionId, updateUrl = true, scrollToContent = true) {
        const item = content[sectionId];
        if (!item) return;
        const copy = copyFor(item);
        const panel = section.querySelector("[data-darkroom-panel]");
        section.dataset.activeSection = sectionId;
        syncWorkbench(section, sectionId);
        panel.dataset.layout = item.layout;
        panel.querySelector("[data-panel-kicker]").textContent = `${item.number} / ${copy.kicker}`;
        panel.querySelector("[data-panel-title]").textContent = copy.title;
        panel.querySelector("[data-panel-description]").textContent = copy.description;
        panel.querySelector("[data-panel-body]").innerHTML = panelBody(item);
        section.querySelectorAll("[data-darkroom-section]").forEach((button) => {
            const active = button.dataset.darkroomSection === sectionId;
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });
        panel.classList.add("ready");
        if (updateUrl) syncUrl(sectionId);
        if (scrollToContent) {
            scheduleFrame(() => panel.scrollIntoView({ behavior: "smooth", block: "start" }));
        }
    }

    function returnToScene(section) {
        syncUrl("");
        section.querySelector(".darkroom-scene").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function syncCopy(section) {
        const english = isEnglish();
        section.querySelector("[data-darkroom-eyebrow]").textContent = english
            ? "08 / CITY DARKROOM"
            : "08 / 城市暗房";
        section.querySelector("[data-darkroom-title]").textContent = english ? "Inside the red room" : "红灯之内";
        section.querySelector("[data-darkroom-intro]").textContent = english
            ? "Photographs wait here before they become memory."
            : "照片在成为记忆之前，先在这里等待。";
        section.querySelector("[data-index-label]").textContent = english ? "DARKROOM INDEX" : "暗房索引";
        section.querySelector("[data-city-label]").textContent = english ? "Return to city" : "返回城市";
        const paper = document.documentElement.dataset.siteTheme === "paper";
        const cityUrl = new URL("index.html?view=city", location.href);
        if (paper) cityUrl.searchParams.set("theme", "light");
        section.querySelector(".darkroom-city-link").setAttribute(
            "href",
            `${cityUrl.pathname.split("/").pop()}${cityUrl.search}${cityUrl.hash}`
        );
        const themeButton = section.querySelector("[data-darkroom-theme]");
        themeButton.title = paper
            ? (english ? "Switch to cyber theme" : "切换到赛博主题")
            : (english ? "Switch to paper theme" : "切换到浅色主题");
        const languageButton = section.querySelector("[data-darkroom-language]");
        languageButton.textContent = english ? "中" : "EN";
        languageButton.title = english ? "切换到中文" : "Switch to English";
        section.querySelector("[data-darkroom-close]").setAttribute(
            "aria-label",
            english ? "Return to darkroom" : "返回暗房"
        );
        section.querySelector("[data-content-back]").textContent = english ? "Back to darkroom" : "返回暗房";
        section.querySelectorAll("[data-darkroom-section]").forEach((button) => {
            const item = content[button.dataset.darkroomSection];
            const copy = copyFor(item);
            button.querySelector("strong").textContent = copy.title;
            button.querySelector("small").textContent = copy.kicker;
        });
        if (section.dataset.activeSection) {
            openSection(section, section.dataset.activeSection, false, false);
        }
    }

    function mount(options) {
        if (mounted) return mounted;
        lifecycle = new AbortController();
        ownerMain = options.main;
        const params = new URLSearchParams(location.search);
        let cityEntry = params.get("from") === "city" && params.get("entry") === "approach";
        try {
            const savedEntry = JSON.parse(sessionStorage.getItem("city-building-entry") || "null");
            cityEntry = cityEntry
                && savedEntry?.id === "darkroom"
                && Date.now() - savedEntry.at < 10000;
            sessionStorage.removeItem("city-building-entry");
        } catch (error) {
            cityEntry = false;
        }

        const section = document.createElement("section");
        section.className = "darkroom-interior";
        if (cityEntry) section.classList.add("city-entry-awaiting");
        section.id = "darkroom-interior";
        section.setAttribute("aria-labelledby", "darkroom-interior-title");
        section.innerHTML = `
            <div class="darkroom-scene">
                <img class="darkroom-scene-image"
                     src="assets/darkroom/cyber-darkroom-interior.jpg"
                     alt="">
                <div class="darkroom-scene-grade" aria-hidden="true"></div>
                <a class="darkroom-city-link" href="index.html?view=city">
                    <span aria-hidden="true">←</span><span data-city-label></span>
                </a>
                <div class="darkroom-tools">
                    <button type="button" data-darkroom-theme aria-label="Toggle theme">◐</button>
                    <button type="button" data-darkroom-language></button>
                </div>
                <header class="darkroom-scene-copy">
                    <span data-darkroom-eyebrow></span>
                    <h2 id="darkroom-interior-title" data-darkroom-title></h2>
                    <p data-darkroom-intro></p>
                </header>
                <div class="darkroom-workbench">
                    <section class="darkroom-bench-display" data-darkroom-bench aria-live="polite">
                        <header>
                            <span data-bench-status></span>
                            <code data-bench-code></code>
                        </header>
                        <h3 data-bench-title></h3>
                        <p data-bench-description></p>
                        <div class="darkroom-bench-flow" data-bench-flow></div>
                        <div class="darkroom-bench-stats" data-bench-stats></div>
                        <footer>
                            <strong data-bench-metric></strong>
                            <button type="button" data-darkroom-open>
                                <span></span><span aria-hidden="true">↘</span>
                            </button>
                        </footer>
                    </section>
                    <nav class="darkroom-bench-strips" aria-label="Darkroom stations">
                        ${Object.entries(content).map(([id, item]) => `
                            <button type="button" data-darkroom-section="${id}" aria-pressed="false">
                                <b>${item.number}</b>
                                <span><strong></strong><small></small></span>
                            </button>
                        `).join("")}
                    </nav>
                </div>
                <a class="darkroom-credit"
                   href="https://commons.wikimedia.org/wiki/File:No_Words_%E2%80%93_The_Darkroom_as_Shelter.jpg"
                   target="_blank"
                   rel="noopener noreferrer">SCENE · PRZEMEK ZAJFERT · CC BY-SA 4.0</a>
            </div>
            <nav class="darkroom-section-index" aria-label="Darkroom archive">
                <span data-index-label></span>
                <div>
                    ${Object.entries(content).map(([id, item]) => `
                        <button type="button" data-darkroom-section="${id}" aria-pressed="false">
                            <b>${item.number}</b>
                            <strong></strong>
                            <small></small>
                        </button>
                    `).join("")}
                </div>
            </nav>
            <article class="darkroom-content" data-darkroom-panel aria-live="polite">
                <div class="darkroom-panel-head">
                    <div>
                        <span data-panel-kicker></span>
                        <h2 data-panel-title></h2>
                    </div>
                    <button type="button" data-darkroom-close>
                        <span aria-hidden="true">↑</span><span data-content-back></span>
                    </button>
                </div>
                <p data-panel-description></p>
                <div class="darkroom-panel-body" data-panel-body></div>
            </article>`;

        options.main.before(section);
        scheduleFrame(() => document.documentElement.classList.remove("darkroom-entry-pending"));
        mounted = section;
        debugState().activeInstances += 1;
        syncCopy(section);

        section.querySelectorAll("[data-darkroom-section]").forEach((button) => {
            listen(button, "click", () => openSection(section, button.dataset.darkroomSection, true, false));
        });
        listen(section.querySelector("[data-darkroom-open]"), "click", () => {
            openSection(section, section.dataset.activeSection, true, true);
        });
        listen(section.querySelector("[data-darkroom-close]"), "click", () => returnToScene(section));
        listen(section.querySelector("[data-darkroom-theme]"), "click", () => {
            document.querySelector(".global-nav [data-theme-toggle]")?.click();
        });
        listen(section.querySelector("[data-darkroom-language]"), "click", () => {
            document.querySelector(".global-nav [data-lang-toggle]")?.click();
        });
        listen(window, "keydown", (event) => {
            if (event.key === "Escape" && window.scrollY > section.querySelector(".darkroom-scene").offsetHeight / 2) {
                returnToScene(section);
            }
        });
        listen(window, "site-language-change", () => syncCopy(section));
        listen(window, "site-theme-change", () => syncCopy(section));

        const image = section.querySelector(".darkroom-scene-image");
        const markReady = () => {
            section.classList.add("scene-ready");
            section.dispatchEvent(new CustomEvent("darkroom-scene-ready", { bubbles: true }));
        };
        if (image.complete && image.naturalWidth) scheduleFrame(markReady);
        else listen(image, "load", markReady, { once: true });

        const objectId = params.get("object");
        openSection(section, objectId && content[objectId] ? objectId : "recent", false, Boolean(objectId));
        return section;
    }

    function revealFromCity(interior) {
        if (!interior.classList.contains("city-entry-awaiting")) return;
        document.body.classList.add("darkroom-city-arrival");
        let revealed = false;
        const reveal = () => {
            if (revealed || interior !== mounted) return;
            revealed = true;
            scheduleFrame(() => interior.classList.add("city-entry-revealing"));
            scheduleTimer(() => {
                interior.classList.remove("city-entry-awaiting", "city-entry-revealing");
                document.body.classList.remove("darkroom-city-arrival");
                const url = new URL(location.href);
                url.searchParams.delete("entry");
                url.searchParams.set("space", "interior");
                history.replaceState(null, "", url);
            }, 1050);
        };
        const fallbackTimer = scheduleTimer(reveal, 900);
        listen(interior, "darkroom-scene-ready", () => {
            clearTimer(fallbackTimer);
            scheduleTimer(reveal, 90);
        }, { once: true });
    }

    function dispose(interior = mounted) {
        if (!mounted || interior !== mounted) return;
        lifecycle?.abort();
        lifecycle = null;
        frames.forEach((frame) => cancelAnimationFrame(frame));
        frames.clear();
        timers.forEach((timer) => window.clearTimeout(timer));
        timers.clear();
        interior.remove();
        ownerMain?.classList.remove("interior-records");
        if (ownerMain) ownerMain.id = "main-content";
        ownerMain = null;
        document.body.classList.remove(
            "darkroom-experience-page",
            "darkroom-city-arrival"
        );
        const debug = debugState();
        debug.activeInstances = Math.max(0, debug.activeInstances - 1);
        debug.listenerCount = 0;
        debug.timeoutCount = 0;
        debug.animationFrameCount = 0;
        mounted = null;
    }

    window.DarkroomInterior = { mount, revealFromCity, dispose };
})();
