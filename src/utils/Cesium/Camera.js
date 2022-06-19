import * as Cesium from "cesium/Cesium";

export class B_Camera {
    constructor(viewer) {
        this.viewer = viewer
    }

    flyTo(option) {
        this.viewer.camera.flyTo(option)
    }
}