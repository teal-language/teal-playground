<template>
  <div id="playground">
    <MonacoEditor
      class="editor-left"
      v-model="code"
      theme="hc-black"
      :options="editorOptions"
      language="lua"
      @editorDidMount="editorDidMount" />
    <MonacoEditor
      class="editor-right"
      v-model="output"
      theme="hc-black"
      :options="editorOptions"
      language="lua"
      @editorDidMount="editorDidMount" />
    <transition name="fade">
      <div v-if="syntaxErrors || loadError" class="error">
        {{loadError || syntaxErrors}}
      </div>
    </transition>
    <transition name="fade">
      <div v-if="typeErrors" class="type-error">
        {{typeErrors}}
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import MonacoEditor from 'vue-monaco'
import { editor } from 'monaco-editor'
import * as fengari from 'fengari-web'

const tl = `
local tl = require('tl')

function gen (code_str)
  local output, result = tl.gen(code_str)
  return output, result
end

local output, result = gen([[%code%]])
local syntax_error = tl.error_string('syntax', result.syntax_errors)
local type_error = tl.error_string('type', result.type_errors)

return { output, syntax_error, type_error }
`

export default Vue.extend({
  name: 'Playground',
  components: { MonacoEditor },
  data () {
    return {
      code: 'local message:string = "hello world"',
      output: 'local message:string = "hello world"',
      syntaxErrors: null,
      typeErrors: null,
      loadError: null,
      editorInput: null as editor.IStandaloneCodeEditor | null,
      editorOutput: null as editor.IStandaloneCodeEditor | null,
      editorOptions: {
        fontSize: '20px',
        minimap: {
          enabled: false
        }
      }
    }
  },
  watch: {
    code: {
      immediate: true,
      deep: true,
      handler (newValue: string): void {
        try {
          if (newValue === '') {
            this.output = ''
            return
          }
          const out = fengari.load(tl.replace('%code%', newValue))()
          this.loadError = null
          this.output = out.get(1) || this.output
          this.syntaxErrors = out.get(2) || null
          this.typeErrors = out.get(3) || null
        } catch (err) {
          this.loadError = err
          console.log(err)
        }
      }
    }
  },

  methods: {
    editorDidMount (editor: editor.IStandaloneCodeEditor): void {
      const isInput = parseInt(editor.getId().split(':')[1]) % 2 === 0

      if (isInput) {
        this.editorInput = editor
      } else {
        this.editorOutput = editor
      }
    }
  },

  mounted (): void {
    window.onresize = () => {
      console.log(window.innerWidth / 2)
      if (this.editorInput && this.editorOutput && window) {
        this.editorInput.layout({ width: window.innerWidth / 2, height: window.innerHeight })
        this.editorOutput.layout({ width: window.innerWidth / 2, height: window.innerHeight })
      }
    }
  }
  // const timeout = ref(null)

  // onMounted(() => {
  // const inputEditor = monaco.editor.create(document.getElementById('input'), {
  //   value: code.value,
  //   language: 'lua',
  //   minimap: {
  //     enabled: false
  //   }
  // })
  // const outputEditor = monaco.editor.create(document.getElementById('output'), {
  //   value: code.value,
  //   language: 'lua',
  //   readOnly: true,
  //   minimap: {
  //     enabled: false
  //   }
  // })
  // window.addEventListener('keyup', (ev) => {
  //   if (timeout.value) {
  //     clearTimeout(timeout.value)
  //   }
  //   timeout.value = setTimeout(() => {
  //     code.value = inputEditor.getValue()
  //     // @ts-ignore
  //     outputEditor.setValue(output.value)
  //   }, 250)
  // })
  // })
})
</script>

<style>
#playground {
  display: flex;
  flex: 1;
  font-size: 20px;
}

.editor-left, .editor-right {
  flex: 1 1 30%;
  width: 50%;
}

.error {
  background-color: #f47171;
  font-family: monospace;
  color: white;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: auto;
  display: flex;
  align-items: center;
  padding: 1rem 2rem 1rem;
}
.type-error {
  background-color: #0089eb;
  display: flex;
  align-items: center;
  padding: 1rem 2rem 1rem;
  font-family: monospace;
  color: white;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: auto;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
