<script setup lang="ts">
import { YuqueRichText } from 'yuque-rich-text';
import { ref} from 'vue';
import {parseHtml} from './utils/parseHtml'
defineOptions({
    name: 'app'
})
const text = ref('');
const handleChange = (value:string) => {
  const parsedInfo = parseHtml(value)
  console.log(parsedInfo)
}
</script>

<template>
  <div class="editor">
    <YuqueRichText v-model="text" @onChange="handleChange"/>
  </div>
</template>

<style scoped>
.editor {
  width: 100vw;
  height: vh;
}
</style>
