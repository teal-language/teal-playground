<template>
  <div class="border-b-2 border-teal-600 bg-black w-full absolute h-12 flex items-center p-2">
    <select
      class="text-teal-600 bg-black bg-opacity-0 p-1"
      v-model="selectedSnippetLabel"
      @change="e => $emit('snippetSelected', snippets.find(s => s.label == selectedSnippetLabel))"
    >
      <option v-for="snippet in snippets" v-bind:value="snippet.label" :key="snippet.label">
        {{ snippet.label }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from '@vue/composition-api'
import snippets from '@/snippets'
import { Snippet } from '../../types/index'

export default defineComponent({
  name: 'Toolbar',
  setup () {
    const selectableSnippets = ref<Snippet[]>(Object.values(snippets))
    const selectedSnippetLabel = ref(selectableSnippets.value[0].label)

    return {
      snippets: selectableSnippets,
      selectedSnippetLabel
    }
  }
})
</script>
