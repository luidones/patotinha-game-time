import { LinearAnimation } from '../animations/linear-animation.js';
import { DIRECTIONS, PACE_TIMEOUT } from '../model/constants.js';
import { AVATAR_STATE_CHANGED } from '../model/events.js';

const SPRITE_TILE_SIZE = 64;
const TOON_SIZE = 48;

const IMAGES = {
    BODY: 'a_light',
    BOTTOM: 'jeans_navy',
    HAIR: '1_blond',
    TOP: 't-shirt_black'
};

export class AvatarRenderer {
    _eventTarget;
    _context;
    _images = [];
    _isImagesReady = false;
    _walkingStartTimeStamp = 0;
    
    direction = DIRECTIONS.Down;
    walking = false;

    constructor(eventTarget, scene, avatarId) {
        this._context = scene.context;
        this._eventTarget = eventTarget;
        this._eventTarget.addEventListener(`${AVATAR_STATE_CHANGED}:${avatarId}`, this._onAvatarStateChanged.bind(this));
        this._loadImages();
    }

    _onAvatarStateChanged(e) {
        if (e.detail.hasOwnProperty('direction'))
            this.direction = e.detail.direction;

        if (e.detail.hasOwnProperty('walking')) {
            if (e.detail.walking && !this.walking)
                this._walkingStartTimeStamp = performance.now();

            this.walking = e.detail.walking;
        }
    }

    _loadImages() {
        Promise.all([
            this._loadImage('bodies', IMAGES.BODY),
            this._loadImage('hairs', IMAGES.HAIR),
            this._loadImage('tops', IMAGES.TOP),
            this._loadImage('bottoms', IMAGES.BOTTOM)
        ])
        .then(() => {
            this._images = this._images
                .sort((a,b) => a.order - b.order)
                .map(i => i.image);

            this._isImagesReady = true;
        });
    }

    _loadImage(part, option, order) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve();
            image.onerror = (e) => reject(e);
            image.src = `/assets/images/avatar/${part}/${option}.png`;

            this._images.push({ order, image });
        });
    }

    _getWalkingOffset(timeStamp) {
        if (!this.walking) return 0;
        
        const animation = new LinearAnimation(PACE_TIMEOUT, 4, this._walkingStartTimeStamp);
        const animationState = animation.getState(timeStamp);
        
        return animationState.step * SPRITE_TILE_SIZE;
    }

    _getDirectionOffset() {
        switch (this.direction) {
            case DIRECTIONS.Left: return 64;
            case DIRECTIONS.Right: return 128;
            case DIRECTIONS.Up: return 192;
            default: return 0;
        }
    }

    render(timeStamp) {
        if (!this._isImagesReady) return;

        const cw = this._context.canvas.offsetWidth;
        const ch = this._context.canvas.offsetHeight;

        const x = cw/2 - TOON_SIZE/2;
        const y = ch/2 - TOON_SIZE/2;

        const offsetX = this._getWalkingOffset(timeStamp);
        const offsetY = this._getDirectionOffset();

        for (let i of this._images)
            this._context.drawImage(i, offsetX, offsetY, SPRITE_TILE_SIZE, SPRITE_TILE_SIZE, x, y, TOON_SIZE, TOON_SIZE);
    }
}