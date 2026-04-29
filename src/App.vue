<script setup lang="ts">
import { YuqueRichText } from 'yuque-rich-text'
import { parseYuqueHtml, removeHtmlAttributes } from './utils/parseHtml'
import { ref } from 'vue'
import { prepare, layout } from '@chenglou/pretext'

defineOptions({
  name: 'app'
})
const text = ref('')
const handleChange = (value: string) => {
  // console.log(value)
  spliteYuQueHtml2Pages(value)
  console.log('分页结果', pages)
  renderPages()
}
const pageHtmls = ref<string[]>([])
const pageWidth = 300
const PADDING = 20
const pageCanUseHeight = 500 - PADDING * 2
const lineCount = 24
let pages: Array<{
  height: number
  id: string
  blockHtmls: string[]
}> = []
// TODO:
// 1. 将yuque渲染出的html中带的id全部清除
const spliteYuQueHtml2Pages = (htmlString: string) => {
  let currentPage = 0
  // 清除html中的id属性
  const cleanedHtml = removeHtmlAttributes(htmlString)
  const blocks = parseYuqueHtml(cleanedHtml).blocks
  pages = []
  for (let block of blocks) {
    const prepared = prepare(block.innerText, '16px Inter')
    const height = layout(prepared, pageWidth, lineCount).height
    if (!pages.length) {
      // 添加第一页
      pages.push({
        height: 0,
        id: `page-${currentPage}`,
        blockHtmls: []
      })
    }
    // 超出宽度限制换行
    if (pages[currentPage].height + height > pageCanUseHeight) {
      currentPage++
      pages.push({
        height: 0,
        id: `page-${currentPage}`,
        blockHtmls: []
      })
    }
    pages[currentPage].height += height
    pages[currentPage].blockHtmls.push(block.outerHTML)
  }
}
const renderPages = () => {
  pageHtmls.value = pages.map(page => {
    return page.blockHtmls.join('')
  })
  console.log('渲染后的页面HTML', pageHtmls.value)
}
</script>

<template>
  <header class="banner"></header>
  <main class="container">
    <div class="editor">
      <YuqueRichText v-model="text" @onChange="handleChange" />
    </div>
    <div class="pages-view">
      <div class="page" v-for="pageHtml in pageHtmls" :key="pageHtml" v-html="pageHtml"></div>
    </div>
  </main>
</template>

<style scoped lang="scss">
.page {
  blockquote {
    p {
      font-size: 56px;
      margin: 0 !important;
    }
  }
}

.banner {
  width: 100vw;
  height: 5vh;
  background: pink;
}
.container {
  width: 100vw;
  height: calc(100vh - 5vh);
  display: flex;
  flex-direction: row;
  background: red;
  .editor {
    flex: 1;
    height: 100%;
  }
  .pages-view {
    flex: 1;
    height: 100%;
    display: flex;
    gap: 10px;
    padding: 10px;
  }
  background: #f5f5f5;
}
.page {
  width: 300px;
  height: 500px;
  background: skyblue;
  line-height: 24px;
  padding: 20px;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  margin-bottom: 20px;
}
</style>
