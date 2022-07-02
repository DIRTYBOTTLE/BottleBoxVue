import * as Cesium from "cesium/Cesium";
import {ElNotification} from "element-plus";

export class B_Paint {
    constructor(viewer) {
        this.viewer = viewer
        this.paintDataSource = new Cesium.CustomDataSource('paint');
        this.paintEntities = this.paintDataSource.entities
        this.viewer.dataSources.add(this.paintDataSource);
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas)
    }

    clear() {
        this._changeCursor(false)
        this.paintEntities.removeAll()
        this.clearHandler()
        // this.handler.destroy()
        // this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        // this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        // this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    clearHandler() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    }

    paintPointTool() {
        ElNotification({
            title: '操作提示', message: "左键开始，右键结束", type: 'info', position: 'top-left',
        })
        this._changeCursor(true)
        // let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas)
        this.handler.setInputAction((clickEvent) => {
            let cartesian = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(clickEvent.position), this.viewer.scene);
            if (!cartesian) {
                return false;
            }
            this.paintEntities.add(B_Paint.paintPoint(cartesian))
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.setInputAction(() => {
            this._changeCursor(false)
            this.clearHandler()
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }

    paintPolylineTool() {
        ElNotification({
            title: '操作提示', message: "左键开始，右键结束", type: 'info', position: 'top-left',
        })
        let mouseMove
        this._changeCursor(true)
        const cartesian3Arr = []
        this.paintEntities.add(B_Paint.paintPolyline(cartesian3Arr))
        // const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas)
        this.handler.setInputAction((event) => {
            cartesian3Arr.pop()
            cartesian3Arr.push(this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(event.position), this.viewer.scene))
            this.paintEntities.add(B_Paint.paintPoint(cartesian3Arr.slice(cartesian3Arr.length - 1, cartesian3Arr.length)[0]))
            mouseMove = false
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
        // 若添加了第一个点，画出辅助线
        this.handler.setInputAction((event) => {

            if (cartesian3Arr[0]) {
                if (!mouseMove) {
                    cartesian3Arr.push(this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(event.endPosition), this.viewer.scene))
                    mouseMove = true
                } else {
                    cartesian3Arr.pop()
                    cartesian3Arr.push(this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(event.endPosition), this.viewer.scene))
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        // 右键
        this.handler.setInputAction(() => {
            this._changeCursor(false)
            cartesian3Arr.pop()
            this.clearHandler()
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }

    paintPolylineGroundTool() {
        ElNotification({
            title: '操作提示', message: "左键开始，右键结束", type: 'info', position: 'top-left',
        })
        let mouseMove
        this._changeCursor(true)
        const cartesian3Arr = []
        this.paintEntities.add(B_Paint.paintPolylineGround(cartesian3Arr))
        // const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas)
        this.handler.setInputAction((event) => {
            cartesian3Arr.pop()
            cartesian3Arr.push(this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(event.position), this.viewer.scene))
            this.paintEntities.add(B_Paint.paintPoint(cartesian3Arr.slice(cartesian3Arr.length - 1, cartesian3Arr.length)[0]))
            mouseMove = false
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
        // 若添加了第一个点，画出辅助线
        this.handler.setInputAction((event) => {

            if (cartesian3Arr[0]) {
                if (!mouseMove) {
                    cartesian3Arr.push(this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(event.endPosition), this.viewer.scene))
                    mouseMove = true
                } else {
                    cartesian3Arr.pop()
                    cartesian3Arr.push(this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(event.endPosition), this.viewer.scene))
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        // 右键
        this.handler.setInputAction(() => {
            this._changeCursor(false)
            cartesian3Arr.pop()
            this.clearHandler()
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }

    paintPolygonTool() {
        ElNotification({
            title: '操作提示', message: "左键开始，右键结束", type: 'info', position: 'top-left',
        })
        let mouseMove
        this._changeCursor(true)
        const cartesian3Arr = []
        this.paintEntities.add(B_Paint.paintPolylineGround(cartesian3Arr))
        // const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas)
        this.handler.setInputAction((event) => {
            cartesian3Arr.pop()
            cartesian3Arr.push(this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(event.position), this.viewer.scene))
            this.paintEntities.add(B_Paint.paintPoint(cartesian3Arr.slice(cartesian3Arr.length - 1, cartesian3Arr.length)[0]))
            mouseMove = false
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
        // 若添加了第一个点，画出辅助线
        this.handler.setInputAction((event) => {

            if (cartesian3Arr[0]) {
                if (!mouseMove) {
                    cartesian3Arr.push(this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(event.endPosition), this.viewer.scene))
                    mouseMove = true
                } else {
                    cartesian3Arr.pop()
                    cartesian3Arr.push(this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(event.endPosition), this.viewer.scene))
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        // 右键
        this.handler.setInputAction(() => {
            this.clearHandler()
            this._changeCursor(false)
            cartesian3Arr.pop()
            this.paintEntities.add(B_Paint.paintPolygon(cartesian3Arr))
            cartesian3Arr.push(cartesian3Arr[0])
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }

    static paintPoint(cartesian3, imgUrl) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian3)
        if (!imgUrl) {
            return new Cesium.Entity({
                name: '点',
                position: cartesian3,
                point: {
                    color: Cesium.Color.fromCssColorString('#D75624'),
                    pixelSize: 8,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                },
                description: `${'<table class="cesium-infoBox-defaultTable"><tbody>' +
                    "<tr><th>经度</th><td>"}${cartographic.longitude / Math.PI * 180}</td></tr>` +
                    `<tr><th>纬度</th><td>${cartographic.latitude / Math.PI * 180}</td></tr>` +
                    `<tr><th>高程</th><td>${cartographic.height}</td></tr>` +
                    `</tbody></table>`,

            })
        }
        return new Cesium.Entity({
            name: '点',
            position: cartesian3,
            billboard: {
                image: imgUrl,
                width: 30,
                height: 30,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM
            },
            description: `${'<table class="cesium-infoBox-defaultTable"><tbody>' +
                "<tr><th>经度</th><td>"}${cartographic.longitude / Math.PI * 180}</td></tr>` +
                `<tr><th>纬度</th><td>${cartographic.latitude / Math.PI * 180}</td></tr>` +
                `<tr><th>高程</th><td>${cartographic.height}</td></tr>` +
                `</tbody></table>`,
        })

    }

    static paintPolyline(cartesian3Arr) {
        let dynamicPositions = new Cesium.CallbackProperty(() => {
            return cartesian3Arr;
        }, false);
        return new Cesium.Entity({
            name: '线', polyline: {
                positions: dynamicPositions,
                width: 2,
                arcType: Cesium.ArcType.NONE,
                material: Cesium.Color.fromCssColorString('#85AB77'), //获取或设置折线的表面外观
            }
        })
    }

    static paintPolylineGround(cartesian3Arr) {
        let dynamicPositions = new Cesium.CallbackProperty(() => {
            return cartesian3Arr;
        }, false);
        return new Cesium.Entity({
            name: '线', polyline: {
                positions: dynamicPositions,
                width: 2,
                arcType: Cesium.ArcType.RHUMB,
                material: Cesium.Color.fromCssColorString('#85AB77'), //获取或设置折线的表面外观
                clampToGround: true
            }
        })
    }

    static paintPolygon(cartesian3Arr) {
        let dynamicPositions = new Cesium.CallbackProperty(() => {
            return new Cesium.PolygonHierarchy(cartesian3Arr);
        }, false);
        return new Cesium.Entity({
            polygon: {
                hierarchy: dynamicPositions,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                material: Cesium.Color.fromCssColorString('#66DA9A').withAlpha(0.5), // classificationType: Cesium.ClassificationType.BOTH // 贴地表和贴模型,如果设置了，这不能使用挤出高度
            }
        })
    };

    _changeCursor(changeBool) {
        const body = document.querySelector("body")
        if (changeBool) {
            body.style.cursor = "crosshair"
        } else {
            body.style.cursor = "default"
        }
    }
}