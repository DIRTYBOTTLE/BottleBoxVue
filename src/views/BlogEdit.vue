<template>
  <span>
    <el-input v-model="blogForm.title" placeholder="请键入标题" clearable input-style="text-align: center;">
      <template #prepend>
        <el-button @click="goHome">
          <el-icon>
            <HomeFilled/>
          </el-icon>
        </el-button>
      </template>
      <template #append>
        <el-button @click="submit">
          <el-icon>
            <Upload/>
          </el-icon>
        </el-button>
      </template>
    </el-input>
  </span>

  <div style="border: 1px solid #ccc;height: calc( 100vh - 32px) ">
    <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
    />
    <Editor
        style="height: calc(100vh - 105px); overflow-y: hidden;"
        v-model="blogForm.content"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
    />
    <!--    <el-button @click="insertText"></el-button>-->
  </div>
</template>

<script>
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import {onBeforeUnmount, onMounted, ref, shallowRef} from 'vue'
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'
import {HomeFilled, Upload} from "@element-plus/icons-vue";
import {useRoute, useRouter} from 'vue-router';
import axios from "axios";
import {ElMessage} from "element-plus";


export default {
  components: {Editor, Toolbar, Upload, HomeFilled},
  setup() {

    const router = useRouter();
    const route = useRoute()
    let id = route.query.id

    const myDate = new Date();

    // 编辑器实例，必须用 shallowRef
    const editorRef = shallowRef()

    // 内容 HTML
    let valueHtml = ref('')

    const blogForm = ref({
      id: route.query.id,
      title: '',
      content: '',
      fromTime: myDate.toLocaleDateString(),
      toTime: myDate.toLocaleDateString(),
      userId: JSON.parse(sessionStorage.getItem("user") || "{}").id
    })

    // 模拟 ajax 异步获取内容
    onMounted(() => {
      setTimeout(() => {
        if (id != '0') {
          getBlog(id)
        }
      }, 0)
    })

    const getBlog = (id) => {
      axios.get('/api/blog/select.do', {
        params: {
          id: id
        }
      }).then(res => {
        blogForm.value.title = res.data.data.title
        blogForm.value.content = res.data.data.content
      })
    }

    const submit = () => {
      if (blogForm.value.id == '0') {
        axios.post('/api/blog/insert.do', blogForm.value).then(res => {
          if (res.data.code == '0') {
            ElMessage.success("保存成功！")
            blogForm.value.id = res.data.data
          } else {
            ElMessage.error("保存失败！")
          }
        })
      } else {
        axios.post('/api/blog/update.do', blogForm.value).then(res => {
          if (res.data.code == '0') {
            ElMessage.success("更新成功！")
          } else {
            ElMessage.error("更新失败！")
          }
        })
      }
    }

    const goHome = () => {
      router.push('/blog')
    }

    const toolbarConfig = {}
    const editorConfig = {placeholder: '请输入内容...'}

    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
      const editor = editorRef.value
      if (editor == null) return
      editor.destroy()
    })

    const handleCreated = (editor) => {
      editorRef.value = editor // 记录 editor 实例，重要！
    }


    return {
      // title,
      blogForm,
      submit,
      editorRef,
      valueHtml,
      mode: 'default', // 或 'simple'
      toolbarConfig,
      editorConfig,
      handleCreated,
      goHome
    };
  }
}
</script>

<style scoped>

</style>