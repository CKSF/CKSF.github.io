#!/usr/bin/env bash

set -eu

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CHROME_BIN="${CHROME_BIN:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PORT="${RESUME_EXPORT_PORT:-$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1]); s.close()')}"
PROFILE_DIR="$(mktemp -d "${TMPDIR:-/tmp}/resume-export.XXXXXX")"
SERVER_LOG="$PROFILE_DIR/server.log"
CHROME_PID=""

if [ ! -x "$CHROME_BIN" ]; then
    printf 'Chrome executable not found: %s\n' "$CHROME_BIN" >&2
    exit 1
fi

stop_process() {
    local pid="${1:-}"
    local watchdog_pid
    if [ -z "$pid" ]; then
        return
    fi
    if ! kill -0 "$pid" 2>/dev/null; then
        wait "$pid" 2>/dev/null || true
        return
    fi

    kill -TERM "$pid" 2>/dev/null || true
    (
        sleep 2
        kill -KILL "$pid" 2>/dev/null || true
    ) &
    watchdog_pid=$!
    wait "$pid" 2>/dev/null || true
    kill "$watchdog_pid" 2>/dev/null || true
    wait "$watchdog_pid" 2>/dev/null || true
}

cleanup() {
    stop_process "$CHROME_PID"
    stop_process "${SERVER_PID:-}"
    rm -rf "$PROFILE_DIR"
}
trap cleanup EXIT INT TERM

cd "$ROOT_DIR"
python3 -m http.server "$PORT" --bind 127.0.0.1 >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!

ready=0
for _ in $(seq 1 50); do
    if curl -fsS --connect-timeout 1 --max-time 1 \
        "http://127.0.0.1:$PORT/data/resume-official.json" >/dev/null 2>&1; then
        ready=1
        break
    fi
    sleep 0.1
done

if [ "$ready" -ne 1 ]; then
    printf 'Resume export server did not start within 5 seconds.\n' >&2
    exit 1
fi

export_pdf() {
    language="$1"
    output="$2"
    url="http://127.0.0.1:$PORT/resume-studio/print.html?export=1&lang=$language&mode=two&fontSize=10.5&density=1&template=classic"
    debug_port="$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1]); s.close()')"

    "$CHROME_BIN" \
        --headless=new \
        --disable-gpu \
        --disable-background-networking \
        --remote-debugging-port="$debug_port" \
        --user-data-dir="$PROFILE_DIR/chrome-$language" \
        "$url" >"$PROFILE_DIR/chrome-$language.log" 2>&1 &
    CHROME_PID=$!

    rm -f "$ROOT_DIR/$output"
    if ! DEBUG_PORT="$debug_port" OUTPUT_PATH="$ROOT_DIR/$output" EXPECTED_LANGUAGE="$language" node <<'NODE'
const fs = require("fs");

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const REQUEST_TIMEOUT_MS = 5000;
const EXPORT_TIMEOUT_MS = 20000;

(async () => {
    const exportTimeout = setTimeout(() => {
        console.error(`Resume export timed out after ${EXPORT_TIMEOUT_MS}ms`);
        process.exit(1);
    }, EXPORT_TIMEOUT_MS);
    const port = process.env.DEBUG_PORT;
    let pages;
    for (let attempt = 0; attempt < 100; attempt += 1) {
        try {
            pages = await (await fetch(`http://127.0.0.1:${port}/json/list`, {
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
            })).json();
            if (pages.some((page) => page.type === "page")) break;
        } catch (error) {}
        await sleep(100);
    }

    const page = pages && pages.find((candidate) => candidate.type === "page");
    if (!page) throw new Error("Chrome DevTools endpoint was not ready");

    const socket = new WebSocket(page.webSocketDebuggerUrl);
    const pending = new Map();
    let requestId = 0;
    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.id && pending.has(message.id)) {
            const request = pending.get(message.id);
            pending.delete(message.id);
            clearTimeout(request.timeout);
            if (message.error) request.reject(new Error(message.error.message));
            else request.resolve(message);
        }
    };
    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error(`Chrome DevTools WebSocket timed out after ${REQUEST_TIMEOUT_MS}ms`));
        }, REQUEST_TIMEOUT_MS);
        socket.onopen = () => {
            clearTimeout(timeout);
            resolve();
        };
        socket.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("Chrome DevTools WebSocket failed"));
        };
    });

    const call = (method, params = {}) => new Promise((resolve, reject) => {
        const id = ++requestId;
        const timeout = setTimeout(() => {
            pending.delete(id);
            reject(new Error(`${method} timed out after ${REQUEST_TIMEOUT_MS}ms`));
        }, REQUEST_TIMEOUT_MS);
        pending.set(id, { resolve, reject, timeout });
        socket.send(JSON.stringify({ id, method, params }));
    });

    let state;
    for (let attempt = 0; attempt < 100; attempt += 1) {
        try {
            const response = await call("Runtime.evaluate", {
                expression: `({
                    ready: document.documentElement.dataset.resumeReady === "true",
                    overflow: document.documentElement.dataset.resumeOverflow,
                    pages: document.documentElement.dataset.resumePages,
                    fonts: document.fonts.status,
                    text: document.body.innerText
                })`,
                returnByValue: true
            });
            state = response.result.result.value;
            if (state.ready && state.fonts === "loaded") break;
        } catch (error) {}
        await sleep(100);
    }

    const hasLocalizedHeading = process.env.EXPECTED_LANGUAGE === "zh"
        ? state?.text.includes("个人简介")
        : /summary/i.test(state?.text || "");
    if (!state || !state.ready || state.overflow !== "false" || state.pages !== "2"
        || !hasLocalizedHeading || !state.text.includes("520%")) {
        throw new Error(`Resume validation failed: ${JSON.stringify(state)}`);
    }

    const pdf = await call("Page.printToPDF", {
        displayHeaderFooter: false,
        printBackground: true,
        preferCSSPageSize: true
    });
    if (!pdf.result || !pdf.result.data) throw new Error("Chrome returned no PDF data");
    fs.writeFileSync(process.env.OUTPUT_PATH, Buffer.from(pdf.result.data, "base64"));
    socket.close();
    clearTimeout(exportTimeout);
})().catch((error) => {
    console.error(error);
    process.exit(1);
});
NODE
    then
        stop_process "$CHROME_PID"
        CHROME_PID=""
        printf 'Failed to validate or export %s resume. See %s\n' "$language" "$PROFILE_DIR/chrome-$language.log" >&2
        exit 1
    fi

    stop_process "$CHROME_PID"
    CHROME_PID=""

    if [ ! -s "$ROOT_DIR/$output" ]; then
        printf 'Chrome produced an empty %s resume.\n' "$language" >&2
        exit 1
    fi

    printf 'Generated %s\n' "$output"
}

export_pdf zh TianningFeng_Official_Resume_ZH.pdf
export_pdf en TianningFeng_Official_Resume.pdf
