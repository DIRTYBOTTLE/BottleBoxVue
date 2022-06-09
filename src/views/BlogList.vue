<template>
  <div class="body">
    <el-button @click="goHome" style="position: absolute;top: 0;left: 0">
      <el-icon>
        <HomeFilled/>
      </el-icon>
    </el-button>
    <el-card class="box-card" v-for="blog in blogs" :key="blog">
      <template #header>
        <div class="card-header">
          <span @click="goContent(blog.id)" style="cursor: pointer">{{ blog.title }}</span>
          <span style="position: absolute;right: 0px">
            <el-button :icon="Edit" circle @click="goEdit(blog.id)"/>
            <el-button :icon="Delete" circle @click="deleteBlog(blog.id)"/>
          </span>
        </div>
      </template>
      <div>创建：{{ blog.fromTime }} 更新：{{ blog.toTime }}</div>
    </el-card>
    <el-button :icon="Edit" style="position: absolute; right: 0px;" @click="goEdit('0')"/>
  </div>
</template>

<script>
import axios from "axios";
import {onMounted, ref} from "vue";
import {Delete, Edit, HomeFilled} from '@element-plus/icons-vue'
import {useRouter} from "vue-router";
import {ElMessage} from "element-plus";

export default {
  name: "Blog",
  components: {HomeFilled},
  setup() {
    const router = useRouter();
    const blogs = ref([])
    const getBlog = () => {
      axios.get('/api/blog/list.do', {
        params: {
          userId: JSON.parse(sessionStorage.getItem("user") || "{}").id,
        }
      }).then(res => {
        blogs.value = res.data.data;
      })
    }
    const deleteBlog = (id) => {
      axios.get('/api/blog/delete.do', {
        params: {
          id: id
        }
      }).then(res => {
        if (res.data.code == '0') {
          getBlog()
          ElMessage.success("删除成功！")
        } else {
          ElMessage.error("删除失败！")
        }
      })
    }
    const goEdit = (id) => {
      router.push(`/blogedit?id=${id}`)
    }
    onMounted(() => {
      getBlog()
    })

    const goContent = (id) => {
      router.push(`/blogcontent?id=${id}`)
    }

    const goHome = () => {
      router.push('/home')
    }

    return {
      blogs,
      getBlog,
      Edit,
      Delete,
      goEdit,
      goContent,
      deleteBlog,
      goHome
    }
  },

}
</script>

<style scoped>
.body {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.box-card {
  width: 480px;
}

.el-button + .el-button {
  margin-left: 2px;
}

.card-header {
  position: relative;
  /*justify-content: space-between;*/
  /*align-items: center;*/
}

/*.text {*/
/*  font-size: 14px;*/
/*}*/

/*.item {*/
/*  margin-bottom: 18px;*/
/*}*/


</style>