export class InteriorRenderer {
    constructor({ main, room, documentRef = document }) {
        this.document = documentRef;
        this.main = main;
        this.room = room;
        this.scene = null;
        this.index = null;
        this.disposed = false;
    }

    mount({ cityEntry = false } = {}) {
        if (this.scene || this.disposed) return this.scene;
        const scene = this.document.createElement("section");
        scene.className = "interior-experience";
        if (cityEntry) scene.classList.add("city-entry-awaiting");
        scene.dataset.interiorRoom = this.room.id;
        scene.style.setProperty("--interior-focus", this.room.focus);
        scene.innerHTML = this.#markup();

        this.main.before(scene);
        const index = scene.querySelector(".interior-section-index");
        scene.after(index);
        this.scene = scene;
        this.index = index;
        this.main.classList.add("interior-records");
        this.main.id = "main-content";
        this.document.body.classList.add("interior-experience-page");
        this.document.body.dataset.room = this.room.id;
        this.setIndexVisible(false);
        return scene;
    }

    render(state) {
        if (!this.scene || this.disposed) return;
        const english = state.language === "en";
        const chapter = this.room.chapters.find((item) => item.id === state.activeChapter)
            || this.room.chapters[0];
        const terminal = chapter.terminal;

        this.scene.dataset.activeChapter = chapter.id;
        this.scene.dataset.focusZone = chapter.id;
        if (state.indexPreview) this.scene.dataset.indexPreview = state.indexPreview;
        else delete this.scene.dataset.indexPreview;
        this.scene.classList.toggle("scene-record-opening", state.recordOpening);

        this.scene.querySelector("[data-interior-code]").textContent = this.room.code;
        this.scene.querySelector("[data-interior-title]").textContent = english ? this.room.en : this.room.zh;
        this.scene.querySelector("[data-interior-outline]").textContent = english ? this.room.enOutline : this.room.zhOutline;
        this.scene.querySelector("[data-interior-description]").textContent =
            english ? this.room.enDescription : this.room.zhDescription;
        this.index.querySelector("[data-interior-index-label]").textContent =
            english ? "CONTENT INDEX" : "内容索引";
        this.index.querySelector("[data-interior-progress]").setAttribute(
            "aria-label",
            english ? "Content reading progress" : "内容阅读进度"
        );

        this.#syncButtons(chapter, english);
        this.#syncTerminal(chapter, terminal, english);
        this.#syncControls(state, english);
        this.#syncMedia(state.theme);
    }

    setCityHref(href) {
        this.scene?.querySelector("[data-interior-city]")?.setAttribute("href", href);
    }

    setParallax(x, y) {
        const stage = this.scene?.querySelector(".interior-scene");
        if (!stage) return;
        stage.style.setProperty("--scene-shift-x", `${x}px`);
        stage.style.setProperty("--scene-shift-y", `${y}px`);
    }

    markReady() {
        if (!this.scene || this.disposed) return;
        this.scene.classList.add("scene-ready");
        this.scene.dispatchEvent(new CustomEvent("interior-scene-ready", { bubbles: true }));
    }

    targetFor(chapter) {
        return this.document.querySelector(
            `.lang-block.active [data-content-id="${chapter.targetId}"]`
        );
    }

    scrollToChapter(chapter, behavior = "smooth") {
        (this.targetFor(chapter) || this.document.querySelector("main.page"))
            ?.scrollIntoView({ behavior, block: "start" });
    }

    scrollToScene(behavior = "smooth") {
        this.scene?.scrollIntoView({ behavior, block: "start" });
    }

    setIndexVisible(visible) {
        if (!this.index) return;
        if (this.index.classList.contains("is-visible") === visible) return;
        this.index.classList.toggle("is-visible", visible);
        this.index.setAttribute("aria-hidden", String(!visible));
        this.index.querySelectorAll("button").forEach((button) => {
            button.tabIndex = visible ? 0 : -1;
        });
    }

    setReadingProgress(progress) {
        if (!this.index) return;
        const normalized = Math.min(1, Math.max(0, Number(progress) || 0));
        const progressBar = this.index.querySelector("[data-interior-progress]");
        progressBar.style.setProperty("--reading-progress", normalized);
        progressBar.setAttribute("aria-valuenow", String(Math.round(normalized * 100)));
    }

    beginCityReveal() {
        this.document.body.classList.add("interior-city-arrival");
    }

    animateCityReveal() {
        this.scene?.classList.add("city-entry-revealing");
    }

    finishCityReveal() {
        this.scene?.classList.remove("city-entry-awaiting", "city-entry-revealing");
        this.document.body.classList.remove("interior-city-arrival");
    }

    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this.index?.remove();
        this.scene?.remove();
        this.main.classList.remove("interior-records");
        this.main.id = "main-content";
        this.document.body.classList.remove("interior-experience-page", "interior-city-arrival");
        delete this.document.body.dataset.room;
        this.scene = null;
        this.index = null;
    }

    #markup() {
        return `
            <div class="interior-scene">
                <img class="interior-scene-image" alt="">
                <div class="interior-scene-grade" aria-hidden="true"></div>
                <a class="interior-city-link" data-interior-city href="index.html?view=city">
                    <span aria-hidden="true">←</span><span></span>
                </a>
                <div class="interior-tools">
                    <button type="button" data-interior-theme aria-label="Toggle theme">◐</button>
                    <button type="button" data-interior-language></button>
                </div>
                <header class="interior-scene-copy">
                    <span data-interior-code></span>
                    <h1 data-interior-title></h1>
                    <strong data-interior-outline></strong>
                    <p data-interior-description></p>
                </header>
                <div class="scene-console scene-console--${this.room.console[0]}">
                    <section class="scene-display" data-scene-console aria-live="polite">
                        <header>
                            <span class="scene-display-live" data-terminal-status></span>
                            <span class="scene-console-label" data-console-label></span>
                            <code data-terminal-code></code>
                        </header>
                        <h2 data-terminal-title></h2>
                        <ul data-terminal-lines></ul>
                        <div class="scene-display-stats" data-terminal-stats></div>
                        <div class="scene-display-flow" data-terminal-flow></div>
                        <footer>
                            <strong data-terminal-metric></strong>
                            <button type="button" data-console-open>
                                <span></span><span aria-hidden="true">↘</span>
                            </button>
                        </footer>
                    </section>
                    <nav class="scene-channel-rail" style="--channel-count:${this.room.chapters.length}" aria-label="Scene channels">
                        ${this.#buttonMarkup("data-scene-channel")}
                    </nav>
                </div>
                <a class="interior-credit" target="_blank" rel="noopener noreferrer"></a>
            </div>
            <nav class="interior-section-index" aria-label="Content index" aria-hidden="true">
                <span data-interior-index-label></span>
                <div style="--interior-columns:${this.room.chapters.length}">
                    ${this.#buttonMarkup("data-interior-chapter")}
                </div>
                <div class="interior-reading-progress" data-interior-progress
                    role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                    <span></span>
                </div>
            </nav>`;
    }

    #buttonMarkup(attribute) {
        const sceneChannel = attribute === "data-scene-channel";
        return this.room.chapters.map((chapter, index) => {
            const number = String(index + 1).padStart(2, "0");
            return sceneChannel
                ? `<button type="button" ${attribute}="${chapter.id}" aria-pressed="false">
                    <b>${number}</b>
                    <span><strong></strong><small>${chapter.code}</small></span>
                    <i aria-hidden="true"></i>
                </button>`
                : `<button type="button" ${attribute}="${chapter.id}" aria-pressed="false">
                    <b>${number}</b>
                    <strong></strong>
                    <small>${chapter.code}</small>
                </button>`;
        }).join("");
    }

    #syncButtons(chapter, english) {
        this.room.chapters.forEach((item) => {
            const label = english ? item.en : item.zh;
            const buttons = [
                ...this.scene.querySelectorAll(`[data-scene-channel="${item.id}"]`),
                ...this.index.querySelectorAll(`[data-interior-chapter="${item.id}"]`)
            ];
            buttons.forEach((button) => {
                const active = item.id === chapter.id;
                button.classList.toggle("active", active);
                button.setAttribute("aria-pressed", String(active));
                button.setAttribute("aria-label", label);
                button.querySelector("strong").textContent = label;
            });
        });
    }

    #syncTerminal(chapter, terminal, english) {
        const panel = this.scene.querySelector("[data-scene-console]");
        panel.querySelector("[data-terminal-status]").textContent =
            english ? terminal.enStatus : terminal.zhStatus;
        panel.querySelector("[data-terminal-code]").textContent = chapter.code;
        panel.querySelector("[data-terminal-title]").textContent =
            english ? terminal.enTitle : terminal.zhTitle;
        panel.querySelector("[data-terminal-metric]").textContent = terminal.metric;
        panel.querySelector("[data-terminal-lines]").innerHTML =
            (english ? terminal.enLines : terminal.zhLines)
                .map((line, index) => `<li data-index="${String(index + 1).padStart(2, "0")}">${line}</li>`)
                .join("");
        panel.querySelector("[data-terminal-stats]").innerHTML =
            (english ? terminal.enStats : terminal.zhStats)
                .map(([label, value]) => `<span><small>${label}</small><strong>${value}</strong></span>`)
                .join("");
        panel.querySelector("[data-terminal-flow]").innerHTML =
            (english ? terminal.enFlow : terminal.zhFlow)
                .map((item, index) => `<span><b>${String(index + 1).padStart(2, "0")}</b>${item}</span>`)
                .join("");
        panel.querySelector("[data-console-label]").textContent =
            english ? this.room.console[2] : this.room.console[1];
        const open = panel.querySelector("[data-console-open]");
        const openLabel = english ? this.room.console[4] : this.room.console[3];
        open.querySelector("span:first-child").textContent = openLabel;
        open.setAttribute("aria-label", english ? `${openLabel}: ${chapter.en}` : `${openLabel}：${chapter.zh}`);
    }

    #syncControls(state, english) {
        const cityLabel = this.scene.querySelector("[data-interior-city] span:last-child");
        cityLabel.textContent = english ? "Return to city" : "返回城市";
        const themeButton = this.scene.querySelector("[data-interior-theme]");
        themeButton.title = state.theme === "paper"
            ? (english ? "Switch to cyber theme" : "切换到赛博主题")
            : (english ? "Switch to paper theme" : "切换到浅色主题");
        const languageButton = this.scene.querySelector("[data-interior-language]");
        languageButton.textContent = english ? "中" : "EN";
        languageButton.title = english ? "切换到中文" : "Switch to English";
    }

    #syncMedia(theme) {
        const offset = theme === "paper" ? 0 : 3;
        const [imageSrc, creditText, creditHref] = this.room.media.slice(offset, offset + 3);
        const image = this.scene.querySelector(".interior-scene-image");
        const credit = this.scene.querySelector(".interior-credit");
        if (image.getAttribute("src") !== imageSrc) image.src = imageSrc;
        credit.textContent = creditText;
        credit.href = creditHref;
    }
}
