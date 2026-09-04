const registry = {
    "hire.html": { allowed: ["data"], defaultRoom: "data" },
    "work.html": { allowed: ["lab", "workshop"], defaultRoom: "lab" },
    "blog.html": { allowed: ["library"], defaultRoom: "library" },
    "now.html": { allowed: ["apartment"], defaultRoom: "apartment" },
    "reading.html": { allowed: ["archive"], defaultRoom: "archive" },
    "listening.html": { allowed: ["radio"], defaultRoom: "radio" },
    "photos.html": { allowed: ["darkroom"], defaultRoom: "darkroom" }
};

const roomMetadata = {
    darkroom: {
        id: "darkroom",
        code: "08 / IMAGE",
        zh: "城市暗房",
        en: "City Darkroom",
        zhOutline: "视觉笔记",
        enOutline: "Images",
        zhDescription: "城市、剪影与桌面考古。照片只有在筛选和编辑完成后，才会离开暗房。",
        enDescription: "Cities, silhouettes, and desktop archaeology. Photographs leave the darkroom only when the edit is ready."
    }
};

export function resolveRoom(pathname, search = "", hash = "") {
    const page = pathname.split("/").pop() || "index.html";
    const route = registry[page];
    if (!route) return null;

    const requested = new URLSearchParams(search).get("room");
    if (requested && route.allowed.includes(requested)) return requested;
    if (!requested && page === "work.html" && hash === "#projects") return "workshop";
    return route.defaultRoom;
}

export function getRoomMetadata(roomId) {
    return roomMetadata[roomId] || null;
}

export function isDarkroomRoute(pathname) {
    return (pathname.split("/").pop() || "index.html") === "photos.html";
}

export function allowedRooms(pathname) {
    const page = pathname.split("/").pop() || "index.html";
    return registry[page] ? [...registry[page].allowed] : [];
}
