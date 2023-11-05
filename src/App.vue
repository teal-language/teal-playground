<template>
  <div id="app" class="flex bg-black font-mono h-screen m-0 p-0">
    <GitHubCorner repo="https://github.com/teal-language/teal-playground" />
    <Storage
      v-slot="{ load, save }"
      type="localStorage"
    >
      <TealPlayground
        :initialData="load"
        @input="save"
      />
    </Storage>
  </div>
</template>

<script lang="ts">
import GitHubCorner from '@/components/GitHubCorner.vue'
import TealPlayground from '@/components/TealPlayground.vue'
import Storage from '@/Storage/components/Storage'

export default {
  components: {
    TealPlayground,
    GitHubCorner,
    Storage
  }
}
</script>
