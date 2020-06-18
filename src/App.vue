<template>
  <div id="app">
    <GitHubCorner repo="https://github.com/teal-language/teal-playground" />
    <Playground />
  </div>
</template>

<script lang="ts">
import GitHubCorner from '@/components/GitHubCorner.vue'
import Playground from '@/components/Playground.vue'

export default {
  components: {
    Playground,
    GitHubCorner
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display: flex;
  flex: 1;
}
body {
  display: flex;
  -ms-flex-direction: column;
  flex-direction: column;
  min-height: 100%;
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font: normal 16px/1.4em -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", Arial, sans-serif;
  text-rendering: optimizeLegibility;
}
</style>
