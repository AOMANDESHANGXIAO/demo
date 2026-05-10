<script setup lang="ts">
import { YuqueRichText } from 'yuque-rich-text'
import {
  parseYuqueHtml2LinkedList,
  removeHtmlAttributes,
} from './utils/parseHtml'
import { parseMargin, parsePadding, parseBorder } from './utils/parseCss'
import { ref } from 'vue'
import { getTextHeight, spliteTextByContainer } from './utils/tool'
import _ from 'lodash'

defineOptions({
  name: 'app',
})
interface Page {
  height: number
  id: string
  blockHtmls: string[]
}
const text = ref('')
const handleChange = (value: string) => {
  // console.log(value)
  pageHtmls.value = spliteYuQueHtml2Pages(value).map(page => {
    return page.blockHtmls.join('')
  })
}
const pageHtmls = ref<string[]>([])
const pageWidth = 300
const PADDING = 20
const pageCanUseWidth = pageWidth - PADDING * 2
const pageCanUseHeight = 500 - PADDING * 2
// const lineHeight = 24

// test: 定义一组theme style
// 完整的 Markdown 样式配置（你要的 JS 对象格式）
const themeStyles = {
  // 标题
  h1: {
    fontSize: '32px',
    lineHeight: '40px',
    fontWeight: 'bold',
    fontFamily: 'Inter, sans-serif',
    margin: '24px 0 16px',
    color: '#1e293b',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '8px',
  },
  h2: {
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: 'bold',
    fontFamily: 'Inter, sans-serif',
    margin: '20px 0 12px',
    color: '#1e293b',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '6px',
  },
  h3: {
    fontSize: '18px',
    lineHeight: '28px',
    fontWeight: 'bold',
    fontFamily: 'Inter, sans-serif',
    margin: '16px 0 10px',
    color: '#1e293b',
  },
  h4: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 'bold',
    margin: '14px 0 8px',
    color: '#1e293b',
  },
  h5: {
    fontSize: '14px',
    lineHeight: '22px',
    fontWeight: 'bold',
    margin: '12px 0 6px',
    color: '#334155',
  },
  h6: {
    fontSize: '12px',
    lineHeight: '20px',
    fontWeight: 'bold',
    margin: '10px 0 4px',
    color: '#475569',
  },
  // 段落
  p: {
    fontSize: '15px',
    lineHeight: '24px',
    fontWeight: 'normal',
    margin: '10px 0',
    color: '#334155',
  },
  // 强调文本
  strong: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  em: {
    fontStyle: 'italic',
    color: '#334155',
  },
  // 引用
  blockquote: {
    borderLeft: '4px solid #3b82f6',
    padding: '12px 16px',
    margin: '16px 0',
    backgroundColor: '#eff6ff',
    color: '#1e40af',
    fontSize: '16px',
    fontFamily:'Inter, sans-serif',
    lineHeight: '24px',
  },
}

/**
 * 为 HTML 根标签追加 style 属性
 * @param htmlString 格式如: <p><span>text</span></p>
 * @param styleObj style 对象，如: { fontSize: '16px', color: 'red' }
 * @returns 追加了 style 属性的 HTML 字符串
 */
const appendStyleToRootTag = (
  htmlString: string,
  styleObj: Record<string, string>,
): string => {
  if (!htmlString) return ''

  // 将 style 对象转换为 css 字符串
  const styleStr = Object.entries(styleObj)
    .map(
      ([key, value]) =>
        `${key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}: ${value}`,
    )
    .join('; ')

  // 正则匹配第一个开始标签 <tagName ...>
  // 捕获组1: 标签名
  // 捕获组2: 标签内已有的属性（可选）
  const regex = /^<([a-zA-Z][a-zA-Z0-9-]*)(\s[^>]*)?>/

  const match = htmlString.match(regex)

  if (match) {
    const tagName = match[1]
    const existingAttrs = match[2] || ''

    // 如果已有 style 属性，则追加；否则新增
    let newAttrs = existingAttrs
    if (newAttrs.includes('style=')) {
      // 简单处理：在现有 style 末尾分号前插入，或者直接在现有 style 值后追加
      // 这里采用简单策略：直接在现有属性后追加 style，实际生产中可能需要更复杂的解析来合并 style
      newAttrs = newAttrs.replace(/style="([^"]*)"/, `style="$1; ${styleStr}"`)
    } else {
      newAttrs += ` style="${styleStr}"`
    }

    // 重构开始标签
    const newStartTag = `<${tagName}${newAttrs}>`

    // 替换原字符串中的开始标签
    return htmlString.replace(regex, newStartTag)
  }

  return htmlString
}

/**
 * 提取并拼接字体相关属性值
 * 顺序: fontSize fontWeight fontFamily
 * @param styleObj 样式对象
 * @returns 拼接后的字符串，例如: "16px bold Inter, sans-serif"
 */
const getFontValueString = (styleObj?: Record<string, string>): string => {
  if (!styleObj) return ''

  // 定义需要提取的属性键名及其顺序
  const keys = ['fontSize', 'fontWeight', 'fontFamily']
  const res = keys
    .map(key => styleObj[key])
    .filter(Boolean)
    .join(' ')
  return res
}

const getPredictedDomHeight = (params: {
  text: string
  containerWidth: number
  font: string
  lineHeight: number
  styleObj?: Record<string, string>
}) => {
  let paddingValues = { top: 0, right: 0, bottom: 0, left: 0 }
  let borderValues = { top: 0, bottom: 0, left: 0, right: 0 }
  if (params.styleObj?.padding) {
    paddingValues = parsePadding(params.styleObj?.padding as string)
  }

  // NO
  if (params.styleObj?.border) {
    borderValues = parseBorder(params.styleObj?.border as string)
  }

  const { text, containerWidth, font, lineHeight } = params
  // 预测的dom高度
  let canUseWidth =
    containerWidth -
    paddingValues.left -
    paddingValues.right -
    borderValues.left -
    borderValues.right
  const textHeight = getTextHeight(text, {
    containerWidth: canUseWidth,
    fontSize: font,
    lineHeight,
  })
  return textHeight + borderValues.top + borderValues.bottom
}

/**
 *
 * @param htmlString
 * 示例:
 * <p data-lake-id="u44431472" id="u44431472"><span data-lake-id="u4720872d" id="u4720872d" class="lake-fontsize-12" style="color: rgb(0, 0, 0)">晨风中醒来，遇见阳光，有融融的暖意拂过心上，旖旎过脸庞，如一片花瓣的馨香，轻轻吻落昨夜的彷徨。写过的字，早已晾晒好了在青草茵茵的河床，无需清点，那些鲜活的词章，正攀爬上蝴蝶的翅膀，成群结队的飞往你的方向。</span></p><p data-lake-id="u8601b468" id="u8601b468"><span data-lake-id="uc5395300" id="uc5395300" class="lake-fontsize-12" style="color: rgb(0, 0, 0)">情意，是水边的一朵铃兰香，从不需要隐藏，只随着风讯在流年里生长，那些漫过心湖的渴望，不为要你迎合，你只需懂得，每一次虔诚的叙述，都将载入生命的乐章。</span></p><p data-lake-id="ue04dee7a" id="ue04dee7a"><span data-lake-id="u5b63e273" id="u5b63e273" class="lake-fontsize-12" style="color: rgb(0, 0, 0)">心里，有一处温暖，即便是阳光照不到的角落，也可独自繁生着万千的明媚。正如你说，这世界是寂静的，可是就会有初晓的风从远山拂过，荡漾在心里，婉若一滴晨露落入眼眸，晕开的情愫，足以成自然清透的美丽。佛说，八千里荷塘喧哗不及与有情人的一次擦肩而过，不喜形于色，不魅惑于心，浅喜深爱，便是最深的懂得。</span></p><p data-lake-id="u0c566158" id="u0c566158"><span data-lake-id="u33377890" id="u33377890" class="lake-fontsize-12" style="color: rgb(0, 0, 0)">于是，我对着岁月研墨，落笔，用莞尔的笑意勾勒出无声无息的`静寂，只为隔着红尘念你。待青葱如许，芳华如昔，翻阅泛黄的画卷，回忆起素年锦时，读你写给我的诗，与你的情意，又可在心里，再一次，做温暖的重聚。</span></p><p data-lake-id="u9a609fce" id="u9a609fce"><span data-lake-id="u3a26a984" id="u3a26a984" class="lake-fontsize-12" style="color: rgb(0, 0, 0)">总会有一个契机，让混沌的心豁然开朗，就如枯木里也能长出的时光。会发现，原来流年不过是一程又一程的奔忙，让你早就没有机会去感伤。所以，有些话题，请放在九霄云外飞翔。心，留给自己，只用来负责顽强。</span></p>
 */
const spliteYuQueHtml2Pages = (htmlString: string): Page[] => {
  // TODO: 解决 ul、ol标签的嵌套问题
  // 如果ul或者ol，则要考虑拆分li
  let pages: Page[] = []
  // 清除所有的id,class等属性，只保留标签和文本内容
  // 解析html字符串为链表
  const { blocks } = parseYuqueHtml2LinkedList(removeHtmlAttributes(htmlString))
  // 遍历链表
  let current = blocks.head
  if (!current) {
    return [] as Page[]
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
    const currentPage = pages[currentPageIndex]
    let tagName =
      current.value.tagName.toLowerCase() as keyof typeof themeStyles
    let lineHeight = 0
    if (_.has(themeStyles[tagName], 'lineHeight')) {
      lineHeight = parseInt(
        (themeStyles[tagName].lineHeight as string) || '24px',
        10,
      )
    }
    let fontSetting = getFontValueString(
      themeStyles[tagName as keyof typeof themeStyles],
    )
    if (tagName === 'blockquote') {
    }
    // 拼接font样式
    let height = getPredictedDomHeight({
      text: current.value.innerText,
      containerWidth: pageCanUseWidth,
      font: fontSetting,
      lineHeight,
      styleObj: themeStyles[tagName],
    })
    // 获取margin值
    let marginValues = { top: 0, right: 0, bottom: 0, left: 0 }
    if (_.has(themeStyles[tagName], 'margin')) {
      marginValues = parseMargin(themeStyles[tagName].margin as string)
    }
    height += marginValues.top + marginValues.bottom
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
          font: fontSetting,
          lineHeight,
          remainingHeight,
        })
      // 将 fittingText 放入当前页
      let fittingBlock = `<${current.value.tagName.toLowerCase()}><span>${fittingText}</span></${current.value.tagName.toLowerCase()}>`
      fittingBlock = appendStyleToRootTag(
        fittingBlock,
        themeStyles[tagName as keyof typeof themeStyles],
      )
      currentPage.blockHtmls.push(fittingBlock)
      currentPage.height += fittingHeight

      if (remainingText.length > 0) {
        // 创建一个新节点，将 remainingText 插入链表
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
      currentPage.blockHtmls.push(
        appendStyleToRootTag(
          current.value.outerHTML,
          themeStyles[tagName as keyof typeof themeStyles],
        ),
      )
    }
    current = current.next
  }
  return pages
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
  background: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  line-height: 24px;
  padding: 20px;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  margin-bottom: 20px;
}
</style>
