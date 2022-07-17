<template>
  <!--  nav定义导航链接的部分-->
  <!--  <nav>-->
  <!--    <router-link to="/login">登陆</router-link>-->
  <!--  </nav>-->
  <router-view/>
<!--  <el-button @click="drawer=!drawer" style="position: absolute;top: 0;left: 0">-->
<!--    <el-icon>-->
<!--      <Menu/>-->
<!--    </el-icon>-->
<!--  </el-button>-->
<!--  <el-drawer v-model="drawer" :with-header="false" direction="ltr">-->
<!--    <el-menu class="el-menu-vertical-demo" :router="true" @select="drawer=false">-->
<!--      <el-menu-item index="home">-->
<!--        <el-icon>-->
<!--          <EditPen/>-->
<!--        </el-icon>-->
<!--        <span>个人博客</span>-->
<!--      </el-menu-item>-->
<!--      <el-menu-item index="cesium">-->
<!--        <el-icon>-->
<!--          <LocationInformation/>-->
<!--        </el-icon>-->
<!--        <span>三维地图</span>-->
<!--      </el-menu-item>-->
<!--      <el-menu-item index="file">-->
<!--        <el-icon>-->
<!--          <MostlyCloudy/>-->
<!--        </el-icon>-->
<!--        <span>Bottle云</span>-->
<!--      </el-menu-item>-->
<!--      <el-menu-item index="gamestore">-->
<!--        <el-icon>-->
<!--          <Coordinate/>-->
<!--        </el-icon>-->
<!--        <span>游戏尝试</span>-->
<!--      </el-menu-item>-->
<!--    </el-menu>-->
<!--    &lt;!&ndash;    <div class="drawer-title">&ndash;&gt;-->
<!--    &lt;!&ndash;      空间量算&ndash;&gt;-->
<!--    &lt;!&ndash;    </div>&ndash;&gt;-->
<!--    &lt;!&ndash;    <div class="drawer-item-container">&ndash;&gt;-->
<!--    &lt;!&ndash;      <div class="drawer-item" @click="measureDistance();drawer=false">&ndash;&gt;-->
<!--    &lt;!&ndash;        <img :src="require('../assets/直线距离栅格.png')" alt="网络错误">&ndash;&gt;-->
<!--    &lt;!&ndash;        <p>欧式距离</p>&ndash;&gt;-->
<!--    &lt;!&ndash;      </div>&ndash;&gt;-->
<!--    &lt;!&ndash;      <div class="drawer-item" @click="measurePolyLineToGround();drawer=false">&ndash;&gt;-->
<!--    &lt;!&ndash;        <img :src="require('../assets/耗费距离栅格.png')" alt="网络错误">&ndash;&gt;-->
<!--    &lt;!&ndash;        <p>贴地距离</p>&ndash;&gt;-->
<!--    &lt;!&ndash;      </div>&ndash;&gt;-->
<!--    &lt;!&ndash;      <div class="drawer-item" @click="measurePolygonToGround();drawer=false">&ndash;&gt;-->
<!--    &lt;!&ndash;        <img :src="require('../assets/贴地面积.png')" alt="网络错误">&ndash;&gt;-->
<!--    &lt;!&ndash;        <p>贴地面积</p>&ndash;&gt;-->
<!--    &lt;!&ndash;      </div>&ndash;&gt;-->
<!--    &lt;!&ndash;      <div class="drawer-item" @click="clearDistance();drawer=false">&ndash;&gt;-->
<!--    &lt;!&ndash;        <img :src="require('../assets/清除.png')" alt="网络错误">&ndash;&gt;-->
<!--    &lt;!&ndash;        <p>清除测量</p>&ndash;&gt;-->
<!--    &lt;!&ndash;      </div>&ndash;&gt;-->
<!--    &lt;!&ndash;    </div>&ndash;&gt;-->
<!--  </el-drawer>-->
</template>

<script>
import {ref} from "vue";
import {
  Menu,
  EditPen,
  LocationInformation,
  Document,
  MostlyCloudy,
  Coordinate
} from '@element-plus/icons-vue'

export default {
  components: {
    Menu,
    EditPen,
    Document,
    LocationInformation,
    MostlyCloudy,
    Coordinate
  },
  setup() {
    const drawer = ref(false)
    return {
      drawer,
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/*.el-drawer {*/
/*  !*background-color: rgba(255, 255, 255, 0.7) !important;*!*/
/*}*/

/*.el-drawer__body {*/
/*  padding: 0 !important;*/
/*}*/

.el-drawer.btt {
  height: 50vh !important;
}

</style>

