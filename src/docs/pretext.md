# Pretext 中文文档
## 前言
Pretext 是一款纯 JavaScript / TypeScript 编写的**多行文本测量与排版**工具库。性能极速、测量精准，支持各类冷门语种。可渲染至 DOM、Canvas、SVG，服务端渲染能力也即将上线。

Pretext 规避了传统通过 DOM 接口（如 `getBoundingClientRect`、`offsetHeight`）测量文本的方式——这类接口会触发浏览器**布局重排**，是浏览器中性能开销极高的操作。库内部自研文本测量逻辑，以浏览器原生字体引擎作为基准校准，非常适配 AI 迭代开发场景。

## 安装
```sh
npm install @chenglou/pretext
```

## 示例演示
1. 克隆仓库，执行 `bun install` 安装依赖，再运行 `bun start`，在浏览器打开 `/demos/index` 即可查看示例。
   Windows 系统请使用命令：`bun run start:windows`。
2. 在线预览：
   - 官方演示：[chenglou.me/pretext](https://chenglou.me/pretext/)
   - 更多拓展示例：[somnai-dreams.github.io/pretext-demos](https://somnai-dreams.github.io/pretext-demos/)

## API 使用说明
Pretext 主要适配两大使用场景：

### 场景一：不操作任何 DOM，直接计算段落文本高度
```ts
import { prepare, layout } from '@chenglou/pretext'

const prepared = prepare('AGI 春天到了. بدأت الرحلة 🚀‎', '16px Inter')
// 纯数学计算，无 DOM 布局与重排
const { height, lineCount } = layout(prepared, 320, 20)
```

- `prepare()`：一次性预处理工作——标准化空白符、文本分词、应用排版规则、通过 Canvas 测量文本片段，返回一个不透明的预处理句柄。
- `layout()`：轻量化高频调用接口，基于已缓存的文本宽度做纯数学排版计算。

**使用建议**：同一文本和字体配置无需重复执行 `prepare()`，否则会失去预计算意义；例如窗口大小变化时，只需重新调用 `layout()` 即可。

#### 保留换行/空格样式
若需要实现文本域（textarea）效果，保留普通空格、`\t` 制表符、`\n` 硬换行可见，向 `prepare()` 传入配置 `{ whiteSpace: 'pre-wrap' }`：
```ts
const prepared = prepare(textareaValue, '16px Inter', { whiteSpace: 'pre-wrap' })
const { height } = layout(prepared, textareaWidth, 20)
```

#### 其他配置项
- `{ wordBreak: 'keep-all' }`：等同于 CSS `word-break: keep-all` 排版规则
- `{ letterSpacing: n }`：匹配 CSS 字间距，数值单位为像素

#### 高度计算的业务价值
- 无需预估和缓存，即可实现精准的列表虚拟渲染/区域遮挡
- 实现瀑布流、JS 自定义弹性布局等高阶排版，无需 CSS hack 技巧微调布局
- 开发阶段快速校验（尤其 AI 场景）按钮标签等文本是否溢出换行，脱离浏览器也可校验
- 新文本加载时预判高度，避免布局偏移、精准锚定滚动位置

### 场景二：手动自定义段落分行排版
将 `prepare` 替换为 `prepareWithSegments`，即可实现精细化手动排版：

#### 1. 固定宽度获取完整分行文本
```ts
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'

const prepared = prepareWithSegments('AGI 春天到了. بدأت الرحلة 🚀', '18px "Helvetica Neue"')
// 最大宽度320px，行高26px
const { lines } = layoutWithLines(prepared, 320, 26)
for (let i = 0; i < lines.length; i++) ctx.fillText(lines[i].text, 0, i * 26)
```

#### 2. 仅统计行数/行宽，不生成文本字符串
`measureLineStats()`、`walkLineRanges()` 可快速获取行数、最大行宽、文本光标范围，无需拼接文本：
```ts
import { measureLineStats, walkLineRanges } from '@chenglou/pretext'

const { lineCount, maxLineWidth } = measureLineStats(prepared, 320)
let maxW = 0
walkLineRanges(prepared, 320, line => { if (line.width > maxW) maxW = line.width })
// maxW 即为适配文本的最小容器宽度，实现原生 Web 缺失的文本「自适应收缩包裹」效果
```

#### 3. 逐行流式排版（动态宽度）
`layoutNextLineRange()` 支持**逐行逐行**流式布局，适配宽度动态变化场景；`materializeLineRange()` 可将分行范围还原为完整行文本：
```ts
import { layoutNextLineRange, materializeLineRange, prepareWithSegments, type LayoutCursor } from '@chenglou/pretext'

const prepared = prepareWithSegments(article, BODY_FONT)
let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 }
let y = 0

// 图文环绕排版：图片旁的行宽度自适应收窄
while (true) {
  const width = y < image.bottom ? columnWidth - image.width : columnWidth
  const range = layoutNextLineRange(prepared, cursor, width)
  if (range === null) break

  const line = materializeLineRange(prepared, range)
  ctx.fillText(line.text, 0, y)
  cursor = range.end
  y += 26
}
```

该用法支持 Canvas、SVG、WebGL 渲染，未来也将支持服务端渲染，可参考 `/demos/dynamic-layout` 示例。

#### 断字换行规则
手动排版如需连字符断行，可在 `prepare()` / `prepareWithSegments()` **之前**手动插入软连字符。
- 未选中的软连字符自动隐藏；选中作为换行点时，末尾自动渲染 `-` 连字符。
- 库暂未内置自动断字功能，多语言/用户生成文本建议使用保守的本地化断字规则，而非激进正则断字。

#### 富文本行内排版工具
内置 `@chenglou/pretext/rich-inline` 工具，适配富文本行内排版：代码片段、@提及、标签块、浏览器原生空白折叠等场景。**仅支持行内元素、仅 `white-space: normal` 模式**：
```ts
import { materializeRichInlineLineRange, prepareRichInline, walkRichInlineLineRanges } from '@chenglou/pretext/rich-inline'

const prepared = prepareRichInline([
  { text: 'Ship ', font: '500 17px Inter' },
  { text: '@maya', font: '700 12px Inter', break: 'never', extraWidth: 22 },
  { text: "'s rich-note", font: '500 17px Inter' },
])

walkRichInlineLineRanges(prepared, 320, range => {
  const line = materializeRichInlineLineRange(prepared, range)
  // 每个文本片段保留源索引、文本片段、前置间距、光标位置等信息
})
```

工具设计定位：
- 仅处理原生行内文本与边界空白折叠
- 自定义标签外边框宽度由业务通过 `extraWidth` 配置
- `break: 'never'` 锁定原子元素（标签、@提及等不可换行）
- 仅支持 `white-space: normal`
- 非嵌套标签树、非完整 CSS 行内排版引擎

### API 类型释义
#### 场景一 基础类型
```ts
// 一次性文本分析与测量，返回不透明句柄传给 layout
prepare(text: string, font: string, options?: { 
  whiteSpace?: 'normal' | 'pre-wrap', 
  wordBreak?: 'normal' | 'keep-all', 
  letterSpacing?: number 
}): PreparedText 

// 根据最大宽度、行高计算文本总高度与行数
layout(prepared: PreparedText, maxWidth: number, lineHeight: number): { height: number, lineCount: number }
```

#### 场景二 手动排版核心类型
```ts
// 带文本片段信息的预处理句柄，用于手动分行
prepareWithSegments(text: string, font: string, options?: { 
  whiteSpace?: 'normal' | 'pre-wrap', 
  wordBreak?: 'normal' | 'keep-all', 
  letterSpacing?: number 
}): PreparedTextWithSegments

// 固定宽度获取完整分行信息
layoutWithLines(prepared: PreparedTextWithSegments, maxWidth: number, lineHeight: number): { 
  height: number, 
  lineCount: number, 
  lines: LayoutLine[] 
}

// 遍历分行范围，不生成文本字符串，仅回调每行宽度与光标
walkLineRanges(prepared: PreparedTextWithSegments, maxWidth: number, onLine: (line: LayoutLineRange) => void): number

// 仅统计行数、最大行宽，不分配行内存
measureLineStats(prepared: PreparedTextWithSegments, maxWidth: number): { lineCount: number, maxLineWidth: number }

// 获取文本无强制换行时的原生最大行宽
measureNaturalWidth(prepared: PreparedTextWithSegments): number

// 迭代式逐行排版，返回完整行对象
layoutNextLine(prepared: PreparedTextWithSegments, start: LayoutCursor, maxWidth: number): LayoutLine | null

// 迭代式逐行排版，仅返回范围不生成文本
layoutNextLineRange(prepared: PreparedTextWithSegments, start: LayoutCursor, maxWidth: number): LayoutLineRange | null

// 将分行范围还原为完整行文本
materializeLineRange(prepared: PreparedTextWithSegments, line: LayoutLineRange): LayoutLine
```

##### 通用类型定义
```ts
// 行统计信息
type LineStats = {
  lineCount: number       // 换行后的总行数
  maxLineWidth: number   // 最宽行的像素宽度
}

// 完整行对象
type LayoutLine = {
  text: string           // 本行完整文本
  width: number          // 本行测量宽度
  start: LayoutCursor    // 起始光标（包含）
  end: LayoutCursor      // 结束光标（不包含）
}

// 分行范围对象（无完整文本）
type LayoutLineRange = {
  width: number
  start: LayoutCursor
  end: LayoutCursor
}

// 文本光标：片段索引 + 字符簇索引
type LayoutCursor = {
  segmentIndex: number   // 文本片段下标
  graphemeIndex: number  // 片段内字符簇下标
}
```

#### 富文本行内排版类型
```ts
// 编译富文本行内元素
prepareRichInline(items: RichInlineItem[]): PreparedRichInline

// 逐行获取富文本分行范围
layoutNextRichInlineLineRange(prepared: PreparedRichInline, maxWidth: number, start?: RichInlineCursor): RichInlineLineRange | null

// 遍历富文本分行范围
walkRichInlineLineRanges(prepared: PreparedRichInline, maxWidth: number, onLine: (line: RichInlineLineRange) => void): number

// 还原富文本分行范围为完整片段
materializeRichInlineLineRange(prepared: PreparedRichInline, line: RichInlineLineRange): RichInlineLine

// 仅统计富文本行数、最大行宽
measureRichInlineStats(prepared: PreparedRichInline, maxWidth: number): { lineCount: number, maxLineWidth: number }
```

##### 富文本相关类型
```ts
// 富文本行内元素配置
type RichInlineItem = {
  text: string                // 原始文本（含首尾可折叠空白）
  font: string                // Canvas 字体简写
  letterSpacing?: number      // 字间距（像素）
  break?: 'normal' | 'never'  // never 设为原子不可换行元素
  extraWidth?: number         // 自定义额外宽度（内边距、边框等）
}

// 富文本光标
type RichInlineCursor = {
  itemIndex: number
  segmentIndex: number
  graphemeIndex: number
}

// 富文本片段
type RichInlineFragment = {
  itemIndex: number
  text: string
  gapBefore: number
  occupiedWidth: number
  start: LayoutCursor
  end: LayoutCursor
}

// 富文本完整行
type RichInlineLine = {
  fragments: RichInlineFragment[]
  width: number
  end: RichInlineCursor
}

// 富文本片段范围（无文本）
type RichInlineFragmentRange = {
  itemIndex: number
  gapBefore: number
  occupiedWidth: number
  start: LayoutCursor
  end: LayoutCursor
}

// 富文本分行范围
type RichInlineLineRange = {
  fragments: RichInlineFragmentRange[]
  width: number
  end: RichInlineCursor
}

type RichInlineStats = {
  lineCount: number
  maxLineWidth: number
}
```

#### 通用工具方法
```ts
// 清空内部字体/文本缓存，多字体场景可手动释放内存
clearCache(): void 

// 设置本地化语言，重置缓存，影响后续预处理
setLocale(locale?: string): void 
```

## 注意事项
1. `PreparedText` 为高速预计算句柄；`PreparedTextWithSegments` 为手动排版专用完整句柄。
2. `LayoutCursor` 基于**文本片段/字符簇**定位，非原始字符串下标偏移。
3. 空文本调用 `layout()` 返回 `{ lineCount: 0, height: 0 }`；浏览器空元素默认占一行高度，可通过 `Math.max(1, lineCount) * lineHeight` 对齐原生表现。
4. 完整句柄包含双向排版层级 `segLevels`，供自定义双向文字渲染，分行 API 不会读取该字段。
5. 文本片段宽度基于 Canvas 测量，暂不支持阿拉伯文等复杂字形精准坐标重构。
6. 软连字符作为换行点时，行尾自动渲染 `-` 符号。
7. `measureNaturalWidth()` 会计入硬换行产生的强制分行宽度。
8. `prepare` 系列方法仅做**水平排版预处理**，行高 `lineHeight` 仅在布局阶段传入。

## 限制与兼容说明
Pretext 目前暂非完整字体渲染引擎，仅适配主流文本排版场景：
- 支持：`white-space: normal` / `pre-wrap`、`word-break: normal` / `keep-all`、`overflow-wrap: break-word`、`line-break: auto`
- 字间距通过 `prepare` 传入像素数值配置
- 制表符默认遵循浏览器 `tab-size: 8` 规则
- `keep-all` 适配中日韩、韩文及无空格多语言混排，超长文本自动降级 `break-word`
- macOS 下 `system-ui` 字体测量精度不足，建议使用具体字体名
- 运行环境依赖：`Intl.Segmenter` + Canvas 2D 文本测量，不支持无该 API 的老旧运行时
- 不单独适配 Canvas 字体简写以外的 CSS 字体特性（如 `font-optical-sizing`、可变字体高级轴参数），仅支持简写内权重等基础配置

## 开发贡献
开发环境配置与命令详见：[DEVELOPMENT.md](https://github.com/chenglou/pretext/blob/main/DEVELOPMENT.md)

## 致谢
本库架构灵感源于 Sebastian Markbage 早年开源的 [text-layout](https://github.com/chenglou/text-layout)，沿用了 Canvas 字形测量、pdf.js 双向文字算法、流式分行等核心设计理念并持续迭代优化。
