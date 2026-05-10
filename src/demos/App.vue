<!-- 这是一个测试文本高度计算的demo -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { getTextHeight } from './utils/tool'
import { parsePadding } from './utils/parseCss'
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

const getPredictedDomHeight = (params: {
  text: string
  containerWidth: number
  font: string
  lineHeight: number
  padding?: string
  border?: {
    top: number
    bottom: number
    left: number
    right: number
  }
}) => {
  let paddingValues = { top: 0, right: 0, bottom: 0, left: 0 }
  let borderValues = { top: 0, bottom: 0, left: 0, right: 0 }

  if (params.padding) {
    paddingValues = parsePadding(params.padding)
  }

  if (params.border) {
    borderValues = params.border
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

// 依据文本 和 css推断dom大小
// 包括 margin
const predictDomSize = getPredictedDomHeight({
  text,
  containerWidth: 300,
  font: '16px Inter',
  lineHeight: 24,
  padding: '30px',
  border: {
    top: 1,
    bottom: 1,
    left: 0,
    right: 0,
  },
})
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
