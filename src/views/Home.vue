<template>
  <div class="body">
    <el-icon :size="100" style="cursor:pointer" @click="this.$router.push('/blog')">
      <Notebook/>
    </el-icon>
    <el-icon :size="100" style="cursor:pointer" @click="this.$router.push('/cesium')">
      <Position/>
    </el-icon>
    <el-icon :size="100" style="cursor:pointer" @click="this.$router.push('/file')">
      <Folder/>
    </el-icon>
  </div>
</template>

<script>
import {Notebook, Position, Folder} from "@element-plus/icons-vue";

export default {
  components: {Folder, Notebook, Position},
  name: "Home"
}
</script>

<style scoped>
.body {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>