export class InteriorModel {
    #state;
    #chapterIds;
    #subscribers = new Set();
    #disposed = false;

    constructor({ chapters, activeChapter, language = "zh", theme = "signature" }) {
        this.#chapterIds = new Set(chapters.map((chapter) => chapter.id));
        this.#state = Object.freeze({
            activeChapter: this.#normalizeChapter(activeChapter),
            language: language === "en" ? "en" : "zh",
            theme: theme === "paper" ? "paper" : "signature",
            recordOpening: false,
            indexPreview: null
        });
    }

    get state() {
        return this.#state;
    }

    subscribe(listener) {
        if (this.#disposed) return () => {};
        this.#subscribers.add(listener);
        listener(this.#state);
        return () => this.#subscribers.delete(listener);
    }

    selectChapter(chapterId) {
        this.#update({ activeChapter: this.#normalizeChapter(chapterId), recordOpening: false });
    }

    setLanguage(language) {
        this.#update({ language: language === "en" ? "en" : "zh" });
    }

    setTheme(theme) {
        this.#update({ theme: theme === "paper" ? "paper" : "signature" });
    }

    setRecordOpening(open) {
        this.#update({ recordOpening: Boolean(open) });
    }

    setIndexPreview(chapterId) {
        this.#update({ indexPreview: this.#chapterIds.has(chapterId) ? chapterId : null });
    }

    serialize() {
        const { activeChapter, language, theme } = this.#state;
        return { activeChapter, language, theme };
    }

    dispose() {
        if (this.#disposed) return;
        this.#disposed = true;
        this.#subscribers.clear();
    }

    #normalizeChapter(chapterId) {
        return this.#chapterIds.has(chapterId) ? chapterId : this.#chapterIds.values().next().value;
    }

    #update(patch) {
        if (this.#disposed) return;
        const next = Object.freeze({ ...this.#state, ...patch });
        if (Object.keys(patch).every((key) => next[key] === this.#state[key])) return;
        this.#state = next;
        this.#subscribers.forEach((listener) => listener(next));
    }
}
