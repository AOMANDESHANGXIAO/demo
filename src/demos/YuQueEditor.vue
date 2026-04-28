<script setup>
import { ref } from 'vue'
import { parseHtml } from '../utils/parseHtml'

defineOptions({
    name: 'yu-que-editor'
})

const parsedInfo = ref(null)

function handleEditorChange(html) {
    parsedInfo.value = parseHtml(html)
    console.log('解析结果:', parsedInfo.value)
}
</script>

<template>
	<div>
		<div v-if="parsedInfo">
			<h3>解析结果</h3>
			<div>
				<strong>纯文本内容:</strong>
				<pre>{{ parsedInfo.text }}</pre>
			</div>
			<div>
				<strong>标签统计:</strong>
				<pre>{{ JSON.stringify(parsedInfo.tagCounts, null, 2) }}</pre>
			</div>
			<div>
				<strong>所有标签:</strong>
				<pre>{{ JSON.stringify(parsedInfo.tags, null, 2) }}</pre>
			</div>
		</div>
		<button @click="handleEditorChange('<div><h1>标题</h1><p>段落<span>加粗文字</span></p></div>')">
			测试解析
		</button>
	</div>
</template>

<style scoped>

</style>
