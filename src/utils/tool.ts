import { prepare, layout } from '@chenglou/pretext'
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

export const getTextHeight = (
  text: string,
  params: { containerWidth: number; fontSize: string; lineHeight: number }
) => {
  // debugger
  // <br/> 是空格，长度为1，但实际占一行
  if (text.length === 1) {
    return params.lineHeight
  }
  const prepared = prepare(text, params.fontSize)
  return layout(prepared, params.containerWidth, params.lineHeight).height
}

export const spliteTextByContainer = (
  text: string,
  params: {
    containerWidth: number
    font: string
    lineHeight: number
    remainingHeight: number
  }
) => {
  const { containerWidth, font, lineHeight, remainingHeight } = params
  const prepared = prepareWithSegments(text, font)
  const linesLayoutRes = layoutWithLines(prepared, containerWidth, lineHeight)
  let fittingText = ''
  let remainingText = ''
  let fittingHeight = 0
  let i = 0
  while (i < linesLayoutRes.lines.length && fittingHeight + lineHeight <= remainingHeight) {
    fittingText += linesLayoutRes.lines[i].text
    fittingHeight += lineHeight
    i++
  }
  remainingText = text.slice(fittingText.length)
  return {
    fittingText,
    remainingText,
    fittingHeight
  }
}

export const getHtmlStringHeight = (htmlString: string) => {
  const tempDiv = document.createElement('div')
  tempDiv.style.position = 'absolute'
  tempDiv.style.visibility = 'hidden'
  tempDiv.style.width = 'auto'
  tempDiv.innerHTML = htmlString
  document.body.appendChild(tempDiv)
  const height = tempDiv.offsetHeight
  document.body.removeChild(tempDiv)
  return height
}
