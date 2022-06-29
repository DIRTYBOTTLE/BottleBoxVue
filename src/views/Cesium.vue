<template>
  <div id="cesiumContainer"></div>
  <div style="position: absolute;bottom: 0;left: 0;color: white">经度 {{ screenPoint.lon }} 纬度 {{ screenPoint.lat }} 高程
    {{ screenPoint.height }}
  </div>
  <el-tree :data="layer" @check-change="handleCheckChange" show-checkbox default-expand-all
           style="position: absolute;top: 90px;left: 0;"/>
  <el-button @click="measureDistance" style="position: absolute;top: 10px;left: 130px;">欧氏距离</el-button>
  <el-button @click="measurePolyLineToGround" style="position: absolute;top: 10px;left: 220px;">贴地距离</el-button>
  <el-button @click="measurePolygonToGround" style="position: absolute;top: 10px;left: 323px;">贴地面积</el-button>
  <el-button @click="measureProfile" style="position: absolute;top: 10px;left: 423px;">剖面测量</el-button>
  <el-button @click="measurePoint" style="position: absolute;top: 10px;left: 523px;">点位测量</el-button>
  <el-button @click="clearDistance" style="position: absolute;top: 10px;left: 623px;">清除测量</el-button>
  <el-button @click="drawer=true" style="position: absolute;top: 10px;left: 723px;">分析工具</el-button>
  <el-button @click="drawerLayer=true" style="position: absolute;top: 10px;left: 823px;">要素图层</el-button>
  <el-button @click="drawPoint" style="position: absolute;top: 50px;left: 120px;">绘制点</el-button>
  <el-button @click="drawPolyline" style="position: absolute;top: 50px;left: 220px;">绘制线</el-button>
  <el-button @click="drawPolylineGround" style="position: absolute;top: 50px;left: 320px;">绘制贴地线</el-button>
  <el-button @click="drawPolygon" style="position: absolute;top: 50px;left: 440px;">绘制面</el-button>
  <el-button @click="clearDraw" style="position: absolute;top: 50px;left: 530px;">清除绘制</el-button>
  <el-button @click="flyTo(104.537499,31.871504,1000)" style="position: absolute;top: 100px;left: 170px;">黄家坝
  </el-button>
  <el-button @click="flyTo(114.35590,30.529938)" style="position: absolute;top: 100px;left: 250px;">武汉大学</el-button>
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

    const poiForm = ref({})
    const suggestQuery = (queryString, cb) => {
      B_Measure.poiSearch(poiForm.value).then((res) => {
        cb(res)
      })
    }
    const handleSelect = (item) => {
      const lon = parseFloat(item.lonlat.split(",")[0])
      const lat = parseFloat(item.lonlat.split(",")[1])
      b_Cesium.camera.flyToFromDegree(lon, lat)
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
      measurePoint
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