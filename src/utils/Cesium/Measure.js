import * as Cesium from "cesium/Cesium";
import {randomPoint} from "@turf/random"
import {point, polygon} from "@turf/helpers";
import tin from "@turf/tin"
import bbox from "@turf/bbox";
import pointsWithinPolygon from "@turf/points-within-polygon";
import {ElNotification} from 'element-plus'
import axios from "axios";
import {B_Paint} from "@/utils/Cesium/Paint";
import Utils from "@/utils/Cesium/Utils";


export class B_Measure {
    constructor(viewer) {
        this.viewer = viewer
        this.entityCollection = []
        this.measureDataSource = new Cesium.CustomDataSource('measureData');
        this.measureCollection = this.measureDataSource.entities;
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas)
        this.positions = []
        viewer.dataSources.add(this.measureDataSource);
    }

    clear(callback) {
        Utils.changeCursor("default")
        this.measureCollection.removeAll();
        this.entityCollection = [];
        // this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
        // this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        // this.viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        if (callback) {
            callback()
        }
    }

    clearHandler() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    }

    measureMovingPointTool(callback) {
        let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas)
        handler.setInputAction((event) => {
            if (event) {
                let cartesian = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(event.endPosition), this.viewer.scene);
                if (!cartesian) {
                    return
                }
                callback(Cesium.Cartographic.fromCartesian(cartesian))
            }

        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    }

    measurePointTool() {
        ElNotification({
            title: '????????????', message: "???????????????????????????", type: 'info', position: 'top-left',
        })
        this._changeCursor(true)
        let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas)
        handler.setInputAction((clickEvent) => {
            let cartesian = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(clickEvent.position), this.viewer.scene);
            if (!cartesian) {
                return false;
            }
            this.measureCollection.add(B_Paint.paintPoint(cartesian, require('../../assets/cesium/???.png')))
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.setInputAction(() => {
            this._changeCursor(false)
            handler.destroy()
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }

    measurePolyLine(callback) {
        const body = document.querySelector("body")
        body.style.cursor = "crosshair"

        let positions = [];
        let labelEntity = null; // ????????????
        let lineEntity = null; //?????????

        let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas)

        // ????????????????????????
        handler.setInputAction((clickEvent) => {
            // ????????????this.viewer.scene.globe.depthTestAgainstTerrain = true
            // let cartesian = this.viewer.scene.pickPosition(clickEvent.position);
            let cartesian = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(clickEvent.position), this.viewer.scene);
            if (!cartesian) {
                return false;
            }
            // ??????????????????
            if (positions.length === 0) {
                positions.push(cartesian)
                this.drawPoint(cartesian);
            }
            // ??????????????????
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
            // let movePosition = this.viewer.scene.pickPosition(moveEvent.endPosition); // ??????????????????
            let movePosition = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(moveEvent.endPosition), this.viewer.scene);
            if (!movePosition) {
                return false;
            }
            if (positions.length === 1) {
                positions.push(movePosition);
                // ?????????
                lineEntity = this.addLine(positions);
            }
            if (positions.length === 2) {
                positions.pop();
                positions.push(movePosition);

                // ????????????label
                if (labelEntity) {
                    this.measureCollection.remove(labelEntity);
                    this.entityCollection.splice(this.entityCollection.indexOf(labelEntity), 1);
                }

                // ????????????
                let centerPoint = Cesium.Cartesian3.midpoint(positions[0], positions[1], new Cesium.Cartesian3());
                // ????????????
                let lengthText = "?????????" + this.getLengthText(positions[0], positions[1]);
                // ????????????
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
        let labelEntity = null; // ????????????
        let lineEntity = null; //?????????

        let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas)

        // ????????????????????????
        handler.setInputAction((clickEvent) => {
            let cartesian = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(clickEvent.position), this.viewer.scene);
            if (!cartesian) {
                return false;
            }
            // ??????????????????
            if (positions.length === 0) {
                positions.push(cartesian)
                this.drawPoint(cartesian);
            }
            // ??????????????????
            if (positions.length === 2) {
                this.drawPoint(cartesian);
                this.drawLineToGround([positions[0], positions[1]]);

                Promise.resolve(this.distanceToGround(positions[0], positions[1])).then((result) => {
                    ElNotification({
                        title: '????????????', message: "????????????", type: 'success', position: 'top-left',
                    })
                    let centerPoint = result[3]
                    let length = result[0]
                    // ????????????
                    if (length > 1000) {
                        length = (length / 1000).toFixed(2) + " ??????";
                    } else {
                        length = length.toFixed(2) + " ???";
                    }
                    let lengthText = "?????????" + length;
                    // ????????????
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
            // let movePosition = this.viewer.scene.pickPosition(moveEvent.endPosition); // ??????????????????
            let movePosition = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(moveEvent.endPosition), this.viewer.scene);
            if (!movePosition) {
                return false;
            }
            if (positions.length === 1) {
                positions.push(movePosition);
                // ?????????
                lineEntity = this.drawLineToGround(positions);
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
    * ???????????????????????????<br/>
    * ??????????????????????????????
    * */
    measurePolygonToGround() {
        const body = document.querySelector("body")
        body.style.cursor = "crosshair"
        let positions = [];
        let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas)
        let linePosition = []
        let lineEntity = this.drawLineToGround(linePosition);
        handler.setInputAction((clickEvent) => {
            // ????????????this.viewer.scene.globe.depthTestAgainstTerrain = true
            // let cartesian = this.viewer.scene.pickPosition(clickEvent.position);
            let cartesian = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(clickEvent.position), this.viewer.scene);
            if (!cartesian) {
                return false;
            }
            positions.push(cartesian)
            this.drawPoint(cartesian);
            if (positions.length > 1) {
                this.drawLineToGround(positions.slice(positions.length - 2, positions.length))
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.setInputAction((moveEvent) => {
            // let movePosition = this.viewer.scene.pickPosition(moveEvent.endPosition); // ??????????????????
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
            body.style.cursor = "default"
            ElNotification({
                title: '????????????', message: "????????????", type: 'info', position: 'top-left',
            })
            this.measureCollection.remove(lineEntity);
            const draw = (cartesian3Positions) => {
                let areaPromise = this.areaPolygonToGround(cartesian3Positions)
                Promise.resolve(areaPromise).then((area) => {
                    ElNotification({
                        title: '????????????', message: "????????????", type: 'success', position: 'top-left',
                    })
                    this._drawPolygon(cartesian3Positions)
                    if (area > 1000000) {
                        area = (area / 1000000).toFixed(2) + "????????????";
                    } else {
                        area = area.toFixed(2) + "?????????";
                    }
                    let areaText = "?????????" + area;
                    this.addLabel(cartesian3Positions[0], areaText);
                })
            }
            draw(positions)
            this.drawLineToGround([positions[positions.length - 1], positions[0]])
            handler.destroy()
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }

    /*
    * ????????????<br/>
    * ??????????????????????????????????????????????????????<br/>
    * ????????????2??????????????????
    * */
    measureProfile(callback) {
        const body = document.querySelector("body")
        body.style.cursor = "crosshair"
        const positionCartesian3Arr = []
        const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas)
        // ?????????????????????????????????????????????????????????
        handler.setInputAction((event) => {
            if (positionCartesian3Arr[0]) {
                ElNotification({
                    title: '????????????', message: "????????????????????????", type: 'warning', position: 'top-left',
                })
                return
            }
            positionCartesian3Arr[0] = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(event.position), this.viewer.scene);
            this.drawPoint(positionCartesian3Arr[0])
            this.drawLineToGround(positionCartesian3Arr)
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
        // ??????????????????????????????????????????
        handler.setInputAction((event) => {
            if (positionCartesian3Arr[0]) {
                positionCartesian3Arr[1] = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(event.endPosition), this.viewer.scene);
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        // ??????
        handler.setInputAction((event) => {
            handler.destroy()
            body.style.cursor = "default"
            positionCartesian3Arr[1] = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(event.position), this.viewer.scene);
            this.drawPoint(positionCartesian3Arr[1])
            // ??????????????????
            let distance = Cesium.Cartesian3.distance(positionCartesian3Arr[0], positionCartesian3Arr[1]);
            let interpolationNum = Math.floor(distance / 10);
            // ???????????????????????????????????????
            const positionCartographicArr = [];
            positionCartographicArr.push(Cesium.Cartographic.fromCartesian(positionCartesian3Arr[0]));
            const newPositionCartesian3Arr = []
            newPositionCartesian3Arr.push(positionCartesian3Arr[0])
            for (let i = 1; i < interpolationNum; i++) {
                let lerp = Cesium.Cartesian3.lerp(positionCartesian3Arr[0], positionCartesian3Arr[1], i / interpolationNum, new Cesium.Cartesian3());
                positionCartographicArr.push(Cesium.Cartographic.fromCartesian(lerp));
                newPositionCartesian3Arr.push(lerp)
            }
            positionCartographicArr.push(Cesium.Cartographic.fromCartesian(positionCartesian3Arr[1]));
            newPositionCartesian3Arr.push(positionCartesian3Arr[1])
            // ?????????????????????
            const terrainProvider = Cesium.createWorldTerrain();
            let promise = Cesium.sampleTerrain(terrainProvider, 12, positionCartographicArr);
            Promise.resolve(promise).then((positionCartographicArr) => {
                const distances = []
                const heights = []
                for (let i = 0; i < newPositionCartesian3Arr.length; i++) {
                    distances.push(Cesium.Cartesian3.distance(newPositionCartesian3Arr[0], newPositionCartesian3Arr[i]).toFixed(2))
                    heights.push(positionCartographicArr[i].height)
                }
                callback({
                    distances: distances, heights: heights
                })
            })
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }

    guideCarTool() {
        Utils.changeCursor("crosshair")
        this.handler.setInputAction((event) => {
            let cartesian = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(event.position), this.viewer.scene)
            if (!cartesian) {
                return false;
            }
            this.measureCollection.add(B_Paint.paintPoint(cartesian, require("../../assets/cesium/???.png")))
            this.positions.push(cartesian)
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
        this.handler.setInputAction(() => {
            Utils.changeCursor("default")
            this.clearHandler()
            this.positions = Utils.cartesian3ArrToCartographicArr(this.positions)
            const length = this.positions.length
            const guidePoi = {
                orig: (this.positions[0].longitude / Math.PI * 180).toString() + "," + (this.positions[0].latitude / Math.PI * 180).toString(),
                dest: (this.positions[length - 1].longitude / Math.PI * 180).toString() + "," + (this.positions[length - 1].latitude / Math.PI * 180).toString(),
                style: "0"
            }
            if (length > 2) {
                let mid = ""
                for (let i = 1; i < length - 1; i++) {
                    mid = mid + (this.positions[i].longitude / Math.PI * 180).toString() + "," + (this.positions[i].latitude / Math.PI * 180).toString()
                }
                guidePoi.mid = mid
            }
            B_Measure.guideCar(guidePoi).then((result) => {
                this.positions = []
                // console.log(result)
                result.routelatlon.forEach((item) => {
                    let lon = parseFloat(item.split(",")[0])
                    let lat = parseFloat(item.split(",")[1])
                    let cartesian = Cesium.Cartesian3.fromDegrees(lon, lat)
                    this.positions.push(cartesian)
                })
                this.measureCollection.add(B_Paint.paintPolylineGround(this.positions))
                result.routes.forEach((item) => {
                    let cartesian = Cesium.Cartesian3.fromDegrees(parseFloat(item.lon), parseFloat(item.lat))
                    this.measureCollection.add(B_Paint.paintPoint(cartesian, null, {
                        ????????????: item.strguide,
                        ????????????: item.streetName,
                        ?????????????????????: item.nextStreetName,
                        ????????????: item.tollStatus,
                        ????????????: parseFloat(result.distance).toFixed(2) + "??????",
                        ????????????: (result.duration / 60).toFixed(2) + "??????",
                        ????????????: item.signage
                    }))
                })
                this.positions = []
            })
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }

    static poiSearch(poiForm) {
        return axios.get("https://api.tianditu.gov.cn/v2/search?postStr=" + JSON.stringify(poiForm) + "&type=query&tk=" + tiandituTK).then((res) => {
            if (res.data.resultType === 1) {
                return res.data.pois
            }
            if (res.data.resultType === 2) {
                res.data.statistics.allAdmins.forEach((item) => {
                    item.name = item.adminName
                })
                return res.data.statistics.allAdmins
            }
            if (res.data.resultType === 3) {
                return [res.data.area]
            }
        })
    }

    static guideCar(guidePoi) {
        return axios.get("https://api.tianditu.gov.cn/drive?postStr=" + JSON.stringify(guidePoi) + "&type=search&tk=" + tiandituTK).then((res) => {
            const domParser = new DOMParser();
            const xml = domParser.parseFromString(res.data, 'text/xml')
            const result = {routes: []}
            // console.log(xml)

            const routes = xml.getElementsByTagName('routes')[0]
            const count = routes.getAttribute("count")
            for (let i = 0; i < count; i++) {
                let item = routes.getElementsByTagName("item")[i]
                result.routes.push({})
                result.routes[i].strguide = item.getElementsByTagName("strguide")[0].innerHTML
                result.routes[i].signage = item.getElementsByTagName("signage")[0].innerHTML
                result.routes[i].streetName = item.getElementsByTagName("streetName")[0].innerHTML
                result.routes[i].nextStreetName = item.getElementsByTagName("nextStreetName")[0].innerHTML
                result.routes[i].tollStatus = item.getElementsByTagName("tollStatus")[0].innerHTML
                result.routes[i].tollStatus = (result.routes[i].tollStatus === "0") ? "????????????" : "????????????"
                const turnlatlon = item.getElementsByTagName("turnlatlon")[0].innerHTML
                const turnlatlonSplit = turnlatlon.split(",")
                result.routes[i].lon = turnlatlonSplit[0]
                result.routes[i].lat = turnlatlonSplit[1]
            }

            // ??????????????????
            const distance = xml.getElementsByTagName("distance")[0].innerHTML
            result.distance = distance

            // ????????????????????????
            const duration = xml.getElementsByTagName("duration")[0].innerHTML
            result.duration = duration

            // ???????????????
            const routelatlon = xml.getElementsByTagName('routelatlon')[0].innerHTML
            result.routelatlon = routelatlon.split(";")
            result.routelatlon.pop()

            return result
        })
    }

    drawPolygon() {
        const body = document.querySelector("body")
        body.style.cursor = "crosshair"
        let positions = [];
        let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas)
        let linePosition = []
        let lineEntity = this.drawLineToGround(linePosition);
        handler.setInputAction((clickEvent) => {
            // ????????????this.viewer.scene.globe.depthTestAgainstTerrain = true
            // let cartesian = this.viewer.scene.pickPosition(clickEvent.position);
            let cartesian = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(clickEvent.position), this.viewer.scene);
            if (!cartesian) {
                return false;
            }
            positions.push(cartesian)
            this.drawPoint(cartesian);
            if (positions.length > 1) {
                this.drawLineToGround(positions.slice(positions.length - 2, positions.length))
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        handler.setInputAction((moveEvent) => {
            // let movePosition = this.viewer.scene.pickPosition(moveEvent.endPosition); // ??????????????????
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
            body.style.cursor = "default"
            ElNotification({
                title: '????????????', message: "????????????", type: 'info', position: 'top-left',
            })
            this.measureCollection.remove(lineEntity);
            // const draw = (cartesian3Positions) => {
            //     let areaPromise = this.areaPolygonToGround(cartesian3Positions)
            //     Promise.resolve(areaPromise).then((area) => {
            //         ElNotification({
            //             title: '????????????', message: "????????????", type: 'success', position: 'top-left',
            //         })
            //         this._drawPolygon(cartesian3Positions)
            //         if (area > 1000000) {
            //             area = (area / 1000000).toFixed(2) + "????????????";
            //         } else {
            //             area = area.toFixed(2) + "?????????";
            //         }
            //         let areaText = "?????????" + area;
            //         this.addLabel(cartesian3Positions[0], areaText);
            //     })
            // }
            // draw(positions)
            this.drawLineToGround([positions[positions.length - 1], positions[0]])
            this._drawPolygon(positions)
            handler.destroy()
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }

    /*
    * @param cartesian3 Cartesian3
    * */
    drawPoint(cartesian3) {
        this.entityCollection.push(this.measureCollection.add(new Cesium.Entity({
            position: cartesian3, point: {
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
            name: '???', polyline: {
                positions: dynamicPositions,
                width: 2,
                arcType: Cesium.ArcType.NONE,
                material: Cesium.Color.fromCssColorString('#85AB77'), //????????????????????????????????????
            }
        }))
        this.entityCollection.push(lineEntity);
        return lineEntity;
    };

    /*
    * @param cartesian3Arr Cartesian3??????
    * */
    drawLineToGround(cartesian3Arr) {
        let dynamicPositions = new Cesium.CallbackProperty(() => {
            return cartesian3Arr;
        }, false);
        let lineEntity = this.measureCollection.add(new Cesium.Entity({
            name: '???', polyline: {
                positions: dynamicPositions,
                width: 2,
                arcType: Cesium.ArcType.RHUMB,
                material: Cesium.Color.fromCssColorString('#85AB77'), //????????????????????????????????????
                clampToGround: true
            }
        }))
        this.entityCollection.push(lineEntity);
        return lineEntity;
    };

    _drawPolygon(positions) {
        let dynamicPositions = new Cesium.CallbackProperty(() => {
            return new Cesium.PolygonHierarchy(positions);
        }, false);
        this.entityCollection.push(this.measureCollection.add(new Cesium.Entity({
            polygon: {
                hierarchy: dynamicPositions,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                material: Cesium.Color.fromCssColorString('#66DA9A').withAlpha(0.5), // classificationType: Cesium.ClassificationType.BOTH // ?????????????????????,?????????????????????????????????????????????
            }
        })));
    };

    addLabel(centerPoint, text) {
        return this.measureCollection.add(new Cesium.Entity({
            position: centerPoint, label: {
                text: text, font: '14px sans-serif', style: Cesium.LabelStyle.FILL_AND_OUTLINE, //FILL  FILL_AND_OUTLINE OUTLINE
                fillColor: Cesium.Color.YELLOW, showBackground: true, //????????????????????????????????????
                backgroundColor: new Cesium.Color(0.165, 0.165, 0.165, 0.8), // ????????????
                backgroundPadding: new Cesium.Cartesian2(6, 6), //??????????????????????????????????????????????????????padding
                pixelOffset: new Cesium.Cartesian2(0, -25), disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        }));
    };

    getLengthText(firstPoint, secondPoint) {
        // ????????????
        let length = Cesium.Cartesian3.distance(firstPoint, secondPoint);
        if (length > 1000) {
            length = (length / 1000).toFixed(2) + " ??????";
        } else {
            length = length.toFixed(2) + " ???";
        }
        return length;
    };


    /*
    * ????????????
    * @param left ?????? right ??????
    * */
    async distanceToGround(left, right) {
        let linearDistance = Cesium.Cartesian3.distance(left, right);
        let count = Math.floor(linearDistance);

        // ???????????????????????????
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
            let surfaceDistance = 0;
            for (let i = 0; i < updatedPositions.length; i++) {
                if (i === updatedPositions.length - 1) continue;
                surfaceDistance += Cesium.Cartesian3.distance(Cesium.Cartesian3.fromRadians(updatedPositions[i].longitude, updatedPositions[i].latitude, updatedPositions[i].height), Cesium.Cartesian3.fromRadians(updatedPositions[i + 1].longitude, updatedPositions[i + 1].latitude, updatedPositions[i + 1].height));
            }
            return [surfaceDistance, left, right, Cesium.Cartesian3.fromRadians(updatedPositions[Math.floor(updatedPositions.length / 2)].longitude, updatedPositions[Math.floor(updatedPositions.length / 2)].latitude, updatedPositions[Math.floor(updatedPositions.length / 2)].height)];
        });
    }

    /*
    * ???????????????????????????
    * @param position ???????????????Cartesian3??????
    * */
    async areaPolygonToGround(cartesian3Arr) {
        // 1.??????????????????WGS-84?????????(??????radios) P.S.?????????????????????????????????
        let cartographicArr = this.cartesian3ArrToCartographicArr(cartesian3Arr)
        // 2.WGS-84??????????????????TurfPolygon
        let turfPolygon = this.CartographicToTurfPolygon(cartographicArr)
        // 3.??????TurfPolygon???????????????
        let turfBbox = bbox(turfPolygon)
        // 4.?????????????????? 100???/2???
        let interpolationNum = Math.ceil((turfBbox[2] - turfBbox[0]) / Math.PI * 180 * 110000 / 50)
        // 5.???????????????
        let randomPt = randomPoint(interpolationNum, {bbox: turfBbox})
        // 6.???????????????TurfPolygon?????????????????????
        let interpolationPoint = pointsWithinPolygon(randomPt, turfPolygon)
        // 7.???TurfPolygon????????????????????????(?????????)
        for (let i = 0; i < turfPolygon.geometry.coordinates[0].length - 1; i++) {
            interpolationPoint.features.push(point(turfPolygon.geometry.coordinates[0][i]))
        }
        // 8.??????TIN?????????
        let tinPolygon = tin(interpolationPoint)
        // 9.TurfTIN?????????WGS-84????????????????????????
        let tinCartographicArrArr = []
        for (let i = 0; i < tinPolygon.features.length; i++) {
            let promise = this.turfPolygonToCartographicArr(tinPolygon.features[i])
            await Promise.resolve(promise).then((tinCartographicArr) => {
                tinCartographicArrArr.push(tinCartographicArr)
            })
        }
        // 10.WGS-84????????????????????????
        let tinCartesianArrArr = []
        tinCartographicArrArr.forEach((tinCartographicArr) => {
            let tinCartesianArr = []
            tinCartographicArr.forEach((cartographic) => {
                let tem = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height)
                tinCartesianArr.push(tem)
            })
            tinCartesianArrArr.push(tinCartesianArr)
        })
        // 11.??????????????????????????????
        let area = 0
        tinCartesianArrArr.forEach((tinCartesianArr) => {
            area += this.areaSpaceTriangle([tinCartesianArr[0].x, tinCartesianArr[0].y, tinCartesianArr[0].z], [tinCartesianArr[1].x, tinCartesianArr[1].y, tinCartesianArr[1].z], [tinCartesianArr[2].x, tinCartesianArr[2].y, tinCartesianArr[2].z])
        })
        // 12.????????????
        return (area)
    }

    /*
    * ??????????????????????????????WGS-84???????????????
    * @param cartesian3Arr ?????????????????????
    * */
    cartesian3ArrToCartographicArr(cartesian3Arr) {
        let cartographicArr = []
        cartesian3Arr.forEach((item) => {
            cartographicArr.push(Cesium.Cartographic.fromCartesian(item))
        })
        return cartographicArr
    }

    /*
    * WGS-84????????????????????????turf?????????
    * */
    CartographicToTurfPolygon(cartographicArr) {
        let linearRings = [[]]
        cartographicArr.forEach((item) => {
            linearRings[0].push([item.longitude, item.latitude])
        })
        //????????????
        linearRings[0].push([cartographicArr[0].longitude, cartographicArr[0].latitude])
        return polygon(linearRings)
    }

    turfPolygonToCartographicArr(turfPolygon) {
        let cartographicArr = []
        turfPolygon.geometry.coordinates[0].forEach((item) => {
            cartographicArr.push(new Cesium.Cartographic(item[0], item[1]))
        })
        // ?????????????????????
        cartographicArr.pop()
        const terrainProvider = Cesium.createWorldTerrain();
        return Cesium.sampleTerrain(terrainProvider, 12, cartographicArr);
    }

    /*
    * ???????????????????????????
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

    _changeCursor(changeBool) {
        const body = document.querySelector("body")
        if (changeBool) {
            body.style.cursor = "crosshair"
        } else {
            body.style.cursor = "default"
        }
    }
}