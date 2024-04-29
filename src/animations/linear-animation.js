export class LinearAnimation {
    _stepDuration;
    _steps;
    _startingTimeStamp;

    constructor(stepDuration, steps, startingTimeStamp) {
        this._stepDuration = stepDuration;
        this._steps = steps;
        this._startingTimeStamp = startingTimeStamp;
    }

    getState(timeStamp) {
        const diff = timeStamp - this._startingTimeStamp;

        if (diff < 0) return 0;

        const stepsSoFar = (diff / this._stepDuration) | 0;
        const animationStep = stepsSoFar % this._steps;

        return { stepsSoFar, step: animationStep };
    }
}