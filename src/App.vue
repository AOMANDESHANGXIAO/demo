<script setup lang="ts">
import { onMounted } from 'vue'
import { getTextHeight } from './utils/tool'
defineOptions({
  name: 'App',
})
const domStyle = {
  width: '300px',
  'box-sizing': 'border-box',
  'padding-left': '30px',
  'padding-right': '30px',
  'font-family': 'Inter',
  // height: '400px',
  'margin-top': '20px',
  'margin-bottom': '20px',
  'font-size': '16px',
  'line-height': '24px',
  'border-top': '1px solid red',
  'border-bottom': '1px solid red',
}
const text =
  '这是一个测试文本，用于测试文本高度计算。这是一个测试文本，用于测试文本高度计算。这是一个测试文本，用于测试文本高度计算。一个测试文本，'

// const getPredictedDomHeight = (params: {
//   text: string
//   containerWidth: number
//   font: string
//   lineHeight: number
//   padding?: {
//     top?: number
//     bottom?: number
//     left?: number
//     right?: number
//   }
//   margin?: {
//     top?: number
//     bottom?: number
//     left?: number
//     right?: number
//   }
//   border?: {
//     top?: number
//     bottom?: number
//     left?: number
//     right?: number
//   }
// }) => {
//   if (params.padding === undefined) {
//     params.padding = {
//       top: 0,
//       bottom: 0,
//       left: 0,
//       right: 0,
//     }
//   }
//   if (params.margin === undefined) {
//     params.margin = {
//       top: 0,
//       bottom: 0,
//       left: 0,
//       right: 0,
//     }
//   }
//   if (params.border === undefined) {
//     params.border = {
//       top: 0,
//       bottom: 0,
//       left: 0,
//       right: 0,
//     }
//   }
//   const { text, containerWidth, font, lineHeight, padding, margin, border } =
//     params
//   // 预测的dom高度
//   let canUseWidth =
//     containerWidth - padding.left - padding.right - border.left - border.right
//   const textHeight = getTextHeight(text, {
//     containerWidth: canUseWidth,
//     fontSize: font,
//     lineHeight,
//   })
//   return textHeight + border.top + border.bottom
// }

// 依据文本 和 css推断dom大小
// 包括 margin
const predictDomSize =
  getTextHeight(text, {
    containerWidth: 300 - 30 - 30,
    fontSize: '16px Inter',
    lineHeight: 24,
  }) +
  2 * 1 // 上下边框的大小
console.log('预测的dom大小', predictDomSize)
// 实际的大小
onMounted(() => {
  const dom = document.querySelector('div')
  if (dom) {
    const actualDomSize = dom.offsetHeight
    console.log('实际的dom大小', actualDomSize)
  }
})
</script>

<template>
  <div :style="domStyle">{{ text }}</div>
</template>

<style scoped lang="scss"></style>
