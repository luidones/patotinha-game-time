import { Scene } from "./scene.js";
import { InputController } from "./controllers/input-controller.js";
import { StateController } from "./controllers/state-controller.js";

const canvas = document.getElementById('canvas');

class RuntimeRoot {
    eventTarget;
    scene;
    inputController;
    stateController;

    constructor() {
        this.eventTarget = new EventTarget();

        this.scene = new Scene(canvas, this.eventTarget);
        this.inputController = new InputController(this.eventTarget);
        this.stateController = new StateController(this.eventTarget);
    }

    start() {
        this.scene.render();
        this.inputController.bindKeys();
    }

    stop() {
        this.scene.dispose();
        this.inputController.unbindKeys();
    }
}

window.runtimeRoot = new RuntimeRoot();
window.runtimeRoot.start();