<template>
  <h1 style="text-align: center;font-size: 6rem">瓶子的百宝箱</h1>
  <!--  <div class="body">-->
  <!--    <el-icon :size="100" style="cursor:pointer" @click="this.$router.push('/blog')">-->
  <!--      <Notebook/>-->
  <!--    </el-icon>-->
  <!--    <el-icon :size="100" style="cursor:pointer" @click="this.$router.push('/cesium')">-->
  <!--      <Position/>-->
  <!--    </el-icon>-->
  <!--    <el-icon :size="100" style="cursor:pointer" @click="this.$router.push('/file')">-->
  <!--      <Folder/>-->
  <!--    </el-icon>-->
  <!--    <img :src="require('../assets/home/Icon游戏.png')">-->
  <!--  </div>-->
  <div class="pageContainer">
    <div class="pageRouter" @click="this.$router.push('/blog')"><img :src="require('../assets/home/Icon备忘录.png')"><h2>备忘录</h2></div>
    <div class="pageRouter" @click="this.$router.push('/cesium')"><img :src="require('../assets/home/Icon地图.png')"><h2>地图</h2></div>
    <div class="pageRouter" @click="this.$router.push('/file')"><img :src="require('../assets/home/Icon云盘.png')"><h2>云盘</h2></div>
    <div class="pageRouter" @click="this.$router.push('/gamestore')"><img :src="require('../assets/home/Icon游戏.png')"><h2>游戏</h2></div>
  </div>
  <el-carousel height="150px">
    <el-carousel-item>
      <img :src="require('../assets/home/carousel1.png')" style="width: 1440px" alt="网络错误">
    </el-carousel-item>
    <el-carousel-item>
      <img :src="require('../assets/home/carousel2.png')" style="width: 1440px" alt="网络错误">
    </el-carousel-item>
    <el-carousel-item>
      <img :src="require('../assets/home/carousel3.png')" style="width: 1440px" alt="网络错误">
    </el-carousel-item>
    <el-carousel-item>
      <img :src="require('../assets/home/carousel4.png')" style="width: 1440px" alt="网络错误">
    </el-carousel-item>
  </el-carousel>

</template>

<script>
import {Notebook, Position, Folder} from "@element-plus/icons-vue";

export default {
  components: {Folder, Notebook, Position},
  name: "Home"
}
</script>

<style scoped>
.pageContainer {
  height: calc(100vh - 287px);
  display: flex;
  /*align-items: center;*/
  /*justify-content: center;*/
}

.pageRouter {
  width: calc(100vw / 4);
  height: 300px;
  /*border:5px solid red;*/
  text-align: center;
}

.pageRouter :hover {
  cursor: pointer;
}

.pageRouter img {
  width: 100px;
}
/*.el-carousel__item h3 {*/
/*  color: #475669;*/
/*  opacity: 0.75;*/
/*  line-height: 150px;*/
/*  margin: 0;*/
/*  text-align: center;*/
/*}*/

/*.el-carousel__item:nth-child(2n) {*/
/*  background-color: #99a9bf;*/
/*}*/

/*.el-carousel__item:nth-child(2n + 1) {*/
/*  background-color: #d3dce6;*/
/*}*/
</style>