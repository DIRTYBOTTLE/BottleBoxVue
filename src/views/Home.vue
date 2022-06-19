<template>
  <nav id="top-img" style="background-image:url(https://api.isoyu.com/bing_images.php)"></nav>
  <div id="main-container">
    <!--  左侧栏  -->
    <div id="left-side">
      <!--   个人简介   -->
      <div class="card-container" id="introduce-card">
        <img :src="avatarUrl" style="width: 100px"/>
        <b>{{ username }}</b>
        <div style="text-align: center" v-if="introduce">{{ introduce }}</div>
        <div v-if="school" class="icon-item"><img :src="require('../assets/home/Icon学校.png')"/>{{ school }}</div>
        <div v-if="region" class="icon-item"><img :src="require('../assets/home/Icon地区.png')"/>{{ region }}</div>
        <div v-if="region" class="icon-item"><img :src="require('../assets/home/Icon邮箱.png')"/>{{ email }}</div>
        <a v-if="githubUrl" class="icon-item" :href="githubUrl"><img
            :src="require('../assets/home/IconGithub.png')"></a>
      </div>
    </div>
    <!--  内容区  -->
    <div id="mid-side">
      <!--   文章   -->
      <div class="card-container">
        <b>文章</b>
        <el-button :icon="Edit" circle @click="goEdit('0')" style="position: absolute;right: 5px"/>
        <el-table v-loading="loading" :data="blogs" style="width: 100%" :show-header="false" @row-click="goContent">
          <el-table-column prop="title" min-width="100%"/>
          <el-table-column prop="fromTime" width="100%"/>
          <el-table-column prop="toTime" width="100%"/>
          <el-table-column label="Operations" width="100%">
            <template #default="scope">
              <el-button type="primary" :icon="Edit" circle @click="goEdit(scope.row.id)"/>
              <el-button type="danger" :icon="Delete" circle @click.stop="deleteBlog(scope.row.id)"/>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!--   音乐   -->
      <div class="card-container" id="music-card">
      </div>

    </div>
  </div>
</template>

<script>
import 'aplayer/dist/APlayer.min.css';
import APlayer from 'aplayer';
import {onMounted, ref} from "vue";
import axios from "axios";
import {ElMessage, ElMessageBox} from "element-plus";
import {Edit, Delete} from "@element-plus/icons-vue";
import {useRouter} from "vue-router";


export default {
  name: "Home",
  setup() {
    const router = useRouter();
    const avatarUrl = "https://avatars.githubusercontent.com/u/62377297?s=400&u=c09e0c16c7bc4fe961fb1738d5e42ad0a7cb4783&v=4"
    const username = JSON.parse(sessionStorage.getItem("user") || "{}").name
    const introduce = JSON.parse(sessionStorage.getItem("user") || "{}").introduce
    const region = JSON.parse(sessionStorage.getItem("user") || "{}").region
    const school = JSON.parse(sessionStorage.getItem("user") || "{}").school
    const email = JSON.parse(sessionStorage.getItem("user") || "{}").email
    const githubUrl = JSON.parse(sessionStorage.getItem("user") || "{}").githubUrl

    const loading = ref(true)
    const blogs = ref([])
    const getBlog = () => {
      axios.get('/api/blog/list.do', {
        params: {
          userId: JSON.parse(sessionStorage.getItem("user") || "{}").id,
        }
      }).then(res => {
        blogs.value = res.data.data;
        loading.value = false
      })
    }
    const deleteBlog = (id) => {
      ElMessageBox.confirm(
          '确认删除?',
          {
            confirmButtonText: '是的',
            cancelButtonText: '取消',
            type: 'warning',
          }
      ).then(() => {
        axios.get('/api/blog/delete.do', {
          params: {
            id: id
          }
        }).then(res => {
          if (res.data.code === '0') {
            getBlog()
            ElMessage.success("删除成功！")
          } else {
            ElMessage.error("删除失败！")
          }
        })
      }).catch(() => {
        ElMessage({
          type: 'info',
          message: 'Delete canceled',
        })
      })
      // axios.get('/api/blog/delete.do', {
      //   params: {
      //     id: id
      //   }
      // }).then(res => {
      //   if (res.data.code === '0') {
      //     getBlog()
      //     ElMessage.success("删除成功！")
      //   } else {
      //     ElMessage.error("删除失败！")
      //   }
      // })
    }
    const goEdit = (id) => {
      router.push(`/blogedit?id=${id}`)
    }
    const goContent = (row) => {
      router.push(`/blogcontent?id=${row.id}`)
    }

    let ap;
    const getMusic = (sever, type, id) => {
      axios.get('https://api.i-meto.com/meting/api?server=' + sever + '&type=' + type + '&id=' + id).then(
          (res) => {
            ap.list.add(res.data)
          }
      )
    }

    onMounted(() => {
          getBlog()
          ap = new APlayer({
            container: document.getElementById('music-card'),
          });
          getMusic('tencent', 'playlist', '1503048898')
        }
    )


    return {
      avatarUrl,
      username,
      introduce,
      region,
      school,
      githubUrl,
      email,
      loading,
      blogs,
      goContent,
      goEdit,
      deleteBlog,
      Edit,
      Delete
    }
  }
}
</script>

<style scoped>
#top-img {
  height: 12rem;
  background-position: center center;
  background-size: cover;
}

#main-container {
  background-color: gainsboro;
  display: flex;
}

#left-side {
  width: 25vw;
  display: flex;
  align-items: center;
  flex-direction: column;
}

#mid-side {
  width: 75vw;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.card-container {
  width: 98%;
  background-color: white;
  margin: 10px 0 10px 0;
  padding: 5px 10px;
  line-height: 2rem;
  position: relative;
}

#introduce-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-item {
  display: flex;
  align-items: center;
}

.icon-item img {
  width: 20px;
  margin: 0px 5px;
}

>>> .el-table tr:hover {
  cursor: pointer;
}
</style>