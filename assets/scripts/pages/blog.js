(function () {
    "use strict";

    document.querySelectorAll(".lang-block").forEach((block) => {
        const buttons = block.querySelectorAll(".filter-btn");
        const posts = block.querySelectorAll(".post");

        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                const category = button.dataset.cat;
                buttons.forEach((item) => item.classList.toggle("active", item === button));
                posts.forEach((post) => {
                    post.style.display = category === "all" || post.dataset.cat === category ? "" : "none";
                });
                window.dispatchEvent(new CustomEvent("blog-filter-change", {
                    detail: { category }
                }));
            });
        });
    });
})();
