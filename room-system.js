import { getRoomMetadata, resolveRoom } from "./assets/scripts/interior/room-registry.js?v=20260904-release";

let runtime = null;
let activeRoomKey = null;
let initGeneration = 0;
let roomRuntimeAttempt = 0;

function debugState() {
    const root = window.__siteRuntimeDebug ||= {};
    return root.room ||= {
        roomId: null,
        kind: null,
        mounted: false,
        loadError: null
    };
}

function clearPending() {
    document.documentElement.classList.remove("interior-entry-pending", "darkroom-entry-pending");
}

function validCityEntry(roomId, params) {
    if (params.get("from") !== "city" || params.get("entry") !== "approach") return false;
    try {
        const savedEntry = JSON.parse(sessionStorage.getItem("city-building-entry") || "null");
        sessionStorage.removeItem("city-building-entry");
        return savedEntry?.id === roomId && Date.now() - savedEntry.at < 10000;
    } catch (error) {
        return false;
    }
}

function roomKey(roomId, search = location.search) {
    if (roomId !== "darkroom") return roomId;
    return `${roomId}:${new URLSearchParams(search).get("object") || "recent"}`;
}

async function initRoom() {
    const debug = debugState();
    const roomId = resolveRoom(location.pathname, location.search, location.hash);
    const main = document.querySelector("main.page");
    if (!roomId || !main || document.body.dataset.roomInitialized) {
        clearPending();
        return;
    }

    const generation = ++initGeneration;
    const params = new URLSearchParams(location.search);
    const fromCity = params.get("from") === "city";
    const recruiterEntry = roomId === "data" && params.get("entry") === "recruiter";
    activeRoomKey = roomKey(roomId);
    document.body.dataset.roomInitialized = "true";
    document.body.dataset.room = roomId;
    document.body.classList.add("room-page");
    debug.roomId = roomId;

    if (recruiterEntry) {
        document.body.classList.add("recruiter-entry");
        main.id = "main-content";
        debug.kind = "recruiter";
        clearPending();
        return;
    }

    main.id = "main-content";
    try {
        if (roomId === "darkroom") {
            debug.kind = "darkroom";
            const room = getRoomMetadata(roomId);
            if (!room) throw new Error(`No room metadata for ${roomId}`);
            if (!window.DarkroomInterior) throw new Error("DarkroomInterior is unavailable");
            const scene = window.DarkroomInterior.mount({ main, room });
            runtime = {
                scene,
                revealFromCity: () => window.DarkroomInterior.revealFromCity(scene),
                dispose: () => window.DarkroomInterior.dispose(scene)
            };
            document.body.classList.add("darkroom-experience-page");
        } else {
            debug.kind = "shared";
            const retryAttempt = roomRuntimeAttempt++;
            const retryQuery = retryAttempt ? `&retry=${retryAttempt}` : "";
            const { loadRoomContent } = await import(
                `./assets/scripts/interior/room-content.js?v=20260904-release${retryQuery}`
            );
            const room = await loadRoomContent(roomId, retryAttempt);
            if (generation !== initGeneration) return;
            if (!room) throw new Error(`No room content for ${roomId}`);
            const requestedChapter = params.get("section");
            const normalizedChapter =
                room.chapterAliases?.[requestedChapter] || requestedChapter;
            if (normalizedChapter && normalizedChapter !== requestedChapter) {
                const normalizedUrl = new URL(location.href);
                normalizedUrl.searchParams.set("section", normalizedChapter);
                history.replaceState(null, "", normalizedUrl);
            }
            const interior = await import(`./interior-system.js?v=20260904-release${retryQuery}`);
            if (generation !== initGeneration) return;
            const nextRuntime = await interior.mount({
                main,
                room,
                requestedChapter: normalizedChapter,
                cityEntry: validCityEntry(roomId, params)
            });
            if (generation !== initGeneration) {
                nextRuntime?.dispose();
                return;
            }
            runtime = nextRuntime;
        }

        debug.mounted = Boolean(runtime);
        if (fromCity) runtime?.revealFromCity();
        const hasDeepLink = params.has("section") || params.has("object");
        if (runtime && (fromCity || !hasDeepLink)) {
            requestAnimationFrame(() => window.scrollTo(0, 0));
        }
    } catch (error) {
        if (generation !== initGeneration) return;
        runtime?.dispose();
        runtime = null;
        activeRoomKey = null;
        delete document.body.dataset.roomInitialized;
        delete document.body.dataset.room;
        document.body.classList.remove("room-page", "darkroom-experience-page");
        debug.loadError = error instanceof Error ? error.message : String(error);
        console.error("[room-system] Failed to mount room runtime", error);
    } finally {
        if (generation === initGeneration) clearPending();
    }
}

function disposeRoomRuntime() {
    initGeneration += 1;
    runtime?.dispose();
    runtime = null;
    activeRoomKey = null;
    delete document.body.dataset.roomInitialized;
    delete document.body.dataset.room;
    document.body.classList.remove(
        "room-page",
        "recruiter-entry",
        "darkroom-experience-page"
    );
    const debug = debugState();
    debug.roomId = null;
    debug.kind = null;
    debug.mounted = false;
    debug.loadError = null;
}

function syncRoomFromLocation() {
    const nextRoomId = resolveRoom(location.pathname, location.search, location.hash);
    const currentRoomKey = nextRoomId === "darkroom"
        ? `darkroom:${document.querySelector(".darkroom-interior")?.dataset.activeSection || "recent"}`
        : activeRoomKey;
    if (roomKey(nextRoomId) === currentRoomKey) return;
    disposeRoomRuntime();
    initRoom();
}

window.addEventListener("pagehide", (event) => {
    if (event.persisted) return;
    disposeRoomRuntime();
});
window.addEventListener("hashchange", syncRoomFromLocation);
window.addEventListener("popstate", syncRoomFromLocation);

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRoom, { once: true });
} else {
    initRoom();
}
