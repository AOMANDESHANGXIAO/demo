<script setup lang="ts">
import { YuqueRichText } from 'yuque-rich-text'
import {
  parseYuqueHtml2LinkedList,
  removeHtmlAttributes,
} from './utils/parseHtml'
import { ref } from 'vue'
import { getTextHeight, spliteTextByContainer } from './utils/tool'

defineOptions({
  name: 'app',
})
const text = ref('')
const handleChange = (value: string) => {
  // console.log(value)
  spliteYuQueHtml2Pages(value)
  pageHtmls.value = pages.map(page => {
    return page.blockHtmls.join('')
  })
}
const pageHtmls = ref<string[]>([])
const pageWidth = 300
const PADDING = 20
const pageCanUseWidth = pageWidth - PADDING * 2
const pageCanUseHeight = 500 - PADDING * 2
const lineHeight = 24
let pages: Array<{
  height: number
  id: string
  blockHtmls: string[]
}> = []
const testFontSetting = '16px inner'
/**
 *
 * @param htmlString
 * 示例:
 * <p data-lake-id="u44431472" id="u44431472"><span data-lake-id="u4720872d" id="u4720872d" class="lake-fontsize-12" style="color: rgb(0, 0, 0)">晨风中醒来，遇见阳光，有融融的暖意拂过心上，旖旎过脸庞，如一片花瓣的馨香，轻轻吻落昨夜的彷徨。写过的字，早已晾晒好了在青草茵茵的河床，无需清点，那些鲜活的词章，正攀爬上蝴蝶的翅膀，成群结队的飞往你的方向。</span></p><p data-lake-id="u8601b468" id="u8601b468"><span data-lake-id="uc5395300" id="uc5395300" class="lake-fontsize-12" style="color: rgb(0, 0, 0)">情意，是水边的一朵铃兰香，从不需要隐藏，只随着风讯在流年里生长，那些漫过心湖的渴望，不为要你迎合，你只需懂得，每一次虔诚的叙述，都将载入生命的乐章。</span></p><p data-lake-id="ue04dee7a" id="ue04dee7a"><span data-lake-id="u5b63e273" id="u5b63e273" class="lake-fontsize-12" style="color: rgb(0, 0, 0)">心里，有一处温暖，即便是阳光照不到的角落，也可独自繁生着万千的明媚。正如你说，这世界是寂静的，可是就会有初晓的风从远山拂过，荡漾在心里，婉若一滴晨露落入眼眸，晕开的情愫，足以成自然清透的美丽。佛说，八千里荷塘喧哗不及与有情人的一次擦肩而过，不喜形于色，不魅惑于心，浅喜深爱，便是最深的懂得。</span></p><p data-lake-id="u0c566158" id="u0c566158"><span data-lake-id="u33377890" id="u33377890" class="lake-fontsize-12" style="color: rgb(0, 0, 0)">于是，我对着岁月研墨，落笔，用莞尔的笑意勾勒出无声无息的`静寂，只为隔着红尘念你。待青葱如许，芳华如昔，翻阅泛黄的画卷，回忆起素年锦时，读你写给我的诗，与你的情意，又可在心里，再一次，做温暖的重聚。</span></p><p data-lake-id="u9a609fce" id="u9a609fce"><span data-lake-id="u3a26a984" id="u3a26a984" class="lake-fontsize-12" style="color: rgb(0, 0, 0)">总会有一个契机，让混沌的心豁然开朗，就如枯木里也能长出的时光。会发现，原来流年不过是一程又一程的奔忙，让你早就没有机会去感伤。所以，有些话题，请放在九霄云外飞翔。心，留给自己，只用来负责顽强。</span></p>
 */
const spliteYuQueHtml2Pages = (htmlString: string) => {
  pages = []
  // 清除所有的id,class等属性
  htmlString = removeHtmlAttributes(htmlString)
  // 解析html字符串为链表
  const { blocks } = parseYuqueHtml2LinkedList(htmlString)
  // 遍历链表
  let current = blocks.head
  if (!current) {
    return
  }
  let currentPageIndex = 0
  if (!pages.length) {
    pages.push({
      height: 0,
      id: `page-${currentPageIndex}`,
      blockHtmls: [],
    })
  }
  while (current) {
    const height = getTextHeight(current.value.innerText, {
      containerWidth: pageCanUseWidth,
      fontSize: testFontSetting,
      lineHeight,
    })
    const currentPage = pages[currentPageIndex]
    if (currentPage && currentPage.height + height > pageCanUseHeight) {
      const remainingHeight = pageCanUseHeight - currentPage.height
      if (remainingHeight <= lineHeight) {
        // 如果剩余高度不足以展示一行文本，则直接分页
        pages.push({
          height: 0,
          id: `page-${currentPageIndex + 1}`,
          blockHtmls: [],
        })
        currentPageIndex++
        continue
      }
      // 数学计算然后得到当前段落在剩余高度下能展示的文本长度
      // 考虑实现一个splitTextByContainer函数，该函数接收一个字符串和容器宽高，返回一个字符串，该字符串在容器内能展示的文本
      const { fittingText, remainingText, fittingHeight } =
        spliteTextByContainer(current.value.innerText, {
          containerWidth: pageCanUseWidth,
          fontSize: testFontSetting,
          lineHeight,
          remainingHeight,
          height,
        })
      console.log('===============================')
      console.log('fittingText', fittingText)
      console.log('remainingText', remainingText)
      console.log('fittingHeight', fittingHeight)
      console.log('remainingHeight', remainingHeight)
      console.log('===============================')
      // 将 fittingText 放入当前页
      let fittingBlock = `<${current.value.tagName.toLowerCase()}>${fittingText}</${current.value.tagName.toLowerCase()}>`
      currentPage.blockHtmls.push(fittingBlock)
      currentPage.height += fittingHeight
      if (remainingText.length > 0) {
        // 创建一个新节点，将 remainingText 放入
        const newNodeValue = {
          tagName: current.value.tagName,
          id: current.value.id,
          dataLakeId: current.value.dataLakeId,
          innerText: remainingText,
          outerHTML: `<${current.value.tagName.toLowerCase()}>${remainingText}</${current.value.tagName.toLowerCase()}>`,
        }
        blocks.insertAfter(current, newNodeValue)
      }
    } else {
      currentPage.height += height
      currentPage.blockHtmls.push(current.value.outerHTML)
    }
    current = current.next
  }
  console.log('pages', pages)
}
</script>

<template>
  <header class="banner"></header>
  <main class="container">
    <div class="editor">
      <YuqueRichText v-model="text" @onChange="handleChange" />
    </div>
    <div class="pages-view">
      <div
        class="page"
        v-for="pageHtml in pageHtmls"
        :key="pageHtml"
        v-html="pageHtml"
      ></div>
    </div>
  </main>
</template>

<style scoped lang="scss">
.pages-view {
  .page {
    p {
      margin-bottom: 0 !important;
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
