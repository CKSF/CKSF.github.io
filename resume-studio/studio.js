(function () {
    "use strict";

    const DATA_URL = "../data/resume.json";
    const DB_NAME = "tianning-resume-studio";
    const STORE_NAME = "drafts";
    const DRAFT_KEY = "primary";
    const LAYOUT_KEY = "resume-studio:layout";

    const tabs = [
        { key: "basics", zh: "基础信息", en: "Basics" },
        { key: "work", zh: "工作", en: "Work" },
        { key: "education", zh: "教育", en: "Education" },
        { key: "research", zh: "科研", en: "Research" },
        { key: "projects", zh: "项目", en: "Projects" },
        { key: "skills", zh: "技能", en: "Skills" },
        { key: "publications", zh: "论文", en: "Publications" },
        { key: "languages", zh: "语言", en: "Languages" }
    ];

    const copy = {
        zh: {
            back: "返回职业档案",
            introTitle: "编辑内容，导出成正式 PDF。",
            introBody: "修改只保存在当前浏览器，不会自动发布到网站或写入 GitHub。",
            printAction: "导出 PDF",
            exportAction: "导出 JSON",
            importAction: "导入 JSON",
            resetAction: "恢复公开版本",
            editorAria: "简历编辑工具",
            sectionAria: "简历章节",
            previewAria: "PDF 实时预览",
            saved: "草稿已保存在此浏览器",
            saving: "正在保存本地草稿",
            error: "本地保存失败",
            add: "新增",
            sectionHint: "当前正在编辑中文版字段；日期与技术名词为双语共用。",
            basicsHint: "联系方式为双语共用，姓名、定位、简介和地点分别维护。",
            imported: "JSON 已导入并保存为本地草稿",
            exported: "JSON 已导出",
            reset: "已恢复仓库中的公开版本",
            invalid: "无法导入：文件不是有效的简历 JSON",
            print: "打印窗口将打开；请选择“另存为 PDF”并关闭页眉页脚。",
            format: "中文 · Letter",
            fit: "排版正常",
            overflow: "内容溢出",
            confirmReset: "恢复公开版本会删除当前浏览器中的全部简历草稿，继续吗？"
        },
        en: {
            back: "Back to career portfolio",
            introTitle: "Edit the source. Export the formal PDF.",
            introBody: "Changes stay in this browser and are never published to the website or written to GitHub automatically.",
            printAction: "Export PDF",
            exportAction: "Export JSON",
            importAction: "Import JSON",
            resetAction: "Restore public version",
            editorAria: "Resume editing tools",
            sectionAria: "Resume sections",
            previewAria: "Live PDF preview",
            saved: "Draft saved in this browser",
            saving: "Saving local draft",
            error: "Local save failed",
            add: "Add",
            sectionHint: "Editing English fields. Dates and technical terms are shared across languages.",
            basicsHint: "Contact details are shared; name, positioning, summary and location are localized.",
            imported: "JSON imported as a local draft",
            exported: "JSON exported",
            reset: "Restored the public repository version",
            invalid: "Import failed: this is not valid resume JSON",
            print: "The print dialog will open. Choose Save as PDF and disable headers and footers.",
            format: "English · Letter",
            fit: "Layout fits",
            overflow: "Content overflow",
            confirmReset: "Restoring the public version will delete every resume draft in this browser. Continue?"
        }
    };

    const state = {
        language: "zh",
        activeSection: "basics",
        data: null,
        publicData: null,
        saveTimer: 0,
        toastTimer: 0,
        previewReady: false,
        layout: {
            mode: "two",
            fontSize: 10.5,
            density: 1
        }
    };

    const refs = {
        tabs: document.querySelector("[data-section-tabs]"),
        panel: document.querySelector("[data-editor-panel]"),
        preview: document.querySelector("[data-preview]"),
        saveState: document.querySelector("[data-save-state]"),
        pageFormat: document.querySelector("[data-page-format]"),
        itemCount: document.querySelector("[data-item-count]"),
        layoutMode: document.querySelector("[data-layout-mode]"),
        fontSize: document.querySelector("[data-font-size]"),
        fontSizeValue: document.querySelector("[data-font-size-value]"),
        density: document.querySelector("[data-density]"),
        densityValue: document.querySelector("[data-density-value]"),
        fitStatus: document.querySelector("[data-fit-status]"),
        toast: document.querySelector("[data-toast]")
    };

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function loadLayout() {
        try {
            const saved = JSON.parse(localStorage.getItem(LAYOUT_KEY));
            if (!saved || typeof saved !== "object") return;
            state.layout.mode = saved.mode === "one" ? "one" : "two";
            state.layout.fontSize = Math.min(11, Math.max(8, Number(saved.fontSize) || 10.5));
            state.layout.density = Math.min(1.15, Math.max(0.65, Number(saved.density) || 1));
        } catch (error) {}
    }

    function saveLayout() {
        try {
            localStorage.setItem(LAYOUT_KEY, JSON.stringify(state.layout));
        } catch (error) {}
    }

    function updateLayoutControls() {
        refs.layoutMode.value = state.layout.mode;
        refs.fontSize.value = String(state.layout.fontSize);
        refs.fontSizeValue.value = `${state.layout.fontSize.toFixed(2).replace(/0$/, "")} pt`;
        refs.density.value = String(state.layout.density);
        refs.densityValue.value = `${Math.round(state.layout.density * 100)}%`;
        refs.fitStatus.textContent = state.language === "zh" ? "检查排版" : "Checking";
        refs.fitStatus.dataset.state = "";
    }

    function setLayoutStatus(pageCount, overflow) {
        refs.fitStatus.textContent = overflow
            ? copy[state.language].overflow
            : `${pageCount} ${pageCount === 1 ? "page" : "pages"} · ${copy[state.language].fit}`;
        refs.fitStatus.dataset.state = overflow ? "overflow" : "fit";
    }

    function getAtPath(root, path) {
        return path.split(".").reduce((value, key) => value == null ? undefined : value[key], root);
    }

    function setAtPath(root, path, value) {
        const parts = path.split(".");
        const finalKey = parts.pop();
        const target = parts.reduce((current, key) => {
            if (current[key] == null) current[key] = /^\d+$/.test(key) ? [] : {};
            return current[key];
        }, root);
        target[finalKey] = value;
    }

    function localized(value) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
            return value[state.language] || value.en || value.zh || "";
        }
        return value || "";
    }

    function localPath(path) {
        return `${path}.${state.language}`;
    }

    function input(label, path, options) {
        const settings = options || {};
        const actualPath = settings.localized ? localPath(path) : path;
        let value = getAtPath(state.data, actualPath);
        if (settings.lines && Array.isArray(value)) value = value.join("\n");
        if (settings.csv && Array.isArray(value)) value = value.join(", ");
        const control = settings.textarea
            ? `<textarea class="${settings.summary ? "summary" : ""}" data-path="${escapeHtml(actualPath)}" ${settings.lines ? 'data-format="lines"' : ""} ${settings.csv ? 'data-format="csv"' : ""}>${escapeHtml(value || "")}</textarea>`
            : `<input type="${settings.type || "text"}" value="${escapeHtml(value || "")}" data-path="${escapeHtml(actualPath)}">`;
        return `
            <label class="field ${settings.full ? "full" : ""}">
                <span>${escapeHtml(label)}</span>
                ${control}
                ${settings.hint ? `<small class="field-hint">${escapeHtml(settings.hint)}</small>` : ""}
            </label>`;
    }

    function cardHeader(title, section, index) {
        const items = state.data[section] || [];
        return `
            <div class="editor-card-head">
                <span class="editor-card-title">${escapeHtml(title || `${section} ${index + 1}`)}</span>
                <div class="item-actions">
                    <button type="button" data-action="up" data-section="${section}" data-index="${index}" aria-label="Move up" ${index === 0 ? "disabled" : ""}>↑</button>
                    <button type="button" data-action="down" data-section="${section}" data-index="${index}" aria-label="Move down" ${index === items.length - 1 ? "disabled" : ""}>↓</button>
                    <button type="button" class="remove" data-action="remove" data-section="${section}" data-index="${index}" aria-label="Remove">×</button>
                </div>
            </div>`;
    }

    function panelHeading(tab, addable) {
        return `
            <div class="panel-heading">
                <div>
                    <h2>${escapeHtml(tab[state.language])}</h2>
                    <p>${escapeHtml(tab.key === "basics" ? copy[state.language].basicsHint : copy[state.language].sectionHint)}</p>
                </div>
                ${addable ? `<button type="button" class="add-button" data-action="add" data-section="${tab.key}">+ ${escapeHtml(copy[state.language].add)}</button>` : ""}
            </div>`;
    }

    function renderBasics() {
        return `
            <div class="editor-card">
                <div class="field-grid">
                    ${input(state.language === "zh" ? "姓名" : "Name", "basics.name", { localized: true })}
                    ${input(state.language === "zh" ? "职业定位" : "Professional label", "basics.label", { localized: true })}
                    ${input("Email", "basics.email")}
                    ${input(state.language === "zh" ? "电话" : "Phone", "basics.phone")}
                    ${input("WeChat", "basics.wechat")}
                    ${input(state.language === "zh" ? "地点" : "Location", "basics.location", { localized: true })}
                    ${input(state.language === "zh" ? "求职状态" : "Availability", "basics.status", { localized: true, full: true })}
                    ${input(state.language === "zh" ? "职业简介" : "Summary", "basics.summary", { localized: true, textarea: true, summary: true, full: true })}
                </div>
            </div>`;
    }

    function renderExperience(section) {
        const isEducation = section === "education";
        const isProject = section === "projects";
        return (state.data[section] || []).map((item, index) => {
            const titlePath = isEducation ? "institution" : isProject ? "name" : "position";
            const subtitlePath = isEducation ? "position" : isProject ? "description" : "organization";
            const base = `${section}.${index}`;
            return `
                <article class="editor-card">
                    ${cardHeader(localized(item[titlePath]), section, index)}
                    <div class="field-grid">
                        ${input(isEducation
                            ? (state.language === "zh" ? "学校" : "Institution")
                            : isProject
                                ? (state.language === "zh" ? "项目名称" : "Project name")
                                : (state.language === "zh" ? "职位" : "Position"), `${base}.${titlePath}`, { localized: true })}
                        ${input(isEducation
                            ? (state.language === "zh" ? "学位与方向" : "Degree & focus")
                            : isProject
                                ? (state.language === "zh" ? "项目定位" : "Project descriptor")
                                : (state.language === "zh" ? "组织" : "Organization"), `${base}.${subtitlePath}`, { localized: true })}
                        ${!isProject ? input(state.language === "zh" ? "地点" : "Location", `${base}.location`, { localized: true }) : ""}
                        ${input(state.language === "zh" ? "开始时间" : "Start date", `${base}.startDate`)}
                        ${input(state.language === "zh" ? "结束时间" : "End date", `${base}.endDate`, { localized: typeof item.endDate === "object" })}
                        ${input(state.language === "zh" ? "要点（每行一条）" : "Highlights (one per line)", `${base}.highlights`, { localized: true, textarea: true, lines: true, full: true })}
                    </div>
                </article>`;
        }).join("");
    }

    function renderSkills() {
        return (state.data.skills || []).map((item, index) => {
            const base = `skills.${index}`;
            return `
                <article class="editor-card">
                    ${cardHeader(localized(item.name), "skills", index)}
                    <div class="field-grid">
                        ${input(state.language === "zh" ? "技能组名称" : "Group name", `${base}.name`, { localized: true })}
                        ${input(state.language === "zh" ? "关键词（逗号分隔）" : "Keywords (comma separated)", `${base}.keywords`, { textarea: true, csv: true, full: true })}
                    </div>
                </article>`;
        }).join("");
    }

    function renderPublications() {
        return (state.data.publications || []).map((item, index) => {
            const base = `publications.${index}`;
            return `
                <article class="editor-card">
                    ${cardHeader(localized(item.name), "publications", index)}
                    <div class="field-grid">
                        ${input(state.language === "zh" ? "论文标题" : "Title", `${base}.name`, { localized: true, full: true })}
                        ${input(state.language === "zh" ? "作者" : "Authors", `${base}.authors`, { full: true })}
                        ${input(state.language === "zh" ? "会议与成果" : "Venue & result", `${base}.publisher`, { full: true })}
                    </div>
                </article>`;
        }).join("");
    }

    function renderLanguages() {
        return (state.data.languages || []).map((item, index) => {
            const base = `languages.${index}`;
            return `
                <article class="editor-card">
                    ${cardHeader(localized(item.language), "languages", index)}
                    <div class="field-grid">
                        ${input(state.language === "zh" ? "语言" : "Language", `${base}.language`, { localized: true })}
                        ${input(state.language === "zh" ? "熟练度" : "Fluency", `${base}.fluency`, { localized: true })}
                    </div>
                </article>`;
        }).join("");
    }

    function renderEditor() {
        const tab = tabs.find((item) => item.key === state.activeSection);
        const addable = tab.key !== "basics";
        let content = "";
        if (tab.key === "basics") content = renderBasics();
        else if (["work", "education", "research", "projects"].includes(tab.key)) content = renderExperience(tab.key);
        else if (tab.key === "skills") content = renderSkills();
        else if (tab.key === "publications") content = renderPublications();
        else if (tab.key === "languages") content = renderLanguages();
        refs.panel.innerHTML = panelHeading(tab, addable) + content;
    }

    function renderTabs() {
        refs.tabs.innerHTML = tabs.map((tab) => `
            <button type="button" data-tab="${tab.key}" class="${tab.key === state.activeSection ? "active" : ""}">
                ${escapeHtml(tab[state.language])}
            </button>`).join("");
    }

    function updateLanguageControls() {
        document.documentElement.lang = state.language === "zh" ? "zh-CN" : "en";
        const uiCopy = copy[state.language];
        const uiValues = {
            back: uiCopy.back,
            introTitle: uiCopy.introTitle,
            introBody: uiCopy.introBody,
            print: uiCopy.printAction,
            export: uiCopy.exportAction,
            import: uiCopy.importAction,
            reset: uiCopy.resetAction
        };
        Object.entries(uiValues).forEach(([key, value]) => {
            const element = document.querySelector(`[data-ui="${key}"]`);
            if (element) element.textContent = value;
        });
        document.querySelector(".studio-sidebar").setAttribute("aria-label", uiCopy.editorAria);
        refs.tabs.setAttribute("aria-label", uiCopy.sectionAria);
        document.querySelector(".preview-workspace").setAttribute("aria-label", uiCopy.previewAria);
        document.querySelectorAll("[data-language]").forEach((button) => {
            button.classList.toggle("active", button.dataset.language === state.language);
        });
        refs.pageFormat.textContent = copy[state.language].format;
        refs.preview.title = state.language === "zh" ? "中文简历 PDF 预览" : "English resume PDF preview";
        refs.fitStatus.textContent = state.language === "zh" ? "检查排版" : "Checking";
        refs.fitStatus.dataset.state = "";
    }

    function updateCount() {
        const count = tabs
            .filter((tab) => Array.isArray(state.data[tab.key]))
            .reduce((sum, tab) => sum + state.data[tab.key].length, 0);
        refs.itemCount.textContent = `${count} items`;
    }

    function postPreview(type) {
        if (!state.previewReady || !state.data) return;
        refs.preview.contentWindow.postMessage({
            type: type || "resume:update",
            payload: state.data,
            language: state.language,
            layout: state.layout
        }, location.origin);
    }

    function setSaveState(status) {
        refs.saveState.dataset.state = status;
        refs.saveState.textContent = status === "saved"
            ? copy[state.language].saved
            : status === "error"
                ? copy[state.language].error
                : copy[state.language].saving;
    }

    function showToast(message) {
        clearTimeout(state.toastTimer);
        refs.toast.textContent = message;
        refs.toast.hidden = false;
        state.toastTimer = setTimeout(() => {
            refs.toast.hidden = true;
        }, 3200);
    }

    function openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function readDraft() {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const request = transaction.objectStore(STORE_NAME).get(DRAFT_KEY);
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
            transaction.oncomplete = () => db.close();
        });
    }

    async function writeDraft(value) {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            transaction.objectStore(STORE_NAME).put(value, DRAFT_KEY);
            transaction.oncomplete = () => {
                db.close();
                resolve();
            };
            transaction.onerror = () => reject(transaction.error);
        });
    }

    async function deleteDraft() {
        const db = await openDatabase();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            transaction.objectStore(STORE_NAME).delete(DRAFT_KEY);
            transaction.oncomplete = () => {
                db.close();
                resolve();
            };
            transaction.onerror = () => reject(transaction.error);
        });
    }

    function queueSave() {
        clearTimeout(state.saveTimer);
        setSaveState("saving");
        postPreview();
        state.saveTimer = setTimeout(async () => {
            try {
                await writeDraft({
                    data: state.data,
                    updatedAt: new Date().toISOString()
                });
                setSaveState("saved");
            } catch (error) {
                setSaveState("error");
            }
        }, 350);
    }

    function emptyItem(section) {
        if (["work", "research"].includes(section)) {
            return {
                position: { zh: "新职位", en: "New position" },
                organization: { zh: "组织名称", en: "Organization" },
                location: { zh: "", en: "" },
                startDate: "",
                endDate: { zh: "至今", en: "Present" },
                highlights: { zh: [""], en: [""] }
            };
        }
        if (section === "education") {
            return {
                institution: { zh: "学校名称", en: "Institution" },
                position: { zh: "学位与方向", en: "Degree & focus" },
                location: { zh: "", en: "" },
                startDate: "",
                endDate: "",
                highlights: { zh: [""], en: [""] }
            };
        }
        if (section === "projects") {
            return {
                name: { zh: "新项目", en: "New project" },
                description: { zh: "项目定位", en: "Project descriptor" },
                startDate: "",
                endDate: { zh: "至今", en: "Present" },
                highlights: { zh: [""], en: [""] }
            };
        }
        if (section === "skills") return { name: { zh: "技能组", en: "Skill group" }, keywords: [] };
        if (section === "publications") return { name: { zh: "论文标题", en: "Publication title" }, publisher: "", authors: "" };
        return { language: { zh: "语言", en: "Language" }, fluency: { zh: "熟练度", en: "Fluency" } };
    }

    function handleItemAction(button) {
        const section = button.dataset.section;
        const action = button.dataset.action;
        const items = state.data[section];
        if (!Array.isArray(items)) return;
        if (action === "add") items.push(emptyItem(section));
        else {
            const index = Number(button.dataset.index);
            if (action === "remove") items.splice(index, 1);
            if (action === "up" && index > 0) [items[index - 1], items[index]] = [items[index], items[index - 1]];
            if (action === "down" && index < items.length - 1) [items[index + 1], items[index]] = [items[index], items[index + 1]];
        }
        renderEditor();
        updateCount();
        queueSave();
    }

    function exportJson() {
        const blob = new Blob([JSON.stringify(state.data, null, 2) + "\n"], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `tianning-feng-resume-${new Date().toISOString().slice(0, 10)}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
        showToast(copy[state.language].exported);
    }

    async function importJson(file) {
        try {
            const parsed = JSON.parse(await file.text());
            if (!parsed.basics || !Array.isArray(parsed.work) || !Array.isArray(parsed.education)) throw new Error("Invalid schema");
            state.data = parsed;
            renderTabs();
            renderEditor();
            updateCount();
            postPreview();
            await writeDraft({ data: state.data, updatedAt: new Date().toISOString() });
            setSaveState("saved");
            showToast(copy[state.language].imported);
        } catch (error) {
            showToast(copy[state.language].invalid);
        }
    }

    async function resetDraft() {
        if (!confirm(copy[state.language].confirmReset)) return;
        await deleteDraft();
        state.data = clone(state.publicData);
        renderTabs();
        renderEditor();
        updateCount();
        postPreview();
        setSaveState("saved");
        showToast(copy[state.language].reset);
    }

    function bindEvents() {
        document.querySelectorAll("[data-language]").forEach((button) => {
            button.addEventListener("click", () => {
                state.language = button.dataset.language === "en" ? "en" : "zh";
                updateLanguageControls();
                renderTabs();
                renderEditor();
                setSaveState("saved");
                postPreview();
            });
        });

        refs.layoutMode.addEventListener("change", () => {
            state.layout.mode = refs.layoutMode.value === "one" ? "one" : "two";
            if (state.layout.mode === "one") {
                state.layout.fontSize = 9.25;
                state.layout.density = 0.7;
            } else {
                state.layout.fontSize = 10.5;
                state.layout.density = 1;
            }
            updateLayoutControls();
            saveLayout();
            postPreview();
        });

        refs.fontSize.addEventListener("input", () => {
            state.layout.fontSize = Number(refs.fontSize.value);
            updateLayoutControls();
            saveLayout();
            postPreview();
        });

        refs.density.addEventListener("input", () => {
            state.layout.density = Number(refs.density.value);
            updateLayoutControls();
            saveLayout();
            postPreview();
        });

        refs.tabs.addEventListener("click", (event) => {
            const button = event.target.closest("[data-tab]");
            if (!button) return;
            state.activeSection = button.dataset.tab;
            renderTabs();
            renderEditor();
        });

        refs.panel.addEventListener("input", (event) => {
            const control = event.target.closest("[data-path]");
            if (!control) return;
            let value = control.value;
            if (control.dataset.format === "lines") value = value.split("\n").map((line) => line.trim()).filter(Boolean);
            if (control.dataset.format === "csv") value = value.split(",").map((item) => item.trim()).filter(Boolean);
            setAtPath(state.data, control.dataset.path, value);
            queueSave();
        });

        refs.panel.addEventListener("click", (event) => {
            const button = event.target.closest("[data-action]");
            if (button) handleItemAction(button);
        });

        document.querySelector("[data-export]").addEventListener("click", exportJson);
        document.querySelector("[data-import]").addEventListener("change", (event) => {
            const file = event.target.files && event.target.files[0];
            if (file) importJson(file);
            event.target.value = "";
        });
        document.querySelector("[data-reset]").addEventListener("click", resetDraft);
        document.querySelector("[data-print]").addEventListener("click", () => {
            showToast(copy[state.language].print);
            postPreview("resume:print");
        });

        addEventListener("message", (event) => {
            if (event.origin !== location.origin) return;
            if (event.data && event.data.type === "resume:ready") {
                state.previewReady = true;
                postPreview();
            }
            if (event.data && event.data.type === "resume:layout-status") {
                setLayoutStatus(event.data.pageCount, Boolean(event.data.overflow));
            }
        });
    }

    async function initialize() {
        loadLayout();
        updateLayoutControls();
        bindEvents();
        try {
            const response = await fetch(DATA_URL);
            if (!response.ok) throw new Error("Unable to fetch resume data");
            state.publicData = await response.json();
            let draft = null;
            try {
                draft = await readDraft();
            } catch (error) {}
            state.data = clone(draft && draft.data ? draft.data : state.publicData);
            renderTabs();
            renderEditor();
            updateLanguageControls();
            updateCount();
            setSaveState("saved");
            postPreview();
        } catch (error) {
            refs.panel.innerHTML = '<div class="loading-card">无法读取 data/resume.json。请通过本地服务器访问此页面。</div>';
            setSaveState("error");
        }
    }

    initialize();
})();
