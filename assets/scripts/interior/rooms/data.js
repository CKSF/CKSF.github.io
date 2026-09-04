import { chapter } from "./chapter.js?v=20260904-release";

export default {
    id: "data",
    code: "01 / DATA",
    zh: "数据控制室",
    en: "Data Control Room",
    zhOutline: "职业档案",
    enOutline: "Career",
    zhDescription: "这里概览三条 Agent 应用主线：端到端数据工作流 Skills、Changelog 跨端信息管线和 Skill 运行时开关。",
    enDescription: "Three Agent application tracks: End-to-End Data Workflow Skills, the Cross-System Changelog Pipeline, and Skill Runtime Controls.",
    console: ["control", "控制终端", "CONTROL TERMINAL", "打开档案", "OPEN RECORD"],
    media: [
        "assets/interiors/data-control-room.jpg",
        "NASA · PUBLIC DOMAIN",
        "https://commons.wikimedia.org/wiki/File:Apollo_Soyuz_Test_Project_Mission_Control.jpg",
        "assets/interiors/cyber-data-control-room.jpg",
        "STOCKCAKE · PUBLIC DOMAIN · AI GENERATED",
        "https://stockcake.com/i/synthwave-command-center_4139213_1864171"
    ],
    focus: "center center",
    chapters: [
        chapter("experience", "工作经历", "Experience", "EXPERIENCE",
            ["当前在线", "CURRENTLY ONLINE", "把 Agent 做成用户可以完成工作的产品入口", "Turn the Agent into a Product Where Users Complete Real Work"],
            [["端到端数据工作流 Skills：用完整开发闭环真正留住用户", "Changelog 跨端信息管线：主动发现问题并独立完成 0 → 1", "Skill 运行时开关：赋予用户选择权，收束 Agent 权限"], ["End-to-End Data Workflow Skills: retain users through a complete development loop", "Cross-System Changelog Pipeline: identify the gap and deliver it independently from 0 to 1", "Skill Runtime Controls: give users control while constraining agent access"]],
            [[["数据集 Skill", "+520%"], ["独立交付", "0 → 1"], ["能力控制", "CHOICE"]], [["DATASET SKILL", "+520%"], ["DELIVERY", "0 → 1"], ["CAPABILITY CONTROL", "CHOICE"]]],
            [["完整开发 · 留在产品", "发现问题 · 交付闭环", "用户选择 · 权限收束"], ["COMPLETE · RETAIN", "DISCOVER · DELIVER", "CHOOSE · CONSTRAIN"]], "03 · WORKSTREAMS"),
        chapter("research", "研究经历", "Research", "RESEARCH",
            ["研究信号", "RESEARCH SIGNAL", "SeizureFormer · PSB 2026", "SeizureFormer · PSB 2026"],
            [["共同第一作者", "口头报告 · 录用前 10%", "预测未来 1–14 天发作风险"], ["Co-first author", "Oral presentation · Top 10%", "Forecasting 1–14 day seizure risk"]],
            [[["论文", "02"], ["PSB 2026", "ORAL"], ["预测范围", "1–14 天"]], [["PAPERS", "02"], ["PSB 2026", "ORAL"], ["FORECAST", "1–14 DAYS"]]],
            [["RNS 数据", "时序建模", "风险预测"], ["RNS DATA", "TEMPORAL MODEL", "RISK FORECAST"]], "02 · PAPERS"),
        chapter("cases", "项目案例", "Case studies", "CASES",
            ["工程证据", "ENGINEERING EVIDENCE", "产品判断、完整交付与 Agent 能力边界", "Product Judgment, Complete Delivery, and Agent Capability Boundaries"],
            [["用跨端能力形成用户留在产品内的开发闭环", "主动发现信息断层，独立完成跨仓发布链路", "让用户选择 Skill 版本，同时限制 Agent 的访问范围"], ["Use cross-product capabilities to keep the development loop in one product", "Identify the information gap and independently deliver a cross-repository release path", "Let users choose Skill versions while limiting agent access"]],
            [[["数据集 Skill", "+520%"], ["完整交付", "0 → 1"], ["用户权利", "CHOICE"]], [["DATASET SKILL", "+520%"], ["FULL DELIVERY", "0 → 1"], ["USER CONTROL", "CHOICE"]]],
            [["理解 · 校验 · 交付", "发现 · 开发 · 重构", "选择 · 精简 · 限制"], ["UNDERSTAND · DELIVER", "DISCOVER · REBUILD", "CHOOSE · CONSTRAIN"]], "03 · PRODUCT STORIES"),
        chapter("skills", "能力与论文", "Skills & papers", "CAPABILITIES",
            ["工具链就绪", "TOOLCHAIN READY", "Agent 工程 × 产品系统", "Agent Engineering × Product"],
            [["TypeScript / Python / SQL", "MCP / Skills / RAG", "机器学习 / 分布式系统"], ["TypeScript / Python / SQL", "MCP / Skills / RAG", "ML / Distributed systems"]],
            [[["代码", "TS · PY · SQL"], ["AGENT", "MCP · RAG"], ["系统", "ML · DIST"]], [["CODE", "TS · PY · SQL"], ["AGENT", "MCP · RAG"], ["SYSTEMS", "ML · DIST"]]],
            [["产品判断", "工程实现", "模型能力"], ["PRODUCT", "ENGINEERING", "MODELS"]], "BUILD + PRODUCT")
    ]
};
