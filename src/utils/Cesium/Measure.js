import * as Cesium from "cesium/Cesium";
import * as widgets from "cesium/Widgets/widgets.css";

export class B_Measure {
    constructor(viewer, options) {
        this.viewer = viewer
        // this.viewer.scene.globe.depthTestAgainstTerrain = true

        // 测量实体集
        this.entityCollection = []
        this.measureDataSource = new Cesium.CustomDataSource('measureData');
        this.measureCollection = this.measureDataSource.entities;
        viewer.dataSources.add(this.measureDataSource);
    }
    // getCollection() {
    //     return this.entityCollection;
    // };

    clear(callback) {
        const body = document.querySelector("body")
        body.style.cursor = "default"
        this.measureCollection.removeAll();
        this.entityCollection = [];
        this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        if (callback) {
            callback()
        }
    };

    measurePolyLine(callback) {
        const body = document.querySelector("body")
        body.style.cursor = "crosshair"

        let positions = [];
        let labelEntity = null; // 标签实体
        let lineEntity = null; //线实体

        // 注册鼠标左击事件
        this.viewer.screenSpaceEventHandler.setInputAction((clickEvent) => {
            // 需要设置this.viewer.scene.globe.depthTestAgainstTerrain = true
            // let cartesian = this.viewer.scene.pickPosition(clickEvent.position);
            let cartesian = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(clickEvent.position), this.viewer.scene);
            if (!cartesian) {
                return false;
            }
            // 存储第一个点
            if (positions.length === 0) {
                positions.push(cartesian)
                this.addPoint(cartesian);
            }
            // 存储第二个点
            if (positions.length === 2) {
                this.addPoint(cartesian);
                this.addLine([positions[0], positions[1]]);
                // console.log(labelEntity.position)
                labelEntity = null
                // lineEntity = null
                positions.shift()
                positions.push(cartesian)
                if (callback) {
                    callback()
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this.viewer.screenSpaceEventHandler.setInputAction((moveEvent) => {
            // let movePosition = this.viewer.scene.pickPosition(moveEvent.endPosition); // 鼠标移动的点
            let movePosition = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(moveEvent.endPosition), this.viewer.scene);
            if (!movePosition) {
                return false;
            }
            if (positions.length === 1) {
                positions.push(movePosition);
                // 绘制线
                lineEntity = this.addLine(positions);
            }
            if (positions.length === 2) {
                positions.pop();
                positions.push(movePosition);

                // 销毁之前label
                if (labelEntity) {
                    this.measureCollection.remove(labelEntity);
                    this.entityCollection.splice(this.entityCollection.indexOf(labelEntity), 1);
                }

                // 计算中点
                let centerPoint = Cesium.Cartesian3.midpoint(positions[0], positions[1], new Cesium.Cartesian3());
                // 计算距离
                let lengthText = "距离：" + this.getLengthText(positions[0], positions[1]);
                // 绘制实体
                labelEntity = this.addLabel(centerPoint, lengthText);
                // this.entityCollection.push(labelEntity);
            }

        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.viewer.screenSpaceEventHandler.setInputAction((rightClickEvent) => {
            body.style.cursor = "default"

            this.measureCollection.remove(lineEntity);
            this.entityCollection.splice(this.entityCollection.indexOf(lineEntity), 1);


            this.measureCollection.remove(labelEntity);
            this.entityCollection.splice(this.entityCollection.indexOf(labelEntity), 1);

            this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

    };

    measurePolyLineToGround(callback) {
        const body = document.querySelector("body")
        body.style.cursor = "crosshair"

        let positions = [];
        let labelEntity = null; // 标签实体
        let lineEntity = null; //线实体

        // 注册鼠标左击事件
        this.viewer.screenSpaceEventHandler.setInputAction((clickEvent) => {
            // 需要设置this.viewer.scene.globe.depthTestAgainstTerrain = true
            // let cartesian = this.viewer.scene.pickPosition(clickEvent.position);
            let cartesian = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(clickEvent.position), this.viewer.scene);
            if (!cartesian) {
                return false;
            }
            // 存储第一个点
            if (positions.length === 0) {
                positions.push(cartesian)
                this.addPoint(cartesian);
            }
            // 存储第二个点
            if (positions.length === 2) {
                this.addPoint(cartesian);
                this.addLineToGround([positions[0], positions[1]]);

                Promise.resolve(this.distanceToGround(positions[0], positions[1])).then((result) => {
                    let centerPoint = result[3]
                    let length = result[0]
                    // 计算距离
                    if (length > 1000) {
                        length = (length / 1000).toFixed(2) + " 公里";
                    } else {
                        length = length.toFixed(2) + " 米";
                    }
                    let lengthText = "距离：" + length;
                    // 绘制实体
                    labelEntity = this.addLabel(centerPoint, lengthText);
                    this.entityCollection.push(labelEntity);
                    labelEntity = null
                })
                positions.shift()
                positions.push(cartesian)
                if (callback) {
                    callback()
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this.viewer.screenSpaceEventHandler.setInputAction((moveEvent) => {
            // let movePosition = this.viewer.scene.pickPosition(moveEvent.endPosition); // 鼠标移动的点
            let movePosition = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(moveEvent.endPosition), this.viewer.scene);
            if (!movePosition) {
                return false;
            }
            if (positions.length === 1) {
                positions.push(movePosition);
                // 绘制线
                lineEntity = this.addLineToGround(positions);
            }
            if (positions.length === 2) {
                positions.pop();
                positions.push(movePosition);

                // 销毁之前label
                // if (labelEntity) {
                //     this.viewer.entities.remove(labelEntity);
                //     this.entityCollection.splice(this.entityCollection.indexOf(labelEntity), 1);
                // }


                // // 计算中点
                // let centerPoint = Cesium.Cartesian3.midpoint(positions[0], positions[1], new Cesium.Cartesian3());
                // // 计算距离
                // let lengthText = "距离：" + this.getLengthText(positions[0], positions[1]);
                // // 绘制实体
                // labelEntity = this.addLabel(centerPoint, lengthText);
                // this.entityCollection.push(labelEntity);
            }

        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.viewer.screenSpaceEventHandler.setInputAction((rightClickEvent) => {
            body.style.cursor = "default"

            this.measureCollection.remove(lineEntity);
            this.entityCollection.splice(this.entityCollection.indexOf(lineEntity), 1);


            // this.viewer.entities.remove(labelEntity);
            // this.entityCollection.splice(this.entityCollection.indexOf(labelEntity), 1);

            this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

    };

    addPoint(position) {
        this.entityCollection.push(this.measureCollection.add(new Cesium.Entity({
            position: position,
            point: {
                color: Cesium.Color.YELLOW, pixelSize: 15, heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            }
        })));
    }

    addLine(positions) {
        let dynamicPositions = new Cesium.CallbackProperty(() => {
            return positions;
        }, false);
        let lineEntity = this.measureCollection.add(new Cesium.Entity({
            name: '线', polyline: {
                positions: dynamicPositions, width: 2, arcType: Cesium.ArcType.NONE, material: Cesium.Color.RED, //获取或设置折线的表面外观
            }
        }))
        this.entityCollection.push(lineEntity);
        return lineEntity;
    };

    addLineToGround(positions) {
        let dynamicPositions = new Cesium.CallbackProperty(() => {
            return positions;
        }, false);
        let lineEntity = this.measureCollection.add(new Cesium.Entity({
            name: '线', polyline: {
                positions: dynamicPositions, width: 2, arcType: Cesium.ArcType.RHUMB, material: Cesium.Color.RED, //获取或设置折线的表面外观
                clampToGround: true
            }
        }))
        this.entityCollection.push(lineEntity);
        return lineEntity;
    };

    addPolyGon(positions) {
        var dynamicPositions = new Cesium.CallbackProperty(() => {
            return new Cesium.PolygonHierarchy(positions);
        }, false);
        this.entityCollection.push(this.viewer.entities.add(new Cesium.Entity({
            polygon: {
                hierarchy: dynamicPositions,
                material: Cesium.Color.RED.withAlpha(0.6),
                classificationType: Cesium.ClassificationType.BOTH // 贴地表和贴模型,如果设置了，这不能使用挤出高度
            }
        })));
    };

    addLabel(centerPoint, text) {
        return this.measureCollection.add(new Cesium.Entity({
            position: centerPoint, label: {
                text: text, font: '14px sans-serif', style: Cesium.LabelStyle.FILL_AND_OUTLINE, //FILL  FILL_AND_OUTLINE OUTLINE
                fillColor: Cesium.Color.YELLOW, showBackground: true, //指定标签后面背景的可见性
                backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 0.8), // 背景颜色
                backgroundPadding: new Cesium.Cartesian2(6, 6), //指定以像素为单位的水平和垂直背景填充padding
                pixelOffset: new Cesium.Cartesian2(0, -25), disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        }));
    };

    getLengthText(firstPoint, secondPoint) {
        // 计算距离
        var length = Cesium.Cartesian3.distance(firstPoint, secondPoint);
        if (length > 1000) {
            length = (length / 1000).toFixed(2) + " 公里";
        } else {
            length = length.toFixed(2) + " 米";
        }
        return length;
    };

    getArea(points) {
        var ps = []
        for (var i = 0; i < points.length; i++) {
            var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(points[i]);
            var height = this.viewer.scene.globe.getHeight(cartographic);
            var point = Cesium.Cartesian3.fromDegrees(cartographic.longitude / Math.PI * 180, cartographic.latitude / Math.PI * 180, height);
            ps.push(point)
        }
        var s = 0;
        for (var i = 0; i < ps.length; i++) {
            var p1 = ps[i];
            var p2;
            if (i < ps.length - 1) p2 = ps[i + 1]; else p2 = ps[0];
            s += p1.x * p2.y - p2.x * p1.y;
        }
        var res

        if (s < 1000000) {
            res = Math.abs(s).toFixed(4) + " 平方米";
        } else {
            res = Math.abs((s / 1000000.0).toFixed(4)) + " 平方公里";
        }

        return res;
    }

    getCenterOfGravityPoint(mPoints) {
        var centerPoint = mPoints[0];
        for (var i = 1; i < mPoints.length; i++) {
            centerPoint = Cesium.Cartesian3.midpoint(centerPoint, mPoints[i], new Cesium.Cartesian3());
        }
        return centerPoint;
    }

    /*
    * 贴线距离
    * 1.计算两点直线距离，每米一个内插点，
    * 2.
    * @param left 起点 right 终点
    * */
    async distanceToGround(left, right) {
        let linearDistance = Cesium.Cartesian3.distance(left, right);
        let count = Math.floor(linearDistance);

        // 得到各点经纬度坐标
        let positions = [];
        let startCartographic = Cesium.Cartographic.fromCartesian(left);
        let endCartographic = Cesium.Cartographic.fromCartesian(right);
        positions.push(startCartographic);
        for (let i = 1; i < count; i++) {
            let cart = Cesium.Cartesian3.lerp(left, right, i / count, new Cesium.Cartesian3());
            positions.push(Cesium.Cartographic.fromCartesian(cart));
        }
        positions.push(endCartographic);

        const terrainProvider = Cesium.createWorldTerrain();
        // let promise = Cesium.sampleTerrainMostDetailed(
        //     this.viewer.terrainProvider,
        //     positions
        // );
        let promise = Cesium.sampleTerrain(terrainProvider, 12, positions);
        return Promise.resolve(promise).then(function (updatedPositions) {
            // positions[0].height and positions[1].height have been updated.
            // updatedPositions is just a reference to positions.
            // console.log(updatedPositions)
            let surfaceDistance = 0;
            for (let i = 0; i < updatedPositions.length; i++) {
                if (i === updatedPositions.length - 1) continue;
                surfaceDistance += Cesium.Cartesian3.distance(Cesium.Cartesian3.fromRadians(updatedPositions[i].longitude, updatedPositions[i].latitude, updatedPositions[i].height), Cesium.Cartesian3.fromRadians(updatedPositions[i + 1].longitude, updatedPositions[i + 1].latitude, updatedPositions[i + 1].height));
            }
            return [surfaceDistance, left, right, Cesium.Cartesian3.fromRadians(updatedPositions[Math.floor(updatedPositions.length / 2)].longitude, updatedPositions[Math.floor(updatedPositions.length / 2)].latitude, updatedPositions[Math.floor(updatedPositions.length / 2)].height)];
        });


    }

}