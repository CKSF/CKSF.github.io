(function () {
    "use strict";

    const documentRoot = document.querySelector("[data-document]");
    const pageSizeStyle = document.getElementById("page-size");
    const params = new URLSearchParams(location.search);
    let language = params.get("lang") === "en" ? "en" : "zh";
    const requestedDataUrl = params.get("data");
    const dataUrl = requestedDataUrl
        ? new URL(requestedDataUrl, location.href)
        : new URL("../data/resume-official.json", location.href);
    if (dataUrl.origin !== location.origin) {
        dataUrl.href = new URL("../data/resume-official.json", location.href).href;
    }
    let resumeData = null;
    let layoutSettings = {
        mode: "two",
        fontSize: 10.5,
        density: 1,
        template: "classic",
        marginTop: 0,
        marginSide: 0
    };

    const labels = {
        zh: {
            summary: "个人简介",
            education: "教育背景",
            work: "工作经历",
            research: "科研经历",
            projects: "项目经历",
            skills: "技能",
            publications: "论文",
            languages: "语言"
        },
        en: {
            summary: "Summary",
            education: "Education",
            work: "Professional Experience",
            research: "Research Experience",
            projects: "Project",
            skills: "Skill",
            publications: "Publication",
            languages: "Languages"
        }
    };

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function localized(value) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
            return value[language] || value.en || value.zh || "";
        }
        return value || "";
    }

    function normalizeLayout(value) {
        const next = value && typeof value === "object" ? value : {};
        const fontSize = Number(next.fontSize);
        const density = Number(next.density);
        const marginTop = Number(next.marginTop);
        const marginSide = Number(next.marginSide);
        const templates = [
            "classic", "modern", "executive", "swiss", "terminal", "editorial", "bold",
            "orbit", "blueprint", "timeline", "bauhaus"
        ];
        return {
            mode: next.mode === "one" ? "one" : "two",
            fontSize: Number.isFinite(fontSize) ? Math.min(11, Math.max(9, fontSize)) : 10.5,
            density: Number.isFinite(density) ? Math.min(1.15, Math.max(0.65, density)) : 1,
            template: templates.includes(next.template) ? next.template : "classic",
            marginTop: Number.isFinite(marginTop) ? Math.min(15, Math.max(-10, marginTop)) : 0,
            marginSide: Number.isFinite(marginSide) ? Math.min(12, Math.max(-10, marginSide)) : 0
        };
    }

    function applyLayout() {
        document.documentElement.dataset.layout = layoutSettings.mode;
        document.documentElement.dataset.template = layoutSettings.template;
        document.documentElement.style.setProperty("--resume-font-size", `${layoutSettings.fontSize}pt`);
        document.documentElement.style.setProperty("--resume-density", String(layoutSettings.density));
        document.documentElement.style.setProperty(
            "--resume-line-height",
            String(1 + (0.13 * layoutSettings.density))
        );
        document.documentElement.style.setProperty("--resume-margin-top", `${layoutSettings.marginTop}mm`);
        document.documentElement.style.setProperty("--resume-margin-side", `${layoutSettings.marginSide}mm`);
    }

    function dateRange(item) {
        const start = localized(item.startDate);
        const end = localized(item.endDate);
        return [start, end].filter(Boolean).join(" – ");
    }

    function sectionHeading(title) {
        return `
            <div class="section-heading">
                <h2>${escapeHtml(title)}</h2>
            </div>`;
    }

    function entryHeading(item, type) {
        let primary = "";
        let secondary = "";
        let location = "";
        let separator = " – ";

        if (type === "education") {
            primary = localized(item.institution);
            secondary = localized(item.position);
            separator = ", ";
        } else if (type === "projects") {
            primary = localized(item.name);
            secondary = localized(item.description);
            separator = " — ";
        } else {
            primary = localized(item.organization);
            secondary = localized(item.position);
            location = localized(item.location);
        }

        return `
            <span class="entry-primary">${escapeHtml(primary)}</span>${location ? ` (${escapeHtml(location)})` : ""}${secondary ? `${separator}${escapeHtml(secondary)}` : ""}`;
    }

    function renderEntries(items, type) {
        return (items || []).map((item) => {
            const highlights = localized(item.highlights);
            const list = Array.isArray(highlights) && highlights.length
                ? `<ul>${highlights.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`
                : "";
            return `
                <article class="entry">
                    <div class="entry-head">
                        <h3>${entryHeading(item, type)}</h3>
                        <span class="entry-date">${escapeHtml(dateRange(item))}</span>
                    </div>
                    ${list}
                </article>`;
        }).join("");
    }

    function renderSection(title, items, type) {
        if (!items || !items.length) return "";
        return `
            <section class="section">
                ${sectionHeading(title)}
                ${renderEntries(items, type)}
            </section>`;
    }

    function renderSummary(data) {
        const summary = localized((data.basics || {}).summary);
        if (!summary) return "";
        return `
            <section class="section summary-section">
                ${sectionHeading(labels[language].summary)}
                <p class="summary">${escapeHtml(summary)}</p>
            </section>`;
    }

    function renderSkills(data) {
        const skills = (data.skills || []).map((group) => {
            const body = group.description
                ? escapeHtml(localized(group.description))
                : (group.keywords || []).map(escapeHtml).join(", ");
            return `
            <div class="skill-row">
                <strong>${escapeHtml(localized(group.name))}:</strong>
                ${body}
            </div>`;
        }).join("");
        if (!skills) return "";
        return `
            <section class="section">
                ${sectionHeading(labels[language].skills)}
                <div class="compact-list">${skills}</div>
            </section>`;
    }

    function renderPublications(data) {
        const publications = (data.publications || []).map((publication) => `
            <article class="publication">
                ${escapeHtml(publication.authors)}.
                <strong>${escapeHtml(localized(publication.name))}.</strong>
                ${escapeHtml(publication.publisher)}.
            </article>`).join("");
        if (!publications) return "";
        return `
            <section class="section">
                ${sectionHeading(labels[language].publications)}
                ${publications}
            </section>`;
    }

    function renderHeader(data) {
        const basics = data.basics || {};
        const profiles = basics.profiles || [];
        const linkedIn = profiles.find((item) => item.network === "LinkedIn");
        const github = profiles.find((item) => item.network === "GitHub");
        return `
            <header class="resume-header">
                <h1 class="resume-name">${escapeHtml(localized(basics.name))}</h1>
                <p class="resume-label">${escapeHtml(localized(basics.label))}</p>
                <div class="contact-line">
                    <span>${escapeHtml(basics.phone)}</span>
                    <a href="mailto:${escapeHtml(basics.email)}">${escapeHtml(basics.email)}</a>
                    ${github ? `<a href="${escapeHtml(github.url)}">github.com/${escapeHtml(github.username)}</a>` : ""}
                    ${linkedIn ? `<a href="${escapeHtml(linkedIn.url)}">linkedin.com/in/${escapeHtml(linkedIn.username)}</a>` : ""}
                </div>
            </header>`;
    }

    function page(content, extraClass) {
        return `
            <article class="resume-page ${extraClass || ""}">
                <div class="visual-decor" aria-hidden="true">
                    <span></span><span></span><span></span><span></span>
                </div>
                <div class="resume-content">${content}</div>
            </article>`;
    }

    function renderOnePage(data) {
        const l = labels[language];
        const content = `
            ${renderHeader(data)}
            ${renderSummary(data)}
            ${renderSection(l.education, data.education, "education")}
            ${renderSection(l.work, data.work, "work")}
            ${renderSection(l.research, data.research, "research")}
            ${renderSection(l.projects, data.projects, "projects")}
            ${renderSkills(data)}
            ${renderPublications(data)}`;
        return page(content, "page-one single-page");
    }

    function renderTwoPages(data) {
        const l = labels[language];
        const firstPage = `
            ${renderHeader(data)}
            ${renderSummary(data)}
            ${renderSection(l.education, data.education, "education")}
            ${renderSection(l.work, data.work, "work")}`;
        const secondPage = `
            ${renderSection(l.research, data.research, "research")}
            ${renderSection(l.projects, data.projects, "projects")}
            ${renderSkills(data)}
            ${renderPublications(data)}`;
        return page(firstPage, "page-one") + page(secondPage, "page-two");
    }

    function reportLayout() {
        const pages = Array.from(documentRoot.querySelectorAll(".resume-page"));
        const overflow = pages.some((page) => page.scrollHeight > page.clientHeight + 1);
        document.documentElement.dataset.resumeReady = "true";
        document.documentElement.dataset.resumeOverflow = String(overflow);
        document.documentElement.dataset.resumePages = String(pages.length);
        parent.postMessage({
            type: "resume:layout-status",
            pageCount: pages.length,
            overflow
        }, location.origin);
    }

    function render() {
        if (!resumeData) return;
        document.documentElement.dataset.language = language;
        document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
        applyLayout();
        pageSizeStyle.textContent = "@page { size: letter; margin: 0; }";
        document.title = language === "zh"
            ? "冯天宁_简历"
            : "Tianning_Feng_Resume";
        documentRoot.innerHTML = layoutSettings.mode === "one"
            ? renderOnePage(resumeData)
            : renderTwoPages(resumeData);
        reportLayout();
        requestAnimationFrame(reportLayout);
        const fontsReady = document.fonts && document.fonts.ready
            ? document.fonts.ready
            : Promise.resolve();
        fontsReady.then(() => requestAnimationFrame(reportLayout));
    }

    function setData(data, nextLanguage, nextLayout) {
        if (!data || typeof data !== "object") return;
        resumeData = data;
        language = nextLanguage === "en" ? "en" : "zh";
        layoutSettings = normalizeLayout(nextLayout || layoutSettings);
        render();
    }

    addEventListener("message", (event) => {
        if (event.origin !== location.origin) return;
        if (event.data && event.data.type === "resume:update") {
            setData(event.data.payload, event.data.language, event.data.layout);
        }
        if (event.data && event.data.type === "resume:print") {
            setData(event.data.payload, event.data.language, event.data.layout);
            requestAnimationFrame(() => print());
        }
    });

    const queryLayout = {
        mode: params.has("mode") ? params.get("mode") : undefined,
        fontSize: params.has("fontSize") ? params.get("fontSize") : undefined,
        density: params.has("density") ? params.get("density") : undefined,
        template: params.has("template") ? params.get("template") : undefined,
        marginTop: params.has("marginTop") ? params.get("marginTop") : undefined,
        marginSide: params.has("marginSide") ? params.get("marginSide") : undefined
    };

    fetch(dataUrl)
        .then((response) => {
            if (!response.ok) throw new Error("Resume data request failed");
            return response.json();
        })
        .then((data) => setData(data, language, queryLayout))
        .catch(() => {
            documentRoot.innerHTML = '<div class="loading">Unable to load resume data.</div>';
        })
        .finally(() => {
            parent.postMessage({ type: "resume:ready" }, location.origin);
        });
})();
