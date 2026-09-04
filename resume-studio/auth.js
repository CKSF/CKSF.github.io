(function () {
    "use strict";

    const sessionKey = "resume-studio:authorized";
    const params = new URLSearchParams(location.search);
    const localExport = ["127.0.0.1", "localhost"].includes(location.hostname)
        && params.get("export") === "1";
    if (localExport) return;
    if (sessionStorage.getItem(sessionKey) === "v1") return;

    const next = encodeURIComponent(location.pathname + location.search + location.hash);
    location.replace(`login.html?next=${next}`);
})();
