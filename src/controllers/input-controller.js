import { DIRECTIONS, PACE_TIMEOUT } from "../model/constants.js";
import { USER_STATE_CHANGED, USER_TRIED_TO_MOVE } from "../model/events.js";

export class InputController {
    _eventTarget;
    _lastKeyDown;
    _movementInterval;

    constructor(eventTarget) {
        this._eventTarget = eventTarget;

        this.keyDownHandler = this.handleKeyDown.bind(this);
        this.keyUpHandler = this.handleKeyUp.bind(this);
    }

    bindKeys() {
        document.addEventListener('keydown', this.keyDownHandler);
        document.addEventListener('keyup', this.keyUpHandler);
    }

    unbindKeys() {
        document.removeEventListener('keydown', this.keyDownHandler);
        document.removeEventListener('keyup', this.keyUpHandler);
    }

    handleKeyUp(e) {
        if (this._lastKeyDown == e.keyCode) {
            this._userStateChanged({ walking: false });
            clearInterval(this._movementInterval);
            this._lastKeyDown = null;
        }
    }

    handleKeyDown(e) {
        if (this._lastKeyDown == e.keyCode)
            return;
        
        this._lastKeyDown = e.keyCode;
        
        const d = e.keyCode == 37 ? DIRECTIONS.Left
                : e.keyCode == 38 ? DIRECTIONS.Up
                : e.keyCode == 39 ? DIRECTIONS.Right
                : e.keyCode == 40 ? DIRECTIONS.Down
                : null;

        if (!d) return;

        this._userStateChanged({ direction: d, walking: true });
        clearInterval(this._movementInterval);

        this._movementInterval = setInterval(async () => {
            this._userTriedToMove(d);
        }, PACE_TIMEOUT);
    }

    _userStateChanged(stateChanges) {
        const _event = new CustomEvent(USER_STATE_CHANGED, {
            detail: stateChanges
        });

        this._eventTarget.dispatchEvent(_event);
    }

    _userTriedToMove(direction) {
        const _event = new CustomEvent(USER_TRIED_TO_MOVE, {
            detail: { direction }
        });

        this._eventTarget.dispatchEvent(_event);
    }
}