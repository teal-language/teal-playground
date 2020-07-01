<template>
  <div id="playground">
    <Toolbar @snippetSelected="snippet => (input = snippet.code)" />
    <div class="editors">
      <MonacoEditor
        class="editor-left"
        v-model="input"
        theme="hc-black"
        :options="editorOptions"
        language="teal"
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
import { languages, editor, MarkerSeverity, Position } from 'monaco-editor'
import { tealMonacoLanguage, tealMonacoLanguageConfiguration } from '@/teal-monaco-language'
import * as fengari from 'fengari-web'
import basic from '@/snippets/basic'
import Toolbar from '@/components/Toolbar.vue'

// Register a new language
languages.register({ id: 'teal' })

// Register a tokens provider for the language
languages.setMonarchTokensProvider('teal', tealMonacoLanguage)
languages.setLanguageConfiguration('teal', tealMonacoLanguageConfiguration)

const tl = `
package.path = "https://raw.githubusercontent.com/teal-language/tl/master/?.lua"
os = { getenv = function (str) return '' end }
local tl = require('tl')

local env = tl.init_env(false, true)
local output, result = tl.gen([[%input%]], env)

return { output, result.syntax_errors, result.type_errors }
`

type LuaTableJs = {
  get: (index: number) => any; // eslint-disable-line @typescript-eslint/no-explicit-any
  has: (index: number) => boolean;
}

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
      markers: [] as editor.IMarkerData[],
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
          const out: LuaTableJs = fengari.load(tl.replace('%input%', newValue))()
          this.loadError = null
          this.output = out.get(1) || this.output
          const syntaxErrors = out.get(2) || null
          const typeErrors = out.get(3) || null

          if (!this.editorInput) {
            return
          }

          const model = this.editorInput.getModel()
          if (!model) {
            return
          }

          const markers = this.getMarkers(model, syntaxErrors, typeErrors)
          editor.setModelMarkers(model, 'owner', markers)
        } catch (err) {
          this.loadError = err
          console.error(err)
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
    },

    buildErrorMarkers (model: editor.ITextModel, errors: LuaTableJs) {
      const markers: editor.IMarkerData[] = []

      let i = 1
      while (errors.has(i)) {
        const err = errors.get(i)
        const y = err.get('y')
        const x = err.get('x')
        const message = err.get('msg')
        const word = model.getWordAtPosition(new Position(y, x))

        let startColumn = x
        let endColumn = x

        if (word) {
          startColumn = word.startColumn
          endColumn = word.endColumn
        }

        markers.push({
          message,
          startLineNumber: y,
          startColumn,
          endLineNumber: y,
          endColumn,
          severity: MarkerSeverity.Error
        })
        i++
      }

      return markers
    },

    getMarkers (model: editor.ITextModel, syntaxErrors: LuaTableJs, typeErrors: LuaTableJs) {
      const markers = [
        ...this.buildErrorMarkers(model, syntaxErrors),
        ...this.buildErrorMarkers(model, typeErrors)
      ]

      return markers
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
