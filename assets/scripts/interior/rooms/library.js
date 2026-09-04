import { chapter } from "./chapter.js?v=20260904-release";

export default {
    id: "library",
    code: "04 / WRITE",
    zh: "城市图书馆",
    en: "City Library",
    zhOutline: "写作空间",
    enOutline: "Writing",
    zhDescription: "技术、产品、心理学，以及尚未想完的问题。文章是思考过程，不是结论仓库。",
    enDescription: "Technology, product, psychology, and questions still in progress. Essays are a thinking process, not a warehouse of conclusions.",
    console: ["library", "文章目录", "WRITING CATALOG", "打开书架", "OPEN SHELF"],
    media: [
        "assets/interiors/writing-library.jpg",
        "CAROL M. HIGHSMITH · PUBLIC DOMAIN",
        "https://commons.wikimedia.org/wiki/File:LOC_Main_Reading_Room_Highsmith.jpg",
        "assets/interiors/cyber-writing-library.jpg",
        "STOCKCAKE · PUBLIC DOMAIN · AI GENERATED",
        "https://stockcake.com/i/cyberpunk-study-space_3777153_1762596"
    ],
    focus: "center center",
    chapters: [
        chapter("all", "全部文章", "All writing", "ALL NOTES",
            ["目录已编目", "CATALOG INDEXED", "技术、产品与人的笔记", "Notes on Systems, Products, People"],
            [["SeizureFormer 背后的建模选择", "从 0 到 1 上线 LLM 产品", "心理学留下的三个念头"], ["Modeling choices behind SeizureFormer", "Shipping an LLM feature from zero", "Three lessons left by psychology"]],
            [[["馆藏", "06 篇"], ["主题", "04 类"], ["状态", "持续写作"]], [["ENTRIES", "06"], ["TOPICS", "04"], ["STATE", "ONGOING"]]],
            [["观察", "拆解", "成文"], ["OBSERVE", "ANALYZE", "WRITE"]], "CATALOG · ALL", "writing-catalog", "all"),
        chapter("tech", "技术", "Technology", "TECH",
            ["技术书架", "TECH SHELF", "模型、检索与工程系统", "Models, Retrieval, Engineering"],
            [["IEA / LE 与原始 EEG", "RAG 教案平台的检索工程", "可复现的系统实现"], ["IEA / LE versus raw EEG", "Retrieval engineering for RAG", "Reproducible system implementation"]],
            [[["分类", "TECH"], ["重点", "ML + SYSTEMS"], ["索引", "02+"]], [["CLASS", "TECH"], ["FOCUS", "ML + SYSTEMS"], ["INDEX", "02+"]]],
            [["问题", "原理", "实现"], ["PROBLEM", "MECHANISM", "BUILD"]], "SHELF · T", "writing-catalog", "tech"),
        chapter("product", "产品", "Product", "PRODUCT",
            ["产品书架", "PRODUCT SHELF", "把能力变成可用产品", "Turning Capability into Product"],
            [["LLM 功能从 0 到 1", "需求、工程和用户价值", "Google PM 认证反思"], ["LLM feature from zero to one", "Requirements, engineering, user value", "Google PM certificate reflections"]],
            [[["分类", "PRODUCT"], ["视角", "0 → 1"], ["索引", "02+"]], [["CLASS", "PRODUCT"], ["LENS", "0 → 1"], ["INDEX", "02+"]]],
            [["用户", "决策", "交付"], ["USER", "DECIDE", "DELIVER"]], "SHELF · P", "writing-catalog", "product"),
        chapter("psych", "心理", "Psychology", "PSYCH",
            ["心理书架", "PSYCHOLOGY SHELF", "关于判断、行为与成长", "Judgment, Behavior, Growth"],
            [["心理学四年留下的念头", "技术背后的人类判断", "在不确定中持续校准"], ["Lessons from four years of psychology", "Human judgment behind technology", "Calibrating under uncertainty"]],
            [[["分类", "PSYCH"], ["视角", "HUMAN"], ["索引", "01+"]], [["CLASS", "PSYCH"], ["LENS", "HUMAN"], ["INDEX", "01+"]]],
            [["行为", "解释", "反思"], ["BEHAVIOR", "INTERPRET", "REFLECT"]], "SHELF · Ψ", "writing-catalog", "psych"),
        chapter("notes", "随笔", "Field Notes", "NOTES",
            ["随笔书架", "FIELD NOTES", "学习、迁移与仍在形成的判断", "Learning, transition, and judgments still taking shape"],
            [["UPenn 第一周", "尚未收束的观察", "写作中的工作草稿"], ["First week at UPenn", "Observations still in progress", "Working drafts in public"]],
            [[["分类", "NOTES"], ["状态", "DRAFT"], ["索引", "01+"]], [["CLASS", "NOTES"], ["STATE", "DRAFT"], ["INDEX", "01+"]]],
            [["记录", "整理", "继续"], ["NOTICE", "SHAPE", "CONTINUE"]], "SHELF · N", "writing-catalog", "notes")
    ]
};
