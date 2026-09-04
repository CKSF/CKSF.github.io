const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function orderWorkshopSections() {
    const order = [
        "workflow-integration",
        "product-delivery",
        "capability-governance",
        "other-works"
    ];

    document.querySelectorAll(".lang-block").forEach((languageBlock) => {
        const footer = languageBlock.querySelector(".w-footer");
        if (!footer) return;

        order.forEach((contentId) => {
            const section = languageBlock.querySelector(
                `[data-room-content="workshop"][data-content-id="${contentId}"]`
            );
            if (section) languageBlock.insertBefore(section, footer);
        });
    });
}

function updateStoryProgress(scroller) {
    const story = scroller.closest(".case-brief-scrollable");
    if (!story) return;

    const track = story.querySelector("[data-story-progress]");
    const label = story.querySelector("[data-story-progress-label]");
    const scrollableDistance = scroller.scrollHeight - scroller.clientHeight;
    const progress = scrollableDistance > 0
        ? clamp(scroller.scrollTop / scrollableDistance, 0, 1)
        : 1;

    if (track) track.style.transform = `scaleX(${progress})`;
    if (label) label.value = `${Math.round(progress * 100)}%`;
}

orderWorkshopSections();

document.querySelectorAll("[data-story-scroll]").forEach((scroller) => {
    const update = () => updateStoryProgress(scroller);
    scroller.addEventListener("scroll", update, { passive: true });
    update();
});
