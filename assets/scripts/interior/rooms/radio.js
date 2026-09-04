import { chapter } from "./chapter.js?v=20260904-release";

export default {
    id: "radio",
    code: "07 / AUDIO",
    zh: "城市电台",
    en: "City Radio",
    zhOutline: "声音频道",
    enOutline: "On Air",
    zhDescription: "写代码、开车、练鼓时的声音环境。这里没有自动播放，只有主动调频。",
    enDescription: "The sound environment for coding, driving, and drum practice. Nothing autoplays; tune in deliberately.",
    console: ["radio", "城市调频", "CITY TUNER", "打开节目单", "OPEN PROGRAM"],
    media: [
        "assets/interiors/listening-radio.jpg",
        "ETHAN LONG · CC BY-SA 2.0",
        "https://commons.wikimedia.org/wiki/File:Broadcast_Studio_(53998133784).jpg",
        "assets/interiors/cyber-listening-radio.jpg",
        "STOCKCAKE · PUBLIC DOMAIN · AI GENERATED",
        "https://stockcake.com/i/retro-cyberpunk-studio_3267223_1640215"
    ],
    focus: "center 58%",
    chapters: [
        chapter("coding", "编码歌单", "Coding playlist", "DEEP WORK",
            ["频道锁定", "SIGNAL LOCKED", "深度工作频段", "Deep Work Frequency"],
            [["Music Has the Right to Children", "Selected Ambient Works 85–92", "Untrue"], ["Music Has the Right to Children", "Selected Ambient Works 85–92", "Untrue"]],
            [[["频率", "88.4"], ["队列", "03"], ["模式", "FOCUS"]], [["FREQ", "88.4"], ["QUEUE", "03"], ["MODE", "FOCUS"]]],
            [["选台", "降噪", "专注"], ["TUNE", "FILTER", "FOCUS"]], "FM · 88.4"),
        chapter("repeat", "最近循环", "On repeat", "ROTATION",
            ["循环播放", "ON ROTATION", "最近反复播放", "Current Rotation"],
            [["Cracker Island", "Chromakopia", "Radical Optimism"], ["Cracker Island", "Chromakopia", "Radical Optimism"]],
            [[["频率", "94.7"], ["专辑", "03"], ["模式", "REPEAT"]], [["FREQ", "94.7"], ["ALBUMS", "03"], ["MODE", "REPEAT"]]],
            [["发现", "循环", "收藏"], ["DISCOVER", "REPEAT", "KEEP"]], "FM · 94.7"),
        chapter("podcasts", "播客", "Podcasts", "LONG FORM",
            ["长节目接收中", "LONG-FORM SIGNAL", "对话与长篇节目", "Conversations and Long-form"],
            [["Lenny's Podcast", "Lex Fridman Podcast", "忽左忽右"], ["Lenny's Podcast", "Lex Fridman Podcast", "Left and Right"]],
            [[["频率", "101.2"], ["节目", "03"], ["模式", "TALK"]], [["FREQ", "101.2"], ["SHOWS", "03"], ["MODE", "TALK"]]],
            [["接收", "聆听", "记录"], ["RECEIVE", "LISTEN", "NOTE"]], "FM · 101.2")
    ]
};
