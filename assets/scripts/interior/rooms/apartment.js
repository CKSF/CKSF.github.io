import { chapter } from "./chapter.js?v=20260904-release";

export default {
    id: "apartment",
    code: "05 / NOW",
    zh: "私人公寓",
    en: "Private Apartment",
    zhOutline: "现在",
    enOutline: "Now",
    zhDescription: "离开履历后的日常空间：当前工作、正在学习的东西，以及暂时没有答案的问题。",
    enDescription: "The space beyond the resume: current work, what I am learning, and questions that do not have answers yet.",
    console: ["apartment", "今日状态", "TODAY BOARD", "查看此刻", "VIEW CURRENT STATE"],
    media: [
        "assets/interiors/now-apartment.jpg",
        "JAROSLAW CEBORSKI · CC0",
        "https://commons.wikimedia.org/wiki/File:Living_room_(Unsplash).jpg",
        "assets/interiors/cyber-now-apartment.jpg",
        "STOCKCAKE · PUBLIC DOMAIN · AI GENERATED",
        "https://stockcake.com/es/i/dormitorio-cyberpunk-de-ne%C3%B3n_3633888_1733649"
    ],
    focus: "center center",
    chapters: [
        chapter("working", "正在做", "Working on", "NOW",
            ["今日进行中", "IN PROGRESS TODAY", "工作、学习与长期作品", "Work, Study, Long-term Craft"],
            [["字节跳动 · Agent 应用工程", "UPenn CIS · ML × Systems", "把网站做成长期作品"], ["ByteDance · Agent engineering", "UPenn CIS · ML × Systems", "Building this site as a long-term work"]],
            [[["工作", "AGENT"], ["学习", "CIS"], ["地点", "上海 × 费城"]], [["WORK", "AGENT"], ["STUDY", "CIS"], ["BASE", "SHANGHAI × PHILLY"]]],
            [["工作", "学习", "记录"], ["WORK", "LEARN", "DOCUMENT"]], "TODAY · ACTIVE"),
        chapter("inputs", "正在输入", "Reading & listening", "INPUTS",
            ["输入队列", "INPUT QUEUE", "最近读、听与反复播放", "Reading, Listening, Replaying"],
            [["《思考，快与慢》", "Lex Fridman × Sam Altman", "Boards of Canada"], ["Thinking, Fast and Slow", "Lex Fridman × Sam Altman", "Boards of Canada"]],
            [[["书", "01"], ["播客", "01"], ["专辑", "01"]], [["BOOK", "01"], ["PODCAST", "01"], ["ALBUM", "01"]]],
            [["接收", "消化", "连接"], ["ABSORB", "PROCESS", "CONNECT"]], "INPUT · 03"),
        chapter("questions", "在想的问题", "Open questions", "QUESTIONS",
            ["问题保持开放", "QUESTIONS OPEN", "关于 Agent 与职业边界", "Agents and Professional Boundaries"],
            [["Agent 应该替人做多少决定？", "工程师和产品经理必须二选一吗？", "如何保留人的判断与责任？"], ["How much should agents decide?", "Must engineering and product be separate?", "How do humans retain judgment?"]],
            [[["问题", "02+"], ["答案", "OPEN"], ["周期", "长期"]], [["QUESTIONS", "02+"], ["ANSWERS", "OPEN"], ["HORIZON", "LONG"]]],
            [["提问", "试验", "修正"], ["ASK", "TEST", "REVISE"]], "OPEN · LOOP")
    ]
};
