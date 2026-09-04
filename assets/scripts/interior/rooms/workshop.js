import { chapter } from "./chapter.js?v=20260904-release";

export default {
    id: "workshop",
    code: "03 / BUILD",
    zh: "工程工坊",
    en: "Engineering Workshop",
    zhOutline: "项目现场",
    enOutline: "Projects",
    zhDescription: "这里展开三条真实工程链路：用完整开发闭环留住用户、从 0 到 1 交付 Changelog，以及赋予用户选择权并收束 Agent 权限。",
    enDescription: "Three real engineering paths: retaining users through a complete workflow, delivering the Changelog from 0 to 1, and giving users control while constraining agent access.",
    console: ["workshop", "构建工作台", "BUILD BENCH", "打开项目", "OPEN PROJECT"],
    media: [
        "assets/interiors/engineering-workshop.jpg",
        "MATTHEW MACHADO · CC BY-SA 4.0",
        "https://commons.wikimedia.org/wiki/File:Heavy_Machine_Shop_-_edited.jpg",
        "assets/interiors/cyber-engineering-workshop.jpg",
        "STOCKCAKE · PUBLIC DOMAIN · AI GENERATED",
        "https://stockcake.com/i/neon-workshop-dreams_1640867_1208676"
    ],
    focus: "center center",
    chapterAliases: {
        platforms: "capability-governance",
        products: "product-delivery",
        "research-code": "workflow-integration"
    },
    chapters: [
        chapter("workflow-integration", "端到端数据工作流 Skills", "End-to-End Data Workflow Skills", "DATA WORKFLOW SKILLS",
            ["项目主题", "PROJECT THEME", "用完整开发闭环真正留住用户", "Retain Users Through a Complete Development Loop"],
            [["为什么：数据开发跨越多个端侧，用户的完整任务被产品边界打断", "做了什么：用 Agent 编排下游能力，从理解目标到交付结果形成闭环", "结果：用户无需离开当前产品，数据集 Skill 成功调用次周增长 +520%"], ["Why: data development spans products, fragmenting one complete user task", "Built: the agent orchestrates downstream capabilities from intent to delivery", "Result: users stay in one product; successful dataset Skill calls grew 520% in week two"]],
            [[["次周增长", "+520%"], ["执行策略", "先校验"], ["最终交付", "结果链接"]], [["WEEK-2 GROWTH", "+520%"], ["EXECUTION", "VALIDATE"], ["DELIVERY", "RESULT"]]],
            [["理解目标 · 连接端侧", "执行前校验 · 完成开发", "返回产物 · 留在当前产品"], ["UNDERSTAND · CONNECT", "VALIDATE · COMPLETE", "RETURN · STAY IN PRODUCT"]], "BUILD · 01"),
        chapter("product-delivery", "Changelog 跨端信息管线", "Cross-System Changelog Pipeline", "0 → 1 PIPELINE",
            ["项目主题", "PROJECT THEME", "让用户每周看懂产品更新", "Help Users Understand Weekly Product Updates"],
            [["为什么：代码持续变化，用户却不知道产品新增了什么", "做了什么：CI 收集变化，AI 起草，人工确认后发布", "结果：独立完成 0 → 1，并重构为每周快照"], ["Why: code changed continuously, but users could not see what improved", "Built: CI collects changes, AI drafts, and humans approve before release", "Result: delivered 0 → 1 and rebuilt the output as weekly snapshots"]],
            [[["产品判断", "主动发现"], ["完整交付", "0 → 1"], ["上线之后", "持续重构"]], [["PRODUCT JUDGMENT", "DISCOVERED"], ["FULL DELIVERY", "0 → 1"], ["POST-LAUNCH", "REBUILT"]]],
            [["发现问题 · 提出入口", "跨仓开发 · 审核发布", "真实反馈 · 模型重构"], ["FIND · PROPOSE", "BUILD · REVIEW · RELEASE", "FEEDBACK · REBUILD"]], "BUILD · 02"),
        chapter("capability-governance", "Skill 运行时开关", "Skill Runtime Controls", "RUNTIME CONTROL",
            ["项目主题", "PROJECT THEME", "赋予用户选择权，收束 Agent 权限", "Give Users Control, Constrain Agent Access"],
            [["为什么：不同用户与场景需要同一 Skill 的不同版本", "做了什么：兼容真实文件、处理同名版本并统一运行时边界", "结果：用户可自由选择，Agent 上下文更精简且不会越权查找"], ["Why: users and scenarios need different versions of the same Skill", "Built: support real files, resolve same-name versions, and enforce one runtime boundary", "Result: users choose freely while the agent gets a smaller, authorized context"]],
            [[["用户能力", "CHOICE"], ["上下文", "LEAN"], ["运行边界", "STRICT"]], [["USER CONTROL", "CHOICE"], ["CONTEXT", "LEAN"], ["BOUNDARY", "STRICT"]]],
            [["发现 · 规范身份", "用户选择 · 版本对比", "必要能力 · 运行时过滤"], ["DISCOVER · NORMALIZE", "CHOOSE · COMPARE", "NECESSARY · ENFORCE"]], "BUILD · 03")
    ]
};
