import { prepare, layout } from '@chenglou/pretext'
import {
  prepareWithSegments,
  walkLineRanges,
} from '@chenglou/pretext';

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



/**
 * 根据固定宽高，截取能完全显示的最长文本
 * @param text 原始长文本
 * @param font CSS 字体字符串，例如 "16px Inter"
 * @param containerWidth 容器宽度
 * @param containerHeight 容器高度
 * @param lineHeight 行高
 * @returns 能完全显示的文本 + 剩余文本
 */
export function getMaxVisibleText(
  text: string,
  font: string,
  containerWidth: number,
  containerHeight: number,
  lineHeight: number
) {
  // 1. 预处理文本（只做一次，性能极高）
  const prepared = prepareWithSegments(text, font, {
    whiteSpace: 'normal',
    wordBreak: 'normal',
  });

  // 2. 计算最多能渲染多少行
  const maxLines = Math.floor(containerHeight / lineHeight);
  if (maxLines <= 0) return { visibleText: '', remainingText: text };

  let lineCount = 0;
  let lastEndCursor = null;

  // 3. 遍历行，直到达到最大行数
  walkLineRanges(prepared, containerWidth, (lineRange) => {
    if (lineCount >= maxLines) return;

    lastEndCursor = lineRange.end;
    lineCount++;
  });

  if (!lastEndCursor) {
    return { visibleText: '', remainingText: text };
  }

  // 4. 从开头截取到最后一个可见字符
  const visibleText = text.substring(0, lastEndCursor.graphemeIndex);
  const remainingText = text.substring(lastEndCursor.graphemeIndex);

  return {
    visibleText,
    remainingText,
    renderedLines: lineCount,
    maxLines,
  };
}