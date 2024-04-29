import { LinearAnimation } from "../animations/linear-animation.js";
import { PACE_TIMEOUT } from "../model/constants.js";
import { USER_MOVED } from "../model/events.js";

const MAP = 'office';
const TILE_SIZE = 32;
const MOVEMENT_ANIMATION_STEPS = 32;
const PIXELS_PER_STEP = TILE_SIZE / MOVEMENT_ANIMATION_STEPS;

export class MapRenderer {
    _eventTarget;
    _context;
    _image;
    _isImageReady = false;
    _animationStartTimeStamp;
    _relativePositionOffset = {
        current: { x: 0, y: 0 },
        target: { x: 0, y: 0 }
    };
    
    get size() { return MAP_SIZE; }

    constructor(eventTarget, scene, isForeground) {
        this._context = scene.context;

        this._eventTarget = eventTarget;
        this._eventTarget.addEventListener(USER_MOVED, this._onUserMoved.bind(this));
        
        this._image = new Image();
        this._image.onload = () => this._isImageReady = true;
        this._image.onerror = (e) => console.log(e);
        this._image.src = `/assets/images/maps/${MAP}${isForeground ? '_fg' : ''}.png`;
    }

    _onUserMoved(e) {
        if (!this._animationStartTimeStamp)
            this._animationStartTimeStamp = performance.now();

        this._relativePositionOffset.target = e.detail.newLocation;
    }

    _getAnimatedRelativePositionOffset(timeStamp, axis) {
        const target = this._relativePositionOffset.target[axis];
        const current = this._relativePositionOffset.current[axis]

        const distance = Math.abs(target - current);

        if (distance == 0) return 0;

        const direction = target > current ? 1 : -1;
        
        const stepDuration = PACE_TIMEOUT / MOVEMENT_ANIMATION_STEPS;
        const steps = MOVEMENT_ANIMATION_STEPS * distance;

        const animation = new LinearAnimation(stepDuration, steps, this._animationStartTimeStamp);
        const animationState = animation.getState(timeStamp);

        const done = animationState.stepsSoFar >= steps;

        if (done) {
            this._animationStartTimeStamp = 0;
            this._relativePositionOffset.current[axis] = target;
            return 0;
        }

        const offset = animationState.step * direction * PIXELS_PER_STEP;

        return offset;
    }

    render(timeStamp) {
        if (!this._isImageReady) return;

        const iw = this._image.width;
        const ih = this._image.height;

        const cw = this._context.canvas.offsetWidth;
        const ch = this._context.canvas.offsetHeight;

        const animationOffsetX = this._getAnimatedRelativePositionOffset(timeStamp, 'x');
        const animationOffsetY = this._getAnimatedRelativePositionOffset(timeStamp, 'y');

        const relativeOffsetX = this._relativePositionOffset.current.x * TILE_SIZE;
        const relativeOffsetY = this._relativePositionOffset.current.y * TILE_SIZE;

        const x = (iw/2 - cw/2) + relativeOffsetX + (animationOffsetX || 0) - TILE_SIZE/2;
        const y = (ih/2 - ch/2) + relativeOffsetY + animationOffsetY;

        this._context.drawImage(this._image, x, y, cw, ch, 0, 0, cw, ch);
    }
}