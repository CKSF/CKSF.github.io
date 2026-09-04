import { chapter } from "./chapter.js?v=20260904-release";

export default {
    id: "archive",
    code: "06 / READ",
    zh: "地下档案馆",
    en: "Underground Archive",
    zhOutline: "阅读记录",
    enOutline: "Reading",
    zhDescription: "不是为了显得读过很多。这里只保存真正改变过判断方式的书，以及当时留下的注释。",
    enDescription: "Not a shelf designed to look impressive. Only books that changed how I judge, with the notes they left behind.",
    console: ["archive", "档案检索", "ARCHIVE SEARCH", "调取档案", "RETRIEVE FILE"],
    media: [
        "assets/interiors/reading-archive.jpg",
        "BORNTHISWAYMEDIA · CC BY-SA 4.0",
        "https://commons.wikimedia.org/wiki/File:Storage_vault.jpg",
        "assets/interiors/cyber-reading-archive.jpg",
        "STOCKCAKE · PUBLIC DOMAIN · AI GENERATED",
        "https://stockcake.com/i/neon-data-void_3739223_1358601"
    ],
    focus: "center center",
    chapters: [
        chapter("current", "正在读", "Currently", "OPEN FILE",
            ["档案已调出", "FILES RETRIEVED", "当前打开的三份档案", "Three Files Currently Open"],
            [["思考，快与慢", "Designing Data-Intensive Applications", "Inspired"], ["Thinking, Fast and Slow", "Designing Data-Intensive Applications", "Inspired"]],
            [[["状态", "OPEN"], ["数量", "03"], ["主题", "判断 × 系统"]], [["STATE", "OPEN"], ["FILES", "03"], ["TOPIC", "JUDGMENT × SYSTEMS"]]],
            [["调取", "阅读", "批注"], ["RETRIEVE", "READ", "ANNOTATE"]], "VAULT · OPEN"),
        chapter("finished", "读完推荐", "Finished", "ARCHIVED",
            ["推荐档案", "RECOMMENDED FILES", "值得重新调取的书", "Books Worth Retrieving Again"],
            [["Sapiens", "Zero to One", "The Design of Everyday Things", "深度工作"], ["Sapiens", "Zero to One", "The Design of Everyday Things", "Deep Work"]],
            [[["状态", "ARCHIVED"], ["推荐", "04"], ["索引", "CURATED"]], [["STATE", "ARCHIVED"], ["PICKS", "04"], ["INDEX", "CURATED"]]],
            [["读完", "归档", "推荐"], ["FINISH", "ARCHIVE", "RECOMMEND"]], "VAULT · 04"),
        chapter("queue", "待读清单", "On the queue", "PENDING",
            ["等待入库", "AWAITING REVIEW", "下一批待读档案", "Next Files in the Queue"],
            [["Working Backwards", "The Making of a Manager", "项目 Hail Mary"], ["Working Backwards", "The Making of a Manager", "Project Hail Mary"]],
            [[["状态", "PENDING"], ["数量", "03"], ["队列", "NEXT"]], [["STATE", "PENDING"], ["FILES", "03"], ["QUEUE", "NEXT"]]],
            [["入列", "选择", "开启"], ["QUEUE", "SELECT", "OPEN"]], "VAULT · NEXT")
    ]
};
