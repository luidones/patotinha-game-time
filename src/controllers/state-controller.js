import { DIRECTIONS } from "../model/constants.js";
import { USER_MOVED, USER_TRIED_TO_MOVE } from "../model/events.js";

export class StateController {
    _eventTarget;
    _userLocation = { x: 0, y: 0 };
    
    constructor(eventTarget) {
        this._eventTarget = eventTarget;
        this._eventTarget.addEventListener(USER_TRIED_TO_MOVE, this._onUserTriedToMove.bind(this));
    }

    _onUserTriedToMove(e) {
        const newLocation = { ...this._userLocation };
        
        switch (e.detail.direction) {
            case DIRECTIONS.Up:
                newLocation.y--;
                break;
            case DIRECTIONS.Down:
                newLocation.y++;
                break;
            case DIRECTIONS.Left:
                newLocation.x--;
                break;
            case DIRECTIONS.Right:
                newLocation.x++;
                break;
            default: return;
        }

        this._userLocation = newLocation;

        const _event = new CustomEvent(USER_MOVED, {
            detail: { newLocation }
        });

        this._eventTarget.dispatchEvent(_event);
    }
}