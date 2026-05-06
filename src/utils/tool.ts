import { prepare, layout } from '@chenglou/pretext'

export const getTextHeight = (
  text: string,
  params: { containerWidth: number; fontSize: string; lineCount: number }
) => {
  const prepared = prepare(text, params.fontSize)
  return layout(prepared, params.containerWidth, params.lineCount).height
}

export const loadFile = function (name: string) {
  let xhr = new XMLHttpRequest()
  const okStatus = document.location.protocol === 'file:' ? 0 : 200
  xhr.open('GET', name, false)
  xhr.overrideMimeType('text/plain; charset=utf-8')
  xhr.send(null)
  return xhr.status == okStatus ? xhr.responseText : ''
}
