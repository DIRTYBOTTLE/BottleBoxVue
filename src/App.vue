<template>
  <!--  nav定义导航链接的部分-->
  <!--  <nav>-->
  <!--    <router-link to="/login">登陆</router-link>-->
  <!--  </nav>-->
  <router-view/>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*text-align: center;*/
  color: #2c3e50;
  margin: 0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.el-drawer {
  background-color: rgba(255, 255, 255, 0.7) !important;
}
</style>
