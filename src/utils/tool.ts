import { prepare, layout } from '@chenglou/pretext'
import { prepareWithSegments, walkLineRanges } from '@chenglou/pretext'

export const getTextHeight = (
  text: string,
  params: { containerWidth: number; fontSize: string; lineHeight: number }
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
  }
) => {
  const { containerWidth, fontSize, lineHeight, remainingHeight, height } = params
  const charsThatFit = Math.floor((remainingHeight / height) * text.length)
  const fittingText = text.slice(0, charsThatFit)
  const remainingText = text.slice(charsThatFit)
  const fittingHeight = getTextHeight(fittingText, {
    containerWidth,
    fontSize,
    lineHeight
  })
  return {
    fittingText,
    remainingText,
    fittingHeight
  }
}
