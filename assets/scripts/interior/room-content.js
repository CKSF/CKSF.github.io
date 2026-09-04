const roomModules = {
    data: "data",
    lab: "lab",
    workshop: "workshop",
    library: "library",
    apartment: "apartment",
    archive: "archive",
    radio: "radio"
};

export async function loadRoomContent(roomId, retryAttempt = 0) {
    if (!Object.hasOwn(roomModules, roomId)) return null;
    const retryQuery = retryAttempt ? `&retry=${retryAttempt}` : "";
    const module = await import(`./rooms/${roomModules[roomId]}.js?v=20260904-release${retryQuery}`);
    return module.default;
}

export function hasRoomContent(roomId) {
    return Object.hasOwn(roomModules, roomId);
}
