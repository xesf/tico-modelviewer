import { createVRCube } from './vrCube';
import { createFPSCounter } from './vrFPS';

let gui = null;

export function addVRGuiNode(renderer, controlNode) {
    if (!renderer.vr)
        return;

    if (!gui) {
        gui = createVRGui(renderer);
    }

    controlNode.add(gui.cube);
}

export function updateVRGui(presenting) {
    if (!gui)
        return;

    gui.cube.visible = presenting;
}

function createVRGui(renderer) {
    const cube = createVRCube();
    const fps = createFPSCounter(renderer);
    cube.add(fps);
    return {
        cube,
        fps
    };
}
