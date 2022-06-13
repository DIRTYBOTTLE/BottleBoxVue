<template>
  <el-button @click="goHome" style="position: absolute;top: 0;left: 0">
    <el-icon>
      <HomeFilled/>
    </el-icon>
  </el-button>
  <div class="body">
    <el-upload drag :action="action" multiple name="multipartFile"
               :on-success="success">
      <!--  <el-upload drag action="http://101.42.222.84:8080/ssm-2.0-SNAPSHOT/file/upload.do" multiple name="multipartFile">-->
      <el-icon class="el-icon--upload">
        <upload-filled/>
      </el-icon>
      <div class="el-upload__text">
        拖拽文件或 <em>点击上传</em>
      </div>
      <!--    <template #tip>-->
      <!--      <div class="el-upload__tip">-->
      <!--        jpg/png files with a size less than 500kb-->
      <!--      </div>-->
      <!--    </template>-->
    </el-upload>
    <el-card class="box-card" v-for="doc in docs" :key="doc">
      <template #header>
        <div class="card-header">
          <span style="cursor: pointer">{{ doc.name }}</span>
          <span style="position: absolute;right: 0">
            <el-button :icon="Delete" circle @click="deleteFile(doc.uuid)"/>
            <el-button :icon="Download" circle @click="download(doc.uuid)"/>
          </span>
        </div>
      </template>
      <div>{{ doc.time }}</div>
    </el-card>
  </div>
  <!--  <el-image src="http://localhost:8080/ssm0427/file/download.do?uuid=img"/>-->
</template>

<script>
import {UploadFilled, Download, Delete,HomeFilled} from "@element-plus/icons-vue";
import axios from "axios";
import {onMounted, ref} from "vue";
import {ElMessage} from "element-plus";
import {useRouter} from "vue-router";

export default {
  name: "File",
  components: {UploadFilled,HomeFilled},
  setup() {
    const router = useRouter();
    const docs = ref([])
    const action = ref("/api/doc/upload.do")
    const success = (res) => {
      if (res.code === '0') {
        getDocs()
        ElMessage.success("上传成功！")
      } else {
        ElMessage.error('上传失败！')
      }
    }
    const getDocs = () => {
      axios.get('/api/doc/list.do?', {
        params: {
          userId: '1'
        }
      }).then(res => {
        docs.value = res.data.data;
      })
    }
    onMounted(() => {
      getDocs()
    })
    const download = (uuid) => {
      const a = document.createElement("a"); // 生成一个a元素
      const event = new MouseEvent("click"); // 创建一个单击事件
      a.href = '/api/doc/download.do?uuid=' + uuid; // 将生成的URL设置为a.href属性
      a.dispatchEvent(event); // 触发a的单击事件
    }
    const deleteFile = (uuid) => {
      axios.get('/api/doc/delete.do?', {
        params: {
          uuid: uuid
        }
      }).then(res => {
        if (res.data.code === '0') {
          getDocs()
          ElMessage.success("删除成功！")
        } else {
          ElMessage.error(res.data.msg)
        }
      })
    }
    const goHome = () => {
      router.push('/home')
    }
    return {
      docs,
      Download,
      download,
      getDocs,
      Delete,
      deleteFile,
      action,
      success,
      goHome
    }
  }
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

.card-header {
  position: relative;
  /*justify-content: space-between;*/
  /*align-items: center;*/
}
</style>