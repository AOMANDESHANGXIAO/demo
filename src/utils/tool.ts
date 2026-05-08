import { prepare, layout } from '@chenglou/pretext'
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

export const getTextHeight = (
  text: string,
  params: { containerWidth: number; fontSize: string; lineHeight: number },
) => {
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
    height: number
  },
) => {
  const { containerWidth, fontSize, lineHeight, remainingHeight, height } =
    params
  // const charsThatFit = Math.floor((remainingHeight / height) * text.length)
  // const fittingText = text.slice(0, charsThatFit)
  // const remainingText = text.slice(charsThatFit)
  // const fittingHeight = getTextHeight(fittingText, {
  //   containerWidth,
  //   fontSize,
  //   lineHeight
  // })
  const prepared = prepareWithSegments(text, fontSize)
  const linesLayoutRes = layoutWithLines(prepared, containerWidth, lineHeight)
  console.log('linesLayoutRes', linesLayoutRes)
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
