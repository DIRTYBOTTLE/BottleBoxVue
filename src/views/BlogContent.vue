<template>
  <h1 align="center">{{ title }}</h1>
  <!--  <div v-html="content" style="margin: 10px;line-height: 200%"></div>-->
  <el-button @click="goHome" style="position: absolute;top: 0;left: 0">
    <el-icon>
      <HomeFilled/>
    </el-icon>
  </el-button>
  <el-button @click="goEdit" style="position: absolute;top: 0;right: 0">
    <el-icon>
      <Edit/>
    </el-icon>
  </el-button>
  <Editor
      style="height: calc( 100vh - 45.5px); overflow-y: hidden;"
      v-model="content"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
  />
</template>

<script>
import {useRoute, useRouter} from 'vue-router'
import axios from "axios";
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import {onBeforeUnmount, ref, shallowRef, onMounted} from 'vue'
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'
import {HomeFilled, Edit} from "@element-plus/icons-vue";

export default {
  name: "BlogContent",
  components: {Editor, Toolbar, HomeFilled, Edit},
  setup() {
    const route = useRoute()
    const id = route.query.id;
    const title = ref("");
    const content = ref("");
    axios.get('/api/blog/select.do', {params: {id: id}})
        .then(res => {
          content.value = res.data.data.content
          title.value = res.data.data.title
        })

    // 编辑器实例，必须用 shallowRef
    const editorRef = shallowRef()

    // 内容 HTML
    const valueHtml = ref('')

    const editorConfig = {}

    // 组件销毁时，也及时销毁编辑器
    onBeforeUnmount(() => {
      const editor = editorRef.value
      if (editor == null) return
      editor.destroy()
    })

    const handleCreated = (editor) => {
      editor.disable()
      editorRef.value = editor // 记录 editor 实例，重要！
    }

    const router = useRouter();
    const goHome = () => {
      router.push('/blog')
    }

    const goEdit = () => {
      router.push('/blogedit?id=' + id)
    }

    return {
      title,
      content,
      editorRef,
      valueHtml,
      mode: 'default', // 或 'simple'
      editorConfig,
      handleCreated,
      goHome,
      goEdit
    }
  }
}
</script>

<style scoped>

</style>