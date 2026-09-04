import { chapter } from "./chapter.js?v=20260904-release";

export default {
    id: "lab",
    code: "02 / LAB",
    zh: "研究实验室",
    en: "Research Laboratory",
    zhOutline: "论文与模型",
    enOutline: "Papers",
    zhDescription: "从临床问题、数据和指标出发，再决定模型。SeizureFormer 与 EpiDHGNN 的研究档案在楼下。",
    enDescription: "Start with the clinical problem, data, and metrics, then choose the model. SeizureFormer and EpiDHGNN are archived below.",
    console: ["lab", "实验读数", "LAB READOUT", "打开研究记录", "OPEN RESEARCH LOG"],
    media: [
        "assets/interiors/research-laboratory.jpg",
        "LUKASZKATLEWA · CC BY-SA 4.0",
        "https://commons.wikimedia.org/wiki/File:Laboratory_1_Analytical_Chemistry_Dept_Gdansk_University_of_Technology.jpg",
        "assets/interiors/cyber-research-laboratory.jpg",
        "STOCKCAKE · PUBLIC DOMAIN · AI GENERATED",
        "https://stockcake.com/i/futuristic-laboratory-work_1151903_752118"
    ],
    focus: "center center",
    chapters: [
        chapter("publications", "研究论文", "Publications", "PEER REVIEWED",
            ["同行评审记录", "PEER REVIEW RECORD", "SeizureFormer · PSB 2026", "SeizureFormer · PSB 2026"],
            [["共同第一作者", "口头报告 · 录用前 10%", "脑电表征与长周期风险建模"], ["Co-first author", "Oral presentation · Top 10%", "EEG representation and long-horizon risk"]],
            [[["论文", "02"], ["报告", "ORAL"], ["预测", "1–14 天"]], [["PAPERS", "02"], ["TALK", "ORAL"], ["FORECAST", "1–14 DAYS"]]],
            [["IEA / LE", "时序编码", "风险输出"], ["IEA / LE", "TEMPORAL ENCODER", "RISK OUTPUT"]], "PSB · 2026"),
        chapter("research-projects", "研究项目", "Research projects", "MODELS & SYSTEMS",
            ["实验运行中", "EXPERIMENT RUNNING", "机器学习 × 系统研究", "Machine Learning × Systems"],
            [["临床时序信号建模", "检索增强生成系统", "从假设到可复现实验"], ["Clinical time-series modeling", "Retrieval-augmented systems", "Hypothesis to reproducible experiment"]],
            [[["方向", "ML × SYSTEMS"], ["阶段", "ACTIVE"], ["产物", "CODE + PAPER"]], [["FIELD", "ML × SYSTEMS"], ["STATE", "ACTIVE"], ["OUTPUT", "CODE + PAPER"]]],
            [["问题", "实验", "验证"], ["QUESTION", "EXPERIMENT", "VALIDATE"]], "LAB · ACTIVE")
    ]
};
