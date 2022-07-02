<template>
  <div style="display: flex;flex-direction: column;align-items: center;background-color: whitesmoke">
    <h1 align="center">{{ title }}</h1>
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
        style="height: calc(100vh - 46px); overflow-y: hidden; width: 65vw;"
        v-model="content"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
        @onChange="handleChange"
    />
    <div style="width: 250px;position: absolute;left: 0;top: 40px">
      <ul id="header-container">
        <li v-for="item in lis" :id="item.id" :type="item.type">{{ item.text }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import {useRoute, useRouter} from 'vue-router'
import axios from "axios";
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import {onBeforeUnmount, ref, shallowRef, onMounted} from 'vue'
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'
import {HomeFilled, Edit} from "@element-plus/icons-vue";
import {SlateNode} from '@wangeditor/editor'


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

    const lis = ref([])
    const handleChange = (editor) => {
      lis.value = []
      const headers = editorRef.value.getElemsByTypePrefix('header')
      const headerContainer = document.getElementById('header-container')
      headerContainer.addEventListener('mousedown', event => {
        if (event.target.tagName !== 'LI') return
        event.preventDefault()
        const id = event.target.id
        editor.scrollToElem(id) // 滚动到标题
      })
      headers.map(header => {
        const text = SlateNode.string(header)
        const {id, type} = header
        lis.value.push({id, type, text})
      })
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
      goEdit,
      handleChange,
      lis
    }
  }
}
</script>

<style scoped>
#header-container {
  list-style-type: none;
  padding-left: 20px;
  height: calc(100vh - 46px);
  overflow-y: hidden;
}

#header-container:hover {
  overflow-y: auto;
}

#header-container li {
  margin: 10px 0;
  cursor: pointer;
}

#header-container li:hover {
  text-decoration: underline;
}

#header-container li[type="header1"] {
  font-size: 16px;
  font-weight: bold;
  color: IndianRed;
}

#header-container li[type="header2"] {
  font-size: 14px;
  padding-left: 15px;
  font-weight: bold;
}

#header-container li[type="header3"] {
  font-size: 12px;
  padding-left: 30px;
}


</style>