(function () {
    "use strict";

    const documentRoot = document.querySelector("[data-document]");
    const pageSizeStyle = document.getElementById("page-size");
    const params = new URLSearchParams(location.search);
    let language = params.get("lang") === "en" ? "en" : "zh";
    let resumeData = null;

    const labels = {
        zh: {
            kicker: "职业简历",
            education: "教育背景",
            work: "工作经历",
            research: "科研经历",
            projects: "项目经历",
            skills: "技能",
            publications: "论文",
            languages: "语言"
        },
        en: {
            kicker: "Career Resume",
            education: "Education",
            work: "Work Experience",
            research: "Research Experience",
            projects: "Selected Projects",
            skills: "Skills",
            publications: "Publications",
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

    function dateRange(item) {
        const start = localized(item.startDate);
        const end = localized(item.endDate);
        return [start, end].filter(Boolean).join(" → ");
    }

    function sectionHeading(title) {
        return `
            <div class="section-heading">
                <h2>${escapeHtml(title)}</h2>
            </div>`;
    }

    function itemTitle(item, type) {
        if (type === "education") return localized(item.institution);
        if (type === "projects") return localized(item.name);
        return localized(item.position);
    }

    function itemSubtitle(item, type) {
        return type === "education"
            ? localized(item.position)
            : type === "projects"
                ? localized(item.description)
                : localized(item.organization);
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
                        <h3>${escapeHtml(itemTitle(item, type))}</h3>
                        <span class="entry-date">${escapeHtml(dateRange(item))}</span>
                    </div>
                    <div class="entry-subline">
                        <p class="entry-sub">${escapeHtml(itemSubtitle(item, type))}</p>
                        <span class="entry-location">${escapeHtml(localized(item.location))}</span>
                    </div>
                    ${list}
                </article>`;
        }).join("");
    }

    function renderSection(title, items, type, extraClass) {
        return `
            <section class="section ${extraClass || ""}">
                ${sectionHeading(title)}
                ${renderEntries(items, type)}
            </section>`;
    }

    function renderSkills(data) {
        const skills = (data.skills || []).map((group) => `
            <div class="skill-row">
                <strong>${escapeHtml(localized(group.name))}:</strong>
                ${group.keywords.map(escapeHtml).join(", ")}
            </div>`).join("");
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
        return `
            <section class="section">
                ${sectionHeading(labels[language].publications)}
                ${publications}
            </section>`;
    }

    function renderLanguages(data) {
        const languageItems = (data.languages || []).map((item) =>
            `${escapeHtml(localized(item.language))} (${escapeHtml(localized(item.fluency))})`
        );
        return `
            <section class="section">
                ${sectionHeading(labels[language].languages)}
                <div class="language-row">${languageItems.join(", ")}</div>
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
                    <span>${escapeHtml(localized(basics.location))}</span>
                    <span>${escapeHtml(basics.phone)}</span>
                    <a href="mailto:${escapeHtml(basics.email)}">${escapeHtml(basics.email)}</a>
                    ${linkedIn ? `<a href="${escapeHtml(linkedIn.url)}">linkedin.com/in/${escapeHtml(linkedIn.username)}</a>` : ""}
                    ${github ? `<a href="${escapeHtml(github.url)}">github.com/${escapeHtml(github.username)}</a>` : ""}
                </div>
            </header>`;
    }

    function page(content, index, total, extraClass) {
        return `
            <article class="resume-page ${extraClass || ""}">
                ${content}
                <span class="page-index">${String(index).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span>
            </article>`;
    }

    function renderChinese(data) {
        const l = labels.zh;
        const firstPage = `
            ${renderHeader(data)}
            ${renderSection(l.education, data.education, "education")}
            ${renderSection(l.work, data.work, "work")}`;
        const secondPage = `
            ${renderHeader(data)}
            ${renderSection(l.research, data.research, "research")}
            ${renderSection(l.projects, data.projects, "projects")}
            ${renderPublications(data)}
            ${renderSkills(data)}
            ${renderLanguages(data)}`;
        return page(firstPage, 1, 2) + page(secondPage, 2, 2, "second-page");
    }

    function renderEnglish(data) {
        const l = labels.en;
        const firstPage = `
            ${renderHeader(data)}
            ${renderSection(l.education, data.education, "education")}
            ${renderSection(l.work, data.work, "work")}`;
        const secondPage = `
            ${renderHeader(data)}
            ${renderSection(l.research, data.research, "research")}
            ${renderSection(l.projects, data.projects, "projects")}
            ${renderPublications(data)}
            ${renderSkills(data)}
            ${renderLanguages(data)}`;
        return page(firstPage, 1, 2) + page(secondPage, 2, 2, "second-page");
    }

    function render() {
        if (!resumeData) return;
        document.documentElement.dataset.language = language;
        document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
        pageSizeStyle.textContent = language === "zh"
            ? "@page { size: A4; margin: 0; }"
            : "@page { size: letter; margin: 0; }";
        document.title = language === "zh"
            ? "冯天宁_简历"
            : "Tianning_Feng_Resume";
        documentRoot.innerHTML = language === "zh"
            ? renderChinese(resumeData)
            : renderEnglish(resumeData);
    }

    function setData(data, nextLanguage) {
        if (!data || typeof data !== "object") return;
        resumeData = data;
        language = nextLanguage === "en" ? "en" : "zh";
        render();
    }

    addEventListener("message", (event) => {
        if (event.origin !== location.origin) return;
        if (event.data && event.data.type === "resume:update") {
            setData(event.data.payload, event.data.language);
        }
        if (event.data && event.data.type === "resume:print") {
            setData(event.data.payload, event.data.language);
            requestAnimationFrame(() => print());
        }
    });

    fetch("../data/resume.json")
        .then((response) => {
            if (!response.ok) throw new Error("Resume data request failed");
            return response.json();
        })
        .then((data) => setData(data, language))
        .catch(() => {
            documentRoot.innerHTML = '<div class="loading">Unable to load resume data.</div>';
        })
        .finally(() => {
            parent.postMessage({ type: "resume:ready" }, location.origin);
        });
})();
