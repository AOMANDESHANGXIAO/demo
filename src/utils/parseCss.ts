import _ from 'lodash'

interface MarginValues {
  top: number
  right: number
  bottom: number
  left: number
}

/**
 * 解析 CSS margin 字符串，返回 top, right, bottom, left 的值
 * @param marginStr CSS margin 字符串，例如 "10px", "10px 20px", "10px 20px 30px", "10px 20px 30px 40px"
 * @returns 包含 top, right, bottom, left 的对象
 */
export const parseMargin = (styleObj: Record<string, string>): MarginValues => {
  // 从 styleObj 中获取 margin 属性值
  // it might be : margin, margin-top, margin-right, margin-bottom, margin-left
  // marginTop、marginRight、marginBottom、marginLeft 也是支持的
  let top = 0
  let right = 0
  let bottom = 0
  let left = 0
  let marginStr = ''
  if (_.has(styleObj, 'margin')) {
    marginStr = styleObj['margin']

    // 移除多余空格并按空格分割
    const values = marginStr
      .trim()
      .split(/\s+/)
      .map(value => parseInt(value, 10))

    switch (values.length) {
      case 1:
        // margin: 10px -> 所有方向都是 10px
        top = right = bottom = left = values[0]
        break
      case 2:
        // margin: 10px 20px -> 上下 10px, 左右 20px
        top = bottom = values[0]
        right = left = values[1]
        break
      case 3:
        // margin: 10px 20px 30px -> 上 10px, 左右 20px, 下 30px
        top = values[0]
        right = left = values[1]
        bottom = values[2]
        break
      case 4:
        // margin: 10px 20px 30px 40px -> 上 10px, 右 20px, 下 30px, 左 40px
        top = values[0]
        right = values[1]
        bottom = values[2]
        left = values[3]
        break
      default:
        // 如果格式不正确，返回默认值或尝试取第一个值
        top = right = bottom = left = values[0] || 0
    }
  }
  if (_.has(styleObj, 'margin-top') || _.has(styleObj, 'marginTop')) {
    top = parseInt(styleObj['margin-top'] || styleObj['marginTop'], 10) || 0
  }
  if (_.has(styleObj, 'margin-right') || _.has(styleObj, 'marginRight')) {
    right =
      parseInt(styleObj['margin-right'] || styleObj['marginRight'], 10) || 0
  }
  if (_.has(styleObj, 'margin-bottom') || _.has(styleObj, 'marginBottom')) {
    bottom =
      parseInt(styleObj['margin-bottom'] || styleObj['marginBottom'], 10) || 0
  }
  if (_.has(styleObj, 'margin-left') || _.has(styleObj, 'marginLeft')) {
    left = parseInt(styleObj['margin-left'] || styleObj['marginLeft'], 10) || 0
  }
  console.log('Parsed margin values:', { top, right, bottom, left })

  return {
    top,
    right,
    bottom,
    left,
  }
}

export const parsePadding = (
  styleObj: Record<string, string>,
): MarginValues => {
  // 从 styleObj 中获取 margin 属性值
  // it might be : margin, margin-top, margin-right, margin-bottom, margin-left
  // marginTop、marginRight、marginBottom、marginLeft 也是支持的
  let top = 0
  let right = 0
  let bottom = 0
  let left = 0
  let paddingStr = ''
  if (_.has(styleObj, 'padding')) {
    paddingStr = styleObj['padding']

    // 移除多余空格并按空格分割
    const values = paddingStr
      .trim()
      .split(/\s+/)
      .map(value => parseInt(value, 10))

    switch (values.length) {
      case 1:
        // padding: 10px -> 所有方向都是 10px
        top = right = bottom = left = values[0]
        break
      case 2:
        // padding: 10px 20px -> 上下 10px, 左右 20px
        top = bottom = values[0]
        right = left = values[1]
        break
      case 3:
        // padding: 10px 20px 30px -> 上 10px, 左右 20px, 下 30px
        top = values[0]
        right = left = values[1]
        bottom = values[2]
        break
      case 4:
        // padding: 10px 20px 30px 40px -> 上 10px, 右 20px, 下 30px, 左 40px
        top = values[0]
        right = values[1]
        bottom = values[2]
        left = values[3]
        break
      default:
        // 如果格式不正确，返回默认值或尝试取第一个值
        top = right = bottom = left = values[0] || 0
    }
  }
  if (_.has(styleObj, 'padding-top') || _.has(styleObj, 'paddingTop')) {
    top = parseInt(styleObj['padding-top'] || styleObj['paddingTop'], 10) || 0
  }
  if (_.has(styleObj, 'padding-right') || _.has(styleObj, 'paddingRight')) {
    right =
      parseInt(styleObj['padding-right'] || styleObj['paddingRight'], 10) || 0
  }
  if (_.has(styleObj, 'padding-bottom') || _.has(styleObj, 'paddingBottom')) {
    bottom =
      parseInt(styleObj['padding-bottom'] || styleObj['paddingBottom'], 10) || 0
  }
  if (_.has(styleObj, 'padding-left') || _.has(styleObj, 'paddingLeft')) {
    left =
      parseInt(styleObj['padding-left'] || styleObj['paddingLeft'], 10) || 0
  }
  console.log('Parsed padding values:', { top, right, bottom, left })

  return {
    top,
    right,
    bottom,
    left,
  }
}

/**
 * 解析 CSS border 属性值
 * 支持格式:
 * - '1px solid red' (简写)
 * - '1px' (仅宽度)
 * - 'top right bottom left' (不同方向宽度，如 '1px 2px 3px 4px')
 * - object 输入直接返回标准化对象
 *
 * @param border - CSS border 字符串或对象
 * @returns { top, right, bottom, left } 数值对象 (单位 px)
 */
export const parseBorder = (
  styleObj: Record<string, string>,
): { top: number; right: number; bottom: number; left: number } => {
  const defaultVal = { top: 0, right: 0, bottom: 0, left: 0 }

  if (_.isEmpty(styleObj)) return defaultVal

  if (_.has(styleObj, 'border-top') || _.has(styleObj, 'borderTop')) {
    // border-top: 1px solid red
    const borderTopStr = styleObj['border-top'] || styleObj['borderTop']
    const topMatch = borderTopStr.match(/(\d+)px/)
    if (topMatch) {
      defaultVal.top = parseInt(topMatch[1], 10)
    }
  }

  if (_.has(styleObj, 'border-right') || _.has(styleObj, 'borderRight')) {
    // border-right: 1px solid red
    const borderRightStr = styleObj['border-right'] || styleObj['borderRight']
    const rightMatch = borderRightStr.match(/(\d+)px/)
    if (rightMatch) {
      defaultVal.right = parseInt(rightMatch[1], 10)
    }
  }
  if (_.has(styleObj, 'border-bottom') || _.has(styleObj, 'borderBottom')) {
    // border-bottom: 1px solid red
    const borderBottomStr =
      styleObj['border-bottom'] || styleObj['borderBottom']
    const bottomMatch = borderBottomStr.match(/(\d+)px/)
    if (bottomMatch) {
      defaultVal.bottom = parseInt(bottomMatch[1], 10)
    }
  }
  if (_.has(styleObj, 'border-left') || _.has(styleObj, 'borderLeft')) {
    // border-left: 1px solid red
    const borderLeftStr = styleObj['border-left'] || styleObj['borderLeft']
    const leftMatch = borderLeftStr.match(/(\d+)px/)
    if (leftMatch) {
      defaultVal.left = parseInt(leftMatch[1], 10)
    }
  }
  if (_.has(styleObj, 'border')) {
    // border: 1px solid red
    const borderStr = styleObj['border']
    const borderMatch = borderStr.match(/(\d+)px/)
    // 区分简写和单值
    if (borderMatch) {
      defaultVal.top =
        defaultVal.right =
        defaultVal.bottom =
        defaultVal.left =
          parseInt(borderMatch[1], 10)
    }
  }
  console.log('Parsed border values:', defaultVal)
  return defaultVal
}
