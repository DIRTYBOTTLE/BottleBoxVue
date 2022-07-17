<template>
  <div id="cesiumContainer"></div>
  <div style="position: absolute;bottom: 0;left: 0;color: white">经度 {{ screenPoint.lon }} 纬度 {{ screenPoint.lat }} 高程
    {{ screenPoint.height }}
  </div>
  <el-tree :data="layer" @check-change="handleCheckChange" show-checkbox default-expand-all
           style="position: absolute;top: 90px;left: 0;"/>
<!--  <el-button @click="measureDistance" style="position: absolute;top: 10px;left: 130px;">欧氏距离</el-button>-->
<!--  <el-button @click="measurePolyLineToGround" style="position: absolute;top: 10px;left: 230px;">贴地距离</el-button>-->
<!--  <el-button @click="measurePolygonToGround" style="position: absolute;top: 10px;left: 330px;">贴地面积</el-button>-->
<!--  <el-button @click="measureProfile" style="position: absolute;top: 10px;left: 423px;">剖面测量</el-button>-->
<!--  <el-button @click="measurePoint" style="position: absolute;top: 10px;left: 523px;">点位测量</el-button>-->
<!--  <el-button @click="guideCar" style="position: absolute;top: 10px;left: 623px;">路线导航</el-button>-->
<!--  <el-button @click="clearDistance" style="position: absolute;top: 10px;left: 723px;">清除测量</el-button>-->
<!--  <el-button @click="drawPoint" style="position: absolute;top: 50px;left: 120px;width: 88px">绘制点</el-button>-->
<!--  <el-button @click="drawPolyline" style="position: absolute;top: 50px;left: 220px;width: 88px">绘制线</el-button>-->
<!--  <el-button @click="drawPolylineGround" style="position: absolute;top: 50px;left: 320px;width: 88px">绘制贴地线</el-button>-->
<!--  <el-button @click="drawPolygon" style="position: absolute;top: 50px;left: 440px;">绘制面</el-button>-->
<!--  <el-button @click="clearDraw" style="position: absolute;top: 50px;left: 530px;">清除绘制</el-button>-->
<!--  <el-button @click="drawerLayer=true" style="position: absolute;top: 50px;left: 628px;">要素图层</el-button>-->
<!--  <el-button @click="flyTo(104.537499,31.871504,1000)" style="position: absolute;top: 100px;left: 170px;">黄家坝-->
<!--  </el-button>-->
<!--  <el-button @click="flyTo(114.35590,30.529938)" style="position: absolute;top: 100px;left: 250px;">武汉大学</el-button>-->
<!--  <el-button @click="drawer=true" style="position: absolute;top: 150px;left: 180px;">分析工具</el-button>-->
  <el-button type="danger" style="position: absolute;top: 167px;right: 20px;">水源空间测量</el-button>
  <el-button @click="measureDistance" style="position: absolute;top: 200px;right: 20px;">水源欧氏距离</el-button>
  <el-button @click="measurePolyLineToGround" style="position: absolute;top: 233px;right: 20px;">水源贴地距离</el-button>
  <el-button @click="measurePolygonToGround" style="position: absolute;top: 266px;right: 20px;">水体贴地面积</el-button>
  <el-button @click="measureProfile" style="position: absolute;top: 299px;right: 20px;">地形剖面测量</el-button>
  <el-button @click="measurePoint" style="position: absolute;top: 332px;right: 20px;">水源点位测量</el-button>
  <el-button @click="guideCar" style="position: absolute;top: 365px;right: 20px;">水源路线导航</el-button>
  <el-button @click="clearDistance" style="position: absolute;top: 398px;right: 20px;">清除水源测量</el-button>

  <el-button type="danger" style="position: absolute;top: 167px;right: 150px;">水源空间绘制</el-button>
  <el-button @click="drawPoint" style="position: absolute;top: 200px;right: 150px;">绘制水源点位</el-button>
  <el-button @click="drawPolyline" style="position: absolute;top: 233px;right: 150px;">绘制水源线体</el-button>
  <el-button @click="drawPolylineGround" style="position: absolute;top: 266px;right: 150px;">绘制贴地水流</el-button>
  <el-button @click="drawPolygon" style="position: absolute;top: 299px;right: 150px;">绘制贴地水体</el-button>
  <el-button @click="clearDraw" style="position: absolute;top: 332px;right: 150px;">清除水源绘制</el-button>
  <el-button @click="drawerLayer=true" style="position: absolute;top: 365px;right: 150px;">水源要素图层</el-button>
  <el-button @click="flyTo(104.537499,31.871504,1000)" style="position: absolute;top: 483px;right: 20px;">黄家坝示范区
  </el-button>

  <el-button type="danger" style="position: absolute;top: 450px;right: 20px;">水源示范区域</el-button>
  <el-button @click="flyTo(114.35590,30.529938)" style="position: absolute;top: 516px;right: 20px;">武汉大学区域</el-button>
  <el-button @click="drawer=true" style="position: absolute;top: 398px;right: 150px;">水源分析工具</el-button>

  <el-autocomplete v-model.trim="poiForm.keyWord" placeholder="地图检索" clearable input-style="width:220px"
                   :fetch-suggestions="suggestQuery" @select="handleSelect" :trigger-on-focus="false"
                   value-key="name" :highlight-first-item="true"
                   style="position: absolute;top: 10px;left: 935px;">
    <template #default="{ item }">
      <div><b>{{ item.name }}</b></div>
      <div>{{ item.address }}</div>
      <div>{{ item.phone }}</div>
    </template>
  </el-autocomplete>
  <el-drawer v-model="drawer" :with-header="false">
    <div class="drawer-title">
      空间量算
    </div>
    <div class="drawer-item-container">
      <div class="drawer-item" @click="measureDistance();drawer=false">
        <img :src="require('../assets/直线距离栅格.png')" alt="网络错误">
        <p>欧式距离</p>
      </div>
      <div class="drawer-item" @click="measurePolyLineToGround();drawer=false">
        <img :src="require('../assets/耗费距离栅格.png')" alt="网络错误">
        <p>贴地距离</p>
      </div>
      <div class="drawer-item" @click="measurePolygonToGround();drawer=false">
        <img :src="require('../assets/贴地面积.png')" alt="网络错误">
        <p>贴地面积</p>
      </div>
      <div class="drawer-item" @click="clearDistance();drawer=false">
        <img :src="require('../assets/清除.png')" alt="网络错误">
        <p>清除测量</p>
      </div>
    </div>
  </el-drawer>
  <el-drawer v-model="drawerProfile" :with-header="false" direction="btt">
    <div id="echartsContainer" style="width:100vw;height: 50vh"></div>
  </el-drawer>
  <el-drawer v-model="drawerLayer" :with-header="false">
    <el-tree :data="layer" @check-change="handleCheckChange" show-checkbox default-expand-all
             style="position: absolute;top: 0;left: 0;"/>
  </el-drawer>
  <el-image
      style="width: 100px; height: 100px;position: absolute;top: 50px;right: 5px"
      :src="url"
      :preview-src-list="srcList"
      :initial-index="0"
      fit="cover"
  />
</template>

<script>
import {onMounted} from "vue";
import {B_Measure} from "@/utils/Cesium/Measure";
import {ref, nextTick} from "vue";
import * as echarts from 'echarts';
import {Search} from "@element-plus/icons-vue";
import {B_Cesium} from "@/utils/Cesium/BottleCesium";
import {ElNotification} from "element-plus";

export default {
  name: "Cesium",
  components: {Search},
  setup() {
    let b_Cesium
    const drawer = ref(false)
    const drawerProfile = ref(false)
    const drawerLayer = ref(false)
    const layer = [
      {
        label: '北川',
        children: [
          {
            label: '地下水源',
            category: 'water',
            name: 'underground',
            icon: require('../assets/地下水滴.png'),
            show: false
          },
          {
            label: '地表水源',
            category: 'water',
            name: 'surface',
            icon: require('../assets/地表水滴.png'),
            show: false
          },
          {
            label: '地质灾害',
            category: 'water',
            name: 'disaster',
            icon: require('../assets/cesium/地质灾害.png'),
            show: false
          },
          {
            label: '水文地质',
            category: 'water',
            name: 'shuiwen',
            show: false
          },
        ],
      },
      {
        label: '天地图数据',
        children: [
          {
            label: '铁路',
            url: "https://gisserver.tianditu.gov.cn/TDTService/wfs",
            name: 'LRRL',
            count: "1000",
            icon: require('../assets/地下水滴.png'),
            show: false
          },
          {
            label: '公路',
            url: "https://gisserver.tianditu.gov.cn/TDTService/wfs",
            name: 'LRDL',
            count: "1000",
            icon: require('../assets/地下水滴.png'),
            show: false
          },
          {
            label: '水系面',
            url: "https://gisserver.tianditu.gov.cn/TDTService/wfs",
            name: 'HYDA',
            count: "1000",
            icon: require('../assets/地下水滴.png'),
            show: false
          },
          {
            label: '水系线',
            url: "https://gisserver.tianditu.gov.cn/TDTService/wfs",
            name: 'HYDL',
            count: "1000",
            icon: require('../assets/地下水滴.png'),
            show: false
          },
          {
            label: '居民地及设施面',
            url: "https://gisserver.tianditu.gov.cn/TDTService/wfs",
            category: 'TDTService',
            name: 'RESA',
            bbox: "31,104,32,105",
            show: false
          },
          {
            label: '居民地及设施点',
            url: "https://gisserver.tianditu.gov.cn/TDTService/wfs",
            category: 'TDTService',
            name: 'RESP',
            count: "1000",
            icon: require('../assets/地下水滴.png'),
            show: false
          },
          {
            label: '美国人口',
            url: "/geoserver/topp/ows",
            category: "topp",
            name: "states",
            show: false
          }
        ]
      }
    ]

    onMounted(() => {
      b_Cesium = new B_Cesium('cesiumContainer')
      b_Cesium.measure.measureMovingPointTool(measureScreenPoint)
    })

    const handleCheckChange = (data) => {
      if (data.show === true) {
        b_Cesium.viewer.dataSources.remove(b_Cesium.viewer.dataSources.getByName(data.name)[0], true)
        data.show = false
      } else if (data.show === false) {
        b_Cesium.dataSource.loadGeoJSON(data)
        data.show = true
      }
    }

    const measureDistance = () => {
      b_Cesium.measure.measurePolyLine();
    }

    const measurePolyLineToGround = () => {
      b_Cesium.measure.measurePolyLineToGround();
    }

    const clearDistance = () => {
      b_Cesium.measure.clear();
    }

    const flyTo = (lon, lat, height) => {
      b_Cesium.camera.flyToFromDegree(lon, lat, height)
    }

    const measurePolygonToGround = () => {
      b_Cesium.measure.measurePolygonToGround()
    }

    const measureProfile = () => {
      const drawProfile = (profile) => {
        drawerProfile.value = true
        nextTick(() => {
          const chartDom = document.getElementById('echartsContainer');
          const myChart = echarts.init(chartDom);
          let option;

          option = {
            title: {
              text: '剖面图'
            },
            // grid: {
            //   left: '6%',
            //   right: '6%',
            //   bottom: '6%',
            //   // containLabel: true,
            // },
            toolbox: {
              feature: {
                saveAsImage: {}
              },
            },
            xAxis: {
              name: '距离',
              type: 'category',
              boundaryGap: false,
              data: profile.distances,
              axisPointer: {
                show: 'true',
                // type: 'cross',
                snap: 'true',
                label: {
                  precision: '3'
                },
              },
              // axisPointer: {
              //   label: {
              //     show: true,
              //     precision:2
              //   },
              // },
            },
            yAxis: {
              name: '海拔',
              type: 'value',
              min: 'dataMin',
              axisTick: {
                show: 'false'
              },
              axisLabel: {
                show: 'false'
              },
              axisPointer: {
                show: 'true',
                snap: 'true',
                type: 'shadow',
                label: {
                  // show: 'true',
                  precision: '2'
                },
              },
            },
            series: [
              {
                data: profile.heights,
                type: 'line',
                smooth: true,
                areaStyle: {}
              }
            ]
          };

          option && myChart.setOption(option);
        })

      }
      b_Cesium.measure.measureProfile(drawProfile)
    }

    const drawPoint = () => {
      b_Cesium.paint.paintPointTool()
    }

    const drawPolyline = () => {
      b_Cesium.paint.paintPolylineTool()
    }

    const drawPolylineGround = () => {
      b_Cesium.paint.paintPolylineGroundTool()
    }

    const drawPolygon = () => {
      b_Cesium.paint.paintPolygonTool()
    }

    const clearDraw = () => {
      b_Cesium.paint.clear()
    }

    const poiForm = ref({
      // 查询关键字
      keyWord: "",
      // 查询范围
      mapBound: "0,0,180,90",
      // 查询级别1-18
      level: 18,
      // 指定行政区域的9位国标码
      // specify: "",
      // 搜索类型 1普通搜索 7地名搜索
      queryType: 1,
      // 返回结果起始位
      start: 0,
      // 返回结果条数
      count: 20,
      // 数据分类（分类编码表）
      // dataTypes:"",
      // 返回poi结果级别 1基本poi 2 详细poi
      show: 2
    })
    const suggestQuery = (queryString, cb) => {
      B_Measure.poiSearch(poiForm.value).then((res) => {
        cb(res)
      })
    }
    const handleSelect = (item) => {
      const lon = parseFloat(item.lonlat.split(",")[0])
      const lat = parseFloat(item.lonlat.split(",")[1])
      b_Cesium.camera.flyToFromDegree(lon, lat)
      let message = ""
      message += (item.name ? "名称：" + item.name + "<br>" : "")
      message += (item.phone ? "电话：" + item.phone + "<br>" : "")
      message += (item.address ? "地址：" + item.address + "<br>" : "")
      message += (item.lonlat ? "经度：" + item.lonlat.split(",")[0] + "<br>" : "")
      message += (item.lonlat ? "纬度：" + item.lonlat.split(",")[1] + "<br>" : "")
      message += (item.poiType ? (item.poiType === "101" ? "类型：POI数据<br>" : "类型：公交站点<br>") : "")
      message += (item.eaddress ? "英文地址：" + item.eaddress + "<br>" : "")
      message += (item.ename ? "英文名称：" + item.ename + "<br>" : "")
      message += (item.hotPointID ? "热点id：" + item.hotPointID + "<br>" : "")
      message += (item.province ? "省直属：" + item.province + "<br>" : "")
      message += (item.provinceCode ? "省行政区编码：" + item.provinceCode + "<br>" : "")
      message += (item.city ? "市直属：" + item.city + "<br>" : "")
      message += (item.cityCode ? "市行政区编码：" + item.cityCode + "<br>" : "")
      message += (item.county ? "区县直属：" + item.county + "<br>" : "")
      message += (item.countyCode ? "区县行政区编码：" + item.countyCode + "<br>" : "")
      message += (item.source ? "数据来源：" + item.source + "<br>" : "")
      message += (item.typeCode ? "分类编码：" + item.typeCode + "<br>" : "")
      message += (item.typeName ? "分类名称：" + item.typeName + "<br>" : "")
      // message += (item.bound ? "范围：" + item.bound + "<br>" : "")
      message += (item.adminCode ? "行政区编码：" + item.adminCode + "<br>" : "")
      message += (item.level ? "显示级别：" + item.level + "<br>" : "")
      message += (item.count ? "要素数量：" + item.count + "<br>" : "")




      ElNotification({
        title: '地点', message: message, type: 'info', position: 'top-left', duration: 0, dangerouslyUseHTMLString: true,
      })
    }

    const measurePoint = () => {
      b_Cesium.measure.measurePointTool()
    }
    const screenPoint = ref({})
    const measureScreenPoint = (cartesian) => {
      screenPoint.value.lon = (cartesian.longitude / Math.PI * 180).toFixed(2)
      screenPoint.value.lat = (cartesian.latitude / Math.PI * 180).toFixed(2)
      screenPoint.value.height = (cartesian.height).toFixed(0)
    }


    const url = require("../assets/无人机1.jpg")
    const srcList = [
      require("../assets/无人机1.jpg"),
      require("../assets/无人机2.jpg")
    ]

    const guideCar = () => {
      b_Cesium.measure.guideCarTool()
    }

    return {
      layer,
      handleCheckChange,
      measureDistance,
      measurePolyLineToGround,
      clearDistance,
      flyTo,
      measurePolygonToGround,
      measureProfile,
      drawPolygon,
      poiForm,
      drawer,
      drawerProfile,
      drawerLayer,
      Search,
      suggestQuery,
      handleSelect,
      drawPoint,
      drawPolyline,
      drawPolylineGround,
      clearDraw,
      url,
      srcList,
      screenPoint,
      measurePoint,
      guideCar
    }
  },

}
</script>

<style scoped>
#cesiumContainer {
  height: 100vh;
}

.el-tree {
  background-color: grey;
  color: white;
}

.drawer-title {
  line-height: 150%;
  font-size: xx-large;
  font-weight: bold;
  background-image: linear-gradient(45deg, deeppink, gold);
  -webkit-background-clip: text;
  color: transparent;
}

.drawer-item-container {
  display: flex;
  flex-wrap: wrap;
}

.drawer-item {
  margin: 5px 15px;
}

.drawer-item:hover {
  cursor: pointer;
}

.drawer-item img {
  width: 100px;
}

.drawer-item p {
  text-align: center;
}

/*#el-drawer.btt.open {*/
/*  height: 50%;*/
/*  background-color: red;*/
/*}*/
/*.el-drawer.btt, .el-drawer.ttb {*/
/*  background-color: red;*/
/*}*/

/*.el-drawer__body {*/
/*  !*height: 50%;*!*/
/*  !*background-color: red;*!*/
/*}*/

</style>