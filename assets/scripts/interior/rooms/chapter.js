export function chapter(id, zh, en, code, copy, lines, stats, flow, metric, targetId = id, filter = null) {
    return {
        id,
        zh,
        en,
        code,
        targetId,
        filter,
        terminal: {
            zhStatus: copy[0],
            enStatus: copy[1],
            zhTitle: copy[2],
            enTitle: copy[3],
            zhLines: lines[0],
            enLines: lines[1],
            zhStats: stats[0],
            enStats: stats[1],
            zhFlow: flow[0],
            enFlow: flow[1],
            metric
        }
    };
}
