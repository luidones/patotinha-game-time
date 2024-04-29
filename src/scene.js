import { AvatarRenderer } from "./renderers/avatar-renderer.js";
import { MapRenderer } from "./renderers/map-renderer.js";

export class Scene {
    _lastTimeStamp;
    _isRendering;
    fps;
    context;
    renderers;

    constructor(canvas, eventTarget) {
        window.onresize = () => this.resizeCanvas();
        
        this.context = canvas.getContext('2d');
        this.resizeCanvas();

        const avatarRenderer = new AvatarRenderer(eventTarget, this, 'user');
        const mapBackgroundRenderer = new MapRenderer(eventTarget, this);
        const mapForegroundRenderer = new MapRenderer(eventTarget, this, true);

        this.renderers = [mapBackgroundRenderer, avatarRenderer, mapForegroundRenderer];
    }

    resizeCanvas() {
        this.context.canvas.width = window.innerWidth;
        this.context.canvas.height = window.innerHeight;
    }

    render() {
        if (this._isRendering) return;
        
        this._isRendering = true;
        requestAnimationFrame(this.frameLoopCallback.bind(this));
    }

    dispose() {
        this._isRendering = false;
    }

    frameLoopCallback(timestamp) {
        if (!this._isRendering) return;

        if (!this._lastTimeStamp) {
            this._lastTimeStamp = performance.now();
            this.fps = 0;
        }
        else {
            const now = performance.now();
            const delta = (now - this._lastTimeStamp);
            this._lastTimeStamp = now;
            this.fps = 1000/delta;

            this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
            this.renderers.forEach(r => r.render(this._lastTimeStamp));
        }

        requestAnimationFrame(this.frameLoopCallback.bind(this));
    }
}