export const CITY_DISTRICTS = Object.freeze([
    {
        id: "data",
        number: "01",
        code: "DATA",
        zh: "数据塔",
        en: "Data Tower",
        zhIntro: "Agent 与数据系统的控制中枢，记录我如何把复杂工作流做成真正可用的产品。",
        enIntro: "The control center for agent and data systems, showing how complex workflows become usable products.",
        href: "hire.html",
        x: -8.5,
        z: -3.5,
        height: 10.5,
        width: 4.2,
        depth: 4.2,
        style: "tower",
        index: {
            zhTitle: "Agent 工程与职业档案",
            enTitle: "Agent engineering & career",
            zhDescription: "数据研发 Agent、Skills / MCP、上下文治理，以及完整工作经历。",
            enDescription: "Data-engineering agents, Skills / MCP, context governance, and my full professional record.",
            zhAction: "进入高塔 →",
            enAction: "Enter tower →"
        },
        fallback: {
            zh: "Agent 与职业档案",
            en: "Agent work & career"
        }
    },
    {
        id: "lab",
        number: "02",
        code: "LAB",
        zh: "研究实验室",
        en: "Research Lab",
        zhIntro: "从真实临床问题出发，在这里把数据、模型和研究判断连成一条完整路径。",
        enIntro: "Research starts with real clinical questions, then connects data, models, and evidence into one path.",
        href: "work.html#publications",
        x: -2,
        z: -7.5,
        height: 5.2,
        width: 6.2,
        depth: 4.2,
        style: "lab",
        index: {
            zhTitle: "研究不是另一条支线",
            enTitle: "Research is not a side quest",
            zhDescription: "SeizureFormer、EpiDHGNN，以及临床 AI 中如何把模型指标对齐真实问题。",
            enDescription: "SeizureFormer, EpiDHGNN, and how clinical AI metrics connect to real problems.",
            zhAction: "进入实验室 →",
            enAction: "Enter lab →"
        },
        fallback: {
            zh: "论文与研究",
            en: "Papers & research"
        }
    },
    {
        id: "workshop",
        number: "03",
        code: "BUILD",
        zh: "工程工坊",
        en: "Workshop",
        zhIntro: "把想法落成可以运行的产品，保留工程取舍、系统细节与真实交付过程。",
        enIntro: "Ideas become working products here, with the engineering choices and delivery process left visible.",
        href: "work.html#projects",
        x: 5.2,
        z: -5.4,
        height: 4.5,
        width: 5.4,
        depth: 4.8,
        style: "workshop",
        index: {
            zhTitle: "项目与工程",
            enTitle: "Projects & engineering",
            zhDescription: "从数据产品、实时系统到独立项目，关注实际使用而不是 Demo。",
            enDescription: "Data products, real-time systems, and independent builds designed for use, not demos.",
            zhAction: "打开工坊 →",
            enAction: "Open workshop →"
        },
        fallback: {
            zh: "项目与工程",
            en: "Projects & engineering"
        }
    },
    {
        id: "library",
        number: "04",
        code: "WRITE",
        zh: "图书馆",
        en: "Library",
        zhIntro: "写下技术、产品与人的交叉思考，让长期形成的判断有迹可循。",
        enIntro: "A place for writing across technology, products, and people, preserving how longer-term judgments form.",
        href: "blog.html",
        x: 9,
        z: 1.8,
        height: 6.2,
        width: 4.8,
        depth: 5.5,
        style: "library",
        index: {
            zhTitle: "写作",
            enTitle: "Writing",
            zhDescription: "技术、产品和心理学。想清楚一部分，再公开剩下的问题。",
            enDescription: "Technology, product, and psychology. Clarify part of the thought, then publish the remaining question.",
            zhAction: "进入图书馆 →",
            enAction: "Enter library →"
        },
        fallback: {
            zh: "技术、产品与人的写作",
            en: "Writing on technology, products & people"
        }
    },
    {
        id: "apartment",
        number: "05",
        code: "NOW",
        zh: "公寓",
        en: "Apartment",
        zhIntro: "一间关于当下的房间，记录正在推进的事情和仍然没有答案的问题。",
        enIntro: "A room about the present, recording what is moving forward and which questions remain open.",
        href: "now.html",
        x: 4.2,
        z: 7.2,
        height: 7.4,
        width: 4,
        depth: 4,
        style: "apartment",
        index: {
            zhTitle: "现在",
            enTitle: "Now",
            zhDescription: "当前工作、正在学习的东西，以及还没有答案的问题。",
            enDescription: "Current work, what I am learning, and questions that still have no answer.",
            zhAction: "上楼坐坐 →",
            enAction: "Come upstairs →"
        },
        fallback: {
            zh: "现在与生活",
            en: "Now & life"
        }
    },
    {
        id: "archive",
        number: "06",
        code: "READ",
        zh: "档案馆",
        en: "Archive",
        zhIntro: "保存读过的书与形成的判断，更关心它们后来如何改变行动。",
        enIntro: "An archive of books and the judgments they shaped, with attention to how they later changed action.",
        href: "reading.html",
        x: -2.4,
        z: 7.8,
        height: 4.2,
        width: 5.4,
        depth: 4,
        style: "archive",
        index: {
            zhTitle: "阅读档案",
            enTitle: "Reading archive",
            zhDescription: "不是完整书单，只保留真正改变过我判断方式的内容。",
            enDescription: "Not a complete shelf, only the books that changed how I make judgments.",
            zhAction: "打开档案 →",
            enAction: "Open archive →"
        },
        fallback: {
            zh: "阅读与判断",
            en: "Reading & judgment"
        }
    },
    {
        id: "radio",
        number: "07",
        code: "AUDIO",
        zh: "电台",
        en: "Radio Station",
        zhIntro: "工作与生活之间的声音空间，收藏音乐、播客以及让我保持节奏的内容。",
        enIntro: "A listening space between work and life, collecting the music, podcasts, and rhythms that keep me moving.",
        href: "listening.html",
        x: -8.8,
        z: 5.2,
        height: 5.6,
        width: 3.8,
        depth: 3.8,
        style: "radio",
        index: {
            zhTitle: "正在播放",
            enTitle: "Now playing",
            zhDescription: "写代码、开车和练鼓时的声音环境。",
            enDescription: "The sound environment for coding, driving, and drum practice.",
            zhAction: "调到这个频道 →",
            enAction: "Tune in →"
        },
        fallback: {
            zh: "音乐与播客",
            en: "Music & podcasts"
        }
    },
    {
        id: "darkroom",
        number: "08",
        code: "IMAGE",
        zh: "暗房",
        en: "City Darkroom",
        zhIntro: "用城市、光影与日常片段，保留那些很难只靠文字表达的观察。",
        enIntro: "Cities, light, and everyday fragments preserve observations that words alone cannot quite hold.",
        href: "photos.html",
        x: -10.8,
        z: 11,
        height: 3.5,
        width: 4.2,
        depth: 3.4,
        style: "photo",
        index: {
            zhTitle: "视觉笔记",
            enTitle: "Visual notes",
            zhDescription: "城市、剪影和桌面考古。照片只在真正整理好后出现。",
            enDescription: "Cities, silhouettes, and desktop archaeology. Photos appear only after the edit is ready.",
            zhAction: "进入暗房 →",
            enAction: "Enter darkroom →"
        },
        fallback: {
            zh: "城市与视觉笔记",
            en: "Cities & visual notes"
        }
    }
]);

export function districtHref(district, baseHref, params = {}) {
    const url = new URL(district.href, baseHref);
    url.searchParams.set("from", "city");
    url.searchParams.set("room", district.id);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    return `${url.pathname.split("/").pop()}${url.search}${url.hash}`;
}
