import * as Cesium from "cesium/Cesium";
import {randomPoint} from "@turf/random"
import {point, polygon} from "@turf/helpers";
import tin from "@turf/tin"
import bbox from "@turf/bbox";
import pointsWithinPolygon from "@turf/points-within-polygon";

export class B_Measure {
    constructor(viewer) {
        this.viewer = viewer
        // this.viewer.scene.globe.depthTestAgainstTerrain = true
        // 测量实体集
        this.entityCollection = []
        this.measureDataSource = new Cesium.CustomDataSource('measureData');
        this.measureCollection = this.measureDataSource.entities;
        viewer.dataSources.add(this.measureDataSource);
    }

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

        let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas)

        // 注册鼠标左击事件
        handler.setInputAction((clickEvent) => {
            // 需要设置this.viewer.scene.globe.depthTestAgainstTerrain = true
            // let cartesian = this.viewer.scene.pickPosition(clickEvent.position);
            let cartesian = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(clickEvent.position), this.viewer.scene);
            if (!cartesian) {
                return false;
            }
            // 存储第一个点
            if (positions.length === 0) {
                positions.push(cartesian)
                this.drawPoint(cartesian);
            }
            // 存储第二个点
            if (positions.length === 2) {
                this.drawPoint(cartesian);
                this.addLine([positions[0], positions[1]]);
                labelEntity = null
                positions.shift()
                positions.push(cartesian)
                if (callback) {
                    callback()
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        handler.setInputAction((moveEvent) => {
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

        handler.setInputAction(() => {
            body.style.cursor = "default"

            this.measureCollection.remove(lineEntity);
            this.entityCollection.splice(this.entityCollection.indexOf(lineEntity), 1);

            this.measureCollection.remove(labelEntity);
            this.entityCollection.splice(this.entityCollection.indexOf(labelEntity), 1);

            handler.destroy()
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

    };

    measurePolyLineToGround(callback) {
        const body = document.querySelector("body")
        body.style.cursor = "crosshair"

        let positions = [];
        let labelEntity = null; // 标签实体
        let lineEntity = null; //线实体

        let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas)

        // 注册鼠标左击事件
        handler.setInputAction((clickEvent) => {
            // 需要设置this.viewer.scene.globe.depthTestAgainstTerrain = true
            // let cartesian = this.viewer.scene.pickPosition(clickEvent.position);
            let cartesian = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(clickEvent.position), this.viewer.scene);
            if (!cartesian) {
                return false;
            }
            // 存储第一个点
            if (positions.length === 0) {
                positions.push(cartesian)
                this.drawPoint(cartesian);
            }
            // 存储第二个点
            if (positions.length === 2) {
                this.drawPoint(cartesian);
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

        handler.setInputAction((moveEvent) => {
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
            }

        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        handler.setInputAction(() => {
            body.style.cursor = "default"

            this.measureCollection.remove(lineEntity);
            this.entityCollection.splice(this.entityCollection.indexOf(lineEntity), 1);

            handler.destroy()
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

    };

    /*
    * 测量贴地多边形面积
    * */
    measurePolygonToGround() {
        let positions = [];
        let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas)
        let linePosition = []
        let lineEntity = this.addLineToGround(linePosition);
        handler.setInputAction((clickEvent) => {
            // 需要设置this.viewer.scene.globe.depthTestAgainstTerrain = true
            // let cartesian = this.viewer.scene.pickPosition(clickEvent.position);
            let cartesian = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(clickEvent.position), this.viewer.scene);
            if (!cartesian) {
                return false;
            }
            positions.push(cartesian)
            this.drawPoint(cartesian);
            if (positions.length > 1) {
                this.addLineToGround(positions.slice(positions.length - 2, positions.length))
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.setInputAction((moveEvent) => {
            // let movePosition = this.viewer.scene.pickPosition(moveEvent.endPosition); // 鼠标移动的点
            if (positions.length > 0) {
                let movePosition = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(moveEvent.endPosition), this.viewer.scene);
                if (!movePosition) {
                    return false;
                }
                linePosition[0] = positions[positions.length - 1];
                linePosition[1] = movePosition;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        handler.setInputAction(() => {
            this.measureCollection.remove(lineEntity);
            const draw = (cartesian3Positions) => {
                let areaPromise = this.areaPolygonToGround(cartesian3Positions)
                Promise.resolve(areaPromise).then((area) => {
                    this.drawPolygon(cartesian3Positions)
                    if (area > 1000000) {
                        area = (area / 1000000).toFixed(2) + "平方公里";
                    } else {
                        area = area.toFixed(2) + "平方米";
                    }
                    let areaText = "面积：" + area;
                    this.addLabel(cartesian3Positions[0], areaText);
                })
            }
            draw(positions)
            this.addLineToGround([positions[positions.length - 1], positions[0]])
            handler.destroy()
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }

    drawPoint(position) {
        this.entityCollection.push(this.measureCollection.add(new Cesium.Entity({
            position: position, point: {
                color: Cesium.Color.fromCssColorString('#D75624'),
                pixelSize: 8,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            }
        })));
    }

    addLine(positions) {
        let dynamicPositions = new Cesium.CallbackProperty(() => {
            return positions;
        }, false);
        let lineEntity = this.measureCollection.add(new Cesium.Entity({
            name: '线', polyline: {
                positions: dynamicPositions,
                width: 2,
                arcType: Cesium.ArcType.NONE,
                material: Cesium.Color.fromCssColorString('#85AB77'), //获取或设置折线的表面外观
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
                positions: dynamicPositions,
                width: 2,
                arcType: Cesium.ArcType.RHUMB,
                material: Cesium.Color.fromCssColorString('#85AB77'), //获取或设置折线的表面外观
                clampToGround: true
            }
        }))
        this.entityCollection.push(lineEntity);
        return lineEntity;
    };

    drawPolygon(positions) {
        let dynamicPositions = new Cesium.CallbackProperty(() => {
            return new Cesium.PolygonHierarchy(positions);
        }, false);
        this.entityCollection.push(this.measureCollection.add(new Cesium.Entity({
            polygon: {
                hierarchy: dynamicPositions,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                material: Cesium.Color.fromCssColorString('#66DA9A').withAlpha(0.5), // classificationType: Cesium.ClassificationType.BOTH // 贴地表和贴模型,如果设置了，这不能使用挤出高度
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
        let length = Cesium.Cartesian3.distance(firstPoint, secondPoint);
        if (length > 1000) {
            length = (length / 1000).toFixed(2) + " 公里";
        } else {
            length = length.toFixed(2) + " 米";
        }
        return length;
    };


    /*
    * 贴线距离<br/>
    * 1.计算两点直线距离，每米一个内插点<br/>
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

    /*
    * 计算贴地多边形面积
    * @param position 多边形顶点Cartesian3数组
    * */
    async areaPolygonToGround(cartesian3Arr) {
        // 1.笛卡尔转换为WGS-84坐标组(单位radios) P.S.过程相当于投影到椭球面
        let cartographicArr = this.cartesian3ArrToCartographicArr(cartesian3Arr)
        // 2.WGS-84坐标组转换为TurfPolygon
        let turfPolygon = this.CartographicToTurfPolygon(cartographicArr)
        // 3.计算TurfPolygon的外接范围
        let turfBbox = bbox(turfPolygon)
        // 4.判断内插点数 100米/2点
        let interpolationNum = Math.ceil((turfBbox[2] - turfBbox[0]) / Math.PI * 180 * 110000 / 50)
        // 5.生成随机点
        let randomPt = randomPoint(interpolationNum, {bbox: turfBbox})
        // 6.求随机点与TurfPolygon交集得到插值点
        let interpolationPoint = pointsWithinPolygon(randomPt, turfPolygon)
        // 7.将TurfPolygon各顶点加入插值点(并去重)
        for (let i = 0; i < turfPolygon.geometry.coordinates[0].length - 1; i++) {
            interpolationPoint.features.push(point(turfPolygon.geometry.coordinates[0][i]))
        }
        // 8.生成TIN三角网
        let tinPolygon = tin(interpolationPoint)
        // 9.TurfTIN转换为WGS-84三角网，添加高程
        let tinCartographicArrArr = []
        for (let i = 0; i < tinPolygon.features.length; i++) {
            let promise = this.turfPolygonToCartographicArr(tinPolygon.features[i])
            await Promise.resolve(promise).then((tinCartographicArr) => {
                tinCartographicArrArr.push(tinCartographicArr)
            })
        }
        // 10.WGS-84转为笛卡尔三角网
        let tinCartesianArrArr = []
        tinCartographicArrArr.forEach((tinCartographicArr) => {
            let tinCartesianArr = []
            tinCartographicArr.forEach((cartographic) => {
                let tem = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height)
                tinCartesianArr.push(tem)
            })
            tinCartesianArrArr.push(tinCartesianArr)
        })
        // 11.计算每个三角形的面积
        let area = 0
        tinCartesianArrArr.forEach((tinCartesianArr) => {
            area += this.areaSpaceTriangle([tinCartesianArr[0].x, tinCartesianArr[0].y, tinCartesianArr[0].z], [tinCartesianArr[1].x, tinCartesianArr[1].y, tinCartesianArr[1].z], [tinCartesianArr[2].x, tinCartesianArr[2].y, tinCartesianArr[2].z])
        })
        // 12.返回结果
        return (area)
    }


    /*
    * 笛卡尔坐标数组转换为WGS-84坐标系数组
    * @param cartesian3Arr 笛卡尔坐标数组
    * */
    cartesian3ArrToCartographicArr(cartesian3Arr) {
        let cartographicArr = []
        cartesian3Arr.forEach((item) => {
            cartographicArr.push(Cesium.Cartographic.fromCartesian(item))
        })
        return cartographicArr
    }

    /*
    * WGS-84坐标系数组转换为turf多边形
    * */
    CartographicToTurfPolygon(cartographicArr) {
        let linearRings = [[]]
        cartographicArr.forEach((item) => {
            linearRings[0].push([item.longitude, item.latitude])
        })
        //首尾相连
        linearRings[0].push([cartographicArr[0].longitude, cartographicArr[0].latitude])
        return polygon(linearRings)
    }

    turfPolygonToCartographicArr(turfPolygon) {
        let cartographicArr = []
        turfPolygon.geometry.coordinates[0].forEach((item) => {
            cartographicArr.push(new Cesium.Cartographic(item[0], item[1]))
        })
        // 去除重复的终点
        cartographicArr.pop()
        const terrainProvider = Cesium.createWorldTerrain();
        return Cesium.sampleTerrain(terrainProvider, 12, cartographicArr);
    }

    /*
    * 给多边形加上
    * */
    areaSpaceTriangle(a, b, c) {
        let x1 = b[0] - a[0]
        let y1 = b[1] - a[1]
        let z1 = b[2] - a[2]
        let x2 = c[0] - a[0]
        let y2 = c[1] - a[1]
        let z2 = c[2] - a[2]
        let ABxAC = [y1 * z2 - y2 * z1, -x1 * z2 + x2 * z1, x1 * y2 - x2 * y1]
        return 1 / 2 * Math.sqrt(ABxAC[0] * ABxAC[0] + ABxAC[1] * ABxAC[1] + ABxAC[2] * ABxAC[2])
    }

}