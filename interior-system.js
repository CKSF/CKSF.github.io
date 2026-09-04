let mountedRuntime = null;

export async function mount({ main, room, requestedChapter = null, cityEntry = false }) {
    if (mountedRuntime) return mountedRuntime;
    if (!main || !room?.chapters?.length) return null;

    const retryAttempt = new URL(import.meta.url).searchParams.get("retry");
    const retryQuery = retryAttempt ? `&retry=${retryAttempt}` : "";
    const [
        { InteriorController },
        { InteriorModel },
        { InteriorRenderer }
    ] = await Promise.all([
        import(`./assets/scripts/interior/interior-controller.js?v=20260904-release${retryQuery}`),
        import(`./assets/scripts/interior/interior-model.js?v=20260904-release${retryQuery}`),
        import(`./assets/scripts/interior/interior-renderer.js?v=20260904-release${retryQuery}`)
    ]);
    const hasRequestedChapter = room.chapters.some((chapter) => chapter.id === requestedChapter);
    const activeChapter = hasRequestedChapter
        ? requestedChapter
        : room.chapters[0].id;
    const model = new InteriorModel({
        chapters: room.chapters,
        activeChapter,
        language: document.documentElement.lang.startsWith("en") ? "en" : "zh",
        theme: document.documentElement.dataset.siteTheme === "paper" ? "paper" : "signature"
    });
    const renderer = new InteriorRenderer({ main, room });
    const controller = new InteriorController({ model, renderer, room });
    let scene;
    try {
        scene = controller.mount({
            requestedChapter: hasRequestedChapter ? requestedChapter : null,
            cityEntry
        });
    } catch (error) {
        controller.dispose();
        throw error;
    }
    if (!scene) return null;

    let disposed = false;
    mountedRuntime = {
        scene,
        revealFromCity: () => controller.revealFromCity(),
        dispose() {
            if (disposed) return;
            disposed = true;
            controller.dispose();
            mountedRuntime = null;
        }
    };
    return mountedRuntime;
}
