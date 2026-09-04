import { CityController } from "./city-controller.js?v=20260904-release";
import { CityModel } from "./city-model.js?v=20260904-release";
import { CityRenderer } from "./city-renderer.js?v=20260904-release";

const THREE_URLS = [
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js",
    "https://unpkg.com/three@0.180.0/build/three.module.js"
];

async function loadThree(retryAttempt = 0) {
    let lastError;
    for (const url of THREE_URLS) {
        try {
            const retryQuery = retryAttempt ? `?city_retry=${retryAttempt}` : "";
            return await import(`${url}${retryQuery}`);
        } catch (error) {
            lastError = error;
        }
    }
    throw lastError || new Error("Unable to load Three.js");
}

function cityDebugState() {
    const runtimeDebug = window.__siteRuntimeDebug ||= {};
    return runtimeDebug.city ||= {
        activeInstances: 0,
        rafActive: false,
        listenerCount: 0,
        rendererDisposed: true,
        renderCalls: 0,
        triangles: 0,
        quality: "unloaded"
    };
}

export async function createCityApp(options) {
    const THREE = await loadThree(options.retryAttempt);
    const debug = cityDebugState();
    let renderer;
    let model;
    let controller;
    let destroyed = false;

    const compact = Boolean(options.compact);
    const theme = document.documentElement.dataset.siteTheme || "signature";

    try {
        renderer = new CityRenderer(THREE, {
            canvas: options.canvas,
            viewport: options.viewport,
            compact
        });
        const capabilities = renderer.getCapabilities();
        model = new CityModel(THREE, {
            compact,
            theme,
            ...capabilities,
            canvasFactory: () => document.createElement("canvas")
        });

        const app = {
            start() {
                if (destroyed) return;
                controller.start();
            },
            pause() {
                controller?.pause();
            },
            resume() {
                controller?.resume();
            },
            restoreAfterNavigation() {
                controller?.restoreAfterNavigation();
            },
            destroy() {
                if (destroyed) return;
                destroyed = true;
                controller?.dispose();
                model?.dispose();
                renderer?.dispose();
                debug.activeInstances = Math.max(0, debug.activeInstances - 1);
                debug.rafActive = false;
                debug.listenerCount = 0;
                debug.rendererDisposed = true;
                debug.renderCalls = renderer?.renderCalls || 0;
                debug.triangles = renderer?.triangles || 0;
                debug.quality = renderer?.quality || "disposed";
            }
        };

        controller = new CityController(THREE, {
            model,
            renderer,
            viewport: options.viewport,
            canvas: options.canvas,
            loader: options.loader,
            tooltip: options.tooltip,
            compact,
            reducedMotion: options.reducedMotion,
            onDestroyRequest: () => app.destroy(),
            onDebug: (state) => Object.assign(debug, state, {
                rendererDisposed: renderer.disposed
            })
        });

        debug.activeInstances += 1;
        debug.rendererDisposed = false;
        debug.quality = renderer.quality;
        return app;
    } catch (error) {
        controller?.dispose();
        model?.dispose();
        renderer?.dispose();
        debug.rendererDisposed = Boolean(renderer?.disposed);
        throw error;
    }
}

export { CityController, CityModel, CityRenderer };
