import * as Cesium from "cesium/Cesium";

class Utils {
    static changeCursor(cursor) {
        const body = document.querySelector("body")
        body.style.cursor = cursor
    }

    /*
    * 笛卡尔坐标数组转换为WGS-84坐标系数组
    * @param cartesian3Arr 笛卡尔坐标数组
    * */
    static cartesian3ArrToCartographicArr(cartesian3Arr) {
        let cartographicArr = []
        cartesian3Arr.forEach((item) => {
            cartographicArr.push(Cesium.Cartographic.fromCartesian(item))
        })
        return cartographicArr
    }

}

export default Utils