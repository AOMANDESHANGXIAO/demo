import { prepare, layout } from '@chenglou/pretext'
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

export const getTextHeight = (
  text: string,
  params: { containerWidth: number; fontSize: string; lineHeight: number },
) => {
  console.log('text',text)
  console.log('text.length',text.length)
  // debugger
  // <br/> 是空格，长度为1，但实际占一行
  if (text.length === 1) {
    console.log('empty text, return line height', params.lineHeight)
    return params.lineHeight
  }
  const prepared = prepare(text, params.fontSize)
  return layout(prepared, params.containerWidth, params.lineHeight).height
}

export const spliteTextByContainer = (
  text: string,
  params: {
    containerWidth: number
    fontSize: string
    lineHeight: number
    remainingHeight: number
  },
) => {
  const { containerWidth, fontSize, lineHeight, remainingHeight } =
    params
  const prepared = prepareWithSegments(text, fontSize)
  const linesLayoutRes = layoutWithLines(prepared, containerWidth, lineHeight)
  let fittingText = ''
  let remainingText = ''
  let fittingHeight = 0
  let i = 0
  while (
    i < linesLayoutRes.lines.length &&
    fittingHeight + lineHeight <= remainingHeight
  ) {
    fittingText += linesLayoutRes.lines[i].text
    fittingHeight += lineHeight
    i++
  }
  remainingText = text.slice(fittingText.length)
  return {
    fittingText,
    remainingText,
    fittingHeight,
  }
}
