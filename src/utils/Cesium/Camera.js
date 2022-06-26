import * as Cesium from "cesium/Cesium";

export class B_Camera {
    constructor(viewer) {
        this.viewer = viewer
    }

    flyTo(option) {
        this.viewer.camera.flyTo(option)
    }

    flyToFromDegree(lon, lat) {
        this.viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, 500),
        });
    }
}