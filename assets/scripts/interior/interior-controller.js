function debugState(windowRef) {
    const root = windowRef.__siteRuntimeDebug ||= {};
    return root.interior ||= {
        activeInstances: 0,
        listenerCount: 0,
        timeoutCount: 0,
        animationFrameCount: 0
    };
}

export class InteriorController {
    #abortController = new AbortController();
    #listenerTokens = new Set();
    #timers = new Set();
    #frames = new Set();
    #unsubscribe = null;
    #disposed = false;

    constructor({ model, renderer, room, windowRef = window, documentRef = document }) {
        this.model = model;
        this.renderer = renderer;
        this.room = room;
        this.window = windowRef;
        this.document = documentRef;
        this.debug = debugState(windowRef);
        this.reducedMotion = windowRef.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    mount({ requestedChapter = null, cityEntry = false } = {}) {
        const scene = this.renderer.mount({ cityEntry });
        if (!scene) return null;

        this.debug.activeInstances += 1;
        this.#unsubscribe = this.model.subscribe((state) => {
            this.renderer.render(state);
            this.renderer.setCityHref(this.#themeHref("index.html?view=city"));
        });
        this.#bindInteractions();
        this.#observeNavigationHandoff();
        this.#applyFilter(this.model.state.activeChapter);
        this.#prepareImage();

        if (requestedChapter && !cityEntry) {
            this.#frame(() => this.renderer.scrollToChapter(this.#chapter(requestedChapter)));
        }
        return scene;
    }

    revealFromCity() {
        const scene = this.renderer.scene;
        if (!scene?.classList.contains("city-entry-awaiting")) return;
        this.renderer.beginCityReveal();
        let revealed = false;
        const reveal = () => {
            if (revealed || this.#disposed) return;
            revealed = true;
            this.#frame(() => this.renderer.animateCityReveal());
            this.#setTimer(() => {
                this.renderer.finishCityReveal();
                const current = new URL(this.window.location.href);
                current.searchParams.delete("entry");
                current.searchParams.set("space", "interior");
                this.window.history.replaceState(null, "", current);
            }, 1050);
        };
        const fallback = this.#setTimer(reveal, 900);
        this.#listen(scene, "interior-scene-ready", () => {
            this.#clearTimer(fallback);
            this.#setTimer(reveal, 90);
        }, { once: true });
    }

    dispose() {
        if (this.#disposed) return;
        this.#disposed = true;
        this.#abortController.abort();
        this.debug.listenerCount -= this.#listenerTokens.size;
        this.#listenerTokens.clear();
        [...this.#timers].forEach((timer) => this.#clearTimer(timer));
        [...this.#frames].forEach((frame) => this.#cancelFrame(frame));
        this.#unsubscribe?.();
        this.model.dispose();
        this.renderer.dispose();
        this.debug.activeInstances = Math.max(0, this.debug.activeInstances - 1);
    }

    #bindInteractions() {
        const scene = this.renderer.scene;
        const stage = scene.querySelector(".interior-scene");
        scene.querySelectorAll("[data-scene-channel]").forEach((button) => {
            this.#listen(button, "click", () => this.#select(button.dataset.sceneChannel));
        });
        this.renderer.index.querySelectorAll("[data-interior-chapter]").forEach((button) => {
            this.#listen(button, "click", () => {
                const chapter = this.#chapter(button.dataset.interiorChapter);
                this.#select(chapter.id);
                this.#frame(() => this.renderer.scrollToChapter(
                    chapter,
                    this.reducedMotion ? "auto" : "smooth"
                ));
            });
            this.#listen(button, "mouseenter", () => this.model.setIndexPreview(button.dataset.interiorChapter));
            this.#listen(button, "mouseleave", () => this.model.setIndexPreview(null));
        });
        this.#listen(scene.querySelector("[data-console-open]"), "click", () => this.#open());
        this.#listen(scene.querySelector("[data-interior-theme]"), "click", () => {
            this.document.querySelector(".global-nav [data-theme-toggle]")?.click();
        });
        this.#listen(scene.querySelector("[data-interior-language]"), "click", () => {
            this.document.querySelector(".global-nav [data-lang-toggle]")?.click();
        });
        this.#listen(this.window, "site-language-change", (event) => {
            this.model.setLanguage(event.detail?.language || this.#language());
            this.#applyFilter(this.model.state.activeChapter);
            this.#frame(() => this.#syncReadingState());
        });
        this.#listen(this.window, "site-theme-change", (event) => {
            this.model.setTheme(event.detail?.theme || this.#theme());
        });
        this.#listen(this.window, "blog-filter-change", (event) => {
            const category = event.detail?.category;
            const chapter = this.room.chapters.find((item) => item.filter === category);
            if (!chapter || chapter.id === this.model.state.activeChapter) return;
            this.model.selectChapter(chapter.id);
            this.#syncUrl(chapter.id);
        });
        this.#listen(this.document, "keydown", (event) => {
            if (event.key !== "Escape" || !this.model.state.recordOpening) return;
            this.#clearOpenTimers();
            this.model.setRecordOpening(false);
            this.renderer.scrollToScene(this.reducedMotion ? "auto" : "smooth");
        });

        const finePointer = this.window.matchMedia("(pointer: fine)").matches;
        if (finePointer && !this.reducedMotion) {
            this.#listen(stage, "pointermove", (event) => {
                const rect = stage.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
                const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
                this.renderer.setParallax((-x * 7).toFixed(2), (-y * 5).toFixed(2));
            });
            this.#listen(stage, "pointerleave", () => this.renderer.setParallax("0", "0"));
        }
    }

    #observeNavigationHandoff() {
        const sceneNavigation = this.renderer.scene?.querySelector(".scene-channel-rail");
        if (!sceneNavigation) {
            this.renderer.setIndexVisible(true);
            return;
        }
        let scheduled = false;
        const sync = () => {
            scheduled = false;
            const indexVisible = sceneNavigation.getBoundingClientRect().bottom <= 0;
            this.renderer.setIndexVisible(indexVisible);
            if (indexVisible) this.#syncReadingState();
            else this.renderer.setReadingProgress(0);
        };
        const schedule = () => {
            if (scheduled) return;
            scheduled = true;
            this.#frame(sync);
        };
        this.#listen(this.window, "scroll", schedule, { passive: true });
        this.#listen(this.window, "resize", schedule, { passive: true });
        sync();
    }

    #syncReadingState() {
        const entries = this.room.chapters
            .map((chapter) => ({ chapter, target: this.renderer.targetFor(chapter) }))
            .filter(({ target }) => target);
        if (!entries.length) return;

        const indexHeight = this.renderer.index.getBoundingClientRect().height;
        const readingLine = indexHeight + Math.min(150, this.window.innerHeight * 0.2);
        let active = entries[0];
        entries.forEach((entry) => {
            if (entry.target.getBoundingClientRect().top <= readingLine) active = entry;
        });

        const hasDistinctTargets = new Set(entries.map(({ target }) => target)).size > 1;
        if (hasDistinctTargets && active.chapter.id !== this.model.state.activeChapter) {
            this.model.selectChapter(active.chapter.id);
            this.#syncUrl(active.chapter.id);
        }

        const firstRect = entries[0].target.getBoundingClientRect();
        const lastRect = entries.at(-1).target.getBoundingClientRect();
        const contentStart = this.window.scrollY + firstRect.top - indexHeight;
        const contentEnd = Math.max(
            contentStart + 1,
            this.window.scrollY + lastRect.bottom - this.window.innerHeight
        );
        this.renderer.setReadingProgress(
            (this.window.scrollY - contentStart) / (contentEnd - contentStart)
        );
    }

    #prepareImage() {
        const image = this.renderer.scene.querySelector(".interior-scene-image");
        if (image.complete && image.naturalWidth) {
            this.#frame(() => this.renderer.markReady());
        } else {
            this.#listen(image, "load", () => this.renderer.markReady(), { once: true });
        }
    }

    #select(chapterId, { updateUrl = true } = {}) {
        const chapter = this.#chapter(chapterId);
        if (!chapter) return;
        this.#clearOpenTimers();
        this.model.selectChapter(chapter.id);
        this.#applyFilter(chapter.id);
        if (updateUrl) this.#syncUrl(chapter.id);
    }

    #open() {
        const chapter = this.#chapter(this.model.state.activeChapter);
        if (!chapter) return;
        this.#select(chapter.id);
        this.model.setRecordOpening(true);
        const timer = this.#setTimer(() => {
            this.openTimer = null;
            if (this.model.state.activeChapter === chapter.id) this.renderer.scrollToChapter(chapter);
        }, 620);
        this.openTimer = timer;
    }

    #applyFilter(chapterId) {
        const filter = this.#chapter(chapterId)?.filter;
        if (!filter) return;
        this.document.querySelector(`.lang-block.active .filter-btn[data-cat="${filter}"]`)?.click();
    }

    #syncUrl(chapterId) {
        const current = new URL(this.window.location.href);
        current.searchParams.set("space", "interior");
        current.searchParams.set("section", chapterId);
        this.window.history.replaceState(null, "", current);
    }

    #themeHref(href) {
        const target = new URL(href, this.window.location.href);
        if (this.model.state.theme === "paper") target.searchParams.set("theme", "light");
        return `${target.pathname.split("/").pop()}${target.search}${target.hash}`;
    }

    #chapter(chapterId) {
        return this.room.chapters.find((chapter) => chapter.id === chapterId) || this.room.chapters[0];
    }

    #language() {
        return this.document.documentElement.lang.startsWith("en") ? "en" : "zh";
    }

    #theme() {
        return this.document.documentElement.dataset.siteTheme === "paper" ? "paper" : "signature";
    }

    #listen(target, type, listener, options = {}) {
        if (!target) return;
        const token = {};
        this.#listenerTokens.add(token);
        this.debug.listenerCount += 1;
        const wrapped = options.once
            ? (...args) => {
                if (this.#listenerTokens.delete(token)) this.debug.listenerCount -= 1;
                listener(...args);
            }
            : listener;
        target.addEventListener(type, wrapped, { ...options, signal: this.#abortController.signal });
    }

    #setTimer(callback, delay) {
        const timer = this.window.setTimeout(() => {
            if (this.#timers.delete(timer)) this.debug.timeoutCount -= 1;
            callback();
        }, delay);
        this.#timers.add(timer);
        this.debug.timeoutCount += 1;
        return timer;
    }

    #clearTimer(timer) {
        if (timer == null) return;
        this.window.clearTimeout(timer);
        if (this.#timers.delete(timer)) this.debug.timeoutCount -= 1;
    }

    #clearOpenTimers() {
        this.#clearTimer(this.openTimer);
        this.openTimer = null;
    }

    #frame(callback) {
        const frame = this.window.requestAnimationFrame(() => {
            if (this.#frames.delete(frame)) this.debug.animationFrameCount -= 1;
            callback();
        });
        this.#frames.add(frame);
        this.debug.animationFrameCount += 1;
        return frame;
    }

    #cancelFrame(frame) {
        this.window.cancelAnimationFrame(frame);
        if (this.#frames.delete(frame)) this.debug.animationFrameCount -= 1;
    }
}
