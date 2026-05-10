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
export const parseMargin = (marginStr?: string): MarginValues => {
  if (!marginStr) {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }

  // 移除多余空格并按空格分割
  const values = marginStr.trim().split(/\s+/).map(value => parseInt(value, 10))

  let top = 0
  let right = 0
  let bottom = 0
  let left = 0

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

  return {
    top,
    right,
    bottom,
    left,
  }
}

export const parsePadding = parseMargin

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
export const parseBorder = (border: string | number | object | undefined): { top: number; right: number; bottom: number; left: number } => {
  const defaultVal = { top: 0, right: 0, bottom: 0, left: 0 }

  if (!border) return defaultVal

  // 如果已经是对象格式，尝试提取数值
  if (typeof border === 'object') {
    // 假设对象结构可能为 { top: '1px', ... } 或 { top: 1, ... }
    const obj = border as any
    return {
      top: parseFloat(obj.top || obj['border-top'] || 0),
      right: parseFloat(obj.right || obj['border-right'] || 0),
      bottom: parseFloat(obj.bottom || obj['border-bottom'] || 0),
      left: parseFloat(obj.left || obj['border-left'] || 0),
    }
  }

  // 处理字符串
  if (typeof border !== 'string') return defaultVal

  const str = border.trim()
  if (!str) return defaultVal

  // 尝试解析简写边框 'width style color' 或 'width'
  // 这里主要关注宽度部分。CSS border 简写通常是: border: <width> <style> <color>
  // 或者单独指定宽度: border-width: <top> <right> <bottom> <left>
  
  // 简单的启发式解析：
  // 如果包含 'solid', 'dashed' 等关键词，前面的数字通常是统一宽度
  // 如果是纯数字组合，可能是 border-width 的简写
  
  const parts = str.split(/\s+/)
  const numbers = parts.map(p => parseFloat(p)).filter(n => !isNaN(n))

  if (numbers.length === 0) return defaultVal

  // 如果只有一个数字，通常代表四边相同
  if (numbers.length === 1) {
    return {
      top: numbers[0],
      right: numbers[0],
      bottom: numbers[0],
      left: numbers[0],
    }
  }

  // 如果有多个数字，按照 CSS margin/padding/border-width 的规则解析:
  // 1 value: all
  // 2 values: top/bottom, left/right
  // 3 values: top, left/right, bottom
  // 4 values: top, right, bottom, left
  
  const [v1, v2, v3, v4] = numbers

  if (numbers.length === 2) {
    return {
      top: v1,
      right: v2,
      bottom: v1,
      left: v2,
    }
  }

  if (numbers.length === 3) {
    return {
      top: v1,
      right: v2,
      bottom: v3,
      left: v2,
    }
  }

  if (numbers.length >= 4) {
    return {
      top: v1,
      right: v2,
      bottom: v3,
      left: v4,
    }
  }

  return defaultVal
}
