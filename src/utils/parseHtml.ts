export interface TagInfo {
    tagName: string
    className?: string
    id?: string
    depth: number
    innerText?: string
    content?: string
}

export interface ParseHtmlResult {
    text: string
    html: string
    tags: TagInfo[]
    tagCounts: Record<string, number>
}

export function parseHtml(htmlString: string): ParseHtmlResult {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlString, 'text/html')

    const result: ParseHtmlResult = {
        text: doc.body.innerText,
        html: doc.body.innerHTML,
        tags: [],
        tagCounts: {}
    }

    function traverse(node: Node, depth: number = 0): void {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement
            result.tags.push({
                tagName: element.tagName,
                className: element.className || undefined,
                id: element.id || undefined,
                depth: depth,
                innerText: element.innerText
            })
            result.tagCounts[element.tagName] = (result.tagCounts[element.tagName] || 0) + 1
        }
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent?.trim() || ''
            if (text) {
                result.tags.push({
                    tagName: '#text',
                    content: text,
                    depth: depth
                })
            }
        }
        for (const child of node.childNodes) {
            traverse(child, depth + 1)
        }
    }

    traverse(doc.body)
    return result
}

export function extractTextNodes(htmlString: string): string[] {
    const result = parseHtml(htmlString)
    return result.tags
        .filter(tag => tag.tagName === '#text')
        .map(tag => tag.content || '')
}

export function extractHeadings(htmlString: string): TagInfo[] {
    const result = parseHtml(htmlString)
    return result.tags.filter(tag =>
        ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(tag.tagName)
    )
}

export function getTagStatistics(htmlString: string): Record<string, number> {
    return parseHtml(htmlString).tagCounts
}

export interface YuqueBlock {
    tagName: string
    id?: string
    dataLakeId?: string
    innerText: string
    outerHTML: string
}

export interface ParseYuqueHtmlResult {
    blocks: YuqueBlock[]
    html: string
}

const BLOCK_TAGS = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'UL', 'OL', 'LI', 'TABLE', 'THEAD', 'TBODY', 'TR', 'DIV', 'SECTION', 'ARTICLE']

function isBlockElement(tagName: string): boolean {
    return BLOCK_TAGS.includes(tagName.toUpperCase())
}

export function parseYuqueHtml(htmlString: string): ParseYuqueHtmlResult {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlString, 'text/html')

    const blocks: YuqueBlock[] = []

    function extractBlocksFromNode(node: Node): void {
        if (node.nodeType !== Node.ELEMENT_NODE) return

        const element = node as HTMLElement

        if (isBlockElement(element.tagName)) {
            const block: YuqueBlock = {
                tagName: element.tagName,
                id: element.id || undefined,
                dataLakeId: element.getAttribute('data-lake-id') || undefined,
                innerText: element.innerText,
                outerHTML: element.outerHTML
            }
            blocks.push(block)
            return
        }

        for (const child of node.childNodes) {
            extractBlocksFromNode(child)
        }
    }

    extractBlocksFromNode(doc.body)

    return {
        blocks,
        html: doc.body.innerHTML
    }
}

export function extractYuqueTextInOrder(htmlString: string): string[] {
    const { blocks } = parseYuqueHtml(htmlString)
    return blocks.map(block => block.innerText)
}

export function removeHtmlAttributes(htmlString: string): string {
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlString, 'text/html')

    function removeAttributesFromElement(element: Element): void {
        const attrsToRemove: string[] = []
        for (const attr of element.attributes) {
            if (attr.name === 'id' || attr.name === 'class' || attr.name === 'data-lake-id') {
                attrsToRemove.push(attr.name)
            }
        }
        for (const attrName of attrsToRemove) {
            element.removeAttribute(attrName)
        }
        for (const child of element.children) {
            removeAttributesFromElement(child)
        }
    }

    removeAttributesFromElement(doc.body)

    return doc.body.innerHTML
}
