<script setup lang="ts">
/**
 * 自动将长文分页转换为多页文本页面的demo
 */
import { ref, watch } from 'vue'
import { prepare, layout } from '@chenglou/pretext'

const t = ref('')
let lines = []
let pageLines: Array<{
  lines: string[]
  height: number
  id: string
}> = []
const pageWidth = 300
const pageHeight = 500 - 20 * 2
const lineCount = 24
watch(
  () => t.value,
  () => {
    // 依据换行符分割长文
    let currentPage = 0
    pageLines = []
    lines = t.value.split('\n')
    // 遍历lines, 每个line都计算一下高度，如果高度大于pageHeight，就换行
    for (let line of lines) {
      const prepared = prepare(line, '16px Inter')
      const height = layout(prepared, pageWidth, lineCount).height
      if (!pageLines.length) { // 添加第一页
        pageLines.push({
          lines: [],
          height: 0,
          id: `page-${currentPage}`
        })
      }
      if (pageLines[currentPage].height + height > pageHeight) {
        currentPage++
        pageLines.push({
          lines: [],
          height: 0,
          id: `page-${currentPage}`
        })
      }
      pageLines[currentPage].lines.push(line)
      pageLines[currentPage].height += height
    }
    console.log(pageLines)
  }
)
</script>

<template>
  <div>
    <textarea v-model="t" placeholder="" placeholder-class="textarea-placeholder" @input="" />
    <!-- 分页渲染页面 -->
    <section class="page" v-for="page in pageLines" :key="page.id">
      <div v-for="line in page.lines" :key="line">{{ line }}</div>
    </section>
  </div>
</template>

<style scoped>
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
