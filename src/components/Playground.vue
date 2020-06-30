<template>
  <div id="playground">
    <Toolbar @snippetSelected="snippet => (input = snippet.code)" />
    <div class="editors">
      <MonacoEditor
        class="editor-left"
        v-model="input"
        theme="hc-black"
        :options="editorOptions"
        language="lua"
        @editorDidMount="editorDidMount" />
      <MonacoEditor
        class="editor-right"
        v-model="output"
        theme="hc-black"
        :options="editorOptionsOutput"
        language="lua"
        @editorDidMount="editorDidMount" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import MonacoEditor from 'vue-monaco'
import { editor, Range, Position } from 'monaco-editor'
import * as fengari from 'fengari-web'
import basic from '@/snippets/basic'
import Toolbar from '@/components/Toolbar.vue'

const tl = `
package.path = "https://raw.githubusercontent.com/teal-language/tl/master/?.lua"
os = { getenv = function (str) return '' end }
local tl = require('tl')

local env = tl.init_env(false, true)
local output, result = tl.gen([[%input%]], env)

return { output, result.syntax_errors, result.type_errors }
`

export default Vue.extend({
  name: 'Playground',
  components: { MonacoEditor, Toolbar },
  data () {
    return {
      input: `${basic.code}`,
      output: '',
      syntaxErrors: null,
      typeErrors: null,
      loadError: null,
      decorations: [] as string[],
      editorInput: null as editor.IStandaloneCodeEditor | null,
      editorOutput: null as editor.IStandaloneCodeEditor | null,
      editorOptions: {
        fontSize: 20,
        minimap: {
          enabled: false
        },
        renderIndentGuides: false
      } as editor.IEditorOptions
    }
  },
  computed: {
    editorOptionsOutput (): editor.IEditorOptions {
      return {
        ...this.editorOptions,
        readOnly: true
      }
    }
  },
  watch: {
    input: {
      immediate: true,
      deep: true,
      handler (newValue: string): void {
        try {
          if (newValue === '') {
            this.output = ''
            return
          }
          const out = fengari.load(tl.replace('%input%', newValue))()
          this.loadError = null
          this.output = out.get(1) || this.output
          const syntaxErrors = out.get(2) || null
          const typeErrors = out.get(3) || null
          const decorations = []
          let d = 0

          if (!this.editorInput) {
            return
          }

          const model = this.editorInput.getModel()
          if (!model) {
            return
          }

          let i = 1
          while (syntaxErrors.has(i)) {
            const err = syntaxErrors.get(i)
            const y = err.get('y')
            const x = err.get('x')
            const msg = err.get('msg')
            console.log(msg)

            const word = model.getWordAtPosition(new Position(y, x))

            if (word) {
              decorations[d] = {
                range: new Range(y, word.startColumn, y, word.endColumn),
                options: { inlineClassName: 'syntax-error' }
              }
              d++
            }

            i++
          }

          i = 1
          while (typeErrors.has(i)) {
            const err = typeErrors.get(i)
            const y = err.get('y')
            const x = err.get('x')
            const msg = err.get('msg')
            console.log(msg)

            const word = model.getWordAtPosition(new Position(y, x))

            if (word) {
              decorations[d] = {
                range: new Range(y, word.startColumn, y, word.endColumn),
                options: { inlineClassName: 'type-error' }
              }
              d++
            }

            i++
          }

          if (this.editorInput) {
            if (decorations.length > 0) {
              console.log('DECORATIONS! ' + decorations[0])
              this.decorations = this.editorInput.deltaDecorations(this.decorations, decorations)
            } else {
              this.decorations = this.editorInput.deltaDecorations(this.decorations, [])
            }
          }
        } catch (err) {
          this.loadError = err
          console.log(err)
        }
      }
    }
  },

  methods: {
    editorDidMount (editor: editor.IStandaloneCodeEditor): void {
      const isInput = parseInt(editor.getId().split(':')[1]) % 2 === 1

      if (isInput) {
        this.editorInput = editor
      } else {
        this.editorOutput = editor
      }
    }
  },

  mounted (): void {
    window.onresize = () => {
      if (this.editorInput && this.editorOutput && window) {
        this.editorInput.layout({ width: window.innerWidth / 2, height: window.innerHeight })
        this.editorOutput.layout({ width: window.innerWidth / 2, height: window.innerHeight })
      }
    }
  }
})
</script>

<style>
#playground {
  display: flex;
  flex: 1;
  font-size: 20px;
}

.editors {
  margin-top: calc(40px + 1rem);
  display: flex;
  flex: 1;
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
  height: 50%;
  display: flex;
  align-items: center;
  padding: 1rem 2rem 1rem;
}

.syntax-error {
  color: orange !important;
  text-decoration: underline;
  font-weight: bold;
}

.type-error {
  color: red !important;
  text-decoration: underline;
  font-weight: bold;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
