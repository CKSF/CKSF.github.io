(function () {
    "use strict";

    const routes = [
        { key: "home", href: "index.html", zh: "首页", en: "Home", hint: "Overview" },
        { key: "work", href: "work.html", zh: "作品", en: "Work", hint: "Research & projects" },
        { key: "blog", href: "blog.html", zh: "写作", en: "Writing", hint: "Long-form notes" },
        { key: "now", href: "now.html", zh: "现在", en: "Now", hint: "Current focus" },
        { key: "reading", href: "reading.html", zh: "书架", en: "Library", hint: "Reading & listening" },
        { key: "photos", href: "photos.html", zh: "影像", en: "Photos", hint: "Visual notes" },
        { key: "hire", href: "hire.html?entry=recruiter", zh: "招聘档案", en: "Recruiter", hint: "Resume, experience & contact" }
    ];

    const path = location.pathname.split("/").pop() || "index.html";
    const pageKey = ({
        "index.html": "home",
        "work.html": "work",
        "blog.html": "blog",
        "now.html": "now",
        "reading.html": "reading",
        "listening.html": "reading",
        "photos.html": "photos",
        "resume.html": "hire",
        "hire.html": "hire"
    })[path] || "home";
    const pageMetadata = {
        home: {
            zhTitle: "冯天宁的城市｜个人网站",
            enTitle: "Tianning Feng's City | Portfolio",
            zhDescription: "冯天宁的个人网站：Agent 工程、产品、研究、写作与生活记录。",
            enDescription: "Tianning Feng's portfolio: agent engineering, products, research, writing, and life."
        },
        work: {
            zhTitle: "作品与研究｜冯天宁",
            enTitle: "Work & Research | Tianning Feng",
            zhDescription: "冯天宁的论文、研究成果与工程项目。",
            enDescription: "Publications, research, and engineering projects by Tianning Feng."
        },
        blog: {
            zhTitle: "写作｜冯天宁",
            enTitle: "Writing | Tianning Feng",
            zhDescription: "关于技术、产品与心理学的长文。",
            enDescription: "Long-form writing about technology, products, and psychology."
        },
        now: {
            zhTitle: "现在｜冯天宁",
            enTitle: "Now | Tianning Feng",
            zhDescription: "冯天宁当前正在投入的工作、学习与思考。",
            enDescription: "What Tianning Feng is currently working on, learning, and thinking about."
        },
        reading: {
            zhTitle: "阅读｜冯天宁",
            enTitle: "Reading | Tianning Feng",
            zhDescription: "正在读、读完与计划阅读的书。",
            enDescription: "Books currently reading, finished, and queued."
        },
        photos: {
            zhTitle: "影像｜冯天宁",
            enTitle: "Photos | Tianning Feng",
            zhDescription: "城市、人物与日常物件的视觉笔记。",
            enDescription: "Visual notes on cities, people, and everyday objects."
        },
        hire: {
            zhTitle: "招聘档案｜冯天宁",
            enTitle: "For Hire | Tianning Feng",
            zhDescription: "冯天宁的求职方向、工作经历、项目、研究、论文与联系方式。",
            enDescription: "Tianning Feng's objective, experience, projects, research, publications, and contact details."
        }
    };
    if (path === "listening.html") {
        pageMetadata.reading = {
            zhTitle: "音乐与播客｜冯天宁",
            enTitle: "Listening | Tianning Feng",
            zhDescription: "编码、通勤与生活中的音乐和播客。",
            enDescription: "Music and podcasts for coding, commuting, and everyday life."
        };
    } else if (path === "resume.html") {
        pageMetadata.hire = {
            zhTitle: "简历｜冯天宁",
            enTitle: "Resume | Tianning Feng",
            zhDescription: "冯天宁的一页式简历。",
            enDescription: "Tianning Feng's one-page resume."
        };
    }

    const isHire = path === "hire.html";
    const lang = () => document.documentElement.lang.startsWith("en") ? "en" : "zh";
    const roomPages = new Set([
        "hire.html", "work.html", "blog.html", "now.html",
        "reading.html", "listening.html", "photos.html"
    ]);

    if (roomPages.has(path)) {
        const roomStyles = document.createElement("link");
        roomStyles.rel = "stylesheet";
        roomStyles.href = "room-system.css?v=20260725-inspect2";
        document.head.append(roomStyles);

        const roomScript = document.createElement("script");
        roomScript.src = "room-system.js?v=20260725-inspect2";
        document.head.append(roomScript);
    }

    function getStored(key) {
        try { return localStorage.getItem(key); } catch (error) { return null; }
    }

    function setStored(key, value) {
        try { localStorage.setItem(key, value); } catch (error) {}
    }

    function themedHref(href) {
        if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(href)) return href;
        let url;
        try { url = new URL(href, location.href); } catch (error) { return href; }
        if (url.origin !== location.origin) return href;
        if (!url.pathname.endsWith(".html") && !url.pathname.endsWith("/")) return href;

        url.searchParams.delete("classic");
        if (document.documentElement.dataset.siteTheme === "paper") {
            url.searchParams.set("theme", "light");
        } else {
            url.searchParams.delete("theme");
        }

        const filename = url.pathname.split("/").pop() || "index.html";
        return `${filename}${url.search}${url.hash}`;
    }

    function syncInternalLinks() {
        document.querySelectorAll("a[href]").forEach((link) => {
            if (!link.dataset.siteBaseHref) {
                link.dataset.siteBaseHref = link.getAttribute("href");
            }
            link.setAttribute("href", themedHref(link.dataset.siteBaseHref));
        });
    }

    function navigateTo(href) {
        location.href = themedHref(href);
    }

    function initialTheme() {
        const params = new URLSearchParams(location.search);
        if (params.has("classic") || params.get("theme") === "classic" || params.get("theme") === "paper" || params.get("theme") === "light") {
            return "paper";
        }
        if (params.get("theme") === "signature" || params.get("theme") === "dark") return "signature";
        const saved = getStored("site-theme") || getStored("theme");
        if (saved === "paper" || saved === "classic") return "paper";
        if (saved === "signature") return "signature";
        return "signature";
    }

    function setTheme(theme, updateUrl) {
        const normalized = theme === "paper" ? "paper" : "signature";
        document.documentElement.dataset.siteTheme = normalized;
        if (isHire) {
            if (normalized === "paper") document.documentElement.dataset.theme = "classic";
            else document.documentElement.removeAttribute("data-theme");
        }
        setStored("site-theme", normalized);
        setStored("theme", normalized === "paper" ? "classic" : "signature");
        if (updateUrl) {
            const url = new URL(location.href);
            url.searchParams.delete("classic");
            if (normalized === "paper") url.searchParams.set("theme", "light");
            else url.searchParams.delete("theme");
            history.replaceState(null, "", url);
        }
        syncThemeControls();
        syncInternalLinks();
        window.dispatchEvent(new CustomEvent("site-theme-change", {
            detail: { theme: normalized }
        }));
    }

    function toggleTheme() {
        setTheme(document.documentElement.dataset.siteTheme === "paper" ? "signature" : "paper", true);
        toast(document.documentElement.dataset.siteTheme === "paper"
            ? (lang() === "zh" ? "已切换到浅色模式" : "Light mode")
            : (lang() === "zh" ? "已切换到深色模式" : "Dark mode"));
    }

    function syncThemeControls() {
        document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
            const paper = document.documentElement.dataset.siteTheme === "paper";
            button.textContent = paper
                ? (lang() === "zh" ? "深色" : "Dark")
                : (lang() === "zh" ? "浅色" : "Light");
            button.setAttribute("aria-label", paper
                ? (lang() === "zh" ? "切换到深色模式" : "Switch to dark mode")
                : (lang() === "zh" ? "切换到浅色模式" : "Switch to light mode"));
        });
    }

    function syncDocumentMetadata(target) {
        const metadata = pageMetadata[pageKey] || pageMetadata.home;
        const english = target === "en";
        const title = metadata[english ? "enTitle" : "zhTitle"];
        const description = metadata[english ? "enDescription" : "zhDescription"];
        document.title = title;
        document.querySelector('meta[name="description"]')?.setAttribute("content", description);
        document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
        document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
    }

    function applyLanguage(next) {
        const target = next === "en" ? "en" : "zh";
        document.querySelectorAll(".lang-block").forEach((block) => {
            block.classList.toggle("active", block.id === target);
        });
        document.documentElement.lang = target === "en" ? "en" : "zh-CN";
        document.querySelector("#btn-zh")?.classList.toggle("active", target === "zh");
        document.querySelector("#btn-en")?.classList.toggle("active", target === "en");
        const skip = document.querySelector(".site-skip");
        if (skip) skip.textContent = target === "zh" ? "跳到主要内容" : "Skip to content";
        const commandInput = document.querySelector(".command-input");
        if (commandInput) {
            commandInput.placeholder = target === "zh"
                ? "跳转页面、切换主题、联系我…"
                : "Navigate, change theme, contact…";
        }
        const commandPanel = document.querySelector(".command-panel");
        commandPanel?.setAttribute("aria-label", target === "zh" ? "快捷导航" : "Quick navigation");
        const commandHint = document.querySelector(".command-hint");
        if (commandHint) {
            commandHint.innerHTML = target === "zh"
                ? "<span><kbd>↑</kbd> <kbd>↓</kbd> 选择</span><span><kbd>Esc</kbd> 关闭</span>"
                : "<span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span><span><kbd>Esc</kbd> Close</span>";
        }
        syncDocumentMetadata(target);
        setStored("lang", target);
        buildNavigation();
        renderCommands();
        syncThemeControls();
        window.dispatchEvent(new CustomEvent("site-language-change", {
            detail: { language: target }
        }));
    }

    function buildNavigation() {
        const previous = document.querySelector(".global-nav");
        if (previous) previous.remove();

        const currentLang = lang();
        const nav = document.createElement("nav");
        nav.className = "global-nav";
        nav.setAttribute("aria-label", currentLang === "zh" ? "全站导航" : "Primary navigation");

        const visibleRoutes = routes.filter((route) => route.key !== "home" && route.key !== "hire");
        nav.innerHTML = `
            <div class="global-nav-inner">
                <a class="global-brand" href="${themedHref("index.html")}" aria-label="${currentLang === "zh" ? "返回首页" : "Back home"}">
                    <span class="global-brand-mark" aria-hidden="true"></span>
                    <span>Tianning Feng</span>
                </a>
                <div class="global-links" id="global-links">
                    ${visibleRoutes.map((route) => `
                        <a href="${themedHref(route.href)}" ${pageKey === route.key ? 'aria-current="page"' : ""}>
                            ${route[currentLang]}
                        </a>
                    `).join("")}
                </div>
                <div class="global-actions">
                    <a class="global-action hire"
                       style="display: inline-grid"
                       href="${themedHref("hire.html?entry=recruiter")}"
                       aria-label="${currentLang === "zh" ? "招聘入口：查看简历与职业档案" : "Recruiter entry: view resume and career portfolio"}"
                       ${pageKey === "hire" ? 'aria-current="page"' : ""}>
                        ${currentLang === "zh" ? "招聘" : "Hire"}
                    </a>
                    <button class="global-action" type="button" data-theme-toggle></button>
                    <button class="global-action" type="button" data-lang-toggle aria-label="${currentLang === "zh" ? "切换到英文" : "Switch to Chinese"}">${currentLang === "zh" ? "EN" : "中"}</button>
                    <button class="global-action global-menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-controls="global-links">${currentLang === "zh" ? "导航" : "Menu"}</button>
                </div>
            </div>`;

        const oldNav = document.querySelector("body > .nav, body > .topbar");
        if (oldNav) oldNav.replaceWith(nav);
        else document.body.prepend(nav);

        nav.querySelector("[data-theme-toggle]").addEventListener("click", toggleTheme);
        nav.querySelector("[data-lang-toggle]").addEventListener("click", () => applyLanguage(currentLang === "zh" ? "en" : "zh"));
        nav.querySelector("[data-command-open]")?.addEventListener("click", openCommands);
        nav.querySelector("[data-menu-toggle]").addEventListener("click", (event) => {
            const open = nav.classList.toggle("menu-open");
            event.currentTarget.setAttribute("aria-expanded", String(open));
            event.currentTarget.textContent = open
                ? (currentLang === "zh" ? "关闭" : "Close")
                : (currentLang === "zh" ? "导航" : "Menu");
        });
        syncThemeControls();
        syncInternalLinks();
    }

    function addPageChrome() {
        document.body.classList.add("site-enhanced");

        if (!document.querySelector(".site-skip")) {
            const skip = document.createElement("a");
            skip.className = "site-skip";
            skip.href = "#main-content";
            skip.textContent = lang() === "zh" ? "跳到主要内容" : "Skip to content";
            document.body.prepend(skip);
        }

        const main = document.querySelector("main");
        if (main) main.id = "main-content";

        if (path === "resume.html" && main) {
            const notice = document.createElement("aside");
            notice.className = "legacy-notice";
            notice.innerHTML = lang() === "zh"
                ? '<span>这是保留的一页式旧版简历。最新经历、项目说明和 PDF 导出已统一到职业档案。</span><a href="hire.html">打开最新版 →</a>'
                : '<span>This one-page résumé is kept as an archive. Current experience, case studies, and PDF export now live in the career portfolio.</span><a href="hire.html">Open current version →</a>';
            main.prepend(notice);
        }

        const progress = document.createElement("div");
        progress.className = "site-progress";
        progress.setAttribute("aria-hidden", "true");
        document.body.append(progress);

        let scheduled = false;
        const updateProgress = () => {
            scheduled = false;
            const max = document.documentElement.scrollHeight - innerHeight;
            const ratio = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
            progress.style.width = `${ratio * 100}%`;
        };
        addEventListener("scroll", () => {
            if (!scheduled) {
                scheduled = true;
                requestAnimationFrame(updateProgress);
            }
        }, { passive: true });
        updateProgress();

        document.querySelectorAll(".launchpad > .cell").forEach((cell, index) => {
            cell.dataset.index = String(index + 1).padStart(2, "0");
        });

        document.querySelectorAll(".footer-meta").forEach((meta) => {
            meta.innerHTML = meta.innerHTML.replace(/2025/g, String(new Date().getFullYear()));
        });

        document.querySelectorAll('a[target="_blank"]').forEach((link) => {
            link.rel = "noopener noreferrer";
        });
        syncInternalLinks();
    }

    let commandIndex = 0;
    let filteredCommands = [];

    function commandData() {
        const currentLang = lang();
        return [
            ...routes.map((route) => ({
                title: route[currentLang],
                hint: route.hint,
                action: () => navigateTo(route.href)
            })),
            {
                title: currentLang === "zh" ? "切换主题" : "Toggle theme",
                hint: currentLang === "zh" ? "深色 / 浅色" : "Dark / Light",
                action: toggleTheme
            },
            {
                title: currentLang === "zh" ? "切换到 English" : "切换到中文",
                hint: "Language",
                action: () => applyLanguage(currentLang === "zh" ? "en" : "zh")
            },
            {
                title: currentLang === "zh" ? "发邮件给我" : "Email me",
                hint: "cksamfeng@gmail.com",
                action: () => { location.href = "mailto:cksamfeng@gmail.com"; }
            }
        ];
    }

    function buildCommands() {
        const backdrop = document.createElement("div");
        backdrop.className = "command-backdrop";
        backdrop.setAttribute("aria-hidden", "true");
        backdrop.innerHTML = `
            <section class="command-panel" role="dialog" aria-modal="true" aria-label="${lang() === "zh" ? "快捷导航" : "Quick navigation"}">
                <div class="command-input-wrap">
                    <span>/</span>
                    <input class="command-input" type="search" autocomplete="off" spellcheck="false">
                </div>
                <div class="command-list" role="listbox"></div>
                <div class="command-hint"><span><kbd>↑</kbd> <kbd>↓</kbd> ${lang() === "zh" ? "选择" : "Navigate"}</span><span><kbd>Esc</kbd> ${lang() === "zh" ? "关闭" : "Close"}</span></div>
            </section>`;
        document.body.append(backdrop);

        const input = backdrop.querySelector(".command-input");
        input.placeholder = lang() === "zh" ? "跳转页面、切换主题、联系我…" : "Navigate, change theme, contact…";
        input.addEventListener("input", () => {
            commandIndex = 0;
            renderCommands(input.value);
        });
        backdrop.addEventListener("click", (event) => {
            if (event.target === backdrop) closeCommands();
        });
        renderCommands();
    }

    function renderCommands(query) {
        const list = document.querySelector(".command-list");
        if (!list) return;
        const needle = (query || "").trim().toLowerCase();
        filteredCommands = commandData().filter((item) => `${item.title} ${item.hint}`.toLowerCase().includes(needle));
        commandIndex = Math.min(commandIndex, Math.max(0, filteredCommands.length - 1));
        list.innerHTML = filteredCommands.map((item, index) => `
            <button class="command-item ${index === commandIndex ? "active" : ""}" type="button" role="option" aria-selected="${index === commandIndex}" data-command-index="${index}">
                <span><strong>${item.title}</strong><small>${item.hint}</small></span>
                <kbd>↵</kbd>
            </button>`).join("");
        list.querySelectorAll("[data-command-index]").forEach((button) => {
            button.addEventListener("click", () => {
                const item = filteredCommands[Number(button.dataset.commandIndex)];
                closeCommands();
                item?.action();
            });
        });
    }

    function openCommands() {
        const backdrop = document.querySelector(".command-backdrop");
        if (!backdrop) return;
        backdrop.classList.add("open");
        backdrop.setAttribute("aria-hidden", "false");
        commandIndex = 0;
        renderCommands();
        const input = backdrop.querySelector(".command-input");
        input.value = "";
        requestAnimationFrame(() => input.focus());
    }

    function closeCommands() {
        const backdrop = document.querySelector(".command-backdrop");
        if (!backdrop) return;
        backdrop.classList.remove("open");
        backdrop.setAttribute("aria-hidden", "true");
    }

    function toast(message) {
        let node = document.querySelector(".site-toast");
        if (!node) {
            node = document.createElement("div");
            node.className = "site-toast";
            node.setAttribute("role", "status");
            document.body.append(node);
        }
        node.textContent = message;
        node.classList.add("show");
        clearTimeout(toast.timer);
        toast.timer = setTimeout(() => node.classList.remove("show"), 1800);
    }

    function bindKeyboard() {
        addEventListener("keydown", (event) => {
            const paletteOpen = document.querySelector(".command-backdrop")?.classList.contains("open");
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                paletteOpen ? closeCommands() : openCommands();
                return;
            }
            if (event.key === "Escape" && paletteOpen) {
                closeCommands();
                return;
            }
            if (!paletteOpen) return;
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                const delta = event.key === "ArrowDown" ? 1 : -1;
                commandIndex = (commandIndex + delta + filteredCommands.length) % filteredCommands.length;
                renderCommands(document.querySelector(".command-input")?.value);
            }
            if (event.key === "Enter" && filteredCommands[commandIndex]) {
                event.preventDefault();
                closeCommands();
                filteredCommands[commandIndex].action();
            }
        });
    }

    setTheme(initialTheme(), false);

    addEventListener("DOMContentLoaded", () => {
        const savedLanguage = getStored("lang");
        addPageChrome();
        buildCommands();
        applyLanguage(savedLanguage === "en" ? "en" : "zh");
        bindKeyboard();
    });
})();
