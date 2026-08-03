(function () {
    "use strict";

    const sessionKey = "resume-studio:authorized";
    if (sessionStorage.getItem(sessionKey) === "v1") return;

    const next = encodeURIComponent(location.pathname + location.search + location.hash);
    location.replace(`login.html?next=${next}`);
})();
