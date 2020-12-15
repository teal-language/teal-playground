<template>
  <div class="toolbar">
    <select v-model="selectedSnippetLabel" @change="e => $emit('snippetSelected', snippets.find(s => s.label == selectedSnippetLabel))">
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

<style scoped>
.toolbar {
  width: 100%;
  position: absolute;
  height: 39px;
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem 0.5rem;
  border-bottom: 1px solid teal;
  background: black;
}

select:not([type="checkbox"]),
select:not([type="checkbox"]):read-only,
select:not([type="radio"]),
select:not([type="radio"]):read-only {
  height: 30px;
  width: 100px;
  background-color: black;
  color: teal
}
</style>
